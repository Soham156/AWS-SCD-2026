import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-f1-red/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-4">
        
        {/* Main 404 Image */}
        <div className="relative w-full max-w-lg mb-0">
          <img 
            src="/404-car.png" 
            alt="404 Not Found Car" 
            className="w-full h-auto drop-shadow-[0_0_30px_rgba(255,24,1,0.3)] animate-[float_6s_ease-in-out_infinite]"
          />
          {/* Subtle glow behind car */}
          <div className="absolute inset-0 bg-f1-red/20 blur-3xl -z-10 rounded-full" />
        </div>

        {/* Text Content */}
        <div className="text-center">
          <h1 className="font-black italic text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-f1-red to-aws-orange uppercase tracking-tighter mb-4 drop-shadow-lg">
            Box Box Box!
          </h1>
          <p className="font-mono text-sm md:text-base text-white/60 mb-8 max-w-lg mx-auto uppercase tracking-widest leading-relaxed">
            You've taken a wrong turn off the circuit. This page doesn't exist or has been moved to the pit lane.
          </p>

          <Link
            to="/"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white font-mono text-xs uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-black overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-f1-red to-aws-orange opacity-0 group-hover:opacity-10 transition-opacity" />
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Return to Track
          </Link>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
