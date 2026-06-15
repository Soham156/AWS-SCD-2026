# PROMPT: Implement Ticketing System — AWS Student Community Day Dhule 2026

You are implementing a complete ticketing system into an **existing F1-themed React Vite event website**. This is a single-event ticketing system with paid passes, an admin dashboard, and a volunteer QR gate scanner.

Read this entire prompt before writing any code.

---

## The Project in One Sentence

Attendees visit the site → pick a pass type → pay via Cashfree → receive a QR-coded ticket by email → show QR at the gate → volunteer scans it → organizer watches live stats on the admin dashboard.

---

## Tech Stack (Already Decided — Do Not Change)

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion (already set up) |
| Backend | Express.js (runs alongside Vite in dev via proxy) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Payments | Cashfree (JS SDK on frontend, Node.js SDK on backend) |
| Email | AWS SES |
| Prod Deploy | Frontend → S3 + CloudFront · Backend → AWS Lambda + API Gateway |

---

## Project Structure

Use **feature-based structure**. Do NOT put everything in a flat `components/` folder.

```
src/
├── features/
│   ├── ticketing/        ← purchase flow (modal + form + payment + pass)
│   ├── scanner/          ← volunteer gate QR scanner
│   └── admin/            ← organizer dashboard
├── shared/               ← reusable UI components and utils
├── lib/                  ← third-party client configs
└── router/               ← all routes
```

Each feature folder contains: `components/` · `hooks/` · `services/` · `pages/`

---

## Part 1 — Database (Supabase)

Create two tables. Run these SQL migrations in Supabase SQL editor.

### Table 1: `pass_types`

```sql
CREATE TABLE pass_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  capacity    INTEGER NOT NULL,
  sold        INTEGER DEFAULT 0,
  perks       TEXT[],
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  badge_color TEXT DEFAULT '#6B7280',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

Seed with exactly these 3 rows:

```sql
INSERT INTO pass_types (name, slug, description, price, capacity, perks, sort_order, badge_color)
VALUES
  ('General Pass',  'general',
   'Event entry + all keynote sessions', 99, 300,
   ARRAY['Event Entry', 'All Keynotes', 'Networking', 'Swag Bag'], 1, '#6B7280'),
  ('Workshop Pass', 'workshop',
   'General + hands-on AWS workshop', 249, 80,
   ARRAY['Everything in General', 'AWS Hands-On Lab', 'Lab Credits', 'Certificate'], 2, '#E8202A'),
  ('VIP Pit Pass',  'vip',
   'Full access + exclusive VIP experience', 499, 20,
   ARRAY['Everything in Workshop', 'Front-Row Seating', 'Meet the Team', 'Pit Lane Experience'], 3, '#FFD700');
```

### Table 2: `registrations`

```sql
CREATE TABLE registrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number  TEXT UNIQUE NOT NULL,
  pass_type_id   UUID NOT NULL REFERENCES pass_types(id),
  pass_slug      TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('student', 'professional')),
  organization   TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING'
                 CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'FAILED')),
  qr_token       TEXT UNIQUE NOT NULL,
  checked_in     BOOLEAN DEFAULT FALSE,
  checked_in_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### Table 3: `payments`

