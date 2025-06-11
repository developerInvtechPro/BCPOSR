import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de costo de artículo:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error interno del servidor'
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { itemNo } = req.query;

  if (!itemNo) {
    return res.status(400).json({
      success: false,
      error: 'Número de artículo requerido',
      message: 'Se debe especificar el número de artículo'
    });
  }

  try {
    // Obtener el artículo para el costo base
    const item = await prisma.item.findUnique({
      where: { no: itemNo as string },
      select: {
        no: true,
        description: true,
        unitCost: true,
        lastDirectCost: true,
        standardCost: true,
        baseUnitOfMeasure: true
      }
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Artículo no encontrado',
        message: `El artículo ${itemNo} no existe`
      });
    }

    // Buscar el costo más reciente en órdenes de compra
    const recentPurchaseLine = await prisma.purchaseLine.findFirst({
      where: { 
        no: itemNo as string,
        documentType: 'Order'
      },
      orderBy: {
        purchaseHeader: {
          orderDate: 'desc'
        }
      },
      include: {
        purchaseHeader: true
      }
    });

    // Buscar el costo más reciente en movimientos de inventario
    const recentMovement = await prisma.itemLedgerEntry.findFirst({
      where: { 
        itemNo: itemNo as string,
        entryType: {
          in: ['Purchase', 'Positive Adjmt.']
        }
      },
      orderBy: {
        postingDate: 'desc'
      }
    });

    let recommendedCost = item.unitCost;
    let costSource = 'standard';

    // Priorizar costo de órdenes de compra más recientes
    if (recentPurchaseLine) {
      recommendedCost = recentPurchaseLine.directUnitCost;
      costSource = 'purchase_order';
    } else if (recentMovement && recentMovement.costAmountActual !== 0 && recentMovement.quantity !== 0) {
      recommendedCost = Math.abs(recentMovement.costAmountActual / recentMovement.quantity);
      costSource = 'last_movement';
    } else if (item.lastDirectCost > 0) {
      recommendedCost = item.lastDirectCost;
      costSource = 'last_direct_cost';
    }

    return res.status(200).json({
      success: true,
      data: {
        itemNo: item.no,
        description: item.description,
        unitCost: recommendedCost,
        standardCost: item.standardCost,
        lastDirectCost: item.lastDirectCost,
        baseUnitOfMeasure: item.baseUnitOfMeasure,
        costSource,
        recentPurchaseDate: recentPurchaseLine?.purchaseHeader?.orderDate || null,
        recentMovementDate: recentMovement?.postingDate || null
      },
      message: 'Costo de artículo obtenido exitosamente'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al obtener costo del artículo'
    });
  }
} 