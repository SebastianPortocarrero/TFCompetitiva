import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export type UserRole = 'Administrador' | 'Perito' | 'Investigador';

export interface User {
  id: string;
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

// Mapeo de roles del backend a frontend
const mapRole = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'admin': 'Administrador',
    'perito': 'Perito',
    'investigador': 'Investigador',
  };
  return roleMap[backendRole] || 'Investigador';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const response_data = await response.json();

      if (!response.ok) {
        console.error('Error de autenticación:', response_data.message || 'Credenciales incorrectas');
        return false;
      }

      // Backend devuelve: { success: true, data: { token, usuario } }
      const { data } = response_data;

      // Verificar que data.usuario existe
      if (!data || !data.usuario || !data.token) {
        console.error('Respuesta del servidor inválida:', response_data);
        return false;
      }

      // data.usuario = { id, nombre, email, rol, activo, creadoEn }
      const userData: User = {
        id: data.usuario.id,
        email: data.usuario.email,
        name: data.usuario.nombre,
        role: mapRole(data.usuario.rol),
      };

      setUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
