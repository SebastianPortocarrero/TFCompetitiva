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
  const mimetypesPermitidos = [
    'text/csv',
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
  ];

  const extensionesPermitidas = ['.csv', '.xls', '.xlsx'];
  const extension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (!mimetypesPermitidos.includes(file.mimetype) && !extensionesPermitidas.includes(extension)) {
    cb(new Error('Solo se permiten archivos CSV o Excel (.csv, .xls, .xlsx)'));
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
}).single('file');