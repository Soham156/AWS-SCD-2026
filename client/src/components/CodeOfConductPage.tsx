import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, UserCheck, PhoneCall, HelpCircle } from 'lucide-react';

export const CodeOfConductPage = () => {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#e0e0e0] flex flex-col overflow-x-clip relative">
      {/* Background Animated Wallpaper Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-aws-orange/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E10600]/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header Navigation */}
      <header className="border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md px-4 sm:px-12 py-4 flex items-center justify-between relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
        <span className="font-sans font-black italic text-lg uppercase tracking-tighter text-white">
          AWS SCD <span className="text-aws-orange">2026</span>
        </span>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Title Hero */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-aws-orange/10 rounded-full border border-aws-orange/20 mb-4">
            <Shield className="text-aws-orange w-6 h-6" />
          </div>
          <h1 className="font-sans font-black italic text-4xl sm:text-6xl uppercase tracking-tighter mb-2 text-white">
            CODE OF <span className="text-aws-orange drop-shadow-[0_0_15px_rgba(255,153,0,0.3)]">CONDUCT</span>
          </h1>
          <p className="text-white/50 font-mono text-xs uppercase tracking-wider max-w-md mx-auto">
            Ensuring a safe, respectful, and high-octane community event for all builders.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
          {/* Card 1: Core Values */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-aws-orange" />
              1. Expected Conduct
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                AWS Student Community Day Dhule 2026 is dedicated to providing a harassment-free experience for everyone, regardless of gender, sexual orientation, disability, physical appearance, body size, race, or religion.
              </p>
              <p>
                We expect all participants (attendees, speakers, sponsors, volunteers, and organizers) to:
              </p>
              <ul className="list-none pl-0 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Be respectful, friendly, and welcoming to all other attendees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Exercise consideration and respect in your speech and actions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Engage in collaborative discussions and respect differing technical viewpoints.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Prohibited Behavior */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E10600]" />
            <h2 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#E10600]" />
              2. Prohibited Behavior
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                Harassment, discrimination, or abusive conduct of any kind will not be tolerated. This includes:
              </p>
              <ul className="list-none pl-0 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Offensive remarks related to personal characteristics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Sustained disruption of talks, workshops, or other event schedules.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Inappropriate physical contact or unwelcome sexual attention.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Promoting political, non-technical, or controversial debates that deviate from standard builder learning.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Terms of Participation */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <HelpCircle size={18} className="text-aws-orange" />
              3. Terms of Participation
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                To maintain the integrity of our event badges and builder ecosystem:
              </p>
              <ul className="list-none pl-0 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span><strong>Referral Eligibility</strong>: Referrers must be members of the AWS Certified Space on Builder Center with active engagement (at least 1 original post or engagement comment).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span><strong>Exam Readiness</strong>: Referrals require confirmation of exam readiness by group leaders before paddock pass allocations are finalized.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span><strong>Media Consent</strong>: By attending, you consent to being photographed or filmed during activities for official community recaps and social announcements.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Reporting Violations */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <h2 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <PhoneCall size={18} className="text-emerald-400" />
              4. Reporting & Enforcement
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                If you are being harassed, notice that someone else is being harassed, or have any other concerns, please contact our organizers immediately at the reception desk, or reach out to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#050505] p-4 rounded-lg border border-white/5 mt-4">
                <div>
                  <p className="text-white font-bold font-sans">Soham Chaudhari</p>
                  <p className="text-[10px] text-aws-orange mt-0.5">+91 98343 82337</p>
                </div>
                <div>
                  <p className="text-white font-bold font-sans">Vaibhav Chaudhari</p>
                  <p className="text-[10px] text-aws-orange mt-0.5">+91 80072 98092</p>
                </div>
              </div>
              <p className="mt-4">
                Organizers reserve the right to expel any attendee violating this code of conduct from the premises without a refund, and block future registrations.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 sm:mt-16 border-t border-white/5 pt-8">
          <Link 
            to="/" 
            className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest font-black rounded hover:bg-aws-orange hover:text-black transition-colors"
          >
            I Accept / Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
export default CodeOfConductPage;
