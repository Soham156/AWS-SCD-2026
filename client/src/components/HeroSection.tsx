import { motion, useScroll, useTransform } from "motion/react";
import { AngledButton, TelemetryData } from "./LayoutElements";
import { Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";
export const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  // We start with null to prevent double-loading. The latency check is extremely fast.
  const [media, setMedia] = useState<{video: string, audio: string} | null>(null);

  useEffect(() => {
    // 1. Measure latency to determine quality
    const measureLatency = async () => {
      const start = performance.now();
      try {
        await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
      } catch (e) {
        // Fallback if fetch fails
      }
      const latency = performance.now() - start;
      
      let video, audio;
      if (latency < 400) { // Fast/Medium response
        video = 'https://ufuiebrurfmamjtzvyqy.supabase.co/storage/v1/object/public/bgvideos/bg1080.webm';
        audio = 'https://ufuiebrurfmamjtzvyqy.supabase.co/storage/v1/object/public/bgvideos/bg130.m4a';
      } else { // Slow response
        video = 'https://ufuiebrurfmamjtzvyqy.supabase.co/storage/v1/object/public/bgvideos/bg720.webm';
        audio = 'https://ufuiebrurfmamjtzvyqy.supabase.co/storage/v1/object/public/bgvideos/bg50.m4a';
      }
      setMedia({ video, audio });
    };

    measureLatency();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = 0.6;
    if (audioRef.current) audioRef.current.volume = 0.6;

    const handleGreenLight = () => {
      if (videoRef.current) videoRef.current.play().catch((e) => console.warn("Video blocked:", e));
      if (audioRef.current) audioRef.current.play().catch((e) => console.warn("Audio blocked:", e));
    };

    const handleToggleMute = () => {
      let nextMuted = !isMuted;
      if (videoRef.current) {
        nextMuted = !videoRef.current.muted;
        videoRef.current.muted = nextMuted;
      }
      if (audioRef.current) {
        audioRef.current.muted = nextMuted;
      }
      setIsMuted(nextMuted);
      window.dispatchEvent(new CustomEvent("muteStateChange", { detail: nextMuted }));
    };

    window.addEventListener("greenLight", handleGreenLight);
    window.addEventListener("toggleMute", handleToggleMute);
    return () => {
      window.removeEventListener("greenLight", handleGreenLight);
      window.removeEventListener("toggleMute", handleToggleMute);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden border-b border-white/5 z-10 px-4 sm:px-12 lg:px-24 pt-16 lg:pt-20 pb-4">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0 pointer-events-none bg-[#050505]"
      >
        {media && (
          <>
            <video
              ref={videoRef}
              preload="auto"
              loop
              playsInline
              className="w-full h-full object-cover opacity-40 mix-blend-screen mix-blend-lighten"
              src={media.video}
            />
            <audio
              ref={audioRef}
              preload="auto"
              loop
              src={media.audio}
            />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
        <div className="absolute -right-20 -top-20 w-40 sm:w-80 h-40 sm:h-80 bg-aws-orange/10 blur-[100px]" />
        <div className="absolute left-0 top-0 w-1 h-full bg-f1-red" />
      </motion.div>

      <div className="max-w-5xl relative z-10 flex flex-col gap-2 sm:gap-4 pl-2 sm:pl-4 mt-2 sm:mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center gap-3 sm:gap-6 mb-2 sm:mb-4"
        >
          <div className="flex gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-f1-red animate-pulse"></span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-f1-red"></span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-f1-red"></span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-f1-red"></span>
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-f1-red"></span>
          </div>
          <TelemetryData label="STATUS" value="LIVE" color="text-[#00ff00]" />
          <TelemetryData
            label="GRID"
            value="1,200+ BUILDERS"
            color="text-white"
          />
          {/* Sound button removed — now a separate floating SoundButton component */}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[4rem] xl:text-[5rem] font-black italic tracking-tighter leading-[0.95] uppercase text-white"
        >
          <span className="block hover:text-aws-orange transition-colors duration-300 cursor-default">
            AWS Student
          </span>

          <span className="block hover:text-aws-orange transition-colors duration-300 cursor-default">
            Community Day
          </span>

          <span className="block hover:text-aws-orange transition-colors duration-300 cursor-default">
            2026
          </span>
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight uppercase"
        >
          {["LIGHTS", "OUT...", "Build", "The", "Future."].map((word) => (
            <span
              key={word}
              className="
        inline-block
        mr-3
        text-aws-orange
        transition-all
        duration-300
        hover:text-white
        hover:scale-105
        cursor-default
      "
            >
              {word}
            </span>
          ))}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-3xl text-xs sm:text-sm md:text-base opacity-70 font-medium leading-relaxed mt-2"
        >
          AWS Student Community Day Dhule 2026 is a premier student-driven
          technology conference bringing together developers, cloud
          enthusiasts, innovators, and industry professionals for a full
          day of learning, networking, and hands-on experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col gap-2 sm:flex-row sm:gap-8 mt-1 sm:mt-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#00ff00]/80"
        >
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-[#00ff00] shrink-0" /> 14 AUGUST 2026
            &nbsp;&bull;&nbsp; 09:00 AM – 06:00 PM
          </div>
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-[#00ff00] shrink-0" /> SVKM'S IOT
            CAMPUS, DHULE
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6"
        >
          <a href="#tickets">
            <AngledButton primary={true}>
              <span>Buy Ticket</span>
            </AngledButton>
          </a>
          <a href="#circuit">
            <AngledButton primary={false}>
              <span>Explore Circuit</span>
            </AngledButton>
          </a>
        </motion.div>
      </div>
    </section>
  );
};
