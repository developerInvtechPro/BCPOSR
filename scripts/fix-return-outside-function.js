#!/usr/bin/env node

/**
 * Script para eliminar el return statement que está fuera de la función principal
 */

const fs = require('fs');

console.log('🔧 ELIMINANDO RETURN STATEMENT FUERA DE FUNCIÓN');
console.log('===============================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.return-outside.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;
  const lines = content.split('\n');
  
  // Buscar el return statement problemático en línea 2306
  let foundProblemReturn = false;
  let startDeleteIndex = -1;
  let endDeleteIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Buscar el return statement problemático alrededor de línea 2306
    if (i >= 2300 && i <= 2320 && line === 'return (') {
      console.log(`🔍 Encontrado return problemático en línea ${i + 1}: "${line}"`);
      startDeleteIndex = i;
      foundProblemReturn = true;
      
      // Buscar el final del JSX (buscar el cierre del return)
      let braceCount = 0;
      let parenCount = 1; // Ya tenemos el paréntesis de apertura
      
      for (let j = i + 1; j < lines.length; j++) {
        const currentLine = lines[j];
        
        // Contar paréntesis y llaves para encontrar el final del return
        for (let char of currentLine) {
          if (char === '(') parenCount++;
          if (char === ')') parenCount--;
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        
        // Si llegamos al final del return statement
        if (parenCount === 0) {
          endDeleteIndex = j;
          console.log(`🔍 Final del return problemático en línea ${j + 1}`);
          break;
        }
        
        // Seguridad: no buscar más allá de 100 líneas
        if (j - i > 100) {
          console.log('⚠️ Búsqueda del final del return excedió 100 líneas, usando heurística');
          endDeleteIndex = j;
          break;
        }
      }
      
      break;
    }
  }
  
  if (foundProblemReturn && startDeleteIndex !== -1 && endDeleteIndex !== -1) {
    console.log(`🗑️ Eliminando líneas ${startDeleteIndex + 1} a ${endDeleteIndex + 1}`);
    
    // Eliminar las líneas problemáticas
    const newLines = [
      ...lines.slice(0, startDeleteIndex),
      ...lines.slice(endDeleteIndex + 1)
    ];
    
    const newContent = newLines.join('\n');
    fs.writeFileSync(filePath, newContent);
    
    const deletedLines = endDeleteIndex - startDeleteIndex + 1;
    corrections++;
    
    console.log(`✅ Eliminadas ${deletedLines} líneas del return problemático`);
  } else {
    console.log('❌ No se encontró el return statement problemático');
  }
  
  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('──────────────────────────────');
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(fs.readFileSync(filePath, 'utf8').length / 1024).toFixed(1)} KB`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 