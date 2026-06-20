import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { SectionHeader } from './LayoutElements';

const schedule = [
  { time: "09:00 - 10:00", type: "Pit Lane", title: "Registration, Networking & Breakfast", detail: "Check-in, attendee networking, sponsor booths", isPit: true, flag: "red" },
  { time: "10:00 - 10:15", type: "Lights Out", title: "Opening Ceremony", detail: "Event inauguration", isPit: false, flag: "gray" },
  { time: "10:15 - 10:25", type: "Formation Lap", title: "Welcome Note", detail: "AWS Student Builder Group Dhule", isPit: false, flag: "gray" },
  { time: "10:25 - 10:45", type: "Green Flag", title: "Community Keynote", detail: "Community growth, opportunities, certifications", isPit: false, flag: "green" },
  { time: "10:45 - 11:30", type: "Green Flag", title: "Technical Keynote", detail: "AWS Cloud, Containers, Serverless, Databases, AI & Career Opportunities", isPit: false, flag: "green" },
  { time: "11:30 - 12:00", type: "Green Flag", title: "Tech Session 1", detail: "AWS Compute Services (EC2, Lambda, ECS, EKS)", isPit: false, flag: "green" },
  { time: "12:00 - 12:30", type: "Green Flag", title: "Tech Session 2", detail: "AWS Storage & Databases (S3, RDS, DynamoDB)", isPit: false, flag: "green" },
  { time: "12:30 - 12:45", type: "Safety Car", title: "Fun Activities", detail: "Quiz, Kahoot, giveaways", isPit: false, flag: "yellow" },
  { time: "12:45 - 14:00", type: "Pit Lane", title: "Lunch & Networking", detail: "Networking with speakers and attendees", isPit: true, flag: "red" },
  { time: "14:00 - 14:30", type: "Green Flag", title: "Tech Session 3", detail: "DevOps on AWS (CI/CD, IaC, Automation)", isPit: false, flag: "green" },
  { time: "14:30 - 15:00", type: "Green Flag", title: "Tech Session 4", detail: "Generative AI with AWS (Amazon Bedrock, Amazon Q)", isPit: false, flag: "green" },
  { time: "15:00 - 15:30", type: "Green Flag", title: "Tech Session 5", detail: "Cloud Security on AWS (IAM, WAF, GuardDuty, Security Best Practices)", isPit: false, flag: "green" },
  { time: "15:30 - 15:45", type: "Safety Car", title: "Fun Activities", detail: "AI challenge, rapid-fire quiz, swag distribution", isPit: false, flag: "yellow" },
  { time: "15:45 - 16:30", type: "Green Flag", title: "Panel Discussion", detail: "Careers, Community, Certifications & Industry Insights", isPit: false, flag: "green" },
  { time: "16:30 - 16:40", type: "Formation Lap", title: "Sponsor & Community Announcements", detail: "Community partners, upcoming programs", isPit: false, flag: "gray" },
  { time: "16:40 - 16:50", type: "Chequered Flag", title: "Concluding Session", detail: "Vote of Thanks by SBG Volunteers", isPit: false, flag: "gray" },
  { time: "16:50 - 17:00", type: "Race End", title: "Group Photo & Networking", detail: "Speakers, organizers, attendees", isPit: false, flag: "red" },
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
  
  // Track scroll progress of this specific section (Desktop only)
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Add physics-based smoothing to the scroll progress to prevent fast flicking
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001
  });

  // Interpolate scroll mapping for horizontal translation
  const x = useTransform(smoothProgress, [0, 1], ["calc(0% + 0vw)", "calc(-100% + 100vw)"]);

  return (
    <>
      {/* 1. Desktop Layout (Connected to Scroll Progress) */}
      <section id="schedule" ref={targetRef} className="hidden lg:block relative h-[800vh] bg-[#050505] border-b border-white/5">
        {/* Sticky container locks to screen while we scroll */}
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
                subtitle="A day full of exciting sessions and activities. Don't miss out!"
                sysId="03.STRAT"
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
                const isTop = i % 2 !== 0;

                return (
                  <div key={i} className="flex-shrink-0 relative h-full flex justify-center" style={{ width: 'clamp(320px, 25vw, 400px)' }}>
                    
                    {/* Dot centered vertically exactly on the line */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#050505] border-[2px] border-white/50 z-20" />

                    {/* The Card */}
                    <div className={`absolute w-[85%] min-h-[170px] flex flex-col p-6 bg-[#0a0a0a] border border-white/5 shadow-2xl shadow-black/50 group transition-all duration-300 ${
                      slot.isPit ? 'hover:bg-[#E10600]/10 hover:border-[#E10600]/50' : 'hover:bg-white/[0.05] hover:border-[#FF9900]/50'
                    } ${isTop ? 'bottom-[calc(50%+2rem)]' : 'top-[calc(50%+2rem)]'}`}>
                      
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

        </div>
      </section>

      {/* 2. Mobile/Tablet Layout (Independent Horizontal Swipe) */}
      <div id="schedule-mobile" className="lg:hidden relative py-20 px-4 bg-[#050505] overflow-hidden border-b border-white/5">
        {/* Giant background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="font-sans font-black italic uppercase text-[24vw] leading-none text-white/[0.01] tracking-tighter whitespace-nowrap">
            RACE DAY
          </span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col">
          <SectionHeader
            title="Race Weekend Timeline"
            subtitle="Twelve sectors. One full day on the cloud racing calendar — from opening lights to the final chequered flag."
            sysId="03.STRAT"
          />

          {/* Swipe Indicator Note */}
          <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-aws-orange tracking-widest uppercase animate-pulse">
            <span>Swipe horizontally to navigate timeline</span>
            <span className="text-xs">➔</span>
          </div>

          {/* Swipe Track Wrapper */}
          <div className="relative w-full overflow-hidden mt-8">
            {/* Timeline line behind elements */}
            <div className="absolute left-0 right-0 top-[26px] h-[1px] bg-white/10 z-0" />

            {/* Horizontal overflow grid */}
            <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-6 pb-6 px-4 -mx-4 z-10 relative no-scrollbar">
              {schedule.map((slot, i) => (
                <div key={i} className="w-[285px] shrink-0 snap-center relative flex flex-col pt-10 group">
                  {/* Timeline node dot centered exactly on the line */}
                  <div className="absolute top-[26px] left-8 -translate-y-1/2 w-3 h-3 rounded-full bg-[#050505] border-[2px] border-aws-orange group-hover:bg-aws-orange transition-colors z-20" />

                  {/* Card */}
                  <div className={`w-full min-h-[160px] flex flex-col p-5 bg-[#0a0a0a] border border-white/5 shadow-xl transition-all duration-300 rounded-xl relative ${
                    slot.isPit ? 'hover:bg-[#E10600]/10 hover:border-[#E10600]/40' : 'hover:bg-white/[0.03] hover:border-aws-orange/40'
                  }`}>
                    {/* Background Number */}
                    <div className="absolute -right-2 -bottom-2 font-sans font-black italic text-6xl text-white/[0.01] group-hover:text-white/[0.03] transition-colors pointer-events-none select-none">
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    {/* Header Row: Time and Badge */}
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className={`font-mono text-xs font-bold tracking-tighter ${slot.isPit ? 'text-[#E10600]' : 'text-aws-orange'}`}>
                        {slot.time}
                      </span>
                      <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-sm border ${getFlagColors(slot.flag)}`}>
                        {slot.type}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="text-xs sm:text-sm font-sans font-black italic uppercase tracking-wider text-white mb-2 leading-tight relative z-10">
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
