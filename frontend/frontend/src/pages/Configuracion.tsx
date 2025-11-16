import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield, Database, Bell, Lock } from 'lucide-react';

const Configuracion = () => {
  const configSections = [
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Gestión de permisos y accesos',
    },
    {
      icon: Database,
      title: 'Base de Datos',
      description: 'Configuración de almacenamiento',
    },
    {
      icon: Bell,
      title: 'Notificaciones',
      description: 'Alertas y notificaciones del sistema',
    },
    {
      icon: Lock,
      title: 'Privacidad',
      description: 'Políticas de privacidad y datos',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card hover-glow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Versión</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Última actualización</span>
              <span className="font-medium">5/11/2025</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Base de datos</span>
              <span className="font-medium">MongoDB</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Estado del servidor</span>
              <span className="font-medium text-secondary">Operativo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracion;
