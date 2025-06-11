import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Badge,
  Tooltip,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  Kitchen,
  Timer,
  CheckCircle,
  Warning,
  Restaurant,
  Print,
  Refresh,
  PlayArrow,
  Pause,
  Done,
  Schedule,
  TableRestaurant,
  Person,
  LocalDining,
  Undo,
  Cancel,
  Replay,
  ErrorOutline,
  Edit,
  MoreVert
} from '@mui/icons-material';

interface ItemPedido {
  id: string;
  nombre: string;
  cantidad: number;
  categoria: string;
  observaciones?: string;
  tiempoEstimado: number; // en minutos
  prioridad: 'normal' | 'alta' | 'urgente';
}

interface HistorialCambio {
  timestamp: Date;
  estadoAnterior: string;
  estadoNuevo: string;
  usuario: string;
  motivo?: string;
}

interface Pedido {
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
  historialCambios: HistorialCambio[];
  motivoCancelacion?: string;
  motivoDevolucion?: string;
  puedeRevertir: boolean;
}

const ComandaCocina: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true);
  
  // Estados para gestión de errores - CORREGIDO: Estados separados para cada diálogo
  const [dialogoRevertir, setDialogoRevertir] = useState<{open: boolean, pedido: Pedido | null}>({open: false, pedido: null});
  const [dialogoCancelar, setDialogoCancelar] = useState<{open: boolean, pedido: Pedido | null}>({open: false, pedido: null});
  const [dialogoDevolucion, setDialogoDevolucion] = useState<{open: boolean, pedido: Pedido | null}>({open: false, pedido: null});
  
  // CORREGIDO: Estados separados para cada tipo de motivo
  const [motivoReversion, setMotivoReversion] = useState('');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('');
  
  const [notificacion, setNotificacion] = useState<{open: boolean, mensaje: string, tipo: 'success' | 'error' | 'warning'}>({
    open: false, mensaje: '', tipo: 'success'
  });

  // Simulación de datos iniciales con historial
  useEffect(() => {
    const pedidosIniciales: Pedido[] = [
      {
        id: 'P001',
        mesa: 'Mesa 5',
        cliente: 'Juan Pérez',
        estado: 'pendiente',
        horaCreacion: new Date(Date.now() - 5 * 60000),
        tiempoEstimadoTotal: 25,
        tipoServicio: 'mesa',
        prioridad: 'normal',
        historialCambios: [
          {
            timestamp: new Date(Date.now() - 5 * 60000),
            estadoAnterior: '',
            estadoNuevo: 'pendiente',
            usuario: 'Sistema'
          }
        ],
        puedeRevertir: false,
        items: [
          {
            id: 'I001',
            nombre: 'Pollo a la Plancha',
            cantidad: 2,
            categoria: 'Platos Principales',
            tiempoEstimado: 20,
            prioridad: 'normal'
          }
        ]
      },
      {
        id: 'P002',
        mesa: 'Mesa 3',
        cliente: 'María García',
        estado: 'en_preparacion',
        horaCreacion: new Date(Date.now() - 15 * 60000),
        horaInicio: new Date(Date.now() - 10 * 60000),
        tiempoEstimadoTotal: 30,
        tipoServicio: 'mesa',
        prioridad: 'alta',
        historialCambios: [
          {
            timestamp: new Date(Date.now() - 15 * 60000),
            estadoAnterior: '',
            estadoNuevo: 'pendiente',
            usuario: 'Sistema'
          },
          {
            timestamp: new Date(Date.now() - 10 * 60000),
            estadoAnterior: 'pendiente',
            estadoNuevo: 'en_preparacion',
            usuario: 'Chef Carlos'
          }
        ],
        puedeRevertir: true,
        items: [
          {
            id: 'I003',
            nombre: 'Baleadas Especiales',
            cantidad: 3,
            categoria: 'Platos Típicos',
            tiempoEstimado: 25,
            prioridad: 'alta',
            observaciones: 'Sin frijoles en una'
          }
        ]
      }
    ];
    
    // AGREGADO: Pedido de prueba en estado "entregado" para probar devoluciones
    const pedidoEntregado: Pedido = {
      id: 'P003',
      mesa: 'Mesa 7',
      cliente: 'Carlos Mendoza',
      estado: 'entregado',
      horaCreacion: new Date(Date.now() - 25 * 60000),
      horaInicio: new Date(Date.now() - 20 * 60000),
      horaFinalizacion: new Date(Date.now() - 5 * 60000),
      tiempoEstimadoTotal: 20,
      tipoServicio: 'mesa',
      prioridad: 'normal',
      historialCambios: [
        {
          timestamp: new Date(Date.now() - 25 * 60000),
          estadoAnterior: '',
          estadoNuevo: 'pendiente',
          usuario: 'Sistema'
        },
        {
          timestamp: new Date(Date.now() - 20 * 60000),
          estadoAnterior: 'pendiente',
          estadoNuevo: 'en_preparacion',
          usuario: 'Chef Ana'
        },
        {
          timestamp: new Date(Date.now() - 10 * 60000),
          estadoAnterior: 'en_preparacion',
          estadoNuevo: 'listo',
          usuario: 'Chef Ana'
        },
        {
          timestamp: new Date(Date.now() - 5 * 60000),
          estadoAnterior: 'listo',
          estadoNuevo: 'entregado',
          usuario: 'Mesero Luis'
        }
      ],
      puedeRevertir: true,
      items: [
        {
          id: 'I004',
          nombre: 'Tajadas con Pollo',
          cantidad: 1,
          categoria: 'Platos Típicos',
          tiempoEstimado: 18,
          prioridad: 'normal'
        }
      ]
    };
    
    // AGREGADO: Pedido de prueba en estado "listo" para probar devoluciones
    const pedidoListo: Pedido = {
      id: 'P004',
      mesa: 'Mesa 2',
      cliente: 'Ana López',
      estado: 'listo',
      horaCreacion: new Date(Date.now() - 18 * 60000),
      horaInicio: new Date(Date.now() - 15 * 60000),
      horaFinalizacion: new Date(Date.now() - 2 * 60000),
      tiempoEstimadoTotal: 15,
      tipoServicio: 'mesa',
      prioridad: 'alta',
      historialCambios: [
        {
          timestamp: new Date(Date.now() - 18 * 60000),
          estadoAnterior: '',
          estadoNuevo: 'pendiente',
          usuario: 'Sistema'
        },
        {
          timestamp: new Date(Date.now() - 15 * 60000),
          estadoAnterior: 'pendiente',
          estadoNuevo: 'en_preparacion',
          usuario: 'Chef María'
        },
        {
          timestamp: new Date(Date.now() - 2 * 60000),
          estadoAnterior: 'en_preparacion',
          estadoNuevo: 'listo',
          usuario: 'Chef María'
        }
      ],
      puedeRevertir: true,
      items: [
        {
          id: 'I005',
          nombre: 'Sopa de Mondongo',
          cantidad: 1,
          categoria: 'Sopas',
          tiempoEstimado: 15,
          prioridad: 'alta'
        }
      ]
    };
    
    pedidosIniciales.push(pedidoEntregado);
    pedidosIniciales.push(pedidoListo);
    
    // AGREGADO: Más pedidos de prueba para verificar scroll y funcionalidad
    const pedidosAdicionales: Pedido[] = [
      {
        id: 'P005',
        mesa: 'Mesa 8',
        cliente: 'Roberto Silva',
        estado: 'pendiente',
        horaCreacion: new Date(Date.now() - 8 * 60000),
        tiempoEstimadoTotal: 22,
        tipoServicio: 'mesa',
        prioridad: 'urgente',
        historialCambios: [
          {
            timestamp: new Date(Date.now() - 8 * 60000),
            estadoAnterior: '',
            estadoNuevo: 'pendiente',
            usuario: 'Sistema'
          }
        ],
        puedeRevertir: false,
        items: [
          {
            id: 'I006',
            nombre: 'Carne Asada',
            cantidad: 1,
            categoria: 'Carnes',
            tiempoEstimado: 22,
            prioridad: 'urgente'
          }
        ]
      },
      {
        id: 'P006',
        mesa: 'Mesa 1',
        cliente: 'Patricia Morales',
        estado: 'en_preparacion',
        horaCreacion: new Date(Date.now() - 12 * 60000),
        horaInicio: new Date(Date.now() - 8 * 60000),
        tiempoEstimadoTotal: 18,
        tipoServicio: 'mesa',
        prioridad: 'normal',
        historialCambios: [
          {
            timestamp: new Date(Date.now() - 12 * 60000),
            estadoAnterior: '',
            estadoNuevo: 'pendiente',
            usuario: 'Sistema'
          },
          {
            timestamp: new Date(Date.now() - 8 * 60000),
            estadoAnterior: 'pendiente',
            estadoNuevo: 'en_preparacion',
            usuario: 'Chef Pedro'
          }
        ],
        puedeRevertir: true,
        items: [
          {
            id: 'I007',
            nombre: 'Pescado Frito',
            cantidad: 1,
            categoria: 'Mariscos',
            tiempoEstimado: 18,
            prioridad: 'normal'
          }
        ]
      },
      {
        id: 'P007',
        mesa: 'Mesa 4',
        cliente: 'Luis Hernández',
        estado: 'listo',
        horaCreacion: new Date(Date.now() - 16 * 60000),
        horaInicio: new Date(Date.now() - 12 * 60000),
        horaFinalizacion: new Date(Date.now() - 3 * 60000),
        tiempoEstimadoTotal: 14,
        tipoServicio: 'mesa',
        prioridad: 'alta',
        historialCambios: [
          {
            timestamp: new Date(Date.now() - 16 * 60000),
            estadoAnterior: '',
            estadoNuevo: 'pendiente',
            usuario: 'Sistema'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60000),
            estadoAnterior: 'pendiente',
            estadoNuevo: 'en_preparacion',
            usuario: 'Chef Ana'
          },
          {
            timestamp: new Date(Date.now() - 3 * 60000),
            estadoAnterior: 'en_preparacion',
            estadoNuevo: 'listo',
            usuario: 'Chef Ana'
          }
        ],
        puedeRevertir: true,
        items: [
          {
            id: 'I008',
            nombre: 'Enchiladas',
            cantidad: 2,
            categoria: 'Platos Típicos',
            tiempoEstimado: 14,
            prioridad: 'alta'
          }
        ]
      },
      {
        id: 'P008',
        mesa: 'Mesa 6',
        cliente: 'Carmen Rodríguez',
        estado: 'entregado',
        horaCreacion: new Date(Date.now() - 30 * 60000),
        horaInicio: new Date(Date.now() - 25 * 60000),
        horaFinalizacion: new Date(Date.now() - 8 * 60000),
        tiempoEstimadoTotal: 17,
        tipoServicio: 'mesa',
        prioridad: 'normal',
        historialCambios: [
          {
            timestamp: new Date(Date.now() - 30 * 60000),
            estadoAnterior: '',
            estadoNuevo: 'pendiente',
            usuario: 'Sistema'
          },
          {
            timestamp: new Date(Date.now() - 25 * 60000),
            estadoAnterior: 'pendiente',
            estadoNuevo: 'en_preparacion',
            usuario: 'Chef Carlos'
          },
          {
            timestamp: new Date(Date.now() - 15 * 60000),
            estadoAnterior: 'en_preparacion',
            estadoNuevo: 'listo',
            usuario: 'Chef Carlos'
          },
          {
            timestamp: new Date(Date.now() - 8 * 60000),
            estadoAnterior: 'listo',
            estadoNuevo: 'entregado',
            usuario: 'Mesero Juan'
          }
        ],
        puedeRevertir: true,
        items: [
          {
            id: 'I009',
            nombre: 'Pupusas Revueltas',
            cantidad: 3,
            categoria: 'Platos Típicos',
            tiempoEstimado: 17,
            prioridad: 'normal'
          }
        ]
      }
    ];
    
    pedidosIniciales.push(...pedidosAdicionales);
    setPedidos(pedidosIniciales);
  }, []);

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'warning' = 'success') => {
    setNotificacion({ open: true, mensaje, tipo });
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#ff9800';
      case 'en_preparacion': return '#2196f3';
      case 'listo': return '#4caf50';
      case 'entregado': return '#9e9e9e';
      case 'cancelado': return '#f44336';
      case 'devuelto': return '#e91e63';
      default: return '#757575';
    }
  };

  const obtenerColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return '#f44336';
      case 'alta': return '#ff9800';
      case 'normal': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const calcularTiempoTranscurrido = (horaInicio: Date) => {
    const diferencia = Math.floor((tiempoActual.getTime() - horaInicio.getTime()) / 60000);
    return diferencia;
  };

  const calcularTiempoEspera = (horaCreacion: Date) => {
    const diferencia = Math.floor((tiempoActual.getTime() - horaCreacion.getTime()) / 60000);
    return diferencia;
  };

  // Función principal para cambiar estado con validaciones
  const cambiarEstadoPedido = (pedidoId: string, nuevoEstado: Pedido['estado'], motivo?: string) => {
    console.log('🔧 cambiarEstadoPedido llamada:', { pedidoId, nuevoEstado, motivo });
    
    setPedidos(prev => prev.map(pedido => {
      if (pedido.id === pedidoId) {
        console.log('✅ Pedido encontrado:', pedido.id, 'Estado actual:', pedido.estado);
        
        const ahora = new Date();
        let actualizacion: Partial<Pedido> = { 
          estado: nuevoEstado,
          puedeRevertir: true
        };

        // Agregar al historial
        const nuevoCambio: HistorialCambio = {
          timestamp: ahora,
          estadoAnterior: pedido.estado,
          estadoNuevo: nuevoEstado,
          usuario: 'Chef Actual', // En producción sería el usuario logueado
          motivo
        };

        actualizacion.historialCambios = [...pedido.historialCambios, nuevoCambio];

        // Lógica específica por estado
        if (nuevoEstado === 'en_preparacion' && !pedido.horaInicio) {
          actualizacion.horaInicio = ahora;
        } else if (nuevoEstado === 'listo' && !pedido.horaFinalizacion) {
          actualizacion.horaFinalizacion = ahora;
          
          if (sonidoHabilitado) {
            console.log('🔔 Pedido listo para entregar');
          }
        } else if (nuevoEstado === 'cancelado') {
          actualizacion.motivoCancelacion = motivo;
          actualizacion.puedeRevertir = true;
        } else if (nuevoEstado === 'devuelto') {
          actualizacion.motivoDevolucion = motivo;
          actualizacion.puedeRevertir = true;
        }

        console.log('🔄 Actualizando pedido:', { ...pedido, ...actualizacion });
        return { ...pedido, ...actualizacion };
      }
      return pedido;
    }));

    mostrarNotificacion(`Pedido ${pedidoId} cambiado a ${nuevoEstado}`, 'success');
  };

  // Función para revertir estado
  const revertirEstadoPedido = () => {
    console.log('🔄 revertirEstadoPedido llamada');
    
    if (!dialogoRevertir.pedido) {
      console.log('❌ No hay pedido seleccionado para revertir');
      return;
    }

    const pedido = dialogoRevertir.pedido;
    const historial = pedido.historialCambios;
    
    console.log('📋 Historial del pedido:', historial);
    
    if (historial.length < 2) {
      mostrarNotificacion('No hay estados anteriores para revertir', 'warning');
      return;
    }

    const estadoAnterior = historial[historial.length - 2].estadoNuevo as Pedido['estado'];
    console.log('⬅️ Revirtiendo a estado:', estadoAnterior);
    
    setPedidos(prev => prev.map(p => {
      if (p.id === pedido.id) {
        const ahora = new Date();
        
        // Agregar entrada al historial
        const nuevoCambio: HistorialCambio = {
          timestamp: ahora,
          estadoAnterior: p.estado,
          estadoNuevo: estadoAnterior,
          usuario: 'Chef Actual',
          motivo: `REVERTIDO: ${motivoReversion}`
        };

        let actualizacion: Partial<Pedido> = {
          estado: estadoAnterior,
          historialCambios: [...p.historialCambios, nuevoCambio]
        };

        // Ajustar tiempos según el estado al que se revierte
        if (estadoAnterior === 'pendiente') {
          actualizacion.horaInicio = undefined;
          actualizacion.horaFinalizacion = undefined;
        } else if (estadoAnterior === 'en_preparacion') {
          actualizacion.horaFinalizacion = undefined;
        }

        return { ...p, ...actualizacion };
      }
      return p;
    }));

    mostrarNotificacion(`Pedido ${pedido.id} revertido a ${estadoAnterior}`, 'success');
    setDialogoRevertir({open: false, pedido: null});
    setMotivoReversion('');
  };

  // Función para cancelar pedido
  const cancelarPedido = () => {
    console.log('❌ cancelarPedido llamada');
    
    if (!dialogoCancelar.pedido) {
      console.log('❌ No hay pedido seleccionado para cancelar');
      return;
    }

    // CORREGIDO: Usar motivo personalizado si se seleccionó "Otro"
    const motivoFinal = motivoCancelacion === 'Otro' ? motivoPersonalizado : motivoCancelacion;
    console.log('📝 Motivo final:', motivoFinal);
    
    cambiarEstadoPedido(dialogoCancelar.pedido.id, 'cancelado', motivoFinal);
    setDialogoCancelar({open: false, pedido: null});
    setMotivoCancelacion('');
    setMotivoPersonalizado('');
  };

  // Función para marcar como devuelto
  const marcarComoDevuelto = () => {
    console.log('↩️ marcarComoDevuelto llamada');
    
    if (!dialogoDevolucion.pedido) {
      console.log('❌ No hay pedido seleccionado para devolver');
      return;
    }

    // CORREGIDO: Usar motivo personalizado si se seleccionó "Otro"
    const motivoFinal = motivoDevolucion === 'Otro' ? motivoPersonalizado : motivoDevolucion;
    console.log('📝 Motivo final:', motivoFinal);
    
    cambiarEstadoPedido(dialogoDevolucion.pedido.id, 'devuelto', motivoFinal);
    setDialogoDevolucion({open: false, pedido: null});
    setMotivoDevolucion('');
    setMotivoPersonalizado('');
  };

  // Función para rehacer pedido (desde cancelado o devuelto)
  const rehacerPedido = (pedidoId: string) => {
    const motivo = prompt('Motivo para rehacer el pedido:');
    if (motivo) {
      cambiarEstadoPedido(pedidoId, 'pendiente', `REHECHO: ${motivo}`);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'activos') return ['pendiente', 'en_preparacion', 'listo'].includes(pedido.estado);
    return pedido.estado === filtroEstado;
  });

  const contadorPorEstado = {
    pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
    en_preparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    listo: pedidos.filter(p => p.estado === 'listo').length,
    entregado: pedidos.filter(p => p.estado === 'entregado').length,
    cancelado: pedidos.filter(p => p.estado === 'cancelado').length,
    devuelto: pedidos.filter(p => p.estado === 'devuelto').length
  };

  const imprimirComanda = (pedido: Pedido) => {
    console.log('🖨️ Imprimiendo comanda:', pedido.id);
    alert(`Imprimiendo comanda del pedido ${pedido.id}`);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      bgcolor: '#f5f5f5',
      overflow: 'hidden' // Evitar scroll en el contenedor principal
    }}>
      {/* Header - Fijo */}
      <Paper sx={{ p: 2, bgcolor: '#1976d2', color: 'white', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Kitchen sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                🍽️ Comanda Digital - Cocina
              </Typography>
              <Typography variant="subtitle1">
                Sistema POS Honduras - {tiempoActual.toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              sx={{ color: 'white' }} 
              onClick={() => window.location.reload()}
              title="Actualizar"
            >
              <Refresh />
            </IconButton>
            <IconButton 
              sx={{ color: 'white' }} 
              onClick={() => setSonidoHabilitado(!sonidoHabilitado)}
              title={sonidoHabilitado ? "Silenciar" : "Activar sonido"}
            >
              {sonidoHabilitado ? '🔊' : '🔇'}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Filtros y Estadísticas - Fijo */}
      <Paper sx={{ p: 2, flexShrink: 0 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[
                { key: 'todos', label: 'Todos', count: pedidos.length },
                { key: 'activos', label: 'Activos', count: contadorPorEstado.pendiente + contadorPorEstado.en_preparacion + contadorPorEstado.listo },
                { key: 'pendiente', label: 'Pendientes', count: contadorPorEstado.pendiente },
                { key: 'en_preparacion', label: 'En Preparación', count: contadorPorEstado.en_preparacion },
                { key: 'listo', label: 'Listos', count: contadorPorEstado.listo },
                { key: 'cancelado', label: 'Cancelados', count: contadorPorEstado.cancelado },
                { key: 'devuelto', label: 'Devueltos', count: contadorPorEstado.devuelto }
              ].map(filtro => (
                <Badge key={filtro.key} badgeContent={filtro.count} color="primary">
                  <Button
                    variant={filtroEstado === filtro.key ? 'contained' : 'outlined'}
                    onClick={() => setFiltroEstado(filtro.key)}
                    sx={{ minWidth: 100 }}
                    size="small"
                  >
                    {filtro.label}
                  </Button>
                </Badge>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Chip 
                icon={<Timer />} 
                label={`Tiempo promedio: 22 min`} 
                color="info" 
              />
              <Chip 
                icon={<Restaurant />} 
                label={`Activos: ${contadorPorEstado.pendiente + contadorPorEstado.en_preparacion}`} 
                color="warning" 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Área de contenido con scroll */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 3,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        {/* Alertas */}
        {pedidos.some(p => p.estado === 'pendiente' && calcularTiempoEspera(p.horaCreacion) > 10) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Hay pedidos pendientes con más de 10 minutos de espera
          </Alert>
        )}

        {contadorPorEstado.cancelado > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            🚨 Hay {contadorPorEstado.cancelado} pedido(s) cancelado(s) hoy
          </Alert>
        )}

        {contadorPorEstado.devuelto > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            ↩️ Hay {contadorPorEstado.devuelto} pedido(s) devuelto(s) hoy - Revisar procesos
          </Alert>
        )}

        {/* Grid de Pedidos - MEJORADO: Mejor distribución y scroll */}
        <Grid container spacing={2} sx={{ pb: 2 }}>
          {pedidosFiltrados.map(pedido => {
            const tiempoEspera = calcularTiempoEspera(pedido.horaCreacion);
            const tiempoPreparacion = pedido.horaInicio ? calcularTiempoTranscurrido(pedido.horaInicio) : 0;
            const progreso = pedido.estado === 'en_preparacion' 
              ? Math.min((tiempoPreparacion / pedido.tiempoEstimadoTotal) * 100, 100)
              : pedido.estado === 'listo' ? 100 : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={pedido.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: `3px solid ${obtenerColorEstado(pedido.estado)}`,
                    bgcolor: pedido.prioridad === 'urgente' ? '#ffebee' : 
                            pedido.estado === 'cancelado' ? '#ffebee' :
                            pedido.estado === 'devuelto' ? '#fce4ec' : 'white',
                    position: 'relative',
                    opacity: ['cancelado', 'devuelto'].includes(pedido.estado) ? 0.7 : 1,
                    '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.2s' }
                  }}
                >
                  {/* Indicador de Prioridad */}
                  {pedido.prioridad !== 'normal' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: obtenerColorPrioridad(pedido.prioridad),
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderBottomLeftRadius: 8,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {pedido.prioridad === 'urgente' ? '🚨 URGENTE' : '⚡ ALTA'}
                    </Box>
                  )}

                  <CardContent sx={{ pb: 1 }}>
                    {/* Header del Pedido */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {pedido.id}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip 
                          label={pedido.estado.replace('_', ' ').toUpperCase()} 
                          sx={{ 
                            bgcolor: obtenerColorEstado(pedido.estado),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                          size="small"
                        />
                        {pedido.puedeRevertir && (
                          <Tooltip title="Puede revertirse">
                            <Undo sx={{ fontSize: 16, color: '#666' }} />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {/* Información del Cliente */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TableRestaurant fontSize="small" />
                      <Typography variant="body2" fontWeight="bold">
                        {pedido.mesa}
                      </Typography>
                      <Person fontSize="small" sx={{ ml: 1 }} />
                      <Typography variant="body2">
                        {pedido.cliente}
                      </Typography>
                    </Box>

                    {/* Tipo de Servicio */}
                    <Chip 
                      size="small"
                      label={pedido.tipoServicio.toUpperCase()}
                      color={pedido.tipoServicio === 'delivery' ? 'warning' : 'default'}
                      sx={{ mb: 2 }}
                    />

                    {/* Items del Pedido */}
                    <Box sx={{ mb: 2 }}>
                      {pedido.items.slice(0, 2).map(item => (
                        <Box key={item.id} sx={{ mb: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {item.cantidad}x {item.nombre}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${item.tiempoEstimado}min`}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          {item.observaciones && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              📝 {item.observaciones}
                            </Typography>
                          )}
                        </Box>
                      ))}
                      {pedido.items.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          +{pedido.items.length - 2} items más...
                        </Typography>
                      )}
                    </Box>

                    {/* Motivos de cancelación/devolución */}
                    {pedido.motivoCancelacion && (
                      <Alert severity="error" sx={{ mb: 1, py: 0 }}>
                        <Typography variant="caption">
                          Cancelado: {pedido.motivoCancelacion}
                        </Typography>
                      </Alert>
                    )}

                    {pedido.motivoDevolucion && (
                      <Alert severity="warning" sx={{ mb: 1, py: 0 }}>
                        <Typography variant="caption">
                          Devuelto: {pedido.motivoDevolucion}
                        </Typography>
                      </Alert>
                    )}

                    {/* Tiempos */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        ⏰ Creado: {pedido.horaCreacion.toLocaleTimeString()} 
                        ({tiempoEspera} min)
                      </Typography>
                      {pedido.horaInicio && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          🍳 Iniciado: {pedido.horaInicio.toLocaleTimeString()} 
                          ({tiempoPreparacion} min)
                        </Typography>
                      )}
                      {pedido.horaFinalizacion && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ✅ Finalizado: {pedido.horaFinalizacion.toLocaleTimeString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Barra de Progreso */}
                    {pedido.estado === 'en_preparacion' && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption">Progreso</Typography>
                          <Typography variant="caption">{Math.round(progreso)}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={progreso}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: progreso > 80 ? '#4caf50' : progreso > 50 ? '#ff9800' : '#2196f3'
                            }
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>

                  {/* Acciones */}
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {/* Acciones normales de flujo */}
                      {pedido.estado === 'pendiente' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<PlayArrow />}
                          onClick={() => {
                            console.log('🔵 BOTÓN INICIAR clickeado para pedido:', pedido.id);
                            cambiarEstadoPedido(pedido.id, 'en_preparacion');
                          }}
                        >
                          Iniciar
                        </Button>
                      )}
                      {pedido.estado === 'en_preparacion' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Done />}
                          onClick={() => {
                            console.log('🟢 BOTÓN LISTO clickeado para pedido:', pedido.id);
                            cambiarEstadoPedido(pedido.id, 'listo');
                          }}
                        >
                          Listo
                        </Button>
                      )}
                      {pedido.estado === 'listo' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<LocalDining />}
                          onClick={() => {
                            console.log('🟡 BOTÓN ENTREGAR clickeado para pedido:', pedido.id);
                            cambiarEstadoPedido(pedido.id, 'entregado');
                          }}
                        >
                          Entregar
                        </Button>
                      )}

                      {/* Acciones de gestión de errores */}
                      {['cancelado', 'devuelto'].includes(pedido.estado) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<Replay />}
                          onClick={() => {
                            console.log('🔄 BOTÓN REHACER clickeado para pedido:', pedido.id);
                            rehacerPedido(pedido.id);
                          }}
                        >
                          Rehacer
                        </Button>
                      )}

                      {/* CORREGIDO: Botón revertir disponible para más estados */}
                      {pedido.puedeRevertir && !['cancelado', 'devuelto'].includes(pedido.estado) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<Undo />}
                          onClick={() => {
                            console.log('⚠️ BOTÓN REVERTIR clickeado para pedido:', pedido.id);
                            setMotivoReversion('');
                            setDialogoRevertir({open: true, pedido});
                          }}
                        >
                          Revertir
                        </Button>
                      )}

                      {/* CORREGIDO: Botón cancelar disponible para estados activos */}
                      {['pendiente', 'en_preparacion', 'listo'].includes(pedido.estado) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => {
                            console.log('❌ BOTÓN CANCELAR clickeado para pedido:', pedido.id);
                            setMotivoCancelacion('');
                            setMotivoPersonalizado('');
                            setDialogoCancelar({open: true, pedido});
                          }}
                        >
                          Cancelar
                        </Button>
                      )}

                      {/* CORREGIDO: Botón devolver disponible para pedidos listos y entregados */}
                      {['listo', 'entregado'].includes(pedido.estado) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<ErrorOutline />}
                          onClick={() => {
                            console.log('↩️ BOTÓN DEVOLVER clickeado para pedido:', pedido.id);
                            setMotivoDevolucion('');
                            setMotivoPersonalizado('');
                            setDialogoDevolucion({open: true, pedido});
                          }}
                        >
                          Devolver
                        </Button>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => setPedidoSeleccionado(pedido)}
                        title="Ver detalles"
                      >
                        👁️
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => imprimirComanda(pedido)}
                        title="Imprimir comanda"
                      >
                        <Print />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Mensaje cuando no hay pedidos - MOVIDO DENTRO DEL ÁREA DE SCROLL */}
        {pedidosFiltrados.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <Kitchen sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay pedidos {filtroEstado !== 'todos' ? `en estado "${filtroEstado}"` : 'disponibles'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los nuevos pedidos aparecerán aquí automáticamente
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Diálogo para Revertir Estado */}
      <Dialog open={dialogoRevertir.open} onClose={() => setDialogoRevertir({open: false, pedido: null})}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Undo color="warning" />
            Revertir Estado del Pedido
          </Box>
        </DialogTitle>
        <DialogContent>
          {dialogoRevertir.pedido && (
            <Box>
              <Typography variant="body1" gutterBottom>
                ¿Estás seguro de revertir el pedido <strong>{dialogoRevertir.pedido.id}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Estado actual: <strong>{dialogoRevertir.pedido.estado}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Se revertirá al estado anterior según el historial.
              </Typography>
              <TextField
                fullWidth
                label="Motivo de la reversión"
                value={motivoReversion}
                onChange={(e) => setMotivoReversion(e.target.value)}
                margin="normal"
                required
                placeholder="Ej: Error en preparación, cliente cambió de opinión..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoRevertir({open: false, pedido: null})}>
            Cancelar
          </Button>
          <Button 
            onClick={revertirEstadoPedido} 
            variant="contained" 
            color="warning"
            disabled={!motivoReversion.trim()}
          >
            Revertir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Cancelar Pedido */}
      <Dialog open={dialogoCancelar.open} onClose={() => setDialogoCancelar({open: false, pedido: null})}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Cancel color="error" />
            Cancelar Pedido
          </Box>
        </DialogTitle>
        <DialogContent>
          {dialogoCancelar.pedido && (
            <Box>
              <Typography variant="body1" gutterBottom>
                ¿Estás seguro de cancelar el pedido <strong>{dialogoCancelar.pedido.id}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mesa: {dialogoCancelar.pedido.mesa} - Cliente: {dialogoCancelar.pedido.cliente}
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motivo de cancelación</InputLabel>
                <Select
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  label="Motivo de cancelación"
                >
                  <MenuItem value="Cliente canceló">Cliente canceló</MenuItem>
                  <MenuItem value="Falta de ingredientes">Falta de ingredientes</MenuItem>
                  <MenuItem value="Error en la orden">Error en la orden</MenuItem>
                  <MenuItem value="Problema en cocina">Problema en cocina</MenuItem>
                  <MenuItem value="Cliente no esperó">Cliente no esperó</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
              {motivoCancelacion === 'Otro' && (
                <TextField
                  fullWidth
                  label="Especificar motivo"
                  value={motivoPersonalizado}
                  margin="normal"
                  onChange={(e) => setMotivoPersonalizado(e.target.value)}
                  placeholder="Escriba el motivo específico..."
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoCancelar({open: false, pedido: null})}>
            No Cancelar
          </Button>
          <Button 
            onClick={cancelarPedido} 
            variant="contained" 
            color="error"
            disabled={!motivoCancelacion.trim() || (motivoCancelacion === 'Otro' && !motivoPersonalizado.trim())}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para Devolución */}
      <Dialog open={dialogoDevolucion.open} onClose={() => setDialogoDevolucion({open: false, pedido: null})}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutline color="error" />
            Marcar como Devuelto
          </Box>
        </DialogTitle>
        <DialogContent>
          {dialogoDevolucion.pedido && (
            <Box>
              <Typography variant="body1" gutterBottom>
                ¿El pedido <strong>{dialogoDevolucion.pedido.id}</strong> fue devuelto por el cliente?
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Mesa: {dialogoDevolucion.pedido.mesa} - Cliente: {dialogoDevolucion.pedido.cliente}
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Motivo de devolución</InputLabel>
                <Select
                  value={motivoDevolucion}
                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                  label="Motivo de devolución"
                >
                  <MenuItem value="Comida fría">Comida fría</MenuItem>
                  <MenuItem value="Mal sabor">Mal sabor</MenuItem>
                  <MenuItem value="Orden incorrecta">Orden incorrecta</MenuItem>
                  <MenuItem value="Tiempo excesivo">Tiempo excesivo de espera</MenuItem>
                  <MenuItem value="Ingrediente faltante">Ingrediente faltante</MenuItem>
                  <MenuItem value="Alérgeno no especificado">Alérgeno no especificado</MenuItem>
                  <MenuItem value="Cliente insatisfecho">Cliente insatisfecho</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </Select>
              </FormControl>
              {motivoDevolucion === 'Otro' && (
                <TextField
                  fullWidth
                  label="Especificar motivo"
                  value={motivoPersonalizado}
                  margin="normal"
                  onChange={(e) => setMotivoPersonalizado(e.target.value)}
                  placeholder="Escriba el motivo específico..."
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoDevolucion({open: false, pedido: null})}>
            Cancelar
          </Button>
          <Button 
            onClick={marcarComoDevuelto} 
            variant="contained" 
            color="error"
            disabled={!motivoDevolucion.trim() || (motivoDevolucion === 'Otro' && !motivoPersonalizado.trim())}
          >
            Confirmar Devolución
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalles con Historial */}
      <Dialog 
        open={!!pedidoSeleccionado} 
        onClose={() => setPedidoSeleccionado(null)}
        maxWidth="md"
        fullWidth
      >
        {pedidoSeleccionado && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Kitchen />
                Detalles del Pedido {pedidoSeleccionado.id}
                <Chip 
                  label={pedidoSeleccionado.estado.replace('_', ' ').toUpperCase()} 
                  sx={{ 
                    bgcolor: obtenerColorEstado(pedidoSeleccionado.estado),
                    color: 'white'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Información General</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Mesa/Cliente" 
                        secondary={`${pedidoSeleccionado.mesa} - ${pedidoSeleccionado.cliente}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Tipo de Servicio" 
                        secondary={pedidoSeleccionado.tipoServicio} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Prioridad" 
                        secondary={pedidoSeleccionado.prioridad} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Tiempo Estimado" 
                        secondary={`${pedidoSeleccionado.tiempoEstimadoTotal} minutos`} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Items del Pedido</Typography>
                  <List dense>
                    {pedidoSeleccionado.items.map(item => (
                      <ListItem key={item.id}>
                        <ListItemText 
                          primary={`${item.cantidad}x ${item.nombre}`}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Categoría: {item.categoria}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Tiempo: {item.tiempoEstimado} min
                              </Typography>
                              {item.observaciones && (
                                <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                  Observaciones: {item.observaciones}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Historial de Cambios</Typography>
                  <List dense>
                    {pedidoSeleccionado.historialCambios.map((cambio, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {cambio.estadoAnterior ? `${cambio.estadoAnterior} → ` : ''}
                                <strong>{cambio.estadoNuevo}</strong>
                              </Typography>
                              <Chip 
                                size="small" 
                                label={cambio.usuario} 
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {cambio.timestamp.toLocaleString()}
                              </Typography>
                              {cambio.motivo && (
                                <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                  Motivo: {cambio.motivo}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => imprimirComanda(pedidoSeleccionado)} startIcon={<Print />}>
                Imprimir
              </Button>
              <Button onClick={() => setPedidoSeleccionado(null)}>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={notificacion.open}
        autoHideDuration={4000}
        onClose={() => setNotificacion(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotificacion(prev => ({ ...prev, open: false }))} 
          severity={notificacion.tipo}
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComandaCocina; 