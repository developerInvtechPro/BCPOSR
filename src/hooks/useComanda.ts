import { useState, useEffect, useCallback } from 'react';

export interface ItemPedido {
  id: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  observaciones?: string;
  tiempoEstimado: number;
  prioridad: 'normal' | 'alta' | 'urgente';
  precio: number;
}

export interface HistorialCambio {
  timestamp: Date;
  estadoAnterior: string;
  estadoNuevo: string;
  usuario: string;
  motivo?: string;
}

export interface Pedido {
  id: string;
  mesa: string;
  cliente: string;
  items: ItemPedido[];
  estado: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado' | 'devuelto';
  horaCreacion: Date;
  horaInicio?: Date;
  horaFinalizacion?: Date;
  tiempoEstimadoTotal: number;
  tipoServicio: 'mesa' | 'llevar' | 'delivery';
  observacionesGenerales?: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  total: number;
  mesero?: string;
  historialCambios: HistorialCambio[];
  motivoCancelacion?: string;
  motivoDevolucion?: string;
  puedeRevertir: boolean;
}

export interface EstadisticasComanda {
  pedidosActivos: number;
  tiempoPromedioPreparacion: number;
  pedidosCompletadosHoy: number;
  eficienciaCocina: number;
  cancelacionesHoy: number;
  devolucionesHoy: number;
  reversionesHoy: number;
}

export interface AlertaCalidad {
  tipo: 'cancelaciones' | 'devoluciones' | 'demoras' | 'reversiones';
  cantidad: number;
  limite: number;
  mensaje: string;
  severidad: 'warning' | 'error';
}

export const useComanda = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasComanda>({
    pedidosActivos: 0,
    tiempoPromedioPreparacion: 0,
    pedidosCompletadosHoy: 0,
    eficienciaCocina: 0,
    cancelacionesHoy: 0,
    devolucionesHoy: 0,
    reversionesHoy: 0
  });
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
  const [notificaciones, setNotificaciones] = useState<string[]>([]);
  const [alertasCalidad, setAlertasCalidad] = useState<AlertaCalidad[]>([]);

  // Función para agregar un nuevo pedido desde el POS
  const agregarPedido = useCallback((nuevoPedido: Omit<Pedido, 'id' | 'horaCreacion' | 'historialCambios' | 'puedeRevertir'>) => {
    const pedido: Pedido = {
      ...nuevoPedido,
      id: `P${Date.now()}`,
      horaCreacion: new Date(),
      estado: 'pendiente',
      historialCambios: [{
        timestamp: new Date(),
        estadoAnterior: '',
        estadoNuevo: 'pendiente',
        usuario: 'Sistema'
      }],
      puedeRevertir: false
    };

    setPedidos(prev => [...prev, pedido]);
    
    // Notificación sonora
    if (sonidoHabilitado) {
      reproducirSonido('nuevo-pedido');
    }

    // Agregar notificación
    setNotificaciones(prev => [...prev, `Nuevo pedido: ${pedido.id} - ${pedido.mesa}`]);
    
    return pedido.id;
  }, [sonidoHabilitado]);

  // Función para cambiar estado de pedido con historial
  const cambiarEstadoPedido = useCallback((pedidoId: string, nuevoEstado: Pedido['estado'], motivo?: string, usuario: string = 'Chef Actual') => {
    setPedidos(prev => prev.map(pedido => {
      if (pedido.id === pedidoId) {
        const ahora = new Date();
        
        // Crear entrada de historial
        const nuevoCambio: HistorialCambio = {
          timestamp: ahora,
          estadoAnterior: pedido.estado,
          estadoNuevo: nuevoEstado,
          usuario,
          motivo
        };

        let actualizacion: Partial<Pedido> = { 
          estado: nuevoEstado,
          historialCambios: [...pedido.historialCambios, nuevoCambio],
          puedeRevertir: true
        };

        // Lógica específica por estado
        if (nuevoEstado === 'en_preparacion' && !pedido.horaInicio) {
          actualizacion.horaInicio = ahora;
        } else if (nuevoEstado === 'listo' && !pedido.horaFinalizacion) {
          actualizacion.horaFinalizacion = ahora;
          
          if (sonidoHabilitado) {
            reproducirSonido('pedido-listo');
          }
          setNotificaciones(prev => [...prev, `Pedido listo: ${pedido.id} - ${pedido.mesa}`]);
        } else if (nuevoEstado === 'cancelado') {
          actualizacion.motivoCancelacion = motivo;
        } else if (nuevoEstado === 'devuelto') {
          actualizacion.motivoDevolucion = motivo;
        }

        return { ...pedido, ...actualizacion };
      }
      return pedido;
    }));
  }, [sonidoHabilitado]);

  // Función para revertir estado de pedido
  const revertirEstadoPedido = useCallback((pedidoId: string, motivo: string, usuario: string = 'Chef Actual') => {
    setPedidos(prev => prev.map(pedido => {
      if (pedido.id === pedidoId) {
        const historial = pedido.historialCambios;
        
        if (historial.length < 2) {
          throw new Error('No hay estados anteriores para revertir');
        }

        // Obtener el estado anterior
        const estadoAnterior = historial[historial.length - 2].estadoNuevo as Pedido['estado'];
        const ahora = new Date();
        
        // Crear entrada de historial para la reversión
        const nuevoCambio: HistorialCambio = {
          timestamp: ahora,
          estadoAnterior: pedido.estado,
          estadoNuevo: estadoAnterior,
          usuario,
          motivo: `REVERTIDO: ${motivo}`
        };

        let actualizacion: Partial<Pedido> = {
          estado: estadoAnterior,
          historialCambios: [...pedido.historialCambios, nuevoCambio]
        };

        // Ajustar tiempos según el estado al que se revierte
        if (estadoAnterior === 'pendiente') {
          actualizacion.horaInicio = undefined;
          actualizacion.horaFinalizacion = undefined;
        } else if (estadoAnterior === 'en_preparacion') {
          actualizacion.horaFinalizacion = undefined;
        }

        setNotificaciones(prev => [...prev, `Pedido ${pedido.id} revertido a ${estadoAnterior}`]);
        
        return { ...pedido, ...actualizacion };
      }
      return pedido;
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para cancelar pedido
  const cancelarPedido = useCallback((pedidoId: string, motivo: string, usuario: string = 'Chef Actual') => {
    cambiarEstadoPedido(pedidoId, 'cancelado', motivo, usuario);
    setNotificaciones(prev => [...prev, `Pedido ${pedidoId} cancelado: ${motivo}`]);
  }, [cambiarEstadoPedido]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para marcar como devuelto
  const marcarComoDevuelto = useCallback((pedidoId: string, motivo: string, usuario: string = 'Chef Actual') => {
    cambiarEstadoPedido(pedidoId, 'devuelto', motivo, usuario);
    setNotificaciones(prev => [...prev, `Pedido ${pedidoId} devuelto: ${motivo}`]);
    
    // Reproducir sonido de alerta
    if (sonidoHabilitado) {
      reproducirSonido('alerta');
    }
  }, [cambiarEstadoPedido, sonidoHabilitado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para rehacer pedido (desde cancelado o devuelto)
  const rehacerPedido = useCallback((pedidoId: string, motivo: string, usuario: string = 'Chef Actual') => {
    cambiarEstadoPedido(pedidoId, 'pendiente', `REHECHO: ${motivo}`, usuario);
    setNotificaciones(prev => [...prev, `Pedido ${pedidoId} rehecho: ${motivo}`]);
  }, [cambiarEstadoPedido]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para eliminar pedido
  const eliminarPedido = useCallback((pedidoId: string) => {
    setPedidos(prev => prev.filter(pedido => pedido.id !== pedidoId));
  }, []);

  // Función para obtener pedidos por estado
  const obtenerPedidosPorEstado = useCallback((estado: Pedido['estado']) => {
    return pedidos.filter(pedido => pedido.estado === estado);
  }, [pedidos]);

  // Función para calcular tiempo de espera
  const calcularTiempoEspera = useCallback((pedido: Pedido) => {
    const ahora = new Date();
    const tiempoBase = pedido.horaInicio || pedido.horaCreacion;
    return Math.floor((ahora.getTime() - tiempoBase.getTime()) / 60000);
  }, []);

  // Función para obtener pedidos con retraso
  const obtenerPedidosConRetraso = useCallback(() => {
    return pedidos.filter(pedido => {
      if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') return false;
      const tiempoEspera = calcularTiempoEspera(pedido);
      return tiempoEspera > pedido.tiempoEstimadoTotal + 5; // 5 minutos de tolerancia
    });
  }, [pedidos, calcularTiempoEspera]);

  // Función para obtener historial completo de un pedido
  const obtenerHistorialPedido = useCallback((pedidoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    return pedido?.historialCambios || [];
  }, [pedidos]);

  // Función para obtener estadísticas de errores
  const obtenerEstadisticasErrores = useCallback(() => {
    const hoy = new Date().toDateString();
    
    const cancelacionesHoy = pedidos.filter(p => 
      p.estado === 'cancelado' && 
      p.horaCreacion.toDateString() === hoy
    ).length;

    const devolucionesHoy = pedidos.filter(p => 
      p.estado === 'devuelto' && 
      p.horaCreacion.toDateString() === hoy
    ).length;

    const reversionesHoy = pedidos.reduce((total, pedido) => {
      return total + pedido.historialCambios.filter(cambio => 
        cambio.motivo?.includes('REVERTIDO') &&
        cambio.timestamp.toDateString() === hoy
      ).length;
    }, 0);

    return {
      cancelacionesHoy,
      devolucionesHoy,
      reversionesHoy,
      totalErrores: cancelacionesHoy + devolucionesHoy + reversionesHoy
    };
  }, [pedidos]);

  // Función para generar alertas de calidad
  const generarAlertasCalidad = useCallback(() => {
    const errores = obtenerEstadisticasErrores();
    const alertas: AlertaCalidad[] = [];

    // Límites configurables
    const limites = {
      cancelaciones: 3,
      devoluciones: 2,
      reversiones: 5
    };

    if (errores.cancelacionesHoy >= limites.cancelaciones) {
      alertas.push({
        tipo: 'cancelaciones',
        cantidad: errores.cancelacionesHoy,
        limite: limites.cancelaciones,
        mensaje: `${errores.cancelacionesHoy} cancelaciones hoy. Revisar procesos de toma de pedidos.`,
        severidad: 'warning'
      });
    }

    if (errores.devolucionesHoy >= limites.devoluciones) {
      alertas.push({
        tipo: 'devoluciones',
        cantidad: errores.devolucionesHoy,
        limite: limites.devoluciones,
        mensaje: `${errores.devolucionesHoy} devoluciones hoy. Revisar calidad de preparación.`,
        severidad: 'error'
      });
    }

    if (errores.reversionesHoy >= limites.reversiones) {
      alertas.push({
        tipo: 'reversiones',
        cantidad: errores.reversionesHoy,
        limite: limites.reversiones,
        mensaje: `${errores.reversionesHoy} reversiones hoy. Considerar entrenamiento adicional.`,
        severidad: 'warning'
      });
    }

    setAlertasCalidad(alertas);
    return alertas;
  }, [obtenerEstadisticasErrores]);

  // Función para reproducir sonidos
  const reproducirSonido = useCallback((tipo: 'nuevo-pedido' | 'pedido-listo' | 'alerta') => {
    if (!sonidoHabilitado) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar frecuencias según el tipo
      switch (tipo) {
        case 'nuevo-pedido':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          break;
        case 'pedido-listo':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
          break;
        case 'alerta':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.4);
          break;
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio no disponible:', error);
    }
  }, [sonidoHabilitado]); // eslint-disable-line react-hooks/exhaustive-deps

  // Función para imprimir comanda con información de errores
  const imprimirComanda = useCallback((pedido: Pedido) => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;

    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comanda - ${pedido.id}</title>
        <style>
          body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .pedido-info { margin-bottom: 15px; }
          .items { margin-bottom: 15px; }
          .item { margin-bottom: 5px; padding: 5px; border-bottom: 1px dashed #ccc; }
          .observaciones { font-style: italic; color: #666; }
          .footer { border-top: 2px solid #000; padding-top: 10px; text-align: center; }
          .urgente { background-color: #ffebee; border: 2px solid #f44336; }
          .alta { background-color: #fff3e0; border: 2px solid #ff9800; }
          .cancelado { background-color: #ffebee; border: 2px solid #f44336; }
          .devuelto { background-color: #fce4ec; border: 2px solid #e91e63; }
          .historial { margin-top: 15px; font-size: 10px; }
        </style>
      </head>
      <body class="${pedido.prioridad !== 'normal' ? pedido.prioridad : ''} ${pedido.estado === 'cancelado' ? 'cancelado' : ''} ${pedido.estado === 'devuelto' ? 'devuelto' : ''}">
        <div class="header">
          <h2>🍽️ COMANDA DE COCINA</h2>
          <h3>Sistema POS Honduras</h3>
        </div>
        
        <div class="pedido-info">
          <strong>PEDIDO:</strong> ${pedido.id}<br>
          <strong>ESTADO:</strong> ${pedido.estado.toUpperCase()}<br>
          <strong>MESA:</strong> ${pedido.mesa}<br>
          <strong>CLIENTE:</strong> ${pedido.cliente}<br>
          <strong>SERVICIO:</strong> ${pedido.tipoServicio.toUpperCase()}<br>
          <strong>HORA:</strong> ${pedido.horaCreacion.toLocaleString()}<br>
          <strong>PRIORIDAD:</strong> ${pedido.prioridad.toUpperCase()}<br>
          ${pedido.mesero ? `<strong>MESERO:</strong> ${pedido.mesero}<br>` : ''}
          ${pedido.motivoCancelacion ? `<strong>MOTIVO CANCELACIÓN:</strong> ${pedido.motivoCancelacion}<br>` : ''}
          ${pedido.motivoDevolucion ? `<strong>MOTIVO DEVOLUCIÓN:</strong> ${pedido.motivoDevolucion}<br>` : ''}
        </div>
        
        <div class="items">
          <h4>ITEMS DEL PEDIDO:</h4>
          ${pedido.items.map(item => `
            <div class="item">
              <strong>${item.cantidad}x ${item.nombre}</strong><br>
              <small>Categoría: ${item.categoria} | Tiempo: ${item.tiempoEstimado} min</small>
              ${item.observaciones ? `<div class="observaciones">📝 ${item.observaciones}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        ${pedido.observacionesGenerales ? `
          <div class="observaciones">
            <strong>OBSERVACIONES GENERALES:</strong><br>
            ${pedido.observacionesGenerales}
          </div>
        ` : ''}
        
        <div class="historial">
          <strong>HISTORIAL DE CAMBIOS:</strong><br>
          ${pedido.historialCambios.map(cambio => `
            ${cambio.timestamp.toLocaleString()} - ${cambio.usuario}: ${cambio.estadoAnterior ? `${cambio.estadoAnterior} → ` : ''}${cambio.estadoNuevo}${cambio.motivo ? ` (${cambio.motivo})` : ''}<br>
          `).join('')}
        </div>
        
        <div class="footer">
          <strong>TIEMPO ESTIMADO: ${pedido.tiempoEstimadoTotal} MINUTOS</strong><br>
          <small>Impreso: ${new Date().toLocaleString()}</small>
        </div>
      </body>
      </html>
    `;

    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
    ventanaImpresion.print();
    ventanaImpresion.close();
  }, []);

  // Función para exportar datos de la comanda con errores
  const exportarDatos = useCallback(() => {
    const errores = obtenerEstadisticasErrores();
    
    const datos = {
      pedidos,
      estadisticas: { ...estadisticas, ...errores },
      alertasCalidad,
      fecha: new Date().toISOString(),
      resumen: {
        total_pedidos: pedidos.length,
        pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
        en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
        listos: pedidos.filter(p => p.estado === 'listo').length,
        entregados: pedidos.filter(p => p.estado === 'entregado').length,
        cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
        devueltos: pedidos.filter(p => p.estado === 'devuelto').length,
        ...errores
      }
    };

    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comanda-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [pedidos, estadisticas, alertasCalidad, obtenerEstadisticasErrores]);

  // Calcular estadísticas en tiempo real incluyendo errores
  useEffect(() => {
    const pedidosActivos = pedidos.filter(p => 
      p.estado === 'pendiente' || p.estado === 'en_preparacion'
    ).length;

    const pedidosCompletados = pedidos.filter(p => 
      p.estado === 'entregado' && 
      p.horaCreacion.toDateString() === new Date().toDateString()
    );

    const tiemposPreparacion = pedidosCompletados
      .filter(p => p.horaInicio && p.horaFinalizacion)
      .map(p => (p.horaFinalizacion!.getTime() - p.horaInicio!.getTime()) / 60000);

    const tiempoPromedio = tiemposPreparacion.length > 0 
      ? tiemposPreparacion.reduce((a, b) => a + b, 0) / tiemposPreparacion.length 
      : 0;

    const eficiencia = pedidosCompletados.length > 0
      ? (pedidosCompletados.filter(p => {
          const tiempoReal = p.horaFinalizacion && p.horaInicio 
            ? (p.horaFinalizacion.getTime() - p.horaInicio.getTime()) / 60000
            : 0;
          return tiempoReal <= p.tiempoEstimadoTotal;
        }).length / pedidosCompletados.length) * 100
      : 100;

    const errores = obtenerEstadisticasErrores();

    setEstadisticas({
      pedidosActivos,
      tiempoPromedioPreparacion: Math.round(tiempoPromedio),
      pedidosCompletadosHoy: pedidosCompletados.length,
      eficienciaCocina: Math.round(eficiencia),
      ...errores
    });

    // Generar alertas de calidad
    generarAlertasCalidad();
  }, [pedidos, obtenerEstadisticasErrores, generarAlertasCalidad]);

  // Limpiar notificaciones antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      setNotificaciones(prev => prev.slice(-5)); // Mantener solo las últimas 5
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    // Estados
    pedidos,
    estadisticas,
    sonidoHabilitado,
    notificaciones,
    alertasCalidad,
    
    // Funciones principales
    agregarPedido,
    cambiarEstadoPedido,
    eliminarPedido,
    obtenerPedidosPorEstado,
    calcularTiempoEspera,
    obtenerPedidosConRetraso,
    imprimirComanda,
    exportarDatos,
    setSonidoHabilitado,
    
    // Funciones de manejo de errores
    revertirEstadoPedido,
    cancelarPedido,
    marcarComoDevuelto,
    rehacerPedido,
    obtenerHistorialPedido,
    obtenerEstadisticasErrores,
    generarAlertasCalidad,
    
    // Utilidades
    reproducirSonido
  };
};

export default useComanda; 