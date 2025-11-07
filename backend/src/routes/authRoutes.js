const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfil
} = require('../controllers/authController');

const { proteger } = require('../middlewares/auth');
const { validarRegistro, validarLogin, manejarErrores } = require('../middlewares/validacion');

router.post('/register', validarRegistro, manejarErrores, registrarUsuario);
router.post('/login', validarLogin, manejarErrores, iniciarSesion);
router.get('/me', proteger, obtenerPerfil);

module.exports = router;