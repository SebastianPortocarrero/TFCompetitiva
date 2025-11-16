import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { listarReportes, descargarReporte, Reporte } from '@/services/reportesService';

const Reportes = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState<string | null>(null);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const data = await listarReportes();
      setReportes(data);
    } catch (error: any) {
      if (error.message === 'Sesión expirada') {
        toast.error('Sesión expirada. Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(error.message || 'Error al cargar reportes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reporteId: string, casoNumero: string) => {
    setDescargando(reporteId);
    try {
      await descargarReporte(reporteId);
      toast.success(`Reporte ${casoNumero} descargado exitosamente`);
    } catch (error: any) {
      if (error.message === 'Sesión expirada') {
        toast.error('Sesión expirada. Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(error.message || 'Error al descargar reporte');
      }
    } finally {
      setDescargando(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Reportes PDF</h1>
        <p className="text-muted-foreground">Documentos forenses generados por caso</p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Reportes Disponibles ({loading ? '...' : reportes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reportes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay reportes generados</p>
              <p className="text-sm mt-2">Genera reportes desde el Historial de búsquedas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportes.map((reporte, index) => (
                <motion.div
                  key={reporte.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg glass-card hover-glow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">
                        {reporte.busqueda?.casoNumero || 'Sin caso'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reporte.fechaGeneracion).toLocaleString('es-PE')}
                        {reporte.generadoPor && (
                          <span className="ml-2">• Generado por: <span className="font-medium text-foreground">{reporte.generadoPor.nombre}</span></span>
                        )}
                      </p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {reporte.busqueda?.algoritmoUsado && (
                          <Badge variant="outline" className="text-xs">
                            {reporte.busqueda.algoritmoUsado}
                          </Badge>
                        )}
                        {reporte.busqueda?.totalCoincidencias !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {reporte.busqueda.totalCoincidencias} coincidencias
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {formatBytes(reporte.tamanoBytes)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {reporte.numeroDescargas} descargas
                        </Badge>
                        {reporte.generadoPor && (
                          <Badge variant="secondary" className="text-xs">
                            {reporte.generadoPor.rol}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(reporte.id, reporte.busqueda?.casoNumero || reporte.id)}
                      disabled={descargando === reporte.id}
                      className="btn-glow bg-gradient-primary"
                    >
                      {descargando === reporte.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Descargar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;
