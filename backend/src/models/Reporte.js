const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  busquedaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Busqueda',
    required: true
  },

  // Archivo
  rutaArchivo: {
    type: String,
    required: true
  },

  hashSha256Pdf: {
    type: String,
    required: true
  },

  tamanoBytes: {
    type: Number
  },

  // Metadata
  tipoReporte: {
    type: String,
    default: 'analisis_adn'
  },

  formato: {
    type: String,
    default: 'PDF'
  },

  // Auditoría
  generadoPorUsuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },

  fechaGeneracion: {
    type: Date,
    default: Date.now
  },

  numeroDescargas: {
    type: Number,
    default: 0
  },

  ultimaDescarga: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
reporteSchema.index({ busquedaId: 1 });
reporteSchema.index({ fechaGeneracion: -1 });
reporteSchema.index({ generadoPorUsuarioId: 1 });

// Método de instancia: Registrar descarga
reporteSchema.methods.registrarDescarga = async function() {
  this.numeroDescargas += 1;
  this.ultimaDescarga = new Date();
  return await this.save();
};

module.exports = mongoose.model('Reporte', reporteSchema);
