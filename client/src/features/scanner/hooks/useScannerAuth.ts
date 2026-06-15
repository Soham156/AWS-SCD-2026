import { useState } from 'react';
import { api } from '../../../lib/api';

export function useScannerAuth() {
  const token = sessionStorage.getItem('scd_scanner_key');
  const [authed, setAuthed] = useState(!!token);

  const login = async (pw: string) => {
    try {
      await api.get('/api/scan/verify-auth', { headers: { 'X-Scanner-Key': pw } });
      sessionStorage.setItem('scd_scanner_key', pw);
      setAuthed(true);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('scd_scanner_key');
    setAuthed(false);
  };

  return { authed, login, logout, token };
}
