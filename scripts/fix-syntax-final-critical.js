#!/usr/bin/env node

/**
 * Script para encontrar y corregir el error crítico de sintaxis
 * "Unexpected token Box" en línea 2431
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO ERROR CRÍTICO DE SINTAXIS');
console.log('==========================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.syntax-critical.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  const lines = content.split('\n');
  console.log(`📊 Total líneas: ${lines.length}`);
  
  let corrections = 0;
  
  // Buscar el problema específico alrededor de la línea 2431
  console.log('🔍 Analizando líneas 2420-2440...');
  
  for (let i = 2420; i < 2440 && i < lines.length; i++) {
    const line = lines[i].trim();
    console.log(`📍 Línea ${i + 1}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
  }
  
  // Buscar funciones que no estén cerradas correctamente
  console.log('\n🔍 Buscando funciones sin cerrar...');
  
  let braceCount = 0;
  let inFunction = false;
  let functionStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detectar inicio de función principal
    if (line.includes('export default function Home()') || line.includes('function Home()')) {
      inFunction = true;
      functionStart = i;
      console.log(`📍 Función principal encontrada en línea ${i + 1}`);
    }
    
    // Contar llaves
    for (let char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // Si estamos en la función y las llaves se balancean a 0, la función terminó
    if (inFunction && braceCount === 0 && i > functionStart + 10) {
      console.log(`📍 Función principal termina en línea ${i + 1}`);
      
      // Verificar si hay código después del final de la función
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith('//') && !nextLine.startsWith('/*') && nextLine !== '}') {
          console.log(`⚠️ Código encontrado después del final de la función en línea ${j + 1}: ${nextLine.substring(0, 50)}...`);
          
          // Si encontramos JSX o return statements fuera de la función, los eliminamos
          if (nextLine.includes('<') || nextLine.includes('return') || nextLine.includes('Box') || nextLine.includes('Grid')) {
            console.log(`🗑️ Eliminando línea problemática ${j + 1}: ${nextLine}`);
            lines.splice(j, 1);
            corrections++;
            j--; // Ajustar índice después de eliminar
          }
        }
      }
      break;
    }
  }
  
  // Buscar y eliminar return statements sueltos
  console.log('\n🔍 Buscando return statements problemáticos...');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Buscar return statements que estén fuera de funciones
    if (line.startsWith('return (') && i > 2300) {
      console.log(`⚠️ Return statement sospechoso en línea ${i + 1}: ${line}`);
      
      // Verificar si está dentro de una función válida
      let isInsideFunction = false;
      let braceBalance = 0;
      
      // Revisar hacia atrás para ver si está dentro de una función
      for (let j = i - 1; j >= Math.max(0, i - 50); j--) {
        const prevLine = lines[j];
        
        // Contar llaves hacia atrás
        for (let k = prevLine.length - 1; k >= 0; k--) {
          if (prevLine[k] === '}') braceBalance++;
          if (prevLine[k] === '{') braceBalance--;
        }
        
        // Si encontramos una función y el balance es correcto
        if ((prevLine.includes('function ') || prevLine.includes('const ') || prevLine.includes('= (')) && braceBalance <= 0) {
          isInsideFunction = true;
          break;
        }
      }
      
      if (!isInsideFunction) {
        console.log(`🗑️ Eliminando return statement fuera de función en línea ${i + 1}`);
        
        // Eliminar el return statement y todo su contenido JSX
        let endIndex = i;
        let parenCount = 1; // Empezamos con 1 por el paréntesis inicial
        
        for (let j = i + 1; j < lines.length && j < i + 200; j++) {
          const currentLine = lines[j];
          
          for (let char of currentLine) {
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
          }
          
          if (parenCount === 0) {
            endIndex = j;
            break;
          }
        }
        
        const linesToRemove = endIndex - i + 1;
        console.log(`🗑️ Eliminando ${linesToRemove} líneas desde ${i + 1} hasta ${endIndex + 1}`);
        lines.splice(i, linesToRemove);
        corrections++;
        i--; // Ajustar índice
      }
    }
  }
  
  // Reconstruir contenido
  content = lines.join('\n');
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);
  
  console.log('\n✅ CORRECCIÓN COMPLETADA');
  console.log('──────────────────────────────');
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  console.log(`📊 Líneas finales: ${lines.length}`);
  
  if (corrections > 0) {
    console.log('\n🎉 Se encontraron y corrigieron problemas de sintaxis');
  } else {
    console.log('\n⚠️ No se encontraron problemas obvios. El error puede ser más sutil.');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 