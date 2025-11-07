/**
 * ============================================
 * SERVICIO: INTEGRACIÓN CON MOTOR C++
 * ============================================
 *
 * ¿QUÉ HACE ESTE SERVICIO?
 * Este es el CORAZÓN del backend. Se encarga de ejecutar tu
 * programa C++ (busqueda_adn.exe) desde Node.js.
 *
 * ¿CÓMO FUNCIONA?
 * 1. Recibe patrones de ADN y lista de sospechosos
 * 2. Crea un CSV temporal con los sospechosos
 * 3. Ejecuta el .exe con child_process
 * 4. Captura el JSON que retorna el .exe
 * 5. Lo parsea y retorna a los controladores
 *
 * ¿POR QUÉ UN SERVICIO SEPARADO?
 * - Separación de responsabilidades
 * - Reutilizable (múltiples controladores pueden usarlo)
 * - Fácil de testear
 * - Fácil de cambiar (si cambias el .exe, solo modificas esto)
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * ============================================
 * FUNCIÓN: EJECUTAR BÚSQUEDA DE ADN
 * ============================================
 *
 * @param {Array<String>} patrones - Array de patrones de ADN ["ATCG", "GGCC"]
 * @param {Array<Object>} sospechosos - Array de objetos sospechoso { nombreCompleto, cedula, cadenaADN }
 * @returns {Object} Resultado del análisis
 *
 * FLUJO:
 * patrones + sospechosos → CSV temporal → .exe → JSON → return
 */
exports.ejecutarBusqueda = async (patrones, sospechosos) => {
  let archivoTemporal = null;

  try {
    // ============================================
    // PASO 1: CREAR CSV TEMPORAL
    // ============================================
    //
    // ¿Por qué CSV temporal?
    // - El .exe espera un archivo CSV como entrada
    // - Los sospechosos están en MongoDB (no en archivo)
    // - Creamos el CSV "al vuelo" cada vez que hay una búsqueda
    //
    // ¿Por qué no usar el mismo CSV siempre?
    // - Los sospechosos cambian (se agregan/eliminan)
    // - Cada búsqueda puede tener diferentes sospechosos activos
    // - Permite filtrar (ej: solo sospechosos activos)

    archivoTemporal = await crearCSVTemporal(sospechosos);

    // ============================================
    // PASO 2: PREPARAR COMANDO
    // ============================================
    //
    // El comando que vamos a ejecutar es:
    // ./busqueda_adn.exe "PATRON1,PATRON2" "./temp/archivo.csv"

    const patronesStr = patrones.join(',');
    // Si patrones = ["ATCG", "GGCC"]
    // patronesStr = "ATCG,GGCC"

    const cppEnginePath = process.env.CPP_ENGINE_PATH || '../cpp-engine/build/busqueda_adn.exe';
    // Path al ejecutable (desde .env)

    // Construir comando
    // IMPORTANTE: Usar comillas para manejar espacios en rutas
    const comando = `"${cppEnginePath}" "${patronesStr}" "${archivoTemporal}"`;

    // ============================================
    // PASO 3: EJECUTAR EL .EXE
    // ============================================
    //
    // ¿Qué es child_process.exec()?
    // Una función de Node.js que ejecuta comandos del sistema operativo
    // (como si escribieras el comando en CMD o PowerShell)
    //
    // ¿Por qué usarlo?
    // Porque necesitamos ejecutar un programa externo (.exe)

    const resultado = await ejecutarComando(comando);

    // ============================================
    // PASO 4: PARSEAR JSON
    // ============================================
    //
    // El .exe retorna JSON por stdout:
    // {
    //   "exito": true,
    //   "patrones": [...],
    //   "coincidencias": [...]
    // }

    const resultadoJSON = JSON.parse(resultado);

    // ============================================
    // PASO 5: CALCULAR HASH DEL ARCHIVO
    // ============================================
    //
    // ¿Por qué calcular hash?
    // - Trazabilidad forense
    // - Verificar que el CSV no fue modificado
    // - Cumplir con cadena de custodia
    //
    // Hash SHA256 = "Huella digital" del archivo

    const hashArchivo = await calcularHashArchivo(archivoTemporal);

    // ============================================
    // PASO 6: LIMPIAR Y RETORNAR
    // ============================================

    // Eliminar archivo temporal
    await fs.unlink(archivoTemporal);

    // Retornar resultado enriquecido
    return {
      ...resultadoJSON,
      hashSha256Archivo: hashArchivo,
      nombreArchivoCsv: path.basename(archivoTemporal)
    };

  } catch (error) {
    // Si hay error, intentar limpiar el archivo temporal
    if (archivoTemporal) {
      try {
        await fs.unlink(archivoTemporal);
      } catch (unlinkError) {
        // Ignorar error al borrar (el archivo podría no existir)
      }
    }

    // Re-lanzar el error para que el controlador lo maneje
    throw new Error(`Error al ejecutar búsqueda de ADN: ${error.message}`);
  }
};

/**
 * ============================================
 * FUNCIÓN AUXILIAR: CREAR CSV TEMPORAL
 * ============================================
 *
 * Convierte array de sospechosos → archivo CSV
 *
 * @param {Array} sospechosos - Array de objetos sospechoso
 * @returns {String} Ruta al archivo CSV creado
 */
