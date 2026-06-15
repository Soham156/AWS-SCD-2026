import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, AlertCircle, QrCode } from 'lucide-react';

interface Props {
  onLogin: (password: string) => Promise<boolean>;
}

export function ScannerLogin({ onLogin }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(password);
    if (!success) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-sm ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        <div className="border border-white/10 bg-[#0a0a0a] overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-f1-red to-aws-orange" />

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border border-white/10 flex items-center justify-center bg-white/5">
                <QrCode size={28} className="text-white/30" />
              </div>
            </div>

            <h1 className="font-sans font-black italic text-xl uppercase tracking-tight text-white text-center mb-1">
              Gate Scanner
            </h1>
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest text-center mb-6">
              Scanner Access Required
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 border border-f1-red/30 bg-f1-red/10 text-f1-red text-xs font-mono">
                <AlertCircle size={14} />
                Access Denied
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Enter scanner access code"
                className="w-full bg-[#050505] border border-white/10 px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:border-aws-orange focus:outline-none transition-colors mb-4"
                autoFocus
              />
              <button
                type="submit"
                className="w-full px-5 py-3 bg-f1-red text-white text-xs font-mono uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all"
              >
                Access Scanner
              </button>
            </form>
          </div>
        </div>

        {/* Shake keyframe */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
