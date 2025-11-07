const express = require('express');
const { query } = require('express-validator');
const router = express.Router();

const { ejecutar, historial, obtenerDetalle } = require('../controllers/busquedasController');
const { proteger, autorizar } = require('../middlewares/auth');
const { validarBusqueda, manejarErrores, validarPaginacion, validarId } = require('../middlewares/validacion');

router.post(
  '/ejecutar',
  proteger,
  autorizar('perito', 'admin'),
  validarBusqueda,
  manejarErrores,
  ejecutar
);

router.get(
  '/historial',
  proteger,
  autorizar('perito', 'admin', 'investigador'),
  query('usuarioId').optional().isMongoId().withMessage('usuarioId inválido'),
  validarPaginacion,
  manejarErrores,
  historial
);

router.get(
  '/:id',
  proteger,
  autorizar('perito', 'admin', 'investigador'),
  validarId,
  manejarErrores,
  obtenerDetalle
);

module.exports = router;