import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Github, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

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

export const DriversSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  // Smooth GSAP stack animation with proper "send to back" feel
  const animateStack = useCallback((activeIndex: number, prevIndex?: number) => {
    if (!stackRef.current || isAnimating.current) return;
    isAnimating.current = true;

    const cards = cardRefs.current;
    const tl = gsap.timeline({
      onComplete: () => { isAnimating.current = false; },
      defaults: { ease: "power3.inOut" },
    });

    // If there's a previous active card, animate it going to the back first
    if (prevIndex !== undefined && prevIndex !== activeIndex && cards[prevIndex]) {
      tl.to(cards[prevIndex]!, {
        scale: 0.88,
        y: 30,
        rotation: -8,
        opacity: 0.5,
        duration: 0.35,
        ease: "power2.in",
      }, 0);

      // Grayscale stays on the old card (CSS handles it), animate overlay in
      if (overlayRefs.current[prevIndex]) {
        tl.to(overlayRefs.current[prevIndex]!, {
          opacity: 0.5,
          duration: 0.3,
        }, 0);
      }
    }

    // Position all cards in the stack
    cards.forEach((card, i) => {
      if (!card) return;

      // Circular offset: how far is this card from active in the stack
      let offset = i - activeIndex;
      // Wrap around for smooth circular feel
      if (offset > crew.length / 2) offset -= crew.length;
      if (offset < -crew.length / 2) offset += crew.length;
      const absOffset = Math.abs(offset);

      if (i === activeIndex) {
        // Active card — swoop to front
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

        // Remove dark overlay on active
        if (overlayRefs.current[i]) {
          tl.to(overlayRefs.current[i]!, {
            opacity: 0,
            duration: 0.4,
          }, 0.1);
        }

        // Active card grayscale removed via filter
        if (imgRefs.current[i]) {
          tl.to(imgRefs.current[i]!, {
            filter: "grayscale(0.7)",
            duration: 0.4,
          }, 0.1);
        }
      } else if (absOffset <= 3) {
        // Stacked behind — beautiful fanned arrangement
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

        // Dark overlay on background cards
        if (overlayRefs.current[i]) {
          tl.to(overlayRefs.current[i]!, {
            opacity: 0.3 + absOffset * 0.15,
            duration: 0.4,
          }, 0.1);
        }

        // Grayscale for background cards
        if (imgRefs.current[i]) {
          tl.to(imgRefs.current[i]!, {
            filter: "grayscale(1)",
            duration: 0.4,
          }, 0.1);
        }
      } else {
        // Far away — hide
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

    // Animate the info panel: slide out then in
    if (infoRef.current) {
      tl.fromTo(
        infoRef.current,
        { opacity: 0, y: 25, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" },
        0.2
      );
    }
  }, []);

  // Navigate to a specific index
  const goTo = useCallback((index: number) => {
    if (isAnimating.current) return;
    const prev = currentIndex;
    setCurrentIndex(index);
    animateStack(index, prev);
  }, [currentIndex, animateStack]);

  const handlePrev = useCallback(() => {
    const newIndex = (currentIndex - 1 + crew.length) % crew.length;
    goTo(newIndex);
  }, [currentIndex, goTo]);

  const handleNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % crew.length;
    goTo(newIndex);
  }, [currentIndex, goTo]);

  // Click on a card: active card → go next, other card → bring to front
  const handleCardClick = useCallback((index: number) => {
    if (isAnimating.current) return;
    if (index === currentIndex) {
      // Clicking the active card → advance to next
      const newIndex = (currentIndex + 1) % crew.length;
      goTo(newIndex);
    } else {
      goTo(index);
    }
  }, [currentIndex, goTo]);

  // Initial GSAP setup
  useEffect(() => {
    animateStack(0);
  }, [animateStack]);

  // 5-second auto-rotate
  useEffect(() => {
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
  }, [animateStack]);

  // Reset timer when manually navigating
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % crew.length;
        requestAnimationFrame(() => animateStack(next, prev));
        return next;
      });
    }, 5000);
  }, [animateStack]);

  const withReset = (fn: () => void) => () => { fn(); resetTimer(); };
  const handleCardClickWithReset = (i: number) => { handleCardClick(i); resetTimer(); };
  const handleDotClickWithReset = (i: number) => { goTo(i); resetTimer(); };

  const currentMember = crew[currentIndex];

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 px-4 sm:px-12 lg:px-24 bg-[#050505] overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-aws-orange/5 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-8 sm:mb-16"
        >
          <div className="font-mono text-[10px] text-aws-orange uppercase tracking-[0.3em] mb-4">
            04.DRV / Meet The Crew
          </div>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase text-white leading-none mb-3 sm:mb-4">
            Meet Our Team
          </h2>
          <p className="text-white/50 text-sm sm:text-base lg:text-lg font-medium max-w-md">
            Discover the talented individuals behind our success.
          </p>
        </motion.div>

        {/* Team Member Display */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-16 min-h-[300px] sm:min-h-[380px] md:min-h-[420px]">
          {/* Photo Side — GSAP stacked cards */}
          <div
            ref={stackRef}
            className="relative w-52 h-64 sm:w-64 sm:h-80 md:w-80 md:h-[400px] shrink-0"
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
                {/* Dark overlay — animated by GSAP, lifts on hover */}
                <div
                  ref={(el) => { overlayRefs.current[i] = el; }}
                  className="absolute inset-0 bg-black/50 transition-opacity duration-300 group-hover:!opacity-0"
                ></div>
                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-aws-orange/40 transition-[border-color] duration-300 pointer-events-none"></div>
                {/* Name tag on card */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">
                    {member.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Info Side */}
          <div ref={infoRef} className="w-full md:max-w-[450px] flex flex-col justify-center text-center md:text-left shrink-0">
            <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white mb-1">
              {currentMember.name}
            </h3>
            <p className="text-xs sm:text-sm text-aws-orange font-bold uppercase tracking-widest mb-3 sm:mb-4 font-mono">
              {currentMember.role}
            </p>
            <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 max-w-md">
              {currentMember.description}
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 justify-center md:justify-start">
              {currentMember.linkedin !== "#" && (
                <a
                  href={currentMember.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`LinkedIn profile for ${currentMember.name}`}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#0a66c2] hover:border-[#0a66c2] transition-all duration-300"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {currentMember.github !== "#" && (
                <a
                  href={currentMember.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`GitHub profile for ${currentMember.name}`}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white transition-all duration-300"
                >
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-3 mt-8 sm:mt-12">
          <button
            onClick={withReset(handlePrev)}
            className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
            aria-label="Previous team member"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={withReset(handleNext)}
            className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
            aria-label="Next team member"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dot indicators */}
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
              aria-label={`Go to team member ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
