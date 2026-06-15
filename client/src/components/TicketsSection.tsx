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
    <section id="tickets" className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      {/* Background flare */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-f1-red/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"></div>

      <SectionHeader title="Paddock Passes" subtitle="Secure your spot on the grid. Choose the pass that fits your profile and join the cloud revolution." sysId="05.TKT" />

      {loading ? (
        <div className="flex justify-center py-20 relative z-10">
          <Loader2 className="animate-spin text-aws-orange" size={32} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 relative z-10">
            {passes.filter(p => p.is_active).map((tier, i) => {
              const isSoldOut = tier.capacity - tier.sold <= 0;
              const highlight = tier.badge_color === '#FF9900' || tier.badge_color === '#E10600';
              
              return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`flex flex-col p-6 sm:p-8 relative overflow-hidden group transition-all duration-300 min-h-[380px] border ${
                  highlight 
                    ? 'bg-gradient-to-br from-f1-red/10 to-[#050505] border-f1-red/50 shadow-[0_0_30px_rgba(225,6,0,0.15)]' 
                    : 'bg-[#111] border-white/5 hover:border-white/20'
                }`}
              >
                {/* Top gradient line for highlight */}
                {highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-f1-red to-aws-orange"></div>
                )}

                {/* Most Popular badge */}
                {highlight && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-f1-red/20 border border-f1-red/30">
                    <TrendingUp size={10} className="text-f1-red" />
                    <span className="font-mono text-[8px] text-f1-red uppercase tracking-widest font-bold">Most Popular</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className={`self-start font-mono text-[9px] sm:text-[10px] tracking-widest uppercase px-2 py-1 mb-6 border ${
                  !registrationEnabled ? "text-[#00ffff] border-[#00ffff]/30 bg-[#00ffff]/10" :
                  isSoldOut ? "text-gray-400 border-gray-700 bg-gray-900" :
                  "text-aws-orange border-aws-orange/30 bg-aws-orange/10"
                }`}>
                  {!registrationEnabled ? "OPENING SOON" : isSoldOut ? "SOLD OUT" : "AVAILABLE"}
                </div>

                <div className="mb-6 border-b border-white/10 pb-6">
                  <h3 className={`font-sans font-black italic text-2xl uppercase tracking-tighter ${highlight ? 'text-white' : 'text-gray-300'}`}>
                    {tier.name}
                  </h3>
                  <p className="font-mono text-[10px] sm:text-xs text-aws-orange tracking-widest uppercase mt-1">
                    {tier.slug}
                  </p>
                  
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-sans font-bold text-xl text-white/50">₹</span>
                    <span className="font-sans font-black italic text-4xl sm:text-5xl tracking-tighter text-white">
                      {tier.price}
                    </span>
                  </div>

                  {/* Removed capacity bar as requested */}
                </div>

                <ul className="flex flex-col gap-3 flex-1 mt-auto">
                  {tier.perks && tier.perks.map((feature, j) => (
                    <li key={j} className="text-[10px] sm:text-xs font-sans opacity-60 flex items-start gap-2 group-hover:opacity-80 transition-opacity">
                      <Check size={14} className="text-[#00ff00] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Get Pass button */}
                {registrationEnabled && !isSoldOut && (
                  <Link
                    to="/ticket"
                    className="mt-6 w-full text-center px-4 py-2.5 bg-f1-red text-white text-xs font-mono uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all skew-x-[-6deg] block"
                  >
                    <span className="skew-x-[6deg] block">Get Pass →</span>
                  </Link>
                )}
              </motion.div>
              )
            })}
          </div>

          {/* Fee note */}
          <div className="mt-6 text-center relative z-10">
            <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">
              * Prices exclude 2.6% platform & gateway fees
            </p>
          </div>
        </>
      )}
    </section>
  )
}
