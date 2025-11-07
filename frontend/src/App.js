import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const { token } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema Forense de Identificación ADN</h1>
      </header>
      <main>
        {token ? <Dashboard /> : <Login />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;