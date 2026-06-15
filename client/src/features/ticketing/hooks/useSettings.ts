import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
export function useSettings() {
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/settings')
      .then((res) => {
        setRegistrationEnabled(res.data.registration_enabled);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch settings:', err);
        setLoading(false);
      });
  }, []);

  return { registrationEnabled, loading };
}
