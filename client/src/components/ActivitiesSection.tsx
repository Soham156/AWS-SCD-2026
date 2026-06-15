import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Cloud, Bot, Wrench, Rocket, Presentation, Coffee, Users, BookOpen } from 'lucide-react';

const activities = [
    { title: "Cloud Sprint Labs", desc: "Build and deploy cloud infrastructure in a timed sprint challenge.", icon: Cloud, accent: "border-l-aws-orange" },
    { title: "AI Grand Prix", desc: "Compete in AI model building races with real-time leaderboards.", icon: Bot, accent: "border-l-f1-red" },
    { title: "DevOps Pit Challenge", desc: "Fix broken CI/CD pipelines under pressure — fastest team wins.", icon: Wrench, accent: "border-l-[#00ff00]" },
    { title: "Serverless Speedrun", desc: "Deploy serverless applications in record time using AWS Lambda.", icon: Rocket, accent: "border-l-aws-orange" },
    { title: "Student Project Showcase", desc: "Present your projects to judges and win recognition.", icon: Presentation, accent: "border-l-f1-red" },
    { title: "Networking Pit Stop", desc: "Connect with industry professionals and fellow builders.", icon: Coffee, accent: "border-l-white/30" },
    { title: "Industry Panel Discussions", desc: "Hear insights from tech leaders on cloud careers and trends.", icon: Users, accent: "border-l-[#00ff00]" },
    { title: "Hands-on AWS Workshops", desc: "Guided workshops on AWS services from beginner to advanced.", icon: BookOpen, accent: "border-l-aws-orange" },
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
            className={`flex flex-col gap-4 sm:gap-5 bg-[#111] p-5 sm:p-6 border border-white/5 border-l-2 ${activity.accent} hover:border-white/20 hover:bg-[#151515] transition-all group overflow-hidden relative`}
          >
            <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-5 font-mono text-4xl sm:text-6xl font-black group-hover:opacity-10 transition-opacity">{(i+1).toString().padStart(2, '0')}</div>
            <div className="bg-white/5 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-white/10 group-hover:bg-aws-orange/10 group-hover:border-aws-orange/30 transition-colors relative z-10">
              <activity.icon size={20} className="text-white/60 group-hover:text-aws-orange transition-colors" />
            </div>
            <div className="relative z-10">
              <div className="text-sm sm:text-base font-sans font-black italic uppercase text-white tracking-wider mb-2 leading-tight">{activity.title}</div>
              <p className="font-sans text-[11px] sm:text-xs text-white/40 leading-relaxed">{activity.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
