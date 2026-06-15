import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';

const speakerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(2, "City is required"),
  organization: z.string().min(2, "Organization is required"),
  designation: z.string().min(2, "Designation is required"),
  linkedin_url: z.string().url("Must be a valid URL"),
  portfolio_url: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  session_title: z.string().min(5, "Session title is required"),
  session_abstract: z.string().min(20, "Session abstract must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  session_level: z.string().min(1, "Level is required"),
  duration: z.string().min(1, "Duration is required"),
  bio: z.string().min(20, "Biography must be at least 20 characters"),
  previous_experience: z.string().optional(),
  notes: z.string().optional()
});

type SpeakerFormData = z.infer<typeof speakerSchema>;

export const SpeakerForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<SpeakerFormData>({
    resolver: zodResolver(speakerSchema)
  });

  const onSubmit = async (data: SpeakerFormData) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/applications/speaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message || 'Failed to submit application');
      
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-[#111] border border-aws-orange p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-aws-orange/20 flex items-center justify-center mb-4">
          <Send className="text-aws-orange" size={24} />
        </div>
        <h3 className="text-2xl font-black italic uppercase text-white mb-2">CFP Submitted</h3>
        <p className="text-white/60 mb-6">Thank you for applying to speak at AWS Student Community Day. Our team will review your proposal and get back to you soon.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-widest transition-colors">
          Submit Another
        </button>
      </div>
    );
  }

  const InputField = ({ label, name, placeholder, type = "text", required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="bg-[#0a0a0a] border border-white/10 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/50 transition-colors font-sans text-sm"
      />
      {errors[name as keyof SpeakerFormData] && <span className="text-[#E10600] text-xs font-mono">{errors[name as keyof SpeakerFormData]?.message as string}</span>}
    </div>
  );

  const SelectField = ({ label, name, options, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
      <select
        {...register(name)}
        className="bg-[#0a0a0a] border border-white/10 p-3 text-white focus:outline-none focus:border-aws-orange/50 transition-colors font-sans text-sm appearance-none"
      >
        <option value="">Select {label.replace(' *', '')}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {errors[name as keyof SpeakerFormData] && <span className="text-[#E10600] text-xs font-mono">{errors[name as keyof SpeakerFormData]?.message as string}</span>}
    </div>
  );

  const TextAreaField = ({ label, name, placeholder, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
      <textarea
        placeholder={placeholder}
        rows={4}
        {...register(name)}
        className="bg-[#0a0a0a] border border-white/10 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-aws-orange/50 transition-colors font-sans text-sm resize-y"
      />
      {errors[name as keyof SpeakerFormData] && <span className="text-[#E10600] text-xs font-mono">{errors[name as keyof SpeakerFormData]?.message as string}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 bg-[#111] p-6 sm:p-10 border border-white/5">
      
      {/* Section 1 */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-aws-orange border-b border-white/10 pb-2 mb-6">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" name="full_name" placeholder="e.g. Jane Doe" required />
          <InputField label="Email Address" name="email" type="email" placeholder="name@email.com" required />
          <InputField label="Phone Number" name="phone" placeholder="+91 99999 99999" required />
          <InputField label="City" name="city" placeholder="Dhule, Mumbai, etc." required />
          <InputField label="Organization" name="organization" placeholder="e.g. Acme Corp" required />
          <InputField label="Designation" name="designation" placeholder="e.g. Student, SDE, Founder" required />
          <InputField label="LinkedIn URL" name="linkedin_url" placeholder="https://linkedin.com/in/username" required />
          <InputField label="Portfolio / Social URL" name="portfolio_url" placeholder="https://github.com/username" />
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-aws-orange border-b border-white/10 pb-2 mb-6">Session Details</h4>
        <div className="flex flex-col gap-6">
          <InputField label="Session Title" name="session_title" placeholder="e.g. Scaling Webapps with AWS Serverless Architecture" required />
          <TextAreaField label="Session Abstract / Description" name="session_abstract" placeholder="Explain what the audience will learn, key tech stacks, and demo details..." required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField label="Category" name="category" required options={['Cloud Computing', 'AWS Architecture', 'Serverless', 'Containers & Kubernetes', 'DevOps', 'Generative AI', 'Machine Learning', 'Security', 'Data Engineering', 'Career Growth', 'Open Source', 'Startup Journey']} />
            <SelectField label="Session Level" name="session_level" required options={['Beginner (100)', 'Intermediate (200)', 'Advanced (300)', 'Expert (400)']} />
            <SelectField label="Duration" name="duration" required options={['20 Min (Lightning)', '30 Min (Standard)', '45 Min (Deep Dive)']} />
          </div>
        </div>
      </div>

      {/* Section 3 */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-aws-orange border-b border-white/10 pb-2 mb-6">Speaker Profile</h4>
        <div className="flex flex-col gap-6">
          <TextAreaField label="Speaker Biography" name="bio" placeholder="Tell us about your background, achievements, and work experience..." required />
          <TextAreaField label="Previous Speaking Experience" name="previous_experience" placeholder="List any past talks, meetups, workshops, or video links..." />
          <TextAreaField label="Additional Notes / Setup Requests" name="notes" placeholder="Audio-video setup, specific date availability, or other considerations..." />
        </div>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-[#E10600]/10 border border-[#E10600]/20 text-[#E10600] text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 px-8 py-4 bg-aws-orange hover:bg-[#ffaa22] text-black font-black italic uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit CFP Application'}
        {!status && <Send size={18} />}
      </button>

    </form>
  );
};
