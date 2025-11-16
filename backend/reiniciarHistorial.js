/**
 * ============================================
 * SCRIPT: REINICIAR HISTORIAL Y REPORTES
 * ============================================
 *
 * ¿QUÉ HACE?
 * Elimina TODAS las búsquedas y reportes de la base de datos.
 *
 * ¿QUÉ SE MANTIENE?
 * ✅ Usuarios (admins, peritos, investigadores)
 * ✅ Sospechosos (base de datos de ADN)
 *
 * ¿QUÉ SE ELIMINA?
 * ❌ Búsquedas (historial completo)
 * ❌ Reportes PDF (registros en BD y archivos físicos)
 *
 * USO:
 * node reiniciarHistorial.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Busqueda = require('./src/models/Busqueda');
const Reporte = require('./src/models/Reporte');
const fs = require('fs').promises;
const path = require('path');

const REPORTES_DIR = process.env.REPORTS_DIR || 'uploads/reportes';

async function reiniciar() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-forense-adn');
    console.log('✅ Conectado\n');

    console.log('=' .repeat(70));
    console.log('⚠️  ADVERTENCIA: REINICIO DE HISTORIAL Y REPORTES');
    console.log('=' .repeat(70));
    console.log('');
    console.log('Esta operación:');
    console.log('  ❌ ELIMINARÁ todas las búsquedas del historial');
    console.log('  ❌ ELIMINARÁ todos los reportes PDF (archivos y registros)');
    console.log('  ✅ MANTENDRÁ todos los usuarios');
    console.log('  ✅ MANTENDRÁ todos los sospechosos');
    console.log('');
    console.log('⚠️  ESTA ACCIÓN NO SE PUEDE DESHACER');
    console.log('');

    // Contar registros actuales
    const totalBusquedas = await Busqueda.countDocuments();
    const totalReportes = await Reporte.countDocuments();

    console.log('📊 ESTADO ACTUAL:');
    console.log(`   Búsquedas en historial: ${totalBusquedas}`);
    console.log(`   Reportes generados: ${totalReportes}`);
    console.log('');

    if (totalBusquedas === 0 && totalReportes === 0) {
      console.log('✅ No hay nada que eliminar. La base de datos ya está limpia.');
      process.exit(0);
    }

    // Confirmación interactiva
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('¿Estás seguro que deseas continuar? Escribe "SI ELIMINAR" para confirmar: ', async (respuesta) => {
      try {
        if (respuesta !== 'SI ELIMINAR') {
          console.log('\n❌ Operación cancelada. No se eliminó nada.');
          rl.close();
          return;
        }

        console.log('\n🗑️  ELIMINANDO DATOS...\n');

        // 1. Eliminar archivos PDF físicos
        console.log('1️⃣  Eliminando archivos PDF...');
        let archivosEliminados = 0;

        try {
          const reportes = await Reporte.find({});
          for (const reporte of reportes) {
            const rutaArchivo = path.join(REPORTES_DIR, reporte.rutaArchivo);
            try {
              await fs.unlink(rutaArchivo);
              archivosEliminados++;
            } catch (error) {
              // Ignorar si el archivo no existe
            }
          }
          console.log(`   ✅ ${archivosEliminados} archivos PDF eliminados\n`);
        } catch (error) {
          console.log(`   ⚠️  No se pudieron eliminar algunos archivos: ${error.message}\n`);
        }

        // 2. Eliminar registros de reportes
        console.log('2️⃣  Eliminando registros de reportes...');
        const resultadoReportes = await Reporte.deleteMany({});
        console.log(`   ✅ ${resultadoReportes.deletedCount} reportes eliminados\n`);

        // 3. Eliminar búsquedas
        console.log('3️⃣  Eliminando búsquedas del historial...');
        const resultadoBusquedas = await Busqueda.deleteMany({});
        console.log(`   ✅ ${resultadoBusquedas.deletedCount} búsquedas eliminadas\n`);

        console.log('=' .repeat(70));
        console.log('✅ REINICIO COMPLETADO EXITOSAMENTE');
        console.log('=' .repeat(70));
        console.log('');
        console.log('📊 RESUMEN:');
        console.log(`   Búsquedas eliminadas: ${resultadoBusquedas.deletedCount}`);
        console.log(`   Reportes eliminados: ${resultadoReportes.deletedCount}`);
        console.log(`   Archivos PDF eliminados: ${archivosEliminados}`);
        console.log('');
        console.log('✅ La base de datos está lista para empezar de nuevo.');
        console.log('');

        rl.close();
      } catch (error) {
        console.error('\n❌ Error durante la eliminación:', error.message);
        rl.close();
      }
    });

    // Esperar cierre de readline
    rl.on('close', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexión cerrada.\n');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reiniciar();
