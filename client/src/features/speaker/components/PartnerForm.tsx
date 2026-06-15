import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Handshake } from 'lucide-react';

const partnerSchema = z.object({
  community_name: z.string().min(2, "Community name is required"),
  community_type: z.string().min(1, "Community type is required"),
  website_url: z.string().url("Must be a valid URL"),
  member_size: z.string().min(1, "Member size is required"),
  organizer_name: z.string().min(2, "Organizer name is required"),
  organizer_email: z.string().email("Invalid email address"),
  organizer_phone: z.string().min(10, "Phone number is required"),
  linkedin_url: z.string().url("Must be a valid URL"),
  city: z.string().min(2, "City is required"),
  expectations: z.string().min(20, "Expectations must be at least 20 characters")
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export const PartnerForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema)
  });

  const onSubmit = async (data: PartnerFormData) => {
    setStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/applications/partner', {
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
      <div className="bg-[#111] border border-blue-400 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-400/20 flex items-center justify-center mb-4">
          <Handshake className="text-blue-400" size={24} />
        </div>
        <h3 className="text-2xl font-black italic uppercase text-white mb-2">Partnership Application Received</h3>
        <p className="text-white/60 mb-6">Thank you for your interest in partnering with AWS Student Community Day. We will review your application and reach out shortly.</p>
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
        className="bg-[#0a0a0a] border border-white/10 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-400/50 transition-colors font-sans text-sm"
      />
      {errors[name as keyof PartnerFormData] && <span className="text-[#E10600] text-xs font-mono">{errors[name as keyof PartnerFormData]?.message as string}</span>}
    </div>
  );

  const SelectField = ({ label, name, options, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
      <select
        {...register(name)}
        className="bg-[#0a0a0a] border border-white/10 p-3 text-white focus:outline-none focus:border-blue-400/50 transition-colors font-sans text-sm appearance-none"
      >
        <option value="">Select {label.replace(' *', '')}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {errors[name as keyof PartnerFormData] && <span className="text-[#E10600] text-xs font-mono">{errors[name as keyof PartnerFormData]?.message as string}</span>}
    </div>
  );

  const TextAreaField = ({ label, name, placeholder, required = false }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-white/50 uppercase tracking-widest">{label} {required && '*'}</label>
      <textarea
        placeholder={placeholder}
        rows={4}
        {...register(name)}
        className="bg-[#0a0a0a] border border-white/10 p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-400/50 transition-colors font-sans text-sm resize-y"
      />
      {errors[name as keyof PartnerFormData] && <span className="text-[#E10600] text-xs font-mono">{errors[name as keyof PartnerFormData]?.message as string}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 bg-[#111] p-6 sm:p-10 border border-white/5">
      
      {/* Section 1 */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-blue-400 border-b border-white/10 pb-2 mb-6">Community Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Community Name" name="community_name" placeholder="e.g. AWS Users Dhule" required />
          <SelectField label="Community Type" name="community_type" required options={['AWS User Group', 'AWS Cloud Club (Student)', 'Developer Circle', 'College Club', 'Non-Profit Organization', 'Other']} />
          <InputField label="Community Website / Social URL" name="website_url" placeholder="https://mycommunity.org" required />
          <InputField label="Approximate Member Size" name="member_size" placeholder="e.g. 250" required />
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-blue-400 border-b border-white/10 pb-2 mb-6">Organizer Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Organizer Full Name" name="organizer_name" placeholder="e.g. John Doe" required />
          <InputField label="Organizer Email" name="organizer_email" type="email" placeholder="organizer@email.com" required />
          <InputField label="Organizer Phone" name="organizer_phone" placeholder="+91 99999 99999" required />
          <InputField label="LinkedIn Profile URL" name="linkedin_url" placeholder="https://linkedin.com/in/username" required />
          <InputField label="City / Operations Base" name="city" placeholder="e.g. Dhule, Nashik, Jalgaon" required />
        </div>
      </div>

      {/* Section 3 */}
      <div>
        <h4 className="text-lg font-black italic uppercase tracking-wider text-blue-400 border-b border-white/10 pb-2 mb-6">Partnership Details</h4>
        <div className="flex flex-col gap-6">
          <TextAreaField label="Expectations & Contribution Plans" name="expectations" placeholder="Briefly share how your community will support co-marketing, handle ticket promo codes, or suggest student volunteers..." required />
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
        className="mt-4 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-black font-black italic uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        {status === 'loading' ? 'Submitting...' : 'Apply as Community Partner'}
        {!status && <Handshake size={18} />}
      </button>

    </form>
  );
};
