import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Sparkles, Heart, Coffee, ShieldCheck, HelpCircle, AlertOctagon } from 'lucide-react';
import { MpdForm } from '../components/MpdForm';

export const MpdPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const requirements = [
    { title: "Female Opportunity Only", desc: "This panel moderator role is open exclusively to female builders to support and encourage women in tech.", icon: Heart },
    { title: "Paddock Pass Holder", desc: "Applicants must hold a valid paid ticket/pass for AWS Student Community Day Dhule 2026.", icon: ShieldCheck },
    { title: "Sleek Communication", desc: "Must be comfortable steering panel discussions, asking questions, and coordinating with speakers.", icon: Mic },
    { title: "Exclusive Event Access", desc: "Work directly with core organizing leads, panel speakers, and VIP cloud architects.", icon: Sparkles },
    { title: "Event Hospitality", desc: "Stay fully energized with high-quality lunch, high-tea, and credentials during the event.", icon: Coffee },
    { title: "Interview-Based Selection", desc: "Every application will go through a dedicated review and interview round for final selection.", icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-pink-500 rounded-full blur-[150px] opacity-[0.06] pointer-events-none" />

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
          <div className="font-mono text-[12px] text-pink-500 uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] font-bold">
            Women In Tech Initiative
          </div>
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight mb-6">
            Panel Discussion <span className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">Moderator</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Take center stage and drive high-impact tech panel discussions at AWS Student Community Day Dhule 2026. An exclusive opportunity for female leaders to lead conversations with cloud experts.
          </p>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Form Column (Left 7 cols) */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">Moderator Application</h2>
              <p className="text-white/60">Verify your ticket email to start and fill out your profile details.</p>
            </div>
            <MpdForm />
          </div>

          {/* Sidebar (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-10">
            
            {/* Policy Caution Box */}
            <div className="bg-pink-500/5 border border-pink-500/20 p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2.5 text-pink-500 font-sans font-black italic text-lg uppercase tracking-tight drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
                <AlertOctagon size={20} className="text-pink-500" />
                Women in Tech Initiative
              </div>
              <ul className="space-y-3.5 text-white/70 text-xs sm:text-sm font-sans leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>This opportunity is open to <strong>female candidates only</strong> to encourage diverse participation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>You must be a <strong>valid paid Paddock Pass (ticket) holder</strong>. Unregistered emails cannot access the form.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>Final selection will be done after a <strong>personal interview</strong> conducted by the community organizers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 mt-1">•</span>
                  <span>Submitting the form does not guarantee selection as a moderator.</span>
                </li>
              </ul>
            </div>

            {/* Perks & Requirements Card */}
            <div className="bg-[#111] border border-white/5 p-6 sm:p-8">
              <h3 className="font-sans font-black italic text-xl uppercase tracking-tight text-white mb-6 border-b border-white/10 pb-3">
                Moderator Perks & Requirements
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {requirements.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-pink-500 shrink-0 group-hover:bg-pink-500 group-hover:text-black transition-all">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1 group-hover:text-pink-500 transition-colors">{item.title}</h4>
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
