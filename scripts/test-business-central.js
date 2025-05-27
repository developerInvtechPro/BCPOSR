#!/usr/bin/env node

const axios = require('axios');

// Configuración de prueba - CAMBIAR ESTOS VALORES
const CONFIG = {
  baseUrl: 'https://api.businesscentral.dynamics.com',
  tenantId: 'YOUR_TENANT_ID',
  companyId: 'YOUR_COMPANY_ID',
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  environment: 'sandbox', // sandbox | production
};

async function testBusinessCentralConnection() {
  console.log('🔄 Probando conexión con Business Central...\n');

  try {
    // Configurar cliente API
    const api = axios.create({
      baseURL: `${CONFIG.baseUrl}/api/v2.0/${CONFIG.tenantId}/${CONFIG.environment}/companies(${CONFIG.companyId})`,
      auth: {
        username: CONFIG.username,
        password: CONFIG.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    console.log('📡 Configuración:');
    console.log(`   URL: ${CONFIG.baseUrl}`);
    console.log(`   Tenant: ${CONFIG.tenantId}`);
    console.log(`   Company: ${CONFIG.companyId}`);
    console.log(`   Environment: ${CONFIG.environment}`);
    console.log(`   Username: ${CONFIG.username}\n`);

    // Test 1: Verificar acceso a compañía
    console.log('✅ Test 1: Acceso a compañía...');
    const companyResponse = await api.get('/');
    console.log(`   ✓ Compañía: ${companyResponse.data.displayName || companyResponse.data.name}`);

    // Test 2: Verificar acceso a items
    console.log('✅ Test 2: Acceso a items...');
    const itemsResponse = await api.get('/items?$top=5');
    console.log(`   ✓ Items encontrados: ${itemsResponse.data.value?.length || 0}`);
    if (itemsResponse.data.value?.length > 0) {
      console.log(`   ✓ Primer item: ${itemsResponse.data.value[0].displayName}`);
    }

    // Test 3: Verificar acceso a clientes
    console.log('✅ Test 3: Acceso a clientes...');
    const customersResponse = await api.get('/customers?$top=5');
    console.log(`   ✓ Clientes encontrados: ${customersResponse.data.value?.length || 0}`);

    // Test 4: Verificar medios de pago
    console.log('✅ Test 4: Acceso a medios de pago...');
    try {
      const paymentResponse = await api.get('/paymentMethods?$top=5');
      console.log(`   ✓ Medios de pago: ${paymentResponse.data.value?.length || 0}`);
    } catch (error) {
      console.log('   ⚠️ Medios de pago no disponibles (puede ser normal)');
    }

    // Test 5: Verificar permisos de escritura (crear invoice borrador)
    console.log('✅ Test 5: Permisos de escritura...');
    try {
      const testInvoice = {
        customerNumber: '10000', // Cliente genérico
        invoiceDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        salesLines: []
      };
      
      const invoiceResponse = await api.post('/salesInvoices', testInvoice);
      console.log('   ✓ Permisos de escritura: OK');
      
      // Limpiar: eliminar el invoice de prueba
      await api.delete(`/salesInvoices(${invoiceResponse.data.id})`);
      console.log('   ✓ Invoice de prueba eliminado');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ❌ Sin permisos de escritura');
      } else {
        console.log('   ⚠️ Error en prueba de escritura (revisar datos)');
      }
    }

    console.log('\n🎉 ¡Conexión exitosa con Business Central!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Actualizar configuración en el POS');
    console.log('   2. Configurar códigos de sucursal');
    console.log('   3. Activar sincronización automática');

  } catch (error) {
    console.error('\n❌ Error de conexión:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${error.response.data?.error?.message || error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.error('\n🔑 Problema de autenticación:');
        console.error('   - Verificar usuario y contraseña');
        console.error('   - Verificar permisos del usuario en BC');
      } else if (error.response.status === 404) {
        console.error('\n🎯 Problema de configuración:');
        console.error('   - Verificar Tenant ID');
        console.error('   - Verificar Company ID');
        console.error('   - Verificar ambiente (sandbox/production)');
      }
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🌐 Problema de red:');
      console.error('   - Verificar conexión a internet');
      console.error('   - Verificar URL base');
      console.error('   - Verificar firewall/proxy');
    } else {
      console.error(`   ${error.message}`);
    }

    console.error('\n📚 Recursos útiles:');
    console.error('   - Documentación: https://docs.microsoft.com/dynamics365/business-central/');
    console.error('   - API Reference: https://docs.microsoft.com/dynamics365/business-central/dev-itpro/api-reference/v2.0/');
    
    process.exit(1);
  }
}

// Ejecutar prueba
if (require.main === module) {
  // Verificar configuración
  if (CONFIG.tenantId === 'YOUR_TENANT_ID') {
    console.error('❌ Por favor actualiza la configuración en scripts/test-business-central.js');
    console.error('\n📝 Configuración requerida:');
    console.error('   - tenantId: Tu Tenant ID de Business Central');
    console.error('   - companyId: Tu Company ID');
    console.error('   - username: Usuario con permisos de API');
    console.error('   - password: Contraseña del usuario');
    process.exit(1);
  }

  testBusinessCentralConnection();
}

module.exports = { testBusinessCentralConnection }; 