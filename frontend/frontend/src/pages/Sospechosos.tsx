import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, Loader2 } from 'lucide-react';
import logo from '../img/logo.webp';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Sospechoso {
  id: string;
  nombreCompleto: string;
  cedula: string;
  longitudCadena: number;
  activo: boolean;
  fechaRegistro: string;
}

const Sospechosos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suspects, setSuspects] = useState<Sospechoso[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Cargar sospechosos al montar el componente
  useEffect(() => {
    fetchSospechosos();
  }, []);

  const fetchSospechosos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/sospechosos?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar sospechosos');
      }

      const response_data = await response.json();
      setSuspects(response_data.data?.sospechosos || []);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar sospechosos');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuspects = suspects.filter(
    (suspect) =>
      suspect.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suspect.cedula.includes(searchTerm)
  );

  const handleUploadCSV = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xls,.xlsx';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setUploading(true);
      const startTime = Date.now();

      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        toast.info('Cargando archivo...', { duration: 2000 });

        const response = await fetch(`${API_BASE_URL}/api/sospechosos/carga-masiva`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Error al cargar archivo');
        }

        const result = await response.json();
        const data = result.data;
        const tiempoTotal = ((Date.now() - startTime) / 1000).toFixed(2);

        // Mensaje de éxito detallado
        let mensaje = `Carga completada en ${tiempoTotal}s\n`;
        if (data.insertados > 0) mensaje += `✓ ${data.insertados} nuevo(s)\n`;
        if (data.actualizados > 0) mensaje += `✓ ${data.actualizados} actualizado(s)\n`;
        if (data.modoParalelo) mensaje += `⚡ Procesamiento paralelo activado`;

        toast.success(mensaje, { duration: 5000 });

        // Mostrar errores si los hay
        if (data.errores?.length > 0) {
          const maxErroresMostrar = 5;
          data.errores.slice(0, maxErroresMostrar).forEach((err: any) => {
            toast.error(`Línea ${err.linea}: ${err.motivo}`, { duration: 6000 });
          });
          if (data.errores.length > maxErroresMostrar) {
            toast.warning(`... y ${data.errores.length - maxErroresMostrar} errores más`, { duration: 4000 });
          }
        }

        // Recargar lista
        fetchSospechosos();
      } catch (error: any) {
        toast.error(error.message || 'Error al cargar archivo');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Base de Sospechosos</h1>
        <p className="text-muted-foreground">Registro de perfiles genéticos</p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:flex-items-center md:justify-between gap-4">
            <CardTitle>Registros ({loading ? '...' : filteredSuspects.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <img src={logo} alt="DNA Forensics Logo" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground object-contain filter brightness-125 contrast-125 drop-shadow-lg" />
                <Input
                  placeholder="Buscar por nombre o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleUploadCSV} className="btn-glow bg-gradient-primary" disabled={uploading}>
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? 'Cargando...' : 'Cargar CSV/Excel'}
              </Button>
            </div>
          </div>
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
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">Cédula</th>
                    <th className="text-left py-3 px-4">Longitud ADN</th>
                    <th className="text-left py-3 px-4">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuspects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No se encontraron sospechosos
                      </td>
                    </tr>
                  ) : (
                    filteredSuspects.map((suspect, index) => (
                      <motion.tr
                        key={suspect.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-3 px-4 font-medium">{suspect.nombreCompleto}</td>
                        <td className="py-3 px-4">{suspect.cedula}</td>
                        <td className="py-3 px-4 font-mono text-sm text-primary">
                          {suspect.longitudCadena} bases
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(suspect.fechaRegistro).toLocaleDateString()}
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
    </div>
  );
};

export default Sospechosos;
