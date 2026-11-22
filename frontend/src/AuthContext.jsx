import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me').then((d) => setUser(d.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    const out = () => setUser(null);
    window.addEventListener('vy-logout', out);
    return () => window.removeEventListener('vy-logout', out);
  }, []);

  const signIn = useCallback((d) => { setToken(d.token); setUser(d.user); }, []);
  const signOut = useCallback(() => { setToken(null); setUser(null); }, []);
  return <Ctx.Provider value={{ user, setUser, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}
