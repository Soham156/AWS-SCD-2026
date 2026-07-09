import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, Mail, ExternalLink, Copy, Check, Share2 } from "lucide-react";
// @ts-ignore
import confetti from "canvas-confetti";
import type { PassType } from "../hooks/usePassTypes";
import copy from 'copy-to-clipboard';

interface Props {
  ticketNumber: string;
  ticketId: string;
  fullName: string;
  email: string;
  selectedPass: PassType;
  qrToken?: string;
  quantity?: number;
  referralCode?: string;
}

export function SuccessScreen({
  ticketNumber,
  ticketId,
  fullName,
  email,
  selectedPass,
  qrToken,
  quantity = 1,
  referralCode,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ["#E10600", "#F2A900", "#ffffff", "#2563EB", "#10B981"],
        zIndex: 1000,
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const referralUrl = referralCode
    ? `${window.location.origin}/ticket?ref=${referralCode}`
    : null;

  const handleCopy = () => {
    if (!referralUrl) return;
    copy(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!referralCode) return;
    copy(referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    const shareData = {
      title: 'AWS Student Community Day 2026',
      text: `Hey! Use my referral link to grab your ticket for AWS Student Community Day Dhule 2026! 🚀`,
      url: referralUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="flex justify-center mb-6"
      >
        <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
          <CheckCircle className="text-emerald-500 w-16 h-16" />
        </div>
      </motion.div>

      {/* Heading */}
      <h2 className="font-sans font-black italic text-3xl sm:text-4xl text-white uppercase tracking-tighter mb-2">
        Registration Confirmed!
      </h2>
      <p className="text-white/60 font-mono text-xs sm:text-sm uppercase tracking-wider mb-8 max-w-md mx-auto">
        Welcome to the grid, <span className="text-white font-bold">{fullName}</span>. Your paddock pass is ready.
      </p>

      {/* Ticket Details Box */}
      <div className="max-w-md mx-auto bg-[#111] border border-white/5 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
        {/* Decorative corner lines */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
        
        {/* Pass Type Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
          <div>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">Paddock Pass</p>
            <h3 className="font-sans font-black italic text-xl text-white uppercase tracking-tight mt-1" style={{ color: selectedPass.badge_color }}>
              {selectedPass.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">Quantity</p>
            <p className="font-mono text-sm text-white font-bold mt-1">x{quantity}</p>
          </div>
        </div>

        {/* Ticket Reference Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">Ticket Ref</p>
            <p className="font-mono text-xs text-white font-semibold uppercase tracking-wider mt-1">{ticketNumber}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">Email Sent To</p>
            <p className="font-mono text-xs text-white/80 font-medium truncate mt-1">{email}</p>
          </div>
        </div>

        {/* Action Link to Ticket PDF */}
        {qrToken && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
            <a
              href={`/api/email/ticket/${ticketId}/download?token=${encodeURIComponent(qrToken)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-aws-orange text-black px-4 py-3 rounded-md font-mono text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              Download Ticket PDF
            </a>
            <a
              href={`/ticket/${ticketId}`}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/80 px-4 py-3 rounded-md font-mono text-xs uppercase tracking-widest font-bold hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <Mail size={14} />
              View Full Paddock Pass
            </a>
          </div>
        )}
      </div>

      {/* Referral Program Box */}
      {referralCode && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-sm mx-auto mt-2"
        >
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-aws-orange/20 rounded-xl p-6">
            <p className="text-lg mb-1">🎁</p>
            <h4 className="font-sans font-black italic text-sm uppercase tracking-tight text-aws-orange mb-2">
              Refer a Friend
            </h4>
            <p className="font-mono text-[11px] text-white/50 mb-4 leading-relaxed">
              Each successful referral earns you <span className="text-emerald-400 font-bold">25 points</span>.
              Top referrers win exciting prizes!
            </p>

            {/* Referral code display */}
            <div 
              onClick={handleCodeCopy}
              className="bg-[#0a0a0a] border border-dashed border-aws-orange/40 rounded-lg px-4 py-3 mb-4 cursor-pointer hover:bg-aws-orange/[0.03] transition-colors relative group"
              title="Click to copy code"
            >
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1">
                {codeCopied ? "Code Copied!" : "Your Code (Click to Copy)"}
              </p>
              <p className="font-mono text-xl font-bold text-aws-orange tracking-[0.3em]">
                {referralCode}
              </p>
            </div>

            {/* Copy + Share buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-all cursor-pointer rounded-md ${
                  copied
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-aws-orange text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-white transition-all cursor-pointer rounded-md"
              >
                <Share2 size={12} />
                Share
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
