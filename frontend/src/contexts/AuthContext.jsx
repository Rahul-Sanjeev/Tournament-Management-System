import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(null);
  const [refreshTokenTimeoutId, setRefreshTokenTimeoutId] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (token && refreshToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await setupTokenRefresh(refreshToken);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
    return () => {
      if (refreshTokenTimeoutId) {
        clearTimeout(refreshTokenTimeoutId);
      }
    };
  }, []);

  const setupTokenRefresh = async (refreshToken) => {
    try {
      const response = await axios.post('/auth/refresh/', { refresh: refreshToken });
      const { access: newToken } = response.data;

      // Store new token
      const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
      storage.setItem('token', newToken);

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Set up next refresh - 2 minutes before expiration
      const timeoutId = setTimeout(() => {
        setupTokenRefresh(refreshToken);
      }, 58 * 60 * 1000); // Refresh 2 minutes before expiration

      setRefreshTokenTimeoutId(timeoutId);
    } catch (error) {
      console.error('Token refresh failed:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const login = async (username, password, remember = false) => {
    try {
      // Check rate limiting
      if (loginAttempts >= 5 && lastAttemptTime && (Date.now() - lastAttemptTime) < 15 * 60 * 1000) {
        return { success: false, error: 'Too many login attempts. Please try again later.' };
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        return { success: false, error: passwordError };
      }

      const response = await axios.post('/api/auth/login/', { username, password });
      const { token, refresh, user: userData } = response.data;

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('refreshToken', refresh);
      storage.setItem('user', JSON.stringify(userData));

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await setupTokenRefresh(refresh);
      setUser(userData);
      setLoginAttempts(0);
      setLastAttemptTime(null);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setLoginAttempts(prev => prev + 1);
      setLastAttemptTime(Date.now());

      let errorMessage = 'An error occurred during login';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server';
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    if (refreshTokenTimeoutId) {
      clearTimeout(refreshTokenTimeoutId);
    }
    setUser(null);
  };

  const requestPasswordReset = async (email) => {
    try {
      await axios.post('/api/auth/password-reset/', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to send password reset email'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    requestPasswordReset
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};