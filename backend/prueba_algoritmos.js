/**
 * BENCHMARK: Comparación de algoritmos con datos reales
 *
 * Prueba con 1000 sospechosos para demostrar cuándo usar cada algoritmo
 */

const mongoose = require('mongoose');
const { execFile } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

mongoose.connect('mongodb://localhost:27017/sistema-forense-adn');

const Sospechoso = require('./src/models/Sospechoso');

// Función para ejecutar el motor C++
async function ejecutarMotor(patrones, rutaCSV) {
  return new Promise((resolve, reject) => {
    const cppEngine = process.env.CPP_ENGINE_PATH || '../cpp-engine/build/busqueda_adn.exe';
    const patronesStr = patrones.join(',');

    execFile(cppEngine, [patronesStr, rutaCSV], {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024,
      encoding: 'utf8'
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error('Error parseando JSON'));
      }
    });
  });
}

// Crear CSV temporal
async function crearCSV(sospechosos) {
  const timestamp = Date.now();
  const archivo = `temp/benchmark_${timestamp}.csv`;

  let contenido = 'nombre_completo,cedula,cadena_adn\n';
  for (const s of sospechosos) {
    contenido += `${s.nombreCompleto},${s.cedula},${s.cadenaADN}\n`;
  }

  await fs.writeFile(archivo, contenido, 'utf8');
  return archivo;
}

async function benchmark() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PRUEBA: ¿KMP ES SIEMPRE EL MEJOR?');
  console.log('═══════════════════════════════════════════════════════\n');

  // Cargar sospechosos
  console.log('📊 Cargando 1000 sospechosos...');
  const sospechosos = await Sospechoso.find().limit(1000).select('nombreCompleto cedula cadenaADN');
  console.log(`✅ ${sospechosos.length} sospechosos cargados\n`);

  const rutaCSV = await crearCSV(sospechosos);

  // ============================================
  // TEST 1: UN solo patrón (KMP debería ganar)
  // ============================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 1: UN SOLO PATRÓN');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Patrón: ATCGATCGAT (10 bases)');
  console.log('Sospechosos: 1000');
  console.log('Algoritmo esperado: KMP\n');

  const resultado1 = await ejecutarMotor(['ATCGATCGAT'], rutaCSV);

  console.log(`🎯 Algoritmo seleccionado: ${resultado1.algoritmoUsado}`);
  console.log(`⏱️  Tiempo: ${resultado1.tiempoEjecucionMs} ms`);
  console.log(`✓  Coincidencias: ${resultado1.coincidencias.length}\n`);

  // ============================================
  // TEST 2: MÚLTIPLES patrones (Aho-Corasick debería ganar)
  // ============================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 2: MÚLTIPLES PATRONES (caso forense real)');
  console.log('═══════════════════════════════════════════════════════');

  const patronesMultiples = [
    'ATCGATCG',
    'GCTAGCTA',
    'TACGTACG',
    'CGCGATAT',
    'ATATGCGC'
  ];

  console.log(`Patrones: ${patronesMultiples.length}`);
  console.log('Sospechosos: 1000');
  console.log('Algoritmo esperado: Aho-Corasick\n');

  const resultado2 = await ejecutarMotor(patronesMultiples, rutaCSV);

  console.log(`🎯 Algoritmo seleccionado: ${resultado2.algoritmoUsado}`);
  console.log(`⏱️  Tiempo: ${resultado2.tiempoEjecucionMs} ms`);
  console.log(`✓  Coincidencias: ${resultado2.coincidencias.length}\n`);

  // ============================================
  // SIMULACIÓN: Si usáramos SOLO KMP
  // ============================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('SIMULACIÓN: Si usaras SOLO KMP para múltiples patrones');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('❌ Ejecución 1: Buscar "ATCGATCG" con KMP');
  const sim1 = await ejecutarMotor(['ATCGATCG'], rutaCSV);
  console.log(`   Tiempo: ${sim1.tiempoEjecucionMs} ms\n`);

  console.log('❌ Ejecución 2: Buscar "GCTAGCTA" con KMP');
  const sim2 = await ejecutarMotor(['GCTAGCTA'], rutaCSV);
  console.log(`   Tiempo: ${sim2.tiempoEjecucionMs} ms\n`);

  console.log('❌ Ejecución 3: Buscar "TACGTACG" con KMP');
  const sim3 = await ejecutarMotor(['TACGTACG'], rutaCSV);
  console.log(`   Tiempo: ${sim3.tiempoEjecucionMs} ms\n`);

  console.log('❌ Ejecución 4: Buscar "CGCGATAT" con KMP');
  const sim4 = await ejecutarMotor(['CGCGATAT'], rutaCSV);
  console.log(`   Tiempo: ${sim4.tiempoEjecucionMs} ms\n`);

  console.log('❌ Ejecución 5: Buscar "ATATGCGC" con KMP');
  const sim5 = await ejecutarMotor(['ATATGCGC'], rutaCSV);
  console.log(`   Tiempo: ${sim5.tiempoEjecucionMs} ms\n`);

  const tiempoKmpTotal = sim1.tiempoEjecucionMs + sim2.tiempoEjecucionMs +
                         sim3.tiempoEjecucionMs + sim4.tiempoEjecucionMs +
                         sim5.tiempoEjecucionMs;

  console.log('═══════════════════════════════════════════════════════');
  console.log('RESULTADOS FINALES');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`✅ Aho-Corasick (1 ejecución):  ${resultado2.tiempoEjecucionMs} ms`);
  console.log(`❌ KMP (5 ejecuciones):         ${tiempoKmpTotal} ms`);
  console.log(`📊 Diferencia:                  ${tiempoKmpTotal - resultado2.tiempoEjecucionMs} ms`);
  console.log(`⚡ Aho-Corasick es ${Math.round(tiempoKmpTotal / resultado2.tiempoEjecucionMs)}x más rápido\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('CONCLUSIÓN');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('✓ Para 1 patrón:        KMP es óptimo');
  console.log('✓ Para 2+ patrones:     Aho-Corasick es MUCHO mejor');
  console.log('✓ Tu sistema actual:    Selecciona automáticamente ⭐\n');

  console.log('🎓 RESPUESTA A TU PROFESOR:');
  console.log('"Implementé selección automática de algoritmos porque');
  console.log('en análisis forense real a veces buscamos 1 patrón');
  console.log('(KMP óptimo) y a veces múltiples patrones (Aho-Corasick');
  console.log(`necesario). Con 5 patrones, Aho-Corasick es ${Math.round(tiempoKmpTotal / resultado2.tiempoEjecucionMs)}x más rápido."\n`);

  // Limpiar
  await fs.unlink(rutaCSV);
  process.exit(0);
}

benchmark().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
