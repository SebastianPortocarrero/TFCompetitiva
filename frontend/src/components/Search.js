import React, { useState } from 'react';
import { busquedas } from '../api';

const Search = () => {
  const [patron, setPatron] = useState('');
  const [patrones, setPatrones] = useState(['']);
  const [casoNumero, setCasoNumero] = useState('');
  const [descripcionCaso, setDescripcionCaso] = useState('');
  const [ubicacionEvidencia, setUbicacionEvidencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('single');

  const handlePatronChange = (index, value) => {
    const newPatrones = [...patrones];
    newPatrones[index] = value;
    setPatrones(newPatrones);
  };

  const addPatron = () => {
    setPatrones([...patrones, '']);
  };

  const removePatron = (index) => {
    if (patrones.length > 1) {
      const newPatrones = patrones.filter((_, i) => i !== index);
      setPatrones(newPatrones);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const searchData = {
        casoNumero,
        descripcionCaso,
        ubicacionEvidencia
      };

      if (activeTab === 'single') {
        searchData.patron = patron;
      } else {
        const validPatrones = patrones.filter(p => p.trim() !== '');
        if (validPatrones.length === 0) {
          throw new Error('Debe ingresar al menos un patrón');
        }
        searchData.patrones = validPatrones;
      }

      const response = await busquedas.execute(searchData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Búsqueda de ADN</h3>
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Patrón Individual
        </div>
        <div 
          className={`tab ${activeTab === 'multiple' ? 'active' : ''}`}
          onClick={() => setActiveTab('multiple')}
        >
          Múltiples Patrones
        </div>
      </div>

      <div className="tab-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="casoNumero">Número de Caso:</label>
            <input
              type="text"
              id="casoNumero"
              value={casoNumero}
              onChange={(e) => setCasoNumero(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="descripcionCaso">Descripción del Caso:</label>
            <textarea
              id="descripcionCaso"
              value={descripcionCaso}
              onChange={(e) => setDescripcionCaso(e.target.value)}
              rows="2"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ubicacionEvidencia">Ubicación de Evidencia:</label>
            <input
              type="text"
              id="ubicacionEvidencia"
              value={ubicacionEvidencia}
              onChange={(e) => setUbicacionEvidencia(e.target.value)}
            />
          </div>

          {activeTab === 'single' ? (
            <div className="form-group">
              <label htmlFor="patron">Patrón de ADN (solo ATCG):</label>
              <input
                type="text"
                id="patron"
                value={patron}
                onChange={(e) => setPatron(e.target.value.toUpperCase())}
                placeholder="Ej: ATCG"
                required
              />
              <small>Ingrese solo caracteres A, T, C, G</small>
            </div>
          ) : (
            <div className="form-group">
              <label>Patrones de ADN (solo ATCG):</label>
              {patrones.map((patron, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={patron}
                    onChange={(e) => handlePatronChange(index, e.target.value.toUpperCase())}
                    placeholder={`Patrón ${index + 1} (solo ATCG)`}
                    style={{ marginRight: '10px', flex: 1 }}
                  />
                  {patrones.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={() => removePatron(index)}
                      style={{ padding: '5px 10px' }}
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={addPatron}
                style={{ marginTop: '10px' }}
              >
                + Agregar Patrón
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Iniciar Búsqueda'}
          </button>
        </form>

        {error && <div className="alert alert-error" style={{ marginTop: '20px' }}>{error}</div>}

        {result && (
          <div className="search-results" style={{ marginTop: '20px' }}>
            <h4>Resultados de la Búsqueda</h4>
            <div className="alert alert-info">
              <strong>Caso:</strong> {result.casoNumero || 'No especificado'}<br />
              <strong>Patrones buscados:</strong> {result.patrones?.length || 0}<br />
              <strong>Algoritmo usado:</strong> {result.algoritmoUsado}<br />
              <strong>Total procesados:</strong> {result.totalSospechososProcesados}<br />
              <strong>Coincidencias encontradas:</strong> {result.totalCoincidencias}<br />
              <strong>Tiempo de ejecución:</strong> {result.tiempoEjecucionMs}ms<br />
              <strong>Fecha:</strong> {new Date(result.fecha).toLocaleString()}
            </div>

            {result.coincidencias && result.coincidencias.length > 0 ? (
              <div>
                <h5>Coincidencias:</h5>
                {result.coincidencias.map((coincidencia, index) => (
                  <div key={index} className="result-item">
                    <strong>{coincidencia.nombre}</strong> (Cédula: {coincidencia.cedula})<br />
                    <strong>Patrón:</strong> {coincidencia.patron} <strong>en posición:</strong> {coincidencia.posicion}
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                No se encontraron coincidencias para los patrones especificados.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;