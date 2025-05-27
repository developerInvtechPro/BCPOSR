#!/usr/bin/env node

/**
 * Script simple para corregir errores específicos de sintaxis
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO ERRORES DE SINTAXIS ESPECÍFICOS');
console.log('==============================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // 1. Eliminar funciones duplicadas de descargarProductosBusinessCentral
  console.log('🔍 Eliminando funciones duplicadas...');
  
  // Buscar todas las ocurrencias de la función
  const funcionPattern = /\/\/ NUEVA FUNCIÓN: Descargar productos desde Business Central\s*\n\s*const descargarProductosBusinessCentral = async \(\) => \{[\s\S]*?\n\s*\};\s*\n/g;
  const matches = content.match(funcionPattern);
  
  if (matches && matches.length > 1) {
    console.log(`❌ Encontradas ${matches.length} funciones duplicadas de descargarProductosBusinessCentral`);
    
    // Mantener solo la primera ocurrencia
    let firstFound = false;
    content = content.replace(funcionPattern, (match) => {
      if (!firstFound) {
        firstFound = true;
        console.log('✅ Manteniendo primera función descargarProductosBusinessCentral');
        return match;
      } else {
        corrections++;
        console.log('❌ Eliminando función duplicada descargarProductosBusinessCentral');
        return '';
      }
    });
  }

  // 2. Eliminar funciones duplicadas de cargarProductosBusinessCentral
  const funcionPattern2 = /\/\/ NUEVA FUNCIÓN: Cargar productos guardados de Business Central\s*\n\s*const cargarProductosBusinessCentral = \(\) => \{[\s\S]*?\n\s*\};\s*\n/g;
  const matches2 = content.match(funcionPattern2);
  
  if (matches2 && matches2.length > 1) {
    console.log(`❌ Encontradas ${matches2.length} funciones duplicadas de cargarProductosBusinessCentral`);
    
    // Mantener solo la primera ocurrencia
    let firstFound2 = false;
    content = content.replace(funcionPattern2, (match) => {
      if (!firstFound2) {
        firstFound2 = true;
        console.log('✅ Manteniendo primera función cargarProductosBusinessCentral');
        return match;
      } else {
        corrections++;
        console.log('❌ Eliminando función duplicada cargarProductosBusinessCentral');
        return '';
      }
    });
  }

  // 3. Corregir setCatalogoProductos por catalogoProductos
  console.log('🔍 Corrigiendo setCatalogoProductos...');
  const setCatalogoPattern = /setCatalogoProductos\(/g;
  if (content.match(setCatalogoPattern)) {
    content = content.replace(setCatalogoPattern, 'setCatalogoProductos(');
    console.log('⚠️ setCatalogoProductos encontrado - necesita ser definido como estado');
  }

  // 4. Eliminar líneas vacías excesivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  if (corrections > 0) {
    console.log('\n🎉 ¡Errores corregidos exitosamente!');
  } else {
    console.log('\n📝 No se encontraron errores para corregir');
  }
  
  console.log('\n🚀 Reinicie el servidor: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 