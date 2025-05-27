#!/usr/bin/env node

/**
 * Script específico para corregir errores de sintaxis en index.tsx
 * Corrige problemas específicos identificados en los logs de error
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ==============================================');
console.log('🛠️  CORRIGIENDO ERRORES ESPECÍFICOS DE SINTAXIS');
console.log('🔧 ==============================================\n');

const filePath = 'src/pages/index.tsx';

try {
  // Leer el archivo
  console.log('📖 Leyendo archivo:', filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📊 Tamaño del archivo: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  // Correcciones específicas
  let fixedContent = content;
  let corrections = 0;
  
  // 1. Eliminar declaraciones duplicadas de openSuper
  const openSuperRegex = /const \[openSuper, setOpenSuper\] = useState\(false\);/g;
  const matches = fixedContent.match(openSuperRegex);
  if (matches && matches.length > 1) {
    console.log(`🔍 Encontradas ${matches.length} declaraciones duplicadas de openSuper`);
    // Mantener solo la primera declaración
    let firstFound = false;
    fixedContent = fixedContent.replace(openSuperRegex, (match) => {
      if (!firstFound) {
        firstFound = true;
        return match;
      } else {
        corrections++;
        console.log(`❌ Eliminando declaración duplicada: ${match}`);
        return '';
      }
    });
  }
  
  // 2. Corregir problemas de JSX mal formateado
  // Buscar y corregir fragmentos JSX problemáticos
  const jsxProblems = [
    // Problema con <> sin cierre correcto
    {
      pattern: /return \(\s*<>\s*<Head>/g,
      replacement: 'return (\n    <>\n      <Head>'
    },
    // Problema con Box sin props correctas
    {
      pattern: /return \(\s*<Box sx=\{/g,
      replacement: 'return (\n    <Box sx={'
    }
  ];
  
  jsxProblems.forEach((problem, index) => {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(problem.pattern, problem.replacement);
    const afterLength = fixedContent.length;
    if (beforeLength !== afterLength) {
      corrections++;
      console.log(`✅ Corrección JSX ${index + 1} aplicada`);
    }
  });
  
  // 3. Verificar y corregir estructura de componentes
  // Asegurar que todos los return statements estén bien formateados
  const returnStatements = fixedContent.match(/return \(/g);
  console.log(`📊 Return statements encontrados: ${returnStatements ? returnStatements.length : 0}`);
  
  // 4. Limpiar líneas vacías excesivas y espacios
  fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // 5. Verificar balance de llaves y paréntesis
  const openBraces = (fixedContent.match(/\{/g) || []).length;
  const closeBraces = (fixedContent.match(/\}/g) || []).length;
  const openParens = (fixedContent.match(/\(/g) || []).length;
  const closeParens = (fixedContent.match(/\)/g) || []).length;
  
  console.log(`📊 Balance de símbolos:`);
  console.log(`   Llaves: ${openBraces} abiertas, ${closeBraces} cerradas (${openBraces === closeBraces ? '✅' : '❌'})`);
  console.log(`   Paréntesis: ${openParens} abiertos, ${closeParens} cerrados (${openParens === closeParens ? '✅' : '❌'})`);
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, fixedContent);
  
  console.log('\n✅ ARCHIVO CORREGIDO EXITOSAMENTE');
  console.log('─'.repeat(50));
  console.log(`📊 Correcciones aplicadas: ${corrections}`);
  console.log(`📊 Tamaño final: ${(fixedContent.length / 1024).toFixed(1)} KB`);
  
  if (corrections > 0) {
    console.log('\n🎉 ¡ERRORES CORREGIDOS!');
  } else {
    console.log('\n📝 No se encontraron errores específicos para corregir');
  }
  
  console.log('🔄 Reinicie el servidor con: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 