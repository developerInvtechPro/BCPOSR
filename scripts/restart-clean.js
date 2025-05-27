#!/usr/bin/env node

/**
 * Script para reiniciar limpiamente el servidor de desarrollo
 * Detiene todos los procesos, limpia cache y reinicia
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');

console.log('🔄 ==============================================');
console.log('🧹 REINICIO LIMPIO DEL SERVIDOR');
console.log('🔄 ==============================================\n');

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error && !error.message.includes('No matching processes')) {
        console.log(`⚠️  ${description}: ${error.message}`);
      } else {
        console.log(`✅ ${description} completado`);
      }
      resolve();
    });
  });
}

async function main() {
  try {
    // Paso 1: Detener todos los procesos de Next.js
    await runCommand('pkill -f "next dev" || true', 'Deteniendo procesos de Next.js');
    await runCommand('pkill -f "next" || true', 'Deteniendo todos los procesos de Next');
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Paso 2: Limpiar cache
    await runCommand('rm -rf .next', 'Eliminando cache de Next.js');
    await runCommand('rm -rf node_modules/.cache', 'Eliminando cache de node_modules');
    
    // Paso 3: Verificar que el archivo principal existe
    if (fs.existsSync('src/pages/index.tsx')) {
      const stats = fs.statSync('src/pages/index.tsx');
      console.log(`✅ Archivo principal verificado: ${(stats.size / 1024).toFixed(1)} KB`);
    } else {
      console.log('❌ Error: Archivo principal no encontrado');
      return;
    }
    
    console.log('\n🚀 INICIANDO SERVIDOR LIMPIO...');
    console.log('─'.repeat(50));
    
    // Paso 4: Iniciar servidor
    const server = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    server.on('error', (error) => {
      console.error('❌ Error iniciando servidor:', error);
    });
    
    // Mostrar información útil
    setTimeout(() => {
      console.log('\n🎉 SERVIDOR INICIADO');
      console.log('─'.repeat(50));
      console.log('🌐 URL: http://localhost:3000 (o el puerto mostrado arriba)');
      console.log('📋 Para probar Business Central:');
      console.log('   1. Ir a SUPER → Business Central');
      console.log('   2. Hacer clic en "🧪 Test Tipo Postman"');
      console.log('🔄 Para detener: Ctrl+C');
      console.log('─'.repeat(50));
    }, 5000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 