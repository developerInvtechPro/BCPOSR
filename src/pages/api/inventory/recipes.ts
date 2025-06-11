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
    console.error('Error en API de recetas:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error interno del servidor'
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { parentItemNo, calculate } = req.query;

  try {
    if (parentItemNo) {
      // Obtener receta específica
      const bomComponents = await inventoryService.prisma.bOMComponent.findMany({
        where: { parentItemNo: parentItemNo as string },
        include: { 
          componentItem: true,
          parentItem: true
        },
        orderBy: { lineNo: 'asc' }
      });

      if (bomComponents.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Receta no encontrada',
          message: `No se encontró receta para el artículo ${parentItemNo}`
        });
      }

      let standardCost = 0;
      if (calculate === 'true') {
        standardCost = await inventoryService.calculateStandardCost(parentItemNo as string);
      }

      return res.status(200).json({
        success: true,
        data: {
          parentItemNo,
          components: bomComponents,
          standardCost
        },
        message: 'Receta obtenida exitosamente'
      });
    }

    // Obtener todas las recetas (artículos que tienen componentes)
    const recipes = await inventoryService.prisma.bOMComponent.findMany({
      distinct: ['parentItemNo'],
      include: {
        parentItem: true
      },
      orderBy: {
        parentItemNo: 'asc'
      }
    });

    const recipeList = recipes.map(recipe => ({
      parentItemNo: recipe.parentItemNo,
      parentItemDescription: recipe.parentItem?.description,
      componentCount: 0 // Se calculará después
    }));

    // Contar componentes para cada receta
    for (const recipe of recipeList) {
      const componentCount = await inventoryService.prisma.bOMComponent.count({
        where: { parentItemNo: recipe.parentItemNo }
      });
      recipe.componentCount = componentCount;
    }

    return res.status(200).json({
      success: true,
      data: recipeList,
      message: 'Lista de recetas obtenida exitosamente'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al obtener recetas'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const recipeData = req.body;

  // Validar datos requeridos
  if (!recipeData.parentItemNo || !recipeData.components || recipeData.components.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Datos incompletos',
      message: 'Se requiere parentItemNo y al menos un componente'
    });
  }

  // Validar que cada componente tenga los datos requeridos
  for (const component of recipeData.components) {
    if (!component.componentItemNo || !component.quantityPer) {
      return res.status(400).json({
        success: false,
        error: 'Datos de componente incompletos',
        message: 'Cada componente debe tener componentItemNo y quantityPer'
      });
    }
  }

  const result = await inventoryService.createRecipe(recipeData);

  if (result.success) {
    return res.status(201).json(result);
  } else {
    return res.status(400).json(result);
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { parentItemNo } = req.query;
  const recipeData = req.body;

  if (!parentItemNo) {
    return res.status(400).json({
      success: false,
      error: 'Artículo padre requerido',
      message: 'Se debe especificar el artículo padre de la receta'
    });
  }

  // Actualizar receta (eliminar existente y crear nueva)
  const updateData = {
    parentItemNo: parentItemNo as string,
    components: recipeData.components
  };

  const result = await inventoryService.createRecipe(updateData);

  if (result.success) {
    return res.status(200).json({
      ...result,
      message: 'Receta actualizada exitosamente'
    });
  } else {
    return res.status(400).json(result);
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, inventoryService: InventoryService) {
  const { parentItemNo, lineNo } = req.query;

  if (!parentItemNo) {
    return res.status(400).json({
      success: false,
      error: 'Artículo padre requerido',
      message: 'Se debe especificar el artículo padre'
    });
  }

  try {
    if (lineNo) {
      // Eliminar componente específico
      await inventoryService.prisma.bOMComponent.delete({
        where: {
          parentItemNo_lineNo: {
            parentItemNo: parentItemNo as string,
            lineNo: parseInt(lineNo as string)
          }
        }
      });

      // Recalcular costo estándar
      const standardCost = await inventoryService.calculateStandardCost(parentItemNo as string);
      
      await inventoryService.prisma.item.update({
        where: { no: parentItemNo as string },
        data: { standardCost }
      });

      return res.status(200).json({
        success: true,
        standardCost,
        message: 'Componente eliminado exitosamente'
      });
    } else {
      // Eliminar toda la receta
      await inventoryService.prisma.bOMComponent.deleteMany({
        where: { parentItemNo: parentItemNo as string }
      });

      // Resetear costo estándar
      await inventoryService.prisma.item.update({
        where: { no: parentItemNo as string },
        data: { standardCost: 0 }
      });

      return res.status(200).json({
        success: true,
        message: 'Receta eliminada exitosamente'
      });
    }
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Componente no encontrado',
        message: 'El componente especificado no existe'
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al eliminar componente/receta'
    });
  }
} 