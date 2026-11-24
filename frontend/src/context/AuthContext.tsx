import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, RegisterData } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: Employee | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (employee: Employee) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'emp_mgmt_logged_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          // Verify with database that this employee exists
          apiService
            .getEmployeeById(parsed.id)
            .then((verifiedEmp) => {
              setCurrentUser(verifiedEmp);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedEmp));
            })
            .catch((err) => {
              console.warn('Session verification fallback to stored user:', err);
              // Fallback to cached user if offline or server momentarily starting
              setCurrentUser(parsed);
            })
            .finally(() => {
              setLoading(false);
            });
          return;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const employee = await apiService.login(email, password);
      setCurrentUser(employee);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
      return { success: true };
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Invalid email or password. Please try again.';
      return { success: false, error: msg };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiService.register(data);
      return { success: true };
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchUser = (employee: Employee) => {
    setCurrentUser(employee);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
