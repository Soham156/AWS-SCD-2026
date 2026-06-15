import { motion } from "motion/react";
import { CheckCircle, Mail, ExternalLink } from "lucide-react";
import { TicketPass } from "./TicketPass";
import type { PassType } from "../hooks/usePassTypes";

interface Props {
  ticketNumber: string;
  ticketId: string;
  fullName: string;
  email: string;
  selectedPass: PassType;
  qrToken?: string;
}

export function SuccessScreen({
  ticketNumber,
  ticketId,
  fullName,
  email,
  selectedPass,
  qrToken,
}: Props) {
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
      <div className="flex justify-center mb-4">
        <span
          className="inline-block px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: selectedPass.badge_color }}
        >
          {selectedPass.name}
        </span>
      </div>

      {/* Email notice */}
      <div className="flex items-center justify-center gap-2 text-white/50 text-xs font-mono mb-6">
        <Mail size={14} />
        <span>
          Your Paddock Pass is on its way to{" "}
          <span className="text-white">{email}</span>
        </span>
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

      {/* Ticket pass preview */}
      {qrToken && (
        <div className="mt-4">
          <TicketPass
            ticket_number={ticketNumber}
            full_name={fullName}
            pass_name={selectedPass.name}
            role="Attendee"
            organization=""
            qr_token={qrToken}
            badge_color={selectedPass.badge_color}
          />
        </div>
      )}
    </motion.div>
  );
}
