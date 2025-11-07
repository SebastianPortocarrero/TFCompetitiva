import React, { useState, useEffect } from 'react';
import { busquedas } from '../api';

const SearchHistory = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSearch, setSelectedSearch] = useState(null);

  useEffect(() => {
    loadSearchHistory();
  }, [currentPage]);

  const loadSearchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await busquedas.getHistory(currentPage, 10);
      setSearches(response.data.data.busquedas);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar historial de búsquedas');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchDetail = async (id) => {
    try {
      const response = await busquedas.getById(id);
      setSelectedSearch(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar detalles de búsqueda');
    }
  };

  const handleViewDetails = async (search) => {
    await loadSearchDetail(search._id);
  };

  const handleCloseDetails = () => {
    setSelectedSearch(null);
  };

  return (
    <div>
      <h3>Historial de Búsquedas</h3>
      
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando historial de búsquedas...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Caso</th>
                <th>Patrones</th>
                <th>Coincidencias</th>
                <th>Algoritmo</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {searches.map((search) => (
                <tr key={search._id}>
                  <td>{search.casoNumero || 'N/A'}</td>
                  <td>{search.patrones?.length || 0}</td>
                  <td>{search.totalCoincidencias}</td>
                  <td>{search.algoritmoUsado}</td>
                  <td>{new Date(search.fecha).toLocaleString()}</td>
                  <td>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleViewDetails(search)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span style={{ margin: '0 15px', alignSelf: 'center' }}>
              Página {currentPage} de {totalPages}
            </span>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      {selectedSearch && (
        <div className="form-container" style={{ marginTop: '20px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4>Detalles de la Búsqueda</h4>
            <button className="btn btn-secondary" onClick={handleCloseDetails}>Cerrar</button>
          </div>
          
          <div className="alert alert-info">
            <strong>Caso:</strong> {selectedSearch.casoNumero || 'No especificado'}<br />
            <strong>Descripción:</strong> {selectedSearch.descripcionCaso || 'No especificada'}<br />
            <strong>Ubicación de Evidencia:</strong> {selectedSearch.ubicacionEvidencia || 'No especificada'}<br />
            <strong>Patrones:</strong> {selectedSearch.patrones?.join(', ')}<br />
            <strong>Algoritmo usado:</strong> {selectedSearch.algoritmoUsado}<br />
            <strong>Total procesados:</strong> {selectedSearch.totalSospechososProcesados}<br />
            <strong>Coincidencias:</strong> {selectedSearch.totalCoincidencias}<br />
            <strong>Tiempo de ejecución:</strong> {selectedSearch.tiempoEjecucionMs}ms<br />
            <strong>Fecha:</strong> {new Date(selectedSearch.fecha).toLocaleString()}<br />
            <strong>Usuario:</strong> {selectedSearch.usuarioId?.nombre || 'Desconocido'}
          </div>

          {selectedSearch.coincidencias && selectedSearch.coincidencias.length > 0 ? (
            <div>
              <h5>Coincidencias encontradas:</h5>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Patrón</th>
                    <th>Posición</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSearch.coincidencias.map((coincidencia, index) => (
                    <tr key={index}>
                      <td>{coincidencia.nombre}</td>
                      <td>{coincidencia.cedula}</td>
                      <td>{coincidencia.patron}</td>
                      <td>{coincidencia.posicion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              No se encontraron coincidencias en esta búsqueda.
            </div>
          )}
        </div>
      )}

      {selectedSearch && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 999 
          }}
          onClick={handleCloseDetails}
        ></div>
      )}
    </div>
  );
};

export default SearchHistory;