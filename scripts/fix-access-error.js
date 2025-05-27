#!/usr/bin/env node

/**
 * Script para corregir errores que impiden el acceso a la aplicación
 */

const fs = require('fs');
const { exec } = require('child_process');

console.log('🔧 CORRIGIENDO ERRORES DE ACCESO');
console.log('=================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.access.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // 1. Eliminar línea problemática <BusinessCentralConfig />
  console.log('🔍 Eliminando línea problemática BusinessCentralConfig...');
  if (content.includes('<BusinessCentralConfig />')) {
    content = content.replace(/<BusinessCentralConfig \/>/g, '');
    corrections++;
    console.log('✅ Línea BusinessCentralConfig eliminada');
  }

  // 2. Corregir declaraciones duplicadas de openSuper
  console.log('🔍 Eliminando declaraciones duplicadas de openSuper...');
  const lines = content.split('\n');
  let foundOpenSuper = false;
  const fixedLines = lines.map((line, index) => {
    if (line.trim().includes('const [openSuper, setOpenSuper] = useState(false);')) {
      if (!foundOpenSuper) {
        foundOpenSuper = true;
        console.log(`✅ Manteniendo primera declaración de openSuper en línea ${index + 1}`);
        return line;
      } else {
        console.log(`❌ Eliminando declaración duplicada de openSuper en línea ${index + 1}`);
        corrections++;
        return ''; // Eliminar línea duplicada
      }
    }
    return line;
  });

  content = fixedLines.join('\n');

  // 3. Verificar que el return statement esté bien formado
  console.log('🔍 Verificando return statement...');
  
  // Buscar el return statement principal
  const returnMatch = content.match(/return\s*\(\s*<[^>]+>/);
  if (returnMatch) {
    console.log('✅ Return statement encontrado');
  } else {
    console.log('⚠️ Return statement no encontrado o mal formado');
  }

  // 4. Limpiar líneas vacías excesivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/^\s*;\s*$/gm, '');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🚀 Reiniciando servidor...');
  
  // Detener procesos existentes
  exec('pkill -f "next"', (error) => {
    setTimeout(() => {
      // Limpiar cache
      exec('rm -rf .next', (error) => {
        setTimeout(() => {
          // Iniciar servidor
          console.log('🌐 Iniciando servidor en http://localhost:3000...');
          exec('npm run dev', (error, stdout, stderr) => {
            if (error) {
              console.error('❌ Error iniciando servidor:', error);
            } else {
              console.log('✅ Servidor iniciado exitosamente');
            }
          });
        }, 2000);
      });
    }, 2000);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 