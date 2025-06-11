const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando población de datos de demostración...');

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.bOMComponent.deleteMany();
    await prisma.purchaseLine.deleteMany();
    await prisma.purchaseHeader.deleteMany();
    await prisma.itemLedgerEntry.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.item.deleteMany();

    // Crear proveedores
    console.log('🏢 Creando proveedores...');
    const vendors = await Promise.all([
      prisma.vendor.create({
        data: {
          no: 'PROV001',
          name: 'Distribuidora La Colonia',
          address: 'Blvd. Morazán',
          address2: 'Col. Las Minitas',
          city: 'Tegucigalpa',
          contact: 'Ana García',
          phoneNo: '+504 2240-1234',
          email: 'compras@lacolonia.hn',
          paymentTermsCode: '30 DIAS',
          paymentMethodCode: 'TRANSFERENCIA',
          vendorPostingGroup: 'NACIONAL',
          currencyCode: 'HNL'
        }
      }),
      prisma.vendor.create({
        data: {
          no: 'PROV002',
          name: 'Carnes Selectas S.A.',
          address: 'Zona Industrial',
          address2: 'Comayagüela',
          city: 'Tegucigalpa',
          contact: 'Roberto Martínez',
          phoneNo: '+504 2225-5678',
          email: 'ventas@carnesselectas.hn',
          paymentTermsCode: '15 DIAS',
          paymentMethodCode: 'EFECTIVO',
          vendorPostingGroup: 'NACIONAL',
          currencyCode: 'HNL'
        }
      }),
      prisma.vendor.create({
        data: {
          no: 'PROV003',
          name: 'Bebidas Premium Import',
          address: 'Zona Libre de Colón',
          address2: 'San Pedro Sula',
          city: 'San Pedro Sula',
          contact: 'Luis Fernando',
          phoneNo: '+504 2550-9876',
          email: 'info@bebidaspremium.hn',
          paymentTermsCode: '45 DIAS',
          paymentMethodCode: 'CREDITO',
          vendorPostingGroup: 'IMPORTACION',
          currencyCode: 'USD'
        }
      }),
      prisma.vendor.create({
        data: {
          no: 'PROV004',
          name: 'Lácteos del Valle',
          address: 'Siguatepeque',
          address2: 'Comayagua',
          city: 'Siguatepeque',
          contact: 'Carmen Flores',
          phoneNo: '+504 2773-1111',
          email: 'pedidos@lacteosdelval.hn',
          paymentTermsCode: '7 DIAS',
          paymentMethodCode: 'EFECTIVO',
          vendorPostingGroup: 'NACIONAL',
          currencyCode: 'HNL'
        }
      }),
      prisma.vendor.create({
        data: {
          no: 'PROV005',
          name: 'Frutas y Verduras La Central',
          address: 'Mercado Los Dolores',
          address2: 'Centro',
          city: 'Tegucigalpa',
          contact: 'Pedro Hernández',
          phoneNo: '+504 2237-4567',
          email: 'central@frutasverduras.hn',
          paymentTermsCode: 'CONTADO',
          paymentMethodCode: 'EFECTIVO',
          vendorPostingGroup: 'NACIONAL',
          currencyCode: 'HNL'
        }
      })
    ]);

    // Crear 50 artículos variados
    console.log('📦 Creando 50 artículos...');
    const items = [];
    
    // Ingredientes base (20 items)
    const ingredientes = [
      { no: 'ING001', desc: 'Carne de Res Molida', price: 180, cost: 120, um: 'LB', tipo: 'Inventory' },
      { no: 'ING002', desc: 'Pollo Entero', price: 85, cost: 60, um: 'LB', tipo: 'Inventory' },
      { no: 'ING003', desc: 'Pechuga de Pollo', price: 120, cost: 85, um: 'LB', tipo: 'Inventory' },
      { no: 'ING004', desc: 'Camarones Grandes', price: 320, cost: 250, um: 'LB', tipo: 'Inventory' },
      { no: 'ING005', desc: 'Queso Mozzarella', price: 150, cost: 100, um: 'LB', tipo: 'Inventory' },
      { no: 'ING006', desc: 'Queso Cheddar', price: 180, cost: 120, um: 'LB', tipo: 'Inventory' },
      { no: 'ING007', desc: 'Leche Entera', price: 45, cost: 30, um: 'LT', tipo: 'Inventory' },
      { no: 'ING008', desc: 'Mantequilla', price: 95, cost: 65, um: 'LB', tipo: 'Inventory' },
      { no: 'ING009', desc: 'Huevos Frescos', price: 8, cost: 5, um: 'UND', tipo: 'Inventory' },
      { no: 'ING010', desc: 'Harina de Trigo', price: 35, cost: 25, um: 'LB', tipo: 'Inventory' },
      { no: 'ING011', desc: 'Tomate Fresco', price: 25, cost: 15, um: 'LB', tipo: 'Inventory' },
      { no: 'ING012', desc: 'Cebolla Blanca', price: 20, cost: 12, um: 'LB', tipo: 'Inventory' },
      { no: 'ING013', desc: 'Lechuga Americana', price: 30, cost: 18, um: 'UND', tipo: 'Inventory' },
      { no: 'ING014', desc: 'Papa Blanca', price: 18, cost: 12, um: 'LB', tipo: 'Inventory' },
      { no: 'ING015', desc: 'Aceite Vegetal', price: 85, cost: 60, um: 'LT', tipo: 'Inventory' },
      { no: 'ING016', desc: 'Sal de Mesa', price: 12, cost: 8, um: 'LB', tipo: 'Inventory' },
      { no: 'ING017', desc: 'Pimienta Negra', price: 180, cost: 120, um: 'LB', tipo: 'Inventory' },
      { no: 'ING018', desc: 'Ajo Fresco', price: 45, cost: 30, um: 'LB', tipo: 'Inventory' },
      { no: 'ING019', desc: 'Cilantro Fresco', price: 15, cost: 8, um: 'MANO', tipo: 'Inventory' },
      { no: 'ING020', desc: 'Limón Verde', price: 35, cost: 20, um: 'LB', tipo: 'Inventory' }
    ];

    // Bebidas (15 items)
    const bebidas = [
      { no: 'BEB001', desc: 'Coca Cola 600ml', price: 25, cost: 15, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB002', desc: 'Pepsi 600ml', price: 25, cost: 15, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB003', desc: 'Agua Purificada 500ml', price: 15, cost: 8, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB004', desc: 'Jugo de Naranja Natural', price: 45, cost: 25, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB005', desc: 'Café Molido Premium', price: 180, cost: 120, um: 'LB', tipo: 'Inventory' },
      { no: 'BEB006', desc: 'Té Verde', price: 95, cost: 60, um: 'CAJA', tipo: 'Inventory' },
      { no: 'BEB007', desc: 'Cerveza Nacional 355ml', price: 35, cost: 20, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB008', desc: 'Cerveza Imperial 355ml', price: 40, cost: 25, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB009', desc: 'Vino Tinto Reserva', price: 450, cost: 300, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB010', desc: 'Vino Blanco', price: 380, cost: 250, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB011', desc: 'Ron Flor de Caña 7 años', price: 850, cost: 600, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB012', desc: 'Whisky Johnnie Walker Red', price: 1200, cost: 900, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB013', desc: 'Vodka Absolut', price: 950, cost: 700, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB014', desc: 'Tequila José Cuervo', price: 780, cost: 550, um: 'UND', tipo: 'Inventory' },
      { no: 'BEB015', desc: 'Energizante Red Bull', price: 65, cost: 40, um: 'UND', tipo: 'Inventory' }
    ];

    // Productos terminados (10 items)
    const productos = [
      { no: 'PROD001', desc: 'Hamburguesa Clásica', price: 180, cost: 85, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD002', desc: 'Pizza Margarita', price: 320, cost: 150, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD003', desc: 'Ensalada César', price: 145, cost: 60, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD004', desc: 'Pasta Alfredo', price: 195, cost: 80, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD005', desc: 'Pollo a la Plancha', price: 220, cost: 95, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD006', desc: 'Camarones al Ajillo', price: 380, cost: 180, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD007', desc: 'Tacos de Carne (3 und)', price: 165, cost: 70, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD008', desc: 'Sopa de Pollo', price: 95, cost: 40, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD009', desc: 'Sandwich Club', price: 155, cost: 65, um: 'UND', tipo: 'Inventory' },
      { no: 'PROD010', desc: 'Desayuno Típico', price: 125, cost: 55, um: 'UND', tipo: 'Inventory' }
    ];

    // Servicios (5 items)
    const servicios = [
      { no: 'SERV001', desc: 'Delivery a Domicilio', price: 50, cost: 25, um: 'UND', tipo: 'Service' },
      { no: 'SERV002', desc: 'Servicio de Mesa', price: 0, cost: 0, um: 'UND', tipo: 'Service' },
      { no: 'SERV003', desc: 'Empaque para Llevar', price: 15, cost: 8, um: 'UND', tipo: 'Service' },
      { no: 'SERV004', desc: 'Reservación de Mesa', price: 0, cost: 0, um: 'UND', tipo: 'Service' },
      { no: 'SERV005', desc: 'Música en Vivo', price: 200, cost: 150, um: 'HORA', tipo: 'Service' }
    ];

    // Crear todos los artículos
    const allItems = [...ingredientes, ...bebidas, ...productos, ...servicios];
    
    for (const item of allItems) {
      const createdItem = await prisma.item.create({
        data: {
          no: item.no,
          description: item.desc,
          description2: item.desc + ' - Premium Quality',
          baseUnitOfMeasure: item.um,
          type: item.tipo,
          inventoryPostingGroup: item.tipo === 'Service' ? 'SERVICIOS' : 'PRODUCTOS',
          genProdPostingGroup: 'GENERAL',
          taxGroupCode: 'ISV15',
          vatProdPostingGroup: 'ESTANDAR',
          unitPrice: item.price,
          unitCost: item.cost,
          lastDirectCost: item.cost,
          standardCost: item.cost,
          costingMethod: 'Average',
          replenishmentSystem: 'Purchase',
          reorderPoint: item.tipo === 'Inventory' ? 10 : 0,
          maximumInventory: item.tipo === 'Inventory' ? 100 : 0,
          minimumOrderQty: item.tipo === 'Inventory' ? 5 : 0,
          maximumOrderQty: item.tipo === 'Inventory' ? 200 : 0,
          safetyStockQty: item.tipo === 'Inventory' ? 5 : 0,
          orderMultiple: 1,
          shelfNo: `EST-${item.no.slice(-2)}`,
          blocked: false
        }
      });
      items.push(createdItem);
    }

    // Crear órdenes de compra
    console.log('🛒 Creando órdenes de compra...');
    
    const purchaseOrders = [];
    for (let i = 1; i <= 10; i++) {
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      const po = await prisma.purchaseHeader.create({
        data: {
          documentType: 'Order',
          no: `PO-2024-${String(i).padStart(4, '0')}`,
          buyFromVendorNo: vendor.no,
          buyFromVendorName: vendor.name,
          buyFromAddress: vendor.address,
          buyFromCity: vendor.city,
          buyFromContact: vendor.contact,
          orderDate: orderDate,
          postingDate: orderDate,
          expectedReceiptDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          dueDate: new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          vendorOrderNo: `VO-${i}`,
          paymentTermsCode: vendor.paymentTermsCode,
          paymentMethodCode: vendor.paymentMethodCode,
          vendorPostingGroup: vendor.vendorPostingGroup,
          currencyCode: vendor.currencyCode,
          currencyFactor: vendor.currencyCode === 'USD' ? 24.5 : 1,
          pricesIncludingVAT: false,
          invoiceDiscountCalculation: 'None',
          invoiceDiscountValue: 0,
          status: Math.random() > 0.3 ? 'Released' : 'Open',
          amount: 0,
          amountIncludingVAT: 0
        }
      });

      // Crear líneas de orden de compra
      const numLines = Math.floor(Math.random() * 5) + 3; // 3-7 líneas
      let totalAmount = 0;
      
      for (let j = 1; j <= numLines; j++) {
        const item = items[Math.floor(Math.random() * 35)]; // Solo ingredientes y bebidas
        const quantity = Math.floor(Math.random() * 20) + 5;
        const unitCost = item.unitCost * (0.9 + Math.random() * 0.2); // Variación de ±10%
        const lineAmount = quantity * unitCost;
        
        await prisma.purchaseLine.create({
          data: {
            documentType: 'Order',
            documentNo: po.no,
            lineNo: j * 10000,
            type: 'Item',
            no: item.no,
            locationCode: 'MAIN',
            description: item.description,
            unitOfMeasureCode: item.baseUnitOfMeasure,
            quantity: quantity,
            outstandingQuantity: po.status === 'Open' ? quantity : Math.floor(quantity * Math.random()),
            qtyToReceive: 0,
            qtyToInvoice: 0,
            directUnitCost: unitCost,
            unitCostLCY: unitCost * (vendor.currencyCode === 'USD' ? 24.5 : 1),
            vatPct: 15,
            lineDiscountPct: 0,
            lineDiscountAmount: 0,
            amount: lineAmount,
            amountIncludingVAT: lineAmount * 1.15,
            unitPriceLCY: item.unitPrice * (vendor.currencyCode === 'USD' ? 24.5 : 1),
            allowInvoiceDisc: true,
            grossWeight: 0,
            netWeight: 0,
            unitsPerParcel: 0,
            unitVolume: 0,
            qtyPerUnitOfMeasure: 1,
            indirectCostPct: 0,
            recalculateInvoiceDisc: false,
            outstandingAmount: lineAmount,
            qtyRcdNotInvoiced: 0,
            amtRcdNotInvoiced: 0,
            quantityReceived: 0,
            quantityInvoiced: 0
          }
        });
        
        totalAmount += lineAmount;
      }

      // Actualizar totales de la orden
      await prisma.purchaseHeader.update({
        where: { id: po.id },
        data: {
          amount: totalAmount,
          amountIncludingVAT: totalAmount * 1.15
        }
      });

      purchaseOrders.push(po);
    }

    // Crear recetas (BOMs)
    console.log('📝 Creando recetas (BOMs)...');
    
    // Receta para Hamburguesa Clásica
    await prisma.bOMComponent.createMany({
      data: [
        {
          parentItemNo: 'PROD001',
          lineNo: 10000,
          type: 'Item',
          no: 'ING001', // Carne molida
          description: 'Carne de Res Molida',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.25,
          unitCost: 120,
          scrapPct: 5
        },
        {
          parentItemNo: 'PROD001',
          lineNo: 20000,
          type: 'Item',
          no: 'ING005', // Queso
          description: 'Queso Mozzarella',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.05,
          unitCost: 100,
          scrapPct: 2
        },
        {
          parentItemNo: 'PROD001',
          lineNo: 30000,
          type: 'Item',
          no: 'ING011', // Tomate
          description: 'Tomate Fresco',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.1,
          unitCost: 15,
          scrapPct: 10
        },
        {
          parentItemNo: 'PROD001',
          lineNo: 40000,
          type: 'Item',
          no: 'ING013', // Lechuga
          description: 'Lechuga Americana',
          unitOfMeasureCode: 'UND',
          quantityPer: 0.1,
          unitCost: 18,
          scrapPct: 15
        }
      ]
    });

    // Receta para Pizza Margarita
    await prisma.bOMComponent.createMany({
      data: [
        {
          parentItemNo: 'PROD002',
          lineNo: 10000,
          type: 'Item',
          no: 'ING010', // Harina
          description: 'Harina de Trigo',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.3,
          unitCost: 25,
          scrapPct: 3
        },
        {
          parentItemNo: 'PROD002',
          lineNo: 20000,
          type: 'Item',
          no: 'ING005', // Queso
          description: 'Queso Mozzarella',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.2,
          unitCost: 100,
          scrapPct: 2
        },
        {
          parentItemNo: 'PROD002',
          lineNo: 30000,
          type: 'Item',
          no: 'ING011', // Tomate
          description: 'Tomate Fresco',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.15,
          unitCost: 15,
          scrapPct: 8
        }
      ]
    });

    // Receta para Pollo a la Plancha
    await prisma.bOMComponent.createMany({
      data: [
        {
          parentItemNo: 'PROD005',
          lineNo: 10000,
          type: 'Item',
          no: 'ING003', // Pechuga de pollo
          description: 'Pechuga de Pollo',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.5,
          unitCost: 85,
          scrapPct: 5
        },
        {
          parentItemNo: 'PROD005',
          lineNo: 20000,
          type: 'Item',
          no: 'ING016', // Sal
          description: 'Sal de Mesa',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.01,
          unitCost: 8,
          scrapPct: 0
        },
        {
          parentItemNo: 'PROD005',
          lineNo: 30000,
          type: 'Item',
          no: 'ING017', // Pimienta
          description: 'Pimienta Negra',
          unitOfMeasureCode: 'LB',
          quantityPer: 0.005,
          unitCost: 120,
          scrapPct: 0
        }
      ]
    });

    // Crear movimientos de inventario iniciales
    console.log('📋 Creando movimientos de inventario...');
    
    for (const item of items.slice(0, 40)) { // Solo para artículos de inventario
      if (item.type === 'Inventory') {
        // Movimiento de entrada inicial
        await prisma.itemLedgerEntry.create({
          data: {
            entryNo: parseInt(`${item.id}001`),
            itemNo: item.no,
            postingDate: new Date(2024, 0, 1), // 1 enero 2024
            entryType: 'Positive Adjmt.',
            sourceNo: 'INV-INICIAL',
            documentNo: `ADJ-${item.no}`,
            description: `Inventario inicial - ${item.description}`,
            locationCode: 'MAIN',
            quantity: Math.floor(Math.random() * 50) + 20,
            remainingQuantity: Math.floor(Math.random() * 50) + 20,
            invoicedQuantity: 0,
            unitOfMeasureCode: item.baseUnitOfMeasure,
            salesAmountActual: 0,
            costAmountActual: 0,
            costAmountExpected: 0,
            costAmountNonInvtbl: 0,
            completelyInvoiced: false,
            open: true,
            globalDimension1Code: 'PRINCIPAL',
            globalDimension2Code: 'INVENTARIO'
          }
        });

        // Algunos movimientos de salida
        if (Math.random() > 0.5) {
          await prisma.itemLedgerEntry.create({
            data: {
              entryNo: parseInt(`${item.id}002`),
              itemNo: item.no,
              postingDate: new Date(2024, 2, 15), // 15 marzo 2024
              entryType: 'Sale',
              sourceNo: 'VENTA-001',
              documentNo: `FACT-001`,
              description: `Venta - ${item.description}`,
              locationCode: 'MAIN',
              quantity: -(Math.floor(Math.random() * 10) + 1),
              remainingQuantity: 0,
              invoicedQuantity: Math.floor(Math.random() * 10) + 1,
              unitOfMeasureCode: item.baseUnitOfMeasure,
              salesAmountActual: item.unitPrice * (Math.floor(Math.random() * 10) + 1),
              costAmountActual: -item.unitCost * (Math.floor(Math.random() * 10) + 1),
              costAmountExpected: 0,
              costAmountNonInvtbl: 0,
              completelyInvoiced: true,
              open: false,
              globalDimension1Code: 'PRINCIPAL',
              globalDimension2Code: 'VENTAS'
            }
          });
        }
      }
    }

    console.log('✅ ¡Datos de demostración creados exitosamente!');
    console.log(`
📊 RESUMEN DE DATOS CREADOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Proveedores: ${vendors.length}
📦 Artículos: ${items.length}
   ├─ Ingredientes: 20
   ├─ Bebidas: 15
   ├─ Productos: 10
   └─ Servicios: 5
🛒 Órdenes de Compra: ${purchaseOrders.length}
📝 Recetas (BOMs): 3 productos con componentes
📋 Movimientos de Inventario: ~${items.filter(i => i.type === 'Inventory').length * 1.5}

🚀 ¡Listo para la demostración!
   `);

  } catch (error) {
    console.error('❌ Error al crear datos de demostración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 