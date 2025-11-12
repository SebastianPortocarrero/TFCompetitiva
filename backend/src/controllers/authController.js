const Usuario = require('../models/Usuario');
const { generarToken } = require('../middlewares/auth');
const { ErrorAPI } = require('../middlewares/errorHandler');

/**
 * ============================================
 * CONTROLADOR: AUTENTICACIÓN
 * ============================================
 *
 * MODELO DE SEGURIDAD FORENSE
 *
 * ⚠️ IMPORTANTE: La función de registro público ha sido ELIMINADA
 *
 * Razón: Este es un sistema forense de identificación de ADN.
 * Solo administradores pueden crear usuarios.
 *
 * Ver: backend/src/controllers/adminController.js
 */

const formatearUsuario = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  activo: usuario.activo,
  creadoEn: usuario.createdAt
});

// ============================================
// FUNCIÓN ELIMINADA (Seguridad Forense)
// ============================================
//
// exports.registrarUsuario = async (req, res, next) => { ... }
//
// El registro de usuarios ahora se hace mediante:
// POST /api/admin/usuarios/crear (requiere rol 'admin')
// Ver: backend/src/controllers/adminController.js -> crearUsuario()

/**
 * POST /api/auth/login
 * Autenticar usuario con credenciales
 */
exports.iniciarSesion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');

    if (!usuario) {
      throw new ErrorAPI('Credenciales inválidas', 401);
    }

    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      throw new ErrorAPI('Credenciales inválidas', 401);
    }

    if (!usuario.activo) {
      throw new ErrorAPI('Cuenta inactiva, contacta al administrador', 403);
    }

    usuario.ultimoLogin = new Date();
    await usuario.save({ validateBeforeSave: false });

    const token = generarToken(usuario.id);
    res.status(200).json({
      success: true,
      data: {
        token,
        usuario: formatearUsuario(usuario)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerPerfil = async (req, res) => {
  res.status(200).json({
    success: true,
    data: formatearUsuario(req.usuario)
  });
};