import { useState, useEffect, useCallback } from 'react';
import BusinessCentralAPI, { 
  BCConfig, 
  BCVenta, 
  BCItem, 
  BCCliente, 
  BCMedioPago, 
  BCPromocion, 
  BCPresupuestoVentas,
  BCSyncStatus 
} from '../lib/business-central-api';

interface BusinessCentralState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  lastSync: string | null;
  syncStatus: BCSyncStatus | null;
  items: BCItem[];
  clientes: BCCliente[];
  mediosPago: BCMedioPago[];
  promociones: BCPromocion[];
  presupuesto: BCPresupuestoVentas | null;
}

export const useBusinessCentral = (config?: BCConfig) => {
  const [state, setState] = useState<BusinessCentralState>({
    connected: false,
    loading: false,
    error: null,
    lastSync: null,
    syncStatus: null,
    items: [],
    clientes: [],
    mediosPago: [],
    promociones: [],
    presupuesto: null,
  });

  const [api, setApi] = useState<BusinessCentralAPI | null>(null);

  // Inicializar API cuando se proporciona configuración
  useEffect(() => {
    if (config) {
      const bcApi = new BusinessCentralAPI(config);
      setApi(bcApi);
      testConnection(bcApi);
    }
  }, [config]);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const items = JSON.parse(localStorage.getItem('bc_items') || '[]');
      const clientes = JSON.parse(localStorage.getItem('bc_clientes') || '[]');
      const mediosPago = JSON.parse(localStorage.getItem('bc_medios_pago') || '[]');
      const promociones = JSON.parse(localStorage.getItem('bc_promociones') || '[]');
      const lastSync = localStorage.getItem('ultima_sincronizacion');
      const syncStatus = JSON.parse(localStorage.getItem('estadisticas_sync') || 'null');

      setState(prev => ({
        ...prev,
        items,
        clientes,
        mediosPago,
        promociones,
        lastSync,
        syncStatus,
      }));
    }
  }, []);

  const testConnection = async (bcApi?: BusinessCentralAPI) => {
    const apiToUse = bcApi || api;
    if (!apiToUse) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiToUse.testConexion();
      setState(prev => ({
        ...prev,
        connected: result.success,
        loading: false,
        error: result.error || null,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        connected: false,
        loading: false,
        error: error.message,
      }));
    }
  };

  const sincronizarDatos = useCallback(async (sucursal: string) => {
    if (!api) throw new Error('API no inicializada');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const status = await api.sincronizacionCompleta(sucursal);
      
      // Actualizar estado con datos sincronizados
      const items = JSON.parse(localStorage.getItem('bc_items') || '[]');
      const clientes = JSON.parse(localStorage.getItem('bc_clientes') || '[]');
      const mediosPago = JSON.parse(localStorage.getItem('bc_medios_pago') || '[]');
      const promociones = JSON.parse(localStorage.getItem('bc_promociones') || '[]');

      setState(prev => ({
        ...prev,
        loading: false,
        syncStatus: status,
        lastSync: status.ultimaSincronizacion,
        items,
        clientes,
        mediosPago,
        promociones,
      }));

      // Guardar timestamp de última sincronización
      localStorage.setItem('ultima_sincronizacion', status.ultimaSincronizacion);
      localStorage.setItem('estadisticas_sync', JSON.stringify(status));

      return status;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [api]);

  const enviarVenta = useCallback(async (venta: BCVenta) => {
    if (!api) throw new Error('API no inicializada');

    try {
      const resultado = await api.enviarVenta(venta);
      
      if (!resultado.success) {
        // Si falla, guardar en cola local para envío posterior
        const ventasPendientes = JSON.parse(localStorage.getItem('ventas_pendientes') || '[]');
        ventasPendientes.push(venta);
        localStorage.setItem('ventas_pendientes', JSON.stringify(ventasPendientes));
      }

      return resultado;
    } catch (error: any) {
      // Guardar en cola local para reintento
      const ventasPendientes = JSON.parse(localStorage.getItem('ventas_pendientes') || '[]');
      ventasPendientes.push(venta);
      localStorage.setItem('ventas_pendientes', JSON.stringify(ventasPendientes));
      
      throw error;
    }
  }, [api]);

  const obtenerPresupuesto = useCallback(async (sucursal: string, fecha: string) => {
    if (!api) throw new Error('API no inicializada');

    setState(prev => ({ ...prev, loading: true }));

    try {
      const presupuesto = await api.descargarPresupuestoVentas(sucursal, fecha);
      setState(prev => ({
        ...prev,
        loading: false,
        presupuesto,
      }));
      return presupuesto;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  }, [api]);

  const descargarImagenes = useCallback(async (codigos: string[]) => {
    if (!api) throw new Error('API no inicializada');

    try {
      const imagenes = await api.descargarImagenesArticulos(codigos);
      
      // Guardar imágenes en localStorage
      const imagenesExistentes = JSON.parse(localStorage.getItem('bc_imagenes') || '{}');
      const imagenesActualizadas = { ...imagenesExistentes, ...imagenes };
      localStorage.setItem('bc_imagenes', JSON.stringify(imagenesActualizadas));

      return imagenes;
    } catch (error: any) {
      console.error('Error descargando imágenes:', error);
      throw error;
    }
  }, [api]);

  const descargarRecetas = useCallback(async (codigos: string[]) => {
    if (!api) throw new Error('API no inicializada');

    try {
      const recetas = await api.descargarRecetasProductos(codigos);
      
      // Guardar recetas en localStorage
      const recetasExistentes = JSON.parse(localStorage.getItem('bc_recetas') || '{}');
      const recetasActualizadas = { ...recetasExistentes, ...recetas };
      localStorage.setItem('bc_recetas', JSON.stringify(recetasActualizadas));

      return recetas;
    } catch (error: any) {
      console.error('Error descargando recetas:', error);
      throw error;
    }
  }, [api]);

  const iniciarSincronizacionAutomatica = useCallback(async (sucursal: string) => {
    if (!api) throw new Error('API no inicializada');

    try {
      await api.iniciarSincronizacionAutomatica(sucursal);
      console.log('Sincronización automática iniciada');
    } catch (error: any) {
      console.error('Error iniciando sincronización automática:', error);
      throw error;
    }
  }, [api]);

  const obtenerVentasPendientes = useCallback(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('ventas_pendientes') || '[]');
    }
    return [];
  }, []);

  const limpiarVentasPendientes = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ventas_pendientes', '[]');
    }
  }, []);

  const obtenerImagenes = useCallback(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('bc_imagenes') || '{}');
    }
    return {};
  }, []);

  const obtenerRecetas = useCallback(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('bc_recetas') || '{}');
    }
    return {};
  }, []);

  // Función para convertir venta del POS a formato BC
  const convertirVentaPOS = useCallback((
    ventaPOS: any,
    sucursal: string,
    vendedor: string
  ): BCVenta => {
    return {
      numero: ventaPOS.numero || `POS-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      sucursal,
      mesaNumero: ventaPOS.mesa,
      tipo: ventaPOS.tipo || 'mesa',
      cliente: {
        codigo: ventaPOS.cliente?.codigo,
        nombre: ventaPOS.cliente?.nombre || 'CONSUMIDOR FINAL',
        rtn: ventaPOS.cliente?.rtn,
        telefono: ventaPOS.cliente?.telefono,
        direccion: ventaPOS.cliente?.direccion,
      },
      items: ventaPOS.productos?.map((item: any) => ({
        codigoItem: item.codigo || 'GEN001',
        descripcion: item.descripcion || item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        descuentoLinea: item.descuento || 0,
        impuestoLinea: item.impuesto || 0,
        totalLinea: item.precio,
      })) || [],
      descuentos: ventaPOS.descuentos || [],
      impuestos: ventaPOS.impuestos || [],
      mediosPago: ventaPOS.mediosPago ? [ventaPOS.mediosPago] : [],
      subtotal: ventaPOS.subtotal || 0,
      totalDescuentos: ventaPOS.totalDescuentos || 0,
      totalImpuestos: ventaPOS.totalImpuestos || 0,
      total: ventaPOS.total || 0,
      estado: 'cerrada',
      vendedor,
      observaciones: ventaPOS.observaciones,
    };
  }, []);

  return {
    // Estado
    ...state,
    
    // Métodos de conexión
    testConnection: () => testConnection(),
    
    // Métodos de sincronización
    sincronizarDatos,
    iniciarSincronizacionAutomatica,
    
    // Métodos de ventas
    enviarVenta,
    convertirVentaPOS,
    obtenerVentasPendientes,
    limpiarVentasPendientes,
    
    // Métodos de datos
    obtenerPresupuesto,
    descargarImagenes,
    descargarRecetas,
    obtenerImagenes,
    obtenerRecetas,
    
    // Utilidades
    isConnected: state.connected,
    isLoading: state.loading,
    hasError: !!state.error,
  };
}; 