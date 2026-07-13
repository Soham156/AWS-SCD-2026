import { useState } from 'react';
import { api } from '../../../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';

const mpdSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  college: z.string().min(2, "College name must be at least 2 characters"),
  degree: z.string().min(1, "Degree must be selected"),
  other_degree: z.string().optional(),
  year: z.string().min(1, "Year must be selected"),
  branch: z.string().min(2, "Branch must be at least 2 characters"),
  past_experience: z.string().min(10, "Past experiences must be at least 10 characters"),
  english_fluency: z.string().min(1, "English fluency level must be selected"),
  is_female: z.boolean().refine(val => val === true, {
    message: "Required *"
  }),
  agree_interview: z.boolean().refine(val => val === true, {
    message: "Required *"
  }),
  agree_coc: z.boolean().refine(val => val === true, {
    message: "Required *"
  }),
}).superRefine((data, ctx) => {
  if (data.degree === 'Other' && (!data.other_degree || data.other_degree.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify your degree",
      path: ["other_degree"]
    });
  }
});

type MpdFormData = z.infer<typeof mpdSchema>;

const InputField = ({ label, name, placeholder, type = "text", required = false, register, errors, prefix, maxLength, onKeyPress, onChange, readOnly }: any) => (
  <div className="flex flex-col gap-1.5 font-sans">
    <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
    <div className="flex relative">
      {prefix && (
        <span className="flex items-center bg-[#111] border border-white/10 border-r-0 px-3.5 text-white/40 font-mono text-sm select-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
        readOnly={readOnly}
        {...register(name, { onChange })}
        className={`wit-input bg-[#0a0a0a] border border-white/10 hover:border-pink-500/30 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:shadow-[0_0_10px_rgba(236,72,153,0.15)] transition-all text-sm w-full ${prefix ? 'border-l-0 rounded-l-none' : ''} ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
    {errors[name] && <span className="text-[#E10600] text-xs font-mono">{errors[name]?.message as string}</span>}
  </div>
);

const SelectField = ({ label, name, options, required = false, register, errors, disabled }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
    <select
      {...register(name)}
      disabled={disabled}
      className={`wit-input bg-[#0a0a0a] border border-white/10 hover:border-pink-500/30 p-3 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:shadow-[0_0_10px_rgba(236,72,153,0.15)] transition-all font-sans text-sm appearance-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="">Select {label}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {errors[name] && <span className="text-[#E10600] text-xs font-mono">{errors[name]?.message as string}</span>}
  </div>
);

export const MpdForm = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<MpdFormData>({
    resolver: zodResolver(mpdSchema),
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      college: '',
      degree: '',
      year: '',
      branch: '',
      past_experience: '',
      english_fluency: '',
      is_female: false,
      agree_interview: false,
      agree_coc: false,
    }
  });

  const selectedDegree = watch('degree');
  const emailVal = watch('email');

  const handleVerifyTicket = async () => {
    setVerifyError('');
    // Trigger validation for email field only first
    const isEmailValid = await trigger('email');
    if (!isEmailValid) return;

    setVerifying(true);
    try {
      const response = await api.get(`/api/applications/verify-ticket`, {
        params: { email: emailVal }
      });
      
      if (response.data?.success) {
        setIsVerified(true);
        // Autofill fields
        const { full_name, phone, college } = response.data.data;
        if (full_name) setValue('full_name', full_name);
        if (phone) {
          // Normalize phone (strip +91 prefix if present)
          const cleanPhone = phone.replace(/^\+91/, '').replace(/\s+/g, '');
          setValue('phone', cleanPhone);
        }
        if (college) setValue('college', college);
      } else {
        setVerifyError('Failed to verify ticket.');
      }
    } catch (error: any) {
      console.error(error);
      setVerifyError(error.response?.data?.message || 'No valid Paddock Pass associated with this email.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResetVerification = () => {
    setIsVerified(false);
    setValue('full_name', '');
    setValue('phone', '');
    setValue('college', '');
  };

  const onSubmit = async (data: MpdFormData) => {
    if (!isVerified) {
      setErrorMessage('Please verify your email/ticket first.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    
    // Normalize degree value if "Other" is chosen
    const finalDegree = data.degree === 'Other' ? data.other_degree : data.degree;

    try {
      await api.post('/api/applications/mpd', {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        college: data.college,
        degree: finalDegree,
        year: data.year,
        branch: data.branch,
        past_experience: data.past_experience,
        english_fluency: data.english_fluency,
      });
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#d946ef", "#ffffff"]
      });
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || error.message || 'An unexpected error occurred');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#111] border border-pink-500 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-4">
          <CheckCircle className="text-pink-500" size={24} />
        </div>
        <h3 className="text-2xl font-black italic uppercase text-white mb-2">Application Submitted</h3>
        <p className="text-white/60 mb-6 max-w-md">
          Thank you for applying to be a moderator for the panel discussions. 
          Your email has been verified as a Paddock Pass holder, and your application is under review.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-widest transition-colors">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .wit-input:focus-visible {
          outline: 2px solid #ec4899 !important;
          outline-offset: 3px;
        }
      `}} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 bg-[#111] p-6 sm:p-10 border border-white/5">
      
      {/* Step 1: Ticket Verification */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2 mb-6 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">Step 1: Paddock Pass Verification</h4>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <InputField 
                label="Email Address" 
                name="email" 
                type="email" 
                placeholder="name@email.com" 
                required 
                register={register} 
                errors={errors} 
                readOnly={isVerified}
              />
            </div>
            {!isVerified ? (
              <button
                type="button"
                onClick={handleVerifyTicket}
                disabled={verifying}
                className="w-full sm:w-auto h-[46px] px-6 bg-pink-500 hover:bg-white text-black font-mono text-xs uppercase tracking-widest font-bold transition-colors shrink-0 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(236,72,153,0.3)]"
              >
                {verifying && <Loader2 size={14} className="animate-spin" />}
                {verifying ? 'Verifying...' : 'Verify Ticket'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetVerification}
                className="w-full sm:w-auto h-[46px] px-6 bg-white/10 hover:bg-[#E10600]/20 hover:text-[#E10600] text-white font-mono text-xs uppercase tracking-widest transition-colors shrink-0"
              >
                Change Email
              </button>
            )}
          </div>
          
          {isVerified && (
            <div className="bg-[#00ff00]/5 border border-[#00ff00]/20 p-4 text-xs font-mono text-[#00ff00] flex items-center gap-2">
              <CheckCircle size={16} className="shrink-0" />
              <span>Ticket verified successfully! Please complete the form below.</span>
            </div>
          )}

          {verifyError && (
            <div className="flex flex-col gap-2">
              <div className="bg-[#E10600]/5 border border-[#E10600]/20 p-4 text-xs font-mono text-[#E10600] flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{verifyError}</span>
              </div>
              <div className="text-left px-1">
                <Link 
                  to="/ticket" 
                  className="inline-flex items-center gap-1.5 text-xs text-pink-500 hover:text-pink-400 font-mono font-bold uppercase tracking-widest transition-colors hover:underline"
                >
                  Buy Paddock Pass &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {isVerified && (
        <>
          {/* Personal Info */}
          <div>
            <h4 className="text-lg font-black italic uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2 mb-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.2)]">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" name="full_name" placeholder="e.g. Jane Doe" required register={register} errors={errors} />
              <InputField 
                label="Mobile Number" 
                name="phone" 
                placeholder="9876543210" 
                required 
                register={register} 
                errors={errors} 
                prefix="+91" 
                maxLength={10}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
              />
            </div>
          </div>

          {/* Academic Details */}
          <div>
            <h4 className="text-lg font-black italic uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2 mb-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.2)]">Academic Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="College" name="college" placeholder="e.g. SVKM's IOT, Dhule" required register={register} errors={errors} />
              <InputField label="Branch" name="branch" placeholder="e.g. Computer Engineering" required register={register} errors={errors} />
              
              <SelectField 
                label="Degree" 
                name="degree" 
                options={["B.E. / B.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "MBA", "Diploma", "Other"]} 
                required 
                register={register} 
                errors={errors} 
              />

              <SelectField 
                label="Year of Studying" 
                name="year" 
                options={["First Year", "Second Year", "Third Year", "Final Year"]} 
                required 
                register={register} 
                errors={errors} 
              />

              {selectedDegree === 'Other' && (
                <div className="md:col-span-2">
                  <InputField label="Specify Degree" name="other_degree" placeholder="e.g. B.Com, BBA, PhD" required register={register} errors={errors} />
                </div>
              )}
            </div>
          </div>

          {/* Moderator Qualifications */}
          <div>
            <h4 className="text-lg font-black italic uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2 mb-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.2)]">Moderator Profile</h4>
            <div className="grid grid-cols-1 gap-6">
              <SelectField 
                label="English Fluency Level" 
                name="english_fluency" 
                options={["Native", "Fluent", "Conversational", "Basic"]} 
                required 
                register={register} 
                errors={errors} 
              />

              <div className="flex flex-col gap-1.5 font-sans">
                <label className="text-xs font-mono text-white/50 uppercase tracking-widest">Past Experiences as Anchor/Host *</label>
                <textarea
                  placeholder="Tell us about your previous experience anchoring or hosting events (e.g. college fests, seminars, panel discussions, etc.). Describe your role and event size."
                  rows={4}
                  {...register('past_experience')}
                  className="wit-input bg-[#0a0a0a] border border-white/10 hover:border-pink-500/30 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:shadow-[0_0_10px_rgba(236,72,153,0.15)] transition-all text-sm w-full font-sans resize-none"
                />
                {errors.past_experience && <span className="text-[#E10600] text-xs font-mono">{errors.past_experience?.message}</span>}
              </div>
            </div>
          </div>

          {/* Declarations */}
          <div>
            <h4 className="text-lg font-black italic uppercase tracking-wider text-pink-500 border-b border-white/10 pb-2 mb-6 drop-shadow-[0_0_8px_rgba(236,72,153,0.2)]">Declarations</h4>
            
            <div className="flex flex-col gap-5">
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register('is_female')}
                    className="mt-1 accent-pink-500 bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0 shrink-0" 
                  />
                  <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
                    I confirm that I am a female candidate applying for this opportunity. <span className="text-[#E10600] font-bold">*</span>
                  </span>
                </label>
                {errors.is_female && <span className="text-[#E10600] text-xs font-mono block mt-1 ml-7">{errors.is_female?.message}</span>}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register('agree_interview')}
                    className="wit-input mt-1 accent-pink-500 bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0 shrink-0" 
                  />
                  <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
                    I understand that selection is purely based on interview evaluations. <span className="text-[#E10600] font-bold">*</span>
                  </span>
                </label>
                {errors.agree_interview && <span className="text-[#E10600] text-xs font-mono block mt-1 ml-7">{errors.agree_interview?.message}</span>}
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register('agree_coc')}
                    className="wit-input mt-1 accent-pink-500 bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0 shrink-0" 
                  />
                  <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
                    I agree to abide by the Student Community Day Dhule 2026{' '}
                    <Link to="/codeofconduct" target="_blank" className="text-pink-500 hover:text-pink-400 font-bold underline underline-offset-2 transition-colors">
                      Code of Conduct
                    </Link>. <span className="text-[#E10600] font-bold">*</span>
                  </span>
                </label>
                {errors.agree_coc && <span className="text-[#E10600] text-xs font-mono block mt-1 ml-7">{errors.agree_coc?.message}</span>}
              </div>
            </div>
          </div>

          {/* Submission Feedback */}
          {status === 'error' && (
            <div className="bg-[#E10600]/10 border border-[#E10600]/30 p-4 text-xs font-mono text-[#E10600] flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Button */}
          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-4 bg-pink-500 text-black font-sans font-black italic uppercase text-sm tracking-widest skew-x-[-12deg] transition-all hover:bg-white hover:text-black shadow-[0_0_15px_rgba(236,72,153,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="skew-x-[12deg] flex items-center gap-2">
                {status === 'loading' ? 'Submitting Application...' : 'Submit Application'}
                <Send size={16} />
              </span>
            </button>
          </div>
        </>
      )}
    </form>
    </>
  );
};
