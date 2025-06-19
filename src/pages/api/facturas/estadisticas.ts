import { NextApiRequest, NextApiResponse } from 'next';
import { facturaService } from '../../../lib/factura-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      const result = await facturaService.obtenerEstadisticas(
        fechaDesde as string,
        fechaHasta as string
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
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      message: `Método ${req.method} no permitido`
    });
  }
} 