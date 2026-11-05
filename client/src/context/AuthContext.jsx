import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginFarmer, registerFarmer, fetchProfile, updateFarmerProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('agri_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Synchronize and verify authentication state on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const existingToken = localStorage.getItem('agri_token');
      if (existingToken) {
        try {
          const data = await fetchProfile();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('agri_user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const res = await loginFarmer(credentials);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('agri_token', res.token);
        localStorage.setItem('agri_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await registerFarmer(userData);
      if (res.success && res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('agri_token', res.token);
        localStorage.setItem('agri_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await updateFarmerProfile(profileData);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('agri_user', JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Update failed');
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
