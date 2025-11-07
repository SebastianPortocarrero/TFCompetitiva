const mongoose = require('mongoose');

const busquedaSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  // Datos del caso
  casoNumero: {
    type: String,
    maxlength: [50, 'El número de caso no puede exceder 50 caracteres']
  },

  descripcionCaso: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },

  ubicacionEvidencia: {
    type: String,
    maxlength: [500, 'La ubicación no puede exceder 500 caracteres']
  },

  // Datos de la búsqueda
  patrones: [{
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[ATCG]+$/.test(v);
      },
      message: 'El patrón solo puede contener A, T, C, G'
    }
  }],

  numPatrones: {
    type: Number,
    required: true
  },

  algoritmoUsado: {
    type: String,
    enum: ['kmp', 'rabin-karp', 'aho-corasick'],
    required: true
  },

  criterioSeleccion: {
    type: String,
    required: true
  },

  totalSospechososProcesados: {
    type: Number,
    required: true
  },

  totalCoincidencias: {
    type: Number,
    required: true
  },

  // Coincidencias encontradas
  coincidencias: [{
    nombre: String,
    cedula: String,
    patronId: Number,
    patron: String,
    posicion: Number
  }],

  // Performance
  tiempoEjecucionMs: {
    type: Number
  },

  // Trazabilidad
  nombreArchivoCsv: {
    type: String
  },

  hashSha256Archivo: {
    type: String
  },

  // Metadata
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
busquedaSchema.index({ usuarioId: 1 });
busquedaSchema.index({ fecha: -1 });
busquedaSchema.index({ casoNumero: 1 });
busquedaSchema.index({ 'coincidencias.cedula': 1 });

// Virtual: Tasa de éxito
busquedaSchema.virtual('tasaExito').get(function() {
  if (this.totalSospechososProcesados === 0) return 0;
  return (this.totalCoincidencias / this.totalSospechososProcesados) * 100;
});

// Método de instancia: Resumen
busquedaSchema.methods.obtenerResumen = function() {
  return {
    id: this._id,
    casoNumero: this.casoNumero,
    numPatrones: this.numPatrones,
    algoritmoUsado: this.algoritmoUsado,
    totalCoincidencias: this.totalCoincidencias,
    fecha: this.fecha,
    tiempoEjecucionMs: this.tiempoEjecucionMs
  };
};

module.exports = mongoose.model('Busqueda', busquedaSchema);
