#!/usr/bin/env node

/**
 * Script para corregir errores de sintaxis y agregar funcionalidad de descarga de productos desde Business Central
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ==============================================');
console.log('🛠️  CORRIGIENDO ERRORES Y AGREGANDO PRODUCTOS BC');
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

  // 1. Eliminar declaración duplicada de openSuper en línea 2061
  console.log('🔍 Corrigiendo declaración duplicada de openSuper...');
  const lines = fixedContent.split('\n');
  
  // Buscar y eliminar la línea duplicada específica
  let foundFirstOpenSuper = false;
  const fixedLines = lines.map((line, index) => {
    if (line.trim() === 'const [openSuper, setOpenSuper] = useState(false);') {
      if (!foundFirstOpenSuper) {
        foundFirstOpenSuper = true;
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

  fixedContent = fixedLines.join('\n');

  // 2. Agregar función para descargar productos desde Business Central
  console.log('🔍 Agregando función para descargar productos desde Business Central...');
  
  const funcionDescargarProductos = `
  // NUEVA FUNCIÓN: Descargar productos desde Business Central
  const descargarProductosBusinessCentral = async () => {
    if (!configuracionBusinessCentral.habilitado) {
      mostrarNotificacion('❌ Business Central no está configurado', 'error');
      return;
    }

    try {
      mostrarNotificacion('🔄 Descargando productos desde Business Central...', 'info');

      // Paso 1: Obtener token OAuth 2.0
      const tokenUrl = \`https://login.microsoftonline.com/\${configuracionBusinessCentral.tenantId}/oauth2/v2.0/token\`;
      
      const tokenData = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': configuracionBusinessCentral.username, // Client ID
        'client_secret': configuracionBusinessCentral.password, // Client Secret
        'scope': 'https://api.businesscentral.dynamics.com/.default'
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenData
      });

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error('Error obteniendo token:', tokenResponse.status, tokenError);
        mostrarNotificacion(\`❌ Error de autenticación: \${tokenResponse.status}\`, 'error');
        return;
      }

      const tokenResult = await tokenResponse.json();
      const accessToken = tokenResult.access_token;

      // Paso 2: Obtener productos (items) desde Business Central
      const baseUrl = configuracionBusinessCentral.baseUrl || 'https://api.businesscentral.dynamics.com';
      const itemsUrl = \`\${baseUrl}/v2.0/\${configuracionBusinessCentral.tenantId}/\${configuracionBusinessCentral.environment}/api/v2.0/companies(\${configuracionBusinessCentral.companyId})/items\`;

      const itemsResponse = await fetch(itemsUrl, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        console.log('Productos obtenidos desde Business Central:', itemsData);
        
        if (itemsData.value && itemsData.value.length > 0) {
          // Convertir productos de Business Central al formato del POS
          const productosBC = itemsData.value.map((item: any) => ({
            codigo: item.number || item.id,
            nombre: item.displayName || item.description || 'Producto sin nombre',
            categoria: item.itemCategoryCode || 'General',
            precio: item.unitPrice || 0,
            descripcion: item.description || '',
            inventario: item.inventory || 0,
            activo: !item.blocked,
            origen: 'business_central'
          }));

          // Actualizar catálogo de productos
          setCatalogoProductos(prev => {
            // Eliminar productos anteriores de Business Central
            const productosSinBC = prev.filter(p => p.origen !== 'business_central');
            // Agregar nuevos productos de Business Central
            return [...productosSinBC, ...productosBC];
          });

          mostrarNotificacion(\`✅ \${productosBC.length} productos descargados desde Business Central\`, 'success');
          
          // Guardar en localStorage para persistencia
          localStorage.setItem('productos_business_central', JSON.stringify(productosBC));
          localStorage.setItem('ultima_sincronizacion_productos', new Date().toISOString());
          
        } else {
          mostrarNotificacion('⚠️ No se encontraron productos en Business Central', 'warning');
        }
      } else {
        const errorText = await itemsResponse.text();
        console.error('Error obteniendo productos:', itemsResponse.status, errorText);
        mostrarNotificacion(\`❌ Error obteniendo productos: \${itemsResponse.status}\`, 'error');
      }
    } catch (error: any) {
      console.error('Error descargando productos:', error);
      mostrarNotificacion(\`❌ Error: \${error.message}\`, 'error');
    }
  };

  // NUEVA FUNCIÓN: Cargar productos guardados de Business Central
  const cargarProductosBusinessCentral = () => {
    try {
      const productosGuardados = localStorage.getItem('productos_business_central');
      if (productosGuardados) {
        const productos = JSON.parse(productosGuardados);
        setCatalogoProductos(prev => {
          const productosSinBC = prev.filter(p => p.origen !== 'business_central');
          return [...productosSinBC, ...productos];
        });
        
        const ultimaSincronizacion = localStorage.getItem('ultima_sincronizacion_productos');
        if (ultimaSincronizacion) {
          const fecha = new Date(ultimaSincronizacion).toLocaleString();
          mostrarNotificacion(\`📦 \${productos.length} productos cargados desde Business Central (última sincronización: \${fecha})\`, 'info');
        }
      }
    } catch (error) {
      console.error('Error cargando productos guardados:', error);
    }
  };`;

  // Buscar donde insertar la función (después de la función probarConexionBusinessCentral)
  const insertPosition = fixedContent.indexOf('const ejecutarTestPostmanBusinessCentral = async () => {');
  if (insertPosition !== -1) {
    fixedContent = fixedContent.slice(0, insertPosition) + funcionDescargarProductos + '\n\n  ' + fixedContent.slice(insertPosition);
    corrections++;
    console.log('✅ Función de descarga de productos agregada');
  }

  // 3. Agregar useEffect para cargar productos al iniciar
  console.log('🔍 Agregando useEffect para cargar productos...');
  
  const useEffectProductos = `
  // Cargar productos de Business Central al iniciar
  useEffect(() => {
    cargarProductosBusinessCentral();
  }, []);`;

  // Buscar donde insertar el useEffect (después de otros useEffect)
  const useEffectPosition = fixedContent.indexOf('}, []);') + 6;
  if (useEffectPosition > 5) {
    fixedContent = fixedContent.slice(0, useEffectPosition) + useEffectProductos + '\n' + fixedContent.slice(useEffectPosition);
    corrections++;
    console.log('✅ useEffect para cargar productos agregado');
  }

  // 4. Limpiar líneas vacías excesivas
  console.log('🔍 Limpiando líneas vacías excesivas...');
  fixedContent = fixedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Escribir archivo corregido
  fs.writeFileSync(filePath, fixedContent);

  console.log('\n✅ ARCHIVO CORREGIDO Y MEJORADO EXITOSAMENTE');
  console.log('─'.repeat(50));
  console.log(`📊 Correcciones aplicadas: ${corrections}`);
  console.log(`📊 Tamaño final: ${(fixedContent.length / 1024).toFixed(1)} KB`);
  
  console.log('\n🎉 ¡FUNCIONALIDADES AGREGADAS!');
  console.log('📦 Descarga de productos desde Business Central');
  console.log('💾 Persistencia de productos en localStorage');
  console.log('🔄 Carga automática al iniciar la aplicación');
  
  console.log('\n🚀 Para usar la nueva funcionalidad:');
  console.log('1. Ir a SUPER → Business Central');
  console.log('2. Configurar credenciales');
  console.log('3. Hacer clic en "📦 Descargar Productos"');
  
  console.log('\n🔄 Reinicie el servidor con: npm run dev');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} 