import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Briefcase, Lightbulb, Wrench, Gift, Award, Star, Utensils } from 'lucide-react';

const benefits = [
  { 
    id: '01', 
    title: 'Career Opportunities', 
    desc: 'Internships, networking, and industry connections.',
    className: 'md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-aws-orange/10 to-[#050505] hover:from-aws-orange/20 border-white/10 hover:border-aws-orange/50',
    icon: Briefcase,
    largeText: true
  },
  { 
    id: '02', 
    title: 'Expert Sessions', 
    desc: 'Learn from AWS and industry leaders.',
    className: 'md:col-span-1 lg:col-span-2 lg:row-span-1 bg-[#111] border-white/5 hover:border-white/20',
    icon: Lightbulb
  },
  { 
    id: '03', 
    title: 'Hands-on Workshops', 
    desc: 'Cloud, AI, DevOps, and Serverless labs.',
    className: 'md:col-span-1 lg:col-span-1 lg:row-span-1 bg-[#0a0a0a] border-white/5 hover:border-white/20',
    icon: Wrench
  },
  { 
    id: '04', 
    title: 'AWS Credits & Prizes', 
    desc: 'Win rewards, vouchers, and giveaways.',
    className: 'md:col-span-1 lg:col-span-1 lg:row-span-1 bg-[#0a0a0a] border-white/5 hover:border-white/20',
    icon: Gift
  },
  { 
    id: '05', 
    title: 'Exclusive Swag', 
    desc: 'Premium event merchandise and goodies.',
    className: 'md:col-span-1 lg:col-span-2 lg:row-span-1 bg-gradient-to-r from-[#111] to-[#0a0a0a] border-white/5 hover:border-white/20',
    icon: Star
  },
  { 
    id: '06', 
    title: 'Participation Certificate', 
    desc: 'Verified digital certificate for attendees.',
    className: 'md:col-span-1 lg:col-span-1 lg:row-span-1 bg-[#111] border-white/5 hover:border-white/20',
    icon: Award
  },
  { 
    id: '07', 
    title: 'Food & Networking', 
    desc: 'Meals, refreshments, and community connections.',
    className: 'md:col-span-1 lg:col-span-1 lg:row-span-1 bg-[#0a0a0a] border-white/5 hover:border-white/20',
    icon: Utensils
  }
];

export const GridSection = () => {
  return (
    <section id="about" className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24">
      <div className="w-full relative z-10 flex flex-col">
        <div className="sticky top-0 z-30 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-transparent backdrop-blur-[8px] pt-10 sm:pt-12 lg:pt-16 pb-8 -mt-10 sm:-mt-12 lg:-mt-16 mb-0">
          <SectionHeader title="About The Event" subtitle="" sysId="01.ABT" />
        </div>
        <div className="flex flex-col gap-4 lg:gap-8">
          {/* Left — Impact statement */}
          <div className="max-w-4xl">
            <p className="font-sans text-xs sm:text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-xl mb-8 -mt-2">
              AWS Student Community Day Dhule 2026 is North Maharashtra's flagship student-led cloud summit designed to empower the next generation of builders and innovators.
            </p>
            <p className="font-sans text-base sm:text-lg text-white/70 leading-relaxed mb-6">
              The event creates a collaborative platform where students, AWS communities, developers, startups, and 
              industry professionals come together to <span className="text-aws-orange font-bold">learn</span>, <span className="text-f1-red font-bold">network</span>, and <span className="text-white font-bold">showcase innovation</span>.
            </p>
            <p className="font-sans text-sm sm:text-base text-white/50 leading-relaxed mb-8">
              From hands-on cloud workshops and AI demos to student project showcases and industry panels — 
              this full-day experience is designed to bridge the gap between classroom learning and real-world cloud engineering.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Cloud Computing", "DevOps", "AI/ML", "Serverless", "Networking"].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-[#111] border border-white/5 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white/50 hover:text-aws-orange hover:border-aws-orange/30 transition-colors cursor-default rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bento Grid Benefits Section */}
        <div className="mt-16 sm:mt-24 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
            <div className="max-w-2xl">
              <h3 className="font-sans text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tighter mb-3">
                What You'll Experience
              </h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                A comprehensive student experience crafted to accelerate your growth, validate your skills, and connect you with the tech ecosystem.
              </p>
            </div>
            <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-8 mb-4"></div>
          </div>

          {/* Modern 2026 Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5, type: 'spring', bounce: 0.3 }}
                  className={`border rounded-3xl p-6 sm:p-8 flex flex-col overflow-hidden transition-all duration-300 group ${benefit.className}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-aws-orange/10 group-hover:text-aws-orange transition-colors duration-300 shadow-inner">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-black italic text-white/10 group-hover:text-white/20 transition-colors">
                      {benefit.id}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    <h4 className={`font-sans font-black italic uppercase text-white tracking-tight mb-2 group-hover:text-aws-orange transition-colors duration-300 ${benefit.largeText ? 'text-2xl sm:text-4xl leading-tight' : 'text-lg sm:text-xl'}`}>
                      {benefit.title}
                    </h4>
                    
                    <p className={`font-sans text-white/50 leading-relaxed group-hover:text-white/70 transition-colors duration-300 ${benefit.largeText ? 'text-base sm:text-lg max-w-sm' : 'text-sm'}`}>
                      {benefit.desc}
                    </p>
                  </div>
                  
                  {/* Subtle shine effect for large cards */}
                  {benefit.largeText && (
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-0 group-hover:opacity-[0.03] rounded-full blur-[100px] transition-opacity duration-700 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
