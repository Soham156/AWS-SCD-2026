import { useState } from 'react';
import { api } from '../../../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

const volunteerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  college: z.string().min(2, "College name must be at least 2 characters"),
  degree: z.string().min(1, "Degree must be selected"),
  other_degree: z.string().optional(),
  year: z.string().min(1, "Year must be selected"),
  branch: z.string().min(2, "Branch must be at least 2 characters"),
  confirm_ticket: z.boolean().refine(val => val === true, {
    message: "Required *"
  }),
  agree_policy: z.boolean().refine(val => val === true, {
    message: "Required *"
  }),
  agree_tasks_final: z.boolean().refine(val => val === true, {
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

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const InputField = ({ label, name, placeholder, type = "text", required = false, register, errors, prefix, maxLength, onKeyPress, onChange }: any) => (
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
        {...register(name, { onChange })}
        className={`bg-[#0a0a0a] border border-white/10 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/50 transition-colors text-sm w-full ${prefix ? 'border-l-0 rounded-l-none' : ''}`}
      />
    </div>
    {errors[name] && <span className="text-[#E10600] text-xs font-mono">{errors[name]?.message as string}</span>}
  </div>
);

const SelectField = ({ label, name, options, required = false, register, errors }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
    <select
      {...register(name)}
      className="bg-[#0a0a0a] border border-white/10 p-3 text-white focus:outline-none focus:border-aws-orange/50 transition-colors font-sans text-sm appearance-none"
    >
      <option value="">Select {label}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {errors[name] && <span className="text-[#E10600] text-xs font-mono">{errors[name]?.message as string}</span>}
  </div>
);

export const VolunteerForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      confirm_ticket: false,
      agree_policy: false,
      agree_tasks_final: false,
      degree: '',
      year: '',
    }
  });

  const selectedDegree = watch('degree');

  const onSubmit = async (data: VolunteerFormData) => {
    setStatus('loading');
    setErrorMessage('');
    
    // Normalize degree value if "Other" is chosen
    const finalDegree = data.degree === 'Other' ? data.other_degree : data.degree;

    try {
      await api.post('/api/applications/volunteer', {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        college: data.college,
        degree: finalDegree,
        year: data.year,
        branch: data.branch
      });
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF9900", "#FFC300", "#ffffff"]
      });
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.message || error.message || 'An unexpected error occurred');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#111] border border-aws-orange p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-aws-orange/20 flex items-center justify-center mb-4">
          <Send className="text-aws-orange" size={24} />
        </div>
        <h3 className="text-2xl font-black italic uppercase text-white mb-2">Application Submitted</h3>
        <p className="text-white/60 mb-6 max-w-md">
          Thank you for applying to volunteer at AWS Student Community Day. 
          Your email has been verified with a valid event pass, and your application is under review by the organizing team.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-widest transition-colors">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 bg-[#111] p-6 sm:p-10 border border-white/5">
      
      {/* Personal Info */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-aws-orange border-b border-white/10 pb-2 mb-6">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" name="full_name" placeholder="e.g. Jane Doe" required register={register} errors={errors} />
          <InputField label="Email Address" name="email" type="email" placeholder="name@email.com" required register={register} errors={errors} />
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
        <h4 className="text-lg font-black italic uppercase tracking-wider text-aws-orange border-b border-white/10 pb-2 mb-6">Academic Details</h4>
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

      {/* Verification Info */}
      <div className="bg-black/40 border border-white/5 p-5">
        <h4 className="text-xs font-mono text-white/50 uppercase tracking-widest mb-3">Event Pass Verification</h4>
        <p className="text-white/60 text-xs leading-relaxed mb-1">
          Ticket verification is completed automatically using your email address. 
          Please ensure that the email entered above matches the email address used to purchase your event ticket.
        </p>
      </div>

      {/* Declaration */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-aws-orange border-b border-white/10 pb-2 mb-6">Declaration</h4>
        
        <div className="flex flex-col gap-5">
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                {...register('confirm_ticket')}
                className="mt-1 accent-aws-orange bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0 shrink-0" 
              />
              <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
                I confirm that I have purchased a valid event ticket. <span className="text-[#E10600] font-bold">*</span>
              </span>
            </label>
            {errors.confirm_ticket && <span className="text-[#E10600] text-xs font-mono block mt-1 ml-7">{errors.confirm_ticket?.message}</span>}
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                {...register('agree_policy')}
                className="mt-1 accent-aws-orange bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0 shrink-0" 
              />
              <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
                I understand that volunteers are <strong>not provided complimentary passes</strong>, and I have read and agree to the volunteer policy. <span className="text-[#E10600] font-bold">*</span>
              </span>
            </label>
            {errors.agree_policy && <span className="text-[#E10600] text-xs font-mono block mt-1 ml-7">{errors.agree_policy?.message}</span>}
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                {...register('agree_tasks_final')}
                className="mt-1 accent-aws-orange bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0 shrink-0" 
              />
              <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
                I understand and agree that the task assigned to me as a volunteer will be final and will not be changed or interchanged. <span className="text-[#E10600] font-bold">*</span>
              </span>
            </label>
            {errors.agree_tasks_final && <span className="text-[#E10600] text-xs font-mono block mt-1 ml-7">{errors.agree_tasks_final?.message}</span>}
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
          className="w-full flex items-center justify-center gap-2 py-4 bg-aws-orange text-black font-sans font-black italic uppercase text-sm tracking-widest skew-x-[-12deg] transition-all hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,153,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="skew-x-[12deg] flex items-center gap-2">
            {status === 'loading' ? 'Verifying Ticket & Submitting...' : 'Submit Application'}
            <Send size={16} />
          </span>
        </button>
      </div>

    </form>
  );
};
