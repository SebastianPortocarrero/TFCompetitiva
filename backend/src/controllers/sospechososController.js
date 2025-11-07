const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');

const Sospechoso = require('../models/Sospechoso');
const { ErrorAPI } = require('../middlewares/errorHandler');

const limpiarArchivoTemporal = async (ruta) => {
  if (!ruta) return;
  try {
    await fs.unlink(ruta);
  } catch (error) {}
};

exports.cargaMasiva = async (req, res, next) => {
  const rutaArchivo = req.file?.path;

  try {
    if (!rutaArchivo) {
      throw new ErrorAPI('Debe adjuntar un archivo CSV', 400);
    }

    const contenido = await fs.readFile(rutaArchivo, 'utf8');
    const registros = parse(contenido, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    let insertados = 0;
    let actualizados = 0;
    const errores = [];
    const operaciones = [];
    const ahora = new Date();

    registros.forEach((row, index) => {
      const nombre = row.nombre_completo || row.nombre || '';
      const cedula = row.cedula || '';
      const cadena = row.cadena_adn || row.cadena || '';
      const fuente = row.fuente_muestra || row.fuente || undefined;
      const observaciones = row.observaciones || undefined;

      if (!nombre || !cedula || !cadena) {
        errores.push({ linea: index + 2, motivo: 'Campos requeridos faltantes' });
        return;
      }

      if (!Sospechoso.validarCadenaADN(cadena)) {
        errores.push({ linea: index + 2, motivo: 'Cadena ADN inválida' });
        return;
      }

      operaciones.push({
        updateOne: {
          filter: { cedula },
          update: {
            $set: {
              nombreCompleto: nombre,
              cedula,
              cadenaADN: cadena,
              longitudCadena: cadena.length,
              fuenteMuestra: fuente || 'Registro Nacional',
              observaciones: observaciones || undefined,
              activo: true,
              fechaActualizacion: ahora,
              usuarioRegistroId: req.usuario.id,
              updatedAt: ahora
            },
            $setOnInsert: {
              createdAt: ahora,
              updatedAt: ahora
            }
          },
          upsert: true
        }
      });
    });

    if (!operaciones.length) {
      throw new ErrorAPI('El archivo no contiene registros válidos', 400);
    }

    const resultado = await Sospechoso.bulkWrite(operaciones);

    insertados = resultado.upsertedCount || 0;
    actualizados = resultado.modifiedCount || 0;

    res.status(200).json({
      success: true,
      message: 'Carga masiva completada',
      data: {
        totalProcesados: registros.length,
        insertados,
        actualizados: Math.max(actualizados, 0),
        errores,
        tiempoMs: Date.now() - ahora.getTime()
      }
    });
  } catch (error) {
    next(error);
  } finally {
    await limpiarArchivoTemporal(rutaArchivo);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Math.min(Number(req.query.limit), 100) : 20;
    const skip = (page - 1) * limit;

    const filtro = {};
    if (req.query.activo === 'true') filtro.activo = true;
    if (req.query.activo === 'false') filtro.activo = false;

    if (req.query.q) {
      const termino = req.query.q.trim();
      filtro.$or = [
        { nombreCompleto: { $regex: termino, $options: 'i' } },
        { cedula: { $regex: termino, $options: 'i' } }
      ];
    }

    const [sospechosos, total] = await Promise.all([
      Sospechoso.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sospechoso.countDocuments(filtro)
    ]);

    res.status(200).json({
      success: true,
      data: {
        sospechosos: sospechosos.map((item) => ({
          id: item.id,
          nombreCompleto: item.nombreCompleto,
          cedula: item.cedula,
          longitudCadena: item.longitudCadena,
          activo: item.activo,
          fechaRegistro: item.createdAt,
          fechaActualizacion: item.fechaActualizacion
        })),
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

exports.obtener = async (req, res, next) => {
  try {
    const sospechoso = await Sospechoso.findById(req.params.id);
    if (!sospechoso) {
      throw new ErrorAPI('Sospechoso no encontrado', 404);
    }

    res.status(200).json({
      success: true,
      data: sospechoso
    });
  } catch (error) {
    next(error);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const datos = {
      ...req.body,
      usuarioRegistroId: req.usuario.id
    };

    const sospechoso = await Sospechoso.create(datos);
    res.status(201).json({
      success: true,
      data: sospechoso
    });
  } catch (error) {
    next(error);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const datos = {
      ...req.body,
      fechaActualizacion: new Date()
    };

    const sospechoso = await Sospechoso.findById(req.params.id);
    if (!sospechoso) {
      throw new ErrorAPI('Sospechoso no encontrado', 404);
    }

    Object.assign(sospechoso, datos);

    if (req.body.cadenaADN) {
      sospechoso.longitudCadena = req.body.cadenaADN.length;
    }

    await sospechoso.save();

    res.status(200).json({
      success: true,
      data: sospechoso
    });
  } catch (error) {
    next(error);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const sospechoso = await Sospechoso.findById(req.params.id);
    if (!sospechoso) {
      throw new ErrorAPI('Sospechoso no encontrado', 404);
    }

    await sospechoso.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sospechoso eliminado'
    });
  } catch (error) {
    next(error);
  }
};