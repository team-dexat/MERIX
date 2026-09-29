import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { ApiService, initStorage } from '../services/api';
import { initialUsers } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAsRole: (role: UserRole) => void;
  loginWithEmail: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initStorage();
    const stored = ApiService.getCurrentUser();
    setUser(stored);
  }, []);

  const loginAsRole = (role: UserRole) => {
    const allUsers = ApiService.getAllUsers();
    const match = allUsers.find(u => u.role === role) || initialUsers.find(u => u.role === role) || {
      id: 'USR-005',
      email: 'citizen.user@gmail.com',
      fullName: 'Aarav Gupta',
      businessName: 'Consumer Citizen',
      role: 'CITIZEN' as UserRole
    };
    setUser(match);
    ApiService.setCurrentUser(match);
  };

  const loginWithEmail = (email: string): boolean => {
    const users = ApiService.getAllUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      ApiService.setCurrentUser(found);
      return true;
    }
    // Check if email matches any role demo prefix
    const lower = email.toLowerCase();
    let assignedRole: UserRole = 'BUSINESS_OWNER';
    if (lower.includes('admin')) assignedRole = 'ADMIN';
    else if (lower.includes('lmo') || lower.includes('officer')) assignedRole = 'LMO_OFFICER';
    else if (lower.includes('gatc') || lower.includes('lab')) assignedRole = 'GATC_CENTER';
    else if (lower.includes('citizen')) assignedRole = 'CITIZEN';

    const newUser: User = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      email,
      fullName: email.split('@')[0],
      role: assignedRole
    };
    setUser(newUser);
    ApiService.setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    ApiService.setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'BUSINESS_OWNER',
        isAuthenticated: !!user,
        loginAsRole,
        loginWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
