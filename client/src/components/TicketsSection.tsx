import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Check, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePassTypes } from '../features/ticketing/hooks/usePassTypes';
import { useSettings } from '../features/ticketing/hooks/useSettings';

export const TicketsSection = () => {
  const { passes, loading: passesLoading } = usePassTypes();
  const { registrationEnabled, loading: settingsLoading } = useSettings();
  const loading = passesLoading || settingsLoading;

  return (
    <section id="tickets" className="relative py-20 sm:py-32 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      {/* Background flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-f1-red/5 rounded-full blur-[120px] sm:blur-[180px] pointer-events-none"></div>

      <SectionHeader title="Paddock Passes" subtitle="Secure your spot on the grid. Choose the pass that fits your profile and join the cloud revolution." sysId="05.TKT" />

      {loading ? (
        <div className="flex justify-center py-20 relative z-10">
          <Loader2 className="animate-spin text-aws-orange" size={32} />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-5xl mx-auto relative z-10 items-stretch">
            {passes.filter(p => p.is_active).map((tier, i) => {
              const isSoldOut = tier.capacity - tier.sold <= 0;
              const hex = tier.badge_color || '#ffffff';
              const label = tier.label;

              return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                onMouseEnter={(e) => { if (!isSoldOut) e.currentTarget.style.borderColor = hex; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${hex}66`; }}
                style={{ 
                  borderColor: `${hex}66`, 
                  boxShadow: isSoldOut ? 'none' : `0 0 40px ${hex}26` 
                }}
                className="relative text-left w-full sm:w-[320px] max-w-full rounded-[1.5rem] border-2 bg-[#0a0a0a] flex flex-col h-full group overflow-hidden transition-all duration-500 hover:-translate-y-2"
              >
                {/* Event Badge Top Bar */}
                <div className="h-10 flex justify-between items-center px-5 z-20" style={{ backgroundColor: `${hex}1A`, color: hex }}>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest">ACCESS PASS</span>
                  <span className="font-mono text-[9px] font-black uppercase">GRID-0{i + 1}</span>
                </div>

                {/* Fake Lanyard Hole */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-2.5 rounded-full bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-30" />

                <div className="p-5 flex-1 flex flex-col relative z-20">
                  {/* Status & Name */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div>
                      <p className="font-mono text-[9px] tracking-widest uppercase mb-1 font-bold" style={{ color: hex }}>
                        {tier.slug}
                      </p>
                      <h3 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white leading-none">
                        {tier.name}
                      </h3>
                    </div>
                    
                    {(!registrationEnabled || label) && (
                      <div 
                        className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border rounded-sm text-center shrink-0"
                        style={{ 
                          color: !registrationEnabled ? '#00ffff' : hex, 
                          borderColor: !registrationEnabled ? '#00ffff4D' : `${hex}4D`, 
                          backgroundColor: !registrationEnabled ? '#00ffff1A' : `${hex}1A` 
                        }}
                      >
                        {!registrationEnabled ? "UPCOMING" : label}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="font-sans font-bold text-lg text-white/40">₹</span>
                    <span className="font-sans font-black italic text-4xl tracking-tighter text-white">
                      {tier.price}
                    </span>
                  </div>

                  {/* Dashed Separator */}
                  <div className="w-full border-t-2 border-dashed border-white/10 my-2 relative">
                    <div className="absolute -left-8 -top-3 w-5 h-5 rounded-full bg-[#050505] border-r-2 border-white/10" />
                    <div className="absolute -right-8 -top-3 w-5 h-5 rounded-full bg-[#050505] border-l-2 border-white/10" />
                  </div>

                  {/* Features List */}
                  <ul className="flex flex-col gap-2 flex-1 mt-5">
                    {tier.perks && tier.perks.map((feature, j) => (
                      <li key={j} className="text-[11px] font-sans text-white/70 flex items-start gap-2 group-hover:text-white/90 transition-colors">
                        <Check size={12} className="shrink-0 mt-0.5" style={{ color: hex }} />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom Action Section */}
                  <div className="mt-6 pt-5 border-t border-white/10">
                    {registrationEnabled && !isSoldOut ? (
                      <Link
                        to={`/ticket?passId=${tier.id}`}
                        style={{ backgroundColor: hex, color: '#000', boxShadow: `0 10px 15px -3px ${hex}33` }}
                        className="w-full text-center px-4 py-3.5 text-[11px] font-mono uppercase tracking-widest font-bold transition-all skew-x-[-6deg] block hover:bg-white hover:text-black"
                      >
                        <span className="skew-x-[6deg] block">Secure Pass →</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full text-center px-4 py-3.5 text-[11px] font-mono uppercase tracking-widest font-bold bg-white/5 text-white/20 skew-x-[-6deg] block cursor-not-allowed"
                      >
                        <span className="skew-x-[6deg] block">
                          {!registrationEnabled ? "Opening Soon" : "Grid Full"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                {!isSoldOut && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, ${hex}33, transparent)` }}
                  />
                )}
              </motion.div>
              )
            })}
          </div>

          {/* Fee note */}
          <div className="mt-12 text-center relative z-10">
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
              * SECURE GATEWAY ENCRYPTION APPLIED. EXCLUDES 2.6% PLATFORM FEES.
            </p>
          </div>
        </>
      )}
    </section>
  )
}
