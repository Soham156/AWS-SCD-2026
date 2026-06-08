import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Ban } from 'lucide-react';

type ScanStatus = 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'NOT_PAID' | null;

interface ScanResult {
  status: ScanStatus;
  attendee_name?: string;
  ticket_number?: string;
  pass_slug?: string;
  organization?: string;
  checked_in_at?: string;
}

interface Props {
  result: ScanResult | null;
  onDismiss: () => void;
}

// Web Audio API for feedback sounds
function playSound(type: 'success' | 'error') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {
    // Audio not supported, silent fail
  }
}

const statusConfig: Record<string, { bg: string; icon: any; title: string; color: string }> = {
  VALID: {
    bg: 'from-emerald-900/95 to-emerald-950/95',
    icon: CheckCircle,
    title: 'ACCESS GRANTED',
    color: 'text-emerald-400',
  },
  ALREADY_CHECKED_IN: {
    bg: 'from-red-900/95 to-red-950/95',
    icon: AlertTriangle,
    title: 'ALREADY CHECKED IN',
    color: 'text-red-400',
  },
  INVALID: {
    bg: 'from-red-900/95 to-red-950/95',
    icon: XCircle,
    title: 'INVALID TICKET',
    color: 'text-red-400',
  },
  NOT_PAID: {
    bg: 'from-red-900/95 to-red-950/95',
    icon: Ban,
    title: 'PAYMENT PENDING',
    color: 'text-red-400',
  },
};

export function ScanFeedback({ result, onDismiss }: Props) {
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    if (!result?.status) {
      soundPlayedRef.current = false;
      return;
    }

    if (!soundPlayedRef.current) {
      playSound(result.status === 'VALID' ? 'success' : 'error');
      soundPlayedRef.current = true;
    }

    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [result, onDismiss]);

  return (
    <AnimatePresence>
      {result?.status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b ${statusConfig[result.status]?.bg || statusConfig.INVALID.bg}`}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {(() => {
              const config = statusConfig[result.status] || statusConfig.INVALID;
              const Icon = config.icon;
              return (
                <>
                  <Icon size={80} className={`${config.color} mx-auto mb-6`} />
                  <h2 className={`font-mono text-2xl font-bold ${config.color} text-center mb-4 tracking-wider`}>
                    {config.title}
                  </h2>
                </>
              );
            })()}
          </motion.div>

          {result.status === 'VALID' && (
            <div className="text-center mt-2">
              <p className="font-sans font-black italic text-3xl text-white uppercase tracking-tight mb-2">
                {result.attendee_name}
              </p>
              <p className="font-mono text-sm text-white/60 mb-1">{result.ticket_number}</p>
              <p className="font-mono text-xs text-aws-orange uppercase tracking-widest">
                {result.pass_slug} pass
              </p>
              {result.organization && (
                <p className="font-mono text-xs text-white/40 mt-1">{result.organization}</p>
              )}
            </div>
          )}

          {result.status === 'ALREADY_CHECKED_IN' && result.checked_in_at && (
            <p className="font-mono text-xs text-white/40 mt-2">
              Checked in at {new Date(result.checked_in_at).toLocaleTimeString()}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