```sql
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id     UUID NOT NULL REFERENCES registrations(id),
  cashfree_order_id   TEXT UNIQUE NOT NULL,
  cashfree_payment_id TEXT,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'initiated',
  gateway_response    JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- pass_types: anyone can read, only service role can write
ALTER TABLE pass_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pass_types" ON pass_types FOR SELECT USING (true);

-- registrations: anyone can insert, service role reads all
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert registrations" ON registrations FOR INSERT WITH CHECK (true);

-- payments: service role only (no public access)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

---

## Part 2 — Backend (Express)

### File: `server/src/app.ts`

Express app that mounts all feature routers. In development, Vite proxies `/api/*` to this server on port 3001.

```ts
// vite.config.ts — add this proxy
server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}
```

### Middleware to implement

**`adminKeyGuard.ts`**
```ts
// Checks req.headers['x-admin-key'] === process.env.ADMIN_SECRET
// Returns 401 if missing or wrong
// Applied to all /api/admin/* routes
```

**`rateLimiter.ts`**
```ts
// Use express-rate-limit
// Limit: 10 requests per minute per IP
// Apply only to POST /api/checkout/initiate
```

### Feature: `passes`

`GET /api/passes`
- No auth required
- Returns all rows from `pass_types` where `is_active = true`
- Ordered by `sort_order ASC`
- Also returns `available` = `capacity - sold` per row

### Feature: `tickets`

`POST /api/tickets/register`
- No auth required
- Body: `{ full_name, email, role, organization, pass_type_id }`
- Validate with Zod (all fields required, valid email, role must be student or professional)
- If email already exists in `registrations`: return `409` with `{ error: 'ALREADY_REGISTERED', ticket_number: existing_ticket_number }`
- Generate `ticket_number`: format `AWS-{4-digit-random}-26`, retry up to 5× on unique conflict
- Generate `qr_token` using HMAC (see QR section below)
- Insert row with `payment_status: 'PENDING'`
- Return: `{ ticket_number, ticket_id }`

`GET /api/tickets/:id`
- No auth required
- Returns full ticket row joined with pass_type name, price, badge_color
- Used by the public `/ticket/:id` paddock pass page

### Feature: `checkout`

`POST /api/checkout/initiate`
- No auth required
- Body: `{ ticket_id, pass_type_id }`
- Look up registration + pass_type from Supabase
- Create Cashfree order using `CASHFREE_SECRET_KEY` (server only, never frontend)
- Insert row into `payments` with status `initiated`
- Return: `{ payment_session_id, cashfree_order_id }`

### Feature: `webhook`

`POST /api/webhooks/cashfree`
- No JWT auth — Cashfree calls this directly
- Verify `x-webhook-signature` HMAC header using `CASHFREE_WEBHOOK_SECRET`
- If valid and `event = PAYMENT_SUCCESS`:
  - Update `registrations.payment_status` = `'PAID'`
  - Update `payments.status` = `'paid'`
  - Increment `pass_types.sold` by 1
  - Trigger AWS SES email with QR code (see Email section)
- Idempotent: if `cashfree_order_id` already PAID, return 200 silently

### Feature: `scanner`

`POST /api/scan/verify`
- No auth required
- Body: `{ qr_token }`
- Verify HMAC signature of token
- If invalid: return `{ status: 'INVALID' }`
- If valid but `payment_status !== 'PAID'`: return `{ status: 'NOT_PAID' }`
- If valid but `checked_in = true`: return `{ status: 'ALREADY_CHECKED_IN', checked_in_at }`
- If valid and not checked in: set `checked_in = true`, `checked_in_at = NOW()`, return:
  ```json
  {
    "status": "VALID",
    "attendee_name": "string",
    "ticket_number": "string",
    "pass_slug": "string",
    "organization": "string"
  }
  ```

### Feature: `admin`

All routes require `X-Admin-Key` header.

`GET /api/admin/stats`
- Returns:
  ```json
  {
    "total_sold": 0,
    "total_revenue": 0,
    "total_checked_in": 0,
    "by_pass_type": [
      { "slug": "general", "name": "General Pass", "sold": 0, "capacity": 300, "revenue": 0, "checked_in": 0 }
    ]
  }
  ```

`GET /api/admin/registrations`
- Query params: `?pass_slug=&payment_status=&checked_in=&search=&page=1&limit=50`
- Returns paginated registrations joined with pass_type name

`GET /api/admin/export-csv`
- Returns CSV file with headers:
  `ticket_number, pass_type, full_name, email, role, organization, payment_status, checked_in, checked_in_at, created_at`

`PUT /api/admin/passes/:id`
- Body: any subset of `{ name, description, price, capacity, perks, is_active, badge_color }`
- Validates: price >= 1, capacity >= current sold count
- Updates row in `pass_types`
- Returns updated row

`POST /api/admin/refund`
- Body: `{ registration_id }`
- Looks up `payments` row for that registration
- Calls Cashfree refund API with `cashfree_payment_id`
- Updates `registrations.payment_status = 'REFUNDED'`
- Updates `payments.status = 'refunded'`

### QR Token (implement in `server/src/shared/lib/qrToken.ts`)

```ts
import { createHmac, timingSafeEqual } from 'crypto';

export function generateQRToken(ticket_number: string): string {
  const sig = createHmac('sha256', process.env.QR_HMAC_SECRET!)
    .update(ticket_number)
    .digest('hex')
    .slice(0, 24);
  return Buffer.from(ticket_number + ':' + sig).toString('base64url');
}

export function verifyQRToken(token: string): { valid: boolean; ticket_number?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [ticket_number, sig] = decoded.split(':');
    const expected = createHmac('sha256', process.env.QR_HMAC_SECRET!)
      .update(ticket_number).digest('hex').slice(0, 24);
    const valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    return { valid, ticket_number: valid ? ticket_number : undefined };
  } catch {
    return { valid: false };
  }
}
```

---

## Part 3 — Frontend (React Vite)

### 3.1 Lib Setup

**`src/lib/supabase.ts`**
```ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

**`src/lib/api.ts`**
```ts
import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
```

**`src/lib/cashfree.ts`**
```ts
// Load Cashfree JS SDK
// https://www.cashfree.com/devstudio/preview/pg/web/popupCheckout
import { load } from '@cashfreepayments/cashfree-js';
export const getCashfree = () => load({ mode: import.meta.env.VITE_CASHFREE_ENV });
```

### 3.2 Feature: `ticketing`

#### `usePassTypes.ts`
- Calls `GET /api/passes` on mount
- Returns `{ passes, loading, error }`
- Each pass also has `available = capacity - sold`

#### `useRegistration.ts`
State machine with steps: `1 (select pass) → 2 (fill form) → 3 (payment) → 4 (success)`

```ts
interface State {
  step: 1 | 2 | 3 | 4;
  selectedPass: PassType | null;
  formData: { full_name: string; email: string; role: string; organization: string };
  loading: boolean;
  error: string | null;
  ticketResult: { ticket_number: string; ticket_id: string } | null;
}
```

Actions:
- `selectPass(pass)` → advances to step 2
- `submitForm(formData)` → calls POST /api/tickets/register → on success advances to step 3
- `initiatePayment()` → calls POST /api/checkout/initiate → launches Cashfree SDK → on success advances to step 4
- `goBack()` → goes back one step

#### `TicketModal.tsx` (REFACTOR — do NOT replace the outer shell)
- Keep all existing F1 UI styling
- Replace the inner content with the 4-step flow
- Step 1: renders `<PassTypeSelector />`
- Step 2: renders `<RegistrationForm />`
- Step 3: renders `<PaymentEmbed />`
- Step 4: renders `<SuccessScreen />` which includes `<TicketPass />`

#### `PassTypeSelector.tsx`
- Shows 3 pass cards in a grid
- Each card shows: name, price (₹), description, perks list, badge_color
- Disabled + "Sold Out" state when `available === 0`
- Skeleton loader while `usePassTypes` is loading

#### `RegistrationForm.tsx`
- Fields: Full Name, Email, Role (select: Student / Professional), College or Organization
- Client-side Zod validation
- Inline field-level error messages
- Submit button calls `useRegistration.submitForm()`

#### `PaymentEmbed.tsx`
- On mount: calls `useRegistration.initiatePayment()`
- Shows selected pass name + price while loading
- When `payment_session_id` is ready: calls Cashfree SDK
- On Cashfree success callback: calls `useRegistration` to advance to step 4

#### `SuccessScreen.tsx`
- Shows ticket number in large monospace font
- Shows pass type badge with badge_color
- Message: "Your Paddock Pass is on its way to [email]"
- Link to `/ticket/[ticket_id]`
- Renders `<TicketPass />` below

#### `TicketPass.tsx`
- Props: `{ ticket_number, full_name, pass_name, role, organization, qr_token }`
- F1-themed virtual pass design matching the website aesthetic
- QR code rendered using `qrcode.react` (value = qr_token, size 240)
- Download button using `html2canvas` — saves as PNG named `[ticket_number].png`

#### `TicketPage.tsx` — route `/ticket/:id`
- Fetches `GET /api/tickets/:id`
- Renders `<TicketPass />` with the fetched data
- Shows 404 state if ticket not found
- Public route — no login required

### 3.3 Feature: `scanner`

#### `ScannerPage.tsx` — route `/scanner`
- No auth required — plain URL shared with gate volunteers
- Camera opens immediately on page load
- Shows live counter: "Checked In: X / Total Registrations: Y"

#### `QRScanner.tsx`
- Uses `html5-qrcode` library
- Continuous scan loop (10fps)
- On decode: calls `scanApi.verify(token)` with 1500ms debounce to prevent double-scan

#### `ScanFeedback.tsx`
- Props: `{ status: 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'NOT_PAID' | null }`
- VALID: full-screen green overlay, attendee name + pass type shown, success chime sound (Web Audio API)
- ALREADY_CHECKED_IN: full-screen red overlay, "Already Checked In" message, error buzz
- INVALID / NOT_PAID: full-screen red overlay, appropriate message, error buzz
- Overlay auto-dismisses after 2000ms

### 3.4 Feature: `admin`

#### `/admin` — Password Gate

Route shows `<AdminLogin />` if not authenticated, otherwise shows `<AdminPage />`.

#### `useAdminAuth.ts`

```ts
const ADMIN_PASSWORD = 'idkbutily'; // hardcoded for demo

export function useAdminAuth() {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem('scd_admin') === 'true'
  );
  const login = (pw: string) => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('scd_admin', 'true');
      setAuthed(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    sessionStorage.removeItem('scd_admin');
    setAuthed(false);
  };
  return { authed, login, logout };
}
```

#### `adminApi.ts`
- All calls include header: `'X-Admin-Key': 'idkbutily'`
- Methods: `getStats()`, `getRegistrations(filters)`, `exportCSV()`, `updatePassType(id, data)`, `refund(registration_id)`

#### `AdminLogin.tsx`
- F1-themed password prompt
- Input `type="password"` with submit button labelled "Enter Pit Lane"
- Wrong password: shake animation + "Access Denied" message
- Correct: transition to dashboard

#### `AdminPage.tsx`
- Layout: sidebar nav + main content area
- Nav links: Overview · Pass Types · Registrations · Export
- Logout button in header

#### `TelemetryCards.tsx`
- 4 stat cards: Total Sold · Total Revenue · Checked In · Remaining Capacity
- Below: 3 mini-cards, one per pass type, showing sold/capacity/revenue
- Auto-refresh every 30 seconds

#### `PassTypesManager.tsx`
- Table with one row per pass type
- Inline edit mode per row (click Edit button to activate)
- Editable fields: name, price, capacity, description, perks, badge_color, is_active toggle
- Save calls `PUT /api/admin/passes/:id`
- Warning shown if new capacity < current sold count
- Cannot edit `slug` field

#### `RegistrationsTable.tsx`
- Columns: Ticket No · Pass Type · Name · Email · Role · Org · Payment · Checked In · Registered At
- Search bar filters by name or email
- Dropdown filters: Pass Type · Payment Status · Check-In Status
- Pagination: 50 rows per page
- Refund button per row (only shown when payment_status = PAID)

#### `ExportCSVButton.tsx`
- Calls `GET /api/admin/export-csv`
- Downloads file as `scd-registrations-[date].csv`

---

## Part 4 — Email (AWS SES)

On successful payment webhook, send one email:

**From:** `tickets@scd.awsbuildergroup.in`
**Subject:** `Your AWS SCD Pass is Confirmed! 🏁 [ticket_number]`

**Email must include:**
- Attendee first name in greeting
- Pass type name (bold)
- Ticket number in large monospace
- Event details: AWS Student Community Day | 14 August 2026 | SVKM's IoT, Dhule
- QR code as inline base64 PNG (generate server-side with `qrcode` npm package)
- Button link: "View Full Paddock Pass"  → `[FRONTEND_URL]/ticket/[ticket_id]`
- "Show this QR at the gate for entry" instruction

Use HTML email template. Keep it F1-styled (dark background, red accents).

---

## Part 5 — Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Existing landing page | None |
| `/ticket/:id` | `TicketPage.tsx` | None |
| `/scanner` | `ScannerPage.tsx` | None |
| `/admin` | `AdminPage.tsx` (password gated) | Hardcoded pw |

---

## Part 6 — Environment Variables

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3001
VITE_CASHFREE_ENV=SANDBOX
```

### Backend (`server/.env`)
```
SUPABASE_SERVICE_ROLE_KEY=
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_WEBHOOK_SECRET=
QR_HMAC_SECRET=
ADMIN_SECRET=idkbutily
AWS_SES_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
EMAIL_FROM=tickets@scd.awsbuildergroup.in
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## Part 7 — Implementation Order

Implement in this exact order. Do not skip ahead.

1. Run SQL migrations in Supabase (pass_types + seed, registrations, payments, RLS)
2. Set up Express app with middleware (adminKeyGuard, rateLimiter, errorHandler)
3. Implement `qrToken.ts` utility
4. Implement `GET /api/passes` → test it returns 3 pass types
5. Implement `POST /api/tickets/register` → test with curl
6. Implement `POST /api/checkout/initiate` → test with Cashfree sandbox
7. Implement `POST /api/webhooks/cashfree` → test with Cashfree webhook simulator
8. Implement `POST /api/scan/verify`
9. Implement all `/api/admin/*` endpoints
10. Set up `src/lib/` (supabase.ts, api.ts, cashfree.ts)
11. Build `usePassTypes.ts` → test it fetches pass types
12. Build `useRegistration.ts` state machine
13. Refactor `TicketModal.tsx` with 4-step flow
14. Build `TicketPage.tsx` (/ticket/:id)
15. Build `ScannerPage.tsx` + QRScanner + ScanFeedback
16. Build `AdminPage.tsx` + all admin components
17. Wire AWS SES email template
18. Test full flow end-to-end

---

## Part 8 — Key Rules

1. **Never put secrets in the frontend.** `CASHFREE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `QR_HMAC_SECRET`, `ADMIN_SECRET` → backend only.
2. **Never trust frontend input on the backend.** Always validate with Zod before any DB operation.
3. **Ticket number is server-generated.** Never generate it on the frontend.
4. **QR token is HMAC-signed.** Never put a raw UUID in the QR code.
5. **Duplicate emails are blocked.** Email must be UNIQUE in `registrations`. Return 409, not 500.
6. **Webhook is idempotent.** If Cashfree sends the same webhook twice, handle it silently.
7. **Do not replace the existing F1 UI.** Refactor `TicketModal.tsx` from the inside. Preserve outer styling.
8. **Admin password is hardcoded as `idkbutily`.** This is intentional for demo/testing. Do not add complexity.

---

*AWS Student Community Day Dhule 2026 — SVKM's IoT Dhule — AWS Builder Group*
