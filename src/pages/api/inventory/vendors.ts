import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error: any) {
    console.error('Error en API de proveedores:', error);
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
  try {
    const vendors = await prisma.vendor.findMany({
      select: {
        no: true,
        name: true,
        address: true,
        city: true,
        contact: true,
        phoneNo: true,
        email: true,
        currencyCode: true,
        paymentTermsCode: true,
        blocked: true,
        balance: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: vendors,
      message: 'Proveedores obtenidos exitosamente'
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al obtener proveedores'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      no,
      name,
      address,
      city,
      contact,
      phoneNo,
      email,
      currencyCode = 'HNL',
      paymentTermsCode,
      blocked = ''
    } = req.body;

    // Validaciones
    if (!no || !name) {
      return res.status(400).json({
        success: false,
        error: 'Código y nombre son requeridos'
      });
    }

    // Verificar que el proveedor no exista
    const existingVendor = await prisma.vendor.findUnique({
      where: { no }
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        error: `El proveedor ${no} ya existe`
      });
    }

    const vendor = await prisma.vendor.create({
      data: {
        no,
        name,
        address,
        city,
        contact,
        phoneNo,
        email,
        currencyCode,
        paymentTermsCode,
        blocked
      }
    });

    return res.status(201).json({
      success: true,
      data: vendor,
      message: `Proveedor ${vendor.no} creado exitosamente`
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al crear proveedor'
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { no } = req.query;
    const updateData = req.body;

    if (!no) {
      return res.status(400).json({
        success: false,
        error: 'Código de proveedor requerido'
      });
    }

    const vendor = await prisma.vendor.update({
      where: { no: no as string },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      data: vendor,
      message: `Proveedor ${vendor.no} actualizado exitosamente`
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al actualizar proveedor'
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { no } = req.query;

    if (!no) {
      return res.status(400).json({
        success: false,
        error: 'Código de proveedor requerido'
      });
    }

    await prisma.vendor.delete({
      where: { no: no as string }
    });

    return res.status(200).json({
      success: true,
      message: `Proveedor ${no} eliminado exitosamente`
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
      message: 'Error al eliminar proveedor'
    });
  }
} 