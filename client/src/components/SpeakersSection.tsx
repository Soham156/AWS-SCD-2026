import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from './LayoutElements';
import { User, Mic } from 'lucide-react';

const PLACEHOLDERS = [
  {
    pos: "01",
    role: "Keynote Speaker",
    status: "Staged / Warming up in garage",
    tag: "SECTOR-A1"
  },
  {
    pos: "02",
    role: "Cloud Architect",
    status: "Telemetry check in progress",
    tag: "SECTOR-B2"
  },
  {
    pos: "03",
    role: "DevOps Lead",
    status: "Pre-Grid / Tyre temperature OK",
    tag: "SECTOR-C3"
  },
  {
    pos: "04",
    role: "AI/ML Specialist",
    status: "Formation Lap / Engine start",
    tag: "SECTOR-D4"
  }
];

export const SpeakersSection = () => {
  const navigate = useNavigate();

  return (
    <section id="speakers" className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] overflow-hidden" aria-label="Speakers lineup">
      {/* Decorative track line behind speakers */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-y-1/2 pointer-events-none"></div>

      {/* Header with action */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
        <SectionHeader 
          title="Speakers" 
          subtitle="Our lineup of industry experts, cloud architects, and visionaries is currently preparing in the paddock. Stay tuned for speaker reveals." 
          sysId="02.SPK" 
        />
        
        <div className="md:mb-12 shrink-0">
          <button
            onClick={() => navigate('/cfp')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-12deg] transition-all hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,153,0,0.3)] cursor-pointer"
          >
            <span className="skew-x-[12deg] flex items-center gap-1.5">
              Apply as a Speaker <Mic size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Speaker Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 max-w-7xl mx-auto relative z-10">
        {PLACEHOLDERS.map((placeholder, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="group relative"
          >
            {/* Card Body */}
            <div className="relative bg-[#0d0d0d] border border-white/5 aspect-[3/3.7] sm:aspect-[3/4.2] overflow-hidden flex flex-col justify-between p-3 sm:p-6 transition-all duration-500 hover:border-aws-orange/40 hover:shadow-[0_0_30px_rgba(255,153,0,0.1)] rounded-xl">
              
              {/* Background gradient that shifts on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF9900]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Top - Grid Position */}
              <div className="relative z-10 flex justify-between items-center font-mono text-[7px] sm:text-[9px] text-white/30 uppercase tracking-widest">
                <span>Staging Grid // 0{placeholder.pos}</span>
                <span className="font-bold text-aws-orange/60 group-hover:text-aws-orange transition-colors">{placeholder.tag}</span>
              </div>

              {/* Center - Tech Scanner Avatar HUD */}
              <div className="relative z-10 flex-1 flex items-center justify-center my-1 sm:my-4">
                <div className="w-12 h-12 sm:w-28 sm:h-28 rounded-full border border-white/10 flex items-center justify-center relative bg-white/[0.01]">
                  {/* Rotating dashed borders */}
                  <div className="absolute inset-[-4px] rounded-full border border-transparent border-t-aws-orange/40 group-hover:animate-[spin_6s_linear_infinite]" />
                  <div className="absolute inset-[-8px] rounded-full border border-transparent border-b-f1-red/30 group-hover:animate-[spin_4s_linear_reverse_infinite]" />
                  
                  {/* Mystery Silhouette / Speaker Icon */}
                  <User className="text-white/10 group-hover:text-aws-orange group-hover:scale-105 transition-all duration-500 w-5 h-5 sm:w-9 sm:h-9" />
                </div>
              </div>

              {/* Bottom - Info */}
              <div className="relative z-10 border-t border-white/5 pt-2 sm:pt-4">
                <div className="font-mono text-[7px] sm:text-[8px] uppercase tracking-wider text-aws-orange mb-0.5 sm:mb-1 font-semibold">
                  {placeholder.role}
                </div>
                <h3 className="font-sans font-black italic text-xs sm:text-lg uppercase tracking-tighter text-white/60 group-hover:text-white transition-colors">
                  Reveal Coming Soon
                </h3>
                <p className="font-mono text-[7px] sm:text-[9px] text-white/40 tracking-wider mt-0.5 sm:mt-1 flex items-center gap-1 sm:gap-1.5">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-aws-orange animate-pulse" />
                  {placeholder.status}
                </p>

                {/* Session Box */}
                <div className="hidden sm:block mt-2 sm:mt-3 bg-white/[0.01] border border-white/5 p-1.5 sm:p-2 rounded text-[8px] sm:text-[10px] text-white/30 leading-normal line-clamp-2">
                  Session parameters and technical telemetry pending configuration.
                </div>
              </div>

              {/* Scanning laser line effect */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-aws-orange opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#FF9900]"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
