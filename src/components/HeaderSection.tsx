import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export const HeaderSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="h-12 sm:h-20 lg:h-24 flex items-center justify-between px-4 sm:px-12 lg:px-24 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-50 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <img src="/AWS_Builder.png" alt="AWS Builder Group" className="h-10 sm:h-12 lg:h-16 object-contain" />
        </div>
        {/* Desktop nav items */}
        <div className="hidden md:flex gap-6 lg:gap-8 items-center">
          <img src="/F1-Logo.png" alt="F1 Logo" className="h-8 lg:h-10 opacity-80" />
          <div className="flex flex-col items-end">
            <span className="font-sans text-[10px] uppercase opacity-50 font-bold tracking-widest">Current Latency</span>
            <span className="font-mono text-xs text-[#00ff00] font-bold">18ms / LIVE</span>
          </div>
          <a 
            href="#tickets" 
            className="ml-4 px-6 py-2 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-12deg] transition-all shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            <span className="skew-x-[12deg] block">Buy Ticket</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 sm:top-20 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 p-4 flex flex-col gap-4 md:hidden"
          >
            <div className="flex items-center justify-between py-2 border-b border-white/5 pb-3">
              <img src="/F1-Logo.png" alt="F1 Logo" className="h-8 opacity-80" />
              <div className="flex flex-col items-end">
                <span className="font-sans text-[10px] uppercase opacity-50 font-bold tracking-widest">Latency</span>
                <span className="font-mono text-xs text-[#00ff00] font-bold">18ms / LIVE</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest text-white/60">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">About</a>
              <a href="#schedule" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">Schedule</a>
              <a href="#team" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">Team</a>
              <a href="#tickets" onClick={() => setMobileMenuOpen(false)} className="py-2 text-aws-orange font-bold hover:text-white transition-colors">Buy Ticket</a>
              <a href="/sponsors" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">Sponsors</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
