import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface FacturaData {
  numero: string;
  correlativo: number;
  cai: string;
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
  items: Array<{
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
}

export interface FacturaFiltro {
  fechaDesde?: string;
  fechaHasta?: string;
  cliente?: string;
  correlativo?: string;
  estado?: string;
  usuario?: string;
}

export class FacturaService {
  
  /**
   * Crear una nueva factura
   */
  async crearFactura(facturaData: FacturaData) {
    try {
      const factura = await prisma.factura.create({
        data: {
          numero: facturaData.numero,
          correlativo: facturaData.correlativo,
          cai: facturaData.cai,
          tipoCliente: facturaData.tipoCliente,
          subtotal: facturaData.subtotal,
          descuento: facturaData.descuento,
          isv15: facturaData.isv15,
          isv18: facturaData.isv18,
          total: facturaData.total,
          medioPago: facturaData.medioPago,
          sucursal: facturaData.sucursal,
          codigoPV: facturaData.codigoPV,
          usuario: facturaData.usuario,
          turno: facturaData.turno,
          mesaNumero: facturaData.mesaNumero,
          tipoPedido: facturaData.tipoPedido,
          clienteNombre: facturaData.clienteNombre,
          clienteTelefono: facturaData.clienteTelefono,
          clienteRTN: facturaData.clienteRTN,
          direccion: facturaData.direccion,
          proveedor: facturaData.proveedor,
          observaciones: facturaData.observaciones,
          items: {
            create: facturaData.items.map(item => ({
              codigoProducto: item.codigoProducto,
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              subtotal: item.subtotal,
              descuento: item.descuento,
              impuesto: item.impuesto,
              total: item.total,
              notas: item.notas
            }))
          }
        },
        include: {
          items: true
        }
      });

      return {
        success: true,
        data: factura,
        message: `Factura ${factura.numero} creada exitosamente`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al crear factura'
      };
    }
  }

  /**
   * Obtener factura por ID
   */
  async obtenerFactura(id: number) {
    try {
      const factura = await prisma.factura.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!factura) {
        return {
          success: false,
          error: 'Factura no encontrada',
          message: 'La factura especificada no existe'
        };
      }

      return {
        success: true,
        data: factura
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener factura'
      };
    }
  }

  /**
   * Obtener factura por número
   */
  async obtenerFacturaPorNumero(numero: string) {
    try {
      const factura = await prisma.factura.findUnique({
        where: { numero },
        include: {
          items: true
        }
      });

      if (!factura) {
        return {
          success: false,
          error: 'Factura no encontrada',
          message: 'La factura especificada no existe'
        };
      }

      return {
        success: true,
        data: factura
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener factura'
      };
    }
  }

  /**
   * Listar facturas con filtros
   */
  async listarFacturas(filtro: FacturaFiltro = {}, limit: number = 50, offset: number = 0) {
    try {
      const where: any = {};

      // Aplicar filtros
      if (filtro.fechaDesde && filtro.fechaHasta) {
        where.fecha = {
          gte: new Date(filtro.fechaDesde),
          lte: new Date(filtro.fechaHasta)
        };
      }

      if (filtro.cliente) {
        where.OR = [
          { clienteNombre: { contains: filtro.cliente, mode: 'insensitive' } },
          { clienteTelefono: { contains: filtro.cliente, mode: 'insensitive' } },
          { clienteRTN: { contains: filtro.cliente, mode: 'insensitive' } }
        ];
      }

      if (filtro.correlativo) {
        where.correlativo = parseInt(filtro.correlativo);
      }

      if (filtro.estado) {
        where.estado = filtro.estado;
      }

      if (filtro.usuario) {
        where.usuario = { contains: filtro.usuario, mode: 'insensitive' };
      }

      const facturas = await prisma.factura.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          fecha: 'desc'
        },
        take: limit,
        skip: offset
      });

      const total = await prisma.factura.count({ where });

      return {
        success: true,
        data: {
          facturas,
          total,
          limit,
          offset
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al listar facturas'
      };
    }
  }

  /**
   * Anular factura
   */
  async anularFactura(id: number, motivo: string, usuarioAnulacion: string) {
    try {
      const factura = await prisma.factura.update({
        where: { id },
        data: {
          estado: 'anulada',
          fechaAnulacion: new Date(),
          motivoAnulacion: motivo,
          usuarioAnulacion: usuarioAnulacion
        }
      });

      return {
        success: true,
        data: factura,
        message: `Factura ${factura.numero} anulada exitosamente`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al anular factura'
      };
    }
  }

  /**
   * Obtener estadísticas de facturas
   */
  async obtenerEstadisticas(fechaDesde?: string, fechaHasta?: string) {
    try {
      const where: any = { estado: 'activa' };

      if (fechaDesde && fechaHasta) {
        where.fecha = {
          gte: new Date(fechaDesde),
          lte: new Date(fechaHasta)
        };
      }

      const [
        totalFacturas,
        totalVentas,
        promedioTicket,
        facturasPorMedioPago
      ] = await Promise.all([
        prisma.factura.count({ where }),
        prisma.factura.aggregate({
          where,
          _sum: { total: true }
        }),
        prisma.factura.aggregate({
          where,
          _avg: { total: true }
        }),
        prisma.factura.groupBy({
          by: ['medioPago'],
          where,
          _sum: { total: true },
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalFacturas: totalFacturas,
          totalVentas: totalVentas._sum.total || 0,
          promedioTicket: promedioTicket._avg.total || 0,
          facturasPorMedioPago: facturasPorMedioPago.map(item => ({
            medioPago: item.medioPago,
            total: item._sum.total || 0,
            cantidad: item._count.id
          }))
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener estadísticas'
      };
    }
  }

  /**
   * Obtener última factura
   */
  async obtenerUltimaFactura() {
    try {
      const factura = await prisma.factura.findFirst({
        orderBy: {
          fecha: 'desc'
        },
        include: {
          items: true
        }
      });

      return {
        success: true,
        data: factura
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener última factura'
      };
    }
  }
}

export const facturaService = new FacturaService(); 