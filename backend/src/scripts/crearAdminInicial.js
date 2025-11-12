/**
 * ============================================
 * SCRIPT: CREAR USUARIO ADMINISTRADOR INICIAL
 * ============================================
 *
 * ⚠️ IMPORTANTE: Este script debe ejecutarse SOLO UNA VEZ
 * después de la instalación inicial del sistema.
 *
 * ¿PARA QUÉ?
 * En el modelo de seguridad forense, no hay registro público.
 * Solo administradores pueden crear usuarios.
 * Por lo tanto, necesitamos crear el primer admin manualmente.
 *
 * ¿CÓMO USAR?
 * 1. Configurar las variables de entorno en .env
 * 2. Ejecutar: node src/scripts/crearAdminInicial.js
 * 3. Guardar las credenciales del admin de forma segura
 * 4. Usar estas credenciales para crear más usuarios desde el sistema
 *
 * SEGURIDAD:
 * - El admin debe cambiar la contraseña inmediatamente después del primer login
 * - Las credenciales deben guardarse en un lugar seguro
 * - NO compartir las credenciales por email o medios inseguros
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

// Configuración del usuario administrador inicial
const ADMIN_CONFIG = {
  nombre: process.env.ADMIN_NOMBRE || 'Administrador del Sistema',
  email: process.env.ADMIN_EMAIL || 'admin@pnp.gob.pe',
  password: process.env.ADMIN_PASSWORD || 'Admin123!Temp',
  rol: 'admin'
};

/**
 * Conectar a MongoDB
 */
const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-forense-adn');
    console.log('✅ Conexión a MongoDB exitosa');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

/**
 * Crear el usuario administrador inicial
 */
const crearAdminInicial = async () => {
  try {
    console.log('\n========================================');
    console.log('CREACIÓN DE USUARIO ADMINISTRADOR INICIAL');
    console.log('========================================\n');

    // Verificar si ya existe un administrador
    const adminExistente = await Usuario.findOne({ rol: 'admin' });

    if (adminExistente) {
      console.log('⚠️  Ya existe un usuario administrador en el sistema:');
      console.log(`   Email: ${adminExistente.email}`);
      console.log(`   Nombre: ${adminExistente.nombre}`);
      console.log(`   Creado: ${adminExistente.createdAt}`);
      console.log('\n❌ No se puede crear otro administrador mediante este script.');
      console.log('   Si necesitas crear más administradores, usa el panel de administración.');
      return;
    }

    // Verificar si el email ya está registrado
    const usuarioExistente = await Usuario.findOne({ email: ADMIN_CONFIG.email });

    if (usuarioExistente) {
      console.log(`❌ El email ${ADMIN_CONFIG.email} ya está registrado.`);
      console.log('   Verifica la configuración en .env o elimina el usuario existente.');
      return;
    }

    // Crear el usuario administrador
    console.log('Creando usuario administrador...\n');

    const admin = await Usuario.create({
      nombre: ADMIN_CONFIG.nombre,
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password,
      rol: ADMIN_CONFIG.rol,
      activo: true
    });

    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('========================================');
    console.log('CREDENCIALES DEL ADMINISTRADOR');
    console.log('========================================');
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${ADMIN_CONFIG.password}`);
    console.log(`Rol:      ${admin.rol}`);
    console.log(`ID:       ${admin.id}`);
    console.log('========================================\n');

    console.log('⚠️  IMPORTANTE:');
    console.log('   1. Guarda estas credenciales en un lugar SEGURO');
    console.log('   2. CAMBIA la contraseña inmediatamente después del primer login');
    console.log('   3. NO compartas estas credenciales por email o chat');
    console.log('   4. Usa este usuario solo para crear otros administradores/peritos\n');

    console.log('📋 PRÓXIMOS PASOS:');
    console.log('   1. Haz login con estas credenciales en: http://localhost:5173');
    console.log('   2. Ve al panel de administración');
    console.log('   3. Crea cuentas para los peritos y personal autorizado');
    console.log('   4. Asigna los roles apropiados (perito, investigador, admin)\n');

  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error.message);

    if (error.name === 'ValidationError') {
      console.error('\n   Errores de validación:');
      Object.values(error.errors).forEach(err => {
        console.error(`   - ${err.message}`);
      });
    }
  }
};

/**
 * Función principal
 */
const main = async () => {
  try {
    await conectarDB();
    await crearAdminInicial();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada. Script finalizado.\n');
  }
};

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = { crearAdminInicial };
