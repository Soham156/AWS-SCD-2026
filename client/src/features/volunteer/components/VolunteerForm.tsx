import { useState } from 'react';
import { api } from '../../../lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, AlertTriangle } from 'lucide-react';

const volunteerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  confirm_ticket: z.boolean().refine(val => val === true, {
    message: "You must confirm you have a ticket"
  }),
  agree_policy: z.boolean().refine(val => val === true, {
    message: "You must agree to the volunteer policy"
  }),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;

const InputField = ({ label, name, placeholder, type = "text", required = false, register, errors }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
    <input
      type={type}
      placeholder={placeholder}
      {...register(name)}
      className="bg-[#0a0a0a] border border-white/10 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/50 transition-colors font-sans text-sm"
    />
    {errors[name] && <span className="text-[#E10600] text-xs font-mono">{errors[name]?.message as string}</span>}
  </div>
);

export const VolunteerForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      confirm_ticket: false,
      agree_policy: false,
    }
  });

  const onSubmit = async (data: VolunteerFormData) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      await api.post('/api/applications/volunteer', {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone
      });
      setStatus('success');
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
        <div className="grid grid-cols-1 gap-6">
          <InputField label="Full Name" name="full_name" placeholder="e.g. Jane Doe" required register={register} errors={errors} />
          <InputField label="Email Address" name="email" type="email" placeholder="name@email.com" required register={register} errors={errors} />
          <InputField label="Mobile Number" name="phone" placeholder="+91 99999 99999" required register={register} errors={errors} />
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
        
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              {...register('confirm_ticket')}
              className="mt-1 accent-aws-orange bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0" 
            />
            <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
              I confirm that I have purchased a valid event ticket.
            </span>
          </label>
          {errors.confirm_ticket && <span className="text-[#E10600] text-xs font-mono -mt-2 ml-7">{errors.confirm_ticket?.message}</span>}

          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              {...register('agree_policy')}
              className="mt-1 accent-aws-orange bg-[#0a0a0a] border border-white/10 rounded w-4 h-4 focus:ring-0 focus:ring-offset-0" 
            />
            <span className="text-white/70 text-xs sm:text-sm font-sans select-none group-hover:text-white transition-colors leading-relaxed">
              I understand that volunteers are <strong>not provided complimentary passes</strong>, and I have read and agree to the volunteer policy.
            </span>
          </label>
          {errors.agree_policy && <span className="text-[#E10600] text-xs font-mono -mt-2 ml-7">{errors.agree_policy?.message}</span>}
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
