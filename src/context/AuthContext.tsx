import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types/dental';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  canPerformAction: (action: 'add' | 'edit' | 'delete', resource: 'patient' | 'dental' | 'user') => boolean;
}

const API_URL = 'https://dentis-charts.pages.dev';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dental_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('dental_token'));

  useEffect(() => {
    // Check if token is valid (could add verify call here)
    if (!token) {
      setCurrentUser(null);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Помилка авторизації' };
      }

      if (!data.token || !data.user) {
        return { success: false, error: 'Сервер повернув некоректні дані' };
      }

      const user = {
        id: data.user.id.toString(),
        username: data.user.email,
        name: data.user.fullName,
        role: data.user.role as UserRole,
        createdAt: new Date().toISOString()
      };

      setToken(data.token);
      setCurrentUser(user);
      localStorage.setItem('dental_token', data.token);
      localStorage.setItem('dental_user', JSON.stringify(user));
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Сервер недоступний або сталася помилка мережі' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('dental_token');
    localStorage.removeItem('dental_user');
  }, []);

  const canPerformAction = useCallback((action: 'add' | 'edit' | 'delete', resource: 'patient' | 'dental' | 'user') => {
    if (!currentUser) return false;
    
    const permissions: Record<UserRole, Record<string, string[]>> = {
      'super-admin': {
        patient: ['add', 'edit', 'delete'],
        dental: ['add', 'edit', 'delete'],
        user: ['add', 'edit', 'delete'],
      },
      'doctor': {
        patient: ['add', 'edit', 'delete'],
        dental: ['add', 'edit', 'delete'],
        user: [],
      },
      'administrator': {
        patient: ['add', 'edit'],
        dental: [],
        user: [],
      },
    };
    
    // @ts-ignore
    permissions['superadmin'] = permissions['super-admin'];

    const role = currentUser.role === 'superadmin' ? 'super-admin' : currentUser.role;
    return permissions[role as UserRole][resource]?.includes(action) ?? false;
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      login,
      logout,
      canPerformAction,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
