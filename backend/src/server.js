require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

iniciarServidor();