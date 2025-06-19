import { NextApiRequest, NextApiResponse } from 'next';
import { facturaService, FacturaData } from '../../../lib/factura-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Crear nueva factura
    try {
      const facturaData: FacturaData = req.body;
      
      const result = await facturaService.crearFactura(facturaData);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  } else if (req.method === 'GET') {
    // Listar facturas
    try {
      const { 
        fechaDesde, 
        fechaHasta, 
        cliente, 
        correlativo, 
        estado, 
        usuario,
        limit = '50',
        offset = '0'
      } = req.query;

      const filtro = {
        fechaDesde: fechaDesde as string,
        fechaHasta: fechaHasta as string,
        cliente: cliente as string,
        correlativo: correlativo as string,
        estado: estado as string,
        usuario: usuario as string
      };

      const result = await facturaService.listarFacturas(
        filtro,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).json({
      success: false,
      message: `Método ${req.method} no permitido`
    });
  }
} 