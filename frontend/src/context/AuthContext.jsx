import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('rl_user')) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rl_token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(d => { setUser(d.user); localStorage.setItem('rl_user', JSON.stringify(d.user)); })
      .catch(() => { localStorage.removeItem('rl_token'); localStorage.removeItem('rl_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const saveAuth = (data) => {
    localStorage.setItem('rl_token', data.token);
    localStorage.setItem('rl_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('rl_token');
    localStorage.removeItem('rl_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
