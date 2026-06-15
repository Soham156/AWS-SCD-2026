import { useState, useCallback } from 'react';
import { api } from '../../../lib/api';
import { getCashfree } from '../../../lib/cashfree';
import type { PassType } from './usePassTypes';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  role: 'student' | 'professional';
  organization: string;
}

interface TicketResult {
  ticket_number?: string;
  ticket_id: string;
  qr_token?: string;
}

interface RegistrationState {
  step: 1 | 2 | 3 | 4 | 5;
  selectedPass: PassType | null;
  formData: FormData;
  loading: boolean;
  error: string | null;
  ticketResult: TicketResult | null;
}

const initialFormData: FormData = {
  full_name: '',
  email: '',
  phone: '',
  role: 'student',
  organization: '',
};

export function useRegistration() {
  const [state, setState] = useState<RegistrationState>({
    step: 1,
    selectedPass: null,
    formData: initialFormData,
    loading: false,
    error: null,
    ticketResult: null,
  });

  const selectPass = useCallback((pass: PassType) => {
    setState((s) => ({ ...s, selectedPass: pass, step: 2, error: null }));
  }, []);

  const submitForm = useCallback(async (formData: FormData) => {
    if (!state.selectedPass) return;
    setState((s) => ({ ...s, loading: true, error: null, formData }));

    try {
      const res = await api.post('/api/tickets/register', {
        ...formData,
        pass_type_id: state.selectedPass.id,
      });

      setState((s) => ({
        ...s,
        loading: false,
        ticketResult: res.data,
        step: 3,
      }));
    } catch (err: any) {
      const errData = err.response?.data;
      let message = 'Registration failed. Please try again.';
      if (errData?.error === 'ALREADY_REGISTERED') {
        message = errData.message || 'This email is already registered.';
      } else if (errData?.error === 'SOLD_OUT') {
        message = 'Sorry, this pass type is sold out!';
      } else if (errData?.details) {
        const firstField = Object.keys(errData.details)[0];
        message = errData.details[firstField]?.[0] || message;
      }
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, [state.selectedPass]);

  const initiatePayment = useCallback(async () => {
    if (!state.ticketResult || !state.selectedPass) return;
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await api.post('/api/checkout/initiate', {
        ticket_id: state.ticketResult.ticket_id,
        pass_type_id: state.selectedPass.id,
      });

      const { payment_session_id } = res.data;

      // Launch Cashfree Redirect Checkout
      const cashfree = await getCashfree();
      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: '_self' as const,
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          console.error('[Cashfree]', result.error);
          setState((s) => ({
            ...s,
            loading: false,
            error: result.error.message || 'Payment failed',
          }));
        }
      });

      // Do not unset loading here as browser will redirect to Cashfree
    } catch (err: any) {
      const errData = err.response?.data;
      console.error('[Checkout Error Details]:', errData);
      
      let errorMsg = errData?.error || 'Payment initiation failed';
      if (errData?.message) {
        errorMsg += `: ${errData.message}`;
      }
      
      setState((s) => ({
        ...s,
        loading: false,
        error: errorMsg,
      }));
    }
  }, [state.ticketResult, state.selectedPass]);

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
      formData: initialFormData,
      loading: false,
      error: null,
      ticketResult: null,
    });
  }, []);

  return { ...state, selectPass, submitForm, initiatePayment, proceedToPaymentStep, goBack, reset };
}
