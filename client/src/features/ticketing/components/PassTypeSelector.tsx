import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';

interface Props {
  passes: PassType[];
  loading: boolean;
  onSelect: (pass: PassType, quantity: number) => void;
}

function SkeletonCard() {
  return (
    <div className="border border-white/5 bg-[#111] p-6 animate-pulse rounded-[1.5rem]">
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
    <div className="flex flex-wrap justify-center gap-4 items-stretch">
      {passes.map((pass, i) => {
        const soldOut = pass.available <= 0;
        const hex = pass.badge_color || '#ffffff';
        const label = pass.label;

        return (
          <motion.div
            key={pass.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            style={{ 
              borderColor: soldOut ? '#ffffff0D' : `${hex}66`, 
              boxShadow: soldOut ? 'none' : `0 0 40px ${hex}26` 
            }}
            className={`relative text-left w-full sm:w-[320px] max-w-full rounded-[1.5rem] border-2 bg-[#0a0a0a] flex flex-col h-full group transition-all duration-300 ${
              soldOut
                ? 'opacity-50 grayscale'
                : `hover:-translate-y-1`
            }`}
          >
            {/* Event Badge Top Bar */}
            <div className="h-8 flex justify-between items-center px-4 z-20 rounded-t-[1.3rem]" style={{ backgroundColor: `${hex}1A`, color: hex }}>
              <span className="font-mono text-[8px] font-bold uppercase tracking-widest">ACCESS PASS</span>
              <span className="font-mono text-[8px] font-black uppercase">GRID-0{i + 1}</span>
            </div>

            <div className="p-5 flex-1 flex flex-col relative z-20">
              {/* Status & Name */}
              <div className="flex justify-between items-start mb-3 gap-2">
                <div>
                  <p className="font-mono text-[9px] tracking-widest uppercase mb-1 font-bold" style={{ color: hex }}>
                    {pass.slug}
                  </p>
                  <h3 className="font-sans font-black italic text-xl uppercase tracking-tighter text-white leading-none">
                    {pass.name}
                  </h3>
                </div>
                
                {label && (
                  <div 
                    className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border rounded-sm text-center shrink-0"
                    style={{ color: hex, borderColor: `${hex}4D`, backgroundColor: `${hex}1A` }}
                  >
                    {label}
                  </div>
                )}
              </div>

              <p className="font-mono text-[9px] text-white/40 mb-4 line-clamp-2">{pass.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-sans font-bold text-base text-white/50">₹</span>
                <span className="font-sans font-black italic text-3xl tracking-tighter text-white">
                  {pass.price}
                </span>
              </div>

              {/* Perks */}
              <ul className="flex flex-col gap-2 flex-1 mt-2">
                {pass.perks.map((perk, j) => (
                  <li key={j} className="text-[10px] font-sans text-white/60 flex items-start gap-2">
                    <Check size={12} className="shrink-0 mt-0.5" style={{ color: hex }} />
                    <span className="leading-snug">{perk}</span>
                  </li>
                ))}
              </ul>

              {/* Action Area */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                {soldOut ? (
                  <div className="font-mono text-[10px] tracking-widest uppercase text-white/30">GRID FULL</div>
                ) : (
                  <button
                    onClick={() => onSelect(pass, 1)}
                    className="flex-1 px-4 py-2 text-[10px] font-mono tracking-widest uppercase font-bold text-black rounded-sm transition-colors hover:brightness-110"
                    style={{ backgroundColor: hex }}
                  >
                    Select Pass
                  </button>
                )}
              </div>
            </div>

            {/* Hover Glow Effect */}
            {!soldOut && (
              <div 
                className="absolute top-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-t-[1.5rem]"
                style={{ background: `linear-gradient(to bottom, ${hex}33, transparent)` }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
