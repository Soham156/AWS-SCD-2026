"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import ReactLenis from 'lenis/react';
import { Github, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { SectionHeader } from './LayoutElements';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
  linkedin: string;
  github: string;
}

const crew: TeamMember[] = [
  {
    name: "Soham Chaudhari",
    role: "AWS Cloud Club Captain",
    description: "AWS Cloud Club Captain leading the community and driving cloud innovation at SVKM IOT Dhule.",
    image: "/team/team-01.png",
    linkedin: "https://www.linkedin.com/in/soham-chaudhari-174b4b287/",
    github: "https://github.com/Soham156"
  },
  {
    name: "Vaibhav Chaudhari",
    role: "Admin & Operations Lead",
    description: "Overseeing administration and operations, ensuring smooth execution of all community events and activities.",
    image: "/team/team-02.png",
    linkedin: "https://www.linkedin.com/in/vaibhav-chaudhari-1355a3281/",
    github: "https://github.com/VaibhavChaudhari07"
  },
  {
    name: "Saurabh Girase",
    role: "IT Support & Management",
    description: "Managing IT infrastructure and technical support for all AWS community events and digital initiatives.",
    image: "/team/team-03.png",
    linkedin: "https://www.linkedin.com/in/saurabhrajput15/",
    github: "https://github.com/saurabh-rajput-15"
  },
  {
    name: "Abdullah Bandukwala",
    role: "Technical Lead",
    description: "Leading the technical direction of the club, mentoring members on AWS services, DevOps, and cloud architecture.",
    image: "/team/team-04.png",
    linkedin: "https://www.linkedin.com/in/abdullah-bandukwala-74848b231/",
    github: "https://github.com/abdullahb07"
  },
  {
    name: "Aashish Ingale",
    role: "Social Media Head",
    description: "Crafting the digital presence and social media strategy for the AWS Student Community.",
    image: "/team/team-05.png",
    linkedin: "https://www.linkedin.com/in/aashish-ingale-276bb2298/",
    github: "#"
  },
  {
    name: "Bhavesh Dev",
    role: "Event Management Lead",
    description: "Planning and executing community events, workshops, and meetups for the AWS Student Community.",
    image: "/team/team-06.png",
    linkedin: "https://www.linkedin.com/in/bhavesh-dev-118b472a9/",
    github: "#"
  },
];

