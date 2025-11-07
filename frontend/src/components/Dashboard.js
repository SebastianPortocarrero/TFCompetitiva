import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SuspectManagement from './SuspectManagement';
import Search from './Search';
import SearchHistory from './SearchHistory';
import Reports from './Reports';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('search');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'suspects':
        return <SuspectManagement />;
      case 'search':
        return <Search />;
      case 'history':
        return <SearchHistory />;
      case 'reports':
        return <Reports />;
      default:
        return <Search />;
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Panel de Control - {user?.rol?.toUpperCase()}</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Hola, {user?.nombre}</span>
          <button className="btn btn-secondary" onClick={logout}>Cerrar Sesión</button>
        </div>
      </div>

      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Búsqueda ADN
        </div>
        <div 
          className={`tab ${activeTab === 'suspects' ? 'active' : ''}`}
          onClick={() => setActiveTab('suspects')}
        >
          Sospechosos
        </div>
        <div 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </div>
        <div 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reportes
        </div>
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;