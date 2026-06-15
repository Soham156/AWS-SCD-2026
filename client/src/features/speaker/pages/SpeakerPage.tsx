import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cloud, Server, Database, Shield, Zap, TrendingUp, Code, Rocket, BrainCircuit, Bot, HardDrive, Cpu, Mic, Users, Award, Star, Share2, Handshake, BadgeCheck, Globe, Volume2, Search, Target, CheckCircle2 } from 'lucide-react';
import { SpeakerForm } from '../components/SpeakerForm';
import { PartnerForm } from '../components/PartnerForm';

export const SpeakerPage = () => {
  const [activeTab, setActiveTab] = useState<'speaker' | 'partner'>('speaker');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tracks = [
    { name: 'Cloud Computing', icon: Cloud },
    { name: 'AWS Architecture', icon: Server },
    { name: 'Serverless', icon: Zap },
    { name: 'Containers & Kubernetes', icon: Database },
    { name: 'DevOps', icon: HardDrive },
    { name: 'Generative AI', icon: BrainCircuit },
    { name: 'Machine Learning', icon: Bot },
    { name: 'Security', icon: Shield },
    { name: 'Data Engineering', icon: Cpu },
    { name: 'Career Growth', icon: TrendingUp },
    { name: 'Open Source', icon: Code },
    { name: 'Startup Journey', icon: Rocket }
  ];

  const speakerBenefits = [
    { title: "Speaker Certificate", desc: "Receive an official certificate of appreciation from AWS.", icon: Award },
    { title: "Event Branding", desc: "Prominent highlight in our conference schedule and programs.", icon: Star },
    { title: "Social Promotion", desc: "Dedicated digital flyer highlighting your profile on all social networks.", icon: Share2 },
    { title: "Premium Networking", desc: "Exclusive access to VIP networking lunches with core experts.", icon: Users },
    { title: "Community Recognition", desc: "Stand out as a key contributor to North Maharashtra's tech space.", icon: CheckCircle2 },
    { title: "Full Access Pass", desc: "Complimentary VIP entrance to all tracks and key exhibition slots.", icon: BadgeCheck }
  ];

  const partnerBenefits = [
    { title: "Logo Placement", desc: "Your logo displayed on our official event websites and rollups.", icon: BadgeCheck },
    { title: "Website Recognition", desc: "Direct backlink reference to your organization's homepage.", icon: Globe },
    { title: "Social Media Mentions", desc: "Dedicated announcement posts across all active handles.", icon: Volume2 },
    { title: "Speaker Recommendations", desc: "Fast-track priority evaluation for speakers from your group.", icon: Mic },
    { title: "VIP Networking", desc: "Lunches and discussions with core partners and sponsors.", icon: Handshake },
    { title: "Visibility Boost", desc: "Direct outreach opportunity for college clubs and developer circles.", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative">
      
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] rounded-full blur-[150px] opacity-[0.05] pointer-events-none transition-colors duration-1000 ${activeTab === 'speaker' ? 'bg-aws-orange' : 'bg-blue-500'}`} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 sm:px-12 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-xs uppercase tracking-widest">Back to Home</span>
        </Link>
        <div className="font-sans font-black italic text-xl uppercase tracking-tighter">
          AWS SCD <span className="text-aws-orange">DHULE</span>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4 sm:px-12 lg:px-24 max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="font-mono text-[10px] text-white/50 uppercase tracking-[0.3em] mb-4">
            Call For Proposals
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight mb-6">
            Speaker Application &<br />
            <span className={activeTab === 'partner' ? 'text-blue-400' : 'text-white'}>Community Partnerships</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Become a speaker to inspire developers, or link your tech community to co-host one of North Maharashtra's premier events.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button
            onClick={() => setActiveTab('speaker')}
            className={`px-8 py-4 font-mono text-sm uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'speaker' 
                ? 'bg-aws-orange text-black border-aws-orange font-bold' 
                : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
            }`}
          >
            <Mic size={18} /> Apply as Speaker
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`px-8 py-4 font-mono text-sm uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
              activeTab === 'partner' 
                ? 'bg-blue-500 text-black border-blue-500 font-bold' 
                : 'bg-transparent text-white/50 border-white/10 hover:border-white/30'
            }`}
          >
            <Users size={18} /> Become Community Partner
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Form Column (Left 8 cols) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'speaker' ? (
                <motion.div
                  key="speaker"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">Call For Papers (CFP)</h2>
                    <p className="text-white/60">Deliver a talk, share a deployment case study, or lead a cloud workshop.</p>
                  </div>
                  <SpeakerForm />
                </motion.div>
              ) : (
                <motion.div
                  key="partner"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">Become a Community Partner</h2>
                    <p className="text-white/60">Register your user group, developer circle, or student club to join co-marketing outreach.</p>
                  </div>
                  <PartnerForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar (Right 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            
            {/* dynamic Sidebar Content based on active tab */}
            <AnimatePresence mode="wait">
              {activeTab === 'speaker' ? (
                <motion.div
                  key="speaker-sidebar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-12"
                >
                  {/* Tracks */}
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-aws-orange mb-4 border-b border-white/10 pb-2">Conference Tracks</h3>
                    <p className="text-white/50 text-sm mb-4">Review our focus technical domains to align your proposals.</p>
                    <div className="flex flex-wrap gap-2">
                      {tracks.map(t => (
                        <span key={t.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/10 text-xs font-mono text-white/70">
                          <t.icon size={12} className="text-aws-orange" /> {t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Speaker Benefits */}
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-aws-orange mb-4 border-b border-white/10 pb-2">Speaker Benefits</h3>
                    <p className="text-white/50 text-sm mb-4">Why you should take the stage at AWS Student Community Day.</p>
                    <div className="flex flex-col gap-4">
                      {speakerBenefits.map(b => (
                        <div key={b.title} className="flex gap-3 items-start">
                          <div className="p-2 bg-aws-orange/10 rounded-sm mt-1">
                            <b.icon size={16} className="text-aws-orange" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{b.title}</h4>
                            <p className="text-xs text-white/50 leading-relaxed mt-0.5">{b.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="partner-sidebar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-12"
                >
                  {/* Partner Benefits */}
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-blue-400 mb-4 border-b border-white/10 pb-2">Community Partner Benefits</h3>
                    <p className="text-white/50 text-sm mb-4">Access support, network, and grow together as one unified cloud ecosystem.</p>
                    <div className="flex flex-col gap-4">
                      {partnerBenefits.map(b => (
                        <div key={b.title} className="flex gap-3 items-start">
                          <div className="p-2 bg-blue-500/10 rounded-sm mt-1">
                            <b.icon size={16} className="text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{b.title}</h4>
                            <p className="text-xs text-white/50 leading-relaxed mt-0.5">{b.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global FAQ Sidebar */}
            <div>
              <h3 className="text-xl font-black italic uppercase text-white mb-4 border-b border-white/10 pb-2">Frequently Asked Questions</h3>
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Who can submit a CFP?</h4>
                  <p className="text-xs text-white/50 leading-relaxed">Any student, developer, academic professional, AWS expert, startup founder, or technology enthusiast. We value practical learning and project demonstrations!</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Can beginners submit proposals?</h4>
                  <p className="text-xs text-white/50 leading-relaxed">Absolutely! We welcome speakers of all experience levels and maintain Beginner (100) session slots dedicated specifically to students explaining foundational concepts.</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">Will travel/accommodation costs be covered?</h4>
                  <p className="text-xs text-white/50 leading-relaxed">AWS Student Community Day is a non-profit, student-driven conference. Standard local travel allowances or support accommodations are evaluated on a case-by-case basis.</p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">How long are the sessions?</h4>
                  <p className="text-xs text-white/50 leading-relaxed">We support 20-minute lightning sessions, 30-minute standard slides+demos, and 45-minute architectural deep dives. Select the duration that best fits your technical scope.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-8 px-6 text-center">
        <p className="text-white/40 text-xs mb-2">© 2026 AWS Student Community Day Dhule. All rights reserved.</p>
        <p className="text-white/20 text-[10px]">Organized by student volunteers at SVKM's Institute of Technology.</p>
      </footer>

    </div>
  );
};
