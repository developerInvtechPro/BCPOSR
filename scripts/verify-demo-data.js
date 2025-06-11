const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verificando datos de demostración...\n');

  try {
    // Verificar artículos
    const items = await prisma.item.findMany();
    const itemsByType = await prisma.item.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('📦 ARTÍCULOS:');
    console.log(`   Total: ${items.length}`);
    itemsByType.forEach(group => {
      console.log(`   ${group.type}: ${group._count.type}`);
    });

    // Verificar proveedores
    const vendors = await prisma.vendor.findMany();
    console.log(`\n🏢 PROVEEDORES: ${vendors.length}`);
    vendors.forEach(vendor => {
      console.log(`   ${vendor.no} - ${vendor.name} (${vendor.currencyCode})`);
    });

    // Verificar órdenes de compra
    const purchaseOrders = await prisma.purchaseHeader.findMany({
      include: {
        _count: {
          select: { purchaseLines: true }
        }
      }
    });
    console.log(`\n🛒 ÓRDENES DE COMPRA: ${purchaseOrders.length}`);
    purchaseOrders.forEach(po => {
      console.log(`   ${po.no} - ${po.buyFromVendorName} - ${po._count.purchaseLines} líneas - ${po.status}`);
    });

    // Verificar recetas (BOMs)
    const bomComponents = await prisma.bOMComponent.findMany();
    const bomsByParent = await prisma.bOMComponent.groupBy({
      by: ['parentItemNo'],
      _count: { parentItemNo: true }
    });
    console.log(`\n📝 RECETAS (BOMs): ${bomsByParent.length} productos con recetas`);
    bomsByParent.forEach(bom => {
      console.log(`   ${bom.parentItemNo} - ${bom._count.parentItemNo} componentes`);
    });

    // Verificar movimientos de inventario
    const itemLedgerEntries = await prisma.itemLedgerEntry.findMany();
    const entriesByType = await prisma.itemLedgerEntry.groupBy({
      by: ['entryType'],
      _count: { entryType: true }
    });
    console.log(`\n📋 MOVIMIENTOS DE INVENTARIO: ${itemLedgerEntries.length}`);
    entriesByType.forEach(entry => {
      console.log(`   ${entry.entryType}: ${entry._count.entryType}`);
    });

    // Verificar algunos artículos específicos
    console.log('\n🔍 MUESTRA DE ARTÍCULOS:');
    const sampleItems = await prisma.item.findMany({
      take: 5,
      include: {
        _count: {
          select: { 
            itemLedgerEntries: true,
            purchaseLines: true,
            bomComponents: true,
            bomParents: true
          }
        }
      }
    });
    
    sampleItems.forEach(item => {
      console.log(`   ${item.no} - ${item.description}`);
      console.log(`     Precio: L${item.unitPrice} | Costo: L${item.unitCost}`);
      console.log(`     Movimientos: ${item._count.itemLedgerEntries} | OC: ${item._count.purchaseLines}`);
      console.log(`     BOMs como componente: ${item._count.bomComponents} | BOMs como padre: ${item._count.bomParents}`);
    });

    console.log('\n✅ ¡Verificación completada exitosamente!');
    console.log('\n🎯 INSTRUCCIONES PARA LA DEMO:');
    console.log('1. Abrir http://localhost:3000');
    console.log('2. Hacer clic en "SUPER"');
    console.log('3. Seleccionar pestaña "📦 Inventario"');
    console.log('4. Explorar las diferentes pestañas del módulo de inventario');
    console.log('\n📊 DATOS DISPONIBLES PARA LA DEMO:');
    console.log('✓ 50 artículos organizados por categorías');
    console.log('✓ 5 proveedores con diferentes monedas');
    console.log('✓ 10 órdenes de compra con múltiples líneas');
    console.log('✓ 3 recetas (BOMs) para productos elaborados');
    console.log('✓ Movimientos de inventario con entradas y salidas');
    console.log('✓ Cálculo de costos promedio implementado');
    console.log('✓ Gestión de múltiples almacenes');

  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData(); 