import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Agenda', href: '#schedule' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Tickets', href: '#tickets' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Sponsors', href: '/sponsors' },
];

function Countdown() {
  const target = new Date('2026-08-14T09:00:00+05:30').getTime();
  const [diff, setDiff] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff <= 0) return <span className="font-mono text-xs text-[#00ff00] font-bold">RACE DAY</span>;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-3 sm:gap-4 lg:gap-5 text-white/80 font-bold uppercase tracking-widest text-[8px] sm:text-[9px] lg:text-[10px] text-center">
      <div className="flex flex-col items-center">
        <span className="countdown-single font-mono text-lg sm:text-xl lg:text-2xl text-white mb-0.5">
          <span style={{ "--value": Math.floor(days / 10) } as React.CSSProperties}></span>
          <span style={{ "--value": days % 10 } as React.CSSProperties}></span>
        </span>
        days
      </div>
      <div className="flex flex-col items-center">
        <span className="countdown-single font-mono text-lg sm:text-xl lg:text-2xl text-white mb-0.5">
          <span style={{ "--value": Math.floor(hours / 10) } as React.CSSProperties}></span>
          <span style={{ "--value": hours % 10 } as React.CSSProperties}></span>
        </span>
        hours
      </div>
      <div className="flex flex-col items-center">
        <span className="countdown-single font-mono text-lg sm:text-xl lg:text-2xl text-white mb-0.5">
          <span style={{ "--value": Math.floor(mins / 10) } as React.CSSProperties}></span>
          <span style={{ "--value": mins % 10 } as React.CSSProperties}></span>
        </span>
        min
      </div>
      <div className="flex flex-col items-center">
        <span className="countdown-single font-mono text-lg sm:text-xl lg:text-2xl text-aws-orange drop-shadow-[0_0_8px_rgba(255,153,0,0.5)] mb-0.5">
          <span style={{ "--value": Math.floor(secs / 10) } as React.CSSProperties}></span>
          <span style={{ "--value": secs % 10 } as React.CSSProperties}></span>
        </span>
        sec
      </div>
    </div>
  );
}

export const HeaderSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={`h-14 sm:h-16 lg:h-20 flex items-center justify-between px-4 sm:px-12 lg:px-24 border-b z-[9999] fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled ? 'bg-[#050505]/95 backdrop-blur-xl border-white/5' : 'bg-transparent border-transparent'
      }`}>
        <div className="flex items-center gap-2 sm:gap-4">
          <img src="/AWS_Builder.png" alt="AWS Builder Group" className="h-8 sm:h-10 lg:h-12 object-contain" />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 lg:gap-8 items-center">
          <nav className="flex gap-4 lg:gap-6">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-mono text-[10px] lg:text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-[10px] lg:text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="h-6 w-px bg-white/10" />
          <Countdown />
          <div className="h-6 w-px bg-white/10" />

          <a 
            href="#tickets" 
            className="ml-2 px-6 py-2 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-12deg] transition-all shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            <span className="skew-x-[12deg] block">Buy Ticket</span>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3 sm:gap-4">
          <Countdown />
          <div className="h-6 w-px bg-white/10" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 sm:top-16 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 p-4 flex flex-col gap-4 md:hidden"
          >
            <div className="flex items-center justify-between py-2 border-b border-white/5 pb-3">
              <img src="/F1-Logo.png" alt="F1 Logo" className="h-8 opacity-80" />
            </div>
            <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest text-white/60 text-right">
              {navLinks.map((link) => (
                link.href.startsWith('/') ? (
                  <Link key={link.label} to={link.href} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">
                    {link.label}
                  </a>
                )
              ))}
              <a href="#tickets" onClick={() => setMobileMenuOpen(false)} className="py-2 text-aws-orange font-bold hover:text-white transition-colors">Buy Ticket</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
