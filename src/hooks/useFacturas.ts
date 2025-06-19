import { useState, useEffect } from 'react';
import { FacturaData, FacturaFiltro } from '../lib/factura-service';

interface Factura {
  id: number;
  numero: string;
  correlativo: number;
  cai: string;
  fecha: string;
  tipoCliente: string;
  subtotal: number;
  descuento: number;
  isv15: number;
  isv18: number;
  total: number;
  medioPago: string;
  sucursal?: string;
  codigoPV?: string;
  usuario?: string;
  turno?: string;
  mesaNumero?: number;
  tipoPedido?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  clienteRTN?: string;
  direccion?: string;
  proveedor?: string;
  observaciones?: string;
  estado: string;
  fechaAnulacion?: string;
  motivoAnulacion?: string;
  usuarioAnulacion?: string;
  items: Array<{
    id: number;
    codigoProducto: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    descuento: number;
    impuesto: number;
    total: number;
    notas?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Estadisticas {
  totalFacturas: number;
  totalVentas: number;
  promedioTicket: number;
  facturasPorMedioPago: Array<{
    medioPago: string;
    total: number;
    cantidad: number;
  }>;
}

export const useFacturas = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  // Crear factura
  const crearFactura = async (facturaData: FacturaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facturaData),
      });

      const result = await response.json();

      if (result.success) {
        // Agregar la nueva factura al estado
        setFacturas(prev => [result.data, ...prev]);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Listar facturas
  const listarFacturas = async (filtro: FacturaFiltro = {}, limit: number = 50, offset: number = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filtro.fechaDesde) params.append('fechaDesde', filtro.fechaDesde);
      if (filtro.fechaHasta) params.append('fechaHasta', filtro.fechaHasta);
      if (filtro.cliente) params.append('cliente', filtro.cliente);
      if (filtro.correlativo) params.append('correlativo', filtro.correlativo);
      if (filtro.estado) params.append('estado', filtro.estado);
      if (filtro.usuario) params.append('usuario', filtro.usuario);
      
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/facturas?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setFacturas(result.data.facturas);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener factura por ID
  const obtenerFactura = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/facturas/${id}`);
      const result = await response.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Anular factura
  const anularFactura = async (id: number, motivo: string, usuarioAnulacion: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/facturas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo, usuarioAnulacion }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar la factura en el estado
        setFacturas(prev => prev.map(f => 
          f.id === id ? { ...f, estado: 'anulada', fechaAnulacion: result.data.fechaAnulacion, motivoAnulacion: motivo, usuarioAnulacion } : f
        ));
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Obtener estadísticas
  const obtenerEstadisticas = async (fechaDesde?: string, fechaHasta?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fechaDesde', fechaDesde);
      if (fechaHasta) params.append('fechaHasta', fechaHasta);

      const response = await fetch(`/api/facturas/estadisticas?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setEstadisticas(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.message);
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Cargar facturas al inicializar
  useEffect(() => {
    listarFacturas();
  }, []);

  return {
    facturas,
    loading,
    error,
    estadisticas,
    crearFactura,
    listarFacturas,
    obtenerFactura,
    anularFactura,
    obtenerEstadisticas,
  };
}; 