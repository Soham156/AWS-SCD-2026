declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeLoadOptions {
    mode: 'sandbox' | 'production';
  }

  interface CheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: '_self' | '_blank' | '_modal';
  }

  interface CheckoutResult {
    error?: { message: string };
    paymentDetails?: Record<string, any>;
  }

  interface CashfreeInstance {
    checkout(options: CheckoutOptions): Promise<CheckoutResult>;
  }

  export function load(options: CashfreeLoadOptions): Promise<CashfreeInstance>;
}
