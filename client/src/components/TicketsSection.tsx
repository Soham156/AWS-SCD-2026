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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 mt-12 sm:mt-16 max-w-6xl mx-auto relative z-10">
            {passes.filter(p => p.is_active).map((tier, i) => {
              const isSoldOut = tier.capacity - tier.sold <= 0;
              const highlight = tier.badge_color === '#FF9900' || tier.badge_color === '#E10600' || i === 1;
              const textTheme = highlight ? 'text-aws-orange' : 'text-white/40';

              return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`relative w-full mx-auto max-w-[380px] rounded-[2rem] border-2 bg-[#0a0a0a] shadow-2xl flex flex-col group overflow-hidden ${
                  highlight ? 'border-aws-orange/30 shadow-[0_0_40px_rgba(255,153,0,0.1)] hover:border-aws-orange/60' : 'border-white/10 hover:border-white/30'
                } transition-all duration-500 hover:-translate-y-2`}
              >
                {/* Event Badge Top Bar */}
                <div className={`h-12 flex justify-between items-center px-6 z-20 ${
                  highlight ? 'bg-aws-orange text-black' : 'bg-white/10 text-white/60'
                }`}>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest">ACCESS PASS</span>
                  <span className="font-mono text-[10px] font-black uppercase">CLASS-0{i + 1}</span>
                </div>

                {/* Fake Lanyard Hole */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-30" />

                <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-20">
                  {/* Status & Name */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className={`font-mono text-[10px] tracking-widest uppercase mb-1 ${textTheme} font-bold`}>
                        {tier.slug}
                      </p>
                      <h3 className="font-sans font-black italic text-3xl uppercase tracking-tight text-white leading-none">
                        {tier.name}
                      </h3>
                    </div>
                    
                    <div className={`font-mono text-[9px] tracking-widest uppercase px-2 py-1 border rounded-sm ${
                      !registrationEnabled ? "text-[#00ffff] border-[#00ffff]/30 bg-[#00ffff]/10" :
                      isSoldOut ? "text-gray-400 border-gray-700 bg-gray-900" :
                      highlight ? "text-aws-orange border-aws-orange/30 bg-aws-orange/10" :
                      "text-white/40 border-white/20 bg-white/5"
                    }`}>
                      {!registrationEnabled ? "UPCOMING" : isSoldOut ? "SOLD OUT" : "ACTIVE"}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="font-sans font-bold text-xl text-white/40">₹</span>
                    <span className="font-sans font-black italic text-5xl tracking-tighter text-white">
                      {tier.price}
                    </span>
                  </div>

                  {/* Dashed Separator */}
                  <div className="w-full border-t-2 border-dashed border-white/10 my-2 relative">
                    {/* Semi-circle cutouts on edges */}
                    <div className="absolute -left-10 -top-3 w-6 h-6 rounded-full bg-[#050505] border-r-2 border-white/10" />
                    <div className="absolute -right-10 -top-3 w-6 h-6 rounded-full bg-[#050505] border-l-2 border-white/10" />
                  </div>

                  {/* Features List */}
                  <ul className="flex flex-col gap-3 flex-1 mt-6">
                    {tier.perks && tier.perks.map((feature, j) => (
                      <li key={j} className="text-[11px] sm:text-xs font-sans text-white/70 flex items-start gap-3 group-hover:text-white/90 transition-colors">
                        <Check size={14} className={highlight ? "text-aws-orange shrink-0 mt-0.5" : "text-[#00ff00] shrink-0 mt-0.5"} />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bottom Action Section */}
                  <div className="mt-8 pt-6 border-t border-white/10">
                    {/* Barcode decorative */}
                    <div className="h-6 flex gap-[2px] opacity-20 mb-4 justify-center">
                      {[1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 2, 4, 1, 2, 1, 3, 2, 1].map((w, j) => (
                        <div key={j} className="h-full bg-white" style={{ width: `${w}px` }} />
                      ))}
                    </div>

                    {registrationEnabled && !isSoldOut ? (
                      <Link
                        to="/ticket"
                        className={`w-full text-center px-4 py-4 text-xs font-mono uppercase tracking-widest font-bold transition-all skew-x-[-6deg] block shadow-lg ${
                          highlight 
                            ? 'bg-aws-orange text-black hover:bg-white hover:text-black shadow-aws-orange/20' 
                            : 'bg-white/10 text-white hover:bg-white hover:text-black'
                        }`}
                      >
                        <span className="skew-x-[6deg] block">Secure Pass →</span>
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full text-center px-4 py-4 text-xs font-mono uppercase tracking-widest font-bold bg-white/5 text-white/20 skew-x-[-6deg] block cursor-not-allowed"
                      >
                        <span className="skew-x-[6deg] block">
                          {!registrationEnabled ? "Opening Soon" : "Grid Full"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute top-0 left-0 right-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-b ${
                  highlight ? 'from-aws-orange/20' : 'from-white/5'
                } to-transparent`} />
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
