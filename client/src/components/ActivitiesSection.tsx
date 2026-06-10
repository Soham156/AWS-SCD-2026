import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Target } from 'lucide-react';

const activities = [
    "Cloud Sprint Labs",
    "AI Grand Prix",
    "DevOps Pit Challenge",
    "Serverless Speedrun",
    "Student Project Showcase",
    "Networking Pit Stop",
    "Industry Panel Discussions",
    "Hands-on AWS Workshops"
];

export const ActivitiesSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <SectionHeader title="Race Events" subtitle="Explore a variety of high-octane events tailored for cloud developers, AI enthusiasts, and DevOps engineers." sysId="04.ACT" />
      
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`flex flex-col gap-4 sm:gap-6 bg-[#111] p-5 sm:p-8 border border-white/5 hover:border-aws-orange/50 transition-all group overflow-hidden relative`}
          >
            <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-5 font-mono text-4xl sm:text-6xl font-black group-hover:opacity-10 transition-opacity">{(i+1).toString().padStart(2, '0')}</div>
            <div className="bg-white/5 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center border border-white/10 group-hover:bg-aws-orange/10 group-hover:border-aws-orange/30 transition-colors relative z-10">
              <Target size={20} className="text-white group-hover:text-aws-orange transition-colors sm:hidden" />
              <Target size={24} className="text-white group-hover:text-aws-orange transition-colors hidden sm:block" />
            </div>
            <div className="text-base sm:text-xl font-sans font-black italic uppercase text-white tracking-wider sm:tracking-widest border-t border-white/5 pt-3 sm:pt-4 group-hover:border-aws-orange/30 transition-colors relative z-10 leading-tight">{activity}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
