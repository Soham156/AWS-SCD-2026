import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';

export interface PassType {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  available: number;
  perks: string[];
  is_active: boolean;
  is_locked: boolean;
  sort_order: number;
  badge_color: string;
  label: string | null;
}

export function usePassTypes() {
  const [passes, setPasses] = useState<PassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/passes');
      if (Array.isArray(res.data)) {
        setPasses(res.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load passes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  return { passes, loading, error, refetch: fetchPasses };
}
