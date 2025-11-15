import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Optionally verify token is still valid
        authAPI.getCurrentUser().catch(() => {
          // Token expired, clear user
          logout();
        });
      } catch (err) {
        console.error('Error loading saved user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Call backend API
      const response = await authAPI.login(username, password);
      
      const userData = {
        id: response.id,
        username: response.username,
        school_name: response.school_name,
        email: response.email,
        subscription_plan: response.subscription_plan,
        subscription_status: response.subscription_status,
        trial_ends_at: response.trial_ends_at,
        access_token: response.access_token,
        token_type: response.token_type,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (registrationData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Call backend API
      const response = await authAPI.register(registrationData);
      
      const userData = {
        id: response.id,
        username: response.username,
        school_name: response.school_name,
        email: response.email,
        subscription_plan: response.subscription_plan,
        subscription_status: response.subscription_status,
        trial_ends_at: response.trial_ends_at,
        access_token: response.access_token,
        token_type: response.token_type,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setError(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
