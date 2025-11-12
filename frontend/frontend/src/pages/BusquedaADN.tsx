import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AlertCircle, Plus, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import logo from '../img/logo.webp';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Match {
  nombre: string;
  cedula: string;
  patronId?: number;
  patron: string;
  posicion: number;
}

const BusquedaADN = () => {
  const [caseNumber, setCaseNumber] = useState('');
  const [isNewCase, setIsNewCase] = useState(true);
  const [existingCases, setExistingCases] = useState<string[]>([]);
  const [currentPattern, setCurrentPattern] = useState('');
  const [patterns, setPatterns] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [searched, setSearched] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [algorithmUsed, setAlgorithmUsed] = useState<string>('');

  // Cargar casos existentes al montar el componente
  useEffect(() => {
    fetchExistingCases();
  }, []);

  const fetchExistingCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/busquedas/historial?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Si el token expiró, redirigir al login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const response_data = await response.json();
        console.log('📋 Respuesta del historial:', response_data);
        const busquedas = response_data.data?.busquedas || [];
        console.log('📋 Búsquedas encontradas:', busquedas.length);
        console.log('📋 Búsquedas completas:', busquedas);
        // Extraer números de caso únicos
        const casosUnicos = [...new Set(busquedas.map((b: any) => b.casoNumero).filter((c: string) => c))];
        console.log('📋 Casos únicos encontrados:', casosUnicos);
        setExistingCases(casosUnicos as string[]);
        console.log('📋 Estado actualizado con', casosUnicos.length, 'casos');
      }
    } catch (error) {
      console.error('Error al cargar casos existentes:', error);
    }
  };

  const handleAddPattern = () => {
    if (!currentPattern.trim()) {
      toast.error('Ingrese un patrón válido');
      return;
    }

    const cleanPattern = currentPattern.trim().toUpperCase();

    // Validar que solo contenga ATCG
    if (!/^[ATCG]+$/.test(cleanPattern)) {
      toast.error('El patrón solo debe contener las letras A, T, C, G');
      return;
    }

    // Validar longitud (5-100 caracteres según backend)
    if (cleanPattern.length < 5 || cleanPattern.length > 100) {
      toast.error('El patrón debe tener entre 5 y 100 caracteres');
      return;
    }

    // Verificar si el patrón ya existe
    if (patterns.includes(cleanPattern)) {
      toast.error('Este patrón ya fue agregado');
      return;
    }

    setPatterns([...patterns, cleanPattern]);
    setCurrentPattern('');
    toast.success(`Patrón agregado (${patterns.length + 1} total)`);
  };

  const handleRemovePattern = (index: number) => {
    const newPatterns = patterns.filter((_, i) => i !== index);
    setPatterns(newPatterns);
    toast.info('Patrón eliminado');
  };

  const handleAnalysis = async () => {
    if (!caseNumber || patterns.length === 0) {
      toast.error('Complete todos los campos obligatorios (caso y al menos 1 patrón)');
      return;
    }

    setAnalyzing(true);
    setProgress(0);
    setSearched(false);
    setMatches([]);
    setExecutionTime(0);
    setAlgorithmUsed('');

    // Simular progreso visual
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const token = localStorage.getItem('token');

      // Asegurar que los patrones estén limpios (sin espacios, solo ATCG)
      const patronesLimpios = patterns.map(p => p.trim().toUpperCase());

      console.log('📤 Enviando búsqueda:', {
        patrones: patronesLimpios,
        casoNumero: caseNumber
      });

      const response = await fetch(`${API_BASE_URL}/api/busquedas/ejecutar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patrones: patronesLimpios,
          casoNumero: caseNumber,
          descripcionCaso: description || undefined,
        }),
      });

      clearInterval(interval);
      setProgress(100);

      // Si el token expiró, redirigir al login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!response.ok) {
        let errorMessage = 'Error al ejecutar la búsqueda';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
          console.error('Error del backend:', error);
        } catch (e) {
          console.error('Error parseando respuesta de error');
        }
        throw new Error(errorMessage);
      }

      const response_data = await response.json();
      // Backend devuelve: { success: true, data: { coincidencias: [...], algoritmoUsado, tiempoEjecucionMs, ... } }
      const data = response_data.data || response_data;

      const foundMatches: Match[] = data.coincidencias || [];

      setMatches(foundMatches);
      setExecutionTime(data.tiempoEjecucionMs || 0);
      setAlgorithmUsed(data.algoritmoUsado || 'Automático');
      setSearched(true);

      if (foundMatches.length > 0) {
        toast.success(`Se encontraron ${foundMatches.length} coincidencia(s) usando ${data.algoritmoUsado || 'algoritmo automático'} con ${patterns.length} patrón(es)`);
      } else {
        toast.info('No se encontraron coincidencias');
      }

      // Recargar casos existentes después de una búsqueda exitosa
      fetchExistingCases();
    } catch (error: any) {
      clearInterval(interval);
      toast.error(error.message || 'Error al ejecutar la búsqueda');
      setSearched(true);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Búsqueda de ADN</h1>
        <p className="text-muted-foreground">Analizar múltiples patrones de ADN en la base de datos (algoritmo automático)</p>
      </motion.div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Datos del Caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="caseNumber">Número de Caso *</Label>
              <div className="flex items-center gap-2 text-sm bg-muted rounded-md p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCase(true);
                    setCaseNumber('');
                  }}
                  disabled={analyzing}
                  className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                    isNewCase
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  Nuevo Caso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCase(false);
                    setCaseNumber('');
                  }}
                  disabled={analyzing || existingCases.length === 0}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    existingCases.length === 0
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : !isNewCase
                        ? 'bg-primary text-primary-foreground shadow-sm cursor-pointer'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background cursor-pointer'
                  }`}
                  title={existingCases.length === 0 ? 'No hay casos existentes' : 'Seleccionar caso existente'}
                >
                  Caso Existente ({existingCases.length})
                </button>
              </div>
            </div>

            {isNewCase ? (
              <Input
                id="caseNumber"
                placeholder="CASO-2024-XXX"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                disabled={analyzing}
              />
            ) : (
              <Select value={caseNumber} onValueChange={setCaseNumber} disabled={analyzing}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un caso existente" />
                </SelectTrigger>
                <SelectContent>
                  {existingCases.map((caso) => (
                    <SelectItem key={caso} value={caso}>
                      {caso}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pattern">Patrón de ADN * (5-100 caracteres, solo ATCG)</Label>
            <div className="flex gap-2">
              <Input
                id="pattern"
                placeholder="ATCGATCG"
                value={currentPattern}
                onChange={(e) => setCurrentPattern(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPattern();
                  }
                }}
                disabled={analyzing}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddPattern}
                disabled={analyzing || !currentPattern.trim()}
                variant="outline"
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          {patterns.length > 0 && (
            <div className="space-y-2">
              <Label>Patrones Agregados ({patterns.length})</Label>
              <div className="flex flex-wrap gap-2">
                {patterns.map((pattern, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-sm font-mono px-3 py-1.5 flex items-center gap-2"
                  >
                    <span>{pattern.length > 20 ? `${pattern.substring(0, 20)}...` : pattern}</span>
                    <button
                      onClick={() => handleRemovePattern(index)}
                      disabled={analyzing}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Caso (Opcional)</Label>
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
            <img src={logo} alt="DNA Forensics Logo" className="w-4 h-4 mr-2 object-contain filter brightness-125 contrast-125 drop-shadow-lg" />
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
                  El motor está seleccionando el algoritmo óptimo y comparando {patterns.length} patrón(es) contra la base de datos...
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Coincidencias Encontradas ({matches.length})</CardTitle>
              {algorithmUsed && (
                <Badge variant="outline" className="text-sm">
                  Algoritmo: {algorithmUsed}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm text-muted-foreground">
                  Tiempo de ejecución: <span className="font-medium text-primary">{executionTime}ms</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Patrones analizados: <span className="font-medium text-primary">{patterns.length}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Total de coincidencias: <span className="font-medium text-primary">{matches.length}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Sospechosos con coincidencias: <span className="font-medium text-primary">{[...new Set(matches.map(m => m.cedula))].length}</span>
                </p>
                {matches.length > [...new Set(matches.map(m => m.cedula))].length && (
                  <p className="text-xs text-amber-500 flex items-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" />
                    Hay sospechosos con múltiples coincidencias (patrón repetido en diferentes posiciones)
                  </p>
                )}
              </div>

              {patterns.length > 1 && (
                <div className="mb-4 p-4 border border-border rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">Resumen por Patrón</h4>
                  <div className="space-y-2">
                    {patterns.map((pattern, idx) => {
                      const matchesForPattern = matches.filter(m => m.patronId === idx);
                      const hasMatches = matchesForPattern.length > 0;
                      const uniqueSuspects = [...new Set(matchesForPattern.map(m => m.cedula))].length;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={hasMatches ? "default" : "secondary"} className="text-xs">
                              #{idx + 1}
                            </Badge>
                            <span className="font-mono text-sm text-muted-foreground">
                              {pattern.length > 25 ? `${pattern.substring(0, 25)}...` : pattern}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {hasMatches ? (
                              <>
                                <span className="text-sm text-green-500 font-medium">
                                  {uniqueSuspects} sospechoso{uniqueSuspects !== 1 ? 's' : ''}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({matchesForPattern.length} coincidencia{matchesForPattern.length !== 1 ? 's' : ''})
                                </span>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                Sin coincidencias
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">Cédula</th>
                      <th className="text-left py-3 px-4">Patrón Coincidente</th>
                      <th className="text-left py-3 px-4">Posición</th>
                      {patterns.length > 1 && <th className="text-left py-3 px-4">ID Patrón</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((match, index) => (
                      <motion.tr
                        key={`${match.cedula}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-border/50 hover:bg-muted/30"
                      >
                        <td className="py-3 px-4 font-medium">{match.nombre}</td>
                        <td className="py-3 px-4">{match.cedula}</td>
                        <td className="py-3 px-4 font-mono text-sm text-primary">{match.patron}</td>
                        <td className="py-3 px-4">{match.posicion}</td>
                        {patterns.length > 1 && (
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              Patrón #{match.patronId !== undefined ? match.patronId + 1 : '?'}
                            </Badge>
                          </td>
                        )}
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
                {algorithmUsed && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Algoritmo utilizado: {algorithmUsed}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default BusquedaADN;