async function crearCSVTemporal(sospechosos) {
  // ============================================
  // GENERAR NOMBRE ÚNICO
  // ============================================
  //
  // ¿Por qué nombre único?
  // Si múltiples búsquedas se ejecutan simultáneamente,
  // cada una necesita su propio archivo.
  //
  // Formato: sospechosos_1699876543210_abc123.csv
  // - Timestamp: para ordenar
  // - Random: para unicidad

  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const nombreArchivo = `sospechosos_${timestamp}_${random}.csv`;

  // Directorio temporal (desde .env o default)
  const dirTemp = process.env.TEMP_DIR || 'temp';
  const rutaArchivo = path.join(dirTemp, nombreArchivo);

  // ============================================
  // CONSTRUIR CONTENIDO CSV
  // ============================================
  //
  // Formato esperado por el .exe:
  // nombre_completo,cedula,cadena_adn
  // Juan Perez,12345678,ATCGATCG...

  // Header del CSV
  let contenidoCSV = 'nombre_completo,cedula,cadena_adn\n';

  // Agregar cada sospechoso
  for (const sospechoso of sospechosos) {
    // Escapar comas y comillas en los valores
    // ¿Por qué? Si el nombre es "Garcia, Juan" la coma rompe el CSV
    const nombre = escaparCSV(sospechoso.nombreCompleto);
    const cedula = escaparCSV(sospechoso.cedula);
    const cadena = sospechoso.cadenaADN; // No necesita escape (solo ATCG)

    contenidoCSV += `${nombre},${cedula},${cadena}\n`;
  }

  // ============================================
  // ESCRIBIR ARCHIVO
  // ============================================
  //
  // fs.promises.writeFile = versión asíncrona de writeFile
  // await = espera a que termine de escribir

  await fs.writeFile(rutaArchivo, contenidoCSV, 'utf8');

  return rutaArchivo;
}

/**
 * ============================================
 * FUNCIÓN AUXILIAR: EJECUTAR COMANDO
 * ============================================
 *
 * Ejecuta un comando del sistema y retorna su output.
 *
 * @param {String} comando - Comando a ejecutar
 * @returns {Promise<String>} Output del comando (stdout)
 */
function ejecutarComando(comando) {
  return new Promise((resolve, reject) => {
    // ============================================
    // OPCIONES DE EJECUCIÓN
    // ============================================

    const opciones = {
      // Timeout en milisegundos (desde .env o default 60 segundos)
      timeout: parseInt(process.env.CPP_TIMEOUT_MS) || 60000,

      // Máximo tamaño del buffer (10MB)
      // Si el .exe retorna más de 10MB de JSON, aumentar esto
      maxBuffer: 10 * 1024 * 1024,

      // Encoding del output
      encoding: 'utf8'
    };

    // ============================================
    // EJECUTAR
    // ============================================
    //
    // exec() toma 3 parámetros:
    // 1. comando: string del comando a ejecutar
    // 2. opciones: objeto con configuración
    // 3. callback: función que se ejecuta cuando termina

    exec(comando, opciones, (error, stdout, stderr) => {
      // ¿Qué es stdout y stderr?
      // stdout = Standard Output (salida normal del programa)
      // stderr = Standard Error (mensajes de error del programa)

      if (error) {
        // Error al ejecutar
        // Ejemplos:
        // - .exe no encontrado
        // - Timeout
        // - .exe crasheó
        reject(new Error(`Error ejecutando motor C++: ${error.message}`));
        return;
      }

      if (stderr) {
        // El .exe escribió en stderr
        // Esto podría ser un warning o error del programa
        console.warn('Warning del motor C++:', stderr);
      }

      // stdout contiene el JSON que el .exe imprimió con cout
      resolve(stdout);
    });
  });
}

/**
 * ============================================
 * FUNCIÓN AUXILIAR: CALCULAR HASH SHA256
 * ============================================
 *
 * Genera hash SHA256 de un archivo.
 * El hash es como una "huella digital" única del archivo.
 *
 * ¿Por qué SHA256?
 * - Estándar en forense digital
 * - Virtualmente imposible generar 2 archivos con el mismo hash
 * - Si cambia 1 bit del archivo, el hash cambia completamente
 *
 * @param {String} rutaArchivo - Ruta al archivo
 * @returns {String} Hash en formato hexadecimal
 */
async function calcularHashArchivo(rutaArchivo) {
  // Leer archivo completo
  const contenido = await fs.readFile(rutaArchivo);

  // Crear hash SHA256
  // crypto = módulo nativo de Node.js para criptografía
  const hash = crypto
    .createHash('sha256')      // Algoritmo SHA256
    .update(contenido)         // Procesar contenido
    .digest('hex');            // Resultado en hexadecimal

  // Resultado: "a3f5b1c2d4e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0..."
  return hash;
}

/**
 * ============================================
 * FUNCIÓN AUXILIAR: ESCAPAR VALORES CSV
 * ============================================
 *
 * Escapa caracteres especiales en valores CSV.
 *
 * Reglas CSV:
 * - Si tiene coma → envolver en comillas
 * - Si tiene comillas → duplicar las comillas
 *
 * Ejemplos:
 * "Garcia, Juan" → "Garcia, Juan"
 * 'O"Brien' → "O""Brien"
 */
function escaparCSV(valor) {
  // Si no tiene caracteres especiales, retornar tal cual
  if (!valor.includes(',') && !valor.includes('"') && !valor.includes('\n')) {
    return valor;
  }

  // Duplicar comillas
  const escapado = valor.replace(/"/g, '""');

  // Envolver en comillas
  return `"${escapado}"`;
}

module.exports = exports;
