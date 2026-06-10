import { motion } from 'motion/react';
import { SectionHeader, TelemetryData } from './LayoutElements';
import { Cpu, Globe, Activity } from 'lucide-react';

const gridItems = [
  { title: "Educate", desc: "Hands-on workshops, peer-led technical sessions, and cloud-focused learning experiences on AWS, DevOps, AI, and modern engineering.", icon: <Cpu className="text-aws-orange mb-6" size={36} />, telemetry: ["TRACK", "CORE COMPUTING"] },
  { title: "Connect", desc: "Bringing together students, AWS communities, mentors, startups, and industry professionals to build long-term networking and collaboration opportunities.", icon: <Globe className="text-f1-red mb-6" size={36} />, telemetry: ["NETWORK", "GLOBAL"] },
  { title: "Celebrate", desc: "Recognizing student innovation, project showcases, technical achievements, and the growing cloud ecosystem in North Maharashtra.", icon: <Activity className="text-gray-300 mb-6" size={36} />, telemetry: ["COMMUNITY", "BUILDERS"] },
];

export const GridSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24">
      <div className="w-full relative z-10 flex flex-col gap-12">
        
        <div>
           <SectionHeader title="The Grid" subtitle="AWS Student Community Day Dhule 2026 is North Maharashtra’s flagship student-led cloud summit designed to empower the next generation of builders and innovators. The event creates a collaborative platform where students, AWS communities, developers, startups, and industry professionals come together to learn, network, and showcase innovation." sysId="ABOUT.01" />
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 border-t border-white/5 pt-6 sm:pt-8">
              <TelemetryData label="EXPECTED ATTENDEES" value="400-500" color="text-white" />
              <TelemetryData label="STUDENT OUTREACH" value="4000+" color="text-aws-orange" />
              <TelemetryData label="TECH SPEAKERS" value="10+" color="text-f1-red" />
              <TelemetryData label="STAFF & SPONSORS" value="40+" color="text-white" />
           </div>
        </div>

        <div>
            <h2 className="font-sans font-black italic tracking-tighter uppercase text-xl sm:text-2xl text-white mb-4 sm:mb-6">Core Pillars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {gridItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="bg-[#111] border border-white/5 p-6 flex flex-col relative overflow-hidden group hover:border-aws-orange/50 transition-colors"
                >
                   <div className="text-[10px] text-aws-orange uppercase font-bold tracking-[0.2em] mb-4 border-b border-white/5 pb-2">Pillar /{i + 1}</div>
                   
                   <div className="flex items-center gap-4 mb-4">
                     {item.icon}
                     <h3 className="font-sans font-black italic text-xl text-white uppercase tracking-tighter">{item.title}</h3>
                   </div>
                   
                   <p className="font-sans text-white/60 text-sm mb-8 leading-relaxed flex-1">
                     {item.desc}
                   </p>
                   
                   <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                     <div className="border-l border-white/10 pl-3">
                       <div className="text-xs font-mono font-black text-white">{item.telemetry[1]}</div>
                       <div className="text-[9px] uppercase opacity-50">{item.telemetry[0]}</div>
                     </div>
                   </div>
                </motion.div>
              ))}
            </div>
        </div>
      </div>
    </section>
  )
}
