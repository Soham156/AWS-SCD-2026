import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

if (typeof window !== 'undefined' && window.performance) {
  const navEntries = window.performance.getEntriesByType('navigation');
  if (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload') {
    sessionStorage.removeItem('scd_intro_played');
  } else if (window.performance.navigation && window.performance.navigation.type === 1) {
    sessionStorage.removeItem('scd_intro_played');
  }
}

const IDLE = "idle";
const RUNNING = "running";
const WAITING = "waiting";
const RESULT = "result";

const MESSAGES = {
  JUMP_START: [
    "Bro lost to patience. 🤡",
    "Green wasn't even ready. Neither were you. 💀",
    "Premature optimization. 👨‍💻",
    "Click first. Think never. 🗿",
    "Average engineering submission. 📉",
    "Bro saw absolutely nothing and committed. 🤝",
    "This explains your life decisions. 💀",
    "She wasn't ignoring you. You just rushed everything. 🤡",
    "Bro treats assumptions as facts. 🗿",
    "Patience left the chat. 🚪",
    "Clicked like he read the documentation. (He didn't.) 👨‍💻",
    "Your crush said \"wait\" and this happened. 💔",
    "Bro speedran disappointment. 🏃",
    "Reacted to pure imagination. 🌈",
    "Green screen still loading. Ego already clicked. 🤡",
    "This is why requirements gathering exists. 📋",
    "Bro interrupts loading screens. ⏭️",
    "Decision made with zero evidence. 📉",
    "Premature celebration detected. 🎉",
    "That's not reaction time. That's anxiety. 😭"
  ],
  TOO_FAST: [
    "Bro replied before she finished typing. 💀",
    "That's why she left you on read. 📖",
    "You're always available. That's the problem. 🤡",
    "She didn't want a boyfriend, she wanted some mystery. 🎭",
    "Bro treats every notification like an emergency. 🚨",
    "Seen in 0.1s. Ignored for 3 days. 📉",
    "That's not confidence. That's attachment issues. 💔",
    "Bro reacts faster than he thinks. 🗿",
    "Fast enough to reply. Not fast enough to matter. 💀",
    "Your crush wasn't impressed then either. 😭",
    "First viewer. Never first choice. 🥈",
    "Bro mistakes attention for affection. 🤝",
    "She replied \"lol\" and bro built a future. 🏗️",
    "Not fast. Desperate. 🤡",
    "Bro refreshes chats more than LinkedIn. 📱"
  ],
  FAST: [
    "Fast reaction. Slow character development. 📉",
    "Your crush still picked someone else. 💔",
    "Bro definitely double-texts. 📩",
    "She wanted ambition. You sent memes. 🤡",
    "Always online, never the priority. 📱",
    "Fast enough to reply. Not memorable enough to miss. 🗿",
    "Bro got \"aww\" instead of \"wow.\" 😭",
    "First viewer on every story, first choice on none. 🥈",
    "Fast fingers, weak aura. 📉",
    "You were available. Someone else was interesting. 💀",
    "She said \"you're sweet.\" It was over right there. 🪦",
    "Bro is everyone's backup plan. 🔄",
    "Fast reaction. Mid lore. 📖",
    "Your notification bar knows more love than you do. 📱",
    "Chronically online final boss. 👑"
  ],
  NORMAL: [
    "Exactly how your professors describe you. 📝",
    "HR calls this \"meets expectations.\" 📄",
    "Nobody noticed. Just like attendance. 🎓",
    "Perfectly forgettable performance. 🌫️",
    "The human equivalent of \"okay.\" 😐",
    "Bro came, clicked, existed. 🗿",
    "This score has no enemies and no fans. ⚖️",
    "Main character in absolutely nobody's story. 📚",
    "Peak background character energy. 🎬",
    "Your crush would scroll past this score. 📱",
    "Bro achieved statistical irrelevance. 📊",
    "Not bad enough to remember. Not good enough to mention. 🤝",
    "Group project passenger detected. 🚌",
    "Even mediocrity expected more. 📉",
    "Bro's biggest achievement this week. 🏆"
  ],
  SLOW: [
    "Thinking wasn't required. 💀",
    "Bro opened a committee meeting first. 🏛️",
    "She lost interest halfway through your reaction. 💔",
    "Opportunity missed successfully. 📉",
    "Bro writes \"Good morning\" at 4 PM. 🌅",
    "Your brain entered power-saving mode. 🔋",
    "Even your group members moved on. 🚶",
    "Decision pending forever. ⏳",
    "Bro still processing basic instructions. 🤖",
    "Overthinking won again. 🧠",
    "She gave hints. You requested documentation. 📋",
    "Average engineering student reflexes. 🎓",
    "Bro reacts like he's paying per click. 💸",
    "The moment passed. So did your chance. 🚪",
    "Even hesitation was embarrassed. 🤦"
  ],
  VERY_SLOW: [
    "Your crush got married emotionally. 💍",
    "Professor already picked someone else. 🎓",
    "Attendance already gone. 📉",
    "Placement cell skipped your name. 📄",
    "Entire conversation moved on. 🚶",
    "Bro reacts through postal service. 📬",
    "The opportunity left a voicemail. 📞",
    "Build completed before the click. 👨‍💻",
    "Even excuses arrived first. 🤡",
    "You missed the hint and the follow-up hint. 💀",
    "HR already chose the next candidate. 📋",
    "Bro reacts after the character arc ends. 📺",
    "The interview ended mentally. 🪦",
    "She stopped waiting years ago. 💔",
    "Even failure moved faster. 📉"
  ],
  DEAD_SLOW: [
    "Bro lives one semester behind. 📚",
    "Archaeologists found this reaction. 🏺",
    "History happened while you clicked. 📜",
    "Fossil-grade reflexes. 🦖",
    "Your project leader replaced you. 🔄",
    "The event became a memory. 📸",
    "Even the admin portal loaded first. 🌐",
    "Bro buffering in 4K. ⏳",
    "She said \"never mind\" already. 💔",
    "Bro is responding from another timeline. 🕰️",
    "Evolution is disappointed. 🐒",
    "The opportunity expired naturally. 📉",
    "You react like deadlines are optional. 🗓️",
    "Even BSNL called it slow. 📞",
    "Bro missed the moment and the replay. 🎥"
  ],
  DESTRUCTION: [
    "Bro reacts in business days. 📅",
    "Your internship started and ended. 💼",
    "Entire relationship arc completed. 💔",
    "Startup got funded and shut down. 📉",
    "Windows update finished first. 💻",
    "Future generations received your response. 👶",
    "Even dead group chats moved faster. 💀",
    "Scientists classified this as inactivity. 🔬",
    "Bro got outrun by a PDF download. 📄",
    "Your reaction arrived as a legacy update. 🗃️",
    "The war ended before this click. ⚔️",
    "Entire engineering degree completed. 🎓",
    "Your response needs parliamentary approval. 🏛️",
    "Human Benchmark filed a missing person report. 🚨",
    "Bro is still loading in the next attempt. ⏳"
  ]
};

