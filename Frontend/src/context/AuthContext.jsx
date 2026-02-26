import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  const login = useCallback((newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setStoredAuth(newToken, userData);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  }, []);

  useEffect(() => {
    const tokenFromStorage = getStoredToken();
    const userFromStorage = getStoredUser();
    if (tokenFromStorage && userFromStorage) {
      setToken(tokenFromStorage);
      setUser(userFromStorage);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
