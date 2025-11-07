const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const sospechososRoutes = require('./routes/sospechososRoutes');
const busquedasRoutes = require('./routes/busquedasRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const estadisticasRoutes = require('./routes/estadisticasRoutes');
const { errorHandler, ErrorAPI } = require('./middlewares/errorHandler');

const app = express();

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];

const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

const ventanaMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60 * 60 * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

app.use(
  '/api',
  rateLimit({
    windowMs: ventanaMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use('/uploads', express.static(path.resolve(uploadsDir)));

app.use('/api/auth', authRoutes);
app.use('/api/sospechosos', sospechososRoutes);
app.use('/api/busquedas', busquedasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

app.use((req, res, next) => {
  next(new ErrorAPI(`Ruta no encontrada: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;