import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ArrowLeft, Send, Building2, User, Mail, MessageSquare, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const sponsorTiers = [
  { name: "Title Sponsor", price: "₹75,000", highlight: true, perks: ["Main stage branding", "Premium expo stall", "Event speaking opportunity", "Social media promotions", "ID card branding", "Ceremony mentions"] },
  { name: "Gold Sponsor", price: "₹40,000", highlight: false, perks: ["Expo stall", "Banner branding", "Social media mentions", "Participant kit branding", "Networking opportunities"] },
  { name: "Silver Sponsor", price: "₹20,000", highlight: false, perks: ["Sponsor stall", "Sponsor wall branding", "Website mention", "Flyer distribution"] },
  { name: "Bronze Sponsor", price: "₹15,000", highlight: false, perks: ["Stall space", "Logo placement", "Brand visibility", "Brochure distribution"] },
  { name: "Startup Showcase", price: "₹12,000", highlight: false, perks: ["Startup booth", "Product showcase", "Networking access", "Social media mentions"] },
  { name: "Community Partner", price: "₹7,500", highlight: false, perks: ["Community branding", "Promotional support", "Student outreach", "Collaboration opportunities"] },
];

export const SponsorPage = () => {
  // Scroll to top when this page is loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    tier: '',
    details: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/applications/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          throw new Error(result.errors.map((e: any) => e.message).join(', '));
        }
        throw new Error(result.message || 'Failed to submit application');
      }
      
      setStatus('success');
      setFormData({ company: '', contact: '', email: '', tier: '', details: '' });
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0]">
      {/* Subtle bg pattern */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
      }}></div>

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-mono text-white/60 hover:text-white transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>
          <img src="/AWS_Builder.png" alt="AWS Builder" width={160} height={40} className="h-10 object-contain" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 px-6 sm:px-12 lg:px-24 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-f1-red/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="font-mono text-[10px] text-aws-orange uppercase tracking-[0.3em] mb-6">
              05.PRTN / Sponsorship
            </div>
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase text-white leading-none mb-6">
              Constructors<br />& Partners
            </h1>
            <p className="text-sm sm:text-base text-white/50 font-medium max-w-2xl mx-auto leading-relaxed">
              Partner with one of the region's largest student-led technology events focused on AI, Cloud, AWS, DevOps, Innovation, and Developer Communities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-12 sm:py-16 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="font-mono text-[10px] text-aws-orange uppercase tracking-[0.2em] mb-4">
              Available Tiers
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">
              Sponsorship Packages
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsorTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`p-6 border flex flex-col relative overflow-hidden group transition-all duration-500 min-h-[220px] hover:translate-y-[-2px] ${
                  tier.highlight
                    ? 'bg-gradient-to-br from-aws-orange/10 to-[#050505] border-aws-orange/50 shadow-lg shadow-aws-orange/5'
                    : 'bg-[#111] border-white/5 hover:border-white/20'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-aws-orange to-f1-red"></div>
                )}
                <div className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-1 ${tier.highlight ? 'text-aws-orange' : 'text-gray-500'}`}>
                  {tier.highlight ? '★ Featured Tier' : 'Available Tier'}
                </div>

                <h3 className={`font-sans font-black italic tracking-tighter text-2xl uppercase ${tier.highlight ? 'text-white' : 'text-gray-300'}`}>
                  {tier.name}
                </h3>

                <div className="font-mono text-xl font-bold text-[#E10600] mt-2 mb-4">
                  {tier.price}
                </div>

                <ul className="flex flex-col gap-2 flex-1 border-t border-white/5 pt-4 mt-auto">
                  {tier.perks.map((perk, j) => (
                    <li key={j} className="text-xs font-sans opacity-60 flex items-start gap-2 group-hover:opacity-80 transition-opacity">
                      <ChevronRight size={14} className="text-[#FF9900] shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsor Application Form */}
      <section className="py-12 sm:py-20 px-6 sm:px-12 lg:px-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <div className="font-mono text-[10px] text-aws-orange uppercase tracking-[0.2em] mb-4">
              Application
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white mb-4">
              Join The Grid
            </h2>
            <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto">
              Interested in partnering with us? Fill out the form below and our team will get back to you within 48 hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#111] border border-white/5 overflow-hidden"
          >
            {/* Form Header */}
            <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
              <h3 className="font-sans font-black italic text-xl uppercase tracking-tighter text-white">Sponsorship Application</h3>
              <p className="font-mono text-[10px] text-aws-orange tracking-widest uppercase mt-1">All fields are required</p>
            </div>

            {/* Form */}
            <form className="p-6 sm:p-8 flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2">
                  <Building2 size={12} /> Company Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-black/50 border border-white/10 p-3.5 text-white focus:outline-none focus:border-aws-orange transition-colors placeholder:text-white/20"
                  placeholder="Enter company name"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2">
                    <User size={12} /> Contact Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="bg-black/50 border border-white/10 p-3.5 text-white focus:outline-none focus:border-aws-orange transition-colors placeholder:text-white/20"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-black/50 border border-white/10 p-3.5 text-white focus:outline-none focus:border-aws-orange transition-colors placeholder:text-white/20"
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2">
                  <Tag size={12} /> Sponsorship Tier Interest
                </label>
                <select
                  required
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="bg-[#050505] border border-white/10 p-3.5 text-white focus:outline-none focus:border-aws-orange transition-colors"
                >
                  <option value="">Select a tier...</option>
                  {sponsorTiers.map(s => <option key={s.name} value={s.name}>{s.name} — {s.price}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] text-gray-500 tracking-widest uppercase flex items-center gap-2">
                  <MessageSquare size={12} /> Additional Details
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="bg-black/50 border border-white/10 p-3.5 text-white focus:outline-none focus:border-aws-orange transition-colors resize-none placeholder:text-white/20"
                  placeholder="Tell us about your goals and how you'd like to partner with us..."
                ></textarea>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] text-sm">
                  {errorMessage}
                </div>
              )}

              {status === 'success' && (
                <div className="p-4 bg-[#00ff00]/10 border border-[#00ff00]/20 text-[#00ff00] text-sm flex items-center gap-2">
                  ✓ Application Submitted successfully! We will contact you shortly.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`mt-4 font-sans font-black italic uppercase text-lg py-4 px-6 transition-all duration-300 tracking-widest skew-x-[-5deg] flex items-center justify-center gap-3 ${
                  status === 'success'
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-aws-orange hover:bg-white text-black hover:shadow-lg hover:shadow-aws-orange/10'
                }`}
              >
                <span className="skew-x-[5deg] flex items-center gap-2">
                  {status === 'success' ? (
                    <>✓ Application Submitted!</>
                  ) : status === 'loading' ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Proposal
                    </>
                  )}
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
            © 2026 AWS Student Builder Group. All rights reserved.
          </span>
          <Link
            to="/"
            className="font-mono text-[10px] text-aws-orange hover:text-white uppercase tracking-widest transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
};
