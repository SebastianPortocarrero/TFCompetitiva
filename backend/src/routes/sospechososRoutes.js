const express = require('express');
const router = express.Router();

const {
  cargaMasiva,
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
} = require('../controllers/sospechososController');

const { proteger, autorizar } = require('../middlewares/auth');
const { validarSospechoso, validarSospechosoActualizacion, manejarErrores, validarId } = require('../middlewares/validacion');
const { subirCsvSospechosos } = require('../middlewares/upload');
const { ErrorAPI } = require('../middlewares/errorHandler');

const manejarUploadCsv = (req, res, next) => {
  subirCsvSospechosos(req, res, (error) => {
    if (error) {
      next(new ErrorAPI(error.message || 'Error al procesar el archivo', 400));
      return;
    }
    next();
  });
};

router.post(
  '/carga-masiva',
  proteger,
  autorizar('admin'),
  manejarUploadCsv,
  cargaMasiva
);

router.get(
  '/',
  proteger,
  autorizar('admin', 'perito'),
  listar
);

router.get(
  '/:id',
  proteger,
  autorizar('admin', 'perito'),
  validarId,
  manejarErrores,
  obtener
);

router.post(
  '/',
  proteger,
  autorizar('admin'),
  validarSospechoso,
  manejarErrores,
  crear
);

router.put(
  '/:id',
  proteger,
  autorizar('admin'),
  validarId,
  validarSospechosoActualizacion,
  manejarErrores,
  actualizar
);

router.delete(
  '/:id',
  proteger,
  autorizar('admin'),
  validarId,
  manejarErrores,
  eliminar
);

module.exports = router;