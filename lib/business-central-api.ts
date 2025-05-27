import axios, { AxiosInstance } from 'axios';

// Tipos TypeScript para Business Central
export interface BCConfig {
  baseUrl: string;
  tenantId: string;
  companyId: string;
  username: string;
  password: string;
  environment: string; // sandbox | production
}

export interface BCVenta {
  numero: string;
  fecha: string;
  sucursal: string;
  mesaNumero?: number;
  tipo: 'mesa' | 'delivery' | 'pickup' | 'barra';
  cliente: {
    codigo?: string;
    nombre: string;
    rtn?: string;
    telefono?: string;
    direccion?: string;
  };
  items: BCVentaItem[];
  descuentos: BCDescuento[];
  impuestos: BCImpuesto[];
  mediosPago: BCMedioPago[];
  subtotal: number;
  totalDescuentos: number;
  totalImpuestos: number;
  total: number;
  estado: 'abierta' | 'cerrada' | 'cancelada';
  vendedor: string;
  observaciones?: string;
}

export interface BCVentaItem {
  codigoItem: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoLinea: number;
  impuestoLinea: number;
  totalLinea: number;
}

export interface BCDescuento {
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'importe';
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  sucursales: string[];
  activo: boolean;
}

export interface BCImpuesto {
  codigo: string;
  descripcion: string;
  porcentaje: number;
}

export interface BCMedioPago {
  codigo: string;
  descripcion: string;
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
  requiereBanco: boolean;
  activo: boolean;
}

export interface BCItem {
  codigo: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precioVenta: number;
  costo: number;
  unidadMedida: string;
  activo: boolean;
  imagen?: string;
  receta?: BCRecetaItem[];
  promociones?: BCPromocion[];
}

export interface BCRecetaItem {
  codigoComponente: string;
  descripcionComponente: string;
  cantidad: number;
  unidadMedida: string;
  costo: number;
}

export interface BCPromocion {
  codigo: string;
  descripcion: string;
  tipo: '2x1' | 'descuento' | 'combo' | 'precio_especial';
  valor: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  diasSemana?: number[];
  sucursales: string[];
  items: string[];
  activo: boolean;
}

export interface BCCliente {
  codigo: string;
  nombre: string;
  rtn?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipoCliente: 'final' | 'rtn' | 'credito' | 'leal';
  limiteCredito?: number;
  saldoActual?: number;
  activo: boolean;
}

export interface BCPresupuestoVentas {
  sucursal: string;
  fecha: string;
  presupuestoDiario: number;
  ventasAcumuladas: number;
  porcentajeCumplimiento: number;
  ventasPorHora: { hora: string; ventas: number }[];
}

export interface BCSyncStatus {
  ultimaSincronizacion: string;
  estado: 'exitoso' | 'error' | 'pendiente';
  errores: string[];
  totalRegistros: number;
  registrosProcesados: number;
}

class BusinessCentralAPI {
  private api: AxiosInstance;
  private config: BCConfig;
  private lastSync: Record<string, string> = {};

  constructor(config: BCConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: `${config.baseUrl}/api/v2.0/${config.tenantId}/${config.environment}/companies(${config.companyId})`,
      auth: {
        username: config.username,
        password: config.password,
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 segundos
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[BC API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[BC API] Request error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log(`[BC API] Response ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[BC API] Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // ==================== 1. IMPORTACIÓN DE VENTAS ====================
  async enviarVenta(venta: BCVenta): Promise<{ success: boolean; numeroBC?: string; error?: string }> {
    try {
      const ventaBC = this.convertirVentaABC(venta);
      const response = await this.api.post('/salesInvoices', ventaBC);
      
      return {
        success: true,
        numeroBC: response.data.number,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async enviarVentasLote(ventas: BCVenta[]): Promise<BCSyncStatus> {
    const status: BCSyncStatus = {
      ultimaSincronizacion: new Date().toISOString(),
      estado: 'pendiente',
      errores: [],
      totalRegistros: ventas.length,
      registrosProcesados: 0,
    };

    for (const venta of ventas) {
      try {
        await this.enviarVenta(venta);
        status.registrosProcesados++;
      } catch (error: any) {
        status.errores.push(`Venta ${venta.numero}: ${error.message}`);
      }
    }

    status.estado = status.errores.length === 0 ? 'exitoso' : 'error';
    return status;
  }

  // ==================== 2. DESCARGA DE ITEMS ====================
  async descargarItems(sucursal?: string): Promise<BCItem[]> {
    try {
      let url = '/items';
      if (sucursal) {
        url += `?$filter=blockedForSale eq false and locationFilter eq '${sucursal}'`;
      }

      const response = await this.api.get(url);
      
      return response.data.value.map((item: any) => ({
        codigo: item.number,
        descripcion: item.displayName,
        categoria: item.itemCategory?.code || 'GENERAL',
        subcategoria: item.subcategory?.code,
        precioVenta: parseFloat(item.unitPrice || '0'),
        costo: parseFloat(item.unitCost || '0'),
        unidadMedida: item.baseUnitOfMeasure?.code || 'UND',
        activo: !item.blocked,
        imagen: item.picture?.content ? `data:image/jpeg;base64,${item.picture.content}` : undefined,
      }));
    } catch (error: any) {
      console.error('Error descargando items:', error);
      throw new Error(`Error descargando items: ${error.message}`);
    }
  }

  // ==================== 3. DESCARGA DE MEDIOS DE PAGO ====================
  async descargarMediosPago(): Promise<BCMedioPago[]> {
    try {
      const response = await this.api.get('/paymentMethods');
      
      return response.data.value.map((medio: any) => ({
        codigo: medio.code,
        descripcion: medio.displayName,
        tipo: this.determinarTipoMedioPago(medio.code),
        requiereBanco: medio.code.includes('BANK') || medio.code.includes('CARD'),
        activo: true,
      }));
    } catch (error: any) {
      console.error('Error descargando medios de pago:', error);
      throw new Error(`Error descargando medios de pago: ${error.message}`);
    }
  }

  // ==================== 4. DESCARGA DE CLIENTES ====================
  async descargarClientes(tipo?: 'rtn' | 'credito'): Promise<BCCliente[]> {
    try {
      let url = '/customers';
      if (tipo === 'rtn') {
        url += "?$filter=vatRegistrationNumber ne ''";
      } else if (tipo === 'credito') {
        url += "?$filter=creditLimit gt 0";
      }

      const response = await this.api.get(url);
      
      return response.data.value.map((cliente: any) => ({
        codigo: cliente.number,
        nombre: cliente.displayName,
        rtn: cliente.vatRegistrationNumber,
        telefono: cliente.phoneNumber,
        email: cliente.email,
        direccion: `${cliente.addressLine1 || ''} ${cliente.addressLine2 || ''}`.trim(),
        tipoCliente: this.determinarTipoCliente(cliente),
        limiteCredito: parseFloat(cliente.creditLimit || '0'),
        saldoActual: parseFloat(cliente.balance || '0'),
        activo: !cliente.blocked,
      }));
    } catch (error: any) {
      console.error('Error descargando clientes:', error);
      throw new Error(`Error descargando clientes: ${error.message}`);
    }
  }

  // ==================== 5. DESCARGA DE CAMBIOS DE PRECIOS ====================
  async descargarCambiosPrecios(fecha?: string): Promise<{ codigo: string; nuevoPrecio: number; fechaVigencia: string }[]> {
    try {
      let url = '/salesPrices';
      if (fecha) {
        url += `?$filter=startingDate ge ${fecha}`;
      }

      const response = await this.api.get(url);
      
      return response.data.value.map((precio: any) => ({
        codigo: precio.itemNo,
        nuevoPrecio: parseFloat(precio.unitPrice),
        fechaVigencia: precio.startingDate,
      }));
    } catch (error: any) {
      console.error('Error descargando cambios de precios:', error);
      throw new Error(`Error descargando cambios de precios: ${error.message}`);
    }
  }

  // ==================== 6. DESCARGA DE PROMOCIONES ====================
  async descargarPromociones(sucursal?: string): Promise<BCPromocion[]> {
    try {
      const response = await this.api.get('/salesLineDiscounts');
      
      return response.data.value
        .filter((promo: any) => {
          if (sucursal && promo.locationCode && promo.locationCode !== sucursal) {
            return false;
          }
          return new Date(promo.endingDate) >= new Date();
        })
        .map((promo: any) => ({
          codigo: promo.code,
          descripcion: promo.description || `Descuento ${promo.lineDiscount}%`,
          tipo: 'descuento' as const,
          valor: parseFloat(promo.lineDiscount),
          fechaInicio: promo.startingDate,
          fechaFin: promo.endingDate,
          sucursales: promo.locationCode ? [promo.locationCode] : [],
          items: [promo.no],
          activo: true,
        }));
    } catch (error: any) {
      console.error('Error descargando promociones:', error);
      throw new Error(`Error descargando promociones: ${error.message}`);
    }
  }

  // ==================== 7-8. SINCRONIZACIÓN AUTOMÁTICA ====================
  async iniciarSincronizacionAutomatica(sucursal: string): Promise<void> {
    // Descarga cada 5 minutos
    setInterval(async () => {
      try {
        await this.sincronizacionCompleta(sucursal);
      } catch (error) {
        console.error('Error en sincronización automática:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Envío de ventas cada minuto
    setInterval(async () => {
      try {
        await this.enviarVentasPendientes();
      } catch (error) {
        console.error('Error enviando ventas:', error);
      }
    }, 60 * 1000); // 1 minuto
  }

  async sincronizacionCompleta(sucursal: string): Promise<BCSyncStatus> {
    const inicio = Date.now();
    const errores: string[] = [];
    let registrosProcesados = 0;
    let totalRegistros = 0;

    try {
      // 1. Descargar items
      const items = await this.descargarItems(sucursal);
      this.guardarEnLocalStorage('bc_items', items);
      registrosProcesados += items.length;
      totalRegistros += items.length;

      // 2. Descargar medios de pago
      const medios = await this.descargarMediosPago();
      this.guardarEnLocalStorage('bc_medios_pago', medios);
      registrosProcesados += medios.length;
      totalRegistros += medios.length;

      // 3. Descargar clientes
      const clientes = await this.descargarClientes();
      this.guardarEnLocalStorage('bc_clientes', clientes);
      registrosProcesados += clientes.length;
      totalRegistros += clientes.length;

      // 4. Descargar promociones
      const promociones = await this.descargarPromociones(sucursal);
      this.guardarEnLocalStorage('bc_promociones', promociones);
      registrosProcesados += promociones.length;
      totalRegistros += promociones.length;

      // 5. Descargar cambios de precios
      const cambiosPrecios = await this.descargarCambiosPrecios();
      this.guardarEnLocalStorage('bc_cambios_precios', cambiosPrecios);
      registrosProcesados += cambiosPrecios.length;
      totalRegistros += cambiosPrecios.length;

      console.log(`Sincronización completa en ${Date.now() - inicio}ms`);

    } catch (error: any) {
      errores.push(error.message);
    }

    return {
      ultimaSincronizacion: new Date().toISOString(),
      estado: errores.length === 0 ? 'exitoso' : 'error',
      errores,
      totalRegistros,
      registrosProcesados,
    };
  }

  // ==================== 9. PRESUPUESTO DE VENTAS ====================
  async descargarPresupuestoVentas(sucursal: string, fecha: string): Promise<BCPresupuestoVentas> {
    try {
      const response = await this.api.get(`/budgets?$filter=locationCode eq '${sucursal}' and date eq '${fecha}'`);
      
      const presupuesto = response.data.value[0];
      if (!presupuesto) {
        throw new Error('No se encontró presupuesto para la fecha especificada');
      }

      // Obtener ventas del día
      const ventasResponse = await this.api.get(
        `/salesInvoices?$filter=locationCode eq '${sucursal}' and invoiceDate eq '${fecha}'`
      );

      const ventasDelDia = ventasResponse.data.value.reduce(
        (total: number, venta: any) => total + parseFloat(venta.totalAmountIncludingTax || '0'),
        0
      );

      return {
        sucursal,
        fecha,
        presupuestoDiario: parseFloat(presupuesto.budgetAmount),
        ventasAcumuladas: ventasDelDia,
        porcentajeCumplimiento: (ventasDelDia / parseFloat(presupuesto.budgetAmount)) * 100,
        ventasPorHora: await this.obtenerVentasPorHora(sucursal, fecha),
      };
    } catch (error: any) {
      console.error('Error descargando presupuesto:', error);
      throw new Error(`Error descargando presupuesto: ${error.message}`);
    }
  }

  // ==================== 10. DESCARGA DE IMÁGENES ====================
  async descargarImagenesArticulos(codigos: string[]): Promise<Record<string, string>> {
    const imagenes: Record<string, string> = {};

    for (const codigo of codigos) {
      try {
        const response = await this.api.get(`/items('${codigo}')/picture`);
        if (response.data.content) {
          imagenes[codigo] = `data:image/jpeg;base64,${response.data.content}`;
        }
      } catch (error) {
        console.warn(`No se pudo cargar imagen para ${codigo}`);
      }
    }

    return imagenes;
  }

  // ==================== 11. DESCARGA DE RECETAS ====================
  async descargarRecetasProductos(codigos: string[]): Promise<Record<string, BCRecetaItem[]>> {
    const recetas: Record<string, BCRecetaItem[]> = {};

    for (const codigo of codigos) {
      try {
        const response = await this.api.get(`/bomComponents?$filter=parentItemNo eq '${codigo}'`);
        
        recetas[codigo] = response.data.value.map((componente: any) => ({
          codigoComponente: componente.no,
          descripcionComponente: componente.description,
          cantidad: parseFloat(componente.quantityPer),
          unidadMedida: componente.unitOfMeasureCode,
          costo: parseFloat(componente.unitCost || '0'),
        }));
      } catch (error) {
        console.warn(`No se pudo cargar receta para ${codigo}`);
        recetas[codigo] = [];
      }
    }

    return recetas;
  }

  // ==================== MÉTODOS AUXILIARES ====================
  private convertirVentaABC(venta: BCVenta): any {
    return {
      number: venta.numero,
      invoiceDate: venta.fecha,
      customerNumber: venta.cliente.codigo || 'GENERAL',
      customerName: venta.cliente.nombre,
      locationCode: venta.sucursal,
      salesLines: venta.items.map(item => ({
        itemNo: item.codigoItem,
        description: item.descripcion,
        quantity: item.cantidad,
        unitPrice: item.precioUnitario,
        lineDiscount: item.descuentoLinea,
        totalAmount: item.totalLinea,
      })),
      totalAmountExcludingTax: venta.subtotal,
      totalAmountIncludingTax: venta.total,
      paymentTermsCode: this.determinarTerminosPago(venta.mediosPago),
    };
  }

  private determinarTipoMedioPago(codigo: string): 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque' {
    const upper = codigo.toUpperCase();
    if (upper.includes('CASH') || upper.includes('EFECTIVO')) return 'efectivo';
    if (upper.includes('CARD') || upper.includes('TARJETA')) return 'tarjeta';
    if (upper.includes('TRANSFER') || upper.includes('TRANSFERENCIA')) return 'transferencia';
    if (upper.includes('CHECK') || upper.includes('CHEQUE')) return 'cheque';
    return 'efectivo';
  }

  private determinarTipoCliente(cliente: any): 'final' | 'rtn' | 'credito' | 'leal' {
    if (cliente.vatRegistrationNumber) return 'rtn';
    if (parseFloat(cliente.creditLimit || '0') > 0) return 'credito';
    return 'final';
  }

  private determinarTerminosPago(mediosPago: BCMedioPago[]): string {
    if (mediosPago.some(m => m.codigo.includes('CREDITO') || m.descripcion.includes('CREDITO'))) return 'CREDITO_30';
    return 'CONTADO';
  }

  private async obtenerVentasPorHora(sucursal: string, fecha: string): Promise<{ hora: string; ventas: number }[]> {
    // Implementación simplificada - BC no tiene granularidad por hora por defecto
    const horas = Array.from({ length: 24 }, (_, i) => ({
      hora: `${i.toString().padStart(2, '0')}:00`,
      ventas: Math.random() * 1000, // En implementación real, esto vendría de BC
    }));
    
    return horas;
  }

  private async enviarVentasPendientes(): Promise<void> {
    const ventasPendientes = this.obtenerDeLocalStorage('ventas_pendientes', []);
    if (ventasPendientes.length === 0) return;

    const ventasEnviadas: string[] = [];

    for (const venta of ventasPendientes) {
      try {
        const resultado = await this.enviarVenta(venta);
        if (resultado.success) {
          ventasEnviadas.push(venta.numero);
        }
      } catch (error) {
        console.error(`Error enviando venta ${venta.numero}:`, error);
      }
    }

    // Remover ventas enviadas exitosamente
    const ventasRestantes = ventasPendientes.filter(
      (v: BCVenta) => !ventasEnviadas.includes(v.numero)
    );
    this.guardarEnLocalStorage('ventas_pendientes', ventasRestantes);
  }

  private guardarEnLocalStorage(key: string, data: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
    }
  }

  private obtenerDeLocalStorage(key: string, defaultValue: any = null): any {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    }
    return defaultValue;
  }

  // ==================== MÉTODOS PÚBLICOS DE UTILIDAD ====================
  async testConexion(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.api.get('/companies');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  obtenerUltimaSincronizacion(): string | null {
    return this.obtenerDeLocalStorage('ultima_sincronizacion');
  }

  obtenerEstadisticasSincronizacion(): BCSyncStatus | null {
    return this.obtenerDeLocalStorage('estadisticas_sync');
  }
}

export default BusinessCentralAPI; 