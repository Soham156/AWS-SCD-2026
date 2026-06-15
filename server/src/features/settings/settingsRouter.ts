import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

// GET /api/settings — returns public application settings
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('registration_enabled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned

    // Default to true if not found, or false based on what's in DB
    const registrationEnabled = data ? data.registration_enabled : false;

    res.json({ registration_enabled: registrationEnabled });
  } catch (err) {
    next(err);
  }
});

export default router;
