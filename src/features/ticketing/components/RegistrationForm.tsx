import { useState } from 'react';
import { motion } from 'motion/react';
import { z } from 'zod';
import { Loader2, AlertCircle } from 'lucide-react';
import type { PassType } from '../hooks/usePassTypes';

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['student', 'professional'], { message: 'Please select a role' }),
  organization: z.string().min(2, 'Organization is required'),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  selectedPass: PassType;
  loading: boolean;
  error: string | null;
  onSubmit: (data: FormData) => void;
  onBack: () => void;
}

export function RegistrationForm({ selectedPass, loading, error, onSubmit, onBack }: Props) {
  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    role: 'student',
    organization: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    onSubmit(result.data);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((e) => {
        const next = { ...e };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Selected pass banner */}
      <div className="flex items-center gap-3 mb-6 p-3 border border-white/10 bg-white/5">
        <div
          className="w-3 h-8 shrink-0"
          style={{ backgroundColor: selectedPass.badge_color }}
        />
        <div>
          <p className="font-sans font-black italic text-sm uppercase tracking-tight text-white">
            {selectedPass.name}
          </p>
          <p className="font-mono text-xs text-white/40">₹{selectedPass.price}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 border border-f1-red/30 bg-f1-red/10 text-f1-red text-xs font-mono">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2.5 text-sm text-white font-sans placeholder:text-white/20 focus:border-aws-orange focus:outline-none transition-colors"
            placeholder="Saurabh Girase"
          />
          {fieldErrors.full_name && (
            <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2.5 text-sm text-white font-sans placeholder:text-white/20 focus:border-aws-orange focus:outline-none transition-colors"
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
            Role
          </label>
          <select
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2.5 text-sm text-white font-sans focus:border-aws-orange focus:outline-none transition-colors"
          >
            <option value="student">Student</option>
            <option value="professional">Professional</option>
          </select>
          {fieldErrors.role && (
            <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors.role}</p>
          )}
        </div>

        {/* Organization */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
            College / Organization
          </label>
          <input
            type="text"
            value={form.organization}
            onChange={(e) => updateField('organization', e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-2.5 text-sm text-white font-sans placeholder:text-white/20 focus:border-aws-orange focus:outline-none transition-colors"
            placeholder="SVKM's IoT Dhule"
          />
          {fieldErrors.organization && (
            <p className="text-f1-red text-[10px] font-mono mt-1">{fieldErrors.organization}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-white/20 text-white/60 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-5 py-2.5 bg-f1-red text-white text-xs font-mono uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Registering...
              </>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
