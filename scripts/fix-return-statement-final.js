#!/usr/bin/env node

/**
 * Script para eliminar el return statement que está fuera de la función principal
 * Este es el problema crítico que impide la compilación
 */

const fs = require('fs');

console.log('🔧 ELIMINANDO RETURN STATEMENT PROBLEMÁTICO');
console.log('===========================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.final-fix.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;
  const lines = content.split('\n');
  
  // Buscar el return statement problemático en la línea 2306
  console.log('🔍 Buscando return statement problemático...');
  
  let foundProblem = false;
  let startIndex = -1;
  let endIndex = -1;
  
  // Buscar el return statement que está fuera de la función
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Buscar el return statement problemático después de ejecutarTestPostmanBusinessCentral
    if (i > 2300 && i < 2320 && line.startsWith('return (')) {
      console.log(`⚠️ Encontrado return statement problemático en línea ${i + 1}: ${line.substring(0, 50)}...`);
      startIndex = i;
      foundProblem = true;
      
      // Buscar el final del JSX (buscar el cierre del return)
      let braceCount = 0;
      let parenCount = 0;
      let inJSX = false;
      
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        
        if (j === i) {
          // Primera línea del return
          parenCount = 1; // return (
          inJSX = true;
        }
        
        // Contar paréntesis y llaves
        for (let char of currentLine) {
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        // Si llegamos al final del return statement
        if (inJSX && parenCount === 0) {
          endIndex = j;
          console.log(`📍 Final del return problemático encontrado en línea ${j + 1}`);
          break;
        }
        
        // Límite de seguridad
        if (j - i > 200) {
          endIndex = i + 50; // Eliminar al menos 50 líneas
          console.log(`⚠️ Límite de seguridad alcanzado, eliminando hasta línea ${endIndex + 1}`);
          break;
        }
      }
      
      break;
    }
  }
  
  if (foundProblem && startIndex !== -1 && endIndex !== -1) {
    // Eliminar las líneas problemáticas
    const linesToRemove = endIndex - startIndex + 1;
    const removedLines = lines.splice(startIndex, linesToRemove);
    
    console.log(`✅ Eliminadas ${linesToRemove} líneas del return statement problemático`);
    console.log(`📊 Líneas eliminadas desde ${startIndex + 1} hasta ${endIndex + 1}`);
    
    corrections++;
    
    // Reconstruir el contenido
    content = lines.join('\n');
    
    // Escribir el archivo corregido
    fs.writeFileSync(filePath, content);
    
    console.log('\n✅ CORRECCIÓN APLICADA');
    console.log('──────────────────────────────');
    console.log(`📊 Total correcciones: ${corrections}`);
    console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
    console.log(`📊 Líneas finales: ${lines.length}`);
    
  } else {
    console.log('❌ No se encontró el return statement problemático');
    console.log('🔍 Buscando en rango 2300-2320...');
    
    for (let i = 2300; i < 2320 && i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('return')) {
        console.log(`📍 Línea ${i + 1}: ${line}`);
      }
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 