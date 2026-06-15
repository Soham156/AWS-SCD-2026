import { motion } from 'motion/react';
import type { PassType } from '../hooks/usePassTypes';

interface Props {
  selectedPass: PassType;
  formData: any;
  loading?: boolean;
  onProceed: () => void;
  onBack: () => void;
}

export function OrderSummary({ selectedPass, formData, loading, onProceed, onBack }: Props) {
  const basePrice = Number(selectedPass.price);
  const platformFeePercent = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENT || '1');
  const gatewayFeePercent = parseFloat(import.meta.env.VITE_GATEWAY_FEE_PERCENT || '1.6');
  
  const platformFee = (basePrice * platformFeePercent) / 100;
  const gatewayFee = (basePrice * gatewayFeePercent) / 100;
  const total = Math.round((basePrice + platformFee + gatewayFee) * 100) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="border border-white/10 bg-black p-6 relative overflow-hidden">
        {/* Accent Bar */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: selectedPass.badge_color }}
        />

        <h3 className="font-sans font-black italic text-xl uppercase tracking-tight text-white mb-6 pt-2">
          Order Summary
        </h3>

        <div className="space-y-4 font-mono text-sm mb-8">
          <div className="flex justify-between items-center text-white border-b border-white/5 pb-2">
            <span>{selectedPass.name}</span>
            <span>₹{basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-white/50 text-xs">
            <span>Platform Fee ({platformFeePercent}%)</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-white/50 text-xs">
            <span>Gateway Fee ({gatewayFeePercent}%)</span>
            <span>₹{gatewayFee.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-end border-t border-white/10 pt-4 mb-8">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-white/40 uppercase tracking-widest mb-1">Total Amount</span>
            <span className="font-mono text-xs text-f1-red uppercase tracking-widest">Tax Inclusive</span>
          </div>
          <span className="font-mono font-bold text-3xl text-aws-orange">₹{total.toFixed(2)}</span>
        </div>

        <div className="bg-[#111] border border-white/5 p-4 mb-8">
          <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-widest mb-3">Registrant Details</h4>
          <p className="font-sans font-bold text-white/90">{formData.full_name}</p>
          <div className="mt-2 space-y-1">
            <p className="font-mono text-xs text-white/50">{formData.email}</p>
            <p className="font-mono text-xs text-white/50">{formData.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-white/10 text-white/60 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onProceed}
            disabled={loading}
            className="flex-1 bg-aws-orange text-black font-mono font-bold text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors disabled:opacity-50"
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </motion.div>
  );
}
