const fs = require('fs');
const path = require('path');

console.log('🍽️ AGREGANDO BOTÓN DE COMANDA AL SISTEMA PRINCIPAL');
console.log('================================================');

const indexPath = path.join(__dirname, '..', 'src', 'pages', 'index.tsx');

try {
  // Leer el archivo principal
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Verificar si ya existe el botón de comanda
  if (content.includes('Comanda Cocina') || content.includes('/comanda')) {
    console.log('✅ El botón de comanda ya existe en el sistema');
    return;
  }
  
  console.log('📖 Leyendo archivo principal...');
  
  // Buscar el lugar donde agregar el botón (después del botón SUPER)
  const superButtonPattern = /(<Button[^>]*onClick=\{[^}]*setOpenSuper[^}]*\}[^>]*>[\s\S]*?SUPER[\s\S]*?<\/Button>)/;
  
  if (!superButtonPattern.test(content)) {
    console.log('❌ No se encontró el botón SUPER para agregar el botón de comanda');
    return;
  }
  
  // Código del botón de comanda
  const comandaButton = `
              {/* Botón Comanda Cocina */}
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: '#ff6b35', 
                  color: 'white',
                  minWidth: 120,
                  '&:hover': { bgcolor: '#e55a2b' }
                }}
                onClick={() => {
                  // Abrir comanda en nueva ventana
                  const comandaWindow = window.open('/comanda', 'comanda', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                  if (comandaWindow) {
                    comandaWindow.focus();
                  } else {
                    // Fallback si no se puede abrir ventana
                    window.open('/comanda', '_blank');
                  }
                }}
                title="Abrir Comanda Digital para Cocina"
              >
                🍽️ Comanda Cocina
              </Button>`;
  
  // Insertar el botón después del botón SUPER
  content = content.replace(superButtonPattern, (match) => {
    return match + comandaButton;
  });
  
  // Escribir el archivo modificado
  fs.writeFileSync(indexPath, content, 'utf8');
  
  console.log('✅ Botón de comanda agregado exitosamente');
  console.log('');
  console.log('📋 Instrucciones:');
  console.log('1. Reinicia el servidor: npm run dev');
  console.log('2. Busca el botón "🍽️ Comanda Cocina" en la interfaz principal');
  console.log('3. Haz clic para abrir la comanda en una nueva ventana');
  console.log('4. Ideal para usar en una tablet o monitor dedicado');
  console.log('');
  console.log('🌐 También puedes acceder directamente a: http://localhost:3000/comanda');
  
} catch (error) {
  console.error('❌ Error agregando botón de comanda:', error.message);
  
  console.log('');
  console.log('🔧 Solución manual:');
  console.log('1. Abre src/pages/index.tsx');
  console.log('2. Busca el botón "SUPER"');
  console.log('3. Agrega este código después:');
  console.log(`
<Button
  variant="contained"
  sx={{ 
    bgcolor: '#ff6b35', 
    color: 'white',
    minWidth: 120,
    '&:hover': { bgcolor: '#e55a2b' }
  }}
  onClick={() => window.open('/comanda', '_blank')}
>
  🍽️ Comanda Cocina
</Button>
  `);
} 