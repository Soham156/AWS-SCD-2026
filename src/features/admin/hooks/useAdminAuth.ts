import { useState } from 'react';

const ADMIN_PASSWORD = 'idkbutily';

export function useAdminAuth() {
  const [authed, setAuthed] = useState(
    sessionStorage.getItem('scd_admin') === 'true'
  );

  const login = (pw: string) => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('scd_admin', 'true');
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('scd_admin');
    setAuthed(false);
  };

  return { authed, login, logout };
}
