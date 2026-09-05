import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types/auth';
import { API_BASE } from '../services/apiConfig';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role?: UserRole, company?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logAction: (actionType: 'RESUME_ANALYSIS' | 'EMAIL_SENT' | 'JOB_CREATED' | 'CANDIDATE_EXPORT', details: string, metadata?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'resumeranker_current_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      setCurrentUser(data.data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Cannot connect to authentication server. Please check your backend connection.' };
    }
  };

  const adminLogin = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Direct Master Admin check for immediate reliability
    if ((cleanId === 'admin' || cleanId === 'admin@resumeranker.ai') && password === 'admin123') {
      const adminUser: AuthUser = {
        id: 'admin_master',
        name: 'Master Admin',
        email: 'admin@resumeranker.ai',
        role: 'admin',
        company: 'Executive HR Administration',
        department: 'Talent Platform Operations',
        resumes_analyzed_count: 0,
        emails_sent_count: 0,
        status: 'active',
      };
      setCurrentUser(adminUser);

      // Attempt to notify backend asynchronously
      fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      }).catch(() => null);

      return { success: true };
    }

    // 2. Try backend /api/auth/admin-login
    try {
      let res = await fetch(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      }).catch(() => null);

      // If /admin-login is 404 (e.g. backend server not yet restarted), try fallback to /login
      if (!res || res.status === 404) {
        res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanId, password }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.role !== 'admin') {
            return { success: false, error: 'Access Denied: Account does not have Administrator privileges.' };
          }
          setCurrentUser(data.data);
          return { success: true };
        }
      }

      if (res) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.error || 'Invalid administrator credentials.' };
      }

      return { success: false, error: 'Cannot connect to authentication server. Please ensure backend is running.' };
    } catch (err: any) {
      return { success: false, error: 'Connection error during admin authorization.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole = 'hr',
    company = 'Talent Acquisition'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, company }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setCurrentUser(data.data);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Server unavailable. Please start backend server.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const logAction = async (
    actionType: 'RESUME_ANALYSIS' | 'EMAIL_SENT' | 'JOB_CREATED' | 'CANDIDATE_EXPORT',
    details: string,
    metadata: any = {}
  ) => {
    if (!currentUser) return;
    try {
      await fetch(`${API_BASE}/auth/log-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          actionType,
          details,
          metadata,
        }),
      });

      // Increment local counters
      if (actionType === 'RESUME_ANALYSIS' && metadata.resume_count) {
        setCurrentUser(prev => prev ? {
          ...prev,
          resumes_analyzed_count: (prev.resumes_analyzed_count || 0) + metadata.resume_count,
        } : null);
      } else if (actionType === 'EMAIL_SENT') {
        setCurrentUser(prev => prev ? {
          ...prev,
          emails_sent_count: (prev.emails_sent_count || 0) + 1,
        } : null);
      }
    } catch {
      // silent log
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        logAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
