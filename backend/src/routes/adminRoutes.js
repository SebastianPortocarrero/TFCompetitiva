const express = require('express');
const router = express.Router();

const {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  activarUsuario,
  desactivarUsuario
} = require('../controllers/adminController');

const { proteger, autorizar } = require('../middlewares/auth');
const { validarRegistro, manejarErrores } = require('../middlewares/validacion');

/**
 * ============================================
 * RUTAS DE ADMINISTRACIÓN
 * ============================================
 *
 * MODELO DE SEGURIDAD FORENSE
 *
 * ⚠️ IMPORTANTE: Todas estas rutas requieren:
 * 1. Estar autenticado (middleware: proteger)
 * 2. Tener rol 'admin' (middleware: autorizar('admin'))
 *
 * Solo personal con rol de administrador puede:
 * - Crear nuevos usuarios
 * - Listar usuarios del sistema
 * - Activar/desactivar cuentas
 * - Actualizar información de usuarios
 */

// ============================================
// GESTIÓN DE USUARIOS (SOLO ADMIN)
// ============================================

/**
 * POST /api/admin/usuarios
 * Crear nuevo usuario en el sistema
 *
 * Requiere: Autenticación + Rol Admin
 */
router.post(
  '/usuarios',
  proteger,
  autorizar('admin'),
  validarRegistro,
  manejarErrores,
  crearUsuario
);

/**
 * GET /api/admin/usuarios
 * Listar todos los usuarios
 *
 * Query params:
 * - page: número de página (default: 1)
 * - limit: registros por página (default: 20)
 * - rol: filtrar por rol (opcional)
 * - activo: filtrar por estado (opcional)
 *
 * Requiere: Autenticación + Rol Admin
 */
router.get(
  '/usuarios',
  proteger,
  autorizar('admin'),
  listarUsuarios
);

/**
 * GET /api/admin/usuarios/:id
 * Obtener detalles de un usuario específico
 *
 * Requiere: Autenticación + Rol Admin
 */
router.get(
  '/usuarios/:id',
  proteger,
  autorizar('admin'),
  obtenerUsuario
);

/**
 * PATCH /api/admin/usuarios/:id
 * Actualizar datos de un usuario
 *
 * Body: { nombre?, email?, rol? }
 *
 * Requiere: Autenticación + Rol Admin
 */
router.patch(
  '/usuarios/:id',
  proteger,
  autorizar('admin'),
  actualizarUsuario
);

/**
 * PATCH /api/admin/usuarios/:id/activar
 * Activar cuenta de usuario
 *
 * Requiere: Autenticación + Rol Admin
 */
router.patch(
  '/usuarios/:id/activar',
  proteger,
  autorizar('admin'),
  activarUsuario
);

/**
 * PATCH /api/admin/usuarios/:id/desactivar
 * Desactivar cuenta de usuario
 *
 * Requiere: Autenticación + Rol Admin
 */
router.patch(
  '/usuarios/:id/desactivar',
  proteger,
  autorizar('admin'),
  desactivarUsuario
);

module.exports = router;
