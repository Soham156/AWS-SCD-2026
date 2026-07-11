import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PassType } from '../hooks/usePassTypes';
import type { AttendeeData } from '../hooks/useRegistration';

interface Props {
  selectedPass: PassType;
  quantity: number;
  attendees: AttendeeData[];
  discountAmount?: number;
  loading?: boolean;
  onApplyCode: (code: string) => Promise<boolean>;
  onRemovePromo?: () => Promise<boolean>;
  onProceed: () => void;
  onBack: () => void;
  referralCode?: string | null;
  onRemoveReferral?: () => Promise<boolean>;
  error?: string | null;
}

export function OrderSummary({
  selectedPass,
  quantity,
  attendees,
  discountAmount = 0,
  loading,
  onApplyCode,
  onRemovePromo,
  onProceed,
  onBack,
  referralCode,
  onRemoveReferral,
  error
}: Props) {
  const [codeInput, setCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  const basePrice = Number(selectedPass.price);
  const subtotal = basePrice * quantity;
  
  const platformFeePercent = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENT || '1');
  const gatewayFeePercent = parseFloat(import.meta.env.VITE_GATEWAY_FEE_PERCENT || '1.6');
  
  const postDiscount = subtotal - discountAmount;
  const platformFee = (postDiscount * platformFeePercent) / 100;
  const gatewayFee = (postDiscount * gatewayFeePercent) / 100;
  const total = Math.round((postDiscount + platformFee + gatewayFee) * 100) / 100;

  const handleApplyCode = async () => {
    if (!codeInput) return;
    setCodeLoading(true);
    const success = await onApplyCode(codeInput);
    if (success) {
      setCodeInput('');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setCodeLoading(false);
  };

  const handlePromoRemove = async () => {
    if (!onRemovePromo) return;
    setCodeLoading(true);
    await onRemovePromo();
    setCodeLoading(false);
  };

  const handleReferralRemove = async () => {
    if (!onRemoveReferral) return;
    setCodeLoading(true);
    await onRemoveReferral();
    setCodeLoading(false);
  };

  const bothApplied = (discountAmount > 0) && !!referralCode;

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

        <div className="space-y-4 font-mono text-sm mb-6">
          <div className="flex justify-between items-center text-white border-b border-white/5 pb-2">
            <span>{selectedPass.name} (x{quantity})</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 my-2 border border-f1-red/30 bg-f1-red/10 text-f1-red text-[11px] font-mono text-center">
              {error}
            </div>
          )}

          {/* Unified Promo/Referral Code Input */}
          {!bothApplied && (
            <div className="flex gap-2 py-2 border-t border-white/5">
              <input aria-label="code input"
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="PROMO OR REFERRAL CODE"
                className="flex-1 bg-[#111] border border-white/10 px-3 py-2 text-xs text-white focus:border-aws-orange focus:outline-none uppercase tracking-widest font-mono"
              />
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={codeLoading || !codeInput || loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
              >
                {codeLoading ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}

          {/* Applied Promo Code */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-400 text-xs py-2 bg-emerald-500/10 px-3 border border-emerald-500/20 border-t border-white/5">
              <span>Discount Applied</span>
              <div className="flex items-center gap-2">
                <span>- ₹{discountAmount.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={handlePromoRemove}
                  disabled={codeLoading || loading}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors flex items-center justify-center text-red-400/60 hover:text-red-400 cursor-pointer"
                  title="Remove Promo Code"
                >
                  {codeLoading ? <Loader2 size={12} className="animate-spin text-emerald-400" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          )}

          {/* Applied Referral Code */}
          {referralCode && (
            <div className="flex justify-between items-center text-aws-orange text-xs py-2 bg-aws-orange/5 px-3 border border-aws-orange/20 border-t border-white/5">
              <span>Referral Applied ({referralCode})</span>
              <button
                type="button"
                onClick={handleReferralRemove}
                disabled={codeLoading || loading}
                className="p-1 hover:bg-red-500/20 rounded transition-colors flex items-center justify-center text-red-400/60 hover:text-red-400 cursor-pointer"
                title="Remove Referral Code"
              >
                {codeLoading ? <Loader2 size={12} className="animate-spin text-aws-orange" /> : <Trash2 size={12} />}
              </button>
            </div>
          )}

          <div className="flex justify-between items-center text-white/50 text-xs border-t border-white/5 pt-2">
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
            <span className="font-mono text-[10px] text-f1-red uppercase tracking-widest">Tax Inclusive</span>
          </div>
          <span className="font-mono font-bold text-3xl text-aws-orange">₹{total.toFixed(2)}</span>
        </div>

        <div className="bg-[#111] border border-white/5 p-4 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Registrant Details</h4>
            <span className="font-mono text-[10px] text-white/30 bg-white/5 px-2 py-1">{quantity} Tickets</span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {attendees.map((att, idx) => (
              <div key={idx} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <p className="font-sans font-bold text-white/90 text-sm">
                  {att.full_name} {idx === 0 && <span className="text-aws-orange text-[10px] ml-2 uppercase">(Primary)</span>}
                </p>
                <div className="mt-1 flex justify-between">
                  <p className="font-mono text-[10px] text-white/50">{att.email}</p>
                  <p className="font-mono text-[10px] text-white/50 uppercase">{att.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-white/10 text-white/60 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onProceed}
            disabled={loading}
            className="flex-1 bg-aws-orange text-black font-mono font-bold text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
