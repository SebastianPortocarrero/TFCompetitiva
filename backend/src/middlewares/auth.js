const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * ============================================
 * MIDDLEWARE: PROTEGER RUTAS
 * ============================================
 *
 * ¿QUÉ HACE?
 * Verifica que el usuario tenga un token JWT válido antes de
 * permitir acceso a una ruta protegida.
 *
 * ¿CÓMO FUNCIONA?
 * 1. Extrae el token del header "Authorization"
 * 2. Verifica que el token sea válido (no expirado, no modificado)
 * 3. Busca al usuario en la BD usando el ID del token
 * 4. Si todo OK, adjunta el usuario a req.usuario y permite continuar
 *
 * ¿POR QUÉ?
 * - Seguridad: Solo usuarios autenticados pueden acceder
 * - Trazabilidad: Sabemos quién hace cada operación
 * - req.usuario: Los controladores pueden acceder al usuario actual
 */
exports.proteger = async (req, res, next) => {
  try {
    let token;

    // PASO 1: Extraer el token del header Authorization
    // El cliente envía: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    // Necesitamos solo la parte después de "Bearer "
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Split por espacio: ["Bearer", "token..."]
      // Tomamos el índice [1] que es el token
      token = req.headers.authorization.split(' ')[1];
    }

    // PASO 2: Verificar que el token exista
    // Si no hay token = usuario no autenticado
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token no proporcionado'
      });
      // 401 = Unauthorized (no autenticado)
    }

    try {
      // PASO 3: Verificar que el token sea válido
      // jwt.verify() hace 3 cosas:
      // 1. Verifica que no haya sido modificado (usando el secreto)
      // 2. Verifica que no haya expirado
      // 3. Decodifica el payload (donde está el ID del usuario)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // decoded = { id: "65abc123...", iat: 1636382400, exp: 1636468800 }
      // iat = issued at (cuándo se creó)
      // exp = expiration (cuándo expira)

      // PASO 4: Buscar al usuario en la BD
      // ¿Por qué buscar si ya tenemos el ID?
      // - Para verificar que el usuario aún existe
      // - Para verificar que no haya sido desactivado
      // - Para tener toda la info del usuario disponible
      req.usuario = await Usuario.findById(decoded.id).select('-password');
      // .select('-password') = No incluir el campo password en el resultado
      // (Nunca exponemos passwords, ni hasheados)

      // PASO 5: Verificar que el usuario exista
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          error: 'No autorizado - Usuario no encontrado'
        });
        // Esto pasa si el usuario fue eliminado después de obtener el token
      }

      // PASO 6: Verificar que el usuario esté activo
      if (!req.usuario.activo) {
        return res.status(401).json({
          success: false,
          error: 'No autorizado - Usuario inactivo'
        });
        // Esto permite "desactivar" usuarios sin borrarlos
      }

      // TODO OK: Permitir acceso
      // next() = "continúa con el siguiente middleware o controlador"
      next();

    } catch (error) {
      // Si jwt.verify() falla, el token es inválido o expirado
      return res.status(401).json({
        success: false,
        error: 'No autorizado - Token inválido o expirado'
      });
    }

  } catch (error) {
    // Error inesperado (error del servidor)
    next(error); // Pasa el error al errorHandler global
  }
};

/**
 * ============================================
 * MIDDLEWARE: AUTORIZAR POR ROLES
 * ============================================
 *
 * ¿QUÉ HACE?
 * Verifica que el usuario tenga uno de los roles permitidos.
 *
 * ¿CÓMO SE USA?
 * app.delete('/admin/sospechosos/:id',
 *   proteger,              // Primero verifica autenticación
 *   autorizar('admin'),    // Luego verifica que sea admin
 *   eliminarSospechoso     // Si pasa, ejecuta el controlador
 * );
 *
 * ¿POR QUÉ?
 * No todos los usuarios deben poder hacer todo.
 * Ejemplo:
 * - PERITO: Puede hacer búsquedas
 * - ADMIN: Puede hacer búsquedas + borrar sospechosos
 * - INVESTIGADOR: Solo puede consultar
 */
exports.autorizar = (...roles) => {
  // Esta función retorna otra función (closure)
  // ¿Por qué? Porque necesitamos pasar parámetros (roles)
  // pero Express espera una función con (req, res, next)

  // Ejemplo de uso: autorizar('admin', 'perito')
  // roles = ['admin', 'perito']

  return (req, res, next) => {
    // En este punto, proteger() ya se ejecutó
    // Entonces req.usuario ya existe

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!roles.includes(req.usuario.rol)) {
      // 403 = Forbidden (autenticado pero sin permisos)
      return res.status(403).json({
        success: false,
        error: `El rol ${req.usuario.rol} no tiene autorización para acceder a este recurso`
      });
    }

    // Rol permitido: continuar
    next();
  };
};

/**
 * ============================================
 * UTILIDAD: GENERAR TOKEN JWT
 * ============================================
 *
 * ¿QUÉ HACE?
 * Crea un token JWT firmado con la información del usuario.
 *
 * ¿CUÁNDO SE USA?
 * - Cuando el usuario hace login exitoso
 * - Cuando el usuario se registra
 *
 * ¿QUÉ CONTIENE EL TOKEN?
 * Payload: { id: "65abc123..." }
 *
 * ¿POR QUÉ SOLO EL ID?
 * - Menor tamaño del token (se envía en cada request)
 * - Si el usuario cambia datos (nombre, email), el token sigue válido
 * - Cuando verificamos, buscamos info actualizada en BD
 */
exports.generarToken = (userId) => {
  return jwt.sign(
    { id: userId },                           // Payload (datos a incluir)
    process.env.JWT_SECRET,                   // Secreto para firmar
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }  // Expira en 24h
  );

  // jwt.sign() hace 3 cosas:
  // 1. Toma el payload { id: userId }
  // 2. Lo firma con el secreto (para que no pueda ser modificado)
  // 3. Agrega fecha de expiración

  // Resultado: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YWJj..."
};