const StaticDriverCard = ({ member, i }: { member: TeamMember; i: number }) => {
  return (
    <div className="w-full max-w-[340px] mx-auto aspect-[3/4] relative rounded-[2rem] border-2 border-white/10 bg-[#0a0a0a] shadow-xl overflow-hidden group">
      {/* Full Image Background */}
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
      />

      {/* Event Badge Top Bar */}
      <div className="absolute top-0 inset-x-0 h-12 bg-aws-orange text-black flex justify-between items-center px-4 sm:px-5 z-20">
        <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">CREW / 2026</span>
        <span className="font-mono text-[10px] sm:text-xs font-black uppercase">ID-0{i + 1}</span>
      </div>
      
      {/* Fake Lanyard Hole */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-2.5 sm:h-3 rounded-full bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] z-30" />

      {/* Content Glassmorphism Bottom Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-20 sm:pt-24 pb-6 px-5 sm:px-6 z-20">
        <h3 className="font-sans text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white mb-1 leading-none">
          {member.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-aws-orange font-bold uppercase tracking-widest mb-3 font-mono">
          {member.role}
        </p>
        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed mb-4 line-clamp-2">
          {member.description}
        </p>

        {/* Event themed footer */}
        <div className="flex justify-between items-end border-t border-white/10 pt-4">
          <div className="h-4 sm:h-5 flex gap-[2px] opacity-40">
            {[1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1].map((w, j) => (
              <div key={j} className="h-full bg-white" style={{ width: `${w}px` }} />
            ))}
          </div>
          
          <div className="flex gap-2">
            {member.linkedin !== "#" && (
              <a href={member.linkedin} target="_blank" rel="noreferrer" className="p-1.5 rounded-full border border-white/10 bg-black/50 text-white/40 hover:text-white hover:border-white transition-all duration-300 backdrop-blur-md">
                <Linkedin size={14} />
              </a>
            )}
            {member.github !== "#" && (
              <a href={member.github} target="_blank" rel="noreferrer" className="p-1.5 rounded-full border border-white/10 bg-black/50 text-white/40 hover:text-white hover:border-white transition-all duration-300 backdrop-blur-md">
                <Github size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const AnimatedDriverCard = ({
  member,
  i,
  progress,
  totalCards,
}: {
  member: TeamMember;
  i: number;
  progress: any;
  totalCards: number;
}) => {
  // Card 0 is already in place. Cards 1 to N fly in sequentially.
  const flyInStart = Math.max(0, (i - 1) / (totalCards - 1));
  const flyInEnd = i / (totalCards - 1);
  const finalYOffset = i * 12; // Stack offset - decreased distance
  
  const y = useTransform(
    progress, 
    [flyInStart, flyInEnd], 
    [i === 0 ? finalYOffset : 1200, finalYOffset] // Start 1200px down
  );

  const finalScale = 1 - (totalCards - i - 1) * 0.04;
  const scale = useTransform(
    progress,
    [flyInEnd, 1],
    [1, finalScale]
  );

  return (
    <motion.div
      style={{
        y,
        scale,
        zIndex: i,
        position: 'absolute',
        top: 0,
        willChange: 'transform'
      }}
      className="w-[280px] sm:w-[340px] aspect-[3/4] origin-top rounded-[2rem] border-2 border-white/10 bg-[#0a0a0a] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden group"
    >
      {/* Full Image Background */}
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
        style={{ filter: 'grayscale(1)' }}
      />

      {/* Event Badge Top Bar */}
      <div className="absolute top-0 inset-x-0 h-12 bg-aws-orange text-black flex justify-between items-center px-4 sm:px-5 z-20">
        <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest">CREW / 2026</span>
        <span className="font-mono text-[10px] sm:text-xs font-black uppercase">ID-0{i + 1}</span>
      </div>
      
      {/* Fake Lanyard Hole */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-2.5 sm:h-3 rounded-full bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] z-30" />

      {/* Content Glassmorphism Bottom Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pt-20 sm:pt-24 pb-6 px-5 sm:px-6 z-20">
        <h3 className="font-sans text-xl sm:text-2xl font-black italic uppercase tracking-tight text-white mb-1 leading-none">
          {member.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-aws-orange font-bold uppercase tracking-widest mb-3 font-mono">
          {member.role}
        </p>
        <p className="text-white/60 text-[10px] sm:text-xs leading-relaxed mb-4 line-clamp-2">
          {member.description}
        </p>

        {/* Event themed footer: Barcode & Socials */}
        <div className="flex justify-between items-end border-t border-white/10 pt-4">
          <div className="h-4 sm:h-5 flex gap-[2px] opacity-40">
            {[1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1].map((w, j) => (
              <div key={j} className="h-full bg-white" style={{ width: `${w}px` }} />
            ))}
          </div>
          
          <div className="flex gap-2">
            {member.linkedin !== "#" && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-full border border-white/10 bg-black/50 text-white/40 hover:text-[#0a66c2] hover:border-[#0a66c2] transition-all duration-300 backdrop-blur-md"
              >
                <Linkedin size={14} />
              </a>
            )}
            {member.github !== "#" && (
              <a
                href={member.github}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-full border border-white/10 bg-black/50 text-white/40 hover:text-white hover:border-white transition-all duration-300 backdrop-blur-md"
              >
                <Github size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
const LiteModeSection = ({ crew }: { crew: TeamMember[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const animateStack = useCallback((activeIndex: number, prevIndex?: number) => {
    if (!stackRef.current || isAnimating.current) return;
    isAnimating.current = true;

    const cards = cardRefs.current;
    const tl = gsap.timeline({
      onComplete: () => { isAnimating.current = false; },
      defaults: { ease: "power3.inOut" },
    });

    if (prevIndex !== undefined && prevIndex !== activeIndex && cards[prevIndex]) {
      tl.to(cards[prevIndex]!, {
        scale: 0.88,
        y: 30,
        rotation: -8,
        opacity: 0.5,
        duration: 0.35,
        ease: "power2.in",
      }, 0);

      if (overlayRefs.current[prevIndex]) {
        tl.to(overlayRefs.current[prevIndex]!, {
          opacity: 0.5,
          duration: 0.3,
        }, 0);
      }
    }

    cards.forEach((card, i) => {
      if (!card) return;

      let offset = i - activeIndex;
      if (offset > crew.length / 2) offset -= crew.length;
      if (offset < -crew.length / 2) offset += crew.length;
      const absOffset = Math.abs(offset);

      if (i === activeIndex) {
        tl.to(card, {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          rotation: 0,
          zIndex: 20,
          duration: 0.55,
          ease: "back.out(1.2)",
        }, prevIndex !== undefined ? 0.12 : 0);

        if (overlayRefs.current[i]) {
          tl.to(overlayRefs.current[i]!, {
            opacity: 0,
            duration: 0.4,
          }, 0.1);
        }

        if (imgRefs.current[i]) {
          tl.to(imgRefs.current[i]!, {
            filter: "grayscale(0)",
            duration: 0.4,
          }, 0.1);
        }
      } else if (absOffset <= 3) {
        const dir = offset > 0 ? 1 : -1;
        tl.to(card, {
          opacity: Math.max(0.15, 0.8 - absOffset * 0.25),
          scale: 1 - absOffset * 0.05,
          x: dir * absOffset * 18,
          y: absOffset * 12,
          rotation: dir * absOffset * 5,
          zIndex: 15 - absOffset,
          duration: 0.6,
          ease: "power3.out",
        }, 0.08);

        if (overlayRefs.current[i]) {
          tl.to(overlayRefs.current[i]!, {
            opacity: 0.3 + absOffset * 0.15,
            duration: 0.4,
          }, 0.1);
        }

        if (imgRefs.current[i]) {
          tl.to(imgRefs.current[i]!, {
            filter: "grayscale(1)",
            duration: 0.4,
          }, 0.1);
        }
      } else {
        tl.to(card, {
          opacity: 0,
          scale: 0.8,
          x: 0,
          y: 40,
          rotation: 0,
          zIndex: 0,
          duration: 0.4,
        }, 0);
      }
    });

    if (infoRef.current) {
      tl.fromTo(
        infoRef.current,
        { opacity: 0, y: 25, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "none", duration: 0.5, ease: "power2.out" },
        0.2
      );
    }
  }, [crew.length]);

  const goTo = useCallback((index: number) => {
    if (isAnimating.current) return;
    const prev = currentIndex;
    setCurrentIndex(index);
    animateStack(index, prev);
  }, [currentIndex, animateStack]);

  const handlePrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + crew.length) % crew.length;
    goTo(newIndex);
  }, [currentIndex, goTo, crew.length]);

  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % crew.length;
    goTo(newIndex);
  }, [currentIndex, goTo, crew.length]);

  const handleCardClick = useCallback((index: number) => {
    if (isAnimating.current) return;
    if (index === currentIndex) {
      const newIndex = (currentIndex + 1) % crew.length;
      goTo(newIndex);
    } else {
      goTo(index);
    }
  }, [currentIndex, goTo, crew.length]);

  useEffect(() => {
    if (isInView) {
      animateStack(0);
    }
  }, [isInView, animateStack]);

  useEffect(() => {
    if (!isInView) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % crew.length;
        requestAnimationFrame(() => animateStack(next, prev));
        return next;
      });
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInView, animateStack, crew.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isInView) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % crew.length;
        requestAnimationFrame(() => animateStack(next, prev));
        return next;
      });
    }, 5000);
  }, [animateStack, isInView, crew.length]);

  const withReset = (fn: () => void) => () => { fn(); resetTimer(); };
  const handleCardClickWithReset = (i: number) => { handleCardClick(i); resetTimer(); };
  const handleDotClickWithReset = (i: number) => { goTo(i); resetTimer(); };

  const currentMember = crew[currentIndex];

  return (
    <section ref={sectionRef} className="relative w-full z-10 mt-8 sm:mt-12">
      <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-14 md:gap-28 min-h-[300px] sm:min-h-[380px] md:min-h-[420px] w-full max-w-6xl mx-auto">
        {/* Photo Side — GSAP stacked cards */}
        <div
          ref={stackRef}
          className="relative w-52 h-64 sm:w-64 sm:h-80 md:w-80 md:h-[400px] shrink-0 mx-auto"
        >
          {crew.map((member, i) => (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              onClick={() => handleCardClickWithReset(i)}
              className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer shadow-2xl shadow-black/50 group"
              style={{ willChange: 'transform, opacity' }}
            >
              <img
                ref={(el) => { imgRefs.current[i] = el; }}
                src={member.image}
                alt={member.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-[filter] duration-500 group-hover:!grayscale-0"
                style={{ filter: 'grayscale(1)' }}
                draggable={false}
              />
              <div
                ref={(el) => { overlayRefs.current[i] = el; }}
                className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:!opacity-0"
              ></div>
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-aws-orange/40 transition-[border-color] duration-300 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">
                  {member.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Info Side - High-tech Telemetry HUD Console */}
        <div 
          ref={infoRef} 
          className="flex-1 w-full bg-[#0a0a0a]/60 border border-white/5 p-6 sm:p-8 rounded-2xl relative overflow-hidden text-left shadow-xl"
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-aws-orange/30"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-aws-orange/30"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-aws-orange/30"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-aws-orange/30"></div>

          {/* Scanning Laser Line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-aws-orange/20 to-transparent animate-[scan_3s_ease-in-out_infinite]"></div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono text-[9px] text-white/30 uppercase tracking-widest">
              <span>Crew Telemetry // Profile Status: ACTIVE</span>
              <span className="text-aws-orange font-bold">Sector {String(currentIndex + 1).padStart(2, '0')}</span>
            </div>

            <div>
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-aws-orange/60 mb-1 block font-bold">Driver Name</span>
              <h3 className="font-sans text-2xl sm:text-4xl font-black italic uppercase tracking-tight text-white leading-none">
                {currentMember.name}
              </h3>
            </div>

            <div className="border-y border-white/5 py-4 my-1">
              <div>
                <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-white/30 block mb-0.5 font-bold">Role / Designation</span>
                <span className="font-mono text-[10px] sm:text-xs text-white font-bold tracking-wide uppercase">{currentMember.role}</span>
              </div>
            </div>

            <div>
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-white/30 block mb-1 font-bold">Mission Directive</span>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans font-medium">
                {currentMember.description}
              </p>
            </div>

            <div className="mt-2 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-4">
                {currentMember.linkedin !== "#" && (
                  <a
                    href={currentMember.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 hover:text-[#0a66c2] transition-colors"
                  >
                    <Linkedin size={12} /> LinkedIn
                  </a>
                )}
                {currentMember.github !== "#" && (
                  <a
                    href={currentMember.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[10px] text-white/40 hover:text-white transition-colors"
                  >
                    <Github size={12} /> GitHub
                  </a>
                )}
              </div>

              <div className="font-mono text-[8px] uppercase tracking-widest text-white/20">
                Telemetry Check: OK // Connected
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-8 sm:mt-12">
        <button
          onClick={withReset(handlePrev)}
          className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={withReset(handleNext)}
          className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {crew.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClickWithReset(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'bg-aws-orange w-6'
                : 'bg-white/20 w-2 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export const DriversSection = () => {
  const [isLiteMode, setIsLiteMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('scd_lite_mode') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    const handleLiteModeChange = () => {
      setIsLiteMode(localStorage.getItem('scd_lite_mode') !== 'false');
    };
    window.addEventListener('scd_lite_mode_change', handleLiteModeChange);
    return () => window.removeEventListener('scd_lite_mode_change', handleLiteModeChange);
  }, []);

  const toggleMode = () => {
    const newVal = !isLiteMode;
    setIsLiteMode(newVal);
    if (newVal) {
      localStorage.setItem('scd_lite_mode', 'true');
      document.body.classList.add('lite-mode');
    } else {
      localStorage.removeItem('scd_lite_mode');
      document.body.classList.remove('lite-mode');
    }
  };

  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const renderHeader = (isLite: boolean) => {
    if (isLite) {
      return (
        <div className="w-full mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto relative z-10">
          <SectionHeader 
            title="Meet Our Team" 
            subtitle="Discover the talented individuals behind our success." 
            sysId="04.DRV" 
          />
        </div>
      );
    }
    return (
      <div className="w-full md:w-1/2 relative z-10 mb-10 md:mb-0">
        <SectionHeader 
          title="Meet Our Team" 
          subtitle="Discover the talented individuals behind our success." 
          sysId="04.DRV" 
        />
      </div>
    );
  };

  if (isLiteMode) {
    return (
      <section className="relative w-full bg-[#050505] pt-24 pb-32 px-4 sm:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-aws-orange/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none z-0"></div>

        {renderHeader(true)}
        <LiteModeSection crew={crew} />
      </section>
    );
  }

  return (
    <ReactLenis root>
      {/* Container height dictates how long the stack animation lasts. 400vh is perfect for 5 cards sliding up. */}
      <section
        ref={container}
        className="relative w-full h-[400vh] bg-[#050505]"
      >
        {/* Single sticky container: Pinned Layout */}
        <div className="sticky top-0 w-full h-screen flex flex-col md:flex-row items-start justify-center md:justify-between px-4 sm:px-12 lg:px-24 pt-[15vh] sm:pt-[20vh] lg:pt-[25vh]">
          
          {/* Decorative background glow */}
          <div className="absolute top-[20%] md:top-[30%] left-1/2 md:left-[25%] -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-aws-orange/5 rounded-full blur-[150px] pointer-events-none z-0"></div>

          {/* Left Side: Header */}
          {renderHeader(false)}

          {/* Right Side: Card Stack Container */}
          <div className="w-full md:w-1/2 relative h-[450px] sm:h-[600px] flex items-start justify-center md:justify-center z-10">
            <div className="relative w-[280px] sm:w-[340px] h-full flex items-start justify-center">
              {crew.map((member, i) => (
                <AnimatedDriverCard
                  key={`member_${i}`}
                  i={i}
                  member={member}
                  progress={scrollYProgress}
                  totalCards={crew.length}
                />
              ))}
            </div>
          </div>

        </div>
      </section>
    </ReactLenis>
  );
};
