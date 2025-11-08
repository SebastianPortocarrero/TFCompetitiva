import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { mockSearchHistory } from '@/data/mockData';

const Historial = () => {
  const handleViewDetail = (caseNumber: string) => {
    toast.info(`Ver detalles de ${caseNumber} (modo demo)`);
  };

  const handleDownloadReport = (caseNumber: string) => {
    toast.success(`Descargando reporte de ${caseNumber}`);
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
          <CardTitle>Búsquedas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Caso</th>
                  <th className="text-left py-3 px-4">Patrón</th>
                  <th className="text-left py-3 px-4">Coincidencias</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Algoritmo</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mockSearchHistory.map((search, index) => (
                  <motion.tr
                    key={search.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-3 px-4 font-medium">{search.caseNumber}</td>
                    <td className="py-3 px-4 font-mono text-sm text-primary">{search.pattern}</td>
                    <td className="py-3 px-4">
                      <Badge variant={search.matches > 0 ? 'default' : 'secondary'}>
                        {search.matches}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{search.date}</td>
                    <td className="py-3 px-4 text-sm">{search.algorithm}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(search.caseNumber)}
                          className="hover-glow"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadReport(search.caseNumber)}
                          className="hover-glow"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Historial;
