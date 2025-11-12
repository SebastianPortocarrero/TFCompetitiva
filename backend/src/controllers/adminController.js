const Usuario = require('../models/Usuario');
const { ErrorAPI } = require('../middlewares/errorHandler');

/**
 * ============================================
 * CONTROLADOR: ADMINISTRACIÓN DE USUARIOS
 * ============================================
 *
 * MODELO DE SEGURIDAD FORENSE
 *
 * ⚠️ IMPORTANTE: Este es un sistema forense de identificación de ADN.
 * Por razones de seguridad, responsabilidad legal y cadena de custodia:
 * - NO hay registro público
 * - Solo administradores pueden crear cuentas
 * - Cada usuario debe ser personal autorizado y verificado
 * - Trazabilidad completa de todas las acciones
 *
 * Este controlador solo es accesible para usuarios con rol 'admin'
 */

const formatearUsuario = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  activo: usuario.activo,
  ultimoLogin: usuario.ultimoLogin,
  creadoEn: usuario.createdAt,
  actualizadoEn: usuario.updatedAt
});

/**
 * ============================================
 * POST /api/admin/usuarios/crear
 * Crear nuevo usuario (SOLO ADMIN)
 * ============================================
 *
 * ¿QUÉ HACE?
 * Permite a un administrador crear cuentas para personal autorizado.
 *
 * ¿POR QUÉ SOLO ADMIN?
 * - Control de acceso centralizado
 * - Verificación de identidad previa
 * - Cumplimiento forense: cada usuario debe ser autorizado
 * - Trazabilidad: sabemos quién autorizó cada cuenta
 */
exports.crearUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar que el rol sea válido
    const rolesPermitidos = ['perito', 'admin', 'investigador'];
    if (rol && !rolesPermitidos.includes(rol)) {
      throw new ErrorAPI(`Rol inválido. Roles permitidos: ${rolesPermitidos.join(', ')}`, 400);
    }

    // Verificar si el email ya existe
    const existente = await Usuario.findOne({ email: email.toLowerCase() });
    if (existente) {
      throw new ErrorAPI('El email ya está registrado en el sistema', 400);
    }

    // Crear el usuario
    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      rol: rol || 'perito' // Por defecto, crear como perito
    });

    // Log de auditoría
    console.log(`[AUDITORÍA] Usuario creado por admin:`, {
      admin_id: req.usuario.id,
      admin_email: req.usuario.email,
      nuevo_usuario_id: usuario.id,
      nuevo_usuario_email: usuario.email,
      rol: usuario.rol,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: `Usuario ${nombre} creado exitosamente por administrador`,
      data: formatearUsuario(usuario)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================
 * GET /api/admin/usuarios
 * Listar todos los usuarios
 * ============================================
 */
exports.listarUsuarios = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, rol, activo } = req.query;

    // Construir filtro
    const filtro = {};
    if (rol) filtro.rol = rol;
    if (activo !== undefined) filtro.activo = activo === 'true';

    const skip = (page - 1) * limit;

    const usuarios = await Usuario.find(filtro)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Usuario.countDocuments(filtro);

    res.status(200).json({
      success: true,
      data: {
        usuarios: usuarios.map(formatearUsuario),
        paginacion: {
          pagina: parseInt(page),
          limite: parseInt(limit),
          total,
          totalPaginas: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================
 * PATCH /api/admin/usuarios/:id/activar
 * Activar usuario
 * ============================================
 */
exports.activarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      throw new ErrorAPI('Usuario no encontrado', 404);
    }

    usuario.activo = true;
    await usuario.save();

    // Log de auditoría
    console.log(`[AUDITORÍA] Usuario activado:`, {
      admin_id: req.usuario.id,
      admin_email: req.usuario.email,
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Usuario ${usuario.nombre} activado exitosamente`,
      data: formatearUsuario(usuario)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================
 * PATCH /api/admin/usuarios/:id/desactivar
 * Desactivar usuario
 * ============================================
 */
exports.desactivarUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      throw new ErrorAPI('Usuario no encontrado', 404);
    }

    // No permitir desactivar al propio admin
    if (usuario.id === req.usuario.id) {
      throw new ErrorAPI('No puedes desactivar tu propia cuenta', 400);
    }

    usuario.activo = false;
    await usuario.save();

    // Log de auditoría
    console.log(`[AUDITORÍA] Usuario desactivado:`, {
      admin_id: req.usuario.id,
      admin_email: req.usuario.email,
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Usuario ${usuario.nombre} desactivado exitosamente`,
      data: formatearUsuario(usuario)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================
 * GET /api/admin/usuarios/:id
 * Obtener detalles de un usuario específico
 * ============================================
 */
exports.obtenerUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');

    if (!usuario) {
      throw new ErrorAPI('Usuario no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      data: formatearUsuario(usuario)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================
 * PATCH /api/admin/usuarios/:id
 * Actualizar datos de usuario
 * ============================================
 */
exports.actualizarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      throw new ErrorAPI('Usuario no encontrado', 404);
    }

    // Validar rol si se está actualizando
    if (rol) {
      const rolesPermitidos = ['perito', 'admin', 'investigador'];
      if (!rolesPermitidos.includes(rol)) {
        throw new ErrorAPI(`Rol inválido. Roles permitidos: ${rolesPermitidos.join(', ')}`, 400);
      }
    }

    // Verificar email duplicado si se está cambiando
    if (email && email.toLowerCase() !== usuario.email.toLowerCase()) {
      const emailExistente = await Usuario.findOne({ email: email.toLowerCase() });
      if (emailExistente) {
        throw new ErrorAPI('El email ya está en uso', 400);
      }
    }

    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (rol) usuario.rol = rol;

    await usuario.save();

    // Log de auditoría
    console.log(`[AUDITORÍA] Usuario actualizado:`, {
      admin_id: req.usuario.id,
      admin_email: req.usuario.email,
      usuario_id: usuario.id,
      usuario_email: usuario.email,
      cambios: { nombre, email, rol },
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: formatearUsuario(usuario)
    });
  } catch (error) {
    next(error);
  }
};
