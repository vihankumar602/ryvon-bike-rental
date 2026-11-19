import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, AUTH_USER_KEY, AUTH_TOKEN_KEY, saveAuthToken, clearAuthStorage } from '../utils/api';
import { hashPassword } from '../utils/security';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const userStr = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
      return JSON.parse(userStr || 'null');
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  });

  const [riderPersona, setRiderPersonaState] = useState(() => {
    return localStorage.getItem('ryvon-rider-persona') || 'Alpine Tourer';
  });

  const setRiderPersona = (persona) => {
    setRiderPersonaState(persona);
    localStorage.setItem('ryvon-rider-persona', persona);
  };

  const saveAuthUser = (u, rememberMe = true) => {
    setUser(u);
    const userStr = JSON.stringify(u);
    if (rememberMe) {
      localStorage.setItem(AUTH_USER_KEY, userStr);
      sessionStorage.removeItem(AUTH_USER_KEY);
    } else {
      sessionStorage.setItem(AUTH_USER_KEY, userStr);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  };

  // Sync session on mount with backend if token exists
  useEffect(() => {
    let isMounted = true;
    if (token) {
      api.get('/auth/me')
        .then((userData) => {
          if (!isMounted) return;
          if (userData && userData.email) {
            setUser(userData);
            const rememberMe = !sessionStorage.getItem(AUTH_TOKEN_KEY);
            saveAuthUser(userData, rememberMe);
          }
        })
        .catch((err) => {
          // If token was rejected as invalid by backend, cleanly clear auth
          if (err && err.status === 401) {
            clearAuthStorage();
            if (isMounted) {
              setUser(null);
              setToken(null);
            }
          }
        });
    }
    return () => { isMounted = false; };
  }, []);

  const migrateGuestData = useCallback((currentUser) => {
    if (!currentUser || !currentUser.email) return;
    try {
      const email = currentUser.email.toLowerCase();
      const guestWishes = JSON.parse(localStorage.getItem('rideos-wishlist') || '[]');
      if (guestWishes.length > 0) {
        const userWishesKey = `rideos-wishlist-${email}`;
        const userWishes = JSON.parse(localStorage.getItem(userWishesKey) || '[]');
        if (userWishes.length === 0) {
          localStorage.setItem(userWishesKey, JSON.stringify(guestWishes));
        }
      }
      const guestComps = JSON.parse(localStorage.getItem('rideos-comparisons') || '[]');
      if (guestComps.length > 0) {
        const userCompsKey = `rideos-comparisons-${email}`;
        const userComps = JSON.parse(localStorage.getItem(userCompsKey) || '[]');
        if (userComps.length === 0) {
          localStorage.setItem(userCompsKey, JSON.stringify(guestComps));
        }
      }
    } catch (e) {
      console.error('Migration error:', e);
    }
  }, []);

  const login = async (email, password, rememberMe = true) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt Real Backend Login
    try {
      const authData = await api.post('/auth/login', { email: cleanEmail, password });
      if (authData?.user) {
        saveAuthToken(authData.token, rememberMe);
        saveAuthUser(authData.user, rememberMe);
        setToken(authData.token);
        migrateGuestData(authData.user);
        return { success: true, user: authData.user };
      }
    } catch (err) {
      if (err.status === 401 || err.code === 'UNAUTHORIZED') {
        return { success: false, error: 'Invalid email or password.' };
      }
      if (err.status === 429) {
        return { success: false, error: 'Too many login attempts. Please wait a few minutes and try again.' };
      }
      if (err.status === 503 || err.code === 'DATABASE_UNAVAILABLE') {
        return { success: false, error: 'Database service is temporarily unavailable. Please try again shortly.' };
      }
      if (err.isNetworkError) {
        return { success: false, error: err.message || 'Unable to connect to the server. Please verify the backend is running on port 3000.' };
      }

      return { success: false, error: err.message || 'Invalid email or password.' };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const register = async (userDataOrName, emailParam, passwordParam, rememberMe = true) => {
    let userData = {};
    let rem = rememberMe;

    if (typeof userDataOrName === 'object' && userDataOrName !== null) {
      userData = { ...userDataOrName };
      if (typeof emailParam === 'boolean') rem = emailParam;
    } else {
      userData = {
        name: userDataOrName,
        email: emailParam,
        password: passwordParam
      };
    }

    if (!userData.email || !userData.password || !userData.name) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    userData.email = userData.email.trim().toLowerCase();
    userData.name = userData.name.trim();

    // 1. Attempt Real Backend Registration
    try {
      const authData = await api.post('/auth/register', userData);
      if (authData?.user) {
        saveAuthToken(authData.token, rem);
        saveAuthUser(authData.user, rem);
        setToken(authData.token);
        migrateGuestData(authData.user);
        return { success: true, user: authData.user };
      }
    } catch (err) {
      // If backend conflict (409) or email already registered
      if (err.status === 409 || err.code === 'EMAIL_TAKEN' || (err.message && err.message.toLowerCase().includes('already'))) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      // If backend rate limited (429)
      if (err.status === 429) {
        return { success: false, error: 'Too many registration attempts. Please wait a few minutes and try again.' };
      }

      // If validation error (400)
      if (err.status === 400) {
        const detailMsg = err.details && Array.isArray(err.details) ? err.details.map(d => d.message).join('. ') : err.message;
        return { success: false, error: detailMsg || 'Please provide valid registration details.' };
      }

      // Database unavailable (503)
      if (err.status === 503 || err.code === 'DATABASE_UNAVAILABLE') {
        return { success: false, error: 'Database service is temporarily unavailable. Please try again shortly.' };
      }

      // If backend network error / offline
      if (err.isNetworkError) {
        return { success: false, error: err.message || 'Unable to connect to the server. Please verify the backend is running on port 3000.' };
      }

      return { success: false, error: err.message || 'Registration failed. Please check your details.' };
    }

    return { success: false, error: 'Registration failed.' };
  };

  const loginOAuth = (provider = 'google') => {
    const fullUser = {
      id: (provider === 'apple' ? 'usr_a_' : 'usr_g_') + Date.now().toString(36),
      name: provider === 'apple' ? 'Apple Rider' : 'Rider Member',
      email: `${provider}.rider@ryvonclub.com`,
      role: 'USER',
      authProvider: provider,
      emailVerified: true,
      safetyScore: 98,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      phone: '+91 98765 43210',
      licenseNumber: (provider === 'apple' ? 'DL-APPLE-' : 'DL-GOOGLE-') + Math.floor(1000 + Math.random() * 9000),
      joinedAt: new Date().toISOString()
    };
    const t = 'jwt_' + fullUser.authProvider + '_' + Date.now();
    saveAuthToken(t, true);
    saveAuthUser(fullUser, true);
    setToken(t);
    migrateGuestData(fullUser);
    return { success: true, user: fullUser };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthStorage();
  };

  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    saveAuthUser(updated, true);
    try {
      await api.patch('/users/me', updates);
    } catch (e) {
      // offline fallback
    }
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true, message: res.message || 'Password updated successfully' };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update password' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        riderPersona,
        setRiderPersona,
        login,
        register,
        loginOAuth,
        logout,
        updateUser,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      riderPersona: 'Alpine Tourer',
      setRiderPersona: () => {},
      login: async () => ({ success: false, error: 'Auth context missing' }),
      register: async () => ({ success: false, error: 'Auth context missing' }),
      loginOAuth: () => ({ success: false }),
      logout: () => {},
      updateUser: async () => {}
    };
  }
  return context;
}
