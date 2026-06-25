-- Complete Supabase Schema Clone
-- Generated via Supabase MCP mapping to exact live database state

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Part 1: Core Tables

CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.pass_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric NOT NULL,
  capacity integer NOT NULL,
  sold integer DEFAULT 0,
  perks text[],
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  badge_color text DEFAULT '#6B7280'::text,
  created_at timestamptz DEFAULT now(),
  label character varying
);

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code character varying UNIQUE NOT NULL,
  discount_percentage numeric NOT NULL,
  min_quantity integer DEFAULT 1,
  max_uses integer DEFAULT 0,
  uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  primary_email character varying,
  pass_type_id uuid REFERENCES public.pass_types(id),
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  promo_code_id uuid REFERENCES public.promo_codes(id),
  payment_status character varying DEFAULT 'PENDING'::character varying,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE,
  pass_type_id uuid NOT NULL REFERENCES public.pass_types(id),
  pass_slug text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'professional'::text])),
  organization text NOT NULL,
  payment_status text NOT NULL DEFAULT 'PENDING'::text CHECK (payment_status = ANY (ARRAY['PENDING'::text, 'PAID'::text, 'REFUNDED'::text, 'FAILED'::text, 'EXPIRED'::text])),
  qr_token text UNIQUE,
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  phone text,
  email_sent boolean DEFAULT false,
  email_status text DEFAULT 'pending'::text,
  order_id uuid REFERENCES public.orders(id)
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.registrations(id),
  cashfree_order_id text UNIQUE NOT NULL,
  cashfree_payment_id text,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR'::text,
  status text NOT NULL DEFAULT 'initiated'::text,
  gateway_response jsonb,
  created_at timestamptz DEFAULT now(),
  order_id uuid REFERENCES public.orders(id)
);

CREATE TABLE public.archived_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text,
  pass_type_id uuid REFERENCES public.pass_types(id),
  pass_slug text,
  full_name text,
  email text,
  role text,
  organization text,
  payment_status text,
  qr_token text,
  checked_in boolean DEFAULT false,
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  archived_at timestamptz DEFAULT now(),
  phone text
);

CREATE TABLE public.speaker_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  organization text NOT NULL,
  designation text NOT NULL,
  linkedin_url text NOT NULL,
  portfolio_url text,
  session_title text NOT NULL,
  session_abstract text NOT NULL,
  category text NOT NULL,
  session_level text NOT NULL,
  duration text NOT NULL,
  bio text NOT NULL,
  previous_experience text,
  notes text,
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.community_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_name text NOT NULL,
  community_type text NOT NULL,
  website_url text NOT NULL,
  member_size text NOT NULL,
  organizer_name text NOT NULL,
  organizer_email text NOT NULL,
  organizer_phone text NOT NULL,
  linkedin_url text NOT NULL,
  city text NOT NULL,
  expectations text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.sponsor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  tier text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.otp_verifications (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  email character varying NOT NULL,
  otp character varying NOT NULL,
  attempts integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Part 2: Email Tables

CREATE TABLE public.email_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  email_type text NOT NULL,
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text, 'cancelled'::text])),
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  provider_message_id text,
  last_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_job_id uuid NOT NULL REFERENCES public.email_jobs(id),
  provider text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['success'::text, 'failure'::text])),
  provider_message_id text,
  error_message text,
  response_data jsonb,
  attempted_at timestamptz DEFAULT now()
);

-- Part 3: Database Functions

CREATE OR REPLACE FUNCTION public.increment_sold(pass_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE pass_types SET sold = sold + 1 WHERE id = pass_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reserve_ticket(pass_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  updated_id uuid;
BEGIN
  UPDATE pass_types 
  SET sold = sold + 1 
  WHERE id = pass_id AND sold < capacity 
  RETURNING id INTO updated_id;
  
  RETURN updated_id IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_sold(pass_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE pass_types SET sold = GREATEST(sold - 1, 0) WHERE id = pass_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.initiate_checkout(p_reg_id uuid, p_pass_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_pass RECORD;
  v_recent_payments INT;
BEGIN
  -- Check if this registration already has an active initiated payment
  SELECT count(*) INTO v_recent_payments 
  FROM payments 
  WHERE registration_id = p_reg_id AND status = 'initiated';

  IF v_recent_payments > 0 THEN
    RETURN true;
  END IF;

  -- Try to reserve a new ticket
  UPDATE pass_types 
  SET sold = sold + 1 
  WHERE id = p_pass_id AND sold < capacity 
  RETURNING id INTO v_pass;

  IF v_pass IS NOT NULL THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reserve_tickets(p_pass_id uuid, p_amount integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_capacity INT;
  v_sold INT;
BEGIN
  -- Lock the row to prevent concurrent modifications
  SELECT capacity, sold INTO v_capacity, v_sold
  FROM pass_types
  WHERE id = p_pass_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_sold + p_amount <= v_capacity THEN
    UPDATE pass_types
    SET sold = sold + p_amount
    WHERE id = p_pass_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.release_tickets(p_pass_id uuid, p_amount integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE pass_types
  SET sold = GREATEST(sold - p_amount, 0)
  WHERE id = p_pass_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_promo_uses(p_promo_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_uses INT;
  v_max_uses INT;
BEGIN
  SELECT uses, max_uses INTO v_uses, v_max_uses
  FROM promo_codes
  WHERE id = p_promo_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- If max_uses > 0, enforce limit
  IF v_max_uses > 0 AND v_uses >= v_max_uses THEN
    RETURN FALSE;
  END IF;

  UPDATE promo_codes
  SET uses = uses + 1
  WHERE id = p_promo_id;
  
  RETURN TRUE;
END;
$function$;

-- Part 4: Row Level Security (RLS)

ALTER TABLE public.pass_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pass_types" ON public.pass_types FOR SELECT USING (true);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.otp_verifications FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on email_jobs" ON public.email_jobs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on email_logs" ON public.email_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
