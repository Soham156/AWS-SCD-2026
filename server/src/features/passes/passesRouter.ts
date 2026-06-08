import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';

const router = Router();

// GET /api/passes — returns active pass types
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('pass_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const passes = (data || []).map((p) => ({
      ...p,
      available: p.capacity - p.sold,
    }));

    res.json(passes);
  } catch (err) {
    next(err);
  }
});

export default router;
