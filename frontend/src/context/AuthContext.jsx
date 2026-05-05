import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem('nextcareer_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('nextcareer_token')));

  useEffect(() => {
    const token = localStorage.getItem('nextcareer_token');
    if (!token) {
      return;
    }

    let mounted = true;

    getProfile()
      .then((res) => {
        if (!mounted) return;
        setUser(res.data);
        localStorage.setItem('nextcareer_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('nextcareer_token');
        localStorage.removeItem('nextcareer_user');
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('nextcareer_token', token);
    localStorage.setItem('nextcareer_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nextcareer_token');
    localStorage.removeItem('nextcareer_user');
    setUser(null);
  };

  const refreshUser = (userData) => {
    setUser(userData);
    localStorage.setItem('nextcareer_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
