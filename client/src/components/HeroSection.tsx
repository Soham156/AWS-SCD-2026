import { motion, useScroll, useTransform } from "motion/react";
import { AngledButton } from "./LayoutElements";
import { Zap, Calendar, MapPin, Users, Mic, Wrench } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const [media, setMedia] = useState<{video: string, audio?: string} | null>(null);
  const [isLiteMode, setIsLiteMode] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const lite = localStorage.getItem('scd_lite_mode') === 'true';
    setIsLiteMode(lite);
  }, []);

  useEffect(() => {
    if (!hasStarted || isLiteMode) return;
    setMedia({ video: '/videoplayback.webm' });
  }, [hasStarted, isLiteMode]);



  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = 0.55;
    if (audioRef.current) audioRef.current.volume = 0.6;

    const handleGreenLight = () => {
      setHasStarted(true);
      const lite = localStorage.getItem('scd_lite_mode') === 'true';
      setIsLiteMode(lite);
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
  }, [isMuted]);

  useEffect(() => {
    const handleFocusChange = () => {
      if (document.hidden || !document.hasFocus()) {
        videoRef.current?.pause();
        audioRef.current?.pause();
      } else if (hasStarted && inView) {
        videoRef.current?.play().catch(() => {});
        audioRef.current?.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleFocusChange);
    window.addEventListener("blur", handleFocusChange);
    window.addEventListener("focus", handleFocusChange);

    return () => {
      document.removeEventListener("visibilitychange", handleFocusChange);
      window.removeEventListener("blur", handleFocusChange);
      window.removeEventListener("focus", handleFocusChange);
    };
  }, [hasStarted, inView]);

  useEffect(() => {
    if (hasStarted) {
      if (inView && !document.hidden && document.hasFocus()) {
        const playVideo = videoRef.current?.play();
        const playAudio = audioRef.current?.play();

        if (playVideo !== undefined) {
          playVideo.catch((e) => {
            console.warn("Video blocked, attempting muted autoplay:", e);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(console.error);
            }
            if (audioRef.current) {
              audioRef.current.muted = true;
            }
            setIsMuted(true);
            window.dispatchEvent(new CustomEvent("muteStateChange", { detail: true }));
          });
        }
        
        if (playAudio !== undefined) {
          playAudio.catch((e) => {
            console.warn("Audio blocked:", e);
          });
        }
      } else {
        videoRef.current?.pause();
        audioRef.current?.pause();
      }
    }
  }, [inView, hasStarted]);

  // Watchdog checker to ensure video plays if it's supposed to be playing
  useEffect(() => {
    if (!hasStarted || !inView || document.hidden || !document.hasFocus()) return;

    const checkInterval = setInterval(() => {
      if (videoRef.current && videoRef.current.paused) {
        console.warn("Watchdog: Hero video was paused unexpectedly! Attempting to resume...");
        videoRef.current.play().catch(e => {
          console.warn("Watchdog video resume failed, trying muted:", e);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
            setIsMuted(true);
          }
        });
      }
      if (audioRef.current && audioRef.current.paused && !isMuted) {
        console.warn("Watchdog: Hero audio was paused unexpectedly! Attempting to resume...");
        audioRef.current.play().catch(e => console.warn("Watchdog audio resume failed:", e));
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [hasStarted, inView, isMuted]);

  return (
    <section ref={sectionRef} className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden border-b border-white/5 z-10 px-4 sm:px-12 lg:px-24 pt-24 pb-12">
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 z-0 pointer-events-none bg-[#050505]"
      >
        {isLiteMode ? (
          <img
            src="/bg.avif"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60 mix-blend-screen mix-blend-lighten"
          />
        ) : media && (
          <>
            <video
              ref={videoRef}
              preload="auto"
              loop
              playsInline
              fetchPriority="high"
              className="w-full h-full object-cover opacity-60 mix-blend-screen mix-blend-lighten"
              src={media.video}
            />
            {media.audio && (
              <audio
                ref={audioRef}
                preload="auto"
                loop
                src={media.audio}
              />
            )}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
        <div className="absolute -right-20 top-0 w-[500px] h-[500px] bg-aws-orange/5 blur-[150px]" />
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-f1-red to-aws-orange" />
      </motion.div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 mt-18 lg:mt-12">
        
        {/* Left Content */}
        <div className="w-full lg:w-3/5 flex flex-col gap-5 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-2 bg-aws-orange/10 border border-aws-orange/20 max-w-max rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-aws-orange animate-pulse"></span>
            <span className="font-mono text-[10px] sm:text-xs text-aws-orange uppercase tracking-[0.2em] font-bold">
              AWS Student Community Day
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter leading-[0.9] uppercase text-white"
          >
            <span className="block mb-2">AWS Student</span>
            <span className="block mb-2">Community Day</span>
            <span className="block text-aws-orange">Dhule 2026</span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-base sm:text-lg lg:text-xl font-bold tracking-tight uppercase text-white/90 border-l-4 border-aws-orange pl-4"
          >
            The Largest Student-Led Cloud Event in the North       - Maharashtra Region
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-2xl text-sm lg:text-base opacity-70 font-medium leading-relaxed"
          >
             <i><b>AWS Student Community Day Dhule 2026</b></i> is the largest student-led cloud event in North Maharashtra, bringing together students, developers, AWS Heroes, Community Builders, UG Leaders, and industry experts under one roof. Supported by the global AWS community, the event offers cutting-edge cloud learning, inspiring technical sessions, and valuable networking opportunities to help the next generation of technology leaders learn, connect, and grow. 

          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-2"
          >
            <Link to="/ticket">
              <AngledButton primary={true}>
                <span>Buy Ticket</span>
              </AngledButton>
            </Link>
            <a href="#schedule">
              <AngledButton primary={false}>
                <span>View Agenda</span>
              </AngledButton>
            </a>
          </motion.div>
        </div>

        {/* Right Content: Elegant Date/Time/Venue Typography */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full lg:w-2/5 flex flex-col justify-center mt-8 lg:mt-0"
        >
          <div className="flex flex-col gap-8 sm:gap-10 border-l-2 border-white/10 pl-6 sm:pl-10">
            <div className="flex flex-col group cursor-default">
              <span className="font-mono text-[10px] sm:text-xs text-aws-orange uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
                <Calendar size={12} /> Date
              </span>
              <span className="font-sans text-lg sm:text-xl lg:text-2xl font-black text-white group-hover:text-f1-red transition-colors duration-300">
                14 August 2026
              </span>
            </div>

            <div className="flex flex-col group cursor-default">
              <span className="font-mono text-[10px] sm:text-xs text-aws-orange uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
                <Zap size={12} /> Start Time
              </span>
              <span className="font-sans text-lg sm:text-xl lg:text-2xl font-black text-white group-hover:text-f1-red transition-colors duration-300">
                09:00 AM IST
              </span>
            </div>

            <div className="flex flex-col group cursor-default">
              <span className="font-mono text-[10px] sm:text-xs text-aws-orange uppercase tracking-[0.3em] mb-2 font-bold flex items-center gap-2">
                <MapPin size={12} /> Venue
              </span>
              <span className="font-sans text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight group-hover:text-f1-red transition-colors duration-300">
                SVKM's IOT Campus, Dhule
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

