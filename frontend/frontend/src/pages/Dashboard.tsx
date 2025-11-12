import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import logo from '../img/logo.webp';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Estadisticas {
  total_busquedas: number;
  total_coincidencias: number;
  tiempo_promedio_ms: number;
  tasa_exito: number;
  busquedas_por_dia: { fecha: string; cantidad: number }[];
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/estadisticas/resumen`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const response_data = await response.json();
      // Backend devuelve: { success: true, data: { total_busquedas, ... } }
      setEstadisticas(response_data.data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const stats = estadisticas ? [
    {
      title: 'Búsquedas Totales',
      value: estadisticas.total_busquedas,
      icon: () => <img src={logo} alt="DNA Forensics Logo" className="w-5 h-5 object-contain filter brightness-125 contrast-125 drop-shadow-lg" />,
      color: 'text-primary'
    },
    { title: 'Coincidencias', value: estadisticas.total_coincidencias, icon: CheckCircle, color: 'text-secondary' },
    { title: 'Tiempo Promedio', value: `${estadisticas.tiempo_promedio_ms.toFixed(0)}ms`, icon: Clock, color: 'text-accent' },
    { title: 'Tasa de Éxito', value: `${estadisticas.tasa_exito.toFixed(1)}%`, icon: TrendingUp, color: 'text-secondary' },
  ] : [];

  const chartData = estadisticas?.busquedas_por_dia.map(t => ({
    date: new Date(t.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    searches: t.cantidad,
  })) || [];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje informativo
  if (!estadisticas || (estadisticas.total_busquedas === 0 && !estadisticas.busquedas_por_dia?.length)) {
    return (
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general del sistema forense</p>
        </motion.div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <img src={logo} alt="DNA Forensics Logo" className="w-full h-full object-contain filter brightness-125 contrast-125 drop-shadow-lg" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bienvenido al Sistema Forense de ADN</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Aún no hay búsquedas registradas en el sistema. Las estadísticas aparecerán aquí una vez que comiences a realizar análisis de ADN.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium mb-2">Para comenzar:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 text-left">
                      <li>• Ve a "Base de Sospechosos" para agregar perfiles</li>
                      <li>• Luego usa "Búsqueda de ADN" para analizar patrones</li>
                      <li>• Los resultados aparecerán en "Historial"</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium mb-2">Estadísticas disponibles:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 text-left">
                      <li>• Total de búsquedas realizadas</li>
                      <li>• Coincidencias encontradas</li>
                      <li>• Tiempo promedio de análisis</li>
                      <li>• Tendencia de uso del sistema</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del sistema forense</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card hover-glow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Búsquedas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="searches" fill="url(#gradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(195, 100%, 50%)" />
                    <stop offset="100%" stopColor="hsl(172, 78%, 50%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
