import { NavLink } from '@/components/NavLink';
import { Home, Search, Users, History, FileText, BarChart3, Settings, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Búsqueda ADN', icon: Search, path: '/busqueda' },
    { name: 'Sospechosos', icon: Users, path: '/sospechosos' },
    { name: 'Historial', icon: History, path: '/historial' },
    { name: 'Reportes', icon: FileText, path: '/reportes' },
    { name: 'Estadísticas', icon: BarChart3, path: '/estadisticas' },
    { name: 'Configuración', icon: Settings, path: '/configuracion' },
  ];

  if (user?.role === 'Administrador') {
    menuItems.splice(6, 0, { name: 'Usuarios', icon: UserCog, path: '/usuarios' });
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Search className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">DNA Forensics</h1>
            <p className="text-xs text-muted-foreground">Sistema PNP</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all"
              activeClassName="bg-sidebar-accent text-primary font-medium shadow-glow"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
