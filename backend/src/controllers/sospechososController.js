const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

const Sospechoso = require('../models/Sospechoso');
const { ErrorAPI } = require('../middlewares/errorHandler');

const limpiarArchivoTemporal = async (ruta) => {
  if (!ruta) return;
  try {
    await fs.unlink(ruta);
  } catch (error) {}
};

const parsearArchivo = async (rutaArchivo) => {
  const extension = rutaArchivo.toLowerCase().slice(rutaArchivo.lastIndexOf('.'));

  if (extension === '.csv') {
    // Parsear CSV
    const contenido = await fs.readFile(rutaArchivo, 'utf8');
    return parse(contenido, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } else if (extension === '.xlsx' || extension === '.xls') {
    // Parsear Excel
    const workbook = XLSX.readFile(rutaArchivo);
    const sheetName = workbook.SheetNames[0]; // Usar la primera hoja
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } else {
    throw new ErrorAPI('Formato de archivo no soportado', 400);
  }
};

// Procesar un chunk de registros
const procesarChunk = async (registros, usuarioId, erroresGlobales, offsetLinea) => {
  const operaciones = [];
  const ahora = new Date();

  registros.forEach((row, index) => {
    const nombre = row.nombre_completo || row.nombre || '';
    const cedula = Number(row.cedula);
    const cadena = (row.cadena_adn || row.cadena || '').toUpperCase().trim();
    const fuente = row.fuente_muestra || row.fuente || undefined;
    const observaciones = row.observaciones || undefined;

    if (!nombre || !cedula || isNaN(cedula) || !cadena) {
      erroresGlobales.push({ linea: offsetLinea + index + 2, motivo: 'Campos requeridos faltantes o cédula inválida' });
      return;
    }

    if (!Sospechoso.validarCadenaADN(cadena)) {
      erroresGlobales.push({ linea: offsetLinea + index + 2, motivo: 'Cadena ADN inválida' });
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
            usuarioRegistroId: usuarioId,
            updatedAt: ahora
          },
          $setOnInsert: {
            createdAt: ahora
          }
        },
        upsert: true
      }
    });
  });

  if (operaciones.length === 0) {
    return { upsertedCount: 0, modifiedCount: 0 };
  }

  return await Sospechoso.bulkWrite(operaciones);
};

exports.cargaMasiva = async (req, res, next) => {
  const rutaArchivo = req.file?.path;
  const inicioTotal = Date.now();

  try {
    if (!rutaArchivo) {
      throw new ErrorAPI('Debe adjuntar un archivo CSV o Excel', 400);
    }

    console.log('🧬 Iniciando carga masiva de sospechosos...');
    const registros = await parsearArchivo(rutaArchivo);
    console.log(`   Total de registros: ${registros.length}`);

    const errores = [];
    let insertados = 0;
    let actualizados = 0;

    // DETECCIÓN AUTOMÁTICA: Usar paralelo solo si hay muchos registros
    const UMBRAL_PARALELO = 1000;
    const CHUNK_SIZE = 500;

    if (registros.length < UMBRAL_PARALELO) {
      // ============================================
      // MODO SECUENCIAL (< 1000 registros)
      // ============================================
      console.log('   Modo: Secuencial (archivo pequeño)');

      const resultado = await procesarChunk(registros, req.usuario.id, errores, 0);
      insertados = resultado.upsertedCount || 0;
      actualizados = resultado.modifiedCount || 0;

    } else {
      // ============================================
      // MODO PARALELO (≥ 1000 registros)
      // ============================================
      console.log(`   Modo: Paralelo en chunks de ${CHUNK_SIZE}`);

      // Dividir en chunks
      const chunks = [];
      for (let i = 0; i < registros.length; i += CHUNK_SIZE) {
        chunks.push({
          data: registros.slice(i, i + CHUNK_SIZE),
          offset: i
        });
      }
      console.log(`   Chunks creados: ${chunks.length}`);

      // Procesar chunks en paralelo
      const resultados = await Promise.all(
        chunks.map(chunk => procesarChunk(chunk.data, req.usuario.id, errores, chunk.offset))
      );

      // Sumar resultados
      resultados.forEach(resultado => {
        insertados += resultado.upsertedCount || 0;
        actualizados += resultado.modifiedCount || 0;
      });
    }

    const tiempoTotal = Date.now() - inicioTotal;
    console.log(`✅ Carga completada en ${tiempoTotal}ms`);
    console.log(`   Insertados: ${insertados}`);
    console.log(`   Actualizados: ${actualizados}`);
    console.log(`   Errores: ${errores.length}`);

    res.status(200).json({
      success: true,
      message: 'Carga masiva completada',
      data: {
        totalProcesados: registros.length,
        insertados,
        actualizados: Math.max(actualizados, 0),
        errores,
        tiempoMs: tiempoTotal,
        modoParalelo: registros.length >= UMBRAL_PARALELO
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