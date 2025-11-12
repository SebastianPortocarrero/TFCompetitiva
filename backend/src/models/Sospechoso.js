const mongoose = require('mongoose');

const sospechososSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },

  cedula: {
    type: Number,
    required: [true, 'La cédula es obligatoria'],
    unique: true,
    min: [10000000, 'La cédula debe tener al menos 8 dígitos'],
    max: [99999999, 'La cédula debe tener máximo 8 dígitos']
  },

  cadenaADN: {
    type: String,
    required: [true, 'La cadena de ADN es obligatoria'],
    validate: {
      validator: function(v) {
        // Solo permitir A, T, C, G
        return /^[ATCG]+$/.test(v);
      },
      message: 'La cadena de ADN solo puede contener los caracteres A, T, C, G'
    },
    minlength: [20, 'La cadena de ADN debe tener al menos 20 caracteres']
  },

  longitudCadena: {
    type: Number
  },

  fuenteMuestra: {
    type: String,
    maxlength: [100, 'La fuente de muestra no puede exceder 100 caracteres'],
    default: 'Registro Nacional'
  },

  observaciones: {
    type: String,
    maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres']
  },

  activo: {
    type: Boolean,
    default: true
  },

  fechaActualizacion: {
    type: Date
  },

  usuarioRegistroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true
});

// Índices
sospechososSchema.index({ activo: 1 });
sospechososSchema.index({ nombreCompleto: 'text' }); // Búsqueda de texto

// Middleware: Calcular longitud de cadena antes de guardar
sospechososSchema.pre('save', function(next) {
  if (this.isModified('cadenaADN')) {
    this.longitudCadena = this.cadenaADN.length;
    this.fechaActualizacion = new Date();
  }
  next();
});

// Método estático: Validar cadena ADN
sospechososSchema.statics.validarCadenaADN = function(cadena) {
  return /^[ATCG]+$/.test(cadena) && cadena.length >= 20;
};

module.exports = mongoose.model('Sospechoso', sospechososSchema);
