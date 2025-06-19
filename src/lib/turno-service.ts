import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TurnoData {
  numero: number;
  fechaApertura: Date;
  horaApertura: string;
  montoApertura: number;
  usuarioApertura: string;
  sucursal?: string;
  codigoPV?: string;
  observaciones?: string;
}

export interface TurnoFiltro {
  fechaDesde?: string;
  fechaHasta?: string;
  usuario?: string;
  estado?: string;
  sucursal?: string;
}

export const turnoService = {
  // Crear nuevo turno
  async crearTurno(data: TurnoData) {
    try {
      const turno = await prisma.turno.create({
        data: {
          numero: data.numero,
          fechaApertura: data.fechaApertura,
          horaApertura: data.horaApertura,
          montoApertura: data.montoApertura,
          usuarioApertura: data.usuarioApertura,
          sucursal: data.sucursal,
          codigoPV: data.codigoPV,
          observaciones: data.observaciones,
          estado: 'abierto'
        }
      });

      return {
        success: true,
        data: turno,
        message: 'Turno creado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al crear turno'
      };
    }
  },

  // Obtener turno actual (abierto)
  async obtenerTurnoActual(sucursal?: string, codigoPV?: string) {
    try {
      const turno = await prisma.turno.findFirst({
        where: {
          estado: 'abierto',
          sucursal: sucursal,
          codigoPV: codigoPV
        },
        orderBy: {
          fechaApertura: 'desc'
        }
      });

      return {
        success: true,
        data: turno,
        message: turno ? 'Turno actual encontrado' : 'No hay turno abierto'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener turno actual'
      };
    }
  },

  // Cerrar turno
  async cerrarTurno(id: number, data: {
    fechaCierre: Date;
    horaCierre: string;
    montoCierre: number;
    usuarioCierre: string;
    ventasDelTurno: number;
    observaciones?: string;
  }) {
    try {
      const turno = await prisma.turno.update({
        where: { id },
        data: {
          fechaCierre: data.fechaCierre,
          horaCierre: data.horaCierre,
          montoCierre: data.montoCierre,
          usuarioCierre: data.usuarioCierre,
          ventasDelTurno: data.ventasDelTurno,
          observaciones: data.observaciones,
          estado: 'cerrado'
        }
      });

      return {
        success: true,
        data: turno,
        message: 'Turno cerrado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al cerrar turno'
      };
    }
  },

  // Listar turnos
  async listarTurnos(filtro: TurnoFiltro = {}, limit = 50, offset = 0) {
    try {
      const where: any = {};

      if (filtro.fechaDesde && filtro.fechaHasta) {
        where.fechaApertura = {
          gte: new Date(filtro.fechaDesde),
          lte: new Date(filtro.fechaHasta)
        };
      }

      if (filtro.usuario) {
        where.usuarioApertura = {
          contains: filtro.usuario,
          mode: 'insensitive'
        };
      }

      if (filtro.estado) {
        where.estado = filtro.estado;
      }

      if (filtro.sucursal) {
        where.sucursal = filtro.sucursal;
      }

      const [turnos, total] = await Promise.all([
        prisma.turno.findMany({
          where,
          orderBy: {
            fechaApertura: 'desc'
          },
          take: limit,
          skip: offset,
          include: {
            facturas: {
              select: {
                id: true,
                numero: true,
                total: true
              }
            }
          }
        }),
        prisma.turno.count({ where })
      ]);

      return {
        success: true,
        data: turnos,
        total,
        message: 'Turnos obtenidos exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener turnos'
      };
    }
  },

  // Obtener turno por ID
  async obtenerTurno(id: number) {
    try {
      const turno = await prisma.turno.findUnique({
        where: { id },
        include: {
          facturas: {
            include: {
              items: true
            }
          }
        }
      });

      if (!turno) {
        return {
          success: false,
          message: 'Turno no encontrado'
        };
      }

      return {
        success: true,
        data: turno,
        message: 'Turno obtenido exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener turno'
      };
    }
  },

  // Obtener siguiente número de turno
  async obtenerSiguienteNumero(sucursal?: string, codigoPV?: string) {
    try {
      const ultimoTurno = await prisma.turno.findFirst({
        where: {
          sucursal: sucursal,
          codigoPV: codigoPV
        },
        orderBy: {
          numero: 'desc'
        }
      });

      return {
        success: true,
        data: (ultimoTurno?.numero || 0) + 1,
        message: 'Número de turno obtenido'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al obtener número de turno'
      };
    }
  },

  // Actualizar ventas del turno
  async actualizarVentasTurno(id: number, ventasDelTurno: number) {
    try {
      const turno = await prisma.turno.update({
        where: { id },
        data: {
          ventasDelTurno
        }
      });

      return {
        success: true,
        data: turno,
        message: 'Ventas del turno actualizadas'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        message: 'Error al actualizar ventas del turno'
      };
    }
  }
}; 