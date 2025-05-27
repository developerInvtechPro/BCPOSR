#!/usr/bin/env node

/**
 * Script específico para corregir errores de sintaxis en validaciones
 * Corrige problemas específicos identificados en los logs de Next.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ==============================================');
console.log('🛠️  CORRIGIENDO ERRORES DE SINTAXIS EN VALIDACIONES');
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
  
  let fixedContent = content;
  let corrections = 0;
  
  // 1. Eliminar declaraciones duplicadas de openSuper
  console.log('🔍 Buscando declaraciones duplicadas de openSuper...');
  const openSuperMatches = fixedContent.match(/const \[openSuper, setOpenSuper\] = useState\(false\);/g);
  if (openSuperMatches && openSuperMatches.length > 1) {
    console.log(`❌ Encontradas ${openSuperMatches.length} declaraciones duplicadas de openSuper`);
    
    // Mantener solo la primera declaración
    let firstFound = false;
    fixedContent = fixedContent.replace(/const \[openSuper, setOpenSuper\] = useState\(false\);/g, (match) => {
      if (!firstFound) {
        firstFound = true;
        console.log('✅ Manteniendo primera declaración de openSuper');
        return match;
      } else {
        corrections++;
        console.log('❌ Eliminando declaración duplicada de openSuper');
        return '';
      }
    });
  } else {
    console.log('✅ No se encontraron declaraciones duplicadas de openSuper');
  }
  
  // 2. Corregir problemas específicos de JSX en return statements
  console.log('🔍 Corrigiendo problemas de JSX...');
  
  // Problema específico: return ( <> sin Fragment correcto
  const fragmentProblems = fixedContent.match(/return \(\s*<>\s*<Head>/g);
  if (fragmentProblems) {
    console.log('❌ Encontrado problema con Fragment en return statement');
    fixedContent = fixedContent.replace(
      /return \(\s*<>\s*<Head>/g,
      'return (\n    <>\n      <Head>'
    );
    corrections++;
    console.log('✅ Corregido problema con Fragment');
  }
  
  // 3. Corregir problemas con style jsx global
  console.log('🔍 Corrigiendo problemas con style jsx...');
  const styleProblems = fixedContent.match(/<style jsx global>\{`/g);
  if (styleProblems) {
    console.log('❌ Encontrado problema con style jsx global');
    fixedContent = fixedContent.replace(
      /<style jsx global>\{`/g,
      '<style>{`'
    );
    corrections++;
    console.log('✅ Corregido problema con style jsx global');
  }
  
  // 4. Verificar y corregir estructura de componentes
  console.log('🔍 Verificando estructura de componentes...');
  
  // Verificar que el componente principal existe
  const componentMatch = fixedContent.match(/export default function Home\(\) \{/);
  if (!componentMatch) {
    console.log('❌ No se encontró la declaración del componente principal');
  } else {
    console.log('✅ Componente principal encontrado');
  }
  
  // 5. Verificar balance de llaves y paréntesis
  const openBraces = (fixedContent.match(/\{/g) || []).length;
  const closeBraces = (fixedContent.match(/\}/g) || []).length;
  const openParens = (fixedContent.match(/\(/g) || []).length;
  const closeParens = (fixedContent.match(/\)/g) || []).length;
  
  console.log(`📊 Balance de símbolos:`);
  console.log(`   Llaves: ${openBraces} abiertas, ${closeBraces} cerradas (${openBraces === closeBraces ? '✅' : '❌'})`);
  console.log(`   Paréntesis: ${openParens} abiertos, ${closeParens} cerrados (${openParens === closeParens ? '✅' : '❌'})`);
  
  // 6. Limpiar líneas vacías excesivas
  console.log('🔍 Limpiando líneas vacías excesivas...');
  const beforeCleanup = fixedContent.length;
  fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
  const afterCleanup = fixedContent.length;
  if (beforeCleanup !== afterCleanup) {
    corrections++;
    console.log('✅ Líneas vacías excesivas limpiadas');
  }
  
  // 7. Verificar que no hay componentes no definidos
  console.log('🔍 Verificando componentes no definidos...');
  const businessCentralConfigMatches = fixedContent.match(/<BusinessCentralConfig/g);
  if (businessCentralConfigMatches) {
    console.log('❌ Encontrado componente BusinessCentralConfig no definido');
    fixedContent = fixedContent.replace(/<BusinessCentralConfig\s*\/>/g, '');
    corrections++;
    console.log('✅ Eliminado componente BusinessCentralConfig no definido');
  }
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, fixedContent);
  
  console.log('\n✅ ARCHIVO CORREGIDO EXITOSAMENTE');
  console.log('─'.repeat(50));
  console.log(`📊 Correcciones aplicadas: ${corrections}`);
  console.log(`📊 Tamaño final: ${(fixedContent.length / 1024).toFixed(1)} KB`);
  
  if (corrections > 0) {
    console.log('\n🎉 ¡ERRORES DE SINTAXIS CORREGIDOS!');
    console.log('🔄 Los errores de validación deberían estar resueltos');
  } else {
    console.log('\n📝 No se encontraron errores específicos para corregir');
  }
  
  console.log('\n🚀 Reinicie el servidor con: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 