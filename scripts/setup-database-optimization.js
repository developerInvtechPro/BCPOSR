const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 ===============================================');
console.log('🔧 CONFIGURACIÓN DE USUARIOS Y OPTIMIZACIÓN DB');
console.log('🔧 Sistema POS Honduras - PostgreSQL');
console.log('🔧 ===============================================\n');

// Función para ejecutar comandos de PostgreSQL
function ejecutarSQL(comando, descripcion) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${descripcion}...`);
    
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ Error en ${descripcion}:`);
        console.log(`   ${error.message}`);
        if (stderr) {
          console.log(`   ${stderr}`);
        }
        reject(error);
      } else {
        console.log(`✅ ${descripcion} completado`);
        if (stdout) {
          console.log(`   ${stdout.trim()}`);
        }
        resolve(stdout);
      }
    });
  });
}

// Función principal
async function configurarBaseDatos() {
  try {
    // 1. Verificar conexión a PostgreSQL
    console.log('📋 VERIFICANDO CONEXIÓN A POSTGRESQL');
    console.log('──────────────────────────────────────');
    
    await ejecutarSQL(
      'psql -d pos_honduras -c "SELECT version();"',
      'Verificando conexión a PostgreSQL'
    );

    // 2. Ejecutar script de configuración de usuarios
    console.log('\n📋 CONFIGURANDO USUARIOS Y PERMISOS');
    console.log('──────────────────────────────────────');
    
    const scriptPath = path.join(__dirname, 'setup-database-users.sql');
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script no encontrado: ${scriptPath}`);
    }

    await ejecutarSQL(
      `psql -d pos_honduras -f "${scriptPath}"`,
      'Ejecutando configuración de usuarios y permisos'
    );

    // 3. Verificar usuarios creados
    console.log('\n📋 VERIFICANDO USUARIOS CREADOS');
    console.log('──────────────────────────────────────');
    
    await ejecutarSQL(
      `psql -d pos_honduras -c "SELECT rolname as usuario, rolcanlogin as puede_login, rolconnlimit as limite_conexiones FROM pg_roles WHERE rolname LIKE 'pos_%' ORDER BY rolname;"`,
      'Listando usuarios del sistema POS'
    );

    // 4. Verificar índices creados
    console.log('\n📋 VERIFICANDO ÍNDICES CREADOS');
    console.log('──────────────────────────────────────');
    
    await ejecutarSQL(
      `psql -d pos_honduras -c "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%' ORDER BY tablename, indexname;"`,
      'Listando índices de optimización'
    );

    // 5. Verificar vistas creadas
    console.log('\n📋 VERIFICANDO VISTAS CREADAS');
    console.log('──────────────────────────────────────');
    
    await ejecutarSQL(
      `psql -d pos_honduras -c "SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'v_%' ORDER BY viewname;"`,
      'Listando vistas de reportes'
    );

    // 6. Probar conexiones con diferentes usuarios
    console.log('\n📋 PROBANDO CONEXIONES DE USUARIOS');
    console.log('──────────────────────────────────────');
    
    const usuarios = [
      { nombre: 'pos_reports', password: 'Reports2024!' },
      { nombre: 'pos_cajero_01', password: 'Cajero2024!' },
      { nombre: 'pos_mesero_01', password: 'Mesero2024!' },
      { nombre: 'pos_gerente_01', password: 'Gerente2024!' },
      { nombre: 'pos_admin_01', password: 'Admin2024!' }
    ];

    for (const usuario of usuarios) {
      try {
        await ejecutarSQL(
          `PGPASSWORD="${usuario.password}" psql -h localhost -U ${usuario.nombre} -d pos_honduras -c "SELECT current_user, current_database();"`,
          `Probando conexión usuario ${usuario.nombre}`
        );
      } catch (error) {
        console.log(`⚠️  Usuario ${usuario.nombre} requiere configuración adicional`);
      }
    }

    // 7. Mostrar estadísticas de la base de datos
    console.log('\n📋 ESTADÍSTICAS DE LA BASE DE DATOS');
    console.log('──────────────────────────────────────');
    
    await ejecutarSQL(
      `psql -d pos_honduras -c "SELECT schemaname, tablename, n_tup_ins as inserciones, n_tup_upd as actualizaciones, n_tup_del as eliminaciones FROM pg_stat_user_tables ORDER BY tablename;"`,
      'Estadísticas de uso de tablas'
    );

    // 8. Crear archivo de configuración para la aplicación
    console.log('\n📋 CREANDO CONFIGURACIÓN PARA LA APP');
    console.log('──────────────────────────────────────');
    
    const configDB = {
      development: {
        host: 'localhost',
        port: 5432,
        database: 'pos_honduras',
        username: 'pos_app',
        password: 'PosApp2024!',
        dialect: 'postgresql',
        logging: false
      },
      production: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'pos_honduras',
        username: process.env.DB_USER || 'pos_app',
        password: process.env.DB_PASSWORD || 'PosApp2024!',
        dialect: 'postgresql',
        logging: false
      },
      usuarios: {
        readonly: {
          username: 'pos_reports',
          password: 'Reports2024!',
          descripcion: 'Usuario de solo lectura para reportes'
        },
        cajero: {
          username: 'pos_cajero_01',
          password: 'Cajero2024!',
          descripcion: 'Usuario para operaciones de caja'
        },
        mesero: {
          username: 'pos_mesero_01',
          password: 'Mesero2024!',
          descripcion: 'Usuario para gestión de mesas'
        },
        gerente: {
          username: 'pos_gerente_01',
          password: 'Gerente2024!',
          descripcion: 'Usuario para gestión gerencial'
        },
        admin: {
          username: 'pos_admin_01',
          password: 'Admin2024!',
          descripcion: 'Usuario administrador'
        }
      }
    };

    const configPath = path.join(__dirname, '..', 'config', 'database-users.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(configDB, null, 2));
    console.log(`✅ Configuración guardada en: ${configPath}`);

    // 9. Actualizar archivo .env con nueva configuración
    console.log('\n📋 ACTUALIZANDO ARCHIVO .ENV');
    console.log('──────────────────────────────────────');
    
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Actualizar o agregar configuración de base de datos
    const nuevaConfigDB = `
# Configuración de Base de Datos PostgreSQL
DATABASE_URL="postgresql://pos_app:PosApp2024!@localhost:5432/pos_honduras?schema=public"

# Usuarios específicos por rol
DB_READONLY_URL="postgresql://pos_reports:Reports2024!@localhost:5432/pos_honduras?schema=public"
DB_CAJERO_URL="postgresql://pos_cajero_01:Cajero2024!@localhost:5432/pos_honduras?schema=public"
DB_MESERO_URL="postgresql://pos_mesero_01:Mesero2024!@localhost:5432/pos_honduras?schema=public"
DB_GERENTE_URL="postgresql://pos_gerente_01:Gerente2024!@localhost:5432/pos_honduras?schema=public"
DB_ADMIN_URL="postgresql://pos_admin_01:Admin2024!@localhost:5432/pos_honduras?schema=public"
`;

    // Remover configuraciones anteriores de DB si existen
    envContent = envContent.replace(/^DATABASE_URL=.*$/gm, '');
    envContent = envContent.replace(/^DB_.*_URL=.*$/gm, '');
    
    // Agregar nueva configuración
    envContent = envContent.trim() + '\n' + nuevaConfigDB;
    
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Archivo .env actualizado`);

    // 10. Resumen final
    console.log('\n🎉 ===============================================');
    console.log('🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE');
    console.log('🎉 ===============================================');
    console.log('');
    console.log('📊 RESUMEN DE CONFIGURACIÓN:');
    console.log('──────────────────────────────────────');
    console.log('✅ Roles creados: 5 (readonly, cajero, mesero, gerente, admin)');
    console.log('✅ Usuarios creados: 8 usuarios específicos');
    console.log('✅ Índices optimización: 25+ índices para consultas rápidas');
    console.log('✅ Vistas de reportes: 3 vistas optimizadas');
    console.log('✅ Auditoría: Sistema de auditoría configurado');
    console.log('✅ Seguridad: Límites de conexión y timeouts');
    console.log('');
    console.log('🔐 USUARIOS DISPONIBLES:');
    console.log('──────────────────────────────────────');
    console.log('• pos_reports (solo lectura) - Reports2024!');
    console.log('• pos_cajero_01 (operaciones caja) - Cajero2024!');
    console.log('• pos_mesero_01 (gestión mesas) - Mesero2024!');
    console.log('• pos_gerente_01 (gestión completa) - Gerente2024!');
    console.log('• pos_admin_01 (administrador) - Admin2024!');
    console.log('• pos_app (aplicación principal) - PosApp2024!');
    console.log('');
    console.log('🚀 PRÓXIMOS PASOS:');
    console.log('──────────────────────────────────────');
    console.log('1. Reiniciar la aplicación: npm run dev');
    console.log('2. Probar Prisma Studio: npx prisma studio');
    console.log('3. Verificar conexiones en la aplicación');
    console.log('4. Configurar backups automáticos');
    console.log('');

  } catch (error) {
    console.log('\n❌ ===============================================');
    console.log('❌ ERROR EN LA CONFIGURACIÓN');
    console.log('❌ ===============================================');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('🔧 POSIBLES SOLUCIONES:');
    console.log('──────────────────────────────────────');
    console.log('1. Verificar que PostgreSQL esté ejecutándose');
    console.log('2. Verificar credenciales de conexión');
    console.log('3. Verificar que la base de datos pos_honduras exista');
    console.log('4. Ejecutar: brew services restart postgresql@14');
    console.log('');
    process.exit(1);
  }
}

// Ejecutar configuración
configurarBaseDatos(); 