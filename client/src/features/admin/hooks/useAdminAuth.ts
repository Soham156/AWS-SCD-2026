import { useState } from 'react';
import { adminApi } from '../services/adminApi';

export function useAdminAuth() {
  const token = sessionStorage.getItem('scd_admin_key');
  const [authed, setAuthed] = useState(!!token);

  const login = async (pw: string) => {
    try {
      await adminApi.verify(pw);
      sessionStorage.setItem('scd_admin_key', pw);
      setAuthed(true);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('scd_admin_key');
    setAuthed(false);
  };

  return { authed, login, logout, token };
}
