#!/usr/bin/env node

/**
 * Script para corregir el return statement que está fuera de la función Home()
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO UBICACIÓN DEL RETURN STATEMENT');
console.log('==============================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.return-placement.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // El problema es que el return statement está fuera de la función Home()
  // Necesitamos mover todo el JSX que está después de la línea 2430 al final del archivo
  // y eliminar el return statement duplicado
  
  const lines = content.split('\n');
  let returnLineIndex = -1;
  let endOfJSXIndex = -1;
  
  // Buscar el return statement problemático
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === 'return (' && i >= 2425 && i <= 2435) {
      returnLineIndex = i;
      console.log(`🔍 Encontrado return problemático en línea ${i + 1}`);
      break;
    }
  }
  
  if (returnLineIndex !== -1) {
    // Buscar el final del JSX (donde termina el return statement)
    let braceCount = 0;
    let foundOpenParen = false;
    
    for (let i = returnLineIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('return (')) {
        foundOpenParen = true;
        braceCount = 1; // Empezamos con 1 por el paréntesis de apertura
      } else if (foundOpenParen) {
        // Contar paréntesis para encontrar el cierre del return
        for (let char of line) {
          if (char === '(') braceCount++;
          if (char === ')') braceCount--;
        }
        
        if (braceCount === 0) {
          endOfJSXIndex = i;
          console.log(`🔍 Encontrado final del JSX en línea ${i + 1}`);
          break;
        }
      }
    }
    
    if (endOfJSXIndex !== -1) {
      // Eliminar las líneas del return statement problemático
      console.log(`❌ Eliminando return statement problemático desde línea ${returnLineIndex + 1} hasta ${endOfJSXIndex + 1}`);
      
      const fixedLines = lines.filter((line, index) => {
        if (index >= returnLineIndex && index <= endOfJSXIndex) {
          corrections++;
          return false; // Eliminar estas líneas
        }
        return true; // Mantener las demás líneas
      });
      
      content = fixedLines.join('\n');
      
      console.log(`✅ Eliminadas ${corrections} líneas del return statement problemático`);
    }
  }

  // Limpiar líneas vacías excesivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🚀 Return statement problemático eliminado. Reinicie el servidor.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 