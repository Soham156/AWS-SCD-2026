import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';

interface Props {
  passes: PassType[];
  loading: boolean;
  onSelect: (pass: PassType) => void;
}

function SkeletonCard() {
  return (
    <div className="border border-white/5 bg-[#111] p-6 animate-pulse">
      <div className="h-4 w-20 bg-white/10 rounded mb-6" />
      <div className="h-6 w-32 bg-white/10 rounded mb-2" />
      <div className="h-3 w-24 bg-white/10 rounded mb-4" />
      <div className="h-10 w-28 bg-white/10 rounded mb-6" />
      <div className="space-y-3">
        {[1,2,3,4].map(i => <div key={i} className="h-3 w-full bg-white/5 rounded" />)}
      </div>
    </div>
  );
}

export function PassTypeSelector({ passes, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (passes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50 font-mono text-sm">No passes available yet.</p>
        <p className="text-white/30 font-mono text-xs mt-2">Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {passes.map((pass, i) => {
        const soldOut = pass.available <= 0;

        return (
          <motion.button
            key={pass.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            onClick={() => !soldOut && onSelect(pass)}
            disabled={soldOut}
            className={`relative text-left p-6 border transition-all duration-300 group cursor-pointer ${
              soldOut
                ? 'bg-[#0a0a0a] border-white/5 opacity-50 cursor-not-allowed'
                : 'bg-[#111] border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            }`}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: pass.badge_color }}
            />

            {/* Status badge */}
            <div className={`inline-block font-mono text-[9px] tracking-widest uppercase px-2 py-1 mb-4 border ${
              soldOut
                ? 'text-gray-500 border-gray-700 bg-gray-900'
                : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
            }`}>
              {soldOut ? 'SOLD OUT' : `${pass.available} LEFT`}
            </div>

            {/* Pass info */}
            <h3 className="font-sans font-black italic text-xl uppercase tracking-tighter text-white mb-1">
              {pass.name}
            </h3>
            <p className="font-mono text-[10px] text-white/40 mb-3">{pass.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-5">
              <span className="font-sans font-bold text-lg text-white/50">₹</span>
              <span className="font-sans font-black italic text-3xl tracking-tighter text-white">
                {pass.price}
              </span>
            </div>

            {/* Perks */}
            <ul className="space-y-2">
              {pass.perks.map((perk, j) => (
                <li key={j} className="text-[10px] font-sans text-white/50 group-hover:text-white/70 flex items-start gap-2 transition-colors">
                  <Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            {/* Select indicator */}
            {!soldOut && (
              <div className="mt-5 font-mono text-[10px] tracking-widest uppercase text-white/30 group-hover:text-aws-orange transition-colors">
                Select →
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
