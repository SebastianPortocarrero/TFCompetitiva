const express = require('express');
const router = express.Router();

const { resumen } = require('../controllers/estadisticasController');
const { proteger, autorizar } = require('../middlewares/auth');

router.get(
  '/resumen',
  proteger,
  autorizar('admin', 'perito', 'investigador'),
  resumen
);

module.exports = router;