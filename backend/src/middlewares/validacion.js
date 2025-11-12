const { body, param, query, validationResult } = require('express-validator');

exports.manejarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }))
    });
  }
  next();
};

exports.validarRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('email').trim().notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
  body('rol').optional().isIn(['perito', 'admin', 'investigador']).withMessage('Rol inválido')
];

exports.validarLogin = [
  body('email').trim().notEmpty().withMessage('El email es obligatorio').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

exports.validarSospechoso = [
  body('nombreCompleto').trim().notEmpty().withMessage('El nombre completo es obligatorio')
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('cedula').notEmpty().withMessage('La cédula es obligatoria')
    .isInt({ min: 10000000, max: 99999999 }).withMessage('La cédula debe ser un número de 8 dígitos').toInt(),
  body('cadenaADN').trim().notEmpty().withMessage('La cadena de ADN es obligatoria')
    .matches(/^[ATCG]+$/i).withMessage('La cadena de ADN solo puede contener A, T, C, G')
    .isLength({ min: 20 }).withMessage('La cadena de ADN debe tener al menos 20 caracteres'),
  body('fuenteMuestra').optional().trim().isLength({ max: 100 }).withMessage('La fuente de muestra no puede exceder 100 caracteres'),
  body('observaciones').optional().trim().isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder 500 caracteres')
];

exports.validarSospechosoActualizacion = [
  body('nombreCompleto').optional().trim().notEmpty().withMessage('El nombre completo es obligatorio')
    .isLength({ max: 200 }).withMessage('El nombre no puede exceder 200 caracteres'),
  body('cedula').optional().notEmpty().withMessage('La cédula es obligatoria')
    .isInt({ min: 10000000, max: 99999999 }).withMessage('La cédula debe ser un número de 8 dígitos').toInt(),
  body('cadenaADN').optional().trim().notEmpty().withMessage('La cadena de ADN es obligatoria')
    .matches(/^[ATCG]+$/i).withMessage('La cadena de ADN solo puede contener A, T, C, G')
    .isLength({ min: 20 }).withMessage('La cadena de ADN debe tener al menos 20 caracteres'),
  body('fuenteMuestra').optional().trim().isLength({ max: 100 }).withMessage('La fuente de muestra no puede exceder 100 caracteres'),
  body('observaciones').optional().trim().isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder 500 caracteres'),
  body('activo').optional().isBoolean().withMessage('El estado activo debe ser booleano')
];

exports.validarBusqueda = [
  body('casoNumero').optional().trim().isLength({ max: 50 }).withMessage('El número de caso no puede exceder 50 caracteres'),
  body('patron').if(body('patrones').not().exists()).trim().notEmpty().withMessage('El patrón o patrones son obligatorios')
    .matches(/^[ATCG]+$/).withMessage('El patrón solo puede contener A, T, C, G')
    .isLength({ min: 5, max: 100 }).withMessage('El patrón debe tener entre 5 y 100 caracteres'),
  body('patrones').optional().isArray({ min: 1 }).withMessage('Patrones debe ser un array con al menos 1 elemento')
    .custom((patrones) => {
      return patrones.every(p => typeof p === 'string' && /^[ATCG]+$/.test(p) && p.length >= 5 && p.length <= 100);
    }).withMessage('Cada patrón debe contener solo A, T, C, G y tener entre 5 y 100 caracteres'),
  body('descripcionCaso').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres')
];

exports.validarPaginacion = [
  query('page').optional().isInt({ min: 1 }).withMessage('El número de página debe ser mayor a 0').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100').toInt()
];

exports.validarId = [
  param('id').isMongoId().withMessage('ID inválido')
];
