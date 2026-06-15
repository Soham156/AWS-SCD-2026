import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../shared/lib/supabase.js';
import { applicationLimiter } from '../../shared/middleware/rateLimiter.js';

const router = Router();

const speakerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(2, "City is required"),
  organization: z.string().min(2, "Organization is required"),
  designation: z.string().min(2, "Designation is required"),
  linkedin_url: z.string().url("Must be a valid URL"),
  portfolio_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  session_title: z.string().min(5, "Session title is required"),
  session_abstract: z.string().min(20, "Session abstract must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  session_level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
  bio: z.string().min(20, "Biography must be at least 20 characters"),
  previous_experience: z.string().optional(),
  notes: z.string().optional()
});

const partnerSchema = z.object({
  community_name: z.string().min(2, "Community name is required"),
  community_type: z.string().min(1, "Community type is required"),
  website_url: z.string().url("Must be a valid URL"),
  member_size: z.string().min(1, "Member size is required"),
  organizer_name: z.string().min(2, "Organizer name is required"),
  organizer_email: z.string().email("Invalid email address"),
  organizer_phone: z.string().min(10, "Phone number is required"),
  linkedin_url: z.string().url("Must be a valid URL"),
  city: z.string().min(2, "City is required"),
  expectations: z.string().min(20, "Expectations must be at least 20 characters")
});

const sponsorSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  contact: z.string().min(2, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  tier: z.string().min(1, "Sponsorship tier is required"),
  details: z.string().min(10, "Please provide more details")
});

router.post('/speaker', applicationLimiter, async (req, res, next) => {
  try {
    const data = speakerSchema.parse(req.body);
    
    // Insert into Supabase
    const { data: inserted, error } = await supabase
      .from('speaker_applications')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('[Speaker Application Error]', error);
      return res.status(500).json({ success: false, message: 'Failed to submit application. Please try again later.' });
    }

    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

router.post('/partner', applicationLimiter, async (req, res, next) => {
  try {
    const data = partnerSchema.parse(req.body);
    
    // Insert into Supabase
    const { data: inserted, error } = await supabase
      .from('community_partners')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('[Partner Application Error]', error);
      return res.status(500).json({ success: false, message: 'Failed to submit application. Please try again later.' });
    }

    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

router.post('/sponsor', applicationLimiter, async (req, res, next) => {
  try {
    const data = sponsorSchema.parse(req.body);
    
    const { data: inserted, error } = await supabase
      .from('sponsor_applications')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('[Sponsor Application Error]', error);
      return res.status(500).json({ success: false, message: 'Failed to submit application. Please try again later.' });
    }

    res.status(201).json({ success: true, data: inserted });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
    }
    next(error);
  }
});

export default router;
