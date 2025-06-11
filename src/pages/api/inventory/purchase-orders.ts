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
      case 'PUT':
        return await handlePut(req, res, inventoryService);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de órdenes de compra:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error interno del servidor'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { documentNo, status, vendorNo } = req.query;

  try {
    // Construir filtros
    const where: any = {};
    
    if (documentNo) {
      where.no = documentNo;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (vendorNo) {
      where.buyFromVendorNo = vendorNo;
    }

    if (documentNo) {
      // Obtener orden específica con líneas
      const purchaseOrder = await inventoryService.prisma.purchaseHeader.findUnique({
        where: { no: documentNo as string },
        include: {
          vendor: true,
          purchaseLines: {
            include: { item: true }
          }
        }
      });

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          error: 'Orden de compra no encontrada',
          message: `La orden ${documentNo} no existe`
        });
      }

      return res.status(200).json({
        success: true,
        data: purchaseOrder,
        message: 'Orden de compra obtenida exitosamente'
      });
    }

    // Obtener todas las órdenes con filtros
    const purchaseOrders = await inventoryService.prisma.purchaseHeader.findMany({
      where,
      include: {
        vendor: true,
        purchaseLines: true
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: purchaseOrders,
      message: 'Órdenes de compra obtenidas exitosamente'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al obtener órdenes de compra'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { action, ...orderData } = req.body;

  if (action === 'receive') {
    // Recibir orden de compra
    const { documentNo, linesToReceive } = orderData;
    
    if (!documentNo) {
      return res.status(400).json({
        success: false,
        error: 'Número de documento requerido',
        message: 'Se debe especificar el número de documento a recibir'
      });
    }

    const result = await inventoryService.receivePurchaseOrder(documentNo, linesToReceive);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  }

  // Crear nueva orden de compra
  if (!orderData.vendorNo || !orderData.lines || orderData.lines.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Datos incompletos',
      message: 'Se requiere vendorNo y al menos una línea'
    });
  }

  const result = await inventoryService.createPurchaseOrder(orderData);

  if (result.success) {
    return res.status(201).json(result);
  } else {
    return res.status(400).json(result);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { documentNo } = req.query;
  const { action, ...updateData } = req.body;

  if (!documentNo) {
    return res.status(400).json({
      success: false,
      error: 'Número de documento requerido',
      message: 'Se debe especificar el número de documento a actualizar'
    });
  }

  try {
    if (action === 'release') {
      // Liberar orden de compra
      const updatedOrder = await inventoryService.prisma.purchaseHeader.update({
        where: { no: documentNo as string },
        data: { status: 'Released' }
      });

      return res.status(200).json({
        success: true,
        data: updatedOrder,
        message: 'Orden de compra liberada exitosamente'
      });
    }

    if (action === 'reopen') {
      // Reabrir orden de compra
      const updatedOrder = await inventoryService.prisma.purchaseHeader.update({
        where: { no: documentNo as string },
        data: { status: 'Open' }
      });

      return res.status(200).json({
        success: true,
        data: updatedOrder,
        message: 'Orden de compra reabierta exitosamente'
      });
    }

    // Actualización general
    const updatedOrder = await inventoryService.prisma.purchaseHeader.update({
      where: { no: documentNo as string },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: updatedOrder,
      message: 'Orden de compra actualizada exitosamente'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Orden de compra no encontrada',
        message: `La orden ${documentNo} no existe`
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al actualizar orden de compra'
    });
  }
} 