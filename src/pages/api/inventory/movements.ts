import { NextApiRequest, NextApiResponse } from 'next';
import { InventoryService } from '../../../lib/inventory-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const inventoryService = new InventoryService();

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, inventoryService);
      case 'POST':
        return await handlePost(req, res, inventoryService);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de movimientos:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error interno del servidor'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { itemNo, dateFrom, dateTo, entryType, export: exportData } = req.query;

  try {
    if (exportData === 'true') {
      // Exportar movimientos para Business Central
      const fromDate = dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const toDate = dateTo ? new Date(dateTo as string) : new Date();
      
      const exportedData = await inventoryService.exportMovementsForBC(fromDate, toDate);
      
      return res.status(200).json({
        success: true,
        data: exportedData,
        message: 'Movimientos exportados para Business Central'
      });
    }

    // Construir filtros
    const where: any = {};
    
    if (itemNo) {
      where.itemNo = itemNo;
    }
    
    if (entryType) {
      where.entryType = entryType;
    }
    
    if (dateFrom || dateTo) {
      where.postingDate = {};
      if (dateFrom) {
        where.postingDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.postingDate.lte = new Date(dateTo as string);
      }
    }

    // Obtener movimientos con información relacionada
    const movements = await inventoryService.prisma.itemLedgerEntry.findMany({
      where,
      include: {
        item: true,
        valueEntries: true
      },
      orderBy: {
        postingDate: 'desc'
      },
      take: 100 // Limitar a 100 registros por defecto
    });

    return res.status(200).json({
      success: true,
      data: movements,
      message: 'Movimientos obtenidos exitosamente'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al obtener movimientos'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { type, ...movementData } = req.body;

  // Validar datos requeridos
  if (!movementData.itemNo || !movementData.quantity || !movementData.documentNo) {
    return res.status(400).json({
      success: false,
      error: 'Datos incompletos',
      message: 'Se requiere itemNo, quantity y documentNo'
    });
  }

  try {
    let result;

    switch (type) {
      case 'adjustment-positive':
        result = await inventoryService.createPositiveAdjustment(
          movementData.itemNo,
          movementData.quantity,
          movementData.unitCost,
          movementData.reasonCode,
          movementData.description
        );
        break;

      case 'adjustment-negative':
        result = await inventoryService.createNegativeAdjustment(
          movementData.itemNo,
          movementData.quantity,
          movementData.reasonCode,
          movementData.description
        );
        break;

      case 'manual':
        result = await inventoryService.postInventoryMovement({
          itemNo: movementData.itemNo,
          entryType: movementData.entryType,
          quantity: movementData.quantity,
          unitCost: movementData.unitCost,
          unitPrice: movementData.unitPrice,
          documentNo: movementData.documentNo,
          sourceNo: movementData.sourceNo,
          description: movementData.description,
          locationCode: movementData.locationCode,
          postingDate: movementData.postingDate ? new Date(movementData.postingDate) : undefined
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de movimiento no válido',
          message: 'Los tipos válidos son: adjustment-positive, adjustment-negative, manual'
        });
    }

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al crear movimiento de inventario'
    });
  }
} 