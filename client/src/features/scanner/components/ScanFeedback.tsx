import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Ban } from 'lucide-react';

type ScanStatus = 'VALID' | 'CHECKIN_SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'NOT_PAID' | null;

interface ScanResult {
  status: ScanStatus;
  id?: string;
  attendee_name?: string;
  ticket_number?: string;
  pass_slug?: string;
  organization?: string;
  checked_in_at?: string;
}

interface Props {
  result: ScanResult | null;
  onDismiss: () => void;
  onConfirm: (id: string) => Promise<void>;
  isConfirming: boolean;
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
    bg: 'from-blue-950/95 to-slate-950/95',
    icon: CheckCircle,
    title: 'TICKET VERIFIED',
    color: 'text-blue-400',
  },
  CHECKIN_SUCCESS: {
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

export function ScanFeedback({ result, onDismiss, onConfirm, isConfirming }: Props) {
  const soundPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!result?.status) {
      soundPlayedRef.current = null;
      return;
    }

    if (soundPlayedRef.current !== result.status) {
      if (result.status === 'CHECKIN_SUCCESS') {
        playSound('success');
      } else if (['ALREADY_CHECKED_IN', 'INVALID', 'NOT_PAID'].includes(result.status)) {
        playSound('error');
      }
      soundPlayedRef.current = result.status;
    }

    if (result.status !== 'VALID') {
      const timer = setTimeout(onDismiss, result.status === 'CHECKIN_SUCCESS' ? 2000 : 3000);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  return (
    <AnimatePresence>
      {result?.status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b ${statusConfig[result.status]?.bg || statusConfig.INVALID.bg} p-6`}
          onClick={() => {
            if (result.status !== 'VALID' && !isConfirming) {
              onDismiss();
            }
          }}
        >
          <div 
            className="w-full max-w-md flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.95 }}
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

            {(result.status === 'VALID' || result.status === 'CHECKIN_SUCCESS' || result.status === 'ALREADY_CHECKED_IN') && (
              <div className="text-center mt-2 w-full">
                <p className="font-sans font-black italic text-3xl text-white uppercase tracking-tight mb-2 break-words px-4">
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
              <p className="font-mono text-xs text-white/40 mt-4">
                Checked in at {new Date(result.checked_in_at).toLocaleTimeString()}
              </p>
            )}

            {result.status === 'VALID' && result.id && (
              <div className="mt-8 flex flex-col gap-3 w-full px-4">
                <button type="button"
                  disabled={isConfirming}
                  onClick={() => onConfirm(result.id!)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 active:scale-95 transition-all text-black font-sans font-black italic tracking-wide py-4 uppercase border border-emerald-400 cursor-pointer flex justify-center items-center"
                >
                  {isConfirming ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      CONFIRMING...
                    </span>
                  ) : (
                    'CONFIRM CHECK-IN'
                  )}
                </button>
                <button type="button"
                  disabled={isConfirming}
                  onClick={onDismiss}
                  className="w-full border border-white/20 hover:bg-white/10 disabled:opacity-50 active:scale-95 transition-all text-white font-mono text-xs tracking-wider py-3 uppercase cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            )}

            {result.status !== 'VALID' && (
              <button type="button"
                onClick={onDismiss}
                className="mt-8 border border-white/20 hover:bg-white/10 active:scale-95 transition-all text-white font-mono text-xs tracking-wider px-6 py-2.5 uppercase cursor-pointer"
              >
                CLOSE
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
