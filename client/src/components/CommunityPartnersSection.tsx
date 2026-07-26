import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';

interface Partner {
  name: string;
  type: string;
  description: string;
  logo: string;
  color: string;
  borderColor: string;
  glowColor: string;
  logoScale?: string;
}

const partners: Partner[] = [
  {
    name: "AWS User Group Nashik",
    type: "Community Partner",
    description: "Empowering developers and cloud builders across the Nashik region through hands-on technical sessions and meetups.",
    logo: "/Partners/AWSCMDWhite2023.png",
    color: "text-aws-orange",
    borderColor: "hover:border-aws-orange/40",
    glowColor: "hover:shadow-[0_0_30px_rgba(255,153,0,0.1)]",
  },
  {
    name: "AWS User Group Mumbai",
    type: "Community Partner",
    description: "Connecting cloud enthusiasts, developers, and enterprises in Mumbai through active learning, networking, and expert-led sessions.",
    logo: "/Partners/LOGO-1-BG-REMOVE.png",
    color: "text-blue-400",
    borderColor: "hover:border-blue-400/40",
    glowColor: "hover:shadow-[0_0_30px_rgba(96,165,250,0.1)]",
    logoScale: "scale-[1.35] group-hover:scale-[1.42]",
  },
  {
    name: "AWS Student Builder Group at GHRCEM, Jalgaon",
    type: "Student Community Partner",
    description: "Fostering campus innovation, cloud-first learning, and developer collaborations at G. H. Raisoni College of Engineering and Management, Jalgaon.",
    logo: "/Partners/GHR-SBG.png",
    color: "text-[#00ff00]",
    borderColor: "hover:border-[#00ff00]/40",
    glowColor: "hover:shadow-[0_0_30px_rgba(0,255,0,0.1)]",
  }
];

export const CommunityPartnersSection = () => {
  return (
    <section id="community-partners" className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] border-t border-white/5 overflow-hidden" aria-label="Community Partners">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808002_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-f1-red/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <SectionHeader
            title="Community Partners"
            subtitle="Collaborating with prominent developer groups, student chapters, and technology networks to accelerate cloud learning and foster regional talent."
            sysId="06.PRT"
          />
        </div>

        {/* Grid of Partners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {partners.map((partner, i) => {
            return (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative bg-[#0d0d0d] border border-white/5 transition-all duration-500 rounded-xl overflow-hidden group flex flex-col justify-between h-full ${partner.borderColor} ${partner.glowColor}`}
              >
                {/* Cyberpunk Scanner Line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${partner.color}`} />
                
                {/* Tech Corners */}
                <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-white/10 group-hover:border-white/30 transition-colors" />
                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 border-b border-l border-white/10 group-hover:border-white/30 transition-colors" />

                <div className="flex flex-col items-stretch relative z-10 h-full">
                  {/* Big Logo Frame */}
                  <div className="w-full h-36 sm:h-44 bg-[#090909] flex items-center justify-center p-6 border-b border-white/5 relative overflow-hidden group-hover:bg-[#111] transition-all duration-500">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                    <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className={`max-w-[85%] max-h-[80%] object-contain opacity-75 group-hover:opacity-100 transition-all duration-500 relative z-10 ${partner.logoScale || "group-hover:scale-105"}`}
                    />
                  </div>

                  {/* Text Details */}
                  <div className="p-6 flex flex-col text-left flex-1 justify-start">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2 font-bold block">
                      {partner.type}
                    </span>
                    <h3 className="font-sans font-black italic uppercase text-base sm:text-lg text-white group-hover:text-white transition-colors leading-tight mb-2.5 tracking-tight">
                      {partner.name}
                    </h3>
                    <p className="font-sans text-xs text-white/50 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
