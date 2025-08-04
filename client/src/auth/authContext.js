import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from './authAPI';

const AuthContext = createContext();

// Authentication states
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { 
        ...state, 
        isLoading: true,
        error: null 
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return { 
        ...initialState, 
        isLoading: false 
      };
    
    case 'TOKEN_REFRESH':
      return {
        ...state,
        accessToken: action.payload.accessToken
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Check if there's a valid token in cookies
      const res = await authAPI.getProfile();
      
      if (res && res.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: res.user,
            accessToken: res.accessToken || null
          }
        });
      } else {
        // Try to refresh token
        await attemptTokenRefresh();
      }
    } catch (error) {
      // If getProfile fails, try to refresh token
      await attemptTokenRefresh();
    }
  };

  const attemptTokenRefresh = async () => {
    try {
      const refreshRes = await authAPI.refreshToken();
      if (refreshRes && refreshRes.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: refreshRes.user,
            accessToken: refreshRes.accessToken || null
          }
        });
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
      }
    } catch (refreshError) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Authentication failed' });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const res = await authAPI.login(credentials);
      
      if (res && res.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: res.user,
            accessToken: res.accessToken || null
          }
        });
        return { success: true };
      } else {
        const errorMessage = res?.error || 'Login failed';
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const res = await authAPI.register(userData);
      
      if (res && res.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: res.user,
            accessToken: res.accessToken || null
          }
        });
        return { success: true };
      } else {
        const errorMessage = res?.error || 'Registration failed';
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshToken = async () => {
    try {
      const res = await authAPI.refreshToken();
      if (res && res.success) {
        dispatch({
          type: 'TOKEN_REFRESH',
          payload: { accessToken: res.accessToken || null }
        });
        return res.accessToken;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Ensure we always return valid JSX
  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    loading: state.isLoading, // alias for compatibility
    accessToken: state.accessToken,
    error: state.error,
    login,
    register,
    logout,
    refreshToken,
    clearError
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;