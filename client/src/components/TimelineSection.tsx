import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { SectionHeader } from './LayoutElements';

const schedule = [
  { time: "08:00 - 08:30", type: "Formation Lap", title: "Organizing Team Preparation", detail: "Last-minute checks before opening the circuit.", isPit: false, flag: "gray" },
  { time: "08:30 - 10:00", type: "Pit Lane", title: "Registration & Morning Breakfast", detail: "Get your paddock passes, grab fuel, and prepare for lights out.", isPit: true, flag: "red" },
  { time: "10:00 - 10:30", type: "Lights Out", title: "Official Opening Ceremony", detail: "Welcome address from SVKM track directors and AWS leadership.", isPit: false, flag: "gray" },
  { time: "10:30 - 11:15", type: "Green Flag", title: "Main Presentation 1: Tech Keynote", detail: "Deep dive into cloud architecture and community building.", isPit: false, flag: "green" },
  { time: "11:15 - 11:30", type: "Safety Car", title: "Short Networking Break", detail: "Quick pit stop to refuel and network.", isPit: false, flag: "yellow" },
  { time: "11:30 - 12:30", type: "Green Flag", title: "Parallel Presentation Sessions", detail: "Multiple technical tracks covering cloud, AI, and DevOps.", isPit: false, flag: "green" },
  { time: "12:30 - 13:30", type: "Pit Lane", title: "Lunch Break & Company Networking", detail: "Refuel, change tires, and network with fellow constructors.", isPit: true, flag: "red" },
  { time: "13:30 - 15:00", type: "Green Flag", title: "Practical Hands-on Workshops", detail: "Building responsive cloud and AI systems entirely hands-on.", isPit: false, flag: "green" },
  { time: "15:00 - 15:15", type: "Safety Car", title: "Short Afternoon Break", detail: "Cool down the engines.", isPit: false, flag: "yellow" },
  { time: "15:15 - 16:00", type: "Green Flag", title: "Industry Panel Discussion", detail: "Insights from tech leaders and cloud professionals.", isPit: false, flag: "green" },
  { time: "16:00 - 16:45", type: "Green Flag", title: "Student Project Exhibition & High-Tea", detail: "Showcase of innovative student-built cloud projects.", isPit: false, flag: "green" },
  { time: "16:45 - 17:30", type: "Chequered Flag", title: "Closing Ceremony & Group Photo", detail: "Trophies, prizes, and grand finale.", isPit: false, flag: "gray" },
  { time: "17:30 - 18:30", type: "Race End", title: "Final Pack-up & Decommissioning", detail: "Collection of digital feedback forms from students, packing up sponsor banners and table setups, saving media files, and handing back cleared college facilities.", isPit: false, flag: "red" },
];

const getFlagColors = (flag: string) => {
  switch (flag) {
    case 'red': return 'bg-[#E10600]/10 text-[#E10600] border-[#E10600]/20';
    case 'green': return 'bg-[#00ff00]/10 text-[#00ff00] border-[#00ff00]/20';
    case 'yellow': return 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20';
    default: return 'bg-white/5 text-white/50 border-white/10';
  }
};

export const TimelineSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Add physics-based smoothing to the scroll progress to prevent fast flicking
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  // To interpolate smoothly, Framer Motion requires the exact same string structure.
  // We use "calc(0% + 0vw)" and "calc(-100% + 100vw)" so it can interpolate the numbers.
  const x = useTransform(smoothProgress, [0, 1], ["calc(0% + 0vw)", "calc(-100% + 100vw)"]);

  // Calculate current visible card index for progress indicator
  const progressLabel = useTransform(smoothProgress, [0, 1], [1, schedule.length]);
  const displayLabel = useTransform(progressLabel, (v) => Math.round(v));

  return (
    <section id="schedule" ref={targetRef} className="relative h-[350vh] bg-[#050505]">
      {/* Sticky container locks to screen while we scroll the 500vh */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        
        {/* Giant background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="font-sans font-black italic uppercase text-[20vw] leading-none text-white/[0.02] tracking-tighter whitespace-nowrap">
            RACE DAY
          </span>
        </div>

        {/* Header - Fixed inside sticky container */}
        <div className="absolute top-0 left-0 w-full px-4 sm:px-12 lg:px-24 pt-12 sm:pt-16 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <SectionHeader
              title="Event Agenda"
              subtitle="Twelve sectors. One full day on the cloud racing calendar — from opening lights to the final chequered flag."
              sysId="02.STRAT"
            />
          </div>
        </div>

        {/* Track Line & Scrolling Content */}
        <div className="relative w-full h-[500px] flex items-center mt-20">
          
          {/* Faint Horizontal Line spanning across the whole viewport */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/20 z-0" />

          {/* Animated Flex Container that translates left */}
          <motion.div 
            style={{ x }} 
            className="flex items-center gap-0 px-[10vw] sm:px-[15vw] relative z-10 w-[max-content] h-full"
          >
            {schedule.map((slot, i) => {
              // Alternating cards
              const isTop = i % 2 !== 0;

              return (
                <div key={i} className="flex-shrink-0 relative h-full flex justify-center" style={{ width: 'clamp(320px, 25vw, 400px)' }}>
                  
                  {/* The Dot centered vertically exactly on the line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#050505] border-[2px] border-white/50 z-20" />

                  {/* The Card */}
                  <div className={`absolute w-[85%] flex flex-col p-6 bg-[#0a0a0a] border border-white/5 shadow-2xl shadow-black/50 group transition-all duration-300 ${slot.isPit ? 'hover:bg-[#E10600]/10 hover:border-[#E10600]/50' : 'hover:bg-white/[0.05] hover:border-[#FF9900]/50'} ${isTop ? 'bottom-[calc(50%+2rem)]' : 'top-[calc(50%+2rem)]'}`}>
                    
                    {/* Background Number */}
                    <div className="absolute -right-2 -bottom-2 font-sans font-black italic text-7xl text-white/[0.02] group-hover:text-white/[0.05] transition-colors pointer-events-none select-none">
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Header Row: Time and Badge */}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className={`font-mono text-sm sm:text-base font-bold tracking-tighter ${slot.isPit ? 'text-[#E10600]' : 'text-aws-orange'}`}>
                        {slot.time}
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-sm border ${getFlagColors(slot.flag)}`}>
                        {slot.type}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-sm font-sans font-black italic uppercase tracking-wider text-white mb-2 leading-tight relative z-10">
                      {slot.title}
                      {slot.isPit && (
                        <span className="ml-2 text-[8px] text-[#E10600] tracking-widest uppercase">
                          [PIT STOP]
                        </span>
                      )}
                    </div>

                    {/* Detail */}
                    <div className="text-[10px] font-sans opacity-50 uppercase leading-relaxed relative z-10">
                      {slot.detail}
                    </div>
                  </div>

                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Progress indicator & Scroll Note */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
          <motion.div className="flex items-center gap-3 bg-[#111]/80 backdrop-blur-sm border border-white/5 px-4 py-2">
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Sector</span>
            <motion.span className="font-mono text-sm text-aws-orange font-bold">
              {displayLabel}
            </motion.span>
            <span className="font-mono text-[10px] text-white/20">/ {schedule.length}</span>
          </motion.div>
          <span className="font-mono text-[8px] sm:text-[9px] text-white/30 uppercase tracking-widest animate-pulse">
            Scroll vertically to navigate ↓
          </span>
        </div>
      </div>
    </section>
  );
};
