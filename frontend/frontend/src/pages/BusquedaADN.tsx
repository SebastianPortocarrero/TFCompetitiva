import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { mockSuspects } from '@/data/mockData';

interface Match {
  name: string;
  dni: string;
  position: number;
  algorithm: string;
}

const BusquedaADN = () => {
  const [caseNumber, setCaseNumber] = useState('');
  const [pattern, setPattern] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [searched, setSearched] = useState(false);

  const handleAnalysis = async () => {
    if (!caseNumber || !pattern) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setSearched(false);
    setMatches([]);

    // Simular progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simular búsqueda
    setTimeout(() => {
      const foundMatches: Match[] = [];
      mockSuspects.forEach((suspect, index) => {
        if (suspect.dnaPattern.includes(pattern)) {
          foundMatches.push({
            name: suspect.name,
            dni: suspect.dni,
            position: index + 1,
            algorithm: ['Knuth-Morris-Pratt', 'Boyer-Moore', 'Rabin-Karp'][Math.floor(Math.random() * 3)],
          });
        }
      });

      setMatches(foundMatches);
      setAnalyzing(false);
      setSearched(true);
      
      if (foundMatches.length > 0) {
        toast.success(`Se encontraron ${foundMatches.length} coincidencia(s)`);
      } else {
        toast.info('No se encontraron coincidencias');
      }
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Búsqueda de ADN</h1>
        <p className="text-muted-foreground">Analizar patrones de ADN en la base de datos</p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Datos del Caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Número de Caso *</Label>
              <Input
                id="caseNumber"
                placeholder="CASO-2024-XXX"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                disabled={analyzing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern">Patrón de ADN *</Label>
              <Input
                id="pattern"
                placeholder="ATCGATCG"
                value={pattern}
                onChange={(e) => setPattern(e.target.value.toUpperCase())}
                disabled={analyzing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Caso</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales del caso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={analyzing}
              rows={4}
            />
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={analyzing}
            className="w-full md:w-auto btn-glow bg-gradient-primary"
          >
            <Search className="w-4 h-4 mr-2" />
            {analyzing ? 'Analizando...' : 'Iniciar Análisis'}
          </Button>
        </CardContent>
      </Card>

      {analyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progreso del análisis</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Comparando patrón con base de datos...
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {searched && matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Coincidencias Encontradas ({matches.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">DNI</th>
                      <th className="text-left py-3 px-4">Posición</th>
                      <th className="text-left py-3 px-4">Algoritmo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-3 px-4">{match.name}</td>
                        <td className="py-3 px-4">{match.dni}</td>
                        <td className="py-3 px-4">{match.position}</td>
                        <td className="py-3 px-4 text-primary">{match.algorithm}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {searched && matches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron coincidencias</h3>
                <p className="text-sm text-muted-foreground">
                  El patrón de ADN no coincide con ningún registro en la base de datos
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BusquedaADN;
