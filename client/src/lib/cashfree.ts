import { load } from '@cashfreepayments/cashfree-js';

export const getCashfree = () =>
  load({ mode: (import.meta.env.VITE_CASHFREE_ENV as 'sandbox' | 'production') || 'production' });
