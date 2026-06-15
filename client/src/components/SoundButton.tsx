import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Floating Sound (Team Radio) button.
 *
 * - Starts in the hero area (top-right, overlapping the telemetry bar).
 * - GSAP ScrollTrigger scrubs it down to dock above the BackToTop button.
 * - Communicates with HeroSection's <video> via custom events:
 *     dispatches  → 'toggleMute'
 *     listens for → 'muteStateChange'
 */
export const SoundButton = () => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [visible, setVisible] = useState(false);

  /* ── Show button only after preloader completes ── */
  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener("greenLight", show);
    return () => window.removeEventListener("greenLight", show);
  }, []);

  /* ── Sync mute icon with HeroSection's video state ── */
  useEffect(() => {
    const sync = (e: Event) => {
      setIsMuted((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener("muteStateChange", sync);
    return () => window.removeEventListener("muteStateChange", sync);
  }, []);

  /* ── GSAP ScrollTrigger: scrub from hero area → above BackToTop ── */
  useEffect(() => {
    if (!btnRef.current || !visible) return;

    // Starting position: near top-right of hero section
    // We use bottom-based positioning so GSAP can interpolate a single property.
    // Initial: bottom = calc(100vh - 170px)  ≈ high up on screen
    // Final:   bottom = 88px                  ≈ above BackToTop
    const viewportH = window.innerHeight;
    const startBottom = viewportH - 170; // px from bottom edge

    gsap.set(btnRef.current, { bottom: startBottom });

    const tween = gsap.to(btnRef.current, {
      bottom: 88,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top", // scroll = 0
        end: "600px top", // scroll = 600
        scrub: 0.6, // slight smoothing
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [visible]);

  const handleClick = () => {
    window.dispatchEvent(new Event("toggleMute"));
  };

  if (!visible) return null;

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      className="fixed mb-4 right-4 sm:right-10 z-[99] flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-white/10 active:bg-white/15 transition-colors rounded-full shadow-lg shadow-black/40"
      style={{ bottom: "88px" /* fallback, GSAP overrides */ }}
    >
      {isMuted ? (
        <VolumeX size={14} className="text-[#E10600]" />
      ) : (
        <Volume2 size={14} className="text-[#00ff00]" />
      )}
      <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-mono text-white/70">
        Team Radio
      </span>
    </button>
  );
};
