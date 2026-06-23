import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import {
  Mic,
  Briefcase,
  Gift,
  Package,
  Trophy,
  Utensils
} from 'lucide-react';

const perks = [
  {
    title: "Expert Sessions",
    desc: "Learn directly from industry professionals, community leaders, and experienced developers through technical keynotes and discussions.",
    icon: Mic,
    color: "aws-orange"
  },
  {
    title: "Career & Internships",
    desc: "Discover cloud career paths, internship opportunities, and industry expectations by speaking with active hiring sponsors.",
    icon: Briefcase,
    color: "f1-red"
  },
  {
    title: "AWS Credits & Giveaways",
    desc: "Participate in challenges and quick quizzes for a chance to win AWS credits, training vouchers, and prizes.",
    icon: Gift,
    color: "white"
  },
  {
    title: "Event Merch",
    desc: "Collect exclusive limited-edition event T-shirts, stickers, customized tags, and collectibles.",
    icon: Package,
    color: "aws-orange"
  },
  {
    title: "Badge",
    desc: "Claim your verified digital participation credential to share with your professional network and resume.",
    icon: Trophy,
    color: "f1-red"
  },
  {
    title: "Premium Hospitality",
    desc: "Fuel your learning with gourmet breakfast, hot lunch, and refreshments served throughout the day in the paddock.",
    icon: Utensils,
    color: "white"
  }
];

export const WhatYouGetSection = () => {
  return (
    <section id="about" className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 border-b border-white/5 overflow-hidden">
      {/* Sleek dotted/grid background pattern */}
      <div className="absolute inset-0 bg-[#050505] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      {/* Multi-layered soft glow blobs */}
      <div className="absolute -left-10 top-1/4 w-[350px] h-[350px] bg-aws-orange/5 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -right-10 bottom-1/4 w-[350px] h-[350px] bg-f1-red/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full relative z-10 flex flex-col gap-16">
        <SectionHeader 
          title="Event Benefits" 
          subtitle="A comprehensive student experience crafted to accelerate your growth, validate your skills, and connect you with the tech ecosystem." 
          sysId="01.BEN" 
        />

        <div className="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-6 pb-6 sm:pb-0 px-4 sm:px-0 -mx-4 sm:mx-auto no-scrollbar sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto w-full">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            
            // Map card color states for high-tech HUD borders and elements
            let accentBorder = "group-hover:border-white/20";
            let accentGlow = "group-hover:shadow-[0_0_25px_rgba(255,255,255,0.06)]";
            let lineGradient = "from-white/40 to-transparent";
            let iconBoxStyle = "text-white bg-white/5 border-white/10";
            let cornerColor = "group-hover:border-white/50";
            
            if (perk.color === "aws-orange") {
              accentBorder = "group-hover:border-aws-orange/30";
              accentGlow = "group-hover:shadow-[0_0_25px_rgba(255,153,0,0.12)]";
              lineGradient = "from-aws-orange via-aws-orange/50 to-transparent";
              iconBoxStyle = "text-aws-orange bg-aws-orange/5 border-aws-orange/20";
              cornerColor = "group-hover:border-aws-orange";
            } else if (perk.color === "f1-red") {
              accentBorder = "group-hover:border-f1-red/30";
              accentGlow = "group-hover:shadow-[0_0_25px_rgba(225,6,0,0.12)]";
              lineGradient = "from-f1-red via-f1-red/50 to-transparent";
              iconBoxStyle = "text-f1-red bg-f1-red/5 border-f1-red/20";
              cornerColor = "group-hover:border-f1-red";
            }

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                className={`group bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-xl p-6 sm:p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-1.5 shadow-2xl shrink-0 w-[82%] sm:w-auto snap-center ${accentGlow} ${accentBorder}`}
              >
                {/* Expansive top color line on hover */}
                <div className={`absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r ${lineGradient} group-hover:w-full transition-all duration-500`} />
                
                {/* Corner Crosshairs / HUD brackets */}
                <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 ${cornerColor} transition-colors duration-300`} />
                <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 ${cornerColor} transition-colors duration-300`} />
                <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10 ${cornerColor} transition-colors duration-300`} />
                <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 ${cornerColor} transition-colors duration-300`} />

                {/* HUD Header index info */}
                <div className="flex justify-between items-center mb-6 font-mono text-[9px] text-white/30 tracking-widest">
                  <span>METRIC_INDEX // 0{i + 1}</span>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${perk.color === 'aws-orange' ? 'bg-aws-orange' : perk.color === 'f1-red' ? 'bg-f1-red' : 'bg-white'} opacity-45 group-hover:animate-pulse`} />
                    <span>SYS_READY</span>
                  </div>
                </div>

                {/* Icon wrapper - skewed design */}
                <div className="flex items-center gap-5 mb-5">
                  <div className={`w-12 h-12 skew-x-[-6deg] rounded border flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 ${iconBoxStyle}`}>
                    <div className="skew-x-[6deg]">
                      <Icon size={22} className="group-hover:animate-pulse" />
                    </div>
                  </div>
                  <h3 className="font-sans font-black italic text-lg sm:text-xl text-white uppercase tracking-tighter leading-tight group-hover:text-aws-orange transition-colors duration-300">
                    {perk.title}
                  </h3>
                </div>

                {/* Description text with increased contrast on hover */}
                <p className="font-sans text-white/50 group-hover:text-white/80 text-sm leading-relaxed mb-6 flex-1 transition-colors duration-300">
                  {perk.desc}
                </p>

                {/* Bottom line coordinates style */}
                <div className="flex justify-between items-center border-t border-white/5 pt-4 font-mono text-[8px] text-white/20 select-none">
                  <span>GRID_VAL: {0x1A2B + i}</span>
                  <span>NODE_CONN_OK</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-2 text-[10px] font-mono text-white/40 tracking-wider">
          <span>SWIPE FOR ALL BENEFITS</span>
          <span className="animate-pulse">➔</span>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
