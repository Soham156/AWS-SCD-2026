import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Agenda', href: '#schedule' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Tickets', href: '#tickets' },
  { label: 'Refer & Win', href: '/refertowin' },
  { label: 'Women In Tech', href: '/womenintech' },
  { label: 'Badge', href: '/badge' },
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

  return (
    <>
      {/* Custom Styles for Edge Highlights and Shimmer Sweep */}
      <style>{`
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(255,153,0,0.25); box-shadow: 0 0 3px rgba(255,153,0,0.1); }
          50% { border-color: rgba(255,153,0,0.85); box-shadow: 0 0 10px rgba(255,153,0,0.35); }
        }
        @keyframes witGlow {
          0%, 100% { border-color: rgba(236,72,153,0.3); box-shadow: 0 0 3px rgba(236,72,153,0.1); }
          50% { border-color: rgba(236,72,153,0.95); box-shadow: 0 0 12px rgba(236,72,153,0.45); }
        }
        .animate-pulse-border {
          animation: borderGlow 2s infinite ease-in-out;
        }
        .animate-pulse-border-wit {
          animation: witGlow 2s infinite ease-in-out;
        }
        .refer-shimmer {
          position: relative;
          overflow: hidden;
        }
        .refer-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 153, 0, 0.45),
            transparent
          );
          transform: skewX(-25deg);
        }
        .refer-shimmer:hover::after {
          left: 150%;
          transition: left 0.7s ease-in-out;
        }
      `}</style>

      <header className="h-14 sm:h-16 lg:h-20 flex items-center justify-between px-4 sm:px-12 lg:px-24 z-[9999] fixed top-0 left-0 right-0 transition-all duration-300">
        {/* Dissolving Glass Backdrop */}
        <div 
          className="absolute inset-0 -z-10 bg-black/60 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
          }}
        />
        <div className="flex items-center gap-2 sm:gap-4">
          <img src="/scd-dhule-logo.avif" alt="SCD Dhule" className="h-16 sm:h-20 lg:h-24 object-contain" fetchPriority="high" />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 lg:gap-8 items-center">
          <nav className="flex gap-4 lg:gap-6 items-center">
            {navLinks.map((link) => (
              link.label === 'Refer & Win' ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative px-3 py-1 rounded border border-aws-orange/40 bg-aws-orange/5 font-mono text-[10px] lg:text-xs font-black uppercase tracking-widest text-aws-orange hover:text-white transition-all duration-300 animate-pulse-border refer-shimmer"
                >
                  {link.label}
                </Link>
              ) : link.label === 'Women In Tech' ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="relative px-3 py-1 rounded border border-pink-500/40 bg-pink-500/5 font-mono text-[10px] lg:text-xs font-black uppercase tracking-widest text-pink-500 hover:text-white transition-all duration-300 animate-pulse-border-wit refer-shimmer"
                >
                  {link.label}
                </Link>
              ) : link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="font-mono text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-white/90 hover:text-aws-orange transition-colors drop-shadow-md"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-mono text-[10px] lg:text-xs font-semibold uppercase tracking-widest text-white/90 hover:text-aws-orange transition-colors drop-shadow-md"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="h-6 w-px bg-white/10" />
          <Countdown />
          <div className="h-6 w-px bg-white/10" />

          <Link 
            to="/ticket" 
            className="ml-2 px-6 py-2 bg-aws-orange hover:bg-white text-black font-sans font-black italic uppercase text-xs tracking-widest skew-x-[-12deg] transition-all shadow-[0_0_15px_rgba(255,153,0,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          >
            <span className="skew-x-[12deg] block">Buy Ticket</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-3 sm:gap-4">
          <Countdown />
          <div className="h-6 w-px bg-white/10" />
          <button type="button"
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

            <div className="flex flex-col gap-2 font-mono text-xs uppercase tracking-widest text-white/60 text-left px-2 pt-2">
              {navLinks.map((link) => (
                link.label === 'Refer & Win' ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative my-1 max-w-max px-3 py-1.5 rounded border border-aws-orange/40 bg-aws-orange/5 font-mono text-[10px] font-black uppercase tracking-widest text-aws-orange transition-all duration-300 animate-pulse-border refer-shimmer flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                ) : link.label === 'Women In Tech' ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative my-1 max-w-max px-3 py-1.5 rounded border border-pink-500/40 bg-pink-500/5 font-mono text-[10px] font-black uppercase tracking-widest text-pink-500 transition-all duration-300 animate-pulse-border-wit refer-shimmer flex items-center gap-1.5"
                  >
                    {link.label}
                  </Link>
                ) : link.href.startsWith('/') ? (
                  <Link key={link.label} to={link.href} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-aws-orange transition-colors">
                    {link.label}
                  </a>
                )
              ))}
              <Link to="/ticket" onClick={() => setMobileMenuOpen(false)} className="py-2 text-aws-orange font-bold hover:text-white transition-colors">Buy Ticket</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
