import { useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle, Mail, ExternalLink } from "lucide-react";
// @ts-ignore
import confetti from "canvas-confetti";
import { TicketPass } from "./TicketPass";
import type { PassType } from "../hooks/usePassTypes";

interface Props {
  ticketNumber: string;
  ticketId: string;
  fullName: string;
  email: string;
  selectedPass: PassType;
  qrToken?: string;
  quantity?: number;
}

export function SuccessScreen({
  ticketNumber,
  ticketId,
  fullName,
  email,
  selectedPass,
  qrToken,
  quantity = 1,
}: Props) {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mb-6"
      >
        <CheckCircle size={56} className="text-emerald-400 mx-auto" />
      </motion.div>

      <h3 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white mb-2">
        You're on the Grid!
      </h3>

      {/* Ticket number */}
      <div className="inline-block px-5 py-3 bg-[#0a0a0a] border border-white/20 mb-4">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">
          Ticket Number
        </p>
        <p className="font-mono text-2xl font-bold text-aws-orange tracking-wider">
          {ticketNumber}
        </p>
      </div>

      {/* Pass badge */}
      <div className="flex justify-center mb-6">
        <span
          className="inline-block px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: selectedPass.badge_color }}
        >
          {selectedPass.name}
        </span>
      </div>

      {/* Email notice */}
      <div className="max-w-sm mx-auto flex flex-col items-center justify-center gap-2 text-white/70 text-xs font-mono mb-8 text-center bg-white/5 border border-white/10 p-5 rounded-xl">
        <Mail size={18} className="text-aws-orange mb-1" />
        {quantity > 1 ? (
          <span>
            <span className="text-white font-bold block mb-1 text-sm">Group Registration Confirmed</span>
            All {quantity} Paddock Passes are on their way to <span className="text-white font-bold">{email}</span>.<br/><br/>
            An individual copy has also been sent to each attendee's personal email!
          </span>
        ) : (
          <span>
            Your Paddock Pass is on its way to{" "}
            <span className="text-white font-bold">{email}</span>
          </span>
        )}
      </div>

      {/* View ticket link */}
      <a
        href={`/ticket/${ticketId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 border border-aws-orange/30 text-aws-orange text-xs font-mono uppercase tracking-widest hover:bg-aws-orange hover:text-black transition-all mb-8"
      >
        <ExternalLink size={12} />
        View Full Paddock Pass
      </a>
    </motion.div>
  );
}
