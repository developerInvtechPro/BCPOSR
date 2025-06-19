import { NextApiRequest, NextApiResponse } from 'next';
import { turnoService } from '../../../lib/turno-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const turnoId = parseInt(id as string);

  if (isNaN(turnoId)) {
    return res.status(400).json({
      success: false,
      message: 'ID de turno inválido'
    });
  }

  if (req.method === 'GET') {
    // Obtener turno por ID
    try {
      const result = await turnoService.obtenerTurno(turnoId);
      
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
  } else if (req.method === 'PUT') {
    // Cerrar turno o actualizar ventas
    try {
      const { accion, ...data } = req.body;

      if (accion === 'cerrar') {
        const result = await turnoService.cerrarTurno(turnoId, {
          fechaCierre: new Date(data.fechaCierre),
          horaCierre: data.horaCierre,
          montoCierre: data.montoCierre,
          usuarioCierre: data.usuarioCierre,
          ventasDelTurno: data.ventasDelTurno,
          observaciones: data.observaciones
        });

        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(400).json(result);
        }
      } else if (accion === 'actualizarVentas') {
        const result = await turnoService.actualizarVentasTurno(turnoId, data.ventasDelTurno);

        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(400).json(result);
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Acción no válida'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }
} 