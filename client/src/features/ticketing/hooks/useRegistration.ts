import { useState, useCallback } from 'react';
import { api } from '../../../lib/api';
import { getCashfree } from '../../../lib/cashfree';
import type { PassType } from './usePassTypes';

export interface AttendeeData {
  full_name: string;
  email: string;
  phone: string;
  role: 'student' | 'professional';
  organization: string;
}

interface OrderData {
  order_id: string;
  total_amount: number;
  discountAmount?: number;
  quantity: number;
}

interface RegistrationState {
  step: 1 | 2 | 3 | 4 | 5;
  selectedPass: PassType | null;
  quantity: number;
  order: OrderData | null;
  attendees: AttendeeData[];
  primaryEmail: string;
  loading: boolean;
  error: string | null;
}

export function useRegistration() {
  const [state, setState] = useState<RegistrationState>({
    step: 1,
    selectedPass: null,
    quantity: 1,
    order: null,
    attendees: [],
    primaryEmail: '',
    loading: false,
    error: null,
  });

  const selectPass = useCallback(async (pass: PassType, quantity: number = 1) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.post('/api/orders/create', {
        pass_type_id: pass.id,
        quantity,
      });
      const order_id = res.data.order_id;
      
      setState((s) => ({ 
        ...s, 
        selectedPass: pass, 
        quantity, 
        order: { order_id, total_amount: pass.price * quantity, quantity },
        step: 2, 
        loading: false,
        error: null 
      }));

      // Update URL silently
      const url = new URL(window.location.href);
      url.searchParams.set('orderId', order_id);
      url.searchParams.delete('passId'); // Ensure it's removed
      window.history.replaceState({}, '', url);

    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to create order.' }));
    }
  }, []);

  const restoreOrder = useCallback(async (orderId: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      const data = res.data;
      
      if (data.payment_status === 'PAID') {
        setState((s) => ({ ...s, step: 5, loading: false, order: { order_id: data.id, total_amount: data.total_amount, quantity: data.quantity } }));
        return;
      }

      setState((s) => ({
        ...s,
        selectedPass: {
          id: data.pass_types.id,
          name: data.pass_types.name,
          price: data.pass_types.price,
          badge_color: data.pass_types.badge_color,
          slug: data.pass_types.slug,
          is_active: true, capacity: 1000, sold: 0, perks: [] // Mock rest
        } as PassType,
        quantity: data.quantity,
        order: { order_id: data.id, total_amount: data.total_amount, quantity: data.quantity, discountAmount: data.discount },
        step: data.primary_email ? 3 : 2, // If it has email, they already submitted attendees
        primaryEmail: data.primary_email || '',
        attendees: data.attendees && data.attendees.length > 0 ? data.attendees : [],
        loading: false
      }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: 'Failed to restore session.' }));
    }
  }, []);

  const submitAttendees = useCallback(async (primaryEmail: string, attendees: AttendeeData[]) => {
    if (!state.order) return;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await api.post(`/api/orders/${state.order.order_id}/attendees`, {
        primary_email: primaryEmail,
        attendees,
      });

      setState((s) => ({
        ...s,
        loading: false,
        primaryEmail,
        attendees,
        order: s.order ? {
          ...s.order,
          quantity: res.data.order.quantity,
          total_amount: res.data.order.total_amount,
          discountAmount: 0 // resetting discount since it was cleared backend
        } : null,
        step: 3,
      }));
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to save attendees.' }));
    }
  }, [state.order]);

  const applyPromo = useCallback(async (code: string) => {
    if (!state.order) return false;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.post(`/api/orders/${state.order.order_id}/apply-promo`, { code });
      setState((s) => ({
        ...s,
        loading: false,
        order: { ...s.order!, total_amount: res.data.newTotal, discountAmount: res.data.discountAmount }
      }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Invalid promo code.' }));
      return false;
    }
  }, [state.order]);

  const removePromo = useCallback(async () => {
    if (!state.order) return false;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.delete(`/api/orders/${state.order.order_id}/promo`);
      setState(s => ({
        ...s,
        loading: false,
        order: { ...s.order!, total_amount: res.data.total_amount, discountAmount: 0 }
      }));
      return true;
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to remove promo' }));
      return false;
    }
  }, [state.order]);

  const initiatePayment = useCallback(async () => {
    if (!state.order || !state.selectedPass) return;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await api.post('/api/checkout/initiate', {
        order_id: state.order.order_id,
      });

      const { payment_session_id } = res.data;

      const cashfree = await getCashfree();
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: '_self' as const,
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          setState((s) => ({ ...s, loading: false, error: result.error.message || 'Payment failed' }));
        }
      });
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Payment initiation failed' }));
    }
  }, [state.order, state.selectedPass]);

  const goBack = useCallback(() => {
    setState((s) => {
      if (s.step === 1) return s;
      return { ...s, step: (s.step - 1) as 1 | 2 | 3 | 4, error: null };
    });
  }, []);

  const proceedToPaymentStep = useCallback(() => {
    setState((s) => ({ ...s, step: 4, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 1,
      selectedPass: null,
      quantity: 1,
      order: null,
      attendees: [],
      primaryEmail: '',
      loading: false,
      error: null,
    });
    // clear URL
    const url = new URL(window.location.href);
    url.searchParams.delete('orderId');
    window.history.replaceState({}, '', url);
  }, []);

  return { ...state, selectPass, restoreOrder, submitAttendees, applyPromo, removePromo, initiatePayment, proceedToPaymentStep, goBack, reset };
}
