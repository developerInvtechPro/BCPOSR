#!/usr/bin/env node

/**
 * Script para corregir el return statement duplicado que está causando errores de sintaxis
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO RETURN STATEMENT DUPLICADO');
console.log('==========================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.duplicate-return.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // Buscar y eliminar el return statement duplicado alrededor de la línea 2430
  const lines = content.split('\n');
  let foundFirstReturn = false;
  let returnLineIndex = -1;
  
  const fixedLines = lines.map((line, index) => {
    // Buscar líneas que contienen "return (" 
    if (line.trim().startsWith('return (')) {
      if (!foundFirstReturn) {
        // Este es el primer return, probablemente el problemático
        console.log(`🔍 Encontrado primer return en línea ${index + 1}: ${line.trim()}`);
        
        // Verificar si está en el rango problemático (alrededor de 2430)
        if (index >= 2425 && index <= 2435) {
          console.log(`❌ Eliminando return duplicado en línea ${index + 1}`);
          corrections++;
          returnLineIndex = index;
          foundFirstReturn = true;
          return ''; // Eliminar esta línea
        }
        foundFirstReturn = true;
        return line;
      } else {
        // Este es un return posterior, mantenerlo
        console.log(`✅ Manteniendo return válido en línea ${index + 1}`);
        return line;
      }
    }
    
    // Si eliminamos un return, también necesitamos eliminar las líneas JSX que le siguen inmediatamente
    if (returnLineIndex !== -1 && index > returnLineIndex && index <= returnLineIndex + 10) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('<Box') || 
          trimmedLine.startsWith('<Head>') || 
          trimmedLine.startsWith('<title>') ||
          trimmedLine.startsWith('<style>') ||
          trimmedLine.includes('Panel principal') ||
          trimmedLine.startsWith('<Grid')) {
        console.log(`❌ Eliminando línea JSX duplicada en línea ${index + 1}: ${trimmedLine.substring(0, 50)}...`);
        corrections++;
        return '';
      }
    }
    
    return line;
  });

  content = fixedLines.join('\n');

  // Limpiar líneas vacías excesivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🚀 Return statement duplicado eliminado. Reinicie el servidor.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 