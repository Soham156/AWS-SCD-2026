import React from 'react';
import { motion } from 'motion/react';

export const TelemetryData = ({ label, value, color = "text-aws-orange" }: { label: string, value: string, color?: string }) => (
  <div className="flex flex-col">
    <span className="font-sans text-[10px] uppercase opacity-50 tracking-[0.2em] font-bold">{label}</span>
    <span className={`font-mono text-xs font-black ${color}`}>{value}</span>
  </div>
);

export const AngledButton: React.FC<{ children: React.ReactNode, primary?: boolean, onClick?: () => void }> = ({ children, primary = true, onClick }) => {
  const base = "relative px-8 py-3 font-sans font-bold uppercase text-xs tracking-widest skew-x-[-12deg] transition-colors";
  const style = primary
    ? "bg-f1-red text-white hover:bg-white hover:text-black"
    : "border border-white/20 text-white hover:bg-white/10";

  return (
    <button className={`${base} ${style}`} onClick={onClick}>
      <span className="relative z-10 flex items-center space-x-2 skew-x-[12deg]">{children}</span>
    </button>
  );
}

export const SectionHeader = ({ title, subtitle, sysId, action }: { title: string, subtitle: string, sysId: string, action?: React.ReactNode }) => (
  <div className="mb-12 relative flex flex-col items-start gap-2 z-10">
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="text-[10px] text-aws-orange uppercase font-bold tracking-[0.2em]">
          {sysId} / {title}
        </div>
        {action && <div>{action}</div>}
      </div>
      <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
        {title}
      </h2>
      {subtitle && (
        <p className="font-sans text-xs sm:text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-xl mt-3 sm:mt-4">
          {subtitle}
        </p>
      )}
    </motion.div>
  </div>
);

export const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 py-6 sm:py-10 px-4 sm:px-12 lg:px-24">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <span className="font-mono text-[10px] text-white/20 uppercase tracking-[0.3em] shrink-0">{label}</span>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
  </div>
);
