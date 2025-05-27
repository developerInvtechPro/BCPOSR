#!/usr/bin/env node

/**
 * Script para arreglar errores de sintaxis en index.tsx
 * Elimina líneas problemáticas y reconstruye el archivo
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ==============================================');
console.log('🛠️  ARREGLANDO ERRORES DE SINTAXIS');
console.log('🔧 ==============================================\n');

const filePath = 'src/pages/index.tsx';

try {
  // Leer el archivo
  console.log('📖 Leyendo archivo:', filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log(`📊 Total de líneas: ${lines.length}`);
  
  // Buscar y eliminar líneas problemáticas
  const problematicPatterns = [
    /^\s*<BusinessCentralConfig\s*\/>\s*$/,
    /^\s*<BusinessCentralConfig.*$/,
    /BusinessCentralConfig/
  ];
  
  let fixedLines = [];
  let removedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let isProblematic = false;
    
    for (const pattern of problematicPatterns) {
      if (pattern.test(line)) {
        isProblematic = true;
        removedLines.push({
          lineNumber: i + 1,
          content: line.trim()
        });
        console.log(`❌ Línea ${i + 1} eliminada: ${line.trim()}`);
        break;
      }
    }
    
    if (!isProblematic) {
      fixedLines.push(line);
    }
  }
  
  // Escribir el archivo corregido
  const fixedContent = fixedLines.join('\n');
  
  // Crear backup
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, fixedContent);
  
  console.log('\n✅ ARCHIVO CORREGIDO EXITOSAMENTE');
  console.log('─'.repeat(50));
  console.log(`📊 Líneas originales: ${lines.length}`);
  console.log(`📊 Líneas corregidas: ${fixedLines.length}`);
  console.log(`📊 Líneas eliminadas: ${removedLines.length}`);
  
  if (removedLines.length > 0) {
    console.log('\n🗑️  LÍNEAS ELIMINADAS:');
    removedLines.forEach(removed => {
      console.log(`   Línea ${removed.lineNumber}: ${removed.content}`);
    });
  }
  
  console.log('\n🎉 ¡ERRORES DE SINTAXIS CORREGIDOS!');
  console.log('🔄 Reinicie el servidor con: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 