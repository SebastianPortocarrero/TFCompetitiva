const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },

  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },

  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No incluir password en queries por defecto
  },

  rol: {
    type: String,
    enum: ['perito', 'admin', 'investigador'],
    default: 'perito'
  },

  activo: {
    type: Boolean,
    default: true
  },

  ultimoLogin: {
    type: Date
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Índices
usuarioSchema.index({ activo: 1 });

// Middleware: Hashear password antes de guardar
usuarioSchema.pre('save', async function(next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método de instancia: Comparar passwords
usuarioSchema.methods.compararPassword = async function(passwordIngresado) {
  return await bcrypt.compare(passwordIngresado, this.password);
};

// Método de instancia: Generar objeto público (sin datos sensibles)
usuarioSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    activo: this.activo,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Usuario', usuarioSchema);
