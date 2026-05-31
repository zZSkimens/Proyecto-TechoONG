import { useState, useCallback } from 'react';
import { login as loginService, logout as logoutService, getUser, isAuthenticated } from '../services/auth.service.js';

export function useAuth() {
  const [user, setUser] = useState(() => isAuthenticated() ? getUser() : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginService(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    isLoggedIn: !!user,
    handleLogin,
    handleLogout,
  };
}
