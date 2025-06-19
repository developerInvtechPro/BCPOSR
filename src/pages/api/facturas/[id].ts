import { NextApiRequest, NextApiResponse } from 'next';
import { facturaService } from '../../../lib/factura-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const facturaId = parseInt(id as string);

  if (isNaN(facturaId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de factura inválido'
    });
  }

  if (req.method === 'GET') {
    // Obtener factura por ID
    try {
      const result = await facturaService.obtenerFactura(facturaId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  } else if (req.method === 'PATCH') {
    // Anular factura
    try {
      const { motivo, usuarioAnulacion } = req.body;
      
      if (!motivo || !usuarioAnulacion) {
        return res.status(400).json({
          success: false,
          message: 'Motivo y usuario de anulación son requeridos'
        });
      }

      const result = await facturaService.anularFactura(facturaId, motivo, usuarioAnulacion);
      
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
    res.setHeader('Allow', ['GET', 'PATCH']);
    res.status(405).json({
      success: false,
      message: `Método ${req.method} no permitido`
    });
  }
} 