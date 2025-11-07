const PDFDocument = require('pdfkit');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const directorioReportes = process.env.REPORTS_DIR || path.join('uploads', 'reportes');

if (!fs.existsSync(directorioReportes)) {
  fs.mkdirSync(directorioReportes, { recursive: true });
}

const escribirPdf = (rutaArchivo, busqueda, usuario) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(rutaArchivo);

    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.on('error', reject);

    doc.pipe(stream);

    doc.fontSize(20).text('Reporte de Análisis de ADN', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-PE')}`);
    doc.text(`Generado por: ${usuario.nombre} (${usuario.email})`);
    doc.moveDown();

    doc.fontSize(16).text('Datos del Caso');
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Número de caso: ${busqueda.casoNumero || 'No especificado'}`);
    doc.text(`Descripción: ${busqueda.descripcionCaso || 'No registrada'}`);
    doc.text(`Ubicación evidencia: ${busqueda.ubicacionEvidencia || 'No registrada'}`);
    doc.text(`Patrones analizados: ${busqueda.patrones.join(', ')}`);
    doc.text(`Algoritmo utilizado: ${busqueda.algoritmoUsado}`);
    doc.text(`Criterio de selección: ${busqueda.criterioSeleccion || 'N/A'}`);
    doc.text(`Tiempo de ejecución: ${busqueda.tiempoEjecucionMs || 0} ms`);
    doc.moveDown();

    doc.fontSize(16).text('Resultados');
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Sospechosos analizados: ${busqueda.totalSospechososProcesados}`);
    doc.text(`Total coincidencias: ${busqueda.totalCoincidencias}`);
    doc.text(`Archivo CSV hash SHA256: ${busqueda.hashSha256Archivo || 'No disponible'}`);
    doc.moveDown();

    doc.fontSize(16).text('Coincidencias');
    doc.moveDown(0.5);
    doc.fontSize(12);

    if (!busqueda.coincidencias.length) {
      doc.text('No se encontraron coincidencias.');
    } else {
      busqueda.coincidencias.forEach((coincidencia, indice) => {
        doc.text(`Coincidencia ${indice + 1}`);
        doc.text(`Nombre: ${coincidencia.nombre}`);
        doc.text(`Cédula: ${coincidencia.cedula}`);
        doc.text(`Patrón: ${coincidencia.patron}`);
        doc.text(`Posición: ${coincidencia.posicion}`);
        doc.text('');
      });
    }

    doc.end();
  });
};

const calcularHash = async (ruta) => {
  const buffer = await fsPromises.readFile(ruta);
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

exports.generarPdfBusqueda = async (busqueda, usuario) => {
  const timestamp = Date.now();
  const caso = busqueda.casoNumero ? busqueda.casoNumero.replace(/[^a-zA-Z0-9_-]/g, '-') : busqueda.id;
  const nombreArchivo = `reporte_${caso}_${timestamp}.pdf`;
  const rutaArchivo = path.join(directorioReportes, nombreArchivo);

  await escribirPdf(rutaArchivo, busqueda, usuario);
  const stats = await fsPromises.stat(rutaArchivo);
  const hash = await calcularHash(rutaArchivo);

  return {
    rutaArchivo,
    nombreArchivo,
    tamanoBytes: stats.size,
    hash
  };
};

exports.directorioReportes = directorioReportes;