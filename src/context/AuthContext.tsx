// src/context/AuthContext.tsx
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// Align with Employee type from TaskContext (id: number, role: 'admin' | 'employee')
export interface User {
  id: number;
  name?: string;
  email?: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount (synchronous, but wrapped in useEffect to avoid hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('user');
    let parsedUser: User | null = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure id is a number
        if (parsed.id && typeof parsed.id === 'string') {
          parsed.id = Number(parsed.id);
        }
        // Validate role – default to 'employee' if missing/invalid
        if (!parsed.role || (parsed.role !== 'admin' && parsed.role !== 'employee')) {
          console.warn('Invalid or missing role in stored user, defaulting to employee');
          parsed.role = 'employee';
        }
        parsedUser = parsed as User;
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setUser(parsedUser);
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    // Validate id
    if (typeof userData.id !== 'number') {
      console.error('User id must be a number');
      return;
    }
    // Validate role
    if (!userData.role || (userData.role !== 'admin' && userData.role !== 'employee')) {
      console.error('Invalid role. Must be "admin" or "employee".');
      return;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
