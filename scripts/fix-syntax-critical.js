#!/usr/bin/env node

/**
 * Script para corregir errores críticos de sintaxis que impiden la compilación
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO ERRORES CRÍTICOS DE SINTAXIS');
console.log('=============================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.critical.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // 1. Corregir la función ejecutarTestPostmanBusinessCentral mal indentada
  console.log('🔍 Corrigiendo función ejecutarTestPostmanBusinessCentral mal indentada...');
  
  // Buscar la línea problemática y corregir la indentación
  const lines = content.split('\n');
  const fixedLines = lines.map((line, index) => {
    // Buscar la línea que contiene la función mal indentada
    if (line.trim().includes('const ejecutarTestPostmanBusinessCentral = async () => {')) {
      console.log(`✅ Corrigiendo indentación en línea ${index + 1}`);
      corrections++;
      // Corregir la indentación - debe estar al nivel de las otras funciones
      return '  const ejecutarTestPostmanBusinessCentral = async () => {';
    }
    return line;
  });

  content = fixedLines.join('\n');

  // 2. Verificar que no hay problemas con el return statement
  console.log('🔍 Verificando return statement...');
  
  // Buscar el return statement y asegurar que esté bien formado
  const returnIndex = content.indexOf('return (');
  if (returnIndex !== -1) {
    console.log('✅ Return statement encontrado');
    
    // Verificar que hay un JSX válido después del return
    const afterReturn = content.substring(returnIndex + 8, returnIndex + 100);
    if (afterReturn.includes('<Box')) {
      console.log('✅ JSX válido después del return');
    } else {
      console.log('⚠️ Posible problema con JSX después del return');
    }
  } else {
    console.log('❌ Return statement no encontrado');
  }

  // 3. Limpiar líneas vacías excesivas y caracteres problemáticos
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/^\s*;\s*$/gm, '');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🚀 Archivo corregido. Reinicie el servidor con: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 