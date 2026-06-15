import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../../lib/api';

export const AdminSettings = () => {
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const getHeaders = () => ({
    'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || ''
  });

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/admin/settings', { headers: getHeaders() });
      setRegistrationEnabled(res.data.registration_enabled);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRegistration = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/admin/settings', 
        { registration_enabled: !registrationEnabled },
        { headers: getHeaders() }
      );
      setRegistrationEnabled(res.data.registration_enabled);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-aws-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-white/5 p-8 max-w-2xl">
      <h3 className="font-sans font-bold text-sm text-white mb-2">Global Settings</h3>
      <p className="font-mono text-xs text-white/40 mb-8">
        Manage global application state such as enabling or pausing ticket registrations.
      </p>

      <div className="flex items-center justify-between border-t border-white/5 pt-6">
        <div>
          <h4 className="text-sm text-white font-medium">Ticket Registrations</h4>
          <p className="text-xs text-white/40 mt-1">
            When disabled, the site will show "OPENING SOON" instead of allowing users to purchase tickets.
          </p>
        </div>
        <button
          onClick={toggleRegistration}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            registrationEnabled ? 'bg-aws-orange' : 'bg-white/10'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              registrationEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