const getRandomMessage = (timeDiff: number | null) => {
  if (timeDiff === null) {
    return {
      text: MESSAGES.JUMP_START[Math.floor(Math.random() * MESSAGES.JUMP_START.length)],
      color: "text-[#E10600] border-[#E10600]/30 shadow-[#E10600]/20"
    };
  }
  const s = timeDiff / 1000;
  let arr, color;
  if (s < 0.15) { arr = MESSAGES.TOO_FAST; color = "text-yellow-500 border-yellow-500/30 shadow-yellow-500/20"; }
  else if (s < 0.30) { arr = MESSAGES.FAST; color = "text-green-500 border-green-500/30 shadow-green-500/20"; }
  else if (s < 0.70) { arr = MESSAGES.NORMAL; color = "text-white/90 border-white/20 shadow-white/10"; }
  else if (s < 1.5) { arr = MESSAGES.SLOW; color = "text-orange-400 border-orange-400/30 shadow-orange-400/20"; }
  else if (s < 3) { arr = MESSAGES.VERY_SLOW; color = "text-orange-600 border-orange-600/30 shadow-orange-600/20"; }
  else if (s < 5) { arr = MESSAGES.DEAD_SLOW; color = "text-red-500 border-red-500/30 shadow-red-500/20"; }
  else { arr = MESSAGES.DESTRUCTION; color = "text-purple-500 border-purple-500/30 shadow-purple-500/20"; }

  return {
    text: arr[Math.floor(Math.random() * arr.length)],
    color
  };
};

