const express = require('express');
const router = express.Router();

const {
  iniciarSesion,
  obtenerPerfil
} = require('../controllers/authController');

const { proteger } = require('../middlewares/auth');
const { validarLogin, manejarErrores } = require('../middlewares/validacion');

// Nota: validarRegistro ya no se importa porque el registro público fue eliminado

/**
 * ============================================
 * RUTAS DE AUTENTICACIÓN
 * ============================================
 *
 * MODELO DE SEGURIDAD FORENSE
 *
 * ⚠️ IMPORTANTE: El endpoint POST /api/auth/register ha sido ELIMINADO
 *
 * Razón: Este es un sistema forense de identificación de ADN.
 * El registro público representa:
 * - Riesgo de acceso no autorizado
 * - Falta de control sobre identidad de usuarios
 * - Imposibilidad de garantizar cadena de custodia
 * - Incumplimiento de protocolos forenses
 *
 * ALTERNATIVA:
 * Solo administradores pueden crear usuarios mediante:
 * POST /api/admin/usuarios/crear (ver adminRoutes.js)
 */

// ============================================
// ENDPOINT ELIMINADO (Seguridad Forense)
// ============================================
// router.post('/register', validarRegistro, manejarErrores, registrarUsuario);
//
// Si necesitas crear un usuario, usa el endpoint de administración:
// POST /api/admin/usuarios/crear (requiere rol 'admin')

/**
 * POST /api/auth/login
 * Autenticar usuario con credenciales
 *
 * Solo usuarios creados por administradores pueden hacer login
 */
router.post('/login', validarLogin, manejarErrores, iniciarSesion);

/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 *
 * Requiere: Token JWT válido
 */
router.get('/me', proteger, obtenerPerfil);

module.exports = router;