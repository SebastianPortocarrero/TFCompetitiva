import React, { useState, useEffect } from 'react';
import { sospechosos } from '../api';

const SuspectManagement = () => {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    cedula: '',
    cadenaADN: '',
    fuenteMuestra: '',
    observaciones: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadSuspects();
  }, [currentPage]);

  const loadSuspects = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await sospechosos.getAll(currentPage, 10);
      setSuspects(response.data.data.sospechosos);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar sospechosos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingId) {
        await sospechosos.update(editingId, formData);
        setEditingId(null);
      } else {
        await sospechosos.create(formData);
      }
      setFormData({
        nombreCompleto: '',
        cedula: '',
        cadenaADN: '',
        fuenteMuestra: '',
        observaciones: ''
      });
      setShowForm(false);
      loadSuspects();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar sospechoso');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (suspect) => {
    setFormData({
      nombreCompleto: suspect.nombreCompleto,
      cedula: suspect.cedula,
      cadenaADN: suspect.cadenaADN,
      fuenteMuestra: suspect.fuenteMuestra || '',
      observaciones: suspect.observaciones || ''
    });
    setEditingId(suspect._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este sospechoso?')) {
      try {
        await sospechosos.delete(id);
        loadSuspects();
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar sospechoso');
      }
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Por favor selecciona un archivo CSV');
      return;
    }

    setUploadLoading(true);
    setError('');
    
    try {
      await sospechosos.uploadCsv(csvFile);
      setCsvFile(null);
      document.getElementById('csv-upload-form').reset();
      loadSuspects();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir archivo CSV');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombreCompleto: '',
      cedula: '',
      cadenaADN: '',
      fuenteMuestra: '',
      observaciones: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Agregar Sospechoso'}
        </button>
        
        <form id="csv-upload-form" onSubmit={handleCsvUpload} className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="file-input"
          />
          <button type="submit" className="btn btn-success" disabled={uploadLoading}>
            {uploadLoading ? 'Subiendo...' : 'Carga Masiva CSV'}
          </button>
        </form>
      </div>

      {showForm && (
        <div className="form-container">
          <h3>{editingId ? 'Editar Sospechoso' : 'Agregar Sospechoso'}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombreCompleto">Nombre Completo:</label>
              <input
                type="text"
                id="nombreCompleto"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cedula">Cédula:</label>
              <input
                type="text"
                id="cedula"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cadenaADN">Cadena ADN (solo ATCG):</label>
              <textarea
                id="cadenaADN"
                name="cadenaADN"
                value={formData.cadenaADN}
                onChange={handleInputChange}
                required
                rows="3"
                placeholder="Ejemplo: ATCGATCG..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="fuenteMuestra">Fuente de Muestra:</label>
              <input
                type="text"
                id="fuenteMuestra"
                name="fuenteMuestra"
                value={formData.fuenteMuestra}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="observaciones">Observaciones:</label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="2"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Cargando sospechosos...</div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Longitud ADN</th>
                <th>Fuente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suspects.map((suspect) => (
                <tr key={suspect._id}>
                  <td>{suspect.nombreCompleto}</td>
                  <td>{suspect.cedula}</td>
                  <td>{suspect.longitudCadena}</td>
                  <td>{suspect.fuenteMuestra}</td>
                  <td>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => handleEdit(suspect)}
                      style={{ marginRight: '5px' }}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(suspect._id)}
                    >
                      Eliminar
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
    </div>
  );
};

export default SuspectManagement;