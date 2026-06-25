import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';

export interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  min_quantity: number;
  max_uses: number;
  uses: number;
  is_active: boolean;
  created_at: string;
}

export interface PromoOrder {
  id: string;
  created_at: string;
  primary_email: string | null;
  total_amount: number;
  payment_status: string;
  quantity: number;
  discount: number;
}

export function usePromoCodes() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/promo-codes', {
        headers: { 'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '' }
      });
      setPromos(res.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const createPromo = async (data: Omit<PromoCode, 'id' | 'uses' | 'created_at'>) => {
    try {
      const res = await api.post('/api/admin/promo-codes', data, {
        headers: { 'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '' }
      });
      setPromos(prev => [res.data, ...prev]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to create promo code' };
    }
  };

  const updatePromo = async (id: string, data: Partial<PromoCode>) => {
    try {
      const res = await api.put(`/api/admin/promo-codes/${id}`, data, {
        headers: { 'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '' }
      });
      setPromos(prev => prev.map(p => p.id === id ? res.data : p));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to update promo code' };
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await api.delete(`/api/admin/promo-codes/${id}`, {
        headers: { 'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '' }
      });
      setPromos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to delete promo code' };
    }
  };

  const getPromoOrders = async (id: string) => {
    try {
      const res = await api.get(`/api/admin/promo-codes/${id}/orders`, {
        headers: { 'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '' }
      });
      return { success: true, data: res.data as PromoOrder[] };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to fetch promo orders' };
    }
  };

  return {
    promos,
    loading,
    error,
    refresh: fetchPromos,
    createPromo,
    updatePromo,
    deletePromo,
    getPromoOrders
  };
}
