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
      case 'DELETE':
        return await handleDelete(req, res, inventoryService);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de artículos:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error interno del servidor'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { itemNo, summary, locationCode } = req.query;

  if (summary === 'true') {
    // Obtener resumen de inventario
    const inventorySummary = await inventoryService.getInventorySummary(locationCode as string);
    return res.status(200).json({
      success: true,
      data: inventorySummary,
      message: 'Resumen de inventario obtenido exitosamente'
    });
  }

  if (itemNo) {
    // Obtener artículo específico con inventario actual
    const item = await inventoryService.prisma.item.findUnique({
      where: { no: itemNo as string },
      include: {
        bomComponents: {
          include: { componentItem: true }
        }
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Artículo no encontrado',
        message: `El artículo ${itemNo} no existe`
      });
    }

    const inventory = await inventoryService.getCurrentInventory(itemNo as string, locationCode as string);

    return res.status(200).json({
      success: true,
      data: {
        ...item,
        currentInventory: inventory
      },
      message: 'Artículo obtenido exitosamente'
    });
  }

  // Obtener todos los artículos
  const items = await inventoryService.prisma.item.findMany({
    orderBy: { no: 'asc' }
  });

  return res.status(200).json({
    success: true,
    data: items,
    message: 'Artículos obtenidos exitosamente'
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const itemData = req.body;

  // Validar datos requeridos
  if (!itemData.no || !itemData.description) {
    return res.status(400).json({
      success: false,
      error: 'Datos incompletos',
      message: 'Se requiere número de artículo y descripción'
    });
  }

  const result = await inventoryService.createItem(itemData);

  if (result.success) {
    return res.status(201).json(result);
  } else {
    return res.status(400).json(result);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { itemNo } = req.query;
  const updateData = req.body;

  if (!itemNo) {
    return res.status(400).json({
      success: false,
      error: 'Número de artículo requerido',
      message: 'Se debe especificar el número de artículo a actualizar'
    });
  }

  try {
    const updatedItem = await inventoryService.prisma.item.update({
      where: { no: itemNo as string },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: updatedItem,
      message: 'Artículo actualizado exitosamente'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Artículo no encontrado',
        message: `El artículo ${itemNo} no existe`
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al actualizar artículo'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { itemNo } = req.query;

  if (!itemNo) {
    return res.status(400).json({
      success: false,
      error: 'Número de artículo requerido',
      message: 'Se debe especificar el número de artículo a eliminar'
    });
  }

  try {
    // Verificar que no tenga movimientos de inventario
    const movements = await inventoryService.prisma.itemLedgerEntry.findFirst({
      where: { itemNo: itemNo as string }
    });

    if (movements) {
      return res.status(400).json({
        success: false,
        error: 'Artículo con movimientos',
        message: 'No se puede eliminar un artículo que tiene movimientos de inventario'
      });
    }

    // Eliminar componentes BOM primero
    await inventoryService.prisma.bOMComponent.deleteMany({
      where: { parentItemNo: itemNo as string }
    });

    // Eliminar artículo
    await inventoryService.prisma.item.delete({
      where: { no: itemNo as string }
    });

    return res.status(200).json({
      success: true,
      message: 'Artículo eliminado exitosamente'
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Artículo no encontrado',
        message: `El artículo ${itemNo} no existe`
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al eliminar artículo'
    });
  }
} 