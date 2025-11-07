import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { register as registerAPI } from '../api/auth';

const Register = ({ onSwitchToLogin }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('perito');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await registerAPI({ nombre, email, password, rol });
      login(response.data.data.usuario, response.data.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Registrar Usuario</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
            />
          </div>
          <div className="form-group">
            <label htmlFor="rol">Rol:</label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="perito">Perito</option>
              <option value="admin">Admin</option>
              <option value="investigador">Investigador</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
        <div style={{ marginTop: '15px' }}>
          <button className="btn btn-secondary" onClick={onSwitchToLogin}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;