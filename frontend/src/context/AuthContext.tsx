import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  currentUser: Employee | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
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
          // Verify with database that this employee actually exists in PostgreSQL
          apiService
            .getEmployeeById(parsed.id)
            .then((verifiedEmp) => {
              setCurrentUser(verifiedEmp);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedEmp));
            })
            .catch((err) => {
              console.warn('Cached employee not found in database or server unreachable, clearing session:', err);
              setCurrentUser(null);
              localStorage.removeItem(STORAGE_KEY);
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

  const login = async (email: string): Promise<boolean> => {
    try {
      const employee = await apiService.login(email);
      setCurrentUser(employee);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employee));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
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
    <AuthContext.Provider value={{ currentUser, loading, login, logout, switchUser }}>
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
