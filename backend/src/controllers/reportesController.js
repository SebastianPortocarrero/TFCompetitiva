const path = require('path');

const Reporte = require('../models/Reporte');
const Busqueda = require('../models/Busqueda');
const { ErrorAPI } = require('../middlewares/errorHandler');
const { generarPdfBusqueda, directorioReportes } = require('../services/reportesService');

exports.generar = async (req, res, next) => {
  try {
    const busqueda = await Busqueda.findById(req.params.busquedaId).populate({
      path: 'usuarioId',
      select: 'nombre email'
    });

    if (!busqueda) {
      throw new ErrorAPI('Búsqueda no encontrada', 404);
    }

    if (req.usuario.rol !== 'admin' && busqueda.usuarioId && busqueda.usuarioId.id !== req.usuario.id) {
      throw new ErrorAPI('No autorizado para generar el reporte', 403);
    }

    const resultadoPdf = await generarPdfBusqueda(busqueda, req.usuario);

    const reporte = await Reporte.create({
      busquedaId: busqueda.id,
      rutaArchivo: resultadoPdf.nombreArchivo,
      hashSha256Pdf: resultadoPdf.hash,
      tamanoBytes: resultadoPdf.tamanoBytes,
      generadoPorUsuarioId: req.usuario.id
    });

    res.status(200).json({
      success: true,
      data: {
        idReporte: reporte.id,
        busquedaId: busqueda.id,
        rutaDescarga: `/api/reportes/descargar/${reporte.id}`,
        hashSha256: reporte.hashSha256Pdf,
        tamanoBytes: reporte.tamanoBytes,
        fechaGeneracion: reporte.fechaGeneracion
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.descargar = async (req, res, next) => {
  try {
    const reporte = await Reporte.findById(req.params.id).populate({
      path: 'busquedaId',
      populate: { path: 'usuarioId', select: 'id' }
    });

    if (!reporte) {
      throw new ErrorAPI('Reporte no encontrado', 404);
    }

    const busqueda = reporte.busquedaId;

    if (req.usuario.rol !== 'admin') {
      const propietario = busqueda?.usuarioId?.id?.toString();
      const solicitante = req.usuario.id.toString();
      const puedeDescargar = propietario === solicitante || req.usuario.rol === 'investigador';
      if (!puedeDescargar) {
        throw new ErrorAPI('No autorizado para descargar este reporte', 403);
      }
    }

    const rutaArchivo = path.join(directorioReportes, reporte.rutaArchivo);

    res.download(rutaArchivo, reporte.rutaArchivo, async (err) => {
      if (err) {
        next(new ErrorAPI('No se pudo descargar el archivo', 500));
        return;
      }

      try {
        await reporte.registrarDescarga();
      } catch (error) {}
    });
  } catch (error) {
    next(error);
  }
};