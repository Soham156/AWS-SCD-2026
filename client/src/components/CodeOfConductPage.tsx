import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Sparkles, 
  Eye, 
  Users, 
  Activity, 
  Globe, 
  PhoneCall, 
  AlertOctagon, 
  FileText, 
  Accessibility,
  HeartHandshake
} from 'lucide-react';

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
          <div className="inline-flex items-center justify-center p-3 bg-aws-orange/10 rounded-full border border-aws-orange/20 mb-4 animate-pulse">
            <Shield className="text-aws-orange w-6 h-6" />
          </div>
          <h1 className="font-sans font-black italic text-4xl sm:text-6xl uppercase tracking-tighter mb-2 text-white">
            CODE OF <span className="text-aws-orange drop-shadow-[0_0_15px_rgba(255,153,0,0.3)]">CONDUCT</span>
          </h1>
          <div className="text-white/50 font-mono text-[9px] sm:text-xs uppercase tracking-wider max-w-xl mx-auto leading-relaxed space-y-1">
            <p className="font-black text-white">AWS Student Community Day (SCD) Dhule 2026</p>
            <p className="text-[10px] text-white/40">Organized by AWS Student Builder Group, SVKM's Institute of Technology, Dhule</p>
            <p className="text-[9px] text-aws-orange">📅 August 14, 2026 · 📍 SVKM's Institute of Technology, Dhule</p>
          </div>
        </div>

        {/* Content Blocks */}
        <div className="space-y-8">
          
          {/* 1. Our Commitment */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-aws-orange" />
              1. Our Commitment
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                AWS Student Community Day Dhule 2026 is North Maharashtra's first AWS-backed student cloud summit. We're building a space where students, developers, sponsors, and industry guests can learn, network, and build together — free from harassment and discrimination.
              </p>
              <p>
                This Code of Conduct applies to <strong>everyone</strong> at the event: attendees, speakers, sponsors, exhibitors, volunteers, organizers, and staff. It covers all event spaces — the main venue, breakout/lab rooms, expo/sponsor area, washrooms, parking, and any official afterparty or meetup — as well as all associated online spaces (Discord, WhatsApp groups, Builder Center Certified Space, social media using event hashtags).
              </p>
              <p>
                We do not tolerate harassment in any form. This applies regardless of gender identity and expression, sexual orientation, disability, neurodiversity, physical appearance, body size, ethnicity, nationality, race, age, religion, caste, or any other protected characteristic.
              </p>
            </div>
          </div>

          {/* 2. Expected Behavior */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <HeartHandshake size={18} className="text-aws-orange" />
              2. Expected Behavior
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-3.5 leading-relaxed">
              <ul className="list-none pl-0 space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span><strong>Be respectful.</strong> Treat every person — regardless of experience level, background, or role — with courtesy. First-time attendees and final-year students deserve the same respect as speakers and sponsors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span><strong>Be inclusive.</strong> Actively welcome newcomers, students from other colleges, and people attending their first tech event. Don't form closed cliques that exclude others.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span><strong>Be constructive.</strong> Give feedback and ask questions in a way that helps, not embarrasses. Disagree with ideas, not people.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span><strong>Practice "Yes, and."</strong> Build on others' ideas during discussions, hackathon brainstorms, and networking conversations instead of shutting them down.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span><strong>Share credit.</strong> If you build on someone else's project, idea, or code during the event, acknowledge them.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span>Respect personal space and boundaries, including physical space, photography consent, and conversational boundaries.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span>Follow venue and staff instructions, including instructions from volunteers wearing organizer badges/lanyards.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-aws-orange font-black select-none mt-0.5">•</span>
                  <span><strong>Display your event badge/lanyard visibly</strong> at all times inside the venue — it's how our team identifies attendees, speakers, sponsors, and volunteers, and it's required for entry into sessions, labs, and the expo area.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Unacceptable Behavior */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E10600]" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <AlertOctagon size={18} className="text-[#E10600]" />
              3. Unacceptable Behavior
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>The following are explicitly prohibited and will result in enforcement actions:</p>
              <ul className="list-none pl-0 space-y-3">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span><strong>Harassment of any kind</strong>, including offensive comments related to protected characteristics; sexual harassment, unwelcomed advances, stalking, deliberate intimidation, or invading personal space without consent.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span>Discriminatory or demeaning jokes, slurs, or language, even if framed as "just a joke".</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span><strong>Photography or recording of any person without their consent</strong>, especially candid photos taken to mock, sexualize, or embarrass someone.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span>Sustained disruption of talks, workshops, hackathon sessions, or other events.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span><strong>Doxxing</strong> — publicly sharing someone's private information (phone number, socials, personal contact) without consent.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span>Aggressive or predatory sales conduct by sponsors/exhibitors.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span>Spamming or unsolicited self-promotion in event channels or group chats.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span>Bringing weapons, illegal substances, or alcohol onto the premises; smoking inside the venue, labs, or auditorium.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E10600] font-black select-none mt-0.5">•</span>
                  <span>Tampering with badges, QR tickets, or check-in systems, including forging or reselling tickets.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 4. Photography, Recording & Media */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <Eye size={18} className="text-aws-orange" />
              4. Photography, Recording & Media
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-3.5 leading-relaxed">
              <p>
                - Official photographers/videographers will be capturing the event for AWS and community promotional use. By attending, you consent to being included in general crowd/venue shots.
              </p>
              <p>
                - If you do <strong>not</strong> wish to appear in promotional photos or video, inform an organizer at registration and we will note it, and avoid featuring you in close-up or individually identifiable shots.
              </p>
              <p>
                - Do not photograph or record any individual up close, in a session, or in the expo area without their consent — especially in washrooms, prayer rooms, or private conversation areas.
              </p>
              <p>
                - Recording of talks for redistribution requires speaker and organizer permission.
              </p>
            </div>
          </div>

          {/* 5. Sponsor & Exhibitor Conduct */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-aws-orange" />
              5. Sponsor & Exhibitor Conduct
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-3.5 leading-relaxed">
              <p>Sponsors and exhibitors agree to:</p>
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Staff booths professionally and respectfully; no aggressive or high-pressure sales tactics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Only collect attendee contact information (via badge/QR scan or forms) with <strong>explicit opt-in consent</strong>, and use it strictly for the stated purpose.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Avoid disparaging competitors or other sponsors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Keep booth activities, games, and giveaways appropriate for a student audience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Respect the physical space allotted and not encroach on walkways, emergency exits, or other booths.</span>
                </li>
              </ul>
              <p className="mt-2 text-white/40">
                Attendees are equally expected to engage with sponsor booths respectfully and are not required to share contact information they're uncomfortable sharing.
              </p>
            </div>
          </div>

          {/* 6. Health, Safety & Venue Rules */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E10600]" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#E10600]" />
              6. Health, Safety & Venue Rules
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-3.5 leading-relaxed">
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Follow all instructions from venue security and event volunteers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Familiarize yourself with emergency exits and the first-aid point (location will be announced at check-in).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Report any medical emergency immediately to the nearest volunteer or the numbers in Section 8.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>No alcohol, illegal drugs, or weapons are permitted on the premises.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>No smoking inside the venue, auditorium, labs, or expo hall.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Maintain cleanliness — use designated waste bins, especially in lab and food areas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E10600] font-bold select-none">•</span>
                  <span>Follow any specific lab safety instructions given by facilitators (e.g., handling IoT hardware).</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 7. Online & Community Conduct */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-aws-orange" />
              7. Online & Community Conduct
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                This applies to the AWS Student Builder Group's Discord, WhatsApp groups, Builder Center Certified Space, and any posts using official event hashtags:
              </p>
              <ul className="list-none pl-0 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Don't send messages meant for one person to an entire group or channel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Keep off-topic conversation to a minimum in working channels.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Don't advertise or promote unrelated personal projects, products, or services (no spam).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Don't flame, rant, or make personal attacks in discussion threads; disagree respectfully.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Give credit when resharing or building on someone else's post, project, or idea.</span>
                </li>
              </ul>

              <div className="mt-6 border-t border-white/5 pt-4 bg-[#050505] p-4 rounded-xl border">
                <p className="text-white font-bold uppercase text-[10px] tracking-widest text-aws-orange mb-3">
                  Refer & Win / Paddock Pass Campaign — Terms of Participation
                </p>
                <ul className="list-none pl-0 space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <span className="text-aws-orange font-black select-none">1.</span>
                    <span>You must be a member of the AWS Certified Space on Builder Center and have engaged with (liked, commented, or authored) at least one post.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-aws-orange font-black select-none">2.</span>
                    <span>Your Group Leader must confirm your exam readiness before referring you.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-aws-orange font-black select-none">3.</span>
                    <span>Fraudulent referrals, fake accounts, or manipulated engagement will result in disqualification from the campaign and possible removal from the community.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 8. Reporting an Incident */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <PhoneCall size={18} className="text-emerald-400" />
              8. Reporting an Incident
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>
                If you are harassed, notice someone else being harassed, or have any other concern, <strong>please tell us immediately.</strong> You can:
              </p>
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold select-none">•</span>
                  <span>Approach any organizer or volunteer wearing an event badge/lanyard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold select-none">•</span>
                  <span>Contact the organizers directly:</span>
                </li>
              </ul>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#050505] p-4 rounded-lg border border-white/5 mt-2">
                <div>
                  <p className="text-white font-bold font-sans">Soham Chaudhari</p>
                  <p className="text-[10px] text-aws-orange mt-0.5">+91 98343 82337</p>
                </div>
                <div>
                  <p className="text-white font-bold font-sans">Vaibhav Chaudhari</p>
                  <p className="text-[10px] text-aws-orange mt-0.5">+91 80072 98092</p>
                </div>
                <div>
                  <p className="text-white font-bold font-sans">Saurabh Rajput</p>
                  <p className="text-[10px] text-aws-orange mt-0.5">+91 98909 91510</p>
                </div>
              </div>

              <p className="mt-4">
                All reports will be handled <strong>discreetly and confidentially</strong> — details are shared only with the people needed to resolve the issue. There is no obligation to confront the person yourself; organizers will handle it. We will not tolerate retaliation against anyone who reports an incident in good faith.
              </p>
            </div>
          </div>

          {/* 9. Enforcement & Consequences */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E10600]" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <AlertOctagon size={18} className="text-[#E10600]" />
              9. Enforcement & Consequences
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-4 leading-relaxed">
              <p>Organizers may take any of the following actions, depending on severity:</p>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Verbal warning and request to stop the behavior immediately.</li>
                <li>Removal from the specific session, lab, or venue area.</li>
                <li><strong>Expulsion from the event with no refund</strong>, and removal of event badge/access.</li>
                <li><strong>Removal from the AWS Student Builder Group community</strong> (Discord, WhatsApp, Builder Center spaces, future events).</li>
                <li>For illegal acts, <strong>involvement of venue security and local law enforcement</strong>.</li>
              </ol>
              <p className="mt-4 text-[#E10600]/80">
                Organizers reserve the right to skip steps for severe violations (e.g., physical assault, sexual harassment) and act immediately.
              </p>
            </div>
          </div>

          {/* 10. Volunteer & Leadership Responsibilities */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <FileText size={18} className="text-aws-orange" />
              10. Volunteer & Leadership Responsibilities
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-3.5 leading-relaxed">
              <p>
                If you hold a leadership, volunteer, or core-team role within the AWS Student Builder Group and your circumstances change (new job, exams, graduation, etc.):
              </p>
              <ul className="list-none pl-0 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Give the team reasonable notice before stepping down.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Help identify and onboard a successor.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Transfer all relevant access — contacts, credentials, shared drives, social handles — for a smooth transition.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Document any ongoing workstreams (e.g., sponsor conversations, ticketing/backend access) so nothing is dropped.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 11. Accessibility & Inclusion */}
          <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-aws-orange" />
            <h2 className="font-sans font-black italic text-base sm:text-lg uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <Accessibility size={18} className="text-aws-orange" />
              11. Accessibility & Inclusion
            </h2>
            <div className="font-mono text-xs text-white/60 space-y-3.5 leading-relaxed">
              <p>We want every student to be able to participate fully:</p>
              <ul className="list-none pl-0 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Let us know in advance (via the registration form or by contacting organizers) about any accessibility needs — mobility, dietary, sensory, or otherwise — so we can accommodate them.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>Session rooms and the expo area will have clear signage; ask any volunteer for directions or assistance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-aws-orange font-bold select-none">•</span>
                  <span>If English or Hindi/Marathi phrasing in any session is unclear, volunteers are available to help bridge language gaps.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Acknowledgement */}
        <div className="text-center mt-12 sm:mt-16 border-t border-white/5 pt-8 space-y-6">
          <div className="max-w-xl mx-auto font-mono text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
            <p>12. By registering for or attending AWS Student Community Day Dhule 2026, you agree to abide by this Code of Conduct. We reserve the right to update this document; the latest version will always be available on the official event page.</p>
          </div>
          <div>
            <Link 
              to="/" 
              className="inline-block px-8 py-3.5 bg-white text-black font-mono text-xs uppercase tracking-widest font-black rounded hover:bg-aws-orange hover:text-black transition-colors"
            >
              I Accept / Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CodeOfConductPage;
