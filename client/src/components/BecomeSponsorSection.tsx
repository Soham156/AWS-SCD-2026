import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { X, Mail, CheckCircle, ArrowUpRight, Award, Trophy, Users, GraduationCap } from 'lucide-react';

export const BecomeSponsorSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // Form State
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tierOfInterest, setTierOfInterest] = useState("Gold Sponsor");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("info@aws-scd-dhule.tech");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsSubmitted(false);
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setTierOfInterest("Gold Sponsor");
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !email || !phone) return;

    setIsSubmitting(true);
    
    // Simulate submission flow
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Construct mailto link parameters
      const mailtoSubject = `Sponsorship Request - ${companyName} (${tierOfInterest})`;
      const mailtoBody = `Hi AWS Student Builder Group Team,\n\nWe would love to sponsor AWS Student Community Day Dhule 2026 under the ${tierOfInterest} tier.\n\nSponsorship Request Details:\n- Company/Brand Name: ${companyName}\n- Contact Representative: ${contactName}\n- Email: ${email}\n- Phone/WhatsApp: ${phone}\n- Tier of Interest: ${tierOfInterest}\n- Custom Requirements / Notes:\n${message || "No additional requirements specified."}\n\nPlease let us know the next steps.\n\nBest regards,\n${contactName}\n${companyName}`;
      
      // Auto open mailto client
      window.location.href = `mailto:info@aws-scd-dhule.tech?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(mailtoBody)}`;
    }, 1500);
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
                <button
                  onClick={handleOpenModal}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-10deg] transition-all hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,153,0,0.2)] cursor-pointer"
                >
                  <span className="skew-x-[10deg] flex items-center gap-1.5">
                    Apply to Sponsor <ArrowUpRight size={14} />
                  </span>
                </button>

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

      {/* Portal/Overlay Modal for Application Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-xl bg-[#0f0f0f] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden rounded-xl"
            >
              {/* F1 Orange top bar */}
              <div className="h-1 bg-gradient-to-r from-f1-red via-aws-orange to-f1-red w-full" />

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors z-10"
                aria-label="Close form"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="px-6 py-6 border-b border-white/5">
                <div className="flex items-center gap-2 text-aws-orange font-mono text-[9px] uppercase tracking-widest mb-1.5">
                  <Award size={14} /> Sponsorship Request
                </div>
                <h3 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white">
                  Join the Grid
                </h3>
                <p className="font-sans text-xs text-white/40 mt-1">
                  Complete the transmission below. Submitting will open your mail client with a pre-filled proposal request.
                </p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Company / Brand *</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Amazon Web Services"
                          className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-aws-orange transition-colors"
                        />
                      </div>

                      {/* Representative Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Representative Name *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-aws-orange transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="representative@brand.com"
                          className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-aws-orange transition-colors"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 99999 99999"
                          className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-aws-orange transition-colors"
                        />
                      </div>
                    </div>

                    {/* Tier of Interest Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Tier of Interest *</label>
                      <select
                        value={tierOfInterest}
                        onChange={(e) => setTierOfInterest(e.target.value)}
                        className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-aws-orange transition-colors cursor-pointer"
                      >
                        <option value="Title Sponsor (₹75,000)">Title Sponsor (₹75,000)</option>
                        <option value="Gold Sponsor (₹40,000)">Gold Sponsor (₹40,000)</option>
                        <option value="Silver Sponsor (₹20,000)">Silver Sponsor (₹20,000)</option>
                        <option value="Bronze Sponsor (₹15,000)">Bronze Sponsor (₹15,000)</option>
                        <option value="Startup Showcase (₹12,000)">Startup Showcase (₹12,000)</option>
                        <option value="Community Partner (₹7,500)">Community Partner (₹7,500)</option>
                        <option value="Custom Partnership">Custom Partnership / Other</option>
                      </select>
                    </div>

                    {/* Requirements/Message */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Custom Requirements / Notes</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Detail any booth preferences, custom banners, custom sponsorship targets, or questions here..."
                        rows={3}
                        className="w-full bg-[#161616] border border-white/10 px-4 py-2.5 text-sm font-sans text-white focus:outline-none focus:border-aws-orange transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-aws-orange text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-12deg] transition-all hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,153,0,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] disabled:opacity-50 mt-2 cursor-pointer"
                    >
                      <span className="skew-x-[12deg] flex items-center gap-1">
                        {isSubmitting ? "Transmitting..." : "Send Application & Open Mail"} <ArrowUpRight size={14} />
                      </span>
                    </button>
                  </form>
                ) : (
                  /* Success State */
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-16 h-16 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle size={32} className="text-emerald-400" />
                    </motion.div>
                    
                    <h4 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-2">
                      Transmission Initiated
                    </h4>
                    <p className="font-sans text-xs text-white/60 max-w-sm mb-6 leading-relaxed">
                      Your local mail application has been opened with your sponsorship details. If it didn't open automatically, please click below or email us directly at <strong>info@aws-scd-dhule.tech</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                      <a
                        href={`mailto:info@aws-scd-dhule.tech?subject=${encodeURIComponent(`Sponsorship Application - ${companyName} (${tierOfInterest})`)}&body=${encodeURIComponent(`Hi AWS Student Builder Group Team,\n\nWe would love to sponsor AWS Student Community Day Dhule 2026 under the ${tierOfInterest} tier.\n\nSponsorship Request Details:\n- Company/Brand Name: ${companyName}\n- Contact Representative: ${contactName}\n- Email: ${email}\n- Phone/WhatsApp: ${phone}\n- Tier of Interest: ${tierOfInterest}\n- Custom Requirements / Notes:\n${message || "No additional requirements specified."}\n\nPlease let us know the next steps.\n\nBest regards,\n${contactName}\n${companyName}`)}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-aws-orange text-black font-sans font-black italic uppercase text-[10px] tracking-widest skew-x-[-10deg] transition-all hover:bg-white"
                      >
                        <span className="skew-x-[10deg]">Open Mail Client</span>
                      </a>
                      
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white/5 border border-white/10 text-white font-sans font-black italic uppercase text-[10px] tracking-widest skew-x-[-10deg] transition-all hover:bg-white/10"
                      >
                        <span className="skew-x-[10deg]">Return to Circuit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
