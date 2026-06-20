import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Mail, ArrowUpRight, Trophy, Users, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BecomeSponsorSection = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@aws-scd-dhule.tech");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section id="sponsors" className="relative py-20 sm:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] border-t border-white/5 overflow-hidden" aria-label="Become a Sponsor">
      {/* Background high-tech accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -top-1/4 right-0 w-[600px] h-[600px] bg-aws-orange/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-1/4 left-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Information & Details */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <SectionHeader
              title="Become a Sponsor"
              subtitle="Partner with one of North Maharashtra's largest student-driven cloud conferences. Empower regional talent, showcase your products, and connect with emerging cloud builders."
              sysId="04.SPN"
            />
            
            {/* Sponsoring Highlights / Benefits */}
            <div className="flex flex-col gap-5 mt-2">
              
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center shrink-0 mt-1">
                  <GraduationCap className="text-aws-orange" size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1">Empower Regional Talent</h4>
                  <p className="font-sans text-xs text-white/50 leading-relaxed">
                    Enable hands-on workshops, cloud engineering learning paths, and active developer projects for students in North Maharashtra.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center shrink-0 mt-1">
                  <Trophy className="text-aws-orange" size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1">Elevate Brand Visibility</h4>
                  <p className="font-sans text-xs text-white/50 leading-relaxed">
                    Gain high-impact exposure across digital platforms, stage backdrops, student badges, marketing flyers, and expo stall areas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center shrink-0 mt-1">
                  <Users className="text-aws-orange" size={20} />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-white text-sm uppercase tracking-wider mb-1">Direct Recruitment Pipeline</h4>
                  <p className="font-sans text-xs text-white/50 leading-relaxed">
                    Interact directly with top-tier student builders, developers, and cloud enthusiasts for hiring, internships, and mentoring.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: High-tech HUD Console Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c]/80 backdrop-blur-md overflow-hidden shadow-2xl"
            >
              {/* Racing orange accent bar */}
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-aws-orange to-red-600" />
              
              {/* Corner tech lines */}
              <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/20" />
              <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/20" />

              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-aws-orange block mb-2 font-bold">
                PARTNERSHIP CIRCUIT / SCD.2026
              </span>
              <h3 className="font-sans text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-6 italic">
                Sponsorship Console
              </h3>

              {/* Grid of Outreach Metrics */}
              <div className="grid grid-cols-2 gap-6 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-xl font-mono text-left">
                <div>
                  <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Target Outreach</span>
                  <span className="text-sm font-black text-white">4,000+ Students</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Expected Attendance</span>
                  <span className="text-sm font-black text-white">400+ Builders</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Key Topics</span>
                  <span className="text-sm font-black text-white">Cloud, AI, DevOps</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-white/40 block tracking-wider mb-1">Venue</span>
                  <span className="text-sm font-black text-white">SVKM's IOT, Dhule</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Link
                  to="/sponsors"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-10deg] transition-all hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,153,0,0.2)] cursor-pointer"
                >
                  <span className="skew-x-[10deg] flex items-center gap-1.5">
                    Apply to Sponsor <ArrowUpRight size={14} />
                  </span>
                </Link>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">or email us</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 text-white font-mono text-[10px] uppercase tracking-widest hover:border-white/30 hover:bg-white/10 transition-colors"
                >
                  <Mail size={12} className="text-aws-orange" />
                  {copiedEmail ? "Copied to clipboard!" : "info@aws-scd-dhule.tech"}
                </button>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

    </section>
  );
};
