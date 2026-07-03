import { Router } from 'express';
import { supabase } from '../../shared/lib/supabase.js';
import { runCleanups } from '../../shared/lib/cleanup.js';

const router = Router();

// GET /api/passes — returns active pass types
router.get('/', async (_req, res, next) => {
  try {
    runCleanups(); // fire-and-forget, self-throttled
    const { data, error } = await supabase
      .from('pass_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const passes = (data || []).map((p) => {
      const sold = p.sold || 0;
      return {
        ...p,
        sold,
        available: p.capacity - sold,
      };
    });

    res.json(passes);
  } catch (err) {
    next(err);
  }
});

export default router;
