import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Administrador' | 'Perito' | 'Investigador';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const mockUsers: Record<string, { password: string; name: string; role: UserRole }> = {
  'admin@pnp.gob.pe': { password: '123456', name: 'Juan Pérez', role: 'Administrador' },
  'perito@pnp.gob.pe': { password: '123456', name: 'María García', role: 'Perito' },
  'investigador@pnp.gob.pe': { password: '123456', name: 'Carlos López', role: 'Investigador' },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token_demo');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUser = mockUsers[email];
    if (mockUser && mockUser.password === password) {
      const userData: User = {
        email,
        name: mockUser.name,
        role: mockUser.role,
      };
      setUser(userData);
      localStorage.setItem('token_demo', 'demo_token_12345');
      localStorage.setItem('user_data', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token_demo');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
