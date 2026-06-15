import { useEffect, useRef } from "react";
import gsap from "gsap";

export const LogoMarquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!marqueeRef.current) return;

    tweenRef.current = gsap.to(marqueeRef.current, {
      xPercent: -50,
      ease: "none",
      duration: 15,
      repeat: -1,
    });

    // Pause on hover (desktop) — handled via CSS pause-animation below
    const el = marqueeRef.current.parentElement;
    if (el) {
      const pause = () => tweenRef.current?.pause();
      const resume = () => tweenRef.current?.resume();
      el.addEventListener("mouseenter", pause);
      el.addEventListener("mouseleave", resume);

      return () => {
        tweenRef.current?.kill();
        el.removeEventListener("mouseenter", pause);
        el.removeEventListener("mouseleave", resume);
      };
    }

    return () => tweenRef.current?.kill();
  }, []);

  // Listen for tap events from touchHover.ts (mobile marquee pause)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.pause) {
        tweenRef.current?.pause();
      } else {
        tweenRef.current?.resume();
      }
    };
    window.addEventListener("marquee-tap", handler);
    return () => window.removeEventListener("marquee-tap", handler);
  }, []);

  return (
    <div className="w-full border-b border-white/10 bg-[#050505] py-6 sm:py-10 overflow-hidden relative flex z-20">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      <div ref={marqueeRef} className="flex items-center whitespace-nowrap min-w-max">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-12 sm:space-x-24 px-6 sm:px-12"
          >
            {/* marquee-logo class is targeted by touchHover.ts */}
            <img
              src="/AWS_logo1.png"
              alt="AWS Logo"
              tabIndex={0}
              className="marquee-logo h-12 object-contain grayscale-0 opacity-100 sm:grayscale sm:opacity-60 sm:hover:grayscale-0 sm:hover:opacity-100 sm:focus:grayscale-0 sm:focus:opacity-100 transition-all duration-300"
            />

            <img
              src="/ARIF-white.png"
              alt="ARIF Logo"
              tabIndex={0}
              className="marquee-logo h-16 object-contain grayscale-0 opacity-100 sm:grayscale sm:opacity-60 sm:hover:grayscale-0 sm:hover:opacity-100 sm:focus:grayscale-0 sm:focus:opacity-100 transition-all duration-300"
            />

            <img
              src="/AWS_Builder.png"
              alt="AWS Builder Logo"
              tabIndex={0}
              className="marquee-logo h-12 object-contain grayscale-0 opacity-100 sm:grayscale sm:opacity-60 sm:hover:grayscale-0 sm:hover:opacity-100 sm:focus:grayscale-0 sm:focus:opacity-100 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
