#!/usr/bin/env node

/**
 * Script para corregir el JSX mal ubicado en medio de la función ejecutarTestPostmanBusinessCentral
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO JSX MAL UBICADO');
console.log('===============================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.jsx-placement.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;
  const lines = content.split('\n');
  
  // Buscar el final de la función ejecutarTestPostmanBusinessCentral
  let funcionStart = -1;
  let funcionEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const ejecutarTestPostmanBusinessCentral = async () => {')) {
      funcionStart = i;
      console.log(`🔍 Encontrada función ejecutarTestPostmanBusinessCentral en línea ${i + 1}`);
    }
    
    // Buscar el final de la función (línea que termina con }; y está después del inicio)
    if (funcionStart !== -1 && i > funcionStart && lines[i].trim() === '};') {
      funcionEnd = i;
      console.log(`🔍 Encontrado final de función en línea ${i + 1}`);
      break;
    }
  }
  
  if (funcionStart !== -1 && funcionEnd !== -1) {
    // Eliminar todo el JSX que está después del final de la función hasta encontrar el return principal
    let jsxStart = funcionEnd + 1;
    let jsxEnd = -1;
    
    // Buscar donde empieza el return principal de la función Home
    for (let i = jsxStart; i < lines.length; i++) {
      // Buscar líneas que contienen JSX (Grid, Box, etc.) que están mal ubicadas
      if (lines[i].includes('</Box>') && 
          lines[i + 1] && lines[i + 1].includes('</Grid>') &&
          lines[i + 2] && lines[i + 2].includes('{/* Panel central:')) {
        jsxEnd = i + 1;
        console.log(`🔍 Encontrado final del JSX mal ubicado en línea ${i + 2}`);
        break;
      }
    }
    
    if (jsxEnd !== -1) {
      console.log(`❌ Eliminando JSX mal ubicado desde línea ${jsxStart + 1} hasta línea ${jsxEnd + 1}`);
      
      const fixedLines = lines.filter((line, index) => {
        if (index > funcionEnd && index <= jsxEnd) {
          corrections++;
          return false; // Eliminar estas líneas
        }
        return true; // Mantener las demás líneas
      });
      
      content = fixedLines.join('\n');
      console.log(`✅ Eliminadas ${corrections} líneas de JSX mal ubicado`);
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
  
  console.log('\n🚀 JSX mal ubicado eliminado. Reinicie el servidor.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 