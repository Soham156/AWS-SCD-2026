"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';

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
    github: "https://github.com/aashishingale27"
  },
  {
    name: "Bhavesh Dev",
    role: "Event Management Lead",
    description: "Planning and executing community events, workshops, and meetups for the AWS Student Community.",
    image: "/team/team-06.png",
    linkedin: "https://www.linkedin.com/in/bhavesh-dev-118b472a9/",
    github: "https://github.com/bhavesh-k-dev"
  },
];


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
    <section ref={sectionRef} className="relative w-full z-10 mt-2 sm:mt-2">
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
                width={320}
                height={400}
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
          aria-label="Previous team member"
          className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={withReset(handleNext)}
          aria-label="Next team member"
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
            aria-label={`Go to team member ${i + 1}`}
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
  return (
    <section className="relative w-full bg-[#050505] pt-24 pb-32 px-4 sm:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-aws-orange/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none z-0"></div>

      <div className="w-full mb-0 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <SectionHeader 
          title="Meet Our Team" 
          subtitle="Discover the talented individuals behind our success." 
          sysId="06.DRV" 
        />
      </div>
      <LiteModeSection crew={crew} />
    </section>
  );
};
