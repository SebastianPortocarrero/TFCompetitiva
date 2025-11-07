import React, { useState, useEffect } from 'react';
import { reportes } from '../api';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      // For now, just show a message since we don't have specific stats endpoint
      // In a real implementation, you would call the stats API
      setStats({
        totalSospechosos: 'N/A',
        totalBusquedas: 'N/A',
        busquedasHoy: 'N/A',
        algoritmoMasUsado: 'N/A'
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Reportes y Estadísticas</h3>
      
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando reportes...</div>
      ) : (
        <div>
          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <h4>Estadísticas Generales</h4>
            <p><strong>Total de Sospechosos:</strong> {stats?.totalSospechosos}</p>
            <p><strong>Total de Búsquedas Realizadas:</strong> {stats?.totalBusquedas}</p>
            <p><strong>Búsquedas Realizadas Hoy:</strong> {stats?.busquedasHoy}</p>
            <p><strong>Algoritmo Más Usado:</strong> {stats?.algoritmoMasUsado}</p>
          </div>

          <div className="form-container">
            <h4>Generar Reporte Personalizado</h4>
            <p>Utilice el historial de búsquedas para revisar los resultados detallados de cada búsqueda realizada.</p>
            <p>Para reportes personalizados, el sistema guarda todo el historial de búsquedas con sus parámetros y resultados.</p>
          </div>

          <div className="form-container" style={{ marginTop: '20px' }}>
            <h4>Acerca del Sistema</h4>
            <p>Este sistema implementa algoritmos eficientes de búsqueda de patrones en cadenas de ADN:</p>
            <ul style={{ textAlign: 'left' }}>
              <li><strong>KMP (Knuth-Morris-Pratt):</strong> Eficiente para patrones con subcadenas repetidas</li>
              <li><strong>Rabin-Karp:</strong> Utiliza hashing para comparaciones rápidas</li>
              <li><strong>Aho-Corasick:</strong> Óptimo para búsqueda de múltiples patrones</li>
            </ul>
            <p>Los tiempos de ejecución se registran para cada búsqueda, permitiendo análisis de rendimiento.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;