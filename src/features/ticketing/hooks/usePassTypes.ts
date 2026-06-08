import { useState, useEffect } from 'react';
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
  sort_order: number;
  badge_color: string;
}

export function usePassTypes() {
  const [passes, setPasses] = useState<PassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/passes')
      .then((res) => {
        setPasses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load passes');
        setLoading(false);
      });
  }, []);

  const refetch = () => {
    setLoading(true);
    api.get('/api/passes')
      .then((res) => {
        setPasses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load passes');
        setLoading(false);
      });
  };

  return { passes, loading, error, refetch };
}
