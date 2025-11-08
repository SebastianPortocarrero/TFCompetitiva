import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Upload, Search } from 'lucide-react';
import { toast } from 'sonner';
import { mockSuspects } from '@/data/mockData';

const Sospechosos = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuspects = mockSuspects.filter(
    (suspect) =>
      suspect.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suspect.dni.includes(searchTerm)
  );

  const handleUploadCSV = () => {
    toast.info('Funcionalidad de carga CSV (modo demo)');
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Registros ({filteredSuspects.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleUploadCSV} className="btn-glow bg-gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Cargar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">DNI</th>
                  <th className="text-left py-3 px-4">Patrón ADN</th>
                  <th className="text-left py-3 px-4">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuspects.map((suspect, index) => (
                  <motion.tr
                    key={suspect.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-3 px-4 font-medium">{suspect.name}</td>
                    <td className="py-3 px-4">{suspect.dni}</td>
                    <td className="py-3 px-4 font-mono text-sm text-primary">{suspect.dnaPattern}</td>
                    <td className="py-3 px-4 text-muted-foreground">{suspect.registeredDate}</td>
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

export default Sospechosos;
