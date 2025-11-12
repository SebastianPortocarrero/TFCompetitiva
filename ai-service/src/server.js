require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', chatRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: 'AI Microservice',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      chat: 'POST /api/chat',
      clearSession: 'DELETE /api/chat/session/:sessionId',
      contexts: 'GET /api/contexts',
      health: 'GET /api/health'
    }
  });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🤖 AI MICROSERVICE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════════════════\n');
  console.log('⚠️  IMPORTANTE: Asegúrate de tener Ollama corriendo');
  console.log('   Comando: ollama serve');
  console.log('   Modelo: ollama pull llama3.2\n');
});
