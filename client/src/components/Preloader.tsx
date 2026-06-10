import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Preloader = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  const [lights, setLights] = useState(0);
  const [started, setStarted] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const lastPlayed = localStorage.getItem('scd_intro_played');
    if (lastPlayed && Date.now() - parseInt(lastPlayed, 10) < 10000) {
      setShouldRender(false);
      // Defer the event dispatch slightly to ensure HeroSection has mounted its listener
      setTimeout(() => window.dispatchEvent(new Event('greenLight')), 50);
      onComplete();
    }
  }, [onComplete]);

  const skipIntro = () => {
    localStorage.setItem('scd_intro_played', Date.now().toString());
    window.dispatchEvent(new Event('greenLight'));
    onComplete();
  };

  const playBeep = (freq: number, duration: number, type: OscillatorType = 'square') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playEngineSound = () => {
    if (!engineAudioRef.current) return;
    engineAudioRef.current.currentTime = 0;
    engineAudioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    if (!started) return;

    let current = 0;

    // Build up 5 red lights, one per second
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        current += 1;

        if (current <= 5) {
          // Light up one red light + beep
          setLights(current);
          playBeep(400, 0.3);
        } else {
          // All 5 are lit — stop incrementing, start end sequence
          clearInterval(interval);

          // Random hold (1–2.5s) with all 5 red lights still on
          const randomHold = Math.random() * 1500 + 1000;

          setTimeout(() => {
            // ── LIGHTS OUT ──
            setLights(0);

            // ── 500ms later: GREEN + go beep ──
            setTimeout(() => {
              setLights(6);
              playBeep(800, 0.6);
              window.dispatchEvent(new Event('greenLight'));
              setTimeout(() => {
                localStorage.setItem('scd_intro_played', Date.now().toString());
                onComplete();
              }, 1200);
            }, 500);

          }, randomHold);
        }
      }, 1000);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(initialDelay);
  }, [started, onComplete]);

  const handleStart = () => {
    // Unlock AudioContext (requires user gesture)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
    const osc = audioCtxRef.current.createOscillator();
    osc.connect(audioCtxRef.current.destination);
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.001);

    // Load engine audio on click (user gesture needed), play after 1.5s delay
    const audio = new Audio('/engine-start.wav');
    audio.volume = 0.5;
    engineAudioRef.current = audio;
    setTimeout(() => audio.play().catch(() => {}), 1500);

    setStarted(true);
  };

  if (!shouldRender) return null;

  return (
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center bg-[#050505] flex-col relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}
      />

      {/* Glow overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-t pointer-events-none transition-colors duration-200 ${
          lights === 6 ? 'from-[#00ff00]/20 to-transparent' : 'from-[#E10600]/20 to-transparent'
        }`}
        animate={{ opacity: lights > 0 && lights <= 5 ? lights * 0.2 : lights === 6 ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="start-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex flex-col items-center justify-center h-full w-full relative z-20"
          >
            <button
              onClick={handleStart}
              className="px-12 py-5 bg-[#E10600] text-white uppercase tracking-widest font-black text-2xl skew-x-[-15deg] hover:bg-white hover:text-black transition-colors shadow-[0_0_30px_rgba(225,6,0,0.4)]"
            >
              <span className="skew-x-[15deg] block">Start Engine</span>
            </button>
            <p className="mt-8 font-mono text-xs opacity-50 uppercase tracking-widest text-[#FF9900]">
              Hear The V12 Engine Roar
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="lights"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex space-x-4 md:space-x-8 relative z-10 bg-[#111] p-6 md:p-12 rounded-xl border border-white/5 shadow-2xl backdrop-blur-md"
          >
            {[1, 2, 3, 4, 5].map((idx) => {
              let bgColor = 'bg-black/50 border-white/5';
              let shadow = '';

              if (lights === 6) {
                bgColor = 'bg-[#00ff00] border-[#4dff4d]';
                shadow = 'shadow-[0_0_50px_#00ff00]';
              } else if (lights >= idx) {
                bgColor = 'bg-[#E10600] border-[#ff4d4d]';
                shadow = 'shadow-[0_0_50px_#E10600]';
              }

              return (
                <div key={idx} className="flex flex-col space-y-4 md:space-y-6">
                  <div className={`w-8 h-8 md:w-20 md:h-20 rounded-full border-2 transition-all duration-100 ${bgColor} ${shadow}`} />
                  <div className={`w-8 h-8 md:w-20 md:h-20 rounded-full border-2 transition-all duration-100 ${bgColor} ${shadow}`} />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="font-sans font-bold absolute bottom-24 text-white/50 tracking-[0.5em] text-[10px] md:text-sm uppercase"
      >
        {started && (lights === 6 ? 'AND AWAY WE GO' : lights === 0 && started ? 'LIGHTS OUT...' : 'ARE YOU READY...')}
      </motion.p>

      {/* Skip Intro Button */}
      <button 
        onClick={skipIntro}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-[9px] md:text-[10px] uppercase font-mono text-white/30 hover:text-white transition-colors tracking-widest z-50 border-b border-white/0 hover:border-white/30 pb-0.5"
      >
        Skip Intro
      </button>
    </motion.div>
  );
};
