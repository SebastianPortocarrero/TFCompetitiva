const Busqueda = require('../models/Busqueda');
const Sospechoso = require('../models/Sospechoso');
const { ErrorAPI } = require('../middlewares/errorHandler');
const { ejecutarBusqueda: ejecutarMotor } = require('../services/dnaEngineService');

const normalizarPatrones = (body) => {
  const patrones = [];
  if (body.patron) patrones.push(body.patron.trim());
  if (Array.isArray(body.patrones)) {
    body.patrones.forEach((p) => {
      if (typeof p === 'string' && p.trim()) patrones.push(p.trim());
    });
  }
  return [...new Set(patrones)];
};

const parsearFecha = (valor, etiqueta) => {
  if (!valor) return undefined;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorAPI(`Fecha ${etiqueta} inválida`, 400);
  }
  return fecha;
};

exports.ejecutar = async (req, res, next) => {
  try {
    const patrones = normalizarPatrones(req.body);
    if (!patrones.length) {
      throw new ErrorAPI('Debe proporcionar al menos un patrón de ADN', 400);
    }

    const casoNumero = req.body.casoNumero || req.body.caso_numero;
    const descripcionCaso = req.body.descripcionCaso || req.body.descripcion_caso;
    const ubicacionEvidencia = req.body.ubicacionEvidencia || req.body.ubicacion_evidencia;

    const sospechososActivos = await Sospechoso.find({ activo: true })
      .select('nombreCompleto cedula cadenaADN')
      .lean();

    if (!sospechososActivos.length) {
      throw new ErrorAPI('No hay sospechosos activos para analizar', 400);
    }

    const resultadoMotor = await ejecutarMotor(patrones, sospechososActivos);

    if (!resultadoMotor.exito) {
      throw new ErrorAPI('El motor de búsqueda no reportó éxito', 500);
    }

    const coincidencias = Array.isArray(resultadoMotor.coincidencias)
      ? resultadoMotor.coincidencias.map((item) => ({
          nombre: item.nombre,
          cedula: item.cedula,
          patronId: item.patron_id ?? item.patronId,
          patron: item.patron,
          posicion: item.posicion
        }))
      : [];

    const nuevaBusqueda = await Busqueda.create({
      usuarioId: req.usuario._id,
      casoNumero,
      descripcionCaso,
      ubicacionEvidencia,
      patrones: resultadoMotor.patrones,
      numPatrones: resultadoMotor.num_patrones ?? patrones.length,
      algoritmoUsado: resultadoMotor.algoritmo_usado,
      criterioSeleccion: resultadoMotor.criterio_seleccion,
      totalSospechososProcesados: resultadoMotor.total_procesados ?? sospechososActivos.length,
      totalCoincidencias: resultadoMotor.total_coincidencias ?? coincidencias.length,
      coincidencias,
      tiempoEjecucionMs: resultadoMotor.tiempo_ejecucion_ms,
      nombreArchivoCsv: resultadoMotor.nombreArchivoCsv,
      hashSha256Archivo: resultadoMotor.hashSha256Archivo
    });

    res.status(200).json({
      success: true,
      data: {
        idBusqueda: nuevaBusqueda.id,
        casoNumero: nuevaBusqueda.casoNumero,
        patrones: nuevaBusqueda.patrones,
        algoritmoUsado: nuevaBusqueda.algoritmoUsado,
        totalSospechososProcesados: nuevaBusqueda.totalSospechososProcesados,
        totalCoincidencias: nuevaBusqueda.totalCoincidencias,
        coincidencias: nuevaBusqueda.coincidencias,
        tiempoEjecucionMs: nuevaBusqueda.tiempoEjecucionMs,
        fecha: nuevaBusqueda.fecha,
        hashSha256Archivo: nuevaBusqueda.hashSha256Archivo
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.historial = async (req, res, next) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Math.min(Number(req.query.limit), 100) : 20;
    const skip = (page - 1) * limit;

    const filtro = {};

    if (req.usuario.rol === 'perito') {
      filtro.usuarioId = req.usuario._id;
    } else if (req.usuario.rol === 'admin' && req.query.usuarioId) {
      filtro.usuarioId = req.query.usuarioId;
    }

    const fechaDesde = req.query.fecha_desde || req.query.fechaDesde;
    const fechaHasta = req.query.fecha_hasta || req.query.fechaHasta;
    if (fechaDesde || fechaHasta) {
      filtro.fecha = {};
      if (fechaDesde) filtro.fecha.$gte = parsearFecha(fechaDesde, 'desde');
      if (fechaHasta) filtro.fecha.$lte = parsearFecha(fechaHasta, 'hasta');
    }

    if (req.query.casoNumero || req.query.caso_numero) {
      const caso = (req.query.casoNumero || req.query.caso_numero).trim();
      filtro.casoNumero = { $regex: caso, $options: 'i' };
    }

    const [busquedas, total] = await Promise.all([
      Busqueda.find(filtro)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .select('casoNumero patrones totalCoincidencias algoritmoUsado fecha tiempoEjecucionMs'),
      Busqueda.countDocuments(filtro)
    ]);

    res.status(200).json({
      success: true,
      data: {
        busquedas,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenerDetalle = async (req, res, next) => {
  try {
    const busqueda = await Busqueda.findById(req.params.id).populate({
      path: 'usuarioId',
      select: 'nombre email'
    });

    if (!busqueda) {
      throw new ErrorAPI('Búsqueda no encontrada', 404);
    }

    if (req.usuario.rol === 'perito' && busqueda.usuarioId && !busqueda.usuarioId.equals(req.usuario._id)) {
      throw new ErrorAPI('No autorizado para ver esta búsqueda', 403);
    }

    res.status(200).json({
      success: true,
      data: busqueda
    });
  } catch (error) {
    next(error);
  }
};