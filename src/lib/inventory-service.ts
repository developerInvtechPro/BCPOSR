import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './database-manager';

export interface InventoryMovement {
  itemNo: string;
  entryType: 'Purchase' | 'Sale' | 'Positive Adjmt.' | 'Negative Adjmt.' | 'Transfer' | 'Consumption' | 'Output';
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
  documentNo: string;
  sourceNo?: string;
  description?: string;
  locationCode?: string;
  postingDate?: Date;
}

export interface ItemCreation {
  no: string;
  description: string;
  description2?: string;
  baseUnitOfMeasure?: string;
  type?: 'Inventory' | 'Non-Inventory' | 'Service';
  unitPrice?: number;
  unitCost?: number;
  costingMethod?: 'FIFO' | 'LIFO' | 'Specific' | 'Average' | 'Standard';
  reorderPoint?: number;
  maximumInventory?: number;
  minimumOrderQty?: number;
  safetyStockQty?: number;
}

export interface BOMComponent {
  componentItemNo: string;
  quantityPer: number;
  unitCost?: number;
  description?: string;
  scrapPct?: number;
}

export interface RecipeCreation {
  parentItemNo: string;
  components: BOMComponent[];
}

export class InventoryService {
  public prisma: PrismaClient;

  constructor(userType: string = 'app') {
    this.prisma = getPrismaClient(userType as any);
  }

  // =====================================================
  // GESTIÓN DE ARTÍCULOS
  // =====================================================

  /**
   * Crear un nuevo artículo
   */
  async createItem(itemData: ItemCreation) {
    try {
      // Verificar que el artículo no exista
      const existingItem = await this.prisma.item.findUnique({
        where: { no: itemData.no }
      });

      if (existingItem) {
        throw new Error(`El artículo ${itemData.no} ya existe`);
      }

      // Crear el artículo
      const item = await this.prisma.item.create({
        data: {
          no: itemData.no,
          description: itemData.description,
          description2: itemData.description2,
          baseUnitOfMeasure: itemData.baseUnitOfMeasure || 'PCS',
          type: itemData.type || 'Inventory',
          unitPrice: itemData.unitPrice || 0,
          unitCost: itemData.unitCost || 0,
          lastDirectCost: itemData.unitCost || 0,
          costingMethod: itemData.costingMethod || 'Average',
          reorderPoint: itemData.reorderPoint || 0,
          maximumInventory: itemData.maximumInventory || 0,
          minimumOrderQty: itemData.minimumOrderQty || 0,
          safetyStockQty: itemData.safetyStockQty || 0
        }
      });

      return {
        success: true,
        data: item,
        message: `Artículo ${item.no} creado exitosamente`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al crear el artículo'
      };
    }
  }

  /**
   * Crear una receta (BOM) para un artículo
   */
  async createRecipe(recipeData: RecipeCreation) {
    try {
      // Verificar que el artículo padre exista
      const parentItem = await this.prisma.item.findUnique({
        where: { no: recipeData.parentItemNo }
      });

      if (!parentItem) {
        throw new Error(`El artículo padre ${recipeData.parentItemNo} no existe`);
      }

      // Verificar que todos los componentes existan
      for (const component of recipeData.components) {
        const componentItem = await this.prisma.item.findUnique({
          where: { no: component.componentItemNo }
        });

        if (!componentItem) {
          throw new Error(`El componente ${component.componentItemNo} no existe`);
        }
      }

      // Eliminar componentes existentes
      await this.prisma.bOMComponent.deleteMany({
        where: { parentItemNo: recipeData.parentItemNo }
      });

      // Crear nuevos componentes
      const bomComponents = await Promise.all(
        recipeData.components.map((component, index) =>
          this.prisma.bOMComponent.create({
            data: {
              parentItemNo: recipeData.parentItemNo,
              lineNo: (index + 1) * 10000, // Numeración estilo BC
              type: 'Item',
              no: component.componentItemNo,
              description: component.description,
              quantityPer: component.quantityPer,
              unitCost: component.unitCost || 0,
              scrapPct: component.scrapPct || 0,
              unitOfMeasureCode: 'PCS'
            }
          })
        )
      );

      // Calcular costo estándar basado en componentes
      const standardCost = await this.calculateStandardCost(recipeData.parentItemNo);
      
      // Actualizar costo estándar del artículo padre
      await this.prisma.item.update({
        where: { no: recipeData.parentItemNo },
        data: { standardCost }
      });

      return {
        success: true,
        data: bomComponents,
        standardCost,
        message: `Receta creada para ${recipeData.parentItemNo} con ${bomComponents.length} componentes`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al crear la receta'
      };
    }
  }

  /**
   * Calcular costo estándar basado en componentes BOM
   */
  async calculateStandardCost(itemNo: string): Promise<number> {
    const bomComponents = await this.prisma.bOMComponent.findMany({
      where: { parentItemNo: itemNo },
      include: { componentItem: true }
    });

    let totalCost = 0;

    for (const component of bomComponents) {
      if (component.componentItem) {
        const componentCost = component.unitCost > 0 
          ? component.unitCost 
          : component.componentItem.unitCost;
        
        const adjustedQuantity = component.quantityPer * (1 + component.scrapPct / 100);
        totalCost += componentCost * adjustedQuantity;
      }
    }

    return totalCost;
  }

  // =====================================================
  // MOVIMIENTOS DE INVENTARIO
  // =====================================================

  /**
   * Registrar movimiento de inventario con cálculo de costo promedio
   */
  async postInventoryMovement(movement: InventoryMovement) {
    try {
      return await this.prisma.$transaction(async (tx: PrismaClient) => {
        // Verificar que el artículo exista
        const item = await tx.item.findUnique({
          where: { no: movement.itemNo }
        });

        if (!item) {
          throw new Error(`El artículo ${movement.itemNo} no existe`);
        }

        // Obtener inventario actual
        const currentInventory = await this.getCurrentInventory(movement.itemNo, movement.locationCode);
        
        // Calcular nuevo costo promedio si es entrada de inventario
        let newUnitCost = movement.unitCost || item.unitCost;
        
        if (['Purchase', 'Positive Adjmt.', 'Output'].includes(movement.entryType) && movement.unitCost) {
          newUnitCost = await this.calculateAverageCost(
            movement.itemNo,
            currentInventory.quantity,
            currentInventory.averageCost,
            movement.quantity,
            movement.unitCost
          );
        }

        // Crear entrada en Item Ledger Entry
        const itemLedgerEntry = await tx.itemLedgerEntry.create({
          data: {
            itemNo: movement.itemNo,
            postingDate: movement.postingDate || new Date(),
            entryType: movement.entryType,
            sourceNo: movement.sourceNo,
            documentNo: movement.documentNo,
            description: movement.description,
            locationCode: movement.locationCode || 'MAIN',
            quantity: movement.quantity,
            remainingQuantity: movement.quantity,
            unitOfMeasureCode: item.baseUnitOfMeasure,
            costAmountActual: movement.quantity * newUnitCost,
            open: true
          }
        });

        // Crear entrada en Value Entry
        const valueEntry = await tx.valueEntry.create({
          data: {
            itemLedgerEntryNo: itemLedgerEntry.entryNo,
            itemNo: movement.itemNo,
            postingDate: movement.postingDate || new Date(),
            itemLedgerEntryType: movement.entryType,
            sourceNo: movement.sourceNo,
            documentNo: movement.documentNo,
            description: movement.description,
            locationCode: movement.locationCode || 'MAIN',
            valuedQuantity: movement.quantity,
            itemLedgerEntryQty: movement.quantity,
            costAmountActual: movement.quantity * newUnitCost,
            costPerUnit: newUnitCost,
            salesAmountActual: movement.unitPrice ? movement.quantity * movement.unitPrice : 0
          }
        });

        // Actualizar costo unitario del artículo si es método de costo promedio
        if (item.costingMethod === 'Average' && ['Purchase', 'Positive Adjmt.', 'Output'].includes(movement.entryType)) {
          await tx.item.update({
            where: { no: movement.itemNo },
            data: {
              unitCost: newUnitCost,
              lastDirectCost: movement.unitCost || newUnitCost
            }
          });
        }

        return {
          success: true,
          data: {
            itemLedgerEntry,
            valueEntry,
            newUnitCost,
            newInventoryLevel: currentInventory.quantity + movement.quantity
          },
          message: `Movimiento registrado: ${movement.entryType} de ${movement.quantity} ${item.baseUnitOfMeasure} para ${movement.itemNo}`
        };
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al registrar movimiento de inventario'
      };
    }
  }

  /**
   * Calcular costo promedio ponderado
   */
  async calculateAverageCost(
    itemNo: string,
    currentQty: number,
    currentCost: number,
    newQty: number,
    newCost: number
  ): Promise<number> {
    if (currentQty <= 0) {
      return newCost;
    }

    const totalValue = (currentQty * currentCost) + (newQty * newCost);
    const totalQuantity = currentQty + newQty;

    return totalQuantity > 0 ? totalValue / totalQuantity : newCost;
  }

  /**
   * Obtener inventario actual de un artículo
   */
  async getCurrentInventory(itemNo: string, locationCode: string = 'MAIN') {
    const entries = await this.prisma.itemLedgerEntry.findMany({
      where: {
        itemNo,
        locationCode,
        open: true
      }
    });

    const quantity = entries.reduce((sum: number, entry: { quantity: number }) => sum + entry.quantity, 0);
    
    // Calcular costo promedio actual
    const valueEntries = await this.prisma.valueEntry.findMany({
      where: {
        itemNo,
        locationCode
      }
    });

    const totalValue = valueEntries.reduce((sum: number, entry: { costAmountActual: number }) => sum + entry.costAmountActual, 0);
    const totalQty = valueEntries.reduce((sum: number, entry: { valuedQuantity: number }) => sum + entry.valuedQuantity, 0);
    const averageCost = totalQty > 0 ? totalValue / totalQty : 0;

    return {
      quantity,
      averageCost,
      totalValue
    };
  }

  // =====================================================
  // AJUSTES DE INVENTARIO
  // =====================================================

  /**
   * Crear ajuste positivo de inventario
   */
  async createPositiveAdjustment(
    itemNo: string,
    quantity: number,
    unitCost: number,
    reasonCode: string = 'AJUSTE',
    description?: string
  ) {
    const documentNo = await this.generateDocumentNumber('ADJ-POS');
    
    return await this.postInventoryMovement({
      itemNo,
      entryType: 'Positive Adjmt.',
      quantity,
      unitCost,
      documentNo,
      description: description || `Ajuste positivo - ${reasonCode}`,
      sourceNo: reasonCode
    });
  }

  /**
   * Crear ajuste negativo de inventario
   */
  async createNegativeAdjustment(
    itemNo: string,
    quantity: number,
    reasonCode: string = 'AJUSTE',
    description?: string
  ) {
    const documentNo = await this.generateDocumentNumber('ADJ-NEG');
    
    return await this.postInventoryMovement({
      itemNo,
      entryType: 'Negative Adjmt.',
      quantity: -Math.abs(quantity), // Asegurar que sea negativo
      documentNo,
      description: description || `Ajuste negativo - ${reasonCode}`,
      sourceNo: reasonCode
    });
  }

  // =====================================================
  // ÓRDENES DE COMPRA
  // =====================================================

  /**
   * Crear orden de compra
   */
  async createPurchaseOrder(orderData: {
    vendorNo: string;
    orderDate?: Date;
    expectedReceiptDate?: Date;
    lines: Array<{
      itemNo: string;
      quantity: number;
      directUnitCost: number;
      description?: string;
      locationCode?: string;
      lineDiscountPct?: number;
      vatPct?: number;
    }>;
  }) {
    try {
      return await this.prisma.$transaction(async (tx: PrismaClient) => {
        // Verificar que el proveedor exista
        const vendor = await tx.vendor.findUnique({
          where: { no: orderData.vendorNo }
        });

        if (!vendor) {
          throw new Error(`El proveedor ${orderData.vendorNo} no existe`);
        }

        // Generar número de documento
        const documentNo = await this.generateDocumentNumber('PO');

        // Crear cabecera de orden de compra
        const purchaseHeader = await tx.purchaseHeader.create({
          data: {
            documentType: 'Order',
            no: documentNo,
            buyFromVendorNo: orderData.vendorNo,
            buyFromVendorName: vendor.name,
            orderDate: orderData.orderDate || new Date(),
            postingDate: new Date(),
            expectedReceiptDate: orderData.expectedReceiptDate,
            status: 'Open'
          }
        });

        // Crear líneas de orden de compra
        const purchaseLines = await Promise.all(
          orderData.lines.map((line, index) =>
            tx.purchaseLine.create({
              data: {
                documentType: 'Order',
                documentNo: documentNo,
                lineNo: (index + 1) * 10000,
                type: 'Item',
                no: line.itemNo,
                description: line.description,
                quantity: line.quantity,
                outstandingQuantity: line.quantity,
                qtyToReceive: line.quantity,
                directUnitCost: line.directUnitCost,
                unitCostLCY: line.directUnitCost,
                lineDiscountPct: line.lineDiscountPct || 0,
                vatPct: line.vatPct || 15,
                lineDiscountAmount: (line.quantity * line.directUnitCost * (line.lineDiscountPct || 0)) / 100,
                amount: line.quantity * line.directUnitCost * (1 - (line.lineDiscountPct || 0) / 100),
                amountIncludingVAT: line.quantity * line.directUnitCost * (1 - (line.lineDiscountPct || 0) / 100) * (1 + (line.vatPct || 15) / 100),
                locationCode: line.locationCode || 'MAIN'
              }
            })
          )
        );

        // Calcular totales
        const totalAmount = purchaseLines.reduce((sum, line) => sum + line.amount, 0);
        const totalAmountIncludingVAT = purchaseLines.reduce((sum, line) => sum + line.amountIncludingVAT, 0);

        // Actualizar totales en cabecera
        await tx.purchaseHeader.update({
          where: { no: documentNo },
          data: {
            amount: totalAmount,
            amountIncludingVAT: totalAmountIncludingVAT
          }
        });

        return {
          success: true,
          data: {
            header: purchaseHeader,
            lines: purchaseLines
          },
          message: `Orden de compra ${documentNo} creada con ${purchaseLines.length} líneas`
        };
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al crear orden de compra'
      };
    }
  }

  /**
   * Recibir orden de compra (crear movimientos de inventario)
   */
  async receivePurchaseOrder(documentNo: string, linesToReceive?: Array<{ lineNo: number; qtyToReceive: number }>) {
    try {
      return await this.prisma.$transaction(async (tx: PrismaClient) => {
        // Obtener orden de compra
        const purchaseHeader = await tx.purchaseHeader.findUnique({
          where: { no: documentNo },
          include: { purchaseLines: true }
        });

        if (!purchaseHeader) {
          throw new Error(`Orden de compra ${documentNo} no encontrada`);
        }

        if (purchaseHeader.status !== 'Released') {
          throw new Error(`Orden de compra ${documentNo} debe estar liberada para recibir`);
        }

        const movements = [];

        // Procesar líneas a recibir
        for (const line of purchaseHeader.purchaseLines) {
          let qtyToReceive = line.qtyToReceive;

          // Si se especificaron líneas específicas, usar esas cantidades
          if (linesToReceive) {
            const lineToReceive = linesToReceive.find(l => l.lineNo === line.lineNo);
            if (lineToReceive) {
              qtyToReceive = lineToReceive.qtyToReceive;
            } else {
              continue; // Saltar esta línea si no está en la lista
            }
          }

          if (qtyToReceive > 0 && line.type === 'Item') {
            // Crear movimiento de inventario
            const movement = await this.postInventoryMovement({
              itemNo: line.no,
              entryType: 'Purchase',
              quantity: qtyToReceive,
              unitCost: line.directUnitCost,
              documentNo: documentNo,
              sourceNo: purchaseHeader.buyFromVendorNo,
              description: `Recepción OC ${documentNo}`,
              locationCode: line.locationCode
            });

            movements.push(movement);

            // Actualizar línea de compra
            await tx.purchaseLine.update({
              where: {
                documentNo_lineNo: {
                  documentNo: documentNo,
                  lineNo: line.lineNo
                }
              },
              data: {
                quantityReceived: line.quantityReceived + qtyToReceive,
                outstandingQuantity: line.outstandingQuantity - qtyToReceive,
                qtyToReceive: Math.max(0, line.qtyToReceive - qtyToReceive)
              }
            });
          }
        }

        return {
          success: true,
          data: movements,
          message: `Recepción completada para ${movements.length} líneas de la orden ${documentNo}`
        };
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al recibir orden de compra'
      };
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  /**
   * Generar número de documento
   */
  async generateDocumentNumber(prefix: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Buscar el último número del día
    const lastDoc = await this.prisma.itemLedgerEntry.findFirst({
      where: {
        documentNo: {
          startsWith: `${prefix}-${year}${month}${day}`
        }
      },
      orderBy: {
        documentNo: 'desc'
      }
    });

    let sequence = 1;
    if (lastDoc) {
      const lastSequence = parseInt(lastDoc.documentNo.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Obtener resumen de inventario
   */
  async getInventorySummary(locationCode: string = 'MAIN') {
    const items = await this.prisma.item.findMany({
      where: {
        type: 'Inventory',
        blocked: false
      }
    });

    const summary = [];

    for (const item of items) {
      const inventory = await this.getCurrentInventory(item.no, locationCode);
      
      summary.push({
        itemNo: item.no,
        description: item.description,
        quantity: inventory.quantity,
        unitCost: inventory.averageCost,
        totalValue: inventory.totalValue,
        reorderPoint: item.reorderPoint,
        needsReorder: inventory.quantity <= item.reorderPoint
      });
    }

    return summary;
  }

  /**
   * Exportar movimientos para Business Central
   */
  async exportMovementsForBC(dateFrom: Date, dateTo: Date) {
    const movements = await this.prisma.itemLedgerEntry.findMany({
      where: {
        postingDate: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      include: {
        item: true,
        valueEntries: true
      },
      orderBy: {
        postingDate: 'asc'
      }
    });

    

    // Formatear para compatibilidad con BC
    return movements.map((movement: { itemNo: string; postingDate: Date; entryType: string; documentNo: string; description?: string; locationCode: string; quantity: number; unitOfMeasureCode: string; costAmountActual: number; salesAmountActual: number; sourceNo?: string; globalDimension1Code?: string; globalDimension2Code?: string }) => ({
      'Item No.': movement.itemNo,
      'Posting Date': movement.postingDate.toISOString().split('T')[0],
      'Entry Type': movement.entryType,
      'Document No.': movement.documentNo,
      'Description': movement.description,
      'Location Code': movement.locationCode,
      'Quantity': movement.quantity,
      'Unit of Measure Code': movement.unitOfMeasureCode,
      'Cost Amount (Actual)': movement.costAmountActual,
      'Sales Amount (Actual)': movement.salesAmountActual,
      'Source No.': movement.sourceNo,
      'Global Dimension 1 Code': movement.globalDimension1Code,
      'Global Dimension 2 Code': movement.globalDimension2Code
    }));
  }
} 