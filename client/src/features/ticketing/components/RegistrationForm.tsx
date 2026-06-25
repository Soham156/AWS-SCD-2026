import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { z } from 'zod';
import { Loader2, AlertCircle, CheckCircle2, UserPlus, Trash2 } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';
import type { AttendeeData } from '../hooks/useRegistration';
import { api } from '../../../lib/api';

const attendeeSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit number').optional().or(z.literal('')),
  role: z.enum(['student', 'professional'], { message: 'Please select a role' }),
  organization: z.string().min(2, 'Organization is required'),
});

interface Props {
  selectedPass: PassType;
  initialAttendees?: AttendeeData[];
  verifiedEmail?: string;
  loading: boolean;
  error: string | null;
  onSubmit: (primaryEmail: string, attendees: AttendeeData[]) => void;
  onBack: () => void;
}

export function RegistrationForm({ selectedPass, initialAttendees, verifiedEmail, loading, error, onSubmit, onBack }: Props) {
  const [attendees, setAttendees] = useState<AttendeeData[]>(
    initialAttendees && initialAttendees.length > 0 
      ? initialAttendees 
      : [{
          full_name: '',
          email: '',
          phone: '',
          role: 'student',
          organization: '',
        }]
  );
  const [fieldErrors, setFieldErrors] = useState<Record<number, Record<string, string>>>({});
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(() => {
    return !!verifiedEmail && initialAttendees?.[0]?.email === verifiedEmail;
  });
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Realtime email validation state
  const [emailValidationStatus, setEmailValidationStatus] = useState<Record<string, 'checking' | 'registered' | 'available' | 'invalid'>>({});

  const primaryEmail = attendees[0]?.email;

  // Real-time email debounced checking
  useEffect(() => {
    const timeoutIds: NodeJS.Timeout[] = [];

    attendees.forEach((att) => {
      const email = att.email;
      if (!email) return;

      const isValidFormat = z.string().email().safeParse(email).success;
      
      if (!isValidFormat) {
        if (emailValidationStatus[email] !== 'invalid') {
          setEmailValidationStatus(prev => ({ ...prev, [email]: 'invalid' }));
        }
        return;
      }

      // If we already know the status, don't check again
      if (emailValidationStatus[email]) return;

      setEmailValidationStatus(prev => ({ ...prev, [email]: 'checking' }));

      const tid = setTimeout(async () => {
        try {
          const res = await api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
          setEmailValidationStatus(prev => ({ 
            ...prev, 
            [email]: res.data.registered ? 'registered' : 'available' 
          }));
        } catch (err) {
          setEmailValidationStatus(prev => {
            const next = { ...prev };
            delete next[email];
            return next;
          });
        }
      }, 500); // 500ms debounce
      timeoutIds.push(tid);
    });

    return () => timeoutIds.forEach(clearTimeout);
  }, [attendees, emailValidationStatus]);

  const updateField = (index: number, field: keyof AttendeeData, value: string) => {
    setAttendees(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    if (fieldErrors[index]?.[field]) {
      setFieldErrors(e => {
        const next = { ...e };
        if (next[index]) {
          const nextIndex = { ...next[index] };
          delete nextIndex[field];
          next[index] = nextIndex;
        }
        return next;
      });
    }
    // Reset OTP if primary email changes
    if (index === 0 && field === 'email') {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpError(null);
    }
  };

  const addMember = () => {
    if (attendees.length >= 10) return;
    setAttendees(prev => [...prev, {
      full_name: '',
      email: '',
      phone: '',
      role: 'student',
      organization: '',
    }]);
  };

  const removeMember = (indexToRemove: number) => {
    if (indexToRemove === 0) return; // Cannot remove primary buyer
    setAttendees(prev => prev.filter((_, i) => i !== indexToRemove));
    // Clear errors for this member and shift subsequent errors
    setFieldErrors(e => {
      const next: Record<number, Record<string, string>> = {};
      Object.keys(e).forEach(key => {
        const k = parseInt(key);
        if (k < indexToRemove) next[k] = e[k];
        if (k > indexToRemove) next[k - 1] = e[k];
      });
      return next;
    });
  };

  const handleSendOtp = async () => {
    if (!primaryEmail || !z.string().email().safeParse(primaryEmail).success) {
      setOtpError('Please enter a valid primary email first.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await api.post('/api/auth/send-otp', { email: primaryEmail });
      setOtpSent(true);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      await api.post('/api/auth/verify-otp', { email: primaryEmail, otp });
      setOtpVerified(true);
      setOtpError(null);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      setOtpError('Please verify the primary email before continuing.');
      return;
    }

    const isAnyEmailRegistered = attendees.some(att => emailValidationStatus[att.email] === 'registered');
    if (isAnyEmailRegistered) {
      setOtpError('One or more emails are already registered. Please use different emails.');
      return;
    }

    const isAnyEmailChecking = attendees.some(att => emailValidationStatus[att.email] === 'checking');
    if (isAnyEmailChecking) {
      setOtpError('Please wait while we validate the emails.');
      return;
    }

    const errors: Record<number, Record<string, string>> = {};
    let hasError = false;

    attendees.forEach((att, i) => {
      const result = attendeeSchema.safeParse(att);
      if (!result.success) {
        hasError = true;
        errors[i] = {};
        result.error.issues.forEach((issue) => {
          errors[i][issue.path[0] as string] = issue.message;
        });
      }
    });

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit(primaryEmail, attendees);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6 p-3 border border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-3 h-8 shrink-0" style={{ backgroundColor: selectedPass.badge_color }} />
          <div>
            <p className="font-sans font-black italic text-sm uppercase tracking-tight text-white">
              {selectedPass.name}
            </p>
            <p className="font-mono text-xs text-white/40">Total Attendees: {attendees.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 border border-f1-red/30 bg-f1-red/10 text-f1-red text-xs font-mono">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {attendees.map((attendee, index) => (
          <div key={index} className="space-y-4 border border-white/10 p-3 sm:p-5 bg-[#0a0a0a] relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-aws-orange uppercase text-sm">
                {index === 0 ? 'Primary Buyer (Attendee 1)' : `Attendee ${index + 1}`}
              </h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeMember(index)}
                  className="text-white/30 hover:text-f1-red transition-colors flex items-center gap-1 text-[10px] font-mono uppercase"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>

            {/* Email (with inline OTP for primary) */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                Email {index === 0 ? '*' : ''}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={attendee.email}
                  onChange={(e) => updateField(index, 'email', e.target.value)}
                  disabled={index === 0 && otpVerified}
                  className="flex-1 min-w-0 w-full bg-[#111] border border-white/10 px-4 py-2 text-sm text-white focus:border-aws-orange focus:outline-none"
                  placeholder="you@example.com"
                />
                {index === 0 && !otpVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !attendee.email || emailValidationStatus[attendee.email] === 'registered' || emailValidationStatus[attendee.email] === 'checking'}
                    className="w-full sm:w-auto shrink-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 size={14} className="animate-spin" /> : (otpSent ? 'Resend' : 'Verify')}
                  </button>
                )}
                {index === 0 && otpVerified && (
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 flex items-center gap-2 text-xs font-mono uppercase border border-emerald-500/30">
                    <CheckCircle2 size={14} /> Verified
                  </div>
                )}
              </div>
              
              {/* Real-time Validation UI */}
              {attendee.email && emailValidationStatus[attendee.email] === 'checking' && (
                <p className="text-white/40 text-[10px] font-mono mt-1 flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" /> Checking availability...
                </p>
              )}
              {attendee.email && emailValidationStatus[attendee.email] === 'registered' && (
                <p className="text-f1-red text-[10px] font-mono mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> This email is already registered.
                </p>
              )}
              {attendee.email && emailValidationStatus[attendee.email] === 'available' && (
                <p className="text-emerald-400 text-[10px] font-mono mt-1 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Email is available.
                </p>
              )}

              {fieldErrors[index]?.email && emailValidationStatus[attendee.email] !== 'registered' && (
                <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors[index].email}</p>
              )}
            </div>

            {/* OTP Field (only shows for primary when sent and not verified) */}
            {index === 0 && otpSent && !otpVerified && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-aws-orange mb-1.5">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-[#111] border border-aws-orange/50 px-4 py-2 text-sm text-white focus:border-aws-orange focus:outline-none tracking-[0.5em] font-mono"
                    placeholder="------"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length !== 6}
                    className="px-4 py-2 bg-aws-orange text-black font-bold text-xs font-mono uppercase hover:bg-white transition-colors"
                  >
                    {otpLoading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
                  </button>
                </div>
                {otpError && <p className="text-f1-red text-[10px] font-mono mt-1">{otpError}</p>}
                <p className="text-white/40 text-[10px] font-mono mt-2">We sent a verification code to {attendee.email}. Please check your inbox or spam folder.</p>
              </motion.div>
            )}

            {/* Full Name */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={attendee.full_name}
                onChange={(e) => updateField(index, 'full_name', e.target.value)}
                className="w-full min-w-0 bg-[#111] border border-white/10 px-4 py-2 text-sm text-white focus:border-aws-orange focus:outline-none"
              />
              {fieldErrors[index]?.full_name && (
                <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors[index].full_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={attendee.phone}
                  onChange={(e) => updateField(index, 'phone', e.target.value)}
                  className="w-full min-w-0 bg-[#111] border border-white/10 px-4 py-2 text-sm text-white focus:border-aws-orange focus:outline-none"
                  maxLength={10}
                />
                {fieldErrors[index]?.phone && (
                  <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors[index].phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                  Role *
                </label>
                <select
                  value={attendee.role}
                  onChange={(e) => updateField(index, 'role', e.target.value)}
                  className="w-full min-w-0 bg-[#111] border border-white/10 px-4 py-2 text-sm text-white focus:border-aws-orange focus:outline-none"
                >
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                College / Organization *
              </label>
              <input
                type="text"
                value={attendee.organization}
                onChange={(e) => updateField(index, 'organization', e.target.value)}
                className="w-full min-w-0 bg-[#111] border border-white/10 px-4 py-2 text-sm text-white focus:border-aws-orange focus:outline-none"
              />
              {fieldErrors[index]?.organization && (
                <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors[index].organization}</p>
              )}
            </div>
          </div>
        ))}

        {attendees.length < 10 && (
          <button
            type="button"
            onClick={addMember}
            className="w-full py-4 border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest"
          >
            <UserPlus size={16} /> Add another member
          </button>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 border border-white/20 text-white/60 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading || !otpVerified}
            className={`flex-1 px-5 py-3 text-white text-xs font-mono uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${
              otpVerified ? 'bg-f1-red hover:bg-white hover:text-black' : 'bg-f1-red/50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              'Continue to Summary'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
