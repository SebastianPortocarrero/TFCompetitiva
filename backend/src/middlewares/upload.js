const multer = require('multer');
const fs = require('fs');

const directorioTemporal = process.env.TEMP_DIR || 'temp';

if (!fs.existsSync(directorioTemporal)) {
  fs.mkdirSync(directorioTemporal, { recursive: true });
}

const storageTemporal = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, directorioTemporal);
  },
  filename: (_, file, cb) => {
    const timestamp = Date.now();
    const nombre = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}_${nombre}`);
  }
});

const filtrarCsv = (_, file, cb) => {
  if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
    cb(new Error('Solo se permiten archivos CSV'));
    return;
  }
  cb(null, true);
};

exports.subirCsvSospechosos = multer({
  storage: storageTemporal,
  fileFilter: filtrarCsv,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
}).single('csv');