import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, CreditCard } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';

interface Props {
  selectedPass: PassType;
  loading: boolean;
  error: string | null;
  onInitiatePayment: () => void;
  onBack: () => void;
}

export function PaymentEmbed({ selectedPass, loading, error, onInitiatePayment, onBack }: Props) {
  useEffect(() => {
    // Auto-initiate payment on mount
    onInitiatePayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-center"
    >
      {/* Pass summary */}
      <div className="inline-flex items-center gap-3 mb-8 p-4 border border-white/10 bg-white/5">
        <div
          className="w-3 h-12 shrink-0"
          style={{ backgroundColor: selectedPass.badge_color }}
        />
        <div className="text-left">
          <p className="font-sans font-black italic text-lg uppercase tracking-tight text-white">
            {selectedPass.name}
          </p>
          <p className="font-mono text-2xl text-aws-orange font-bold">₹{selectedPass.price}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-6 border border-f1-red/30 bg-f1-red/10 text-f1-red text-xs font-mono">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 size={32} className="animate-spin text-aws-orange" />
          <p className="font-mono text-xs text-white/50 uppercase tracking-widest">
            Connecting to payment gateway...
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col items-center gap-4 py-8">
          <CreditCard size={32} className="text-white/30" />
          <p className="font-mono text-xs text-white/50">
            Payment window should open automatically.
          </p>
          <button
            onClick={onInitiatePayment}
            className="px-6 py-2.5 bg-aws-orange text-black text-xs font-mono uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            Retry Payment
          </button>
        </div>
      )}

      <button
        onClick={onBack}
        className="mt-4 text-white/30 hover:text-white/60 text-xs font-mono uppercase tracking-widest transition-colors"
      >
        ← Back
      </button>
    </motion.div>
  );
}
