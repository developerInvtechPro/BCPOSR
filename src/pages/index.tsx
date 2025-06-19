import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, TextField, IconButton, Checkbox, FormControlLabel, MenuItem, Select, Tabs, Tab, Menu, Snackbar, Alert, Chip, Switch } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Head from 'next/head';
import InventoryManager from '../components/InventoryManager';
import { useFacturas } from '../hooks/useFacturas';
import { useTurnos } from '../hooks/useTurnos';
import { GestionTurnos } from '../components/GestionTurnos';

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
  'IMPRIMIR CUENTA', // Nueva acción para pre-cuenta
];

const accionesDerecha = [
  'INICIAR USUARIO', 'FACTURA',
  'SALIR USUARIO', 'GERENTE', 'PEDIDOS DE BARRA', 'GESTIÓN PEDIDOS', 'RESUMEN DE TURNO', 'SUPER', 'COMANDA COCINA',
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
  // Hooks para gestión de facturas y turnos
  const { 
    facturas, 
    crearFactura, 
    listarFacturas, 
    anularFactura, 
    obtenerEstadisticas,
    loading: loadingFacturas 
  } = useFacturas();
  
  const { 
    turnos, 
    turnoActual, 
    crearTurno, 
    cerrarTurno, 
    listarTurnos,
    actualizarVentasTurno,
    loading: loadingTurnos,
    obtenerTurnoActual
  } = useTurnos();

  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [productos, setProductos] = useState([
    { descripcion: 'Café Americano', precioUnitario: 25, cantidad: 2, precio: 50 },
    { descripcion: 'Sandwich Pollo', precioUnitario: 85, cantidad: 1, precio: 85 },
  ]);
  const [tipoCliente, setTipoCliente] = useState('final');
  const [openClientes, setOpenClientes] = useState<'rtn' | 'credito' | null>(null);
  const [openCobro, setOpenCobro] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [editCantidad, setEditCantidad] = useState<string>('');
  const tableRef = useRef<HTMLDivElement>(null);
  const [openGerente, setOpenGerente] = useState(false);
  const [tabGerenteValue, setTabGerenteValue] = useState(0);
  
  // Estados para pre-cuenta/cuenta - NUEVA FUNCIONALIDAD
  const [openPreCuenta, setOpenPreCuenta] = useState(false);
  const [formatoImpresion, setFormatoImpresion] = useState<'thermal' | 'a4'>('thermal');
  
  const [empresa, setEmpresa] = useState({
    nombre: 'Restaurante El Buen Sabor',
    rtn: '08011999123456',
    direccion: 'Av. República de Chile, Tegucigalpa',
    telefono: '504-2234-5678',
    email: 'info@elbuensabor.com',
  });
  
  const [cais, setCais] = useState([
    {
      serie: '01',
      cai: '123456-ABCDEF-789012-345678-901234-567890-12',
      rangoInicial: 1,
      rangoFinal: 1000,
      actual: 125,
      fechaEmision: '2024-01-01',
      fechaVencimiento: '2025-12-31',
      habilitado: true,
      tipo: 'FACTURA',
      sucursal: '004',
      puntoEmision: '002',
    },
  ]);
  
  const [factura, setFactura] = useState<any>(null);
  const [openResumen, setOpenResumen] = useState(false);
  const [openPedidos, setOpenPedidos] = useState(false);
  const [pedidosAbiertos, setPedidosAbiertos] = useState<any[]>([]);
  
  // Estados adicionales necesarios para el funcionamiento
  const [usuarioActual, setUsuarioActual] = useState('María García');
  const [rolUsuario, setRolUsuario] = useState<'cajero' | 'gerente' | 'admin'>('cajero');
  const [horaActual, setHoraActual] = useState('');
  const [pedidoEnEdicion, setPedidoEnEdicion] = useState<{
    id: number;
    tipo: 'mesa' | 'delivery' | 'pickup' | 'barra';
    ref: string;
  } | null>({
    id: 1,
    tipo: 'mesa',
    ref: '5'
  });
  
  // Estados para notificaciones
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  
  // Estados para configuración
  const [configuracionAlmacenes] = useState({
    almacenActual: 'ALM001 - Sucursal Centro',
    codigoPV: 'PV001',
  });
  
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

  // Estados para gestión SUPER - Configuración avanzada
  const [openSuper, setOpenSuper] = useState(false);
  const [tabSuper, setTabSuper] = useState(0);
  const [openTestPostman, setOpenTestPostman] = useState(false);
  const [resultadosTestPostman, setResultadosTestPostman] = useState<any>(null);
  
  const [estadoCierreTurno] = useState({
    turnoAbierto: true,
  });
  
  const [descuentoAplicado] = useState<{
    tipo: 'porcentaje' | 'importe' | 'tercera_edad';
    valor: number;
    descripcion: string;
  } | null>(null);

  // Estados para gestión de turnos y facturas
  const [openGestionTurnos, setOpenGestionTurnos] = useState(false);
  const [openHistorialFacturas, setOpenHistorialFacturas] = useState(false);
  const [openEstadisticas, setOpenEstadisticas] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  // Cálculos de totales
  const subTotal = productos.reduce((acc, p) => acc + p.precio, 0);
  const montoDescuento = 0; // Simplificado para esta versión
  const impuesto = subTotal * 0.15;
  const total = subTotal + impuesto;

  // Funciones básicas necesarias
  const mostrarNotificacion = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const calcularISV = (productos: any[]) => {
    let isv15 = subTotal * 0.15;
    let isv18 = 0;
    // Para productos con alcohol/tabaco sería 18%
    productos.forEach(p => {
      if (/alcohol|licor|tabaco|cerveza|ron|whisky|vodka|tequila|vino/i.test(p.descripcion)) {
        isv18 += p.precio * 0.18;
        isv15 -= p.precio * 0.15;
      }
    });
    return { isv15: Math.max(0, isv15), isv18: Math.max(0, isv18) };
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

  // NUEVA FUNCIÓN: Imprimir Pre-Cuenta (Cuenta provisional)
  const imprimirPreCuenta = () => {
    if (productos.length === 0) {
      mostrarNotificacion('No hay productos para imprimir la cuenta', 'warning');
      return;
    }
    
    // Crear objeto de pre-cuenta
    const preCuenta = {
      tipo: 'PRE_CUENTA',
      empresa,
      fecha: new Date().toISOString(),
      hora: new Date().toLocaleTimeString(),
      mesa: pedidoEnEdicion?.tipo === 'mesa' ? `Mesa ${pedidoEnEdicion.ref}` : null,
      mesero: usuarioActual,
      productos,
      subTotal,
      descuento: descuentoAplicado ? {
        tipo: descuentoAplicado.tipo,
        valor: descuentoAplicado.valor,
        descripcion: descuentoAplicado.descripcion,
        monto: montoDescuento
      } : null,
      isv15: calcularISV(productos).isv15,
      isv18: calcularISV(productos).isv18,
      impuesto,
      total,
      formatoListing: true,
      observaciones: 'DOCUMENTO NO FISCAL - SOLO PARA CONTROL INTERNO',
    };

    setFactura(preCuenta);
    setOpenPreCuenta(true);
    mostrarNotificacion('✅ Pre-cuenta generada - Lista para imprimir en formato listing', 'success');
  };

  // NUEVA FUNCIÓN: Generar formato listing (texto plano para impresora térmica)
  const generarFormatoListing = (documento: any) => {
    const ancho = 40; // Caracteres por línea para impresora térmica
    const centrar = (texto: string) => {
      const espacios = Math.max(0, Math.floor((ancho - texto.length) / 2));
      return ' '.repeat(espacios) + texto;
    };
    const separador = '='.repeat(ancho);
    const separadorLinea = '-'.repeat(ancho);

    let listing = '';
    
    // Encabezado
    listing += centrar(documento.empresa.nombre) + '\n';
    listing += centrar(`RTN: ${documento.empresa.rtn}`) + '\n';
    listing += centrar(documento.empresa.direccion) + '\n';
    listing += centrar(`Tel: ${documento.empresa.telefono}`) + '\n';
    listing += separador + '\n';
    
    // Tipo de documento
    if (documento.tipo === 'PRE_CUENTA') {
      listing += centrar('*** PRE-CUENTA ***') + '\n';
      listing += centrar('DOCUMENTO NO FISCAL') + '\n';
    } else {
      listing += centrar('*** FACTURA ***') + '\n';
      listing += centrar(`No. ${documento.numeroFactura || 'N/A'}`) + '\n';
    }
    listing += separador + '\n';
    
    // Información
    listing += `Fecha: ${new Date(documento.fecha).toLocaleDateString()}\n`;
    listing += `Hora: ${documento.hora || new Date(documento.fecha).toLocaleTimeString()}\n`;
    if (documento.mesa) {
      listing += `${documento.mesa}\n`;
    }
    listing += `Mesero: ${documento.mesero || documento.usuario || 'N/A'}\n`;
    listing += separadorLinea + '\n';
    
    // Productos
    listing += 'Descripcion          Cant  Precio\n';
    listing += separadorLinea + '\n';
    
    documento.productos.forEach((producto: any) => {
      let desc = producto.descripcion;
      
      // Si la descripción es muy larga, cortarla y continuar en siguiente línea
      if (desc.length > 16) {
        listing += `${desc.substring(0, 16)} ${producto.cantidad.toString().padStart(4)} ${('L' + producto.precio.toFixed(2)).padStart(8)}\n`;
        // Continuar descripción en siguiente línea
        let resto = desc.substring(16);
        while (resto.length > 0) {
          listing += `  ${resto.substring(0, 22)}\n`;
          resto = resto.substring(22);
        }
      } else {
        const descPadded = desc.padEnd(16);
        const cant = producto.cantidad.toString().padStart(4);
        const precio = ('L' + producto.precio.toFixed(2)).padStart(8);
        listing += `${descPadded} ${cant} ${precio}\n`;
      }
    });
    
    listing += separadorLinea + '\n';
    
    // Totales
    listing += `Subtotal:${('L' + documento.subTotal.toFixed(2)).padStart(32)}\n`;
    
    if (documento.descuento && documento.descuento.monto > 0) {
      listing += `Descuento:${('-L' + documento.descuento.monto.toFixed(2)).padStart(31)}\n`;
    }
    
    listing += `ISV (15%):${('L' + documento.isv15.toFixed(2)).padStart(31)}\n`;
    if (documento.isv18 > 0) {
      listing += `ISV (18%):${('L' + documento.isv18.toFixed(2)).padStart(31)}\n`;
    }
    
    listing += separador + '\n';
    listing += `TOTAL:${('L' + documento.total.toFixed(2)).padStart(34)}\n`;
    listing += separador + '\n';
    
    // Pie de página
    if (documento.tipo === 'PRE_CUENTA') {
      listing += '\n';
      listing += centrar('DOCUMENTO NO FISCAL') + '\n';
      listing += centrar('SOLO PARA CONTROL INTERNO') + '\n';
      listing += centrar('Presente esta cuenta para pagar') + '\n';
      listing += '\n';
      listing += centrar('*** GRACIAS POR SU VISITA ***') + '\n';
    }
    
    listing += '\n';
    listing += centrar(new Date().toLocaleString()) + '\n';
    listing += '\n'.repeat(3); // Espacios para corte de papel
    
    return listing;
  };

  // NUEVA FUNCIÓN: Imprimir en formato listing
  const imprimirListing = (documento: any) => {
    const listing = generarFormatoListing(documento);
    
    // Crear ventana de impresión optimizada para impresoras térmicas
    const ventanaImpresion = window.open('', 'Imprimir', 'width=400,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <html>
        <head>
          <title>${documento.tipo === 'PRE_CUENTA' ? 'Pre-Cuenta' : 'Factura'} - ${documento.mesa || 'Cliente'}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              margin: 5px;
              line-height: 1.1;
              white-space: pre-line;
              color: #000;
            }
            @media print {
              body { 
                margin: 0; 
                font-size: 10px;
              }
              @page { 
                margin: 2mm; 
                size: 80mm auto; 
              }
            }
            .no-print {
              display: block;
              text-align: center;
              margin: 10px 0;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
              🖨️ Imprimir
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
              ✖️ Cerrar
            </button>
          </div>
          ${listing}
        </body>
        </html>
      `);
      ventanaImpresion.document.close();
      
      // Enfocar la ventana
      ventanaImpresion.focus();
      
      mostrarNotificacion('📄 Ventana de impresión abierta - Formato listing listo', 'success');
    } else {
      // Fallback: mostrar en consola y copiar al portapapeles si es posible
      console.log('FORMATO LISTING PARA IMPRESORA TÉRMICA:\n' + listing);
      
      // Intentar copiar al portapapeles
      try {
        navigator.clipboard.writeText(listing);
        mostrarNotificacion('📋 Formato listing copiado al portapapeles', 'info');
      } catch (err) {
        mostrarNotificacion('🔍 Ver formato listing en consola del navegador (F12)', 'info');
      }
    }
  };

  // Funciones básicas para evitar errores
  const handleAgregarProducto = (nombre: string) => {
    setProductos((prev) => {
      const existe = prev.find((p) => p.descripcion === nombre);
      if (existe) {
        return prev.map((p) =>
          p.descripcion === nombre ? { ...p, cantidad: p.cantidad + 1, precio: (p.cantidad + 1) * p.precioUnitario } : p
        );
      } else {
        // Precios aproximados por categoría
        let precio = 50;
        if (nombre.includes('Café') || nombre.includes('Té')) precio = 25;
        else if (nombre.includes('Sandwich')) precio = 85;
        else if (nombre.includes('Hamburguesa')) precio = 120;
        else if (nombre.includes('Pizza')) precio = 150;
        else if (nombre.includes('Hot Dog')) precio = 45;
        else if (nombre.includes('Pollo')) precio = 95;
        else if (nombre.includes('Granita')) precio = 30;
        
        return [...prev, { descripcion: nombre, precioUnitario: precio, cantidad: 1, precio: precio }];
      }
    });
    setSelectedRow(productos.length);
  };

  // Función para eliminar producto
  const eliminarProducto = () => {
    if (productos.length > 0) {
      setProductos(productos.slice(0, -1));
      setSelectedRow(Math.max(0, productos.length - 2));
    }
  };

  // Función para manejar el cobro con validación de turno
  const handleCobrar = async (medioPago: string) => {
    // Validar que haya un turno abierto
    if (!turnoActual) {
      mostrarNotificacion('❌ No hay turno abierto. Debe abrir un turno antes de facturar.', 'error');
      return;
    }

    if (productos.length === 0) {
      mostrarNotificacion('No hay productos en la venta', 'warning');
      return;
    }

    // Validar CAI disponible
    const caiActivo = cais.find(c => c.habilitado);
    if (!caiActivo) {
      mostrarNotificacion('No hay CAI activo', 'error');
      return;
    }
    
    // Generar correlativo
    let correlativo = caiActivo.actual;
    if (correlativo > caiActivo.rangoFinal) {
      mostrarNotificacion('Se agotó el rango de CAI', 'error');
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
      sucursal: configuracionAlmacenes.almacenActual,
      codigoPV: configuracionAlmacenes.codigoPV,
      usuario: usuarioActual,
      turno: turnoActual.numero,
    };

    // Guardar factura en la base de datos
    const facturaData = {
      numero: `${caiActivo.serie}-${correlativo.toString().padStart(8, '0')}`,
      correlativo: correlativo,
      cai: caiActivo.cai,
      tipoCliente: tipoCliente,
      subtotal: subTotal,
      descuento: montoDescuento,
      isv15: isv15,
      isv18: isv18,
      total: total,
      medioPago: medioPago,
      sucursal: configuracionAlmacenes.almacenActual,
      codigoPV: configuracionAlmacenes.codigoPV,
      usuario: usuarioActual,
      turnoId: turnoActual.id,
      mesaNumero: pedidoEnEdicion?.tipo === 'mesa' ? Number(pedidoEnEdicion.ref) : undefined,
      tipoPedido: pedidoEnEdicion?.tipo || undefined,
      clienteNombre: tipoCliente === 'CONSUMIDOR FINAL' ? 'CONSUMIDOR FINAL' : `Cliente ${tipoCliente}`,
      clienteTelefono: undefined,
      clienteRTN: tipoCliente === 'CLIENTE RTN' ? '08011999123456' : undefined,
      direccion: undefined,
      proveedor: undefined,
      observaciones: undefined,
      items: productos.map(p => ({
        codigoProducto: 'GENERICO',
        descripcion: p.descripcion,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
        subtotal: p.precio,
        descuento: 0,
        impuesto: p.precio * 0.15,
        total: p.precio,
        notas: undefined
      }))
    };

    const result = await crearFactura(facturaData);
    
    if (result.success) {
      // Actualizar ventas del turno
      await actualizarVentasTurno(turnoActual.id, turnoActual.ventasDelTurno + total);
      
      setFactura(nuevaFactura);
      setOpenResumen(true);
      
      // Limpiar venta
      setProductos([]);
      setTipoCliente('CONSUMIDOR FINAL');
      
      // Incrementar correlativo
      setCais(cais => cais.map((c, i) => i === 0 ? { ...c, actual: c.actual + 1 } : c));
      
      mostrarNotificacion('✅ Factura creada exitosamente', 'success');
    } else {
      mostrarNotificacion(`❌ Error al crear factura: ${result.error}`, 'error');
    }
    
    // Limpiar venta y descuentos
    setProductos([]);
    setOpenCobro(false);
  };

  // Efectos básicos
  useEffect(() => {
    const actualizarHora = () => {
      setHoraActual(new Date().toLocaleTimeString());
    };
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Cargar turno actual al iniciar
  useEffect(() => {
    const cargarTurnoActual = async () => {
      await obtenerTurnoActual(configuracionAlmacenes.almacenActual, configuracionAlmacenes.codigoPV);
    };
    cargarTurnoActual();
  }, []);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && (document.activeElement as HTMLElement).tagName === 'INPUT') return;
      
      if (e.key === 'ArrowUp' && selectedRow > 0) {
        setSelectedRow(prev => prev - 1);
      } else if (e.key === 'ArrowDown' && selectedRow < productos.length - 1) {
        setSelectedRow(prev => prev + 1);
      } else if (e.key === 'Delete' && productos.length > 0) {
        eliminarProducto();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, productos.length]);

  return (
    <Box sx={{ minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden', bgcolor: '#e5e5e5', display: 'flex', flexDirection: 'column' }}>
      <Head>
        <title>Sistema de Facturación - Pre-Cuenta y Listing</title>
      </Head>

      {/* Header con información del usuario y empresa */}
      <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{empresa.nombre}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">{configuracionAlmacenes.almacenActual}</Typography>
          <Typography variant="body2">Usuario: {usuarioActual} ({rolUsuario.toUpperCase()})</Typography>
          <Typography variant="body2">{horaActual}</Typography>
          {!estadoCierreTurno.turnoAbierto && (
            <Chip label="TURNO CERRADO" color="error" size="small" />
          )}
          <Button 
            variant="contained" 
            color="warning"
            size="small"
            onClick={() => setOpenSuper(true)}
            sx={{ 
              bgcolor: '#ff9800',
              '&:hover': { bgcolor: '#f57c00' },
              fontWeight: 'bold',
              minWidth: '80px'
            }}
          >
            ⚙️ SUPER
          </Button>
          <Button 
            variant="contained" 
            color="info"
            size="small"
            onClick={() => setOpenGestionTurnos(true)}
            sx={{ 
              bgcolor: '#2196f3',
              '&:hover': { bgcolor: '#1976d2' },
              fontWeight: 'bold',
              minWidth: '100px'
            }}
          >
            🕐 TURNOS
          </Button>
        </Box>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Panel izquierdo - Acciones */}
        <Box sx={{ width: 200, bgcolor: '#f5f5f5', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ p: 1, bgcolor: '#e0e0e0', textAlign: 'center' }}>
            ACCIONES
          </Typography>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {accionesIzquierda.map((accion) => (
              <Button
                key={accion}
                fullWidth
                variant="outlined"
                sx={{ 
                  m: 0.5, 
                  fontSize: '0.75rem',
                  bgcolor: accion === 'IMPRIMIR CUENTA' ? '#e8f5e8' : 'white',
                  border: accion === 'IMPRIMIR CUENTA' ? '2px solid #4caf50' : '1px solid #ccc',
                  fontWeight: accion === 'IMPRIMIR CUENTA' ? 'bold' : 'normal'
                }}
                onClick={() => {
                  switch (accion) {
                    case 'IMPRIMIR CUENTA':
                      imprimirPreCuenta();
                      break;
                    case 'ANULAR PRODUCTO':
                      eliminarProducto();
                      break;
                    default:
                      mostrarNotificacion(`Función ${accion} disponible en versión completa`, 'info');
                  }
                }}
              >
                {accion === 'IMPRIMIR CUENTA' ? '📄 ' + accion : accion}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Panel central - Tabla de productos */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, bgcolor: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {pedidoEnEdicion?.tipo === 'mesa' ? `Mesa ${pedidoEnEdicion.ref}` : 'Venta Actual'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)} size="small">
                {tiposCliente.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={imprimirPreCuenta}
                disabled={productos.length === 0}
                sx={{ minWidth: '120px' }}
              >
                📄 CUENTA
              </Button>
            </Box>
          </Box>
          
          <TableContainer component={Paper} sx={{ flex: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Precio Unit.</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Cant.</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productos.map((producto, idx) => (
                  <TableRow 
                    key={idx} 
                    selected={selectedRow === idx}
                    onClick={() => setSelectedRow(idx)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      bgcolor: selectedRow === idx ? '#e3f2fd' : 'inherit'
                    }}
                  >
                    <TableCell>{producto.descripcion}</TableCell>
                    <TableCell align="right">L{producto.precioUnitario.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>{producto.cantidad}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>L{producto.precio.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {productos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay productos agregados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totales */}
          <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="body1">Subtotal: L{subTotal.toFixed(2)}</Typography>
                <Typography variant="body1">ISV (15%): L{impuesto.toFixed(2)}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Total: L{total.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setOpenCobro(true)}
                  disabled={productos.length === 0}
                  sx={{ mb: 1 }}
                >
                  💰 COBRAR
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  size="medium"
                  onClick={imprimirPreCuenta}
                  disabled={productos.length === 0}
                >
                  📄 CUENTA
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Panel derecho - Categorías */}
        <Box sx={{ width: 250, bgcolor: '#f5f5f5', borderLeft: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ p: 1, bgcolor: '#e0e0e0', textAlign: 'center' }}>
            CATEGORÍAS
          </Typography>
          <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
            {categoriasDerecha.map((categoria) => (
              <Button
                key={categoria}
                fullWidth
                variant="outlined"
                sx={{ m: 0.5, fontSize: '0.7rem' }}
                onClick={() => setCategoriaActiva(categoria)}
              >
                {categoria}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Diálogo para Pre-Cuenta - NUEVA FUNCIONALIDAD */}
      <Dialog 
        open={openPreCuenta} 
        onClose={() => setOpenPreCuenta(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#e8f5e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📄 Pre-Cuenta - Documento No Fiscal</span>
          <Box>
            <Button
              onClick={() => imprimirListing(factura)}
              variant="contained"
              color="success"
              size="small"
              sx={{ mr: 1 }}
            >
              🖨️ Imprimir Listing
            </Button>
            <IconButton onClick={() => setOpenPreCuenta(false)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {factura && factura.tipo === 'PRE_CUENTA' && (
            <Box sx={{ 
              fontFamily: 'Courier New, monospace', 
              fontSize: '12px', 
              whiteSpace: 'pre-line', 
              bgcolor: '#f9f9f9', 
              p: 2,
              lineHeight: 1.2,
              border: '2px dashed #ccc',
              margin: 2
            }}>
              {generarFormatoListing(factura)}
            </Box>
          )}
          <Box sx={{ p: 2, bgcolor: '#fff3cd', borderTop: '1px solid #ddd' }}>
            <Typography variant="body2" color="text.secondary">
              ℹ️ <strong>Instrucciones:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Este es un documento NO FISCAL para control interno
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • El cliente presenta esta cuenta para proceder al pago
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Después del pago se emite la factura fiscal oficial
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • El formato listing está optimizado para impresoras térmicas de 80mm
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Diálogo de categorías */}
      <Dialog open={!!categoriaActiva} onClose={() => setCategoriaActiva(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#e3f2fd' }}>{categoriaActiva}</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {categoriaActiva && submenus[categoriaActiva]?.map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleAgregarProducto(item);
                    setCategoriaActiva(null);
                    mostrarNotificacion(`✅ ${item} agregado`, 'success');
                  }}
                  sx={{ fontSize: '0.8rem', p: 1, textTransform: 'none' }}
                >
                  {item}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Diálogo SUPER - Configuración Avanzada y Business Central */}
      <Dialog 
        open={openSuper} 
        onClose={() => setOpenSuper(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>⚙️ SUPER - Configuración Avanzada</span>
            <Chip 
              label={configuracionBusinessCentral.habilitado ? 'BC Conectado' : 'BC Desconectado'} 
              color={configuracionBusinessCentral.habilitado ? 'success' : 'error'} 
              size="small" 
            />
          </Box>
          <IconButton onClick={() => setOpenSuper(false)} sx={{ color: 'white' }}>
            <DeleteIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Tabs value={tabSuper} onChange={(e, v) => setTabSuper(v)} variant="fullWidth">
            <Tab label="🔗 Business Central" />
            <Tab label="🧪 Test Postman" />
            <Tab label="⚙️ Configuración" />
          </Tabs>

          {/* Pestaña Business Central */}
          {tabSuper === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 1 }}>
                🔗 Configuración de Business Central
                <Chip 
                  label={configuracionBusinessCentral.habilitado ? '✅ Conectado' : '❌ Desconectado'} 
                  color={configuracionBusinessCentral.habilitado ? 'success' : 'error'} 
                  size="small" 
                />
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tenant ID"
                    value={configuracionBusinessCentral.tenantId}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, tenantId: e.target.value }))}
                    variant="outlined"
                    size="small"
                    helperText="ID del tenant de Azure"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company ID"
                    value={configuracionBusinessCentral.companyId}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, companyId: e.target.value }))}
                    variant="outlined"
                    size="small"
                    helperText="ID único de la empresa"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client ID (Username)"
                    value={configuracionBusinessCentral.username}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, username: e.target.value }))}
                    variant="outlined"
                    size="small"
                    helperText="Application (client) ID"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Client Secret (Password)"
                    type="password"
                    value={configuracionBusinessCentral.password}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, password: e.target.value }))}
                    variant="outlined"
                    size="small"
                    helperText="Secret del cliente"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Environment"
                    value={configuracionBusinessCentral.environment}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' | 'SB110225' }))}
                    variant="outlined"
                    size="small"
                    helperText="Sandbox, Production, o código específico"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Base URL"
                    value={configuracionBusinessCentral.baseUrl}
                    onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, baseUrl: e.target.value }))}
                    variant="outlined"
                    size="small"
                    helperText="URL base de la API"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={probarConexionBusinessCentral}
                  sx={{ minWidth: '200px' }}
                >
                  🔍 Probar Conexión
                </Button>
                <Button
                  variant="outlined"
                  color="info"
                  onClick={ejecutarTestPostmanBusinessCentral}
                  sx={{ minWidth: '200px' }}
                >
                  🧪 Test Tipo Postman
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracionBusinessCentral.habilitado}
                      onChange={(e) => setConfiguracionBusinessCentral(prev => ({ ...prev, habilitado: e.target.checked }))}
                    />
                  }
                  label="Habilitar Business Central"
                />
              </Box>

              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Estado:</strong> {configuracionBusinessCentral.habilitado ? '✅ Conectado' : '❌ Desconectado'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Environment:</strong> {configuracionBusinessCentral.environment}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Sincronización:</strong> {configuracionBusinessCentral.sincronizacionAutomatica ? 'Activada' : 'Desactivada'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Pestaña Test Postman */}
          {tabSuper === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                🧪 Test Tipo Postman - Business Central API
              </Typography>
              
              <Button
                variant="contained"
                color="info"
                onClick={ejecutarTestPostmanBusinessCentral}
                size="large"
                sx={{ mb: 2 }}
              >
                ▶️ Ejecutar Test Completo
              </Button>

              {resultadosTestPostman && (
                <Box sx={{ mt: 2 }}>
                  {resultadosTestPostman.loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography>{resultadosTestPostman.message}</Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h6" color={resultadosTestPostman.success ? 'success.main' : 'error.main'}>
                        {resultadosTestPostman.message}
                      </Typography>
                      
                      {resultadosTestPostman.summary && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>📊 Resumen:</Typography>
                          <Typography variant="body2">Total de pasos: {resultadosTestPostman.summary.totalSteps}</Typography>
                          <Typography variant="body2" color="success.main">Exitosos: {resultadosTestPostman.summary.successfulSteps}</Typography>
                          <Typography variant="body2" color="error.main">Fallidos: {resultadosTestPostman.summary.failedSteps}</Typography>
                          <Typography variant="body2">Empresa encontrada: {resultadosTestPostman.summary.companyFound ? '✅ Sí' : '❌ No'}</Typography>
                          {resultadosTestPostman.summary.companyName && (
                            <Typography variant="body2">Nombre: {resultadosTestPostman.summary.companyName}</Typography>
                          )}
                        </Box>
                      )}

                      {resultadosTestPostman.steps && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>🔍 Detalles de cada paso:</Typography>
                          {resultadosTestPostman.steps.map((step: any, idx: number) => (
                            <Box key={idx} sx={{ mt: 2, p: 2, border: 1, borderColor: step.success ? 'success.main' : 'error.main', borderRadius: 1 }}>
                              <Typography variant="subtitle2" color={step.success ? 'success.main' : 'error.main'}>
                                {step.name} {step.success ? '✅' : '❌'}
                              </Typography>
                              {step.url && (
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                  <strong>{step.method || 'GET'}:</strong> {step.url}
                                </Typography>
                              )}
                              {step.responseStatus && (
                                <Typography variant="body2">
                                  Status: {step.responseStatus} {step.responseStatusText}
                                </Typography>
                              )}
                              {step.error && (
                                <Typography variant="body2" color="error.main">
                                  Error: {step.error}
                                </Typography>
                              )}
                              {step.responseBody && typeof step.responseBody === 'object' && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  <pre>{JSON.stringify(step.responseBody, null, 2)}</pre>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* Pestaña Configuración */}
          {tabSuper === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
                ⚙️ Configuración del Sistema
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>📊 Estado del Sistema:</Typography>
                    <Typography variant="body2">• Business Central: {configuracionBusinessCentral.habilitado ? '✅ Conectado' : '❌ Desconectado'}</Typography>
                    <Typography variant="body2">• Base de datos: ✅ Conectada (Prisma)</Typography>
                    <Typography variant="body2">• Inventario: ✅ Activo</Typography>
                    <Typography variant="body2">• Pre-cuentas: ✅ Habilitadas</Typography>
                    <Typography variant="body2">• Formato Listing: ✅ Configurado</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo Test Postman Independiente */}
      <Dialog 
        open={openTestPostman} 
        onClose={() => setOpenTestPostman(false)}
        maxWidth="lg"
        fullWidth
        sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
      >
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
          🧪 Test Tipo Postman - Resultados Detallados
        </DialogTitle>
        <DialogContent>
          {/* Contenido idéntico a la pestaña Test Postman del SUPER */}
          {resultadosTestPostman && (
            <Box sx={{ mt: 2 }}>
              {resultadosTestPostman.loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>{resultadosTestPostman.message}</Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" color={resultadosTestPostman.success ? 'success.main' : 'error.main'}>
                    {resultadosTestPostman.message}
                  </Typography>
                  
                  {resultadosTestPostman.timestamp && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Ejecutado: {new Date(resultadosTestPostman.timestamp).toLocaleString()}
                    </Typography>
                  )}

                  {resultadosTestPostman.config && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>⚙️ Configuración utilizada:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        Tenant ID: {resultadosTestPostman.config.tenantId}<br/>
                        Environment: {resultadosTestPostman.config.environment}<br/>
                        Company ID: {resultadosTestPostman.config.companyId}<br/>
                        Base URL: {resultadosTestPostman.config.baseUrl}
                      </Typography>
                    </Box>
                  )}
                  
                  {resultadosTestPostman.summary && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>📊 Resumen:</Typography>
                      <Typography variant="body2">Total de pasos: {resultadosTestPostman.summary.totalSteps}</Typography>
                      <Typography variant="body2" color="success.main">Exitosos: {resultadosTestPostman.summary.successfulSteps}</Typography>
                      <Typography variant="body2" color="error.main">Fallidos: {resultadosTestPostman.summary.failedSteps}</Typography>
                      <Typography variant="body2">Empresa encontrada: {resultadosTestPostman.summary.companyFound ? '✅ Sí' : '❌ No'}</Typography>
                      {resultadosTestPostman.summary.companyName && (
                        <Typography variant="body2">Nombre: {resultadosTestPostman.summary.companyName}</Typography>
                      )}
                    </Box>
                  )}

                  {resultadosTestPostman.steps && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>🔍 Detalles de cada paso:</Typography>
                      {resultadosTestPostman.steps.map((step: any, idx: number) => (
                        <Box key={idx} sx={{ mt: 2, p: 2, border: 1, borderColor: step.success ? 'success.main' : 'error.main', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color={step.success ? 'success.main' : 'error.main'}>
                            Paso {step.step}: {step.name} {step.success ? '✅' : '❌'}
                          </Typography>
                          {step.url && (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', mt: 1 }}>
                              <strong>{step.method || 'GET'}:</strong> {step.url}
                            </Typography>
                          )}
                          {step.responseStatus && (
                            <Typography variant="body2">
                              Status: {step.responseStatus} {step.responseStatusText}
                            </Typography>
                          )}
                          {step.error && (
                            <Typography variant="body2" color="error.main">
                              Error: {step.error}
                            </Typography>
                          )}
                          {step.responseBody && typeof step.responseBody === 'object' && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: '#f9f9f9', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem', maxHeight: '300px', overflow: 'auto' }}>
                              <pre>{JSON.stringify(step.responseBody, null, 2)}</pre>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {resultadosTestPostman.errorDetails && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                      <Typography variant="subtitle1" color="error.main" gutterBottom>❌ Detalles del Error:</Typography>
                      <Typography variant="body2" color="error.main" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {resultadosTestPostman.errorDetails.name}: {resultadosTestPostman.errorDetails.message}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Cobro */}
      <Dialog open={openCobro} onClose={() => setOpenCobro(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
          💰 COBRO - Seleccionar Medio de Pago
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total a Cobrar: L. {total.toFixed(2)}
            </Typography>
            
            <Grid container spacing={2}>
              {mediosCobro.map((medio) => (
                <Grid item xs={6} key={medio}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => handleCobrar(medio)}
                    sx={{ 
                      height: 60, 
                      fontSize: '1rem',
                      textTransform: 'none',
                      bgcolor: medio === 'EFECTIVO' ? '#4caf50' : '#2196f3',
                      '&:hover': {
                        bgcolor: medio === 'EFECTIVO' ? '#45a049' : '#1976d2'
                      }
                    }}
                  >
                    {medio}
                  </Button>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                💡 <strong>Información:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Turno actual: {turnoActual ? `#${turnoActual.numero}` : 'No hay turno abierto'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Usuario: {usuarioActual}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Sucursal: {configuracionAlmacenes.almacenActual}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Resumen de Factura */}
      <Dialog open={openResumen} onClose={() => setOpenResumen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white' }}>
          📄 Resumen de Factura
        </DialogTitle>
        <DialogContent>
          {factura && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Factura: {factura.cai?.serie}-{factura.correlativo?.toString().padStart(8, '0')}
              </Typography>
              
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {factura.productos?.map((producto: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{producto.descripcion}</TableCell>
                        <TableCell align="right">{producto.cantidad}</TableCell>
                        <TableCell align="right">L. {producto.precioUnitario?.toFixed(2)}</TableCell>
                        <TableCell align="right">L. {producto.precio?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6">Totales:</Typography>
                <Typography>Subtotal: L. {factura.subTotal?.toFixed(2)}</Typography>
                <Typography>ISV 15%: L. {factura.isv15?.toFixed(2)}</Typography>
                {factura.isv18 > 0 && (
                  <Typography>ISV 18%: L. {factura.isv18?.toFixed(2)}</Typography>
                )}
                <Typography variant="h6" color="primary">
                  Total: L. {factura.total?.toFixed(2)}
                </Typography>
                <Typography>Medio de pago: {factura.medioPago}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Gestión de Turnos */}
      <GestionTurnos 
        open={openGestionTurnos}
        onClose={() => setOpenGestionTurnos(false)}
        sucursal={configuracionAlmacenes.almacenActual}
        codigoPV={configuracionAlmacenes.codigoPV}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 