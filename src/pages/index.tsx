import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, TextField, IconButton, Checkbox, FormControlLabel, MenuItem, Select, Tabs, Tab, Menu, Snackbar, Alert } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Head from 'next/head';

const accionesIzquierda = [
  'SUSPENDER VENTA',
  'LLAMAR VENTA',
  'ANULAR PRODUCTO',
  'CANCELAR VENTA',
  'DESCUENTO 3ERA/4TA EDAD',
  'REIMPRIMIR RECIBO',
  'BUSCAR PRODUCTO',
  'DETALLE DE PRODUCTO',
  'DESCUENTO',
];

const accionesDerecha = [
  'INICIAR USUARIO', 'FACTURA',
  'SALIR USUARIO', 'GERENTE', 'PEDIDOS DE BARRA', 'GESTIÓN PEDIDOS', 'RESUMEN DE TURNO', 'SUPER',
];

const categoriasDerecha = [
  'CAFÉ/TE', 'BAKERY', 'GRANITA', 'SANDWICHES', 'HOT DOGS', 'POLLO',
  'HAMBURGUESA NACHOS PIZZA', 'CAFE EXPRESS', 'DESAYUNO',
  'ADICIONALES', 'PROMOS', 'SERVICIOS',
  'BEBIDAS', 'POSTRES', 'ENSALADAS', 'SOPAS', 'PASTAS', 'MARISCOS',
  'CARNE', 'VEGETARIANO', 'VEGANO', 'SNACKS', 'LICORES', 'OTROS'
];

const submenus: Record<string, string[]> = {
  'CAFÉ/TE': [
    'Café Americano', 'Café Latte', 'Té Verde', 'Té Negro', 'Café Mocha', 'Café Expreso', 'Café Capuchino', 'Café Descafeinado',
    'Café Doble', 'Café Cortado', 'Café Caramel', 'Café Vainilla', 'Café Helado', 'Café Irish', 'Café Bombón', 'Café Vienés',
    'Café Turco', 'Café Árabe', 'Café Cubano', 'Café Ristretto', 'Café Lungo', 'Café Affogato', 'Café Flat White', 'Café Macchiato'
  ],
  'BAKERY': ['Croissant', 'Pan de Queso', 'Muffin', 'Donut', 'Bagel', 'Brownie', 'Pan Integral', 'Pan Dulce', 'Pan Brioche', 'Pan de Leche', 'Pan de Ajo', 'Pan de Chocolate'],
  'GRANITA': ['Granita Limón', 'Granita Fresa', 'Granita Café', 'Granita Naranja', 'Granita Piña', 'Granita Uva', 'Granita Sandía', 'Granita Melón'],
  'SANDWICHES': ['Sandwich Pollo', 'Sandwich Jamón', 'Sandwich Veggie', 'Sandwich Atún', 'Sandwich Queso', 'Sandwich Mixto', 'Sandwich Club', 'Sandwich BLT'],
  'HOT DOGS': ['Hot Dog Clásico', 'Hot Dog Especial', 'Hot Dog Jumbo', 'Hot Dog BBQ', 'Hot Dog Queso', 'Hot Dog Tocino'],
  'POLLO': ['Pollo Frito', 'Pollo Asado', 'Pollo BBQ', 'Pollo Empanizado', 'Pollo a la Plancha', 'Pollo al Curry'],
  'HAMBURGUESA NACHOS PIZZA': ['Hamburguesa', 'Nachos', 'Pizza', 'Hamburguesa Doble', 'Pizza Pepperoni', 'Pizza Hawaiana', 'Nachos con Queso', 'Pizza Vegetariana'],
  'CAFE EXPRESS': ['Espresso', 'Cappuccino', 'Latte', 'Macchiato', 'Mocha', 'Americano', 'Affogato', 'Ristretto'],
  'DESAYUNO': ['Huevos', 'Tostadas', 'Pancakes', 'Omelette', 'Waffles', 'Cereal', 'Fruta', 'Yogur'],
  'ADICIONALES': ['Extra Queso', 'Extra Salsa', 'Extra Carne', 'Extra Pollo', 'Extra Pan', 'Extra Vegetales'],
  'PROMOS': ['Promo 2x1', 'Promo Desayuno', 'Promo Café', 'Promo Sandwich', 'Promo Pizza', 'Promo Pollo'],
  'SERVICIOS': ['Zambos Preparados', 'Sandwich Club S7', 'Servicio Express', 'Servicio a Domicilio', 'Servicio Especial'],
};

const clientesRTN = [
  'Cliente RTN 1',
  'Cliente RTN 2',
  'Cliente RTN 3',
];
const clientesCredito = [
  'Cliente Crédito 1',
  'Cliente Crédito 2',
];

const tiposCliente = [
  { label: 'CONSUMIDOR FINAL', value: 'final' },
  { label: 'CLIENTE RTN', value: 'rtn' },
  { label: 'CLIENTE CRÉDITO', value: 'credito' },
  { label: 'CLIENTE LEAL', value: 'leal' },
];

const mediosCobro = [
  'EFECTIVO',
  'TARJETA BAC',
  'TARJETA FICOHSA',
  'TRANSFERENCIA',
  'LINK DE PAGO',
];

const tecladoNumerico = [
  ['7', '8', '9', 'QTY'],
  ['4', '5', '6', '←'],
  ['1', '2', '3', 'CL'],
  ['0', '00', '.', '✔'],
];

export default function Home() {
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [productos, setProductos] = useState([
    { descripcion: 'Producto 1', precioUnitario: 100, cantidad: 2, precio: 200 },
    { descripcion: 'Producto 2', precioUnitario: 50, cantidad: 1, precio: 50 },
  ]);
  const [tipoCliente, setTipoCliente] = useState('final');
  const [openClientes, setOpenClientes] = useState<'rtn' | 'credito' | null>(null);
  const [openCobro, setOpenCobro] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [editCantidad, setEditCantidad] = useState<string>('');
  const tableRef = useRef<HTMLDivElement>(null);
  const [openGerente, setOpenGerente] = useState(false);
  const [empresa, setEmpresa] = useState({
    nombre: 'Mi Empresa S.A.',
    rtn: '08011999123456',
    direccion: 'Blvd. Principal, Tegucigalpa',
  });
  const [cais, setCais] = useState([
    {
      serie: 'A',
      cai: '123456-ABCDEF-789012-345678-901234-567890-12',
      rangoInicial: 1,
      rangoFinal: 1000,
      actual: 1,
      fechaEmision: '2024-01-01',
      fechaVencimiento: '2025-12-31',
      habilitado: true,
      tipo: 'FACTURA',
    },
  ]);
  const [factura, setFactura] = useState<any>(null);
  const [openResumen, setOpenResumen] = useState(false);
  const [openPedidos, setOpenPedidos] = useState(false);
  const [pedidosAbiertos, setPedidosAbiertos] = useState<any[]>([]);
  const [openResumenTurno, setOpenResumenTurno] = useState(false);
  const [tabResumen, setTabResumen] = useState(0);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroCaja, setFiltroCaja] = useState('');
  const NUM_MESAS = 20;
  const [mesas, setMesas] = useState(Array.from({ length: NUM_MESAS }, (_, i) => ({
    numero: i + 1,
    estado: 'libre' as 'libre' | 'reservada' | 'ocupada' | 'ocupada-con-reserva', // Nuevo estado híbrido
    reservadoPor: '', // nombre o teléfono del cliente que reservó
    ocupadoPor: '', // nombre del pedido/cliente actual
    proximaReserva: null as { nombre: string; hora: string; telefono: string } | null, // Info de próxima reserva
  })));

  // Estados para menú contextual de mesas y notificaciones
  const [menuMesa, setMenuMesa] = useState<{
    open: boolean;
    mesa: number | null;
    anchorEl: HTMLElement | null;
  }>({ open: false, mesa: null, anchorEl: null });
  const [openTransferirMesa, setOpenTransferirMesa] = useState(false);
  const [mesaOrigen, setMesaOrigen] = useState<number | null>(null);
  const [mesaDestino, setMesaDestino] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  // Estados para sistema de descuentos
  const [openDescuento, setOpenDescuento] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'importe'>('porcentaje');
  const [valorDescuento, setValorDescuento] = useState<number>(0);
  const [descuentoAplicado, setDescuentoAplicado] = useState<{
    tipo: 'porcentaje' | 'importe' | 'tercera_edad';
    valor: number;
    descripcion: string;
  } | null>(null);
  const [descuentoMaximo, setDescuentoMaximo] = useState({ porcentaje: 20, importe: 500 }); // Configurable desde GERENTE

  // Estado para rastrear si estamos editando un pedido abierto
  const [pedidoEnEdicion, setPedidoEnEdicion] = useState<{
    id: number;
    tipo: 'mesa' | 'delivery' | 'pickup' | 'barra';
    ref: string;
  } | null>(null);

  // Estados para historial de facturas
  const [openHistorialFacturas, setOpenHistorialFacturas] = useState(false);
  const [historialFacturas, setHistorialFacturas] = useState<any[]>([]);
  const [filtroHistorial, setFiltroHistorial] = useState({
    fechaDesde: '',
    fechaHasta: '',
    cliente: '',
    correlativo: '',
  });

  // Estados para funcionalidades pendientes
  const [ventasSuspendidas, setVentasSuspendidas] = useState<any[]>([]);
  const [openLlamarVenta, setOpenLlamarVenta] = useState(false);
  const [openBuscarProducto, setOpenBuscarProducto] = useState(false);
  const [openDetalleProducto, setOpenDetalleProducto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<any>(null);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [ultimaFactura, setUltimaFactura] = useState<any>(null);

  // Estados para delivery y pickup mejorados - NUEVA FUNCIONALIDAD
  const [openDeliveryPickup, setOpenDeliveryPickup] = useState(false);
  const [tipoNuevoPedido, setTipoNuevoPedido] = useState<'delivery' | 'pickup'>('delivery');
  const [formDelivery, setFormDelivery] = useState({
    cliente: '',
    telefono: '',
    direccion: '',
    proveedorDelivery: 'PROPIO',
    notas: '',
    tiempoEstimado: 30
  });
  const [openGestionPedidos, setOpenGestionPedidos] = useState(false);
  const [filtroTipoPedido, setFiltroTipoPedido] = useState<'todos' | 'mesa' | 'delivery' | 'pickup' | 'barra'>('todos');

  // Estados para pedidos de barra/general - NUEVA FUNCIONALIDAD
  const [openNuevoPedidoBarra, setOpenNuevoPedidoBarra] = useState(false);
  const [nombreClienteBarra, setNombreClienteBarra] = useState('');
  const [openPedidosBarra, setOpenPedidosBarra] = useState(false);

  // Proveedores de delivery disponibles
  const proveedoresDelivery = [
    'PROPIO',
    'UBER EATS',
    'GLOVO',
    'HUGO',
    'PEDIDOS YA'
  ];

  // Estados para pago combinado - NUEVA FUNCIONALIDAD
  const [openPagoCombinado, setOpenPagoCombinado] = useState(false);
  const [pagosCombinados, setPagosCombinados] = useState<{
    medio: string;
    monto: number;
  }[]>([]);
  const [montoRestante, setMontoRestante] = useState(0);

  // Estados para reserva con nombre - NUEVA FUNCIONALIDAD MEJORADA
  const [openReservaMesa, setOpenReservaMesa] = useState(false);
  const [mesaAReservar, setMesaAReservar] = useState<number | null>(null);
  const [nombreReserva, setNombreReserva] = useState('');
  const [telefonoReserva, setTelefonoReserva] = useState('');
  const [fechaReserva, setFechaReserva] = useState('');
  const [horaReserva, setHoraReserva] = useState('');
  const [duracionReserva, setDuracionReserva] = useState(90); // minutos por defecto
  const [comentariosReserva, setComentariosReserva] = useState('');
  const [reservasActivas, setReservasActivas] = useState<{
    id: number;
    mesa: number;
    nombre: string;
    telefono: string;
    fecha: string;
    hora: string;
    duracion: number;
    comentarios: string;
    estado: 'confirmada' | 'pendiente' | 'cancelada';
    fechaCreacion: string;
  }[]>([]);
  const [openCalendarioReservas, setOpenCalendarioReservas] = useState(false);

  // Estados para login de usuario - NUEVA FUNCIONALIDAD
  const [openLogin, setOpenLogin] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState('Cajero Demo');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Estados para configuración SUPER - NUEVA FUNCIONALIDAD
  const [openSuper, setOpenSuper] = useState(false);
  const [tabSuper, setTabSuper] = useState(0);
  const [configuracionBackup, setConfiguracionBackup] = useState({
    servicioActivo: 'ninguno', // 'ninguno', 'google', 'onedrive'
    googleDrive: {
      configurado: false,
      email: '',
      carpeta: 'Backups/Sistema-POS',
      ultimoBackup: '',
      estado: 'desconectado' // 'desconectado', 'conectado', 'error'
    },
    oneDrive: {
      configurado: false,
      email: '',
      carpeta: 'Backups/Sistema-POS', 
      ultimoBackup: '',
      estado: 'desconectado'
    },
    programacion: {
      activo: false,
      frecuencia: 'diario', // 'diario', 'semanal', 'mensual'
      hora: '02:00',
      mantenerBackups: 30
    }
  });
  const [estadoConexionNube, setEstadoConexionNube] = useState<{
    probando: boolean;
    servicio: string;
    resultado: 'exito' | 'error' | null;
    mensaje: string;
  }>({ probando: false, servicio: '', resultado: null, mensaje: '' });

  // Estados para configuración Business Central - NUEVA FUNCIONALIDAD EMPRESARIAL
  const [configuracionBusinessCentral, setConfiguracionBusinessCentral] = useState({
    habilitado: true, // Habilitado por defecto
    baseUrl: 'https://api.businesscentral.dynamics.com',
    tenantId: '0b48b68c-f813-4060-844f-2079fe72f87c',
    companyId: '88a8517e-4be2-ef11-9345-002248e0e739',
    username: '570853f4-2ca4-4dce-a433-a5322fa215fa', // Client ID
    password: '7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG', // Client Secret
    environment: 'SB110225' as 'sandbox' | 'production' | 'SB110225',
    sincronizacionAutomatica: true,
    intervalSincronizacion: 5, // minutos
    intervalEnvioVentas: 1, // minutos
  });

  // Estados para códigos de punto de venta por almacén - NUEVA FUNCIONALIDAD EMPRESARIAL
  const [configuracionAlmacenes, setConfiguracionAlmacenes] = useState<{
    almacenActual: string;
    codigoPV: string;
    almacenes: Array<{
      codigo: string;
      nombre: string;
      codigoPV: string;
      direccion: string;
      telefono: string;
      responsable: string;
      activo: boolean;
    }>;
  }>({
    almacenActual: 'ALM001',
    codigoPV: 'PV001',
    almacenes: [
      {
        codigo: 'ALM001',
        nombre: 'Almacén Principal - Centro',
        codigoPV: 'PV001',
        direccion: 'Boulevard Principal, Tegucigalpa',
        telefono: '2234-5678',
        responsable: 'Juan Pérez',
        activo: true
      },
      {
        codigo: 'ALM002', 
        nombre: 'Sucursal Mall Multiplaza',
        codigoPV: 'PV002',
        direccion: 'Mall Multiplaza, Local 201',
        telefono: '2245-6789',
        responsable: 'María García',
        activo: true
      }
    ]
  });

  // Estados para cierres de turno - NUEVA FUNCIONALIDAD EMPRESARIAL
  const [estadoCierreTurno, setEstadoCierreTurno] = useState<{
    turnoAbierto: boolean;
    fechaApertura: string;
    horaApertura: string;
    montoApertura: number;
    ventasDelTurno: number;
    ultimoCierre: string | null;
    requiereValidacionERP: boolean;
  }>({
    turnoAbierto: true,
    fechaApertura: new Date().toISOString().split('T')[0],
    horaApertura: new Date().toTimeString().slice(0, 5),
    montoApertura: 1000,
    ventasDelTurno: 0,
    ultimoCierre: null,
    requiereValidacionERP: false
  });

  // Estado para la hora actual (evitar error de hidratación)
  const [horaActual, setHoraActual] = useState('');

  // Base de datos simulada de productos
  const [catalogoProductos] = useState([
    { codigo: 'CAF001', nombre: 'Café Americano', precio: 25, categoria: 'CAFÉ/TE', descripcion: 'Café americano tradicional, granos seleccionados' },
    { codigo: 'CAF002', nombre: 'Café Latte', precio: 35, categoria: 'CAFÉ/TE', descripcion: 'Café con leche espumosa y vainilla' },
    { codigo: 'PAN001', nombre: 'Croissant', precio: 15, categoria: 'BAKERY', descripcion: 'Croissant francés recién horneado' },
    { codigo: 'HAM001', nombre: 'Hamburguesa Clásica', precio: 85, categoria: 'HAMBURGUESA NACHOS PIZZA', descripcion: 'Hamburguesa con carne, lechuga, tomate y queso' },
    { codigo: 'HOT001', nombre: 'Hot Dog Especial', precio: 45, categoria: 'HOT DOGS', descripcion: 'Hot dog con salchicha premium y salsas especiales' },
    { codigo: 'BEB001', nombre: 'Coca Cola', precio: 20, categoria: 'BEBIDAS', descripcion: 'Refresco de cola 355ml' },
    { codigo: 'DES001', nombre: 'Huevos Revueltos', precio: 40, categoria: 'DESAYUNO', descripcion: 'Huevos revueltos con tostadas y mantequilla' },
  ]);

  // Estados para teclado numérico - NUEVA FUNCIONALIDAD
  const [modoTeclado, setModoTeclado] = useState<'normal' | 'cantidad' | 'buscar' | 'descuento'>('normal');
  const [valorTeclado, setValorTeclado] = useState<string>('');
  const [cantidadOriginal, setCantidadOriginal] = useState<number>(0);

  // Cálculos de totales
  const subTotal = productos.reduce((acc, p) => acc + p.precio, 0);
  const impuesto = subTotal * 0.15;
  
  // Cálculo de descuento
  let montoDescuento = 0;
  if (descuentoAplicado) {
    if (descuentoAplicado.tipo === 'porcentaje' || descuentoAplicado.tipo === 'tercera_edad') {
      montoDescuento = subTotal * (descuentoAplicado.valor / 100);
    } else if (descuentoAplicado.tipo === 'importe') {
      montoDescuento = Math.min(descuentoAplicado.valor, subTotal);
    }
  }
  
  const subTotalConDescuento = subTotal - montoDescuento;
  const impuestoConDescuento = subTotalConDescuento * 0.15;
  const venta = subTotalConDescuento;
  const pagado = 0;
  const total = subTotalConDescuento + impuestoConDescuento;

  // Simulación de datos
  const ventasPorMedio = [
    { medio: 'EFECTIVO', total: 5000 },
    { medio: 'TARJETA', total: 3200 },
    { medio: 'TRANSFERENCIA', total: 800 },
  ];
  const movimientosCaja = [
    { tipo: 'INGRESO', descripcion: 'Apertura', monto: 1000 },
    { tipo: 'EGRESO', descripcion: 'Retiro', monto: 200 },
  ];
  const ventasPorCategoria = [
    { categoria: 'CAFÉ/TE', total: 1200 },
    { categoria: 'HOT DOGS', total: 900 },
  ];
  const ventaTotal = ventasPorMedio.reduce((acc, v) => acc + v.total, 0);
  const usuarios = ['Cajero 1', 'Cajero 2'];
  const cajas = ['Caja 1', 'Caja 2'];

  // Manejar agregar producto a la venta
  const handleAgregarProducto = (nombre: string) => {
    setProductos((prev) => {
      const existe = prev.find((p) => p.descripcion === nombre);
      if (existe) {
        return prev.map((p, idx) =>
          p.descripcion === nombre ? { ...p, cantidad: p.cantidad + 1, precio: (p.cantidad + 1) * p.precioUnitario } : p
        );
      } else {
        return [...prev, { descripcion: nombre, precioUnitario: 100, cantidad: 1, precio: 100 }];
      }
    });
    setSelectedRow(productos.length); // Selecciona la nueva línea
  };

  // Navegación y edición con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && (document.activeElement as HTMLElement).tagName === 'INPUT') return;
      if (productos.length === 0) return;
      if (e.key === 'ArrowUp') {
        setSelectedRow((prev) => (prev > 0 ? prev - 1 : prev));
        setEditCantidad('');
        // Si estamos en modo cantidad, resetear el valor del teclado
        if (modoTeclado === 'cantidad') {
          setValorTeclado('');
        }
      } else if (e.key === 'ArrowDown') {
        setSelectedRow((prev) => (prev < productos.length - 1 ? prev + 1 : prev));
        setEditCantidad('');
        // Si estamos en modo cantidad, resetear el valor del teclado
        if (modoTeclado === 'cantidad') {
          setValorTeclado('');
        }
      } else if (/^[0-9]$/.test(e.key)) {
        setEditCantidad((prev) => prev + e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setProductos((prev) => prev.filter((_, idx) => idx !== selectedRow));
        setSelectedRow((prev) => (prev > 0 ? prev - 1 : 0));
        setEditCantidad('');
      } else if (e.key === 'Enter' && editCantidad) {
        const nuevaCantidad = parseInt(editCantidad, 10);
        if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
          setProductos((prev) => prev.map((p, idx) =>
            idx === selectedRow ? { ...p, cantidad: nuevaCantidad, precio: nuevaCantidad * p.precioUnitario } : p
          ));
        }
        setEditCantidad('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [productos, selectedRow, editCantidad, modoTeclado]);

  useEffect(() => {
    // Si la cantidad está editándose, actualizar en tiempo real
    if (editCantidad) {
      const nuevaCantidad = parseInt(editCantidad, 10);
      if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
        setProductos((prev) => prev.map((p, idx) =>
          idx === selectedRow ? { ...p, cantidad: nuevaCantidad, precio: nuevaCantidad * p.precioUnitario } : p
        ));
      }
    }
  }, [editCantidad, selectedRow]);

  // Auto-guardar cambios cuando se está editando un pedido abierto
  useEffect(() => {
    if (pedidoEnEdicion && productos.length >= 0) {
      // Usar un debounce para evitar guardar en cada pequeño cambio
      const timeoutId = setTimeout(() => {
        actualizarPedidoAbierto();
      }, 2000); // Guardar después de 2 segundos de inactividad

      return () => clearTimeout(timeoutId);
    }
  }, [productos, tipoCliente, pedidoEnEdicion]);

  // Efecto para actualizar la hora
  useEffect(() => {
    const actualizarHora = () => {
      setHoraActual(new Date().toLocaleTimeString());
    };
    
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    
    return () => clearInterval(intervalo);
  }, []);

  // Efecto para cargar configuración de backup
  useEffect(() => {
    cargarConfiguracionBackup();
  }, []);

  // Efecto para cargar configuración de Business Central automáticamente
  useEffect(() => {
    // Verificar si la configuración ya está cargada
    if (configuracionBusinessCentral.tenantId) {
      mostrarNotificacion('🏢 Configuración Business Central cargada automáticamente', 'success');
      
      // Guardamos la configuración en localStorage para persistencia
      localStorage.setItem('configuracionBusinessCentral', JSON.stringify(configuracionBusinessCentral));
      localStorage.setItem('configuracionAlmacenes', JSON.stringify(configuracionAlmacenes));
    }
  }, []);

  // Actualizar modo cantidad cuando cambie la línea seleccionada - NUEVA FUNCIONALIDAD
  useEffect(() => {
    // Si estamos en modo cantidad y hay productos disponibles
    if (modoTeclado === 'cantidad' && productos.length > 0 && selectedRow >= 0 && selectedRow < productos.length) {
      // Actualizar la cantidad original para la nueva línea seleccionada
      const productoActual = productos[selectedRow];
      setCantidadOriginal(productoActual.cantidad);
      
      // Limpiar el valor del teclado para empezar de nuevo
      setValorTeclado('');
      
      // Mostrar notificación informativa
      mostrarNotificacion(`Modo cantidad activado para: ${productoActual.descripcion} (Cantidad actual: ${productoActual.cantidad})`, 'info');
    }
  }, [selectedRow, modoTeclado, productos]);

  // 2. Validación de RTN
  function validarRTN(rtn: string) {
    return rtn.length === 14 && /^\d+$/.test(rtn);
  }

  // 3. Cálculo de ISV diferenciado
  function calcularISV(productos: any[]) {
    let isv15 = 0, isv18 = 0;
    productos.forEach(p => {
      // Simulación: si el producto contiene "alcohol" o "tabaco" aplica 18%
      if (/alcohol|licor|tabaco/i.test(p.descripcion)) {
        isv18 += p.precio * 0.18 / 1.18;
      } else {
        isv15 += p.precio * 0.15 / 1.15;
      }
    });
    return { isv15, isv18 };
  }

  // 4. Al presionar COBRAR, validar y generar factura
  function handleCobrar(medioPago: string) {
    if (productos.length === 0) {
      mostrarNotificacion('No hay productos en la venta', 'warning');
      return;
    }
    // Validar CAI disponible
    const caiActivo = cais.find(c => c.habilitado);
    if (!caiActivo) {
      alert('No hay CAI activo');
      return;
    }
    
    // Generar correlativo
    let correlativo = caiActivo.actual;
    if (correlativo > caiActivo.rangoFinal) {
      alert('Se agotó el rango de CAI');
      return;
    }
    
    // Calcular ISV
    const { isv15, isv18 } = calcularISV(productos);
    
    // Crear objeto factura
    const nuevaFactura = {
      empresa,
      cai: caiActivo,
      correlativo,
      fecha: new Date().toISOString(),
      cliente: tipoCliente,
      productos,
      subTotal,
      descuento: descuentoAplicado ? {
        tipo: descuentoAplicado.tipo,
        valor: descuentoAplicado.valor,
        descripcion: descuentoAplicado.descripcion,
        monto: montoDescuento
      } : null,
      isv15,
      isv18,
      total,
      medioPago,
      // NUEVOS CAMPOS EMPRESARIALES
      sucursal: configuracionAlmacenes.almacenActual,
      codigoPV: configuracionAlmacenes.codigoPV,
      usuario: usuarioActual,
      turno: estadoCierreTurno.fechaApertura,
    };
    setFactura(nuevaFactura);
    setOpenResumen(true);
    
    // Agregar al historial de facturas
    setHistorialFacturas(prev => [nuevaFactura, ...prev]);
    
    // Guardar como última factura para reimprimir
    setUltimaFactura(nuevaFactura);
    
    // Avanzar correlativo
    setCais(cais => cais.map((c, i) => i === 0 ? { ...c, actual: c.actual + 1 } : c));
    
    // ACTUALIZAR VENTAS DEL TURNO
    setEstadoCierreTurno(prev => ({
      ...prev,
      ventasDelTurno: prev.ventasDelTurno + total
    }));
    
    // ENVIAR A BUSINESS CENTRAL AUTOMÁTICAMENTE
    if (configuracionBusinessCentral.habilitado) {
      const datosVentaBC = {
        numero: `${caiActivo.serie}-${correlativo.toString().padStart(8, '0')}`,
        fecha: nuevaFactura.fecha,
        sucursal: configuracionAlmacenes.almacenActual,
        codigoPV: configuracionAlmacenes.codigoPV,
        mesaNumero: pedidoEnEdicion?.tipo === 'mesa' ? Number(pedidoEnEdicion.ref) : undefined,
        tipo: pedidoEnEdicion?.tipo || 'mesa',
        cliente: {
          codigo: tipoCliente === 'rtn' || tipoCliente === 'credito' ? tipoCliente : undefined,
          nombre: tipoCliente === 'final' ? 'CONSUMIDOR FINAL' : `Cliente ${tipoCliente.toUpperCase()}`,
          rtn: tipoCliente === 'rtn' ? '08011999123456' : undefined,
          telefono: pedidoEnEdicion?.tipo === 'delivery' ? '9999-9999' : undefined,
          direccion: pedidoEnEdicion?.tipo === 'delivery' ? 'Tegucigalpa' : undefined,
        },
        items: productos.map(p => ({
          codigoItem: catalogoProductos.find(cp => cp.nombre === p.descripcion)?.codigo || 'GENERICO',
          descripcion: p.descripcion,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          descuentoLinea: 0,
          impuestoLinea: p.precioUnitario * p.cantidad * 0.15,
          totalLinea: p.precio
        })),
        descuentos: descuentoAplicado ? [{
          codigo: 'DESC_' + descuentoAplicado.tipo.toUpperCase(),
          descripcion: descuentoAplicado.descripcion,
          tipo: descuentoAplicado.tipo === 'porcentaje' ? 'porcentaje' : 'importe',
          valor: descuentoAplicado.valor,
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaFin: new Date().toISOString().split('T')[0],
          sucursales: [configuracionAlmacenes.almacenActual],
          activo: true
        }] : [],
        impuestos: [{
          codigo: 'ISV',
          descripcion: 'Impuesto Sobre Ventas',
          porcentaje: 15
        }],
        mediosPago: [{
          codigo: medioPago.includes('TARJETA') ? 'TARJETA' : 
                 medioPago.includes('TRANSFERENCIA') ? 'TRANSFER' : 
                 medioPago.includes('LINK') ? 'DIGITAL' : 'EFECTIVO',
          descripcion: medioPago,
          tipo: medioPago.includes('TARJETA') ? 'tarjeta' : 
               medioPago.includes('TRANSFERENCIA') ? 'transferencia' : 
               medioPago.includes('LINK') ? 'transferencia' : 'efectivo',
          requiereBanco: medioPago.includes('TARJETA'),
          activo: true
        }],
        subtotal: subTotal,
        totalDescuentos: montoDescuento,
        totalImpuestos: impuestoConDescuento,
        total: total,
        estado: 'cerrada',
        vendedor: usuarioActual,
        observaciones: pedidoEnEdicion ? `Pedido ${pedidoEnEdicion.tipo} ${pedidoEnEdicion.ref}` : undefined
      };
      
      // Enviar a Business Central en segundo plano
      enviarVentaABusinessCentral(datosVentaBC);
    }
    
    // Limpiar venta y descuentos
    setProductos([]);
    setDescuentoAplicado(null);
    setOpenCobro(false);
    
    // Si estaba editando un pedido abierto, eliminarlo (ya se facturó)
    if (pedidoEnEdicion) {
      eliminarPedidoAbiertoMesa(pedidoEnEdicion.id);
      setPedidoEnEdicion(null);
    }
  }

  // 3. Funciones para guardar, cargar y eliminar pedidos abiertos
  function guardarPedidoAbiertoMesa(tipo: 'mesa' | 'delivery' | 'pickup' | 'barra', ref: string) {
    if (productos.length === 0) {
      mostrarNotificacion('No hay productos para guardar', 'warning');
      return;
    }
    crearNuevoPedidoAbierto(tipo, ref);
  }
  function cargarPedidoAbiertoMesa(id: number) {
    const pedido = pedidosAbiertos.find(p => p.id === id);
    if (pedido) {
      setProductos(pedido.productos);
      setTipoCliente(pedido.tipoCliente);
      setPedidoEnEdicion({
        id: pedido.id,
        tipo: pedido.tipo,
        ref: pedido.ref
      });
      setOpenPedidos(false);
      mostrarNotificacion(`Pedido cargado: ${pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo} ${pedido.ref}`, 'info');
    }
  }
  function eliminarPedidoAbiertoMesa(id: number) {
    const pedido = pedidosAbiertos.find(p => p.id === id);
    setPedidosAbiertos(prev => prev.filter(p => p.id !== id));
    if (pedido && pedido.tipo === 'mesa') {
      setMesas(mesas => mesas.map(m => m.numero === Number(pedido.ref) ? { ...m, estado: 'libre' } : m));
    }
    // Si estamos editando este pedido, limpiar la edición
    if (pedidoEnEdicion && pedidoEnEdicion.id === id) {
      setPedidoEnEdicion(null);
      setProductos([]);
      setDescuentoAplicado(null);
    }
    mostrarNotificacion(`Pedido eliminado: ${pedido?.tipo === 'mesa' ? 'Mesa' : pedido?.tipo} ${pedido?.ref}`, 'info');
  }

  // Función para actualizar pedido abierto existente
  function actualizarPedidoAbierto() {
    if (pedidoEnEdicion) {
      setPedidosAbiertos(prev => prev.map(p => 
        p.id === pedidoEnEdicion.id 
          ? { ...p, productos, tipoCliente, fecha: new Date().toISOString() }
          : p
      ));
      mostrarNotificacion(`Cambios guardados en ${pedidoEnEdicion.tipo === 'mesa' ? 'Mesa' : pedidoEnEdicion.tipo} ${pedidoEnEdicion.ref}`, 'success');
    }
  }

  // Función para crear un nuevo pedido (separada de la actualización)
  function crearNuevoPedidoAbierto(tipo: 'mesa' | 'delivery' | 'pickup' | 'barra', ref: string, datosAdicionales?: any) {
    const nuevo = {
      id: Date.now(),
      tipo,
      ref,
      productos,
      tipoCliente,
      fecha: new Date().toISOString(),
      estado: tipo === 'mesa' ? 'abierto' : 'pendiente',
      // Campos específicos para delivery/pickup
      cliente: datosAdicionales?.cliente || ref,
      telefono: datosAdicionales?.telefono || '',
      direccion: datosAdicionales?.direccion || '',
      proveedorDelivery: datosAdicionales?.proveedorDelivery || 'PROPIO',
      notas: datosAdicionales?.notas || '',
      tiempoEstimado: datosAdicionales?.tiempoEstimado || 30,
      horaCreacion: new Date().toLocaleString(),
      horaEstimadaEntrega: tipo !== 'mesa' ? new Date(Date.now() + (datosAdicionales?.tiempoEstimado || 30) * 60000).toLocaleString() : null,
    };
    setPedidosAbiertos(prev => [...prev, nuevo]);
    if (tipo === 'mesa') {
      setMesas(mesas => mesas.map(m => m.numero === Number(ref) ? { ...m, estado: 'ocupada' } : m));
    }
    mostrarNotificacion(`Nuevo pedido creado: ${tipo === 'mesa' ? 'Mesa' : tipo} ${ref}`, 'success');
  }

  // Función para limpiar la edición actual
  function limpiarEdicion() {
    setProductos([]);
    setDescuentoAplicado(null);
    setPedidoEnEdicion(null);
    setTipoCliente('final');
    mostrarNotificacion('Venta cancelada', 'info');
  }

  // Funciones para menú contextual y notificaciones
  const mostrarNotificacion = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleClickMesa = (mesa: number, event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuMesa({
      open: true,
      mesa,
      anchorEl: event.currentTarget,
    });
  };

  const cerrarMenuMesa = () => {
    setMenuMesa({ open: false, mesa: null, anchorEl: null });
  };

  const abrirPedidoMesa = (numeroMesa: number) => {
    // Si hay un pedido en edición con productos, guardarlo automáticamente
    if (pedidoEnEdicion && productos.length > 0) {
      actualizarPedidoAbierto();
      mostrarNotificacion(`Cambios guardados automáticamente en ${pedidoEnEdicion.tipo === 'mesa' ? 'Mesa' : pedidoEnEdicion.tipo} ${pedidoEnEdicion.ref}`, 'info');
    }

    // Crear nuevo pedido vacío para la mesa seleccionada
    const nuevoPedido = {
      id: Date.now(),
      tipo: 'mesa' as const,
      ref: String(numeroMesa),
      productos: [],
      tipoCliente: 'final',
      fecha: new Date().toISOString(),
    };
    
    setPedidosAbiertos(prev => [...prev, nuevoPedido]);
    
    // Limpiar la venta actual y establecer el nuevo pedido en edición
    setProductos([]);
    setDescuentoAplicado(null);
    setTipoCliente('final');
    setPedidoEnEdicion({
      id: nuevoPedido.id,
      tipo: 'mesa',
      ref: String(numeroMesa)
    });
    
    // Actualizar estado de la mesa
    setMesas(mesas => mesas.map(m => m.numero === numeroMesa ? { ...m, estado: 'ocupada' } : m));
    
    mostrarNotificacion(`Mesa ${numeroMesa} abierta - Pedido nuevo iniciado`, 'success');
    cerrarMenuMesa();
  };

  const reservarMesa = (numeroMesa: number) => {
    iniciarReservaMesa(numeroMesa);
  };

  const liberarMesa = (numeroMesa: number) => {
    // Eliminar pedido abierto si existe
    const pedidoMesa = pedidosAbiertos.find(p => p.tipo === 'mesa' && p.ref === String(numeroMesa));
    if (pedidoMesa) {
      eliminarPedidoAbiertoMesa(pedidoMesa.id);
    }
    setMesas(mesas => mesas.map(m => m.numero === numeroMesa ? { ...m, estado: 'libre' } : m));
    mostrarNotificacion(`Mesa ${numeroMesa} liberada`, 'success');
    cerrarMenuMesa();
  };

  const verConsumoMesa = (numeroMesa: number) => {
    const pedidoMesa = pedidosAbiertos.find(p => p.tipo === 'mesa' && p.ref === String(numeroMesa));
    if (pedidoMesa) {
      cargarPedidoAbiertoMesa(pedidoMesa.id);
      mostrarNotificacion(`Consumo de Mesa ${numeroMesa} cargado`, 'info');
    } else {
      mostrarNotificacion(`No hay consumo en Mesa ${numeroMesa}`, 'warning');
    }
    cerrarMenuMesa();
  };

  const iniciarTransferenciaMesa = (numeroMesa: number) => {
    setMesaOrigen(numeroMesa);
    setOpenTransferirMesa(true);
    cerrarMenuMesa();
  };

  const confirmarTransferenciaMesa = () => {
    if (mesaOrigen && mesaDestino && mesaOrigen !== mesaDestino) {
      // Encontrar pedido de mesa origen
      const pedidoOrigen = pedidosAbiertos.find(p => p.tipo === 'mesa' && p.ref === String(mesaOrigen));
      
      if (pedidoOrigen) {
        // Verificar que mesa destino esté libre
        const mesaDestinoObj = mesas.find(m => m.numero === mesaDestino);
        if (mesaDestinoObj && mesaDestinoObj.estado !== 'libre') {
          mostrarNotificacion(`Mesa ${mesaDestino} no está disponible`, 'error');
          return;
        }

        // Actualizar referencia del pedido
        setPedidosAbiertos(prev => prev.map(p => 
          p.id === pedidoOrigen.id ? { ...p, ref: String(mesaDestino) } : p
        ));

        // Actualizar estados de mesas
        setMesas(mesas => mesas.map(m => {
          if (m.numero === mesaOrigen) return { ...m, estado: 'libre' };
          if (m.numero === mesaDestino) return { ...m, estado: 'ocupada' };
          return m;
        }));

        mostrarNotificacion(`Pedido transferido de Mesa ${mesaOrigen} a Mesa ${mesaDestino}`, 'success');
      } else {
        mostrarNotificacion(`No hay pedido en Mesa ${mesaOrigen}`, 'error');
      }
    }

    setOpenTransferirMesa(false);
    setMesaOrigen(null);
    setMesaDestino(null);
  };

  // Funciones para sistema de descuentos
  const aplicarDescuento = () => {
    if (valorDescuento <= 0) {
      mostrarNotificacion('El descuento debe ser mayor a 0', 'error');
      return;
    }

    // Validar límites
    if (tipoDescuento === 'porcentaje' && valorDescuento > descuentoMaximo.porcentaje) {
      mostrarNotificacion(`El descuento máximo es ${descuentoMaximo.porcentaje}%`, 'error');
      return;
    }
    
    if (tipoDescuento === 'importe' && valorDescuento > descuentoMaximo.importe) {
      mostrarNotificacion(`El descuento máximo es L${descuentoMaximo.importe}`, 'error');
      return;
    }

    // No permitir descuento si ya hay uno aplicado (excepto si es manual reemplazando tercera edad)
    if (descuentoAplicado && descuentoAplicado.tipo !== 'tercera_edad') {
      mostrarNotificacion('Ya hay un descuento aplicado', 'warning');
      return;
    }

    setDescuentoAplicado({
      tipo: tipoDescuento,
      valor: valorDescuento,
      descripcion: `Descuento ${tipoDescuento === 'porcentaje' ? valorDescuento + '%' : 'L' + valorDescuento}`
    });

    mostrarNotificacion('Descuento aplicado exitosamente', 'success');
    setOpenDescuento(false);
    setValorDescuento(0);
  };

  const aplicarDescuentoTerceraEdad = () => {
    // Verificar que no haya otro descuento aplicado
    if (descuentoAplicado) {
      mostrarNotificacion('No se puede combinar con otros descuentos', 'error');
      return;
    }

    // Verificar que hay productos elegibles (no alcohol/tabaco)
    const productosElegibles = productos.filter(p => 
      !/alcohol|licor|tabaco|cerveza|ron|whisky|vodka|tequila|vino/i.test(p.descripcion)
    );

    if (productosElegibles.length === 0) {
      mostrarNotificacion('No hay productos elegibles para descuento de tercera edad', 'warning');
      return;
    }

    setDescuentoAplicado({
      tipo: 'tercera_edad',
      valor: 25, // 25% fijo
      descripcion: 'Descuento 3era/4ta Edad (25%)'
    });

    mostrarNotificacion('Descuento de tercera edad aplicado', 'success');
  };

  const removerDescuento = () => {
    setDescuentoAplicado(null);
    mostrarNotificacion('Descuento removido', 'info');
  };

  // 1. SUSPENDER VENTA
  const suspenderVenta = () => {
    if (productos.length === 0) {
      mostrarNotificacion('No hay productos para suspender', 'warning');
      return;
    }

    const ventaSuspendida = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      productos: [...productos],
      tipoCliente,
      descuentoAplicado,
      pedidoEnEdicion,
      usuario: 'Cajero Actual', // En un sistema real vendría del login
    };

    setVentasSuspendidas(prev => [ventaSuspendida, ...prev]);
    
    // Limpiar venta actual
    setProductos([]);
    setDescuentoAplicado(null);
    setPedidoEnEdicion(null);
    setTipoCliente('final');
    
    mostrarNotificacion(`Venta suspendida #${ventaSuspendida.id.toString().slice(-4)}`, 'success');
  };

  // 2. LLAMAR VENTA (recuperar venta suspendida)
  const llamarVenta = (ventaId: number) => {
    const venta = ventasSuspendidas.find(v => v.id === ventaId);
    if (!venta) return;

    // Si hay una venta actual, suspenderla automáticamente
    if (productos.length > 0) {
      suspenderVenta();
    }

    // Cargar la venta suspendida
    setProductos(venta.productos);
    setTipoCliente(venta.tipoCliente);
    setDescuentoAplicado(venta.descuentoAplicado);
    setPedidoEnEdicion(venta.pedidoEnEdicion);

    // Eliminar de ventas suspendidas
    setVentasSuspendidas(prev => prev.filter(v => v.id !== ventaId));
    
    setOpenLlamarVenta(false);
    mostrarNotificacion(`Venta #${ventaId.toString().slice(-4)} recuperada`, 'success');
  };

  // 3. ANULAR PRODUCTO (eliminar línea específica)
  const anularProducto = () => {
    if (productos.length === 0) {
      mostrarNotificacion('No hay productos para anular', 'warning');
      return;
    }

    if (selectedRow >= 0 && selectedRow < productos.length) {
      const productoAnulado = productos[selectedRow];
      setProductos(prev => prev.filter((_, idx) => idx !== selectedRow));
      setSelectedRow(prev => prev > 0 ? prev - 1 : 0);
      mostrarNotificacion(`Producto anulado: ${productoAnulado.descripcion}`, 'info');
    }
  };

  // 4. REIMPRIMIR ÚLTIMO RECIBO
  const reimprimirUltimoRecibo = () => {
    if (ultimaFactura) {
      setFactura(ultimaFactura);
      setOpenResumen(true);
      mostrarNotificacion(`Reimprimiendo factura ${ultimaFactura.correlativo}`, 'info');
    } else {
      mostrarNotificacion('No hay facturas recientes para reimprimir', 'warning');
    }
  };

  // 5. BUSCAR PRODUCTO
  const buscarProductoPorCodigo = (termino: string) => {
    return catalogoProductos.filter(producto => 
      producto.codigo.toLowerCase().includes(termino.toLowerCase()) ||
      producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(termino.toLowerCase())
    );
  };

  const agregarProductoDesdeBusqueda = (producto: any) => {
    const existe = productos.find(p => p.descripcion === producto.nombre);
    if (existe) {
      setProductos(prev => prev.map(p => 
        p.descripcion === producto.nombre 
          ? { ...p, cantidad: p.cantidad + 1, precio: (p.cantidad + 1) * p.precioUnitario } : p
      ));
    } else {
      setProductos(prev => [...prev, {
        descripcion: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: 1,
        precio: producto.precio
      }]);
    }
    
    setOpenBuscarProducto(false);
    setBusquedaProducto('');
    mostrarNotificacion(`Producto agregado: ${producto.nombre}`, 'success');
  };

  // 6. DETALLE DE PRODUCTO
  const mostrarDetalleProducto = () => {
    if (productos.length === 0 || selectedRow < 0) {
      mostrarNotificacion('Seleccione un producto de la lista', 'warning');
      return;
    }

    const productoSeleccionado = productos[selectedRow];
    // Buscar detalles adicionales en el catálogo
    const detalleCompleto = catalogoProductos.find(p => p.nombre === productoSeleccionado.descripcion);
    
    setProductoDetalle({
      ...productoSeleccionado,
      codigo: detalleCompleto?.codigo || 'N/A',
      categoria: detalleCompleto?.categoria || 'N/A',
      descripcion: detalleCompleto?.descripcion || 'Sin descripción disponible'
    });
    
    setOpenDetalleProducto(true);
  };

  // ========== FUNCIONES DEL TECLADO NUMÉRICO ==========

  // Manejar clic en botones del teclado
  const handleTecladoClick = (tecla: string) => {
    switch (tecla) {
      case 'QTY':
        activarModoEditarCantidad();
        break;
      case '←':
        if (valorTeclado.length > 0) {
          setValorTeclado(prev => prev.slice(0, -1));
        }
        break;
      case 'CL':
        cancelarEdicionTeclado();
        break;
      case '✔':
        confirmarEdicionTeclado();
        break;
      case '.':
        if (!valorTeclado.includes('.') && valorTeclado.length > 0) {
          setValorTeclado(prev => prev + '.');
        }
        break;
      default:
        // Es un número - siempre permitir agregar números
        if (/^[\d]+$/.test(tecla) || tecla === '00') {
          setValorTeclado(prev => prev + tecla);
        }
        break;
    }
  };

  // Activar modo editar cantidad
  const activarModoEditarCantidad = () => {
    if (productos.length === 0 || selectedRow < 0) {
      mostrarNotificacion('Seleccione un producto para editar la cantidad', 'warning');
      return;
    }

    const producto = productos[selectedRow];
    setModoTeclado('cantidad');
    setValorTeclado('');
    setCantidadOriginal(producto.cantidad);
    mostrarNotificacion('Modo: Editar cantidad - Escriba la nueva cantidad', 'info');
  };

  // Confirmar edición con teclado
  const confirmarEdicionTeclado = () => {
    if (modoTeclado === 'cantidad') {
      const nuevaCantidad = parseInt(valorTeclado, 10);
      if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        mostrarNotificacion('Cantidad inválida', 'error');
        return;
      }

      setProductos(prev => prev.map((p, idx) =>
        idx === selectedRow 
          ? { ...p, cantidad: nuevaCantidad, precio: nuevaCantidad * p.precioUnitario }
          : p
      ));

      mostrarNotificacion(`Cantidad actualizada: ${nuevaCantidad}`, 'success');
      resetearTeclado();
    }
  };

  // Cancelar edición con teclado
  const cancelarEdicionTeclado = () => {
    if (modoTeclado === 'cantidad') {
      mostrarNotificacion('Edición de cantidad cancelada', 'info');
    }
    resetearTeclado();
  };

  // Resetear teclado a modo normal
  const resetearTeclado = () => {
    setModoTeclado('normal');
    setValorTeclado('');
    setCantidadOriginal(0);
  };

  // ========== FUNCIONES PARA NUEVAS CARACTERÍSTICAS ==========

  // Funciones para pago combinado
  const iniciarPagoCombinado = () => {
    setMontoRestante(total);
    setPagosCombinados([]);
    setOpenPagoCombinado(true);
    setOpenCobro(false);
  };

  const agregarPagoCombinado = (medio: string, monto: number) => {
    if (monto <= 0 || monto > montoRestante) {
      mostrarNotificacion('Monto inválido', 'error');
      return;
    }

    setPagosCombinados(prev => [...prev, { medio, monto }]);
    setMontoRestante(prev => prev - monto);
    
    if (montoRestante - monto <= 0) {
      // Pago completado
      const nuevosPagos = [...pagosCombinados, { medio, monto }];
      handleCobrarCombinado(nuevosPagos);
    }
  };

  const handleCobrarCombinado = (pagos: { medio: string; monto: number }[]) => {
    // Crear descripción del medio de pago combinado
    const descripcionPago = pagos.map(p => `${p.medio}: L${p.monto.toFixed(2)}`).join(', ');
    
    // Usar la función de cobrar existente pero con descripción combinada
    handleCobrar(`COMBINADO (${descripcionPago})`);
    
    setOpenPagoCombinado(false);
    setPagosCombinados([]);
    setMontoRestante(0);
  };

  // Funciones para reserva con nombre
  const iniciarReservaMesa = (numeroMesa: number) => {
    setMesaAReservar(numeroMesa);
    setNombreReserva('');
    setTelefonoReserva('');
    // Fecha por defecto: hoy
    setFechaReserva(new Date().toISOString().split('T')[0]);
    // Hora por defecto: siguiente hora disponible
    const ahora = new Date();
    const horaProxima = new Date(ahora.getTime() + 60 * 60 * 1000); // +1 hora
    setHoraReserva(horaProxima.toTimeString().slice(0, 5));
    setDuracionReserva(90);
    setComentariosReserva('');
    setOpenReservaMesa(true);
    cerrarMenuMesa();
  };

  const confirmarReservaMesa = () => {
    // Validaciones
    if (!nombreReserva.trim()) {
      mostrarNotificacion('El nombre es obligatorio', 'error');
      return;
    }
    
    if (!telefonoReserva.trim()) {
      mostrarNotificacion('El teléfono es obligatorio', 'error');
      return;
    }
    
    if (!fechaReserva) {
      mostrarNotificacion('La fecha es obligatoria', 'error');
      return;
    }
    
    if (!horaReserva) {
      mostrarNotificacion('La hora es obligatoria', 'error');
      return;
    }

    // Validar que la fecha no sea en el pasado
    const fechaHoraReserva = new Date(`${fechaReserva}T${horaReserva}`);
    const ahora = new Date();
    
    if (fechaHoraReserva < ahora) {
      mostrarNotificacion('No se puede reservar en el pasado', 'error');
      return;
    }

    // Verificar disponibilidad de la mesa en esa fecha/hora
    const conflicto = reservasActivas.find(r => 
      r.mesa === mesaAReservar && 
      r.fecha === fechaReserva && 
      r.estado !== 'cancelada' &&
      Math.abs(new Date(`${r.fecha}T${r.hora}`).getTime() - fechaHoraReserva.getTime()) < (Math.max(r.duracion, duracionReserva) * 60000)
    );

    if (conflicto) {
      mostrarNotificacion(`La mesa ya está reservada el ${conflicto.fecha} a las ${conflicto.hora}`, 'error');
      return;
    }

    if (mesaAReservar) {
      const nuevaReserva = {
        id: Date.now(),
        mesa: mesaAReservar,
        nombre: nombreReserva,
        telefono: telefonoReserva,
        fecha: fechaReserva,
        hora: horaReserva,
        duracion: duracionReserva,
        comentarios: comentariosReserva,
        estado: 'confirmada' as const,
        fechaCreacion: new Date().toISOString()
      };

      setReservasActivas(prev => [...prev, nuevaReserva]);
      
      // Solo marcar como reservada si es para hoy
      const esHoy = fechaReserva === new Date().toISOString().split('T')[0];
      if (esHoy) {
        setMesas(mesas => mesas.map(m => 
          m.numero === mesaAReservar 
            ? { ...m, estado: 'reservada', reservadoPor: `${nombreReserva} - ${horaReserva}` }
            : m
        ));
      }
      
      mostrarNotificacion(`Reserva confirmada: Mesa ${mesaAReservar} para ${nombreReserva} el ${fechaReserva} a las ${horaReserva}`, 'success');
      setOpenReservaMesa(false);
      limpiarFormularioReserva();
    }
  };

  const limpiarFormularioReserva = () => {
    setMesaAReservar(null);
    setNombreReserva('');
    setTelefonoReserva('');
    setFechaReserva('');
    setHoraReserva('');
    setDuracionReserva(90);
    setComentariosReserva('');
  };

  const cancelarReserva = (reservaId: number) => {
    setReservasActivas(prev => prev.map(r => 
      r.id === reservaId ? { ...r, estado: 'cancelada' as const } : r
    ));
    
    // Liberar mesa si estaba marcada como reservada
    const reserva = reservasActivas.find(r => r.id === reservaId);
    if (reserva) {
      setMesas(mesas => mesas.map(m => 
        m.numero === reserva.mesa && m.estado === 'reservada' 
          ? { ...m, estado: 'libre', reservadoPor: '' }
          : m
      ));
      mostrarNotificacion(`Reserva cancelada: Mesa ${reserva.mesa}`, 'info');
    }
  };

  const obtenerReservasDelDia = (fecha: string) => {
    return reservasActivas.filter(r => r.fecha === fecha && r.estado !== 'cancelada');
  };

  // Función para determinar el estado inteligente de una mesa
  const determinarEstadoMesa = (numeroMesa: number) => {
    const mesa = mesas.find(m => m.numero === numeroMesa);
    if (!mesa) return { estado: 'libre', color: '#43a047', descripcion: 'Libre' };

    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // minutos desde medianoche
    const fechaHoy = ahora.toISOString().split('T')[0];

    // Buscar reservas de hoy para esta mesa
    const reservasHoy = reservasActivas.filter(r => 
      r.mesa === numeroMesa && 
      r.fecha === fechaHoy && 
      r.estado === 'confirmada'
    );

    // Buscar si hay un pedido activo en esta mesa
    const pedidoActivo = pedidosAbiertos.find(p => 
      p.tipo === 'mesa' && p.ref === String(numeroMesa)
    );

    // Verificar si hay alguna reserva activa ahora (dentro de su horario)
    const reservaActiva = reservasHoy.find(r => {
      const [horaR, minR] = r.hora.split(':').map(Number);
      const horaReserva = horaR * 60 + minR;
      const tiempoTranscurrido = horaActual - horaReserva;
      
      // La reserva está activa si estamos dentro de su ventana de tiempo
      return tiempoTranscurrido >= -15 && tiempoTranscurrido <= r.duracion; // 15 min de tolerancia antes
    });

    // Buscar próxima reserva de hoy
    const proximaReserva = reservasHoy.find(r => {
      const [horaR, minR] = r.hora.split(':').map(Number);
      const horaReserva = horaR * 60 + minR;
      return horaReserva > horaActual; // Reserva futura
    });

    // Determinar estado según las condiciones
    if (pedidoActivo && (proximaReserva || reservaActiva)) {
      // Mesa ocupada + cualquier reserva = Rojo con calendario
      const reservaInfo = proximaReserva || reservaActiva;
      return {
        estado: 'ocupada',
        color: '#d32f2f', // Rojo normal
        descripcion: 'Ocupada',
        proximaReserva: {
          nombre: reservaInfo?.nombre || '',
          hora: reservaInfo?.hora || '',
          telefono: reservaInfo?.telefono || ''
        }
      };
    } else if (pedidoActivo) {
      // Solo ocupada (sin reserva)
      return {
        estado: 'ocupada',
        color: '#d32f2f', // Rojo
        descripcion: 'Ocupada',
        proximaReserva: null
      };
    } else if (reservaActiva) {
      // Reserva activa pero mesa libre (cliente no ha llegado)
      return {
        estado: 'reservada',
        color: '#ff9800', // Naranja
        descripcion: 'Reservada',
        proximaReserva: null
      };
    } else if (proximaReserva) {
      // Mesa libre con reserva futura
      const [horaR, minR] = proximaReserva.hora.split(':').map(Number);
      const horaReserva = horaR * 60 + minR;
      const minutosRestantes = horaReserva - horaActual;
      
      if (minutosRestantes <= 30) {
        // Próxima reserva en menos de 30 minutos - advertencia
        return {
          estado: 'reservada',
          color: '#ff6f00', // Naranja más intenso
          descripcion: 'Reservada',
          proximaReserva: {
            nombre: proximaReserva.nombre,
            hora: proximaReserva.hora,
            telefono: proximaReserva.telefono
          }
        };
      } else {
        // Reserva futura pero con tiempo suficiente
        return {
          estado: 'libre',
          color: '#81c784', // Verde claro (con indicador de reserva)
          descripcion: 'Libre',
          proximaReserva: {
            nombre: proximaReserva.nombre,
            hora: proximaReserva.hora,
            telefono: proximaReserva.telefono
          }
        };
      }
    } else {
      // Mesa completamente libre
      return {
        estado: 'libre',
        color: '#43a047', // Verde normal
        descripcion: 'Libre',
        proximaReserva: null
      };
    }
  };

  // Funciones para login de usuario
  const iniciarSesion = () => {
    setOpenLogin(true);
    setPasswordLogin('');
  };

  const cerrarSesion = () => {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      setUsuarioActual('');
      mostrarNotificacion('Sesión cerrada', 'info');
    }
  };

  const confirmarLogin = () => {
    // Simulación de login (en producción sería contra base de datos)
    if (passwordLogin === '1234') {
      setUsuarioActual('Cajero Principal');
      setOpenLogin(false);
      mostrarNotificacion('Sesión iniciada exitosamente', 'success');
    } else if (passwordLogin === 'admin') {
      setUsuarioActual('Administrador');
      setOpenLogin(false);
      mostrarNotificacion('Sesión de administrador iniciada', 'success');
    } else {
      mostrarNotificacion('Contraseña incorrecta', 'error');
    }
    setPasswordLogin('');
  };


  // Funciones para gestión de estados de pedidos - NUEVA FUNCIONALIDAD
  const cambiarEstadoPedido = (pedidoId: number, nuevoEstado: string) => {
    setPedidosAbiertos(prev => prev.map(p => 
      p.id === pedidoId 
        ? { 
            ...p, 
            estado: nuevoEstado,
            horaActualizacion: new Date().toLocaleString(),
            // Si se marca como entregado, agregar hora de entrega
            horaEntrega: nuevoEstado === 'entregado' ? new Date().toLocaleString() : p.horaEntrega
          }
        : p
    ));
    
    const pedido = pedidosAbiertos.find(p => p.id === pedidoId);
    if (pedido) {
      mostrarNotificacion(`${pedido.tipo} ${pedido.ref} marcado como ${nuevoEstado}`, 'success');
    }
  };

  const iniciarNuevoDeliveryPickup = (tipo: 'delivery' | 'pickup') => {
    setTipoNuevoPedido(tipo);
    setFormDelivery({
      cliente: '',
      telefono: '',
      direccion: '',
      proveedorDelivery: 'PROPIO',
      notas: '',
      tiempoEstimado: tipo === 'delivery' ? 45 : 20
    });
    setOpenDeliveryPickup(true);
  };

  const confirmarNuevoDeliveryPickup = () => {
    if (!formDelivery.cliente.trim() || !formDelivery.telefono.trim()) {
      mostrarNotificacion('Cliente y teléfono son obligatorios', 'error');
      return;
    }

    if (tipoNuevoPedido === 'delivery' && !formDelivery.direccion.trim()) {
      mostrarNotificacion('La dirección es obligatoria para delivery', 'error');
      return;
    }

    // Guardar pedido anterior si existe
    if (pedidoEnEdicion && productos.length > 0) {
      actualizarPedidoAbierto();
      mostrarNotificacion(`Cambios guardados automáticamente en ${pedidoEnEdicion.tipo === 'mesa' ? 'Mesa' : pedidoEnEdicion.tipo} ${pedidoEnEdicion.ref}`, 'info');
    }

    // Crear nuevo pedido con datos completos
    const nuevoPedido = {
      id: Date.now(),
      tipo: tipoNuevoPedido,
      ref: formDelivery.cliente,
      productos: [],
      tipoCliente: 'final',
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      cliente: formDelivery.cliente,
      telefono: formDelivery.telefono,
      direccion: formDelivery.direccion,
      proveedorDelivery: formDelivery.proveedorDelivery,
      notas: formDelivery.notas,
      tiempoEstimado: formDelivery.tiempoEstimado,
      horaCreacion: new Date().toLocaleString(),
      horaEstimadaEntrega: new Date(Date.now() + formDelivery.tiempoEstimado * 60000).toLocaleString(),
    };

    setPedidosAbiertos(prev => [...prev, nuevoPedido]);

    // Limpiar venta actual y establecer nuevo pedido en edición
    setProductos([]);
    setDescuentoAplicado(null);
    setTipoCliente('final');
    setPedidoEnEdicion({
      id: nuevoPedido.id,
      tipo: tipoNuevoPedido,
      ref: formDelivery.cliente
    });

    setOpenDeliveryPickup(false);
    mostrarNotificacion(`${tipoNuevoPedido} para ${formDelivery.cliente} iniciado`, 'success');
  };

  const obtenerPedidosPorTipo = (tipo: 'todos' | 'mesa' | 'delivery' | 'pickup' | 'barra') => {
    if (tipo === 'todos') return pedidosAbiertos;
    return pedidosAbiertos.filter(p => p.tipo === tipo);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#ff9800'; // Naranja
      case 'preparando': return '#2196f3'; // Azul
      case 'listo': return '#4caf50'; // Verde
      case 'en_camino': return '#9c27b0'; // Púrpura
      case 'entregado': return '#388e3c'; // Verde oscuro
      case 'cancelado': return '#f44336'; // Rojo
      case 'abierto': return '#607d8b'; // Gris azul
      default: return '#757575'; // Gris
    }
  };

  const getEstadosDisponibles = (tipo: string) => {
    if (tipo === 'mesa') {
      return ['abierto', 'cancelado'];
    } else if (tipo === 'delivery') {
      return ['pendiente', 'preparando', 'listo', 'en_camino', 'entregado', 'cancelado'];
    } else if (tipo === 'pickup') {
      return ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado'];
    }
    return [];
  };

  // Funciones para pedidos de barra/general - NUEVA FUNCIONALIDAD
  const iniciarNuevoPedidoBarra = () => {
    setNombreClienteBarra('');
    setOpenNuevoPedidoBarra(true);
  };

  const confirmarNuevoPedidoBarra = () => {
    if (!nombreClienteBarra.trim()) {
      mostrarNotificacion('Debe ingresar un nombre para el cliente', 'error');
      return;
    }

    // Crear nuevo pedido de barra
    crearNuevoPedidoAbierto('barra', nombreClienteBarra.trim());
    
    setOpenNuevoPedidoBarra(false);
    mostrarNotificacion(`Pedido de barra para ${nombreClienteBarra} iniciado`, 'success');
  };

  // Funciones para configuración SUPER - Backup en la Nube
  const probarConexionNube = async (servicio: 'google' | 'onedrive') => {
    setEstadoConexionNube({ probando: true, servicio, resultado: null, mensaje: '' });
    
    try {
      const response = await fetch('/api/backup/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEstadoConexionNube({ 
          probando: false, 
          servicio, 
          resultado: 'exito', 
          mensaje: `✅ Conexión exitosa con ${servicio === 'google' ? 'Google Drive' : 'OneDrive'}` 
        });
        
        // Actualizar estado de configuración
        setConfiguracionBackup(prev => ({
          ...prev,
          [servicio === 'google' ? 'googleDrive' : 'oneDrive']: {
            ...prev[servicio === 'google' ? 'googleDrive' : 'oneDrive'],
            estado: 'conectado'
          }
        }));
      } else {
        setEstadoConexionNube({ 
          probando: false, 
          servicio, 
          resultado: 'error', 
          mensaje: `❌ Error: ${data.error}` 
        });
      }
    } catch (error) {
      setEstadoConexionNube({ 
        probando: false, 
        servicio, 
        resultado: 'error', 
        mensaje: `❌ Error de conexión` 
      });
    }
  };

  const configurarServicioNube = async (servicio: 'google' | 'onedrive') => {
    try {
      const response = await fetch('/api/backup/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servicio })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.authUrl) {
          // Abrir ventana de autorización
          window.open(data.authUrl, '_blank', 'width=600,height=400');
          mostrarNotificacion(`🔐 Complete la autorización en la ventana que se abrió`, 'info');
        } else {
          // Configuración completada
          setConfiguracionBackup(prev => ({
            ...prev,
            [servicio === 'google' ? 'googleDrive' : 'oneDrive']: {
              ...prev[servicio === 'google' ? 'googleDrive' : 'oneDrive'],
              configurado: true,
              email: data.email || '',
              estado: 'conectado'
            },
            servicioActivo: servicio
          }));
          mostrarNotificacion(`✅ ${servicio === 'google' ? 'Google Drive' : 'OneDrive'} configurado correctamente`, 'success');
        }
      } else {
        mostrarNotificacion(`❌ Error: ${data.error}`, 'error');
      }
    } catch (error) {
      mostrarNotificacion('❌ Error de configuración', 'error');
    }
  };

  const activarBackupAutomatico = async () => {
    if (configuracionBackup.servicioActivo === 'ninguno') {
      mostrarNotificacion('❌ Configure primero un servicio en la nube', 'error');
      return;
    }

    try {
      const response = await fetch('/api/backup/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio: configuracionBackup.servicioActivo,
          programacion: configuracionBackup.programacion
        })
      });

      const data = await response.json();

      if (data.success) {
        setConfiguracionBackup(prev => ({
          ...prev,
          programacion: { ...prev.programacion, activo: true }
        }));
        mostrarNotificacion(`✅ Backup automático activado (${configuracionBackup.programacion.frecuencia})`, 'success');
        guardarConfiguracionBackup();
      } else {
        mostrarNotificacion(`❌ Error: ${data.error}`, 'error');
      }
    } catch (error) {
      mostrarNotificacion('❌ Error al activar backup automático', 'error');
    }
  };

  const ejecutarBackupManual = async () => {
    if (configuracionBackup.servicioActivo === 'ninguno') {
      mostrarNotificacion('❌ Configure primero un servicio en la nube', 'error');
      return;
    }

    try {
      mostrarNotificacion('🔄 Iniciando backup manual...', 'info');
      
      const response = await fetch('/api/backup/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio: configuracionBackup.servicioActivo,
          manual: true
        })
      });

      const data = await response.json();

      if (data.success) {
        const ahora = new Date().toLocaleString();
        setConfiguracionBackup(prev => ({
          ...prev,
          [configuracionBackup.servicioActivo === 'google' ? 'googleDrive' : 'oneDrive']: {
            ...prev[configuracionBackup.servicioActivo === 'google' ? 'googleDrive' : 'oneDrive'],
            ultimoBackup: ahora
          }
        }));
        mostrarNotificacion(`✅ Backup completado: ${data.archivo}`, 'success');
        guardarConfiguracionBackup();
      } else {
        mostrarNotificacion(`❌ Error: ${data.error}`, 'error');
      }
    } catch (error) {
      mostrarNotificacion('❌ Error al ejecutar backup', 'error');
    }
  };

  const cargarConfiguracionBackup = () => {
    const config = localStorage.getItem('configuracionBackup');
    if (config) {
      try {
        setConfiguracionBackup(JSON.parse(config));
      } catch (error) {
        console.error('Error cargando configuración backup:', error);
      }
    }
  };

  const guardarConfiguracionBackup = () => {
    localStorage.setItem('configuracionBackup', JSON.stringify(configuracionBackup));
  };

  const instalarRclone = async () => {
    try {
      mostrarNotificacion('🔄 Instalando rclone...', 'info');
      
      const response = await fetch('/api/install-rclone', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.alreadyInstalled) {
          mostrarNotificacion('✅ rclone ya está instalado', 'success');
        } else {
          mostrarNotificacion('✅ rclone instalado correctamente', 'success');
          if (data.restartRequired) {
            setTimeout(() => {
              if (confirm('rclone se instaló correctamente. ¿Desea recargar la página para usar las nuevas funciones?')) {
                window.location.reload();
              }
            }, 2000);
          }
        }
      } else {
        if (data.needsManualInstall) {
          const os = navigator.platform.includes('Mac') ? 'macos' : 
                    navigator.platform.includes('Win') ? 'windows' : 'linux';
          alert(`❌ Error en la instalación automática\n\nInstale rclone manualmente:\n\n${data.manualInstructions[os]}\n\nReinicie la aplicación después de la instalación.`);
          mostrarNotificacion('⚠️ Instale rclone manualmente', 'warning');
        } else {
          mostrarNotificacion(`❌ ${data.error}`, 'error');
        }
      }
    } catch (error) {
      console.error('Error instalando rclone:', error);
      mostrarNotificacion('❌ Error de red al instalar rclone', 'error');
    }
  };

  // Funciones para Business Central y Cierres de Turno - NUEVA FUNCIONALIDAD EMPRESARIAL
  const cambiarAlmacen = (codigoAlmacen: string) => {
    const almacen = configuracionAlmacenes.almacenes.find(a => a.codigo === codigoAlmacen);
    if (almacen) {
      setConfiguracionAlmacenes(prev => ({
        ...prev,
        almacenActual: codigoAlmacen,
        codigoPV: almacen.codigoPV
      }));
      
      // Guardar en localStorage
      localStorage.setItem('almacenActual', codigoAlmacen);
      localStorage.setItem('codigoPV', almacen.codigoPV);
      
      mostrarNotificacion(`✅ Almacén cambiado a: ${almacen.nombre} (PV: ${almacen.codigoPV})`, 'success');
    }
  };

  const validarCierreTurnoConERP = async () => {
    if (!configuracionBusinessCentral.habilitado) {
      mostrarNotificacion('⚠️ Business Central no está configurado', 'warning');
      return false;
    }

    try {
      mostrarNotificacion('🔄 Validando cierre de turno con ERP...', 'info');
      
      const datosVentas = {
        sucursal: configuracionAlmacenes.almacenActual,
        codigoPV: configuracionAlmacenes.codigoPV,
        fechaApertura: estadoCierreTurno.fechaApertura,
        horaApertura: estadoCierreTurno.horaApertura,
        montoApertura: estadoCierreTurno.montoApertura,
        ventasDelTurno: estadoCierreTurno.ventasDelTurno,
        fechaCierre: new Date().toISOString().split('T')[0],
        horaCierre: new Date().toTimeString().slice(0, 5),
        usuario: usuarioActual
      };

      const response = await fetch('/api/business-central/validar-cierre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosVentas)
      });

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion('✅ Cierre de turno validado con ERP', 'success');
        setEstadoCierreTurno(prev => ({
          ...prev,
          turnoAbierto: false,
          ultimoCierre: new Date().toISOString(),
          requiereValidacionERP: false
        }));
        return true;
      } else {
        mostrarNotificacion(`❌ Error en validación ERP: ${data.error}`, 'error');
        return false;
      }
    } catch (error) {
      mostrarNotificacion('❌ Error de conexión con ERP', 'error');
      return false;
    }
  };

  const abrirNuevoTurno = () => {
    const montoApertura = prompt('Ingrese el monto de apertura de caja:');
    if (montoApertura && !isNaN(Number(montoApertura))) {
      setEstadoCierreTurno({
        turnoAbierto: true,
        fechaApertura: new Date().toISOString().split('T')[0],
        horaApertura: new Date().toTimeString().slice(0, 5),
        montoApertura: Number(montoApertura),
        ventasDelTurno: 0,
        ultimoCierre: null,
        requiereValidacionERP: configuracionBusinessCentral.habilitado
      });
      
      mostrarNotificacion(`✅ Nuevo turno abierto con L${montoApertura}`, 'success');
    }
  };

  const sincronizarConBusinessCentral = async () => {
    if (!configuracionBusinessCentral.habilitado) {
      mostrarNotificacion('❌ Business Central no está configurado', 'error');
      return;
    }

    try {
      mostrarNotificacion('🔄 Sincronizando con Business Central...', 'info');
      
      const response = await fetch('/api/business-central/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sucursal: configuracionAlmacenes.almacenActual,
          config: configuracionBusinessCentral
        })
      });

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion(`✅ Sincronización completada: ${data.registros} registros`, 'success');
      } else {
        mostrarNotificacion(`❌ Error en sincronización: ${data.error}`, 'error');
      }
    } catch (error) {
      mostrarNotificacion('❌ Error de conexión con Business Central', 'error');
    }
  };

  const enviarVentaABusinessCentral = async (datosVenta: any) => {
    try {
      if (!configuracionBusinessCentral.habilitado) {
        return;
      }

      // Aquí iría la lógica real de envío a Business Central
      console.log('Enviando venta a Business Central:', datosVenta);
      
      // Simular envío exitoso
      mostrarNotificacion('Venta enviada a Business Central', 'success');
    } catch (error) {
      console.error('Error enviando venta a Business Central:', error);
      mostrarNotificacion('Error enviando venta a Business Central', 'error');
    }
  };

  // NUEVA FUNCIÓN: Probar conexión con Business Central usando OAuth 2.0
  const probarConexionBusinessCentral = async () => {
    try {
      mostrarNotificacion('🔄 Probando conexión con Business Central...', 'info');

      // Validar que todos los campos estén completos
      if (!configuracionBusinessCentral.tenantId || 
          !configuracionBusinessCentral.companyId ||
          !configuracionBusinessCentral.username ||  // Client ID
          !configuracionBusinessCentral.password) { // Client Secret
        mostrarNotificacion('❌ Complete todos los campos de configuración', 'error');
        return;
      }

      // Paso 1: Obtener token OAuth 2.0
      const tokenUrl = `https://login.microsoftonline.com/${configuracionBusinessCentral.tenantId}/oauth2/v2.0/token`;
      
      const tokenData = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': configuracionBusinessCentral.username, // Client ID
        'client_secret': configuracionBusinessCentral.password, // Client Secret
        'scope': 'https://api.businesscentral.dynamics.com/.default'
      });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenData
      });

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error('Error obteniendo token:', tokenResponse.status, tokenError);
        
        if (tokenResponse.status === 400) {
          mostrarNotificacion('❌ Client ID o Client Secret inválido', 'error');
        } else if (tokenResponse.status === 401) {
          mostrarNotificacion('❌ Tenant ID inválido', 'error');
        } else {
          mostrarNotificacion(`❌ Error de autenticación: ${tokenResponse.status}`, 'error');
        }
        return;
      }

      const tokenResult = await tokenResponse.json();
      const accessToken = tokenResult.access_token;

      // Paso 2: Probar API con el token
      const baseUrl = configuracionBusinessCentral.baseUrl || 'https://api.businesscentral.dynamics.com';
      const apiUrl = `${baseUrl}/v2.0/${configuracionBusinessCentral.tenantId}/${configuracionBusinessCentral.environment}/api/v2.0/companies`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Empresas disponibles:', data);
        
        // Verificar si la empresa especificada existe
        const empresaEncontrada = data.value?.find((company: any) => 
          company.id === configuracionBusinessCentral.companyId
        );

        if (empresaEncontrada) {
          mostrarNotificacion(`✅ Conexión exitosa con Business Central! Empresa: ${empresaEncontrada.displayName}`, 'success');
          
          // Actualizar estado de configuración
          setConfiguracionBusinessCentral(prev => ({
            ...prev,
            habilitado: true
          }));
        } else {
          mostrarNotificacion(`⚠️ Conexión exitosa pero empresa ${configuracionBusinessCentral.companyId} no encontrada`, 'warning');
          
          // Mostrar las empresas disponibles en consola para debug
          console.log('Empresas disponibles:', data.value?.map((c: any) => ({ id: c.id, name: c.displayName })));
        }
      } else {
        const errorText = await response.text();
        console.error('Error de API:', response.status, errorText);
        
        if (response.status === 401) {
          mostrarNotificacion('❌ Token inválido. Verifique permisos de la aplicación', 'error');
        } else if (response.status === 404) {
          mostrarNotificacion('❌ Environment no válido', 'error');
        } else {
          mostrarNotificacion(`❌ Error de API: ${response.status}`, 'error');
        }
      }
    } catch (error: any) {
      console.error('Error probando conexión:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        mostrarNotificacion('❌ Error de red. Verifique conexión a internet', 'error');
      } else {
        mostrarNotificacion(`❌ Error: ${error.message}`, 'error');
      }
    }
  };

  // Estados para diálogos
  const [openTestPostman, setOpenTestPostman] = useState(false);
  const [resultadosTestPostman, setResultadosTestPostman] = useState<any>(null);

  // NUEVA FUNCIÓN: Test tipo Postman con resultados detallados en la interfaz
  const ejecutarTestPostmanBusinessCentral = async () => {
    try {
      setOpenTestPostman(true);
      setResultadosTestPostman({ loading: true, message: '🔄 Iniciando test tipo Postman...' });

      // Validar configuración
      if (!configuracionBusinessCentral.tenantId || 
          !configuracionBusinessCentral.companyId ||
          !configuracionBusinessCentral.username ||
          !configuracionBusinessCentral.password) {
        setResultadosTestPostman({
          error: true,
          message: '❌ Complete todos los campos de configuración',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const resultados = {
        timestamp: new Date().toISOString(),
        config: {
          tenantId: configuracionBusinessCentral.tenantId,
          environment: configuracionBusinessCentral.environment,
          companyId: configuracionBusinessCentral.companyId,
          baseUrl: configuracionBusinessCentral.baseUrl
        },
        steps: [] as any[]
      };

      // PASO 1: Obtener token OAuth 2.0
      const tokenUrl = `https://login.microsoftonline.com/${configuracionBusinessCentral.tenantId}/oauth2/v2.0/token`;
      
      const tokenData = new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': configuracionBusinessCentral.username,
        'client_secret': configuracionBusinessCentral.password,
        'scope': 'https://api.businesscentral.dynamics.com/.default'
      });

      const paso1: any = {
        step: 1,
        name: '🔐 Obtener Token OAuth 2.0',
        url: tokenUrl,
        method: 'POST',
        requestHeaders: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        requestBody: 'grant_type=client_credentials&client_id=***&client_secret=***&scope=https://api.businesscentral.dynamics.com/.default'
      };

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: tokenData
      });

      paso1.responseStatus = tokenResponse.status;
      paso1.responseStatusText = tokenResponse.statusText;
      paso1.responseHeaders = Object.fromEntries(tokenResponse.headers.entries());

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        paso1.responseBody = tokenError;
        paso1.success = false;
        paso1.error = `Error ${tokenResponse.status}: ${tokenResponse.statusText}`;
        
        resultados.steps.push(paso1);
        setResultadosTestPostman({
          ...resultados,
          success: false,
          error: `❌ Error en autenticación: ${tokenResponse.status}`
        });
        return;
      }

      const tokenResult = await tokenResponse.json();
      paso1.responseBody = {
        token_type: tokenResult.token_type,
        expires_in: tokenResult.expires_in,
        access_token: tokenResult.access_token ? `${tokenResult.access_token.substring(0, 50)}...` : 'N/A'
      };
      paso1.success = true;
      resultados.steps.push(paso1);

      // PASO 2: Probar API de Companies
      const baseUrl = configuracionBusinessCentral.baseUrl || 'https://api.businesscentral.dynamics.com';
      const companiesUrl = `${baseUrl}/v2.0/${configuracionBusinessCentral.tenantId}/${configuracionBusinessCentral.environment}/api/v2.0/companies`;

      const paso2: any = {
        step: 2,
        name: '🏢 Obtener Lista de Empresas',
        url: companiesUrl,
        method: 'GET',
        requestHeaders: {
          'Authorization': `Bearer ${tokenResult.access_token.substring(0, 20)}...`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const companiesResponse = await fetch(companiesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenResult.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      paso2.responseStatus = companiesResponse.status;
      paso2.responseStatusText = companiesResponse.statusText;
      paso2.responseHeaders = Object.fromEntries(companiesResponse.headers.entries());

      if (!companiesResponse.ok) {
        const companiesError = await companiesResponse.text();
        paso2.responseBody = companiesError;
        paso2.success = false;
        paso2.error = `Error ${companiesResponse.status}: ${companiesResponse.statusText}`;
        
        resultados.steps.push(paso2);
        setResultadosTestPostman({
          ...resultados,
          success: false,
          error: `❌ Error en API de empresas: ${companiesResponse.status}`
        });
        return;
      }

      const companiesData = await companiesResponse.json();
      paso2.responseBody = {
        totalCompanies: companiesData.value?.length || 0,
        companies: companiesData.value?.map((c: any) => ({
          id: c.id,
          name: c.displayName || c.name,
          systemVersion: c.systemVersion
        })) || []
      };
      paso2.success = true;
      resultados.steps.push(paso2);

      // PASO 3: Verificar empresa específica
      const empresaEncontrada = companiesData.value?.find((company: any) => 
        company.id === configuracionBusinessCentral.companyId
      );

      const paso3 = {
        step: 3,
        name: '🎯 Verificar Empresa Específica',
        targetCompanyId: configuracionBusinessCentral.companyId,
        found: !!empresaEncontrada,
        companyDetails: empresaEncontrada ? {
          id: empresaEncontrada.id,
          name: empresaEncontrada.displayName || empresaEncontrada.name,
          systemVersion: empresaEncontrada.systemVersion,
          created: empresaEncontrada.systemCreatedAt
        } : null,
        success: !!empresaEncontrada
      };
      resultados.steps.push(paso3);

      // PASO 4: Probar API de Items (si la empresa existe)
      if (empresaEncontrada) {
        const itemsUrl = `${baseUrl}/v2.0/${configuracionBusinessCentral.tenantId}/${configuracionBusinessCentral.environment}/api/v2.0/companies(${configuracionBusinessCentral.companyId})/items?$top=5`;

        const paso4: any = {
          step: 4,
          name: '📦 Obtener Items de la Empresa',
          url: itemsUrl,
          method: 'GET',
          requestHeaders: {
            'Authorization': `Bearer ${tokenResult.access_token.substring(0, 20)}...`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };

        const itemsResponse = await fetch(itemsUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokenResult.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        paso4.responseStatus = itemsResponse.status;
        paso4.responseStatusText = itemsResponse.statusText;
        paso4.responseHeaders = Object.fromEntries(itemsResponse.headers.entries());

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          paso4.responseBody = {
            totalItems: itemsData.value?.length || 0,
            items: itemsData.value?.map((item: any) => ({
              number: item.number,
              displayName: item.displayName,
              type: item.type,
              unitPrice: item.unitPrice,
              inventory: item.inventory
            })) || []
          };
          paso4.success = true;
        } else {
          const itemsError = await itemsResponse.text();
          paso4.responseBody = itemsError;
          paso4.success = false;
          paso4.error = `Error ${itemsResponse.status}: ${itemsResponse.statusText}`;
        }
        resultados.steps.push(paso4);
      }

      // Resultado final
      const allStepsSuccessful = resultados.steps.every(step => step.success !== false);
      setResultadosTestPostman({
        ...resultados,
        success: allStepsSuccessful,
        summary: {
          totalSteps: resultados.steps.length,
          successfulSteps: resultados.steps.filter(step => step.success === true).length,
          failedSteps: resultados.steps.filter(step => step.success === false).length,
          companyFound: !!empresaEncontrada,
          companyName: empresaEncontrada?.displayName || empresaEncontrada?.name || 'N/A'
        },
        message: allStepsSuccessful ? '✅ Test completado exitosamente' : '❌ Test completado con errores'
      });

    } catch (error: any) {
      setResultadosTestPostman({
        error: true,
        message: `❌ Error durante el test: ${error.message}`,
        timestamp: new Date().toISOString(),
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden', bgcolor: '#e5e5e5', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Sistema POS Honduras</title>
        <style>{`
          .tipo-cliente-button:hover {
            transform: none !important;
            scale: 1 !important;
          }
        `}</style>
      </Head>
      
      {/* Panel principal */}
      <Grid container sx={{ flex: 1, height: '100vh', minHeight: 0 }}>
        {/* Columna izquierda */}
        <Grid item xs={2} sx={{ bgcolor: '#222', display: 'flex', flexDirection: 'column', gap: 0.5, p: 1, alignItems: 'stretch', height: '100vh', minHeight: 0 }}>
          {accionesIzquierda.map((accion) => (
            <Button key={accion} variant="contained" sx={{ 
              bgcolor: '#222', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 14, 
              py: 0.7, 
              borderRadius: 0, 
              mb: 0.5, 
              boxShadow: 'none', 
              border: '1px solid #444', 
              minHeight: 36, 
              height: 36, 
              lineHeight: 1, 
              minWidth: 0,
              '&:hover': {
                bgcolor: '#333',
                transform: 'none',
                scale: 'none',
                boxShadow: 'none',
              },
              transition: 'background-color 0.2s ease',
            }} fullWidth
              onClick={() => {
                if (accion === 'DESCUENTO 3ERA/4TA EDAD') {
                  aplicarDescuentoTerceraEdad();
                } else if (accion === 'DESCUENTO') {
                  setOpenDescuento(true);
                } else if (accion === 'CANCELAR VENTA') {
                  limpiarEdicion();
                } else if (accion === 'SUSPENDER VENTA') {
                  suspenderVenta();
                } else if (accion === 'LLAMAR VENTA') {
                  setOpenLlamarVenta(true);
                } else if (accion === 'ANULAR PRODUCTO') {
                  anularProducto();
                } else if (accion === 'REIMPRIMIR RECIBO') {
                  reimprimirUltimoRecibo();
                } else if (accion === 'BUSCAR PRODUCTO') {
                  setOpenBuscarProducto(true);
                } else if (accion === 'DETALLE DE PRODUCTO') {
                  mostrarDetalleProducto();
                }
              }}
            >
              {accion}
            </Button>
          ))}
          {/* Botones de nuevo delivery y pickup */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
            <Button variant="contained" sx={{ bgcolor: '#1976d2', color: '#fff', fontWeight: 700, borderRadius: 1, flex: 1 }} onClick={() => iniciarNuevoDeliveryPickup('delivery')}>
              NUEVO DELIVERY
            </Button>
            <Button variant="contained" sx={{ bgcolor: '#388e3c', color: '#fff', fontWeight: 700, borderRadius: 1, flex: 1 }} onClick={() => iniciarNuevoDeliveryPickup('pickup')}>
              NUEVO PICKUP
            </Button>
          </Box>
          
          {/* Botón calendario de reservas */}
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#ff9800', 
              color: '#fff', 
              fontWeight: 700, 
              borderRadius: 1, 
              mb: 1,
              '&:hover': {
                bgcolor: '#f57f17',
                transform: 'none',
                boxShadow: 'none',
              },
              transition: 'background-color 0.2s ease',
            }} 
            fullWidth 
            onClick={() => setOpenCalendarioReservas(true)}
          >
            📅 CALENDARIO RESERVAS ({reservasActivas.filter(r => r.estado !== 'cancelada').length})
          </Button>
          
          {/* Grid de mesas con scroll propio */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1, pb: 1 }}>
            {mesas.map((mesa) => {
              const estadoMesa = determinarEstadoMesa(mesa.numero);
              
              return (
                <Button 
                  key={mesa.numero} 
                  variant="contained" 
                  sx={{ 
                    bgcolor: estadoMesa.color, 
                    color: '#fff', 
                    fontWeight: 700, 
                    borderRadius: 1, 
                    minHeight: 48, 
                    fontSize: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    position: 'relative',
                    '&:hover': {
                      bgcolor: estadoMesa.color,
                      transform: 'none',
                      scale: 'none',
                      boxShadow: 'none',
                      filter: 'brightness(1.1)',
                    },
                    transition: 'filter 0.2s ease',
                  }}
                  onClick={(event) => handleClickMesa(mesa.numero, event)}
                >
                  <Box sx={{ fontSize: 18, fontWeight: 700 }}>
                    {mesa.numero}
                  </Box>
                  <Box sx={{ fontSize: 10, opacity: 0.9, textAlign: 'center', lineHeight: 1 }}>
                    {estadoMesa.descripcion}
                  </Box>
                  
                  {/* Indicador visual para reserva futura */}
                  {estadoMesa.proximaReserva && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 2, 
                      right: 2, 
                      bgcolor: 'rgba(255,255,255,0.9)', 
                      color: '#000', 
                      borderRadius: '50%', 
                      width: 16, 
                      height: 16, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 10,
                      fontWeight: 700
                    }}>
                      📅
                    </Box>
                  )}
                </Button>
              );
            })}
          </Box>
        </Grid>
        {/* Panel central: tipos de cliente + tabla de productos + totales + botón cobrar */}
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', p: 2, height: '100%', minHeight: 0 }}>
          {/* Tipos de cliente */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1, justifyContent: 'center' }}>
            {tiposCliente.map((tipo) => (
              <Button
                key={tipo.value}
                variant={tipoCliente === tipo.value ? 'contained' : 'outlined'}
                className="tipo-cliente-button"
                sx={{
                  bgcolor: tipoCliente === tipo.value ? '#388e3c' : '#fff',
                  color: tipoCliente === tipo.value ? '#fff' : '#388e3c',
                  fontWeight: 700,
                  fontSize: 15,
                  px: 2,
                  py: 1,
                  borderRadius: 0,
                  minWidth: 120,
                  boxShadow: 'none',
                  border: tipoCliente === tipo.value ? '2px solid #388e3c' : '2px solid #388e3c',
                  letterSpacing: 0.5,
                  '&:hover': {
                    bgcolor: tipoCliente === tipo.value ? '#2e7d32' : '#f5f5f5',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => {
                  setTipoCliente(tipo.value);
                  if (tipo.value === 'rtn' || tipo.value === 'credito') setOpenClientes(tipo.value);
                }}
              >
                {tipo.label}
              </Button>
            ))}
          </Box>
          
          {/* Indicador de pedido en edición */}
          {pedidoEnEdicion && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              mb: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              bgcolor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: 1,
              p: 1
            }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404' }}>
                Editando: {pedidoEnEdicion.tipo === 'mesa' ? 'Mesa' : pedidoEnEdicion.tipo} {pedidoEnEdicion.ref}
              </Typography>
              <Button 
                size="small" 
                variant="contained" 
                color="primary"
                onClick={actualizarPedidoAbierto}
                sx={{ ml: 1 }}
              >
                Guardar Cambios
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                color="secondary"
                onClick={() => {
                  if (confirm('¿Descartar cambios y limpiar la venta?')) {
                    limpiarEdicion();
                  }
                }}
              >
                Descartar
              </Button>
            </Box>
          )}
          
          {/* Tabla de productos y totales pegados abajo */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Paper sx={{ bgcolor: '#fff', borderRadius: 0, p: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px #0001', border: '1px solid #bdbdbd', height: '100%' }}>
              <TableContainer ref={tableRef} sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#e5e5e5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Precio Unitario</TableCell>
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>Cant.</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Precio</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productos.map((row, idx) => (
                      <TableRow
                        key={idx}
                        sx={
                          idx === selectedRow
                            ? { borderLeft: '4px solid #1976d2', bgcolor: '#e3f0ff' }
                            : {}
                        }
                        selected={idx === selectedRow}
                        onClick={() => setSelectedRow(idx)}
                      >
                        <TableCell>{row.descripcion}</TableCell>
                        <TableCell align="right">L{row.precioUnitario}</TableCell>
                        <TableCell align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: 48, verticalAlign: 'middle' }}>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); setProductos(prev => prev.map((p, i) => i === idx && p.cantidad > 1 ? { ...p, cantidad: p.cantidad - 1, precio: (p.cantidad - 1) * p.precioUnitario } : p)); }}><RemoveIcon fontSize="small" /></IconButton>
                          {idx === selectedRow && editCantidad ? (
                            <b style={{ color: '#1976d2' }}>{editCantidad}</b>
                          ) : (
                            row.cantidad
                          )}
                          <IconButton size="small" onClick={e => { e.stopPropagation(); setProductos(prev => prev.map((p, i) => i === idx ? { ...p, cantidad: p.cantidad + 1, precio: (p.cantidad + 1) * p.precioUnitario } : p)); }}><AddIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); setProductos(prev => prev.filter((_, i) => i !== idx)); }}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                        <TableCell align="right">L{row.precio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* Totales debajo de la tabla */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', bgcolor: '#e5e5e5', px: 2, py: 1, borderTop: '1px solid #bdbdbd', gap: 4 }}>
                <Box sx={{ textAlign: 'right', color: '#222', fontWeight: 700, fontSize: 16 }}>
                  <div>Sub-Total: L{Number(subTotal).toFixed(2)}</div>
                  {descuentoAplicado && (
                    <div style={{ color: '#d32f2f' }}>
                      Descuento ({descuentoAplicado.descripcion}): -L{Number(montoDescuento).toFixed(2)}
                    </div>
                  )}
                  <div>Impuesto: L{Number(impuestoConDescuento).toFixed(2)}</div>
                  <div>Venta: L{Number(venta).toFixed(2)}</div>
                  <div>Pagado: L{Number(pagado).toFixed(2)}</div>
                  <div>Total: L{Number(total).toFixed(2)}</div>
                  {descuentoAplicado && (
                    <Box sx={{ mt: 1 }}>
                      <Button size="small" color="error" onClick={removerDescuento}>
                        Remover Descuento
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              {/* Botón COBRAR pegado abajo */}
              <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#e5e5e5', px: 2, py: 1, borderTop: '1px solid #bdbdbd', mt: 'auto' }}>
                <Button
                  variant="contained"
                  sx={{ 
                    bgcolor: '#388e3c', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: 20, 
                    px: 6, 
                    py: 2, 
                    borderRadius: 0, 
                    minWidth: 180, 
                    boxShadow: 'none', 
                    border: '1px solid #2e7d32',
                    '&:hover': {
                      bgcolor: '#2e7d32',
                      transform: 'none',
                      scale: 'none',
                      boxShadow: 'none',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                  onClick={() => setOpenCobro(true)}
                >
                  COBRAR
                </Button>
              </Box>
              
              {/* Barra de usuario movida aquí */}
              {usuarioActual && (
                <Box sx={{ 
                  bgcolor: '#1976d2', 
                  color: '#fff', 
                  py: 0.5, 
                  px: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 14,
                  fontWeight: 600
                }}>
                  <Typography variant="body2">👤 Usuario: {usuarioActual}</Typography>
                  <Typography variant="body2">{horaActual}</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
        {/* Columna derecha: teclado y acciones */}
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 0, height: '100%', minHeight: 0 }}>
          {/* INDICADOR DE MODO DEL TECLADO - NUEVA FUNCIONALIDAD */}
          {modoTeclado !== 'normal' && (
            <Box sx={{ 
              mb: 1, 
              p: 1, 
              bgcolor: modoTeclado === 'cantidad' ? '#2196f3' : '#ff9800', 
              color: '#fff', 
              borderRadius: 1, 
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 14,
              animation: 'pulse 2s infinite'
            }}>
              {modoTeclado === 'cantidad' && `🔢 Cantidad: ${valorTeclado || '_'} (Original: ${cantidadOriginal})`}
            </Box>
          )}
          
          {/* TECLADO NUMÉRICO CON NUEVA FUNCIONALIDAD */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, mb: 0 }}>
            {tecladoNumerico.flat().map((key, idx) => {
              return (
                <Button 
                  key={idx} 
                  variant="contained" 
                  sx={{ 
                    bgcolor: '#d32f2f', // Siempre rojo
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: 22, 
                    py: 2, 
                    borderRadius: 0, 
                    minHeight: 60, 
                    boxShadow: 'none', 
                    m: 0, 
                    minWidth: 0,
                    // Efecto hover suave
                    '&:hover': {
                      bgcolor: '#b71c1c', // Rojo más oscuro en hover
                      transform: 'none',
                      filter: 'brightness(1.1)',
                    },
                    // Transición suave
                    transition: 'background-color 0.2s ease, filter 0.2s ease',
                  }} 
                  fullWidth
                  onClick={() => handleTecladoClick(key)}
                >
                  {key}
                </Button>
              );
            })}
          </Box>
          {/* Acciones rápidas o menú de categorías/submenú */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {categoriaActiva === null ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, mt: 0 }}>
                {categoriasDerecha.map((cat) => (
                  <Button key={cat} variant="contained" sx={{ 
                    bgcolor: '#388e3c', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: 15, 
                    py: 1.2, 
                    borderRadius: 0, 
                    minHeight: 48, 
                    boxShadow: 'none', 
                    border: '1px solid #2e7d32', 
                    m: 0, 
                    minWidth: 0,
                    '&:hover': {
                      bgcolor: '#2e7d32',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                    transition: 'background-color 0.2s ease',
                  }} fullWidth onClick={() => setCategoriaActiva(cat)}>
                    {cat}
                  </Button>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', gap: 0, mt: 0, minHeight: 8 * 48, position: 'relative' }}>
                {Array.from({ length: 23 }).map((_, idx) => {
                  const items = submenus[categoriaActiva] || [];
                  if (idx < items.length) {
                    return (
                      <Button key={items[idx]} variant="contained" sx={{ 
                        bgcolor: '#388e3c', 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 15, 
                        py: 1.2, 
                        borderRadius: 0, 
                        minHeight: 48, 
                        boxShadow: 'none', 
                        border: '1px solid #2e7d32', 
                        m: 0, 
                        minWidth: 0,
                        '&:hover': {
                          bgcolor: '#2e7d32',
                          transform: 'none',
                          boxShadow: 'none',
                        },
                        transition: 'background-color 0.2s ease',
                      }} fullWidth onClick={() => handleAgregarProducto(items[idx])}>
                        {items[idx]}
                      </Button>
                    );
                  } else {
                    return <Box key={idx} />;
                  }
                })}
                {/* Botón HOME siempre en la última fila, centrado */}
                <Box sx={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 48 }}>
                  <Button variant="contained" sx={{ bgcolor: '#222', color: '#fff', fontWeight: 700, fontSize: 15, py: 1.2, borderRadius: 0, minHeight: 48, boxShadow: 'none', border: '1px solid #444', m: 0, minWidth: 0, width: '100%' }} fullWidth onClick={() => setCategoriaActiva(null)}>
                    <HomeIcon sx={{ mr: 1 }} /> HOME
                  </Button>
                </Box>
              </Box>
            )}
            {/* Acciones rápidas (negros) solo en menú principal */}
            {categoriaActiva === null && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, mt: 0, mb: 0 }}>
                {accionesDerecha.map((accion) => (
                  <Button key={accion} variant="contained" sx={{ 
                    bgcolor: '#222', 
                    color: '#fff', 
                    fontWeight: 700, 
                    fontSize: 15, 
                    py: 1.2, 
                    borderRadius: 0, 
                    minHeight: 48, 
                    boxShadow: 'none', 
                    border: '1px solid #444', 
                    m: 0, 
                    minWidth: 0,
                    '&:hover': {
                      bgcolor: '#333',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                    transition: 'background-color 0.2s ease',
                  }} fullWidth onClick={
                    accion === 'PEDIDOS DE BARRA' ? () => setOpenPedidosBarra(true) : 
                    accion === 'GERENTE' ? () => setOpenGerente(true) : 
                    accion === 'RESUMEN DE TURNO' ? () => setOpenResumenTurno(true) : 
                    accion === 'FACTURA' ? () => setOpenHistorialFacturas(true) :
                    accion === 'GESTIÓN PEDIDOS' ? () => setOpenGestionPedidos(true) :
                    accion === 'SUPER' ? () => setOpenSuper(true) :
                    accion === 'INICIAR USUARIO' ? () => iniciarSesion() :
                    accion === 'SALIR USUARIO' ? () => cerrarSesion() :
                    undefined
                  }>
                    {accion}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* RESTO DE MODALES Y DIÁLOGOS (simplificados para el ejemplo) */}
      
      {/* Diálogo para seleccionar cliente RTN o Crédito */}
      <Dialog open={!!openClientes} onClose={() => setOpenClientes(null)}>
        <DialogTitle>
          {openClientes === 'rtn' ? 'Seleccionar Cliente RTN' : 'Seleccionar Cliente Crédito'}
        </DialogTitle>
        <DialogContent>
          <List>
            {(openClientes === 'rtn' ? clientesRTN : clientesCredito).map((cliente) => (
              <ListItem key={cliente} disablePadding>
                <ListItemButton onClick={() => setOpenClientes(null)}>
                  <ListItemText primary={cliente} />
                </ListItemButton>
              </ListItem>
            ))}
            {openClientes === 'rtn' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => setOpenClientes(null)}>
                  <ListItemText primary={'+ Crear nuevo cliente RTN'} />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenClientes(null)}>
              Cancelar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Diálogo para seleccionar medio de cobro */}
      <Dialog open={openCobro} onClose={() => setOpenCobro(false)}>
        <DialogTitle>Seleccionar Medio de Cobro</DialogTitle>
        <DialogContent>
          <List>
            {mediosCobro.map((medio) => (
              <ListItem key={medio} disablePadding>
                <ListItemButton onClick={() => { setOpenCobro(false); handleCobrar(medio); }}>
                  <ListItemText primary={medio} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={() => iniciarPagoCombinado()}>
                <ListItemText primary="💳 PAGO COMBINADO" sx={{ color: 'primary.main', fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenCobro(false)}>
              Cancelar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal para aplicar descuento */}
      <Dialog open={openDescuento} onClose={() => setOpenDescuento(false)}>
        <DialogTitle>Aplicar Descuento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant={tipoDescuento === 'porcentaje' ? 'contained' : 'outlined'}
                onClick={() => setTipoDescuento('porcentaje')}
              >
                Porcentaje
              </Button>
              <Button 
                variant={tipoDescuento === 'importe' ? 'contained' : 'outlined'}
                onClick={() => setTipoDescuento('importe')}
              >
                Importe
              </Button>
            </Box>
            
            <TextField
              label={tipoDescuento === 'porcentaje' ? 'Porcentaje (%)' : 'Importe (L)'}
              type="number"
              value={valorDescuento}
              onChange={(e) => setValorDescuento(Number(e.target.value))}
              inputProps={{ 
                min: 0, 
                max: tipoDescuento === 'porcentaje' ? descuentoMaximo.porcentaje : descuentoMaximo.importe,
                step: tipoDescuento === 'porcentaje' ? 0.1 : 1
              }}
              helperText={`Máximo: ${tipoDescuento === 'porcentaje' ? descuentoMaximo.porcentaje + '%' : 'L' + descuentoMaximo.importe}`}
            />

            {descuentoAplicado && (
              <Typography variant="body2" color="warning.main">
                Advertencia: Ya hay un descuento aplicado que será reemplazado
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setOpenDescuento(false)}>
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={aplicarDescuento}
                disabled={valorDescuento <= 0}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Sistema de notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Menú contextual para mesas */}
      <Menu
        anchorEl={menuMesa.anchorEl}
        open={menuMesa.open}
        onClose={cerrarMenuMesa}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {menuMesa.mesa && (() => {
          const mesa = mesas.find(m => m.numero === menuMesa.mesa);
          if (!mesa) return null;

          if (mesa.estado === 'libre') {
            return [
              <MenuItem key="abrir" onClick={() => mesa && abrirPedidoMesa(mesa.numero)}>
                Abrir Pedido
              </MenuItem>,
              <MenuItem key="reservar" onClick={() => mesa && reservarMesa(mesa.numero)}>
                Reservar Mesa
              </MenuItem>
            ];
          } else if (mesa.estado === 'reservada') {
            return [
              <MenuItem key="abrir" onClick={() => mesa && abrirPedidoMesa(mesa.numero)}>
                Abrir Pedido
              </MenuItem>,
              <MenuItem key="liberar" onClick={() => mesa && liberarMesa(mesa.numero)}>
                Liberar Mesa
              </MenuItem>
            ];
          } else if (mesa.estado === 'ocupada') {
            return [
              <MenuItem key="ver" onClick={() => mesa && verConsumoMesa(mesa.numero)}>
                Ver Consumo
              </MenuItem>,
              <MenuItem key="transferir" onClick={() => mesa && iniciarTransferenciaMesa(mesa.numero)}>
                Transferir Mesa
              </MenuItem>,
              <MenuItem key="liberar" onClick={() => mesa && liberarMesa(mesa.numero)}>
                Liberar Mesa
              </MenuItem>
            ];
          }
          return null;
        })()}
      </Menu>

      {/* Modal transferir mesa */}
      <Dialog open={openTransferirMesa} onClose={() => setOpenTransferirMesa(false)}>
        <DialogTitle>Transferir Mesa {mesaOrigen}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2 }}>
            {mesas.filter(m => m.estado === 'libre' && m.numero !== mesaOrigen).map((mesa) => (
              <Button
                key={mesa.numero}
                variant={mesaDestino === mesa.numero ? 'contained' : 'outlined'}
                onClick={() => setMesaDestino(mesa.numero)}
                sx={{ minHeight: 60, fontSize: 18 }}
              >
                {mesa.numero}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => setOpenTransferirMesa(false)}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={confirmarTransferenciaMesa}
              disabled={!mesaDestino}
            >
              Confirmar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal pedidos abiertos */}
      <Dialog open={openPedidos} onClose={() => setOpenPedidos(false)} maxWidth="md" fullWidth>
        <DialogTitle>Pedidos Abiertos ({pedidosAbiertos.length})</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Mesa/Ref</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosAbiertos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>{pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo}</TableCell>
                    <TableCell>{pedido.ref}</TableCell>
                    <TableCell>{pedido.productos.length}</TableCell>
                    <TableCell>L{pedido.productos.reduce((acc: number, p: any) => acc + p.precio, 0).toFixed(2)}</TableCell>
                    <TableCell>{new Date(pedido.fecha).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => cargarPedidoAbiertoMesa(pedido.id)}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => eliminarPedidoAbiertoMesa(pedido.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenPedidos(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal resumen de turno */}
      <Dialog open={openResumenTurno} onClose={() => setOpenResumenTurno(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Resumen de Turno</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabResumen} onChange={(e, v) => setTabResumen(v)}>
              <Tab label="Ventas" />
              <Tab label="Movimientos" />
              <Tab label="Categorías" />
            </Tabs>
          </Box>
          
          {tabResumen === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Medio de Pago</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventasPorMedio.map((venta) => (
                    <TableRow key={venta.medio}>
                      <TableCell>{venta.medio}</TableCell>
                      <TableCell align="right">L{venta.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell><strong>Total Ventas</strong></TableCell>
                    <TableCell align="right"><strong>L{ventaTotal.toFixed(2)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {tabResumen === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientosCaja.map((mov, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{mov.tipo}</TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell align="right">L{mov.monto.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {tabResumen === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventasPorCategoria.map((cat) => (
                    <TableRow key={cat.categoria}>
                      <TableCell>{cat.categoria}</TableCell>
                      <TableCell align="right">L{cat.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="contained" onClick={() => window.print()}>
              Imprimir Reporte
            </Button>
            <Button onClick={() => setOpenResumenTurno(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal historial de facturas */}
      <Dialog open={openHistorialFacturas} onClose={() => setOpenHistorialFacturas(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Historial de Facturas</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Fecha Desde"
              type="date"
              value={filtroHistorial.fechaDesde}
              onChange={(e) => setFiltroHistorial(prev => ({ ...prev, fechaDesde: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Fecha Hasta"
              type="date"
              value={filtroHistorial.fechaHasta}
              onChange={(e) => setFiltroHistorial(prev => ({ ...prev, fechaHasta: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Cliente"
              value={filtroHistorial.cliente}
              onChange={(e) => setFiltroHistorial(prev => ({ ...prev, cliente: e.target.value }))}
              size="small"
            />
            <TextField
              label="Correlativo"
              value={filtroHistorial.correlativo}
              onChange={(e) => setFiltroHistorial(prev => ({ ...prev, correlativo: e.target.value }))}
              size="small"
            />
            <Button variant="outlined" onClick={() => setFiltroHistorial({ fechaDesde: '', fechaHasta: '', cliente: '', correlativo: '' })}>
              Limpiar
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Correlativo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Medio Pago</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historialFacturas.map((factura) => (
                  <TableRow key={factura.correlativo}>
                    <TableCell>{factura.correlativo}</TableCell>
                    <TableCell>{new Date(factura.fecha).toLocaleString()}</TableCell>
                    <TableCell>{factura.cliente}</TableCell>
                    <TableCell align="right">L{factura.total.toFixed(2)}</TableCell>
                    <TableCell>{factura.medioPago}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => { setFactura(factura); setOpenResumen(true); }}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenHistorialFacturas(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal gerente */}
      <Dialog open={openGerente} onClose={() => setOpenGerente(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configuración de Gerente</DialogTitle>
        <DialogContent>
          <Tabs value={0}>
            <Tab label="Empresa" />
            <Tab label="CAI" />
            <Tab label="Límites" />
          </Tabs>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Información de Empresa</Typography>
            <TextField
              fullWidth
              label="Nombre Empresa"
              value={empresa.nombre}
              onChange={(e) => setEmpresa(prev => ({ ...prev, nombre: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="RTN"
              value={empresa.rtn}
              onChange={(e) => setEmpresa(prev => ({ ...prev, rtn: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Dirección"
              value={empresa.direccion}
              onChange={(e) => setEmpresa(prev => ({ ...prev, direccion: e.target.value }))}
              margin="normal"
            />
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Límites de Descuento</Typography>
            <TextField
              label="Descuento Máximo (%)"
              type="number"
              value={descuentoMaximo.porcentaje}
              onChange={(e) => setDescuentoMaximo(prev => ({ ...prev, porcentaje: Number(e.target.value) }))}
              margin="normal"
              sx={{ mr: 2 }}
            />
            <TextField
              label="Descuento Máximo (L)"
              type="number"
              value={descuentoMaximo.importe}
              onChange={(e) => setDescuentoMaximo(prev => ({ ...prev, importe: Number(e.target.value) }))}
              margin="normal"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button onClick={() => setOpenGerente(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={() => {
              mostrarNotificacion('Configuración guardada exitosamente', 'success');
              setOpenGerente(false);
            }}>
              Guardar Cambios
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal buscar producto */}
      <Dialog open={openBuscarProducto} onClose={() => setOpenBuscarProducto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Buscar Producto</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Código o nombre del producto"
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            margin="normal"
            autoFocus
          />
          
          <List>
            {buscarProductoPorCodigo(busquedaProducto).slice(0, 10).map((producto) => (
              <ListItem key={producto.codigo} disablePadding>
                <ListItemButton onClick={() => agregarProductoDesdeBusqueda(producto)}>
                  <ListItemText 
                    primary={producto.nombre}
                    secondary={`${producto.codigo} - L${producto.precio} - ${producto.categoria}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenBuscarProducto(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal detalle producto */}
      <Dialog open={openDetalleProducto} onClose={() => setOpenDetalleProducto(false)}>
        <DialogTitle>Detalle del Producto</DialogTitle>
        <DialogContent>
          {productoDetalle && (
            <Box sx={{ mt: 1 }}>
              <Typography><strong>Código:</strong> {productoDetalle.codigo}</Typography>
              <Typography><strong>Nombre:</strong> {productoDetalle.descripcion}</Typography>
              <Typography><strong>Categoría:</strong> {productoDetalle.categoria}</Typography>
              <Typography><strong>Precio Unitario:</strong> L{productoDetalle.precioUnitario}</Typography>
              <Typography><strong>Cantidad:</strong> {productoDetalle.cantidad}</Typography>
              <Typography><strong>Total:</strong> L{productoDetalle.precio}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Descripción:</strong></Typography>
              <Typography variant="body2">{productoDetalle.descripcion}</Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={() => setOpenDetalleProducto(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal llamar venta */}
      <Dialog open={openLlamarVenta} onClose={() => setOpenLlamarVenta(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ventas Suspendidas ({ventasSuspendidas.length})</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventasSuspendidas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell>#{venta.id.toString().slice(-4)}</TableCell>
                    <TableCell>{new Date(venta.fecha).toLocaleString()}</TableCell>
                    <TableCell>{venta.productos.length}</TableCell>
                    <TableCell>{venta.usuario}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => llamarVenta(venta.id)}>
                        Recuperar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenLlamarVenta(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal resumen de factura */}
      <Dialog open={openResumen} onClose={() => setOpenResumen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Factura Generada</DialogTitle>
        <DialogContent>
          {factura && (
            <Box sx={{ fontFamily: 'monospace', fontSize: 12, mt: 1 }}>
              <Typography align="center" variant="h6">{factura.empresa.nombre}</Typography>
              <Typography align="center">RTN: {factura.empresa.rtn}</Typography>
              <Typography align="center">{factura.empresa.direccion}</Typography>
              <Typography>─────────────────────────────────</Typography>
              <Typography>CAI: {factura.cai.cai}</Typography>
              <Typography>Factura No: {factura.correlativo}</Typography>
              <Typography>Fecha: {new Date(factura.fecha).toLocaleString()}</Typography>
              <Typography>Cliente: {factura.cliente}</Typography>
              <Typography>─────────────────────────────────</Typography>
              
              {factura.productos.map((producto: any, idx: number) => (
                <Box key={idx}>
                  <Typography>{producto.descripcion}</Typography>
                  <Typography>  {producto.cantidad} x L{producto.precioUnitario} = L{producto.precio}</Typography>
                </Box>
              ))}
              
              <Typography>─────────────────────────────────</Typography>
              <Typography>Sub-Total: L{factura.subTotal.toFixed(2)}</Typography>
              {factura.descuento && (
                <Typography>Descuento ({factura.descuento.descripcion}): -L{factura.descuento.monto.toFixed(2)}</Typography>
              )}
              <Typography>ISV 15%: L{factura.isv15.toFixed(2)}</Typography>
              {factura.isv18 > 0 && (
                <Typography>ISV 18%: L{factura.isv18.toFixed(2)}</Typography>
              )}
              <Typography variant="h6">TOTAL: L{factura.total.toFixed(2)}</Typography>
              <Typography>Medio de Pago: {factura.medioPago}</Typography>
              <Typography>─────────────────────────────────</Typography>
              <Typography align="center">¡Gracias por su compra!</Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={() => window.print()}>
              Imprimir
            </Button>
            <Button onClick={() => setOpenResumen(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal pago combinado - NUEVA FUNCIONALIDAD */}
      <Dialog open={openPagoCombinado} onClose={() => setOpenPagoCombinado(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Pago Combinado - Total: L{total.toFixed(2)}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary">
              Restante por pagar: L{montoRestante.toFixed(2)}
            </Typography>
          </Box>
          
          {pagosCombinados.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Pagos agregados:</Typography>
              {pagosCombinados.map((pago, idx) => (
                <Typography key={idx} variant="body2">
                  • {pago.medio}: L{pago.monto.toFixed(2)}
                </Typography>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {mediosCobro.map((medio) => (
              <Button
                key={medio}
                variant="outlined"
                fullWidth
                onClick={() => {
                  const monto = prompt(`Ingrese monto para ${medio}:`, montoRestante.toString());
                  if (monto) {
                    agregarPagoCombinado(medio, parseFloat(monto));
                  }
                }}
                disabled={montoRestante <= 0}
              >
                {medio}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => setOpenPagoCombinado(false)}>
              Cancelar
            </Button>
            {montoRestante <= 0 && (
              <Button variant="contained" onClick={() => handleCobrarCombinado(pagosCombinados)}>
                Finalizar Pago
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal reserva de mesa - NUEVA FUNCIONALIDAD MEJORADA */}
      <Dialog open={openReservaMesa} onClose={() => setOpenReservaMesa(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reservar Mesa {mesaAReservar}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del cliente"
              value={nombreReserva}
              onChange={(e) => setNombreReserva(e.target.value)}
              autoFocus
              required
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              value={telefonoReserva}
              onChange={(e) => setTelefonoReserva(e.target.value)}
              placeholder="9999-9999"
              required
            />
            
            <TextField
              fullWidth
              label="Fecha de reserva"
              type="date"
              value={fechaReserva}
              onChange={(e) => setFechaReserva(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
              required
            />
            
            <TextField
              fullWidth
              label="Hora de reserva"
              type="time"
              value={horaReserva}
              onChange={(e) => setHoraReserva(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              select
              fullWidth
              label="Duración estimada"
              value={duracionReserva}
              onChange={(e) => setDuracionReserva(Number(e.target.value))}
            >
              <MenuItem value={60}>1 hora</MenuItem>
              <MenuItem value={90}>1.5 horas</MenuItem>
              <MenuItem value={120}>2 horas</MenuItem>
              <MenuItem value={150}>2.5 horas</MenuItem>
              <MenuItem value={180}>3 horas</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Comentarios (opcional)"
              value={comentariosReserva}
              onChange={(e) => setComentariosReserva(e.target.value)}
              multiline
              rows={2}
              placeholder="Ocasión especial, preferencias, etc."
            />
            
            {/* Mostrar reservas del día seleccionado */}
            {fechaReserva && obtenerReservasDelDia(fechaReserva).length > 0 && (
              <Box sx={{ mt: 1, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Otras reservas del {fechaReserva}:
                </Typography>
                {obtenerReservasDelDia(fechaReserva).map(r => (
                  <Typography key={r.id} variant="body2" sx={{ color: '#856404' }}>
                    • Mesa {r.mesa}: {r.nombre} a las {r.hora} ({r.duracion}min)
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => {
              setOpenReservaMesa(false);
              limpiarFormularioReserva();
            }}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={confirmarReservaMesa}
              disabled={!nombreReserva.trim() || !telefonoReserva.trim() || !fechaReserva || !horaReserva}
            >
              Confirmar Reserva
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal calendario de reservas - NUEVA FUNCIONALIDAD */}
      <Dialog open={openCalendarioReservas} onClose={() => setOpenCalendarioReservas(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Calendario de Reservas ({reservasActivas.filter(r => r.estado !== 'cancelada').length} activas)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Reservas de Hoy</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Mesa</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Duración</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {obtenerReservasDelDia(new Date().toISOString().split('T')[0]).map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell>{reserva.mesa}</TableCell>
                      <TableCell>{reserva.nombre}</TableCell>
                      <TableCell>{reserva.telefono}</TableCell>
                      <TableCell>{reserva.hora}</TableCell>
                      <TableCell>{reserva.duracion} min</TableCell>
                      <TableCell>
                        <Typography 
                          sx={{ 
                            color: reserva.estado === 'confirmada' ? 'success.main' : 
                                   reserva.estado === 'pendiente' ? 'warning.main' : 'error.main',
                            fontWeight: 600 
                          }}
                        >
                          {reserva.estado === 'confirmada' ? '✓ Confirmada' :
                           reserva.estado === 'pendiente' ? '⏳ Pendiente' : '❌ Cancelada'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reserva.estado !== 'cancelada' && (
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => cancelarReserva(reserva.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {obtenerReservasDelDia(new Date().toISOString().split('T')[0]).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No hay reservas para hoy
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Todas las Reservas</Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Mesa</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Hora</TableCell>
                    <TableCell>Duración</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Comentarios</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservasActivas
                    .sort((a, b) => new Date(`${a.fecha}T${a.hora}`).getTime() - new Date(`${b.fecha}T${b.hora}`).getTime())
                    .map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell>{reserva.fecha}</TableCell>
                      <TableCell>{reserva.mesa}</TableCell>
                      <TableCell>{reserva.nombre}</TableCell>
                      <TableCell>{reserva.telefono}</TableCell>
                      <TableCell>{reserva.hora}</TableCell>
                      <TableCell>{reserva.duracion} min</TableCell>
                      <TableCell>
                        <Typography 
                          sx={{ 
                            color: reserva.estado === 'confirmada' ? 'success.main' : 
                                   reserva.estado === 'pendiente' ? 'warning.main' : 'error.main',
                            fontWeight: 600,
                            fontSize: 12 
                          }}
                        >
                          {reserva.estado === 'confirmada' ? '✓' :
                           reserva.estado === 'pendiente' ? '⏳' : '❌'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography variant="body2" noWrap>
                          {reserva.comentarios || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reserva.estado !== 'cancelada' && (
                          <Button 
                            size="small" 
                            color="error" 
                            onClick={() => cancelarReserva(reserva.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {reservasActivas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No hay reservas registradas
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Total de reservas activas: {reservasActivas.filter(r => r.estado !== 'cancelada').length}
            </Typography>
            <Button onClick={() => setOpenCalendarioReservas(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal login de usuario - NUEVA FUNCIONALIDAD */}
      <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
        <DialogTitle>Iniciar Sesión</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, minWidth: 300 }}>
            <Typography variant="body2" gutterBottom>
              Usuario actual: {usuarioActual || 'Sin sesión'}
            </Typography>
            
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={passwordLogin}
              onChange={(e) => setPasswordLogin(e.target.value)}
              margin="normal"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && confirmarLogin()}
            />
            
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Contraseñas de prueba: "1234" (Cajero) o "admin" (Administrador)
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => setOpenLogin(false)}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={confirmarLogin}
              disabled={!passwordLogin}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal formulario delivery/pickup mejorado - NUEVA FUNCIONALIDAD */}
      <Dialog open={openDeliveryPickup} onClose={() => setOpenDeliveryPickup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nuevo {tipoNuevoPedido === 'delivery' ? 'Delivery' : 'Pickup'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre del cliente"
              value={formDelivery.cliente}
              onChange={(e) => setFormDelivery(prev => ({ ...prev, cliente: e.target.value }))}
              autoFocus
              required
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              value={formDelivery.telefono}
              onChange={(e) => setFormDelivery(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="9999-9999"
              required
            />
            
            {tipoNuevoPedido === 'delivery' && (
              <TextField
                fullWidth
                label="Dirección de entrega"
                value={formDelivery.direccion}
                onChange={(e) => setFormDelivery(prev => ({ ...prev, direccion: e.target.value }))}
                multiline
                rows={2}
                required
              />
            )}
            
            <TextField
              select
              fullWidth
              label="Proveedor de delivery"
              value={formDelivery.proveedorDelivery}
              onChange={(e) => setFormDelivery(prev => ({ ...prev, proveedorDelivery: e.target.value }))}
            >
              {proveedoresDelivery.map((proveedor) => (
                <MenuItem key={proveedor} value={proveedor}>
                  {proveedor}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              type="number"
              fullWidth
              label={`Tiempo estimado (minutos)`}
              value={formDelivery.tiempoEstimado}
              onChange={(e) => setFormDelivery(prev => ({ ...prev, tiempoEstimado: Number(e.target.value) }))}
              inputProps={{ min: 10, max: 120 }}
            />
            
            <TextField
              fullWidth
              label="Notas adicionales (opcional)"
              value={formDelivery.notas}
              onChange={(e) => setFormDelivery(prev => ({ ...prev, notas: e.target.value }))}
              multiline
              rows={2}
              placeholder="Instrucciones especiales, preferencias, etc."
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => setOpenDeliveryPickup(false)}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={confirmarNuevoDeliveryPickup}
              disabled={!formDelivery.cliente.trim() || !formDelivery.telefono.trim() || (tipoNuevoPedido === 'delivery' && !formDelivery.direccion.trim())}
            >
              Crear {tipoNuevoPedido}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal gestión avanzada de pedidos - NUEVA FUNCIONALIDAD */}
      <Dialog open={openGestionPedidos} onClose={() => setOpenGestionPedidos(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Gestión de Pedidos - {filtroTipoPedido === 'todos' ? 'Todos' : filtroTipoPedido.toUpperCase()} ({obtenerPedidosPorTipo(filtroTipoPedido).length})
        </DialogTitle>
        <DialogContent>
          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {['todos', 'mesa', 'delivery', 'pickup', 'barra'].map((tipo) => (
              <Button
                key={tipo}
                variant={filtroTipoPedido === tipo ? 'contained' : 'outlined'}
                onClick={() => setFiltroTipoPedido(tipo as any)}
                size="small"
              >
                {tipo === 'todos' ? 'Todos' : 
                 tipo === 'barra' ? 'BARRA' : 
                 tipo.toUpperCase()} ({obtenerPedidosPorTipo(tipo as any).length})
              </Button>
            ))}
          </Box>

          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Cliente/Mesa</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Hora Creación</TableCell>
                  <TableCell>Tiempo Est.</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {obtenerPedidosPorTipo(filtroTipoPedido).map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          fontWeight: 600,
                          color: pedido.tipo === 'mesa' ? '#607d8b' : 
                                 pedido.tipo === 'delivery' ? '#1976d2' : '#388e3c'
                        }}
                      >
                        {pedido.tipo === 'mesa' ? 'Mesa' : pedido.tipo.toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pedido.cliente || pedido.ref}
                      </Typography>
                      {pedido.direccion && (
                        <Typography variant="caption" color="text.secondary">
                          {pedido.direccion}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{pedido.telefono || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: getEstadoColor(pedido.estado || 'abierto')
                          }}
                        />
                        <Select
                          size="small"
                          value={pedido.estado || 'abierto'}
                          onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          {getEstadosDisponibles(pedido.tipo).map((estado) => (
                            <MenuItem key={estado} value={estado}>
                              {estado.replace('_', ' ').toUpperCase()}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell>{pedido.productos.length}</TableCell>
                    <TableCell>L{pedido.productos.reduce((acc: number, p: any) => acc + p.precio, 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {pedido.horaCreacion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {pedido.tiempoEstimado ? `${pedido.tiempoEstimado} min` : '-'}
                      {pedido.horaEstimadaEntrega && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Est: {new Date(pedido.horaEstimadaEntrega).toLocaleTimeString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{pedido.proveedorDelivery || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button 
                          size="small" 
                          onClick={() => cargarPedidoAbiertoMesa(pedido.id)}
                          variant="outlined"
                        >
                          Editar
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          onClick={() => eliminarPedidoAbiertoMesa(pedido.id)}
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {obtenerPedidosPorTipo(filtroTipoPedido).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay pedidos de tipo {filtroTipoPedido}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Total de pedidos {filtroTipoPedido}: {obtenerPedidosPorTipo(filtroTipoPedido).length}
            </Typography>
            <Button onClick={() => setOpenGestionPedidos(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal nuevo pedido barra - NUEVA FUNCIONALIDAD */}
      <Dialog open={openNuevoPedidoBarra} onClose={() => setOpenNuevoPedidoBarra(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nuevo Pedido de Barra/General
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Para consumos en barra, área común o cualquier sitio no identificado por mesa
            </Typography>
            
            <TextField
              fullWidth
              label="Nombre del cliente"
              value={nombreClienteBarra}
              onChange={(e) => setNombreClienteBarra(e.target.value)}
              autoFocus
              required
              placeholder="Ingrese el nombre del cliente"
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={() => setOpenNuevoPedidoBarra(false)}>
              Cancelar
            </Button>
            <Button 
              variant="contained" 
              onClick={confirmarNuevoPedidoBarra}
              disabled={!nombreClienteBarra.trim()}
            >
              Crear Pedido
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal pedidos de barra - NUEVA FUNCIONALIDAD */}
      <Dialog open={openPedidosBarra} onClose={() => setOpenPedidosBarra(false)} maxWidth="md" fullWidth>
        <DialogTitle>Pedidos de Barra ({pedidosAbiertos.filter(p => p.tipo === 'barra').length})</DialogTitle>
        <DialogContent>
          {/* Botón para nuevo pedido de barra */}
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: '#9c27b0', 
                color: '#fff', 
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#7b1fa2',
                }
              }}
              onClick={iniciarNuevoPedidoBarra}
            >
              + NUEVO PEDIDO DE BARRA
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Hora Creación</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidosAbiertos.filter(p => p.tipo === 'barra').map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pedido.cliente}
                      </Typography>
                    </TableCell>
                    <TableCell>{pedido.productos.length}</TableCell>
                    <TableCell>L{pedido.productos.reduce((acc: number, p: any) => acc + p.precio, 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {pedido.horaCreacion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          color: '#607d8b',
                          fontWeight: 600,
                          fontSize: 12 
                        }}
                      >
                        ABIERTO
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => cargarPedidoAbiertoMesa(pedido.id)}>
                        Editar
                      </Button>
                      <Button size="small" color="error" onClick={() => eliminarPedidoAbiertoMesa(pedido.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pedidosAbiertos.filter(p => p.tipo === 'barra').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay pedidos de barra activos
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setOpenPedidosBarra(false)}>
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal configuración SUPER - NUEVA FUNCIONALIDAD */}
      <Dialog open={openSuper} onClose={() => setOpenSuper(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
          ⚙️ Configuración SUPER - Sistema Avanzado
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={tabSuper} 
            onChange={(_, newValue) => setTabSuper(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="🗄️ Backup en la Nube" />
            <Tab label="🏢 Business Central" />
            <Tab label="🔧 Sistema" />
            <Tab label="📊 Estadísticas" />
          </Tabs>

          {/* Tab 0: Backup en la Nube */}
          {tabSuper === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                ☁️ Configuración de Backup Automático
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Configure backup automático de sus datos en Google Drive o OneDrive para mayor seguridad
              </Typography>

              {/* Estado actual */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  📋 Estado Actual del Backup
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Servicio Activo</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: configuracionBackup.servicioActivo === 'ninguno' ? '#f44336' : '#4caf50' }}>
                      {configuracionBackup.servicioActivo === 'ninguno' ? '❌ Ninguno' : 
                       configuracionBackup.servicioActivo === 'google' ? '📁 Google Drive' : '📂 OneDrive'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Backup Automático</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: configuracionBackup.programacion.activo ? '#4caf50' : '#f44336' }}>
                      {configuracionBackup.programacion.activo ? '✅ Activo' : '❌ Inactivo'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Último Backup</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {configuracionBackup.servicioActivo !== 'ninguno' ? 
                        (configuracionBackup[configuracionBackup.servicioActivo === 'google' ? 'googleDrive' : 'oneDrive'].ultimoBackup || 'Nunca') : 
                        'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Configuración Google Drive */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">📁 Google Drive</Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: configuracionBackup.googleDrive.estado === 'conectado' ? '#4caf50' : '#f44336'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => probarConexionNube('google')}
                      disabled={estadoConexionNube.probando}
                    >
                      {estadoConexionNube.probando && estadoConexionNube.servicio === 'google' ? 'Probando...' : 'Probar'}
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => configurarServicioNube('google')}
                    >
                      {configuracionBackup.googleDrive.configurado ? 'Reconfigurar' : 'Configurar'}
                    </Button>
                  </Box>
                </Box>
                
                {configuracionBackup.googleDrive.configurado && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Email de la cuenta"
                      value={configuracionBackup.googleDrive.email}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                    <TextField
                      size="small"
                      label="Carpeta de backup"
                      value={configuracionBackup.googleDrive.carpeta}
                      onChange={(e) => setConfiguracionBackup(prev => ({
                        ...prev,
                        googleDrive: { ...prev.googleDrive, carpeta: e.target.value }
                      }))}
                      variant="outlined"
                    />
                  </Box>
                )}

                {estadoConexionNube.servicio === 'google' && estadoConexionNube.resultado && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: estadoConexionNube.resultado === 'exito' ? '#4caf50' : '#f44336',
                      mt: 1,
                      display: 'block'
                    }}
                  >
                    {estadoConexionNube.mensaje}
                  </Typography>
                )}
              </Paper>

              {/* Configuración OneDrive */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">📂 Microsoft OneDrive</Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: configuracionBackup.oneDrive.estado === 'conectado' ? '#4caf50' : '#f44336'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => probarConexionNube('onedrive')}
                      disabled={estadoConexionNube.probando}
                    >
                      {estadoConexionNube.probando && estadoConexionNube.servicio === 'onedrive' ? 'Probando...' : 'Probar'}
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => configurarServicioNube('onedrive')}
                    >
                      {configuracionBackup.oneDrive.configurado ? 'Reconfigurar' : 'Configurar'}
                    </Button>
                  </Box>
                </Box>
                
                {configuracionBackup.oneDrive.configurado && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      size="small"
                      label="Email de la cuenta"
                      value={configuracionBackup.oneDrive.email}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                    />
                    <TextField
                      size="small"
                      label="Carpeta de backup"
                      value={configuracionBackup.oneDrive.carpeta}
                      onChange={(e) => setConfiguracionBackup(prev => ({
                        ...prev,
                        oneDrive: { ...prev.oneDrive, carpeta: e.target.value }
                      }))}
                      variant="outlined"
                    />
                  </Box>
                )}

                {estadoConexionNube.servicio === 'onedrive' && estadoConexionNube.resultado && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: estadoConexionNube.resultado === 'exito' ? '#4caf50' : '#f44336',
                      mt: 1,
                      display: 'block'
                    }}
                  >
                    {estadoConexionNube.mensaje}
                  </Typography>
                )}
              </Paper>

              {/* Configuración de programación */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ⏰ Programación de Backup Automático
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                  <Select
                    size="small"
                    value={configuracionBackup.servicioActivo}
                    onChange={(e) => setConfiguracionBackup(prev => ({
                      ...prev,
                      servicioActivo: e.target.value as any
                    }))}
                    displayEmpty
                  >
                    <MenuItem value="ninguno">Ningún servicio</MenuItem>
                    <MenuItem value="google" disabled={!configuracionBackup.googleDrive.configurado}>
                      Google Drive {!configuracionBackup.googleDrive.configurado && '(No configurado)'}
                    </MenuItem>
                    <MenuItem value="onedrive" disabled={!configuracionBackup.oneDrive.configurado}>
                      OneDrive {!configuracionBackup.oneDrive.configurado && '(No configurado)'}
                    </MenuItem>
                  </Select>

                  <Select
                    size="small"
                    value={configuracionBackup.programacion.frecuencia}
                    onChange={(e) => setConfiguracionBackup(prev => ({
                      ...prev,
                      programacion: { ...prev.programacion, frecuencia: e.target.value as any }
                    }))}
                  >
                    <MenuItem value="diario">Diario</MenuItem>
                    <MenuItem value="semanal">Semanal (Domingo)</MenuItem>
                    <MenuItem value="mensual">Mensual (Día 1)</MenuItem>
                  </Select>

                  <TextField
                    size="small"
                    type="time"
                    label="Hora de backup"
                    value={configuracionBackup.programacion.hora}
                    onChange={(e) => setConfiguracionBackup(prev => ({
                      ...prev,
                      programacion: { ...prev.programacion, hora: e.target.value }
                    }))}
                  />

                  <TextField
                    size="small"
                    type="number"
                    label="Backups a mantener"
                    value={configuracionBackup.programacion.mantenerBackups}
                    onChange={(e) => setConfiguracionBackup(prev => ({
                      ...prev,
                      programacion: { ...prev.programacion, mantenerBackups: Number(e.target.value) }
                    }))}
                    InputProps={{ inputProps: { min: 5, max: 100 } }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={configuracionBackup.programacion.activo}
                      onChange={(e) => setConfiguracionBackup(prev => ({
                        ...prev,
                        programacion: { ...prev.programacion, activo: e.target.checked }
                      }))}
                    />
                  }
                  label="Activar backup automático"
                />
              </Paper>

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#4caf50' }}
                  onClick={ejecutarBackupManual}
                  disabled={configuracionBackup.servicioActivo === 'ninguno'}
                >
                  ▶️ Ejecutar Backup Ahora
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#ff9800' }}
                  onClick={activarBackupAutomatico}
                  disabled={!configuracionBackup.programacion.activo || configuracionBackup.servicioActivo === 'ninguno'}
                >
                  ⏰ Activar Programación
                </Button>
                <Button 
                  variant="outlined"
                  onClick={guardarConfiguracionBackup}
                >
                  💾 Guardar Configuración
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#2196f3' }}
                  onClick={instalarRclone}
                >
                  🔧 Instalar rclone
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 1: Business Central - NUEVA FUNCIONALIDAD EMPRESARIAL */}
          {tabSuper === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                🏢 Configuración Business Central ERP
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Configure la integración con Microsoft Dynamics 365 Business Central para operaciones multi-sucursal
              </Typography>

              {/* Estado de conexión */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: configuracionBusinessCentral.habilitado ? '#e8f5e8' : '#fff3e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: configuracionBusinessCentral.habilitado ? '#4caf50' : '#ff9800'
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {configuracionBusinessCentral.habilitado ? '✅ Business Central Conectado' : '⚠️ Business Central Deshabilitado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {configuracionBusinessCentral.habilitado 
                          ? `Env: ${configuracionBusinessCentral.environment} | Tenant: ${configuracionBusinessCentral.tenantId}`
                          : 'Configure la conexión para habilitar funciones empresariales'
                        }
                      </Typography>
                    </Box>
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={configuracionBusinessCentral.habilitado}
                        onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                          ...prev,
                          habilitado: e.target.checked
                        }))}
                      />
                    }
                    label="Habilitar"
                  />
                </Box>
              </Paper>

              {/* Configuración de conexión */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔗 Configuración de Conexión
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                  <TextField
                    size="small"
                    label="URL Base de Business Central"
                    value={configuracionBusinessCentral.baseUrl}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      baseUrl: e.target.value
                    }))}
                    placeholder="https://api.businesscentral.dynamics.com"
                    variant="outlined"
                  />
                  
                  <Select
                    size="small"
                    value={configuracionBusinessCentral.environment}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      environment: e.target.value as any
                    }))}
                    displayEmpty
                  >
                    <MenuItem value="sandbox">🧪 Sandbox (Pruebas)</MenuItem>
                    <MenuItem value="production">🏭 Production (Producción)</MenuItem>
                    <MenuItem value="SB110225">🔧 SB110225 (Environment del usuario)</MenuItem>
                  </Select>

                  <TextField
                    size="small"
                    label="Tenant ID"
                    value={configuracionBusinessCentral.tenantId}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      tenantId: e.target.value
                    }))}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    variant="outlined"
                  />

                  <TextField
                    size="small"
                    label="Company ID"
                    value={configuracionBusinessCentral.companyId}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      companyId: e.target.value
                    }))}
                    placeholder="CRONUS International Ltd."
                    variant="outlined"
                  />

                  <TextField
                    size="small"
                    label="Client ID"
                    value={configuracionBusinessCentral.username}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    placeholder="570853f4-2ca4-4dce-a433-a5322fa215fa"
                    variant="outlined"
                  />

                  <TextField
                    size="small"
                    type="password"
                    label="Client Secret"
                    value={configuracionBusinessCentral.password}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    placeholder="7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={probarConexionBusinessCentral}
                  >
                    🔍 Probar Conexión
                  </Button>
                  <Button 
                    variant="contained"
                    sx={{ bgcolor: '#9c27b0' }}
                    onClick={ejecutarTestPostmanBusinessCentral}
                  >
                    🧪 Test Tipo Postman
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => {
                      localStorage.setItem('configuracionBusinessCentral', JSON.stringify(configuracionBusinessCentral));
                      mostrarNotificacion('✅ Configuración guardada', 'success');
                    }}
                  >
                    💾 Guardar Configuración
                  </Button>
                </Box>
              </Paper>

              {/* Configuración de almacenes y códigos PV */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🏪 Almacenes y Códigos de Punto de Venta
                </Typography>
                
                {/* Almacén actual */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Almacén Actual:
                  </Typography>
                  <Select
                    size="small"
                    value={configuracionAlmacenes.almacenActual}
                    onChange={(e) => cambiarAlmacen(e.target.value)}
                    sx={{ minWidth: 200 }}
                  >
                    {configuracionAlmacenes.almacenes.map((almacen) => (
                      <MenuItem key={almacen.codigo} value={almacen.codigo}>
                        {almacen.nombre} (PV: {almacen.codigoPV})
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                    PV Activo: {configuracionAlmacenes.codigoPV}
                  </Typography>
                </Box>

                {/* Lista de almacenes */}
                <Typography variant="subtitle2" gutterBottom>
                  Almacenes Configurados:
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {configuracionAlmacenes.almacenes.map((almacen, index) => (
                    <Paper key={almacen.codigo} sx={{ p: 2, mb: 1, bgcolor: almacen.codigo === configuracionAlmacenes.almacenActual ? '#e3f2fd' : '#fafafa' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 2, alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {almacen.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {almacen.codigo} | {almacen.direccion}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                          PV: {almacen.codigoPV}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {almacen.responsable}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: almacen.activo ? '#4caf50' : '#f44336'
                            }}
                          />
                          <Typography variant="caption">
                            {almacen.activo ? 'Activo' : 'Inactivo'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>

              {/* Configuración de sincronización */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔄 Configuración de Sincronización
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={configuracionBusinessCentral.sincronizacionAutomatica}
                        onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                          ...prev,
                          sincronizacionAutomatica: e.target.checked
                        }))}
                      />
                    }
                    label="Sincronización Automática"
                  />

                  <TextField
                    size="small"
                    type="number"
                    label="Intervalo Sincronización (min)"
                    value={configuracionBusinessCentral.intervalSincronizacion}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      intervalSincronizacion: Number(e.target.value)
                    }))}
                    InputProps={{ inputProps: { min: 1, max: 60 } }}
                  />

                  <TextField
                    size="small"
                    type="number"
                    label="Envío Ventas (min)"
                    value={configuracionBusinessCentral.intervalEnvioVentas}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({
                      ...prev,
                      intervalEnvioVentas: Number(e.target.value)
                    }))}
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                  />
                </Box>
              </Paper>

              {/* Estado del turno */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  💼 Control de Turno
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Estado</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: estadoCierreTurno.turnoAbierto ? '#4caf50' : '#f44336' }}>
                      {estadoCierreTurno.turnoAbierto ? '✅ Abierto' : '❌ Cerrado'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Apertura</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      L{estadoCierreTurno.montoApertura}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Ventas del Turno</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      L{estadoCierreTurno.ventasDelTurno.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Último Cierre</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {estadoCierreTurno.ultimoCierre ? new Date(estadoCierreTurno.ultimoCierre).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#4caf50' }}
                    onClick={abrirNuevoTurno}
                    disabled={estadoCierreTurno.turnoAbierto}
                  >
                    🔓 Abrir Turno
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#ff9800' }}
                    onClick={validarCierreTurnoConERP}
                    disabled={!estadoCierreTurno.turnoAbierto}
                  >
                    🔒 Cerrar Turno con ERP
                  </Button>
                </Box>
              </Paper>

              {/* Acciones */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#2196f3' }}
                  onClick={sincronizarConBusinessCentral}
                  disabled={!configuracionBusinessCentral.habilitado}
                >
                  🔄 Sincronizar Ahora
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    localStorage.setItem('configuracionBusinessCentral', JSON.stringify(configuracionBusinessCentral));
                    localStorage.setItem('configuracionAlmacenes', JSON.stringify(configuracionAlmacenes));
                    mostrarNotificacion('✅ Configuración completa guardada', 'success');
                  }}
                >
                  💾 Guardar Todo
                </Button>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: '#9c27b0' }}
                  onClick={() => {
                    // Abrir documentación
                    window.open('/docs/business-central-integration.md', '_blank');
                  }}
                >
                  📖 Ver Documentación
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 2: Sistema */}
          {tabSuper === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                🔧 Configuración del Sistema
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Configuraciones avanzadas del sistema POS
              </Typography>
              
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Información del Sistema</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Versión</Typography>
                    <Typography variant="body2">v1.0.0</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Usuario Actual</Typography>
                    <Typography variant="body2">{usuarioActual}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Última Actualización</Typography>
                    <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Backups Configurados</Typography>
                    <Typography variant="body2">
                      {configuracionBackup.googleDrive.configurado ? '📁' : ''}
                      {configuracionBackup.oneDrive.configurado ? '📂' : ''}
                      {!configuracionBackup.googleDrive.configurado && !configuracionBackup.oneDrive.configurado ? 'Ninguno' : ''}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Mantenimiento</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button variant="outlined">🗑️ Limpiar Logs</Button>
                  <Button variant="outlined">🔄 Reiniciar Sistema</Button>
                  <Button variant="outlined">📊 Exportar Datos</Button>
                  <Button variant="outlined">📥 Importar Datos</Button>
                  <Button 
                    variant="contained" 
                    sx={{ bgcolor: '#2196f3' }}
                    onClick={instalarRclone}
                  >
                    🔧 Instalar rclone
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

          {/* Tab 3: Estadísticas */}
          {tabSuper === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Estadísticas del Sistema
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Información detallada sobre el uso del sistema y Business Central
              </Typography>
              
              {/* Estadísticas generales */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {pedidosAbiertos.length}
                  </Typography>
                  <Typography variant="caption">Pedidos Activos</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {mesas.filter(m => m.estado === 'ocupada').length}
                  </Typography>
                  <Typography variant="caption">Mesas Ocupadas</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {reservasActivas.length}
                  </Typography>
                  <Typography variant="caption">Reservas Activas</Typography>
                </Paper>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    L{estadoCierreTurno.ventasDelTurno.toFixed(0)}
                  </Typography>
                  <Typography variant="caption">Ventas del Turno</Typography>
                </Paper>
              </Box>

              {/* Estadísticas de Business Central */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🏢 Estado Business Central
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Estado Conexión</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: configuracionBusinessCentral.habilitado ? '#4caf50' : '#f44336' }}>
                      {configuracionBusinessCentral.habilitado ? '✅ Conectado' : '❌ Desconectado'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Almacén Actual</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {configuracionAlmacenes.almacenes.find(a => a.codigo === configuracionAlmacenes.almacenActual)?.nombre || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Código PV</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {configuracionAlmacenes.codigoPV}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Información del almacén actual */}
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  🏪 Información del Almacén
                </Typography>
                {(() => {
                  const almacenActual = configuracionAlmacenes.almacenes.find(a => a.codigo === configuracionAlmacenes.almacenActual);
                  return almacenActual ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Nombre</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{almacenActual.nombre}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Código</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{almacenActual.codigo}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Dirección</Typography>
                        <Typography variant="body2">{almacenActual.direccion}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Responsable</Typography>
                        <Typography variant="body2">{almacenActual.responsable}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                        <Typography variant="body2">{almacenActual.telefono}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Estado</Typography>
                        <Typography variant="body2" sx={{ color: almacenActual.activo ? '#4caf50' : '#f44336' }}>
                          {almacenActual.activo ? '✅ Activo' : '❌ Inactivo'}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No se encontró información del almacén actual
                    </Typography>
                  );
                })()}
              </Paper>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={() => setOpenSuper(false)} variant="contained">
              Cerrar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Modal test Postman */}
      <Dialog open={openTestPostman} onClose={() => setOpenTestPostman(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#9c27b0', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          🧪 Test Business Central - Estilo Postman
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {resultadosTestPostman ? (
            <Box sx={{ height: '70vh', overflow: 'auto' }}>
              {/* Header con resumen */}
              {resultadosTestPostman.summary && (
                <Paper sx={{ m: 2, p: 2, bgcolor: resultadosTestPostman.success ? '#e8f5e8' : '#ffebee' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: resultadosTestPostman.success ? '#2e7d32' : '#d32f2f' }}>
                    {resultadosTestPostman.message}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{resultadosTestPostman.summary.totalSteps}</Typography>
                      <Typography variant="caption">Total Pasos</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#4caf50' }}>{resultadosTestPostman.summary.successfulSteps}</Typography>
                      <Typography variant="caption">Exitosos</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#f44336' }}>{resultadosTestPostman.summary.failedSteps}</Typography>
                      <Typography variant="caption">Fallidos</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: resultadosTestPostman.summary.companyFound ? '#4caf50' : '#f44336' }}>
                        {resultadosTestPostman.summary.companyFound ? '✅' : '❌'}
                      </Typography>
                      <Typography variant="caption">Empresa: {resultadosTestPostman.summary.companyName}</Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Configuración usada */}
              {resultadosTestPostman.config && (
                <Paper sx={{ m: 2, p: 2 }}>
                  <Typography variant="h6" gutterBottom>⚙️ Configuración Utilizada</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tenant ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {resultadosTestPostman.config.tenantId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Environment</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {resultadosTestPostman.config.environment}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Company ID</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {resultadosTestPostman.config.companyId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Base URL</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {resultadosTestPostman.config.baseUrl}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Pasos del test */}
              {resultadosTestPostman.steps && resultadosTestPostman.steps.map((step: any, index: number) => (
                <Paper key={index} sx={{ m: 2, p: 2, border: step.success === false ? '2px solid #f44336' : step.success === true ? '2px solid #4caf50' : '1px solid #ddd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      bgcolor: step.success === false ? '#f44336' : step.success === true ? '#4caf50' : '#ff9800',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {step.step}
                    </Box>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {step.name}
                    </Typography>
                    {step.success === true && <Typography sx={{ color: '#4caf50', fontWeight: 600 }}>✅ ÉXITO</Typography>}
                    {step.success === false && <Typography sx={{ color: '#f44336', fontWeight: 600 }}>❌ ERROR</Typography>}
                  </Box>

                  {/* Request details */}
                  {step.url && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>📤 Request</Typography>
                      <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          <strong>{step.method}</strong> {step.url}
                        </Typography>
                      </Box>
                      {step.requestHeaders && (
                        <Box sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">Headers:</Typography>
                          {Object.entries(step.requestHeaders).map(([key, value]: [string, any]) => (
                            <Typography key={key} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {key}: {value}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {step.requestBody && (
                        <Box sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">Body:</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {step.requestBody}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Response details */}
                  {step.responseStatus && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>📥 Response</Typography>
                      <Box sx={{ bgcolor: step.responseStatus >= 200 && step.responseStatus < 300 ? '#e8f5e8' : '#ffebee', p: 1, borderRadius: 1, mb: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          Status: {step.responseStatus} {step.responseStatusText}
                        </Typography>
                      </Box>
                      {step.responseHeaders && (
                        <Box sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1, mb: 1, maxHeight: 100, overflow: 'auto' }}>
                          <Typography variant="caption" color="text.secondary">Headers:</Typography>
                          {Object.entries(step.responseHeaders).slice(0, 5).map(([key, value]: [string, any]) => (
                            <Typography key={key} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                              {key}: {value}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {step.responseBody && (
                        <Box sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                          <Typography variant="caption" color="text.secondary">Response Body:</Typography>
                          <pre style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'monospace' }}>
                            {typeof step.responseBody === 'string' ? step.responseBody : JSON.stringify(step.responseBody, null, 2)}
                          </pre>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Error details */}
                  {step.error && (
                    <Box sx={{ bgcolor: '#ffebee', p: 1, borderRadius: 1, mt: 1 }}>
                      <Typography variant="caption" color="error">Error:</Typography>
                      <Typography variant="body2" color="error" sx={{ fontFamily: 'monospace' }}>
                        {step.error}
                      </Typography>
                    </Box>
                  )}

                  {/* Special handling for step 3 (company verification) */}
                  {step.step === 3 && step.companyDetails && (
                    <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 1, mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>🏢 Detalles de la Empresa</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Nombre</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{step.companyDetails.name}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">ID</Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{step.companyDetails.id}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Versión del Sistema</Typography>
                          <Typography variant="body2">{step.companyDetails.systemVersion}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Creada</Typography>
                          <Typography variant="body2">{new Date(step.companyDetails.created).toLocaleDateString()}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}

              {/* Loading state */}
              {resultadosTestPostman.loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                  <Typography variant="h6">{resultadosTestPostman.message}</Typography>
                </Box>
              )}

              {/* Error state */}
              {resultadosTestPostman.error && !resultadosTestPostman.steps && (
                <Paper sx={{ m: 2, p: 2, bgcolor: '#ffebee' }}>
                  <Typography variant="h6" color="error" gutterBottom>
                    {resultadosTestPostman.message}
                  </Typography>
                  {resultadosTestPostman.errorDetails && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Detalles del Error:</Typography>
                      <pre style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {JSON.stringify(resultadosTestPostman.errorDetails, null, 2)}
                      </pre>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Haga clic en "Ejecutar Test" para comenzar
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={() => setOpenTestPostman(false)}>
              Cerrar
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: '#9c27b0' }}
              onClick={ejecutarTestPostmanBusinessCentral}
              disabled={resultadosTestPostman?.loading}
            >
              {resultadosTestPostman?.loading ? '🔄 Ejecutando...' : '🧪 Ejecutar Test'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
} 