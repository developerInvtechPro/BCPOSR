import { NextApiRequest, NextApiResponse } from 'next';
import { facturaService } from '../../../lib/factura-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { serie } = req.query;
      
      if (!serie || typeof serie !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Serie es requerida'
        });
      }

      const siguienteCorrelativo = await facturaService.obtenerSiguienteCorrelativo(serie);
      
      res.status(200).json({
        success: true,
        data: {
          siguienteCorrelativo,
          numeroFactura: `${serie}-${siguienteCorrelativo.toString().padStart(8, '0')}`
        }
      });
    } catch (error: any) {
      console.error('Error al obtener siguiente correlativo:', error);
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