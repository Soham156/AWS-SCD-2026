import { useState } from 'react';

export function useAdminAuth() {
  const [authed, setAuthed] = useState(
    !!sessionStorage.getItem('scd_admin_key')
  );

  const login = (pw: string) => {
    // We just save it. The actual validation happens when they make an API request
    sessionStorage.setItem('scd_admin_key', pw);
    setAuthed(true);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem('scd_admin_key');
    setAuthed(false);
  };

  return { authed, login, logout };
}
