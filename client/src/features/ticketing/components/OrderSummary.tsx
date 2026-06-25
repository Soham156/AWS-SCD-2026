import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PassType } from '../hooks/usePassTypes';
import type { AttendeeData } from '../hooks/useRegistration';

interface Props {
  selectedPass: PassType;
  quantity: number;
  attendees: AttendeeData[];
  discountAmount?: number;
  loading?: boolean;
  onApplyPromo: (code: string) => Promise<boolean>;
  onRemovePromo?: () => Promise<boolean>;
  onProceed: () => void;
  onBack: () => void;
}

export function OrderSummary({ selectedPass, quantity, attendees, discountAmount = 0, loading, onApplyPromo, onRemovePromo, onProceed, onBack }: Props) {
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(discountAmount > 0);

  const basePrice = Number(selectedPass.price);
  const subtotal = basePrice * quantity;
  
  const platformFeePercent = parseFloat(import.meta.env.VITE_PLATFORM_FEE_PERCENT || '1');
  const gatewayFeePercent = parseFloat(import.meta.env.VITE_GATEWAY_FEE_PERCENT || '1.6');
  
  const postDiscount = subtotal - discountAmount;
  const platformFee = (postDiscount * platformFeePercent) / 100;
  const gatewayFee = (postDiscount * gatewayFeePercent) / 100;
  const total = Math.round((postDiscount + platformFee + gatewayFee) * 100) / 100;

  const handlePromoApply = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    const success = await onApplyPromo(promoCode);
    if (success) {
      setPromoApplied(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setPromoLoading(false);
  };

  const handlePromoRemove = async () => {
    if (!onRemovePromo) return;
    setPromoLoading(true);
    const success = await onRemovePromo();
    if (success) {
      setPromoApplied(false);
      setPromoCode('');
    }
    setPromoLoading(false);
  };

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

          {/* Promo Code Input */}
          {!promoApplied ? (
            <div className="flex gap-2 py-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 bg-[#111] border border-white/10 px-3 py-2 text-xs text-white focus:border-aws-orange focus:outline-none uppercase tracking-widest font-mono"
              />
              <button
                type="button"
                onClick={handlePromoApply}
                disabled={promoLoading || !promoCode}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase tracking-widest transition-colors"
              >
                {promoLoading ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center text-emerald-400 text-xs py-2 bg-emerald-500/10 px-3 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span>Discount Applied</span>
                <button
                  type="button"
                  onClick={handlePromoRemove}
                  disabled={promoLoading}
                  className="p-1 hover:bg-red-500/20 rounded-full transition-colors flex items-center justify-center text-f1-red hover:text-red-400"
                  title="Remove Promo Code"
                >
                  {promoLoading ? <Loader2 size={12} className="animate-spin text-emerald-400" /> : <X size={14} />}
                </button>
              </div>
              <span>- ₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

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
            className="px-6 py-3 border border-white/10 text-white/60 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="button"
            onClick={onProceed}
            disabled={loading}
            className="flex-1 bg-aws-orange text-black font-mono font-bold text-xs uppercase tracking-widest py-3 hover:bg-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
