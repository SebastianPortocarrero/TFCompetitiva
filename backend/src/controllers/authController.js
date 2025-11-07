const Usuario = require('../models/Usuario');
const { generarToken } = require('../middlewares/auth');
const { ErrorAPI } = require('../middlewares/errorHandler');

const formatearUsuario = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
  activo: usuario.activo,
  creadoEn: usuario.createdAt
});

exports.registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existente = await Usuario.findOne({ email: email.toLowerCase() });
    if (existente) {
      throw new ErrorAPI('El email ya está registrado', 400);
    }

    const usuario = await Usuario.create({ nombre, email, password, rol });
    const token = generarToken(usuario.id);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        token,
        usuario: formatearUsuario(usuario)
      }
    });
  } catch (error) {
    next(error);
  }
};

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