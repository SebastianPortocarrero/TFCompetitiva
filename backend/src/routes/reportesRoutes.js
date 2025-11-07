const express = require('express');
const { param } = require('express-validator');

const router = express.Router();

const { generar, descargar } = require('../controllers/reportesController');
const { proteger, autorizar } = require('../middlewares/auth');
const { manejarErrores, validarId } = require('../middlewares/validacion');

router.post(
  '/generar/:busquedaId',
  proteger,
  autorizar('admin', 'perito'),
  param('busquedaId').isMongoId().withMessage('ID de búsqueda inválido'),
  manejarErrores,
  generar
);

router.get(
  '/descargar/:id',
  proteger,
  autorizar('admin', 'perito', 'investigador'),
  validarId,
  manejarErrores,
  descargar
);

module.exports = router;