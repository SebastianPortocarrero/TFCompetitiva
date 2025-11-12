import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Eye, Download, Loader2, FileText, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { generarReporte, descargarReporte } from '@/services/reportesService';
import AIChat from '@/components/AIChat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface BusquedaHistorial {
  _id: string;
  casoNumero: string;
  patrones: string[];
  algoritmoUsado: string;
  totalCoincidencias: number;
  tiempoEjecucionMs: number;
  fecha: string;
}

const Historial = () => {
  const [historial, setHistorial] = useState<BusquedaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState<string | null>(null);
  const [casoSeleccionado, setCasoSeleccionado] = useState<BusquedaHistorial | null>(null);

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/busquedas/historial?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar historial');
      }

      const response_data = await response.json();
      // Backend devuelve: { success: true, data: { busquedas: [...], pagination: {...} } }
      setHistorial(response_data.data?.busquedas || []);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id: string) => {
    toast.info(`Ver detalles de búsqueda ${id}`);
  };

  const handleGenerarReporte = async (busquedaId: string, casoNumero: string) => {
    setGenerando(busquedaId);
    try {
      // Generar el reporte
      toast.info('Generando reporte PDF...');
      const resultado = await generarReporte(busquedaId);

      toast.success('Reporte generado exitosamente');

      // Descargar automáticamente
      await descargarReporte(resultado.data.idReporte);
      toast.success(`Reporte ${casoNumero} descargado`);
    } catch (error: any) {
      if (error.message === 'Sesión expirada') {
        toast.error('Sesión expirada. Redirigiendo...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(error.message || 'Error al generar reporte');
      }
    } finally {
      setGenerando(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Historial de Búsquedas</h1>
        <p className="text-muted-foreground">Registro completo de análisis realizados</p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Búsquedas Recientes ({historial.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Caso</th>
                    <th className="text-left py-3 px-4">Patrón(es)</th>
                    <th className="text-left py-3 px-4">Coincidencias</th>
                    <th className="text-left py-3 px-4">Tiempo</th>
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Algoritmo</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No hay búsquedas registradas
                      </td>
                    </tr>
                  ) : (
                    historial.map((search, index) => (
                      <motion.tr
                        key={search._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-3 px-4 font-medium">
                          {search.casoNumero || 'Sin caso'}
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-primary">
                          {search.patrones && search.patrones.length > 0
                            ? `${search.patrones[0].substring(0, 15)}${search.patrones[0].length > 15 ? '...' : ''}${search.patrones.length > 1 ? ` +${search.patrones.length - 1}` : ''}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={search.totalCoincidencias > 0 ? 'default' : 'secondary'}>
                            {search.totalCoincidencias}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {search.tiempoEjecucionMs}ms
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(search.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3 px-4 text-sm">{search.algoritmoUsado.toUpperCase()}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetail(search._id)}
                              className="hover-glow"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleGenerarReporte(search._id, search.casoNumero)}
                              disabled={generando === search._id}
                              className="hover-glow"
                              title="Generar y descargar PDF"
                            >
                              {generando === search._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setCasoSeleccionado(search)}
                              className="hover-glow text-primary"
                              title="Analizar con IA"
                            >
                              <Bot className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat de IA contextual para análisis de caso específico */}
      {casoSeleccionado && (
        <AIChat
          contextId="forensic-dna-case"
          caseData={casoSeleccionado}
          sessionId={`case-${casoSeleccionado._id}`}
          onClose={() => setCasoSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default Historial;
