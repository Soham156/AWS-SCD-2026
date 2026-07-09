import { useState, useCallback, useRef } from 'react';
import { api } from '../../../lib/api';
import { getCashfree } from '../../../lib/cashfree';
import type { PassType } from './usePassTypes';

export interface AttendeeData {
  id?: string;
  ticket_number?: string;
  qr_token?: string;
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
  referral_code?: string;
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
  referralCode: string | null;
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
    referralCode: null,
  });

  const referralCodeRef = useRef<string | null>(null);

  const selectPass = useCallback(async (pass: PassType, quantity: number = 1) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const body: any = { pass_type_id: pass.id, quantity };
      // Include referral code if one was set via URL
      if (referralCodeRef.current) body.referred_by = referralCodeRef.current;

      const res = await api.post('/api/orders/create', body);
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
      url.searchParams.delete('passId');
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url);

    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to create order.' }));
    }
  }, []);

  const restoreOrder = useCallback(async (orderId: string, shouldVerify = false, pollAttempts = 0) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      const data = res.data;
      referralCodeRef.current = data.referred_by_code || null;
      const fullStateUpdate = {
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
        primaryEmail: data.primary_email || '',
        attendees: data.attendees && data.attendees.length > 0 ? data.attendees : [],
        loading: false,
        referralCode: data.referred_by_code || null
      };

      if (data.payment_status === 'PAID') {
        setState((s) => ({ ...s, ...fullStateUpdate, step: 5, order: { ...fullStateUpdate.order!, referral_code: data.referral_code } }));
        return;
      }

      // Returning from Cashfree: actively confirm with the gateway instead of
      // just waiting for the webhook. verify-payment fulfills the order server-side
      // if Cashfree reports it paid, so this no longer depends on the webhook arriving.
      if (shouldVerify && (data.payment_status === 'PENDING' || data.payment_status === 'INITIATED') && pollAttempts < 15) {
        try {
          const v = await api.post(`/api/orders/${orderId}/verify-payment`);
          if (v.data?.payment_status === 'PAID') {
            return restoreOrder(orderId, false, 0); // reload full paid state → step 5
          }
        } catch { /* transient (e.g. gateway slow); fall through and retry */ }
        setTimeout(() => restoreOrder(orderId, true, pollAttempts + 1), 2000);
        return;
      }

      setState((s) => ({
        ...s,
        ...fullStateUpdate,
        step: data.primary_email ? 3 : 2
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

      if (res.data.free) {
        // Free ticket bypass: restore the order directly (which is now PAID) to show success step
        restoreOrder(res.data.order_id);
        return;
      }

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
  }, [state.order, state.selectedPass, restoreOrder]);

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
      referralCode: null,
    });
    // clear URL
    const url = new URL(window.location.href);
    url.searchParams.delete('orderId');
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url);
  }, []);

  const setReferralCode = useCallback((code: string) => {
    setState((s) => ({ ...s, referralCode: code }));
    referralCodeRef.current = code;
  }, []);

  const applyReferralCode = useCallback(async (code: string) => {
    if (!state.order) return false;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await api.post(`/api/orders/${state.order.order_id}/apply-referral`, { code });
      setState((s) => ({
        ...s,
        loading: false,
        referralCode: code.toUpperCase(),
      }));
      referralCodeRef.current = code.toUpperCase();
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Invalid referral code.' }));
      return false;
    }
  }, [state.order]);

  const applyCode = useCallback(async (code: string) => {
    if (!state.order) return false;
    setState((s) => ({ ...s, loading: true, error: null }));
    const cleanCode = code.toUpperCase().trim();
    
    // 1. Try checking as referral code first
    try {
      const refCheck = await api.get(`/api/orders/referral/${encodeURIComponent(cleanCode)}`);
      if (refCheck.data.valid) {
        if (state.referralCode) {
          setState((s) => ({ ...s, loading: false, error: 'A referral code is already applied.' }));
          return false;
        }
        await api.post(`/api/orders/${state.order.order_id}/apply-referral`, { code: cleanCode });
        setState((s) => ({
          ...s,
          loading: false,
          referralCode: cleanCode,
        }));
        referralCodeRef.current = cleanCode;
        return true;
      }
    } catch (err: any) {
      if (err.response?.data?.error === 'SELF_REFERRAL') {
        setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'You cannot refer yourself.' }));
        return false;
      }
      // Fail through to promo code check
    }

    // 2. Try applying as promo code
    try {
      const { data: orderData } = await api.get(`/api/orders/${state.order.order_id}`);
      if (orderData.promo_code_id) {
        setState((s) => ({ ...s, loading: false, error: 'A promo code is already applied.' }));
        return false;
      }
      const res = await api.post(`/api/orders/${state.order.order_id}/apply-promo`, { code: cleanCode });
      setState((s) => ({
        ...s,
        loading: false,
        order: { ...s.order!, total_amount: res.data.newTotal, discountAmount: res.data.discountAmount }
      }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Invalid promo or referral code.' }));
      return false;
    }
  }, [state.order, state.referralCode]);

  const removeReferralCode = useCallback(async () => {
    if (!state.order) return false;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      await api.delete(`/api/orders/${state.order.order_id}/referral`);
      setState((s) => ({
        ...s,
        loading: false,
        referralCode: null,
      }));
      referralCodeRef.current = null;
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.response?.data?.message || 'Failed to remove referral.' }));
      return false;
    }
  }, [state.order]);

  return { ...state, selectPass, restoreOrder, submitAttendees, applyPromo, removePromo, initiatePayment, proceedToPaymentStep, goBack, reset, setReferralCode, applyReferralCode, applyCode, removeReferralCode };
}