export const Preloader = ({ onComplete }: { onComplete: () => void; key?: string }) => {
  const [gameState, setGameState] = useState(IDLE);
  const [lights, setLights] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [best, setBest] = useState<number>(parseInt(localStorage.getItem('scd_best_reaction') || '0'));
  const [shouldRender, setShouldRender] = useState(true);
  const [toastMsg, setToastMsg] = useState<{text: string, color: string} | null>(null);
  const [isLiteMode, setIsLiteMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('scd_lite_mode') !== 'false';
    }
    return true;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const fuzzerIdRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const lastPlayed = sessionStorage.getItem('scd_intro_played');
    if (lastPlayed) {
      setShouldRender(false);
      setTimeout(() => window.dispatchEvent(new Event('greenLight')), 50);
      onComplete();
    }

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      if (fuzzerIdRef.current) clearTimeout(fuzzerIdRef.current);
    };
  }, [onComplete]);

  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [shouldRender]);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
  };

  const playBeep = (freq: number, duration: number, type: OscillatorType = 'square') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const rampTime = Math.min(0.05, duration / 2);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + rampTime);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime + duration - rampTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const start = () => {
    setLights(0);
    setResult(null);
    setToastMsg(null);
    setGameState(RUNNING);
    initAudio();
    
    // Quick silent oscillator to unlock audio on iOS
    playBeep(400, 0.001);

    let current = 0;
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    if (fuzzerIdRef.current) clearTimeout(fuzzerIdRef.current);

    timerIdRef.current = setInterval(() => {
      current++;
      if (current === 5) {
        setLights(5);
        playBeep(400, 0.3);
        clearInterval(timerIdRef.current!);
        fuzzedLightsOut();
      } else {
        setLights(current);
        playBeep(400, 0.3);
      }
    }, 1000);
  };

  const fuzzedLightsOut = () => {
    const fuzzyInterval = Math.random() * 1800 + 2400;
    fuzzerIdRef.current = setTimeout(() => {
      setLights(0);
      startTimeRef.current = Date.now();
      setGameState(WAITING);
    }, fuzzyInterval);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent trigger if clicking the skip button
    if ((e.target as HTMLElement).closest('button')) return;

    if (gameState === IDLE || gameState === RESULT) {
      start();
    } else if (gameState === RUNNING) {
      setGameState(RESULT);
      setResult("JUMP START!");
      setToastMsg(getRandomMessage(null));
      setLights(0);
      playBeep(150, 0.8, 'sawtooth'); // Error buzz
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      if (fuzzerIdRef.current) clearTimeout(fuzzerIdRef.current);
    } else if (gameState === WAITING) {
      const timeDiff = Date.now() - startTimeRef.current;
      setResult(format(timeDiff));
      setToastMsg(getRandomMessage(timeDiff));
      setLights(6); // Green
      playBeep(800, 0.6);
      
      const currentBest = best;
      if (currentBest === 0 || timeDiff < currentBest) {
        setBest(timeDiff);
        localStorage.setItem('scd_best_reaction', timeDiff.toString());
      }
      setGameState(RESULT);
    }
  };

  const format = (ms: number) => {
    const secs = (ms / 1000).toFixed(3);
    return `${parseInt(secs) < 10 ? "0" : ""}${secs}s`;
  };

  const skipIntro = () => {
    sessionStorage.setItem('scd_intro_played', 'true');
    window.dispatchEvent(new Event('greenLight'));
    onComplete();
  };

  if (!shouldRender) return null;

  return (
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      onClick={handleClick}
      className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center bg-[#050505] flex-col relative overflow-hidden cursor-pointer"
    >
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}
      />

      <motion.div
        className={`absolute inset-0 bg-gradient-to-t pointer-events-none transition-colors duration-200 ${
          lights === 6 ? 'from-[#00ff00]/20 to-transparent' : 'from-[#E10600]/20 to-transparent'
        }`}
        animate={{ opacity: lights > 0 && lights <= 5 ? lights * 0.2 : lights === 6 ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <div className="flex flex-col items-center justify-center relative z-20 w-full h-full">
        {gameState === IDLE || gameState === RESULT ? (
          <div className="flex flex-col items-center justify-center gap-6">
            {result ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
                <h1 className={`text-5xl sm:text-7xl font-black italic tracking-tighter uppercase ${result === 'JUMP START!' ? 'text-[#E10600]' : 'text-white'}`}>
                  {result}
                </h1>
                {result && result !== 'JUMP START!' && parseFloat(result) > 4 && (
                  <p className="text-[#E10600] mt-4 font-mono uppercase tracking-widest font-bold text-lg">Bad Reaction Time!</p>
                )}
                {best > 0 && <p className="text-aws-orange mt-2 font-mono uppercase tracking-widest">Personal Best: {format(best)}</p>}
                <p className="mt-8 font-mono text-xs opacity-50 uppercase tracking-widest text-white/70 animate-pulse">
                  Click anywhere to try again
                </p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white uppercase mb-2">Reaction Time</h1>
                <p className="font-mono text-xs opacity-50 uppercase tracking-widest text-aws-orange mb-8">
                  Click when the 5 red lights go out.
                </p>
                <div className="px-8 py-4  bg-white/20 border-white/20 text-black uppercase tracking-widest font-black text-xl hover:bg-red-600/70 hover:text-white transition-colors">
                  Tap anywhere to begin 🏁
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="font-mono text-xs sm:text-sm uppercase tracking-widest text-aws-orange mb-8 text-center px-4"
            >
              {gameState === RUNNING ? "Wait for all 5 lights to go out..." : "CLICK NOW!"}
            </motion.p>
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
          </div>
        )}
      </div>

      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex flex-col items-end gap-5 z-50 max-md:pb-20 pb-1">
        
        {/* Toggle Switch & Description */}
        <div 
          className="flex flex-col items-end gap-2 group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiteMode(!isLiteMode);
          }}
        >
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono uppercase tracking-widest transition-colors ${!isLiteMode ? 'text-white' : 'text-white/40'}`}>
              Normal
            </span>
            <div className="w-10 h-5 bg-white/10 rounded-full relative border border-white/20 transition-colors">
              <div 
                className={`absolute top-[2px] w-4 h-4 rounded-full transition-all duration-300 ${
                  isLiteMode 
                    ? 'left-[20px] bg-aws-orange shadow-[0_0_10px_rgba(255,153,0,0.6)]' 
                    : 'left-[2px] bg-white'
                }`}
              />
            </div>
            <span className={`text-xs font-mono uppercase tracking-widest transition-colors ${isLiteMode ? 'text-aws-orange font-bold' : 'text-white/40'}`}>
              Lite
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-white/40 font-mono text-right max-w-[200px] leading-tight h-8">
            {isLiteMode 
              ? "Performance optimized. Removes heavy scroll animations." 
              : "High-end experience. Full 3D & smooth scroll animations."}
          </p>
        </div>

        {/* Enter Website Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (isLiteMode) {
              localStorage.setItem('scd_lite_mode', 'true');
              document.body.classList.add('lite-mode');
            } else {
              localStorage.setItem('scd_lite_mode', 'false');
              document.body.classList.remove('lite-mode');
            }
            window.dispatchEvent(new Event('scd_lite_mode_change'));
            skipIntro();
          }}
          className="text-xs md:text-sm uppercase font-mono text-white/70 hover:text-white transition-all tracking-widest cursor-pointer mt-2"
        >
          <div className='border-b border-white/30 hover:border-white flex justify-end items-end pb-1'>
            {gameState === IDLE ? 'Skip & Enter Website' : 'Enter Website'}
          </div>
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-32 sm:bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm pointer-events-none z-50"
          >
            <div className={`bg-[#111]/90 backdrop-blur-md border rounded-xl p-4 shadow-2xl text-center transition-colors duration-300 ${toastMsg.color}`}>
              <p className="font-sans text-sm sm:text-base font-bold">
                {toastMsg.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
