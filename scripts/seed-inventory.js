const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedInventory() {
  console.log('🌱 Iniciando población de datos de inventario...');

  try {
    // 1. Crear proveedores
    console.log('📦 Creando proveedores...');
    const vendors = await Promise.all([
      prisma.vendor.create({
        data: {
          no: 'VENDOR001',
          name: 'Distribuidora Central S.A.',
          address: 'Blvd. Morazán, Tegucigalpa',
          city: 'Tegucigalpa',
          phoneNo: '+504 2234-5678',
          email: 'ventas@distribuidoracentral.hn',
          paymentTermsCode: '30DIAS',
          currencyCode: 'HNL'
        }
      }),
      prisma.vendor.create({
        data: {
          no: 'VENDOR002',
          name: 'Alimentos del Valle',
          address: 'Zona Industrial, San Pedro Sula',
          city: 'San Pedro Sula',
          phoneNo: '+504 2550-1234',
          email: 'compras@alimentosdelvalle.hn',
          paymentTermsCode: '15DIAS',
          currencyCode: 'HNL'
        }
      }),
      prisma.vendor.create({
        data: {
          no: 'VENDOR003',
          name: 'Bebidas Premium Ltda.',
          address: 'Col. Palmira, Tegucigalpa',
          city: 'Tegucigalpa',
          phoneNo: '+504 2240-9876',
          email: 'pedidos@bebidaspremium.hn',
          paymentTermsCode: '7DIAS',
          currencyCode: 'HNL'
        }
      })
    ]);

    // 2. Crear clientes
    console.log('👥 Creando clientes...');
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          no: 'CUSTOMER001',
          name: 'Cliente General',
          address: 'Tegucigalpa, Honduras',
          city: 'Tegucigalpa',
          phoneNo: '+504 9999-9999',
          email: 'general@cliente.hn',
          currencyCode: 'HNL'
        }
      }),
      prisma.customer.create({
        data: {
          no: 'CUSTOMER002',
          name: 'Empresa ABC S.A.',
          address: 'Centro Comercial Los Próceres',
          city: 'Tegucigalpa',
          phoneNo: '+504 2234-5678',
          email: 'facturacion@empresaabc.hn',
          currencyCode: 'HNL',
          paymentTermsCode: '30DIAS'
        }
      })
    ]);

    // 3. Crear artículos de inventario
    console.log('📋 Creando artículos...');
    const items = await Promise.all([
      // Ingredientes básicos
      prisma.item.create({
        data: {
          no: 'ING001',
          description: 'Harina de Trigo Premium',
          description2: 'Saco de 50 libras',
          type: 'Inventory',
          baseUnitOfMeasure: 'LB',
          unitPrice: 2.50,
          unitCost: 1.80,
          lastDirectCost: 1.80,
          costingMethod: 'Average',
          reorderPoint: 100,
          maximumInventory: 500,
          minimumOrderQty: 50,
          safetyStockQty: 25
        }
      }),
      prisma.item.create({
        data: {
          no: 'ING002',
          description: 'Aceite Vegetal',
          description2: 'Galón',
          type: 'Inventory',
          baseUnitOfMeasure: 'GAL',
          unitPrice: 8.00,
          unitCost: 6.50,
          lastDirectCost: 6.50,
          costingMethod: 'Average',
          reorderPoint: 20,
          maximumInventory: 100,
          minimumOrderQty: 10,
          safetyStockQty: 5
        }
      }),
      prisma.item.create({
        data: {
          no: 'ING003',
          description: 'Pollo Entero',
          description2: 'Fresco por libra',
          type: 'Inventory',
          baseUnitOfMeasure: 'LB',
          unitPrice: 4.50,
          unitCost: 3.20,
          lastDirectCost: 3.20,
          costingMethod: 'FIFO',
          reorderPoint: 50,
          maximumInventory: 200,
          minimumOrderQty: 25,
          safetyStockQty: 10
        }
      }),
      prisma.item.create({
        data: {
          no: 'ING004',
          description: 'Arroz Blanco',
          description2: 'Saco de 100 libras',
          type: 'Inventory',
          baseUnitOfMeasure: 'LB',
          unitPrice: 1.20,
          unitCost: 0.85,
          lastDirectCost: 0.85,
          costingMethod: 'Average',
          reorderPoint: 200,
          maximumInventory: 1000,
          minimumOrderQty: 100,
          safetyStockQty: 50
        }
      }),
      prisma.item.create({
        data: {
          no: 'ING005',
          description: 'Frijoles Rojos',
          description2: 'Saco de 100 libras',
          type: 'Inventory',
          baseUnitOfMeasure: 'LB',
          unitPrice: 1.80,
          unitCost: 1.30,
          lastDirectCost: 1.30,
          costingMethod: 'Average',
          reorderPoint: 150,
          maximumInventory: 500,
          minimumOrderQty: 50,
          safetyStockQty: 25
        }
      }),
      // Bebidas
      prisma.item.create({
        data: {
          no: 'BEB001',
          description: 'Coca Cola 600ml',
          description2: 'Botella plástica',
          type: 'Inventory',
          baseUnitOfMeasure: 'PCS',
          unitPrice: 1.50,
          unitCost: 0.90,
          lastDirectCost: 0.90,
          costingMethod: 'FIFO',
          reorderPoint: 100,
          maximumInventory: 500,
          minimumOrderQty: 24,
          safetyStockQty: 24
        }
      }),
      prisma.item.create({
        data: {
          no: 'BEB002',
          description: 'Agua Embotellada 500ml',
          description2: 'Botella plástica',
          type: 'Inventory',
          baseUnitOfMeasure: 'PCS',
          unitPrice: 0.80,
          unitCost: 0.45,
          lastDirectCost: 0.45,
          costingMethod: 'Average',
          reorderPoint: 200,
          maximumInventory: 1000,
          minimumOrderQty: 48,
          safetyStockQty: 48
        }
      }),
      // Productos terminados
      prisma.item.create({
        data: {
          no: 'PROD001',
          description: 'Pollo Frito Completo',
          description2: 'Con arroz y frijoles',
          type: 'Inventory',
          baseUnitOfMeasure: 'PCS',
          unitPrice: 12.00,
          unitCost: 0, // Se calculará con BOM
          standardCost: 0,
          costingMethod: 'Standard',
          reorderPoint: 0,
          maximumInventory: 0,
          minimumOrderQty: 1
        }
      }),
      prisma.item.create({
        data: {
          no: 'PROD002',
          description: 'Baleada Sencilla',
          description2: 'Tortilla con frijoles y queso',
          type: 'Inventory',
          baseUnitOfMeasure: 'PCS',
          unitPrice: 3.50,
          unitCost: 0, // Se calculará con BOM
          standardCost: 0,
          costingMethod: 'Standard',
          reorderPoint: 0,
          maximumInventory: 0,
          minimumOrderQty: 1
        }
      })
    ]);

    // 4. Crear recetas (BOM)
    console.log('🍳 Creando recetas...');
    
    // Receta para Pollo Frito Completo
    await Promise.all([
      prisma.bOMComponent.create({
        data: {
          parentItemNo: 'PROD001',
          lineNo: 10000,
          type: 'Item',
          no: 'ING003',
          description: 'Pollo para freír',
          quantityPer: 0.75, // 3/4 de libra
          unitCost: 3.20,
          unitOfMeasureCode: 'LB'
        }
      }),
      prisma.bOMComponent.create({
        data: {
          parentItemNo: 'PROD001',
          lineNo: 20000,
          type: 'Item',
          no: 'ING004',
          description: 'Arroz como acompañamiento',
          quantityPer: 0.25, // 1/4 de libra
          unitCost: 0.85,
          unitOfMeasureCode: 'LB'
        }
      }),
      prisma.bOMComponent.create({
        data: {
          parentItemNo: 'PROD001',
          lineNo: 30000,
          type: 'Item',
          no: 'ING005',
          description: 'Frijoles como acompañamiento',
          quantityPer: 0.15, // 0.15 libras
          unitCost: 1.30,
          unitOfMeasureCode: 'LB'
        }
      }),
      prisma.bOMComponent.create({
        data: {
          parentItemNo: 'PROD001',
          lineNo: 40000,
          type: 'Item',
          no: 'ING002',
          description: 'Aceite para freír',
          quantityPer: 0.05, // 0.05 galones
          unitCost: 6.50,
          unitOfMeasureCode: 'GAL'
        }
      })
    ]);

    // Receta para Baleada Sencilla
    await Promise.all([
      prisma.bOMComponent.create({
        data: {
          parentItemNo: 'PROD002',
          lineNo: 10000,
          type: 'Item',
          no: 'ING001',
          description: 'Harina para tortilla',
          quantityPer: 0.15, // 0.15 libras
          unitCost: 1.80,
          unitOfMeasureCode: 'LB'
        }
      }),
      prisma.bOMComponent.create({
        data: {
          parentItemNo: 'PROD002',
          lineNo: 20000,
          type: 'Item',
          no: 'ING005',
          description: 'Frijoles refritos',
          quantityPer: 0.10, // 0.10 libras
          unitCost: 1.30,
          unitOfMeasureCode: 'LB'
        }
      })
    ]);

    // 5. Calcular costos estándar
    console.log('💰 Calculando costos estándar...');
    
    // Calcular costo para Pollo Frito Completo
    const polloFritoComponents = await prisma.bOMComponent.findMany({
      where: { parentItemNo: 'PROD001' },
      include: { componentItem: true }
    });
    
    let polloFritoCost = 0;
    for (const component of polloFritoComponents) {
      const componentCost = component.unitCost > 0 ? component.unitCost : component.componentItem?.unitCost || 0;
      polloFritoCost += componentCost * component.quantityPer;
    }
    
    await prisma.item.update({
      where: { no: 'PROD001' },
      data: { 
        standardCost: polloFritoCost,
        unitCost: polloFritoCost
      }
    });

    // Calcular costo para Baleada Sencilla
    const baleadaComponents = await prisma.bOMComponent.findMany({
      where: { parentItemNo: 'PROD002' },
      include: { componentItem: true }
    });
    
    let baleadaCost = 0;
    for (const component of baleadaComponents) {
      const componentCost = component.unitCost > 0 ? component.unitCost : component.componentItem?.unitCost || 0;
      baleadaCost += componentCost * component.quantityPer;
    }
    
    await prisma.item.update({
      where: { no: 'PROD002' },
      data: { 
        standardCost: baleadaCost,
        unitCost: baleadaCost
      }
    });

    // 6. Crear inventario inicial
    console.log('📦 Creando inventario inicial...');
    
    const initialInventory = [
      { itemNo: 'ING001', quantity: 250, unitCost: 1.80 },
      { itemNo: 'ING002', quantity: 50, unitCost: 6.50 },
      { itemNo: 'ING003', quantity: 100, unitCost: 3.20 },
      { itemNo: 'ING004', quantity: 500, unitCost: 0.85 },
      { itemNo: 'ING005', quantity: 300, unitCost: 1.30 },
      { itemNo: 'BEB001', quantity: 200, unitCost: 0.90 },
      { itemNo: 'BEB002', quantity: 500, unitCost: 0.45 }
    ];

    for (const inv of initialInventory) {
      // Crear movimiento de inventario inicial
      const itemLedgerEntry = await prisma.itemLedgerEntry.create({
        data: {
          itemNo: inv.itemNo,
          postingDate: new Date(),
          entryType: 'Positive Adjmt.',
          sourceNo: 'INICIAL',
          documentNo: 'INV-INICIAL-001',
          description: 'Inventario inicial del sistema',
          locationCode: 'MAIN',
          quantity: inv.quantity,
          remainingQuantity: inv.quantity,
          unitOfMeasureCode: 'PCS',
          costAmountActual: inv.quantity * inv.unitCost,
          open: true
        }
      });

      // Crear entrada de valor
      await prisma.valueEntry.create({
        data: {
          itemLedgerEntryNo: itemLedgerEntry.entryNo,
          itemNo: inv.itemNo,
          postingDate: new Date(),
          itemLedgerEntryType: 'Positive Adjmt.',
          sourceNo: 'INICIAL',
          documentNo: 'INV-INICIAL-001',
          description: 'Inventario inicial del sistema',
          locationCode: 'MAIN',
          valuedQuantity: inv.quantity,
          itemLedgerEntryQty: inv.quantity,
          costAmountActual: inv.quantity * inv.unitCost,
          costPerUnit: inv.unitCost
        }
      });
    }

    // 7. Crear una orden de compra de ejemplo
    console.log('🛒 Creando orden de compra de ejemplo...');
    
    const purchaseOrder = await prisma.purchaseHeader.create({
      data: {
        documentType: 'Order',
        no: 'PO-25010001',
        buyFromVendorNo: 'VENDOR001',
        buyFromVendorName: 'Distribuidora Central S.A.',
        orderDate: new Date(),
        postingDate: new Date(),
        expectedReceiptDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        status: 'Open',
        amount: 0,
        amountIncludingVAT: 0
      }
    });

    const purchaseLines = await Promise.all([
      prisma.purchaseLine.create({
        data: {
          documentType: 'Order',
          documentNo: 'PO-25010001',
          lineNo: 10000,
          type: 'Item',
          no: 'ING001',
          description: 'Harina de Trigo Premium',
          quantity: 100,
          outstandingQuantity: 100,
          qtyToReceive: 100,
          directUnitCost: 1.75,
          unitCostLCY: 1.75,
          amount: 175.00,
          amountIncludingVAT: 175.00,
          locationCode: 'MAIN'
        }
      }),
      prisma.purchaseLine.create({
        data: {
          documentType: 'Order',
          documentNo: 'PO-25010001',
          lineNo: 20000,
          type: 'Item',
          no: 'ING002',
          description: 'Aceite Vegetal',
          quantity: 20,
          outstandingQuantity: 20,
          qtyToReceive: 20,
          directUnitCost: 6.25,
          unitCostLCY: 6.25,
          amount: 125.00,
          amountIncludingVAT: 125.00,
          locationCode: 'MAIN'
        }
      })
    ]);

    // Actualizar total de la orden
    const totalAmount = purchaseLines.reduce((sum, line) => sum + line.amount, 0);
    await prisma.purchaseHeader.update({
      where: { no: 'PO-25010001' },
      data: {
        amount: totalAmount,
        amountIncludingVAT: totalAmount
      }
    });

    console.log('✅ Datos de inventario creados exitosamente!');
    console.log('');
    console.log('📊 RESUMEN DE DATOS CREADOS:');
    console.log('──────────────────────────────────────');
    console.log(`✅ Proveedores: ${vendors.length}`);
    console.log(`✅ Clientes: ${customers.length}`);
    console.log(`✅ Artículos: ${items.length}`);
    console.log(`✅ Componentes BOM: ${polloFritoComponents.length + baleadaComponents.length}`);
    console.log(`✅ Movimientos inventario: ${initialInventory.length}`);
    console.log(`✅ Órdenes de compra: 1`);
    console.log('');
    console.log('🎯 ARTÍCULOS CREADOS:');
    console.log('──────────────────────────────────────');
    for (const item of items) {
      console.log(`• ${item.no} - ${item.description} (${item.type})`);
    }
    console.log('');
    console.log('🍳 RECETAS CREADAS:');
    console.log('──────────────────────────────────────');
    console.log(`• PROD001 - Pollo Frito Completo (Costo: L${polloFritoCost.toFixed(2)})`);
    console.log(`• PROD002 - Baleada Sencilla (Costo: L${baleadaCost.toFixed(2)})`);
    console.log('');
    console.log('🚀 El sistema de inventario está listo para usar!');

  } catch (error) {
    console.error('❌ Error al crear datos de inventario:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedInventory()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedInventory }; 