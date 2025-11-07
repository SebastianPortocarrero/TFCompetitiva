/**
 * ============================================
 * CLASE: ERROR PERSONALIZADO
 * ============================================
 *
 * ¿QUÉ ES?
 * Una clase de error personalizada que extiende la clase Error nativa.
 *
 * ¿POR QUÉ CREAR UNA CLASE?
 * Para diferenciar errores operacionales (esperados) de errores de programación.
 *
 * EJEMPLO:
 * throw new ErrorAPI('Usuario no encontrado', 404);
 *
 * vs
 *
 * throw new Error('Usuario no encontrado'); // Error genérico
 */
class ErrorAPI extends Error {
  constructor(message, statusCode) {
    super(message); // Llama al constructor de Error padre
    this.statusCode = statusCode; // HTTP status code (400, 401, 404, 500, etc.)
    this.isOperational = true; // Flag para identificar que es un error esperado

    // captureStackTrace nos da el stack trace (útil para debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ============================================
 * MIDDLEWARE: MANEJADOR GLOBAL DE ERRORES
 * ============================================
 *
 * ¿QUÉ HACE?
 * Captura TODOS los errores que ocurran en la aplicación y
 * los convierte en respuestas JSON consistentes.
 *
 * ¿CÓMO FUNCIONA?
 * Este middleware debe ser el ÚLTIMO en la cadena de middlewares.
 * Cuando cualquier parte del código hace next(error) o throw error,
 * este middleware lo captura.
 *
 * ¿POR QUÉ?
 * - Respuestas consistentes: Todos los errores tienen el mismo formato
 * - Mensajes claros: El frontend sabe qué mostrar al usuario
 * - Seguridad: No exponemos detalles internos en producción
 *
 * FORMATO DE RESPUESTA:
 * {
 *   "success": false,
 *   "error": "Mensaje descriptivo"
 * }
 */
const errorHandler = (err, req, res, next) => {
  // Clonamos el error para no modificar el original
  let error = { ...err };
  error.message = err.message;

  // ============================================
  // LOG DEL ERROR (Solo en desarrollo)
  // ============================================
  // En desarrollo queremos ver todos los detalles
  // En producción, los detalles van a archivos de log
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error completo:', err);
  }

  // ============================================
  // TRANSFORMAR ERRORES ESPECÍFICOS
  // ============================================

  // CASO 1: Error de Mongoose - CastError
  // Ocurre cuando pasas un ID inválido
  // Ejemplo: /api/busquedas/123abc (no es un ObjectId válido)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new ErrorAPI(message, 404);
    // 404 = Not Found
  }

  // CASO 2: Error de Mongoose - ValidationError
  // Ocurre cuando los datos no pasan las validaciones del schema
  // Ejemplo: email inválido, campo requerido faltante
  if (err.name === 'ValidationError') {
    // Mongoose nos da múltiples errores en err.errors
    // Los extraemos y juntamos en un solo mensaje
    const message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    error = new ErrorAPI(message, 400);
    // 400 = Bad Request (datos inválidos)
  }

  // CASO 3: Error de Mongoose - Duplicate Key (código 11000)
  // Ocurre cuando intentas insertar un valor que ya existe en un campo único
  // Ejemplo: Registrar un email que ya existe
  if (err.code === 11000) {
    // err.keyValue = { email: "usuario@ejemplo.com" }
    const field = Object.keys(err.keyValue)[0];
    const message = `El ${field} ya existe en la base de datos`;
    error = new ErrorAPI(message, 400);
  }

  // CASO 4: Error de JWT - Token inválido
  // Ocurre cuando el token no es un JWT válido
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new ErrorAPI(message, 401);
    // 401 = Unauthorized
  }

  // CASO 5: Error de JWT - Token expirado
  // Ocurre cuando el token pasó las 24 horas
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new ErrorAPI(message, 401);
  }

  // ============================================
  // ENVIAR RESPUESTA
  // ============================================

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error del servidor',
    // Solo en desarrollo: incluir stack trace
    // Stack trace = la cadena de llamadas que llevó al error
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });

  // Códigos HTTP comunes:
  // 400 = Bad Request (datos inválidos)
  // 401 = Unauthorized (no autenticado)
  // 403 = Forbidden (autenticado pero sin permisos)
  // 404 = Not Found (recurso no existe)
  // 500 = Internal Server Error (error del servidor)
};

module.exports = { ErrorAPI, errorHandler };
