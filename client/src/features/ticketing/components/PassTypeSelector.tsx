import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';
import { Skeleton } from 'boneyard-js/react';

interface Props {
  passes: PassType[];
  loading: boolean;
  onSelect: (pass: PassType, quantity: number) => void;
}

export function PassTypeSelector({ passes, loading, onSelect }: Props) {
  const displayPasses = loading
    ? [
        { id: '1', name: 'Pass Name Skeleton', slug: 'SCD-PASS-1', price: 999, badge_color: '#3b82f6', label: 'SELECT', perks: ['Perk 1 details placeholder', 'Perk 2 details placeholder', 'Perk 3 details placeholder'], available: 10, is_locked: false },
        { id: '2', name: 'Pass Name Skeleton', slug: 'SCD-PASS-2', price: 1999, badge_color: '#ef4444', label: 'SELECT', perks: ['Perk 1 details placeholder', 'Perk 2 details placeholder', 'Perk 3 details placeholder'], available: 10, is_locked: false },
        { id: '3', name: 'Pass Name Skeleton', slug: 'SCD-PASS-3', price: 2999, badge_color: '#10b981', label: 'SELECT', perks: ['Perk 1 details placeholder', 'Perk 2 details placeholder', 'Perk 3 details placeholder'], available: 10, is_locked: false },
      ]
    : passes;

  if (!loading && passes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50 font-mono text-sm">No passes available yet.</p>
        <p className="text-white/30 font-mono text-xs mt-2">Check back soon!</p>
      </div>
    );
  }

  return (
    <Skeleton name="pass-type-selector" loading={loading}>
      <div className="flex flex-wrap justify-center gap-4 items-stretch">
        {displayPasses.map((pass, i) => {
          const soldOut = pass.available <= 0;
          const locked = pass.is_locked;
          const disabled = soldOut || locked;
          const hex = pass.badge_color || '#ffffff';
          const label = pass.label;

          return (
            <motion.div
              key={pass.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{ 
                borderColor: disabled ? '#ffffff0D' : `${hex}66`, 
                boxShadow: disabled ? 'none' : `0 0 40px ${hex}26` 
              }}
              className={`relative text-left w-full sm:w-[320px] max-w-[340px] mx-auto rounded-[1.5rem] border-2 bg-[#0a0a0a] flex flex-col min-h-[440px] group transition-all duration-300 ${
                disabled
                  ? locked ? 'opacity-70' : 'opacity-50 grayscale'
                  : `hover:-translate-y-1`
              }`}
            >
              {/* Event Badge Top Bar */}
              <div className="h-8 flex justify-between items-center px-4 z-20 rounded-t-[1.3rem]" style={{ backgroundColor: `${hex}1A`, color: hex }}>
                <span className="font-mono text-[8px] font-bold uppercase tracking-widest">ACCESS PASS</span>
                <span className="font-mono text-[8px] font-black uppercase">GRID-0{i + 1}</span>
              </div>

              <div className="p-5 flex-1 flex flex-col relative z-20">
                {/* Header Area (symmetric height for title, description & price) */}
                <div className="min-h-[110px] flex flex-col justify-between mb-4">
                  <div>
                    {/* Status & Name */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-mono text-[9px] tracking-widest uppercase mb-1 font-bold" style={{ color: hex }}>
                          {pass.slug}
                        </p>
                        <h3 className="font-sans font-black italic text-xl uppercase tracking-tighter text-white leading-none mt-">
                          {pass.name}
                        </h3>
                      </div>
                      
                      {locked ? (
                        <div 
                          className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border rounded-sm text-center shrink-0"
                          style={{ color: '#f59e0b', borderColor: '#f59e0b4D', backgroundColor: '#f59e0b1A' }}
                        >
                          Opening Soon
                        </div>
                      ) : label && (
                        <div 
                          className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border rounded-sm text-center shrink-0"
                          style={{ color: hex, borderColor: `${hex}4D`, backgroundColor: `${hex}1A` }}
                        >
                          {label}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans font-bold text-base text-white/50">₹</span>
                    <span className="font-sans font-black italic text-3xl tracking-tighter text-white">
                      {pass.price}
                    </span>
                  </div>
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
                  ) : locked ? (
                    <div className="font-mono text-[10px] tracking-widest uppercase text-amber-400/70">Coming Soon</div>
                  ) : (
                    <button type="button"
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
              {!disabled && (
                <div 
                  className="absolute top-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-t-[1.5rem]"
                  style={{ background: `linear-gradient(to bottom, ${hex}33, transparent)` }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </Skeleton>
  );
}
