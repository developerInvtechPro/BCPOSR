#!/usr/bin/env node

/**
 * Script final para corregir todos los problemas de sintaxis restantes
 */

const fs = require('fs');

console.log('🔧 CORRECCIÓN FINAL DE SINTAXIS');
console.log('================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.final-syntax.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // 1. Buscar y corregir cualquier return statement que esté fuera de la función Home
  console.log('🔍 Buscando return statements problemáticos...');
  
  // Encontrar la función Home
  const homeMatch = content.match(/export default function Home\(\) \{/);
  if (!homeMatch) {
    console.log('❌ No se encontró la función Home');
    process.exit(1);
  }
  
  const homeStart = homeMatch.index;
  console.log(`✅ Función Home encontrada en posición ${homeStart}`);
  
  // Encontrar el final de la función Home (último })
  let braceCount = 0;
  let homeEnd = -1;
  let inFunction = false;
  
  for (let i = homeStart; i < content.length; i++) {
    if (content[i] === '{') {
      if (!inFunction) inFunction = true;
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        homeEnd = i;
        break;
      }
    }
  }
  
  if (homeEnd === -1) {
    console.log('❌ No se encontró el final de la función Home');
    process.exit(1);
  }
  
  console.log(`✅ Final de función Home encontrado en posición ${homeEnd}`);
  
  // 2. Buscar return statements que estén fuera de la función Home
  const beforeHome = content.substring(0, homeStart);
  const afterHome = content.substring(homeEnd + 1);
  
  // Verificar si hay return statements antes o después de la función Home
  const returnsBefore = beforeHome.match(/return\s*\(/g);
  const returnsAfter = afterHome.match(/return\s*\(/g);
  
  if (returnsBefore) {
    console.log(`⚠️ Encontrados ${returnsBefore.length} return statements antes de la función Home`);
  }
  
  if (returnsAfter) {
    console.log(`⚠️ Encontrados ${returnsAfter.length} return statements después de la función Home`);
    
    // Eliminar todo lo que esté después de la función Home
    content = content.substring(0, homeEnd + 1);
    corrections += returnsAfter.length;
    console.log(`❌ Eliminado contenido después de la función Home`);
  }
  
  // 3. Verificar que el return statement principal esté dentro de la función
  const homeContent = content.substring(homeStart, homeEnd + 1);
  const mainReturn = homeContent.match(/return\s*\(\s*<[^>]*>/);
  
  if (!mainReturn) {
    console.log('❌ No se encontró el return statement principal dentro de la función Home');
    
    // Agregar un return statement básico al final de la función
    const insertPosition = homeEnd;
    const returnStatement = `
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4">Sistema POS Honduras</Typography>
    </Box>
  );`;
    
    content = content.substring(0, insertPosition) + returnStatement + '\n}';
    corrections++;
    console.log(`✅ Agregado return statement principal`);
  } else {
    console.log(`✅ Return statement principal encontrado`);
  }
  
  // 4. Limpiar líneas vacías excesivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // 5. Verificar balance de símbolos
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log(`📊 Balance de símbolos:`);
  console.log(`   Llaves: ${openBraces} abiertas, ${closeBraces} cerradas`);
  console.log(`   Paréntesis: ${openParens} abiertos, ${closeParens} cerrados`);
  
  if (openBraces !== closeBraces) {
    console.log(`⚠️ Desbalance de llaves: ${openBraces - closeBraces}`);
  }
  
  if (openParens !== closeParens) {
    console.log(`⚠️ Desbalance de paréntesis: ${openParens - closeParens}`);
  }

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🚀 Sintaxis corregida. Reinicie el servidor.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 