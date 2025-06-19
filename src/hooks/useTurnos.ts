import { useState, useEffect } from 'react';
import { TurnoData, TurnoFiltro } from '../lib/turno-service';

interface Turno {
  id: number;
  numero: number;
  fechaApertura: string;
  fechaCierre?: string;
  horaApertura: string;
  horaCierre?: string;
  montoApertura: number;
  montoCierre?: number;
  ventasDelTurno: number;
  usuarioApertura: string;
  usuarioCierre?: string;
  estado: string;
  observaciones?: string;
  sucursal?: string;
  codigoPV?: string;
  facturas?: Array<{
    id: number;
    numero: string;
    total: number;
  }>;
}

export const useTurnos = () => {
  const [turnoActual, setTurnoActual] = useState<Turno | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener turno actual
  const obtenerTurnoActual = async (sucursal?: string, codigoPV?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        actual: 'true',
        ...(sucursal && { sucursal }),
        ...(codigoPV && { codigoPV })
      });

      const response = await fetch(`/api/turnos?${params}`);
      const result = await response.json();

      if (result.success) {
        setTurnoActual(result.data);
        return result.data;
      } else {
        setTurnoActual(null);
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo turno
  const crearTurno = async (turnoData: TurnoData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/turnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(turnoData),
      });

      const result = await response.json();

      if (result.success) {
        setTurnoActual(result.data);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar turno
  const cerrarTurno = async (id: number, data: {
    fechaCierre: Date;
    horaCierre: string;
    montoCierre: number;
    usuarioCierre: string;
    ventasDelTurno: number;
    observaciones?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: 'cerrar',
          ...data
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTurnoActual(null);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Listar turnos
  const listarTurnos = async (filtro: TurnoFiltro = {}, limit = 50, offset = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(filtro.fechaDesde && { fechaDesde: filtro.fechaDesde }),
        ...(filtro.fechaHasta && { fechaHasta: filtro.fechaHasta }),
        ...(filtro.usuario && { usuario: filtro.usuario }),
        ...(filtro.estado && { estado: filtro.estado }),
        ...(filtro.sucursal && { sucursal: filtro.sucursal })
      });

      const response = await fetch(`/api/turnos?${params}`);
      const result = await response.json();

      if (result.success) {
        setTurnos(result.data);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar ventas del turno
  const actualizarVentasTurno = async (id: number, ventasDelTurno: number) => {
    try {
      const response = await fetch(`/api/turnos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion: 'actualizarVentas',
          ventasDelTurno
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el turno actual si es el mismo
        if (turnoActual && turnoActual.id === id) {
          setTurnoActual(prev => prev ? { ...prev, ventasDelTurno } : null);
        }
        return result;
      } else {
        return result;
      }
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  // Obtener siguiente número de turno
  const obtenerSiguienteNumero = async (sucursal?: string, codigoPV?: string) => {
    try {
      const params = new URLSearchParams({
        ...(sucursal && { sucursal }),
        ...(codigoPV && { codigoPV })
      });

      const response = await fetch(`/api/turnos/siguiente-numero?${params}`);
      const result = await response.json();

      return result;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return {
    turnoActual,
    turnos,
    loading,
    error,
    obtenerTurnoActual,
    crearTurno,
    cerrarTurno,
    listarTurnos,
    actualizarVentasTurno,
    obtenerSiguienteNumero
  };
}; 