#!/usr/bin/env node

/**
 * Script para eliminar fragmentos de código sueltos
 * que están causando errores de sintaxis al inicio del archivo
 */

const fs = require('fs');

console.log('🔧 ELIMINANDO FRAGMENTOS SUELTOS');
console.log('=================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.loose-fragments.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  const lines = content.split('\n');
  console.log(`📊 Total líneas: ${lines.length}`);
  
  let corrections = 0;
  let foundExportFunction = false;
  
  // Buscar la función principal export default
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('export default function Home()')) {
      foundExportFunction = true;
      console.log(`📍 Función principal encontrada en línea ${i + 1}`);
      
      // Eliminar todo lo que está antes de la función principal
      // excepto los imports
      let newLines = [];
      let inImports = true;
      
      for (let j = 0; j < i; j++) {
        const currentLine = lines[j].trim();
        
        // Mantener imports y líneas vacías
        if (currentLine.startsWith('import ') || 
            currentLine.startsWith('from ') ||
            currentLine === '' ||
            currentLine.startsWith('//') ||
            currentLine.startsWith('/*') ||
            currentLine.startsWith('*')) {
          newLines.push(lines[j]);
        } else {
          // Si encontramos código que no es import, dejamos de estar en la sección de imports
          inImports = false;
          console.log(`🗑️ Eliminando fragmento suelto línea ${j + 1}: ${currentLine.substring(0, 50)}${currentLine.length > 50 ? '...' : ''}`);
          corrections++;
        }
      }
      
      // Agregar el resto del archivo desde la función principal
      for (let j = i; j < lines.length; j++) {
        newLines.push(lines[j]);
      }
      
      // Actualizar las líneas
      lines.length = 0;
      lines.push(...newLines);
      break;
    }
  }
  
  if (!foundExportFunction) {
    console.log('⚠️ No se encontró la función principal export default function Home()');
    
    // Buscar cualquier función principal
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('function Home()') || line.includes('const Home = ')) {
        console.log(`📍 Función alternativa encontrada en línea ${i + 1}`);
        
        // Limpiar antes de esta función
        let newLines = [];
        
        for (let j = 0; j < i; j++) {
          const currentLine = lines[j].trim();
          
          if (currentLine.startsWith('import ') || 
              currentLine.startsWith('from ') ||
              currentLine === '' ||
              currentLine.startsWith('//') ||
              currentLine.startsWith('/*') ||
              currentLine.startsWith('*')) {
            newLines.push(lines[j]);
          } else {
            console.log(`🗑️ Eliminando fragmento suelto línea ${j + 1}: ${currentLine.substring(0, 50)}${currentLine.length > 50 ? '...' : ''}`);
            corrections++;
          }
        }
        
        // Agregar el resto del archivo
        for (let j = i; j < lines.length; j++) {
          newLines.push(lines[j]);
        }
        
        lines.length = 0;
        lines.push(...newLines);
        break;
      }
    }
  }
  
  // Reconstruir contenido
  content = lines.join('\n');
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);
  
  console.log('\n✅ LIMPIEZA COMPLETADA');
  console.log('──────────────────────────────');
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  console.log(`📊 Líneas finales: ${lines.length}`);
  
  if (corrections > 0) {
    console.log('\n🎉 Se eliminaron fragmentos sueltos');
  } else {
    console.log('\n⚠️ No se encontraron fragmentos para eliminar');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 