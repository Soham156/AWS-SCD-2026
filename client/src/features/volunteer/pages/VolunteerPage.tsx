import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Award, ShieldAlert, Sparkles, Coffee, Briefcase, Zap } from 'lucide-react';
import { VolunteerForm } from '../components/VolunteerForm';

export const VolunteerPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    { title: "Certificate of Appreciation", desc: "Receive an official volunteer certificate from the AWS Student Builder Group.", icon: Award },
    { title: "Volunteer Exclusive Swags", desc: "Get special volunteer badges and goodies on race day.", icon: Sparkles },
    { title: "Direct Networking", desc: "Connect closely with AWS experts, industry speakers, and student community leaders.", icon: Heart },
    { title: "Event Meals & Refreshments", desc: "Stay fueled with complimentary lunch, high-tea, and refreshments throughout the event.", icon: Coffee },
    { title: "Hands-on Management", desc: "Work behind the scenes, learn logistics, crowd control, and event coordination.", icon: Briefcase },
    { title: "Community Standing", desc: "Be recognized as a vital contributor to North Maharashtra's largest cloud conference.", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-aws-orange rounded-full blur-[150px] opacity-[0.05] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-white/5 py-4 px-6 sm:px-12 flex justify-between items-center">
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
            Join The Race Control Crew
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight mb-6">
            Volunteer <span className="text-aws-orange">Registration</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Become a core driver behind AWS Student Community Day Dhule 2026. Apply to volunteer and help shape an incredible tech experience for over 1000+ builders.
          </p>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Form Column (Left 7 cols) */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">Volunteer Application</h2>
              <p className="text-white/60">Fill in your verified ticket details to submit your application.</p>
            </div>
            <VolunteerForm />
          </div>

          {/* Sidebar (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            
            {/* Policy Caution Box */}
            <div className="bg-[#E10600]/5 border border-[#E10600]/20 p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E10600]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 text-[#E10600] font-sans font-black italic text-lg uppercase tracking-tight">
                <ShieldAlert size={20} />
                Volunteer Policy
              </div>
              <ul className="space-y-3.5 text-white/70 text-xs sm:text-sm font-sans leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] mt-1">•</span>
                  <span>Volunteering for AWS Student Community Day Dhule 2026 <strong>does not include a complimentary event ticket</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] mt-1">•</span>
                  <span><strong>Every volunteer must purchase a valid event pass</strong> to participate.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] mt-1">•</span>
                  <span>Applications without a valid ticket purchase will <strong>not be considered</strong> (automatically verified via email lookup).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] mt-1">•</span>
                  <span>Volunteer selection is subject to review by the organizing team and submitting this form does <strong>not guarantee selection</strong>.</span>
                </li>
              </ul>
            </div>

            {/* Benefits Card */}
            <div className="bg-[#111] border border-white/5 p-6 sm:p-8">
              <h3 className="font-sans font-black italic text-xl uppercase tracking-tight text-white mb-6 border-b border-white/10 pb-3">
                Volunteer Perks & Benefits
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {benefits.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-aws-orange shrink-0 group-hover:bg-aws-orange group-hover:text-black transition-all">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1 group-hover:text-aws-orange transition-colors">{item.title}</h4>
                      <p className="text-white/50 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
