import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SectionHeader, AngledButton } from './LayoutElements';
import { User, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

function SpeakerCountdown() {
  const revealDate = new Date('2026-07-15T00:00:00+05:30').getTime();
  const [diff, setDiff] = useState(revealDate - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(revealDate - Date.now()), 1000);
    return () => clearInterval(id);
  }, [revealDate]);

  if (diff <= 0) return <span className="text-[#00ff00] font-bold">REVEALED</span>;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return (
    <span className="text-aws-orange">
      {days}d {hours}h
    </span>
  );
}

const positions = [1, 2, 3, 4];

export const SpeakersSection = () => {
  return (
    <section id="speakers" className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505] overflow-hidden">
      {/* Decorative track line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 pointer-events-none"></div>

      <SectionHeader title="The Starting Grid" subtitle="Our lineup of industry experts, cloud architects, and visionaries is currently warming up in the garage." sysId="03.SPK" />

      <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left: Reveal Info (Compact) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between group"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjAuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] pointer-events-none opacity-50" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-aws-orange/10 border border-aws-orange/20 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-pulse" />
              <span className="font-mono text-[10px] text-aws-orange uppercase tracking-widest font-bold">Lineup Reveal</span>
            </div>
            
            <h3 className="font-sans text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-white mb-2">
              <SpeakerCountdown />
            </h3>
            <p className="font-sans text-sm text-white/50 mb-8 max-w-sm">
              We are finalizing an incredible lineup of AWS heroes and tech visionaries. The grid is forming.
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
            <Link to="/speaker" className="inline-flex items-center gap-2 text-aws-orange hover:text-white font-mono text-xs uppercase tracking-widest transition-colors group/btn">
              Apply to Speak <Mic size={14} className="group-hover/btn:scale-110 transition-transform" />
            </Link>
          </div>
          
          {/* Decorative glow */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-aws-orange/10 rounded-full blur-[80px] group-hover:bg-aws-orange/20 transition-colors duration-700" />
        </motion.div>

        {/* Right: Compact Speaker Slots */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
          {positions.map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 sm:p-6 overflow-hidden flex flex-col items-center justify-center text-center hover:border-white/20 transition-all hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/10 border-dashed flex items-center justify-center mb-4">
                <div className="absolute inset-[-2px] rounded-full border-2 border-transparent border-t-aws-orange/50 group-hover:animate-[spin_3s_linear_infinite] transition-all" />
                <User size={20} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>

              <div className="relative z-10">
                <h4 className="font-sans font-black italic text-sm sm:text-base uppercase tracking-tighter text-white/50 group-hover:text-white transition-colors">
                  To Be Announced
                </h4>
                <p className="font-mono text-[9px] text-aws-orange/50 tracking-widest uppercase mt-1">
                  Position 0{pos}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
