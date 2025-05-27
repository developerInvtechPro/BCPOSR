#!/usr/bin/env node

/**
 * Script para corregir error 500 del servidor
 */

const fs = require('fs');

console.log('🔧 CORRIGIENDO ERROR 500 DEL SERVIDOR');
console.log('=====================================\n');

const filePath = 'src/pages/index.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`📖 Archivo leído: ${(content.length / 1024).toFixed(1)} KB`);
  
  // Crear backup
  const backupPath = `${filePath}.backup.error500.${Date.now()}`;
  fs.writeFileSync(backupPath, content);
  console.log(`💾 Backup creado: ${backupPath}`);
  
  let corrections = 0;

  // 1. Buscar y corregir problemas con Paper sin cerrar
  console.log('🔍 Buscando elementos JSX sin cerrar...');
  
  // Buscar Paper sin cerrar
  const paperPattern = /<Paper[^>]*>(?![^<]*<\/Paper>)/g;
  const paperMatches = content.match(paperPattern);
  if (paperMatches) {
    console.log(`⚠️ Encontrados ${paperMatches.length} elementos Paper potencialmente sin cerrar`);
  }

  // 2. Corregir declaraciones duplicadas de openSuper
  console.log('🔍 Eliminando declaraciones duplicadas de openSuper...');
  
  const lines = content.split('\n');
  let foundOpenSuper = false;
  const fixedLines = lines.map((line, index) => {
    if (line.trim().includes('const [openSuper, setOpenSuper] = useState(false);')) {
      if (!foundOpenSuper) {
        foundOpenSuper = true;
        console.log(`✅ Manteniendo primera declaración de openSuper en línea ${index + 1}`);
        return line;
      } else {
        console.log(`❌ Eliminando declaración duplicada de openSuper en línea ${index + 1}`);
        corrections++;
        return ''; // Eliminar línea duplicada
      }
    }
    return line;
  });

  content = fixedLines.join('\n');

  // 3. Corregir problemas con useEffect duplicados
  console.log('🔍 Limpiando useEffect duplicados...');
  
  // Eliminar líneas con solo punto y coma
  content = content.replace(/^\s*;\s*$/gm, '');
  corrections++;

  // 4. Verificar balance de llaves y paréntesis
  console.log('🔍 Verificando balance de símbolos...');
  
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log(`📊 Llaves: ${openBraces} abiertas, ${closeBraces} cerradas`);
  console.log(`📊 Paréntesis: ${openParens} abiertos, ${closeParens} cerrados`);
  
  if (openBraces !== closeBraces) {
    console.log(`⚠️ Desbalance de llaves: ${openBraces - closeBraces}`);
  }
  
  if (openParens !== closeParens) {
    console.log(`⚠️ Desbalance de paréntesis: ${openParens - closeParens}`);
  }

  // 5. Limpiar líneas vacías excesivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, content);

  console.log('\n✅ CORRECCIONES APLICADAS');
  console.log('─'.repeat(30));
  console.log(`📊 Total correcciones: ${corrections}`);
  console.log(`📊 Tamaño final: ${(content.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🚀 Reiniciando servidor...');
  
  // Ejecutar reinicio automático
  const { exec } = require('child_process');
  exec('npm run bc:restart', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error reiniciando:', error);
    } else {
      console.log('✅ Servidor reiniciado');
      console.log(stdout);
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 