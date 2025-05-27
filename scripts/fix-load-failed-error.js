#!/usr/bin/env node

/**
 * Script específico para corregir el error "Load failed" en Business Central
 * Identifica y corrige problemas específicos que causan este error
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ==============================================');
console.log('🛠️  CORRIGIENDO ERROR "LOAD FAILED"');
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
  
  // 1. Verificar y corregir imports de Head
  if (!fixedContent.includes("import Head from 'next/head'")) {
    console.log('🔍 Agregando import de Head');
    fixedContent = fixedContent.replace(
      "import { useState, useEffect } from 'react';",
      "import { useState, useEffect } from 'react';\nimport Head from 'next/head';"
    );
    corrections++;
  }
  
  // 2. Corregir problemas específicos de JSX
  const jsxFixes = [
    // Problema con Head y style jsx
    {
      pattern: /<Head>\s*<style jsx global>\{`/g,
      replacement: '<Head>\n        <style>{`'
    },
    // Problema con cierre de style
    {
      pattern: /`\}<\/style>\s*<\/Head>/g,
      replacement: '`}</style>\n      </Head>'
    },
    // Asegurar que Box tiene importación correcta
    {
      pattern: /return \(\s*<Box sx=\{\{/g,
      replacement: 'return (\n    <Box sx={{'
    }
  ];
  
  jsxFixes.forEach((fix, index) => {
    const beforeLength = fixedContent.length;
    fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
    const afterLength = fixedContent.length;
    if (beforeLength !== afterLength) {
      corrections++;
      console.log(`✅ Corrección JSX ${index + 1} aplicada`);
    }
  });
  
  // 3. Verificar que todos los componentes de MUI están importados
  const requiredImports = [
    'Box',
    'Grid', 
    'Button',
    'Typography',
    'Dialog',
    'DialogTitle',
    'DialogContent',
    'Paper',
    'TextField',
    'Tabs',
    'Tab',
    'Snackbar',
    'Alert'
  ];
  
  const importLine = fixedContent.match(/import \{[^}]+\} from '@mui\/material';/);
  if (importLine) {
    const currentImports = importLine[0];
    let needsUpdate = false;
    let newImports = currentImports;
    
    requiredImports.forEach(component => {
      if (!currentImports.includes(component)) {
        console.log(`🔍 Agregando import faltante: ${component}`);
        newImports = newImports.replace('} from', `, ${component}} from`);
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      fixedContent = fixedContent.replace(currentImports, newImports);
      corrections++;
    }
  }
  
  // 4. Verificar estructura del componente principal
  const componentMatch = fixedContent.match(/export default function Home\(\) \{/);
  if (!componentMatch) {
    console.log('❌ No se encontró la declaración del componente principal');
  } else {
    console.log('✅ Componente principal encontrado');
  }
  
  // 5. Verificar que el return statement está bien formateado
  const returnMatch = fixedContent.match(/return \(\s*<Box/);
  if (!returnMatch) {
    console.log('❌ Return statement principal no encontrado o mal formateado');
    // Intentar corregir
    fixedContent = fixedContent.replace(
      /return \(\s*<>/,
      'return (\n    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>'
    );
    corrections++;
  } else {
    console.log('✅ Return statement principal encontrado');
  }
  
  // 6. Verificar balance de llaves y paréntesis
  const openBraces = (fixedContent.match(/\{/g) || []).length;
  const closeBraces = (fixedContent.match(/\}/g) || []).length;
  const openParens = (fixedContent.match(/\(/g) || []).length;
  const closeParens = (fixedContent.match(/\)/g) || []).length;
  
  console.log(`📊 Balance de símbolos:`);
  console.log(`   Llaves: ${openBraces} abiertas, ${closeBraces} cerradas (${openBraces === closeBraces ? '✅' : '❌'})`);
  console.log(`   Paréntesis: ${openParens} abiertos, ${closeParens} cerrados (${openParens === closeParens ? '✅' : '❌'})`);
  
  // 7. Limpiar líneas problemáticas específicas
  const problematicLines = [
    /^\s*<BusinessCentralConfig\s*\/>\s*$/gm,
    /^\s*const \[openSuper, setOpenSuper\] = useState\(false\);\s*$/gm
  ];
  
  problematicLines.forEach((pattern, index) => {
    const matches = fixedContent.match(pattern);
    if (matches && matches.length > 1) {
      console.log(`🔍 Eliminando líneas duplicadas (patrón ${index + 1})`);
      let firstFound = false;
      fixedContent = fixedContent.replace(pattern, (match) => {
        if (!firstFound) {
          firstFound = true;
          return match;
        } else {
          corrections++;
          return '';
        }
      });
    }
  });
  
  // Escribir archivo corregido
  fs.writeFileSync(filePath, fixedContent);
  
  console.log('\n✅ ARCHIVO CORREGIDO EXITOSAMENTE');
  console.log('─'.repeat(50));
  console.log(`📊 Correcciones aplicadas: ${corrections}`);
  console.log(`📊 Tamaño final: ${(fixedContent.length / 1024).toFixed(1)} KB`);
  
  if (corrections > 0) {
    console.log('\n🎉 ¡ERRORES CORREGIDOS!');
    console.log('🔄 El error "Load failed" debería estar resuelto');
  } else {
    console.log('\n📝 No se encontraron errores específicos para corregir');
    console.log('💡 El error puede estar en otro lugar del código');
  }
  
  console.log('\n🚀 Reinicie el servidor con: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 