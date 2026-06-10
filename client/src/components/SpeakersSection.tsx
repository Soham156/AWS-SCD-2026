import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { User } from 'lucide-react';

const placeholders = [1, 2, 3, 4];

export const SpeakersSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505] overflow-hidden">
      {/* Decorative track line behind speakers */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 pointer-events-none"></div>

      <SectionHeader title="The Starting Grid" subtitle="Our lineup of industry experts, cloud architects, and visionaries is currently warming up in the garage. Stay tuned as we reveal our speakers." sysId="03.SPK" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16 relative z-10">
        {placeholders.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.6 }}
            className="group relative"
          >
            {/* Card Body */}
            <div className="relative bg-[#0a0a0a] border border-white/5 aspect-[3/4] overflow-hidden flex flex-col justify-between p-6 transition-colors group-hover:border-white/20">
              
              {/* Background gradient that shifts on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Top - Number */}
              <div className="relative z-10 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                Position 0{i + 1}
              </div>

              {/* Center - Mystery Silhouette */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white/5 border-dashed flex items-center justify-center relative">
                  {/* Rotating dashed border on hover */}
                  <div className="absolute inset-[-2px] rounded-full border-2 border-transparent border-t-aws-orange/50 group-hover:animate-[spin_4s_linear_infinite] transition-all"></div>
                  <User size={32} className="text-white/10 group-hover:text-white/20 transition-colors" />
                </div>
              </div>

              {/* Bottom - Info */}
              <div className="relative z-10 text-center border-t border-white/5 pt-4">
                <h3 className="font-sans font-black italic text-lg sm:text-xl uppercase tracking-tighter text-white/50 group-hover:text-white transition-colors">
                  To Be Announced
                </h3>
                <p className="font-mono text-[9px] sm:text-[10px] text-aws-orange/50 tracking-widest uppercase mt-1">
                  Speaker Lineup
                </p>
              </div>

              {/* Scanning laser line effect */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-aws-orange opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#FF9900]"></div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.5; }
          50% { opacity: 1; top: 100%; }
          90% { opacity: 0.5; }
          100% { top: 0; opacity: 0; }
        }
      `}</style>
    </section>
  )
}
