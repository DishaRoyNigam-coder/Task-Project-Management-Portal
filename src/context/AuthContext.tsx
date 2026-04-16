import { ReactNode, createContext, useContext, useState } from 'react';

// Align with Employee type from TaskContext (id: number, role: 'admin' | 'employee')
export interface User {
  id: number; // ✅ changed from string to number
  name?: string;
  email?: string;
  role: 'admin' | 'employee'; // ✅ strict union type
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure id is a number when reading from storage
      if (parsed.id && typeof parsed.id === 'string') {
        parsed.id = Number(parsed.id);
      }
      return parsed;
    }
    return null;
  });

  const login = (userData: User) => {
    // Validate that id is a number
    if (typeof userData.id !== 'number') {
      console.error('User id must be a number');
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
