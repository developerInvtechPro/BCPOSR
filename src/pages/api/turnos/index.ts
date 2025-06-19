import { NextApiRequest, NextApiResponse } from 'next';
import { turnoService, TurnoData } from '../../../lib/turno-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Crear nuevo turno
    try {
      const turnoData: TurnoData = req.body;
      
      const result = await turnoService.crearTurno(turnoData);
      
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
    // Listar turnos o obtener turno actual
    try {
      const { 
        fechaDesde, 
        fechaHasta, 
        usuario, 
        estado, 
        sucursal,
        limit = '50',
        offset = '0',
        actual = 'false'
      } = req.query;

      if (actual === 'true') {
        // Obtener turno actual
        const result = await turnoService.obtenerTurnoActual(
          sucursal as string,
          req.query.codigoPV as string
        );
        
        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(404).json(result);
        }
      } else {
        // Listar turnos
        const result = await turnoService.listarTurnos(
          {
            fechaDesde: fechaDesde as string,
            fechaHasta: fechaHasta as string,
            usuario: usuario as string,
            estado: estado as string,
            sucursal: sucursal as string
          },
          parseInt(limit as string),
          parseInt(offset as string)
        );

        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(400).json(result);
        }
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Error interno del servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }
} 