import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  CloudUpload as CloudIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useBusinessCentral } from '../hooks/useBusinessCentral';
import { BCConfig } from '../lib/business-central-api';

interface BusinessCentralConfigProps {
  onClose?: () => void;
}

const BusinessCentralConfig: React.FC<BusinessCentralConfigProps> = ({ onClose }) => {
  const [config, setConfig] = useState<BCConfig>({
    baseUrl: '',
    tenantId: '',
    companyId: '',
    username: '',
    password: '',
    environment: 'sandbox',
  });

  const [sucursal, setSucursal] = useState('SUCURSAL01');
  const [vendedor, setVendedor] = useState('VENDEDOR01');
  const [sincronizacionActiva, setSincronizacionActiva] = useState(false);
  const [openPresupuesto, setOpenPresupuesto] = useState(false);
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);

  const {
    connected,
    loading,
    error,
    lastSync,
    syncStatus,
    items,
    clientes,
    mediosPago,
    promociones,
    presupuesto,
    testConnection,
    sincronizarDatos,
    iniciarSincronizacionAutomatica,
    obtenerPresupuesto,
    obtenerVentasPendientes,
    limpiarVentasPendientes,
    isConnected,
    isLoading,
    hasError,
  } = useBusinessCentral(config.baseUrl ? config : undefined);

  // Cargar configuración guardada
  useEffect(() => {
    const configGuardada = localStorage.getItem('bc_config');
    if (configGuardada) {
      const parsedConfig = JSON.parse(configGuardada);
      setConfig(parsedConfig);
    }

    const sucursalGuardada = localStorage.getItem('bc_sucursal');
    if (sucursalGuardada) {
      setSucursal(sucursalGuardada);
    }

    const vendedorGuardado = localStorage.getItem('bc_vendedor');
    if (vendedorGuardado) {
      setVendedor(vendedorGuardado);
    }

    const syncActiva = localStorage.getItem('bc_sync_activa') === 'true';
    setSincronizacionActiva(syncActiva);
  }, []);

  const handleSaveConfig = async () => {
    try {
      // Guardar configuración
      localStorage.setItem('bc_config', JSON.stringify(config));
      localStorage.setItem('bc_sucursal', sucursal);
      localStorage.setItem('bc_vendedor', vendedor);

      // Probar conexión
      await testConnection();
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
    }
  };

  const handleSincronizar = async () => {
    try {
      await sincronizarDatos(sucursal);
    } catch (error: any) {
      console.error('Error sincronizando:', error);
    }
  };

  const handleToggleSincronizacion = async () => {
    const nueva = !sincronizacionActiva;
    setSincronizacionActiva(nueva);
    localStorage.setItem('bc_sync_activa', nueva.toString());

    if (nueva && connected) {
      try {
        await iniciarSincronizacionAutomatica(sucursal);
      } catch (error: any) {
        console.error('Error iniciando sincronización automática:', error);
        setSincronizacionActiva(false);
        localStorage.setItem('bc_sync_activa', 'false');
      }
    }
  };

  const handleVerPresupuesto = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      await obtenerPresupuesto(sucursal, hoy);
      setOpenPresupuesto(true);
    } catch (error: any) {
      console.error('Error obteniendo presupuesto:', error);
    }
  };

  const ventasPendientes = obtenerVentasPendientes();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SettingsIcon fontSize="large" />
        Configuración Business Central
      </Typography>

      {/* Estado de Conexión */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Estado de Conexión</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isConnected ? (
                <Chip icon={<CheckIcon />} label="Conectado" color="success" />
              ) : (
                <Chip icon={<ErrorIcon />} label="Desconectado" color="error" />
              )}
              {isLoading && <LinearProgress sx={{ width: 100 }} />}
            </Box>
          </Box>

          {lastSync && (
            <Typography variant="body2" color="textSecondary">
              Última sincronización: {new Date(lastSync).toLocaleString()}
            </Typography>
          )}

          {hasError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {syncStatus && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Estado de Sincronización:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${syncStatus.registrosProcesados}/${syncStatus.totalRegistros} registros`}
                  color={syncStatus.estado === 'exitoso' ? 'success' : 'warning'}
                />
                <Chip 
                  label={`${syncStatus.errores.length} errores`}
                  color={syncStatus.errores.length === 0 ? 'success' : 'error'}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Configuración de Conexión */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuración de Conexión
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL Base de Business Central"
                value={config.baseUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.businesscentral.dynamics.com"
                helperText="URL de la API de Business Central"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tenant ID"
                value={config.tenantId}
                onChange={(e) => setConfig(prev => ({ ...prev, tenantId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company ID"
                value={config.companyId}
                onChange={(e) => setConfig(prev => ({ ...prev, companyId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ambiente"
                select
                SelectProps={{ native: true }}
                value={config.environment}
                onChange={(e) => setConfig(prev => ({ ...prev, environment: e.target.value }))}
              >
                <option value="sandbox">Sandbox</option>
                <option value="production">Producción</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Usuario"
                value={config.username}
                onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                autoComplete="username"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contraseña"
                type={mostrarCredenciales ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="current-password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={mostrarCredenciales}
                    onChange={(e) => setMostrarCredenciales(e.target.checked)}
                  />
                }
                label="Mostrar credenciales"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveConfig}
              disabled={isLoading}
              startIcon={<SettingsIcon />}
            >
              Guardar y Probar Conexión
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Configuración de Sucursal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configuración Local
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de Sucursal"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                placeholder="SUCURSAL01"
                helperText="Código de sucursal en Business Central"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de Vendedor"
                value={vendedor}
                onChange={(e) => setVendedor(e.target.value)}
                placeholder="VENDEDOR01"
                helperText="Código de vendedor predeterminado"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sincronización Automática */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Sincronización Automática</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={sincronizacionActiva}
                  onChange={handleToggleSincronizacion}
                  disabled={!connected}
                />
              }
              label="Activar"
            />
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            La sincronización automática descarga datos cada 5 minutos y envía ventas cada minuto.
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={handleSincronizar}
              disabled={!connected || isLoading}
              startIcon={<SyncIcon />}
            >
              Sincronizar Ahora
            </Button>

            <Button
              variant="outlined"
              onClick={handleVerPresupuesto}
              disabled={!connected || isLoading}
              startIcon={<ReportIcon />}
            >
              Ver Presupuesto Diario
            </Button>

            {ventasPendientes.length > 0 && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<CloudIcon />}
              >
                {ventasPendientes.length} Ventas Pendientes
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Estadísticas de Datos Sincronizados */}
      {(items.length > 0 || clientes.length > 0) && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Datos Sincronizados
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {items.length}
                  </Typography>
                  <Typography variant="body2">Productos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {clientes.length}
                  </Typography>
                  <Typography variant="body2">Clientes</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {mediosPago.length}
                  </Typography>
                  <Typography variant="body2">Medios de Pago</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {promociones.length}
                  </Typography>
                  <Typography variant="body2">Promociones</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Presupuesto */}
      <Dialog open={openPresupuesto} onClose={() => setOpenPresupuesto(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReportIcon />
            Presupuesto de Ventas Diario
          </Box>
        </DialogTitle>
        <DialogContent>
          {presupuesto && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      L{presupuesto.presupuestoDiario.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Presupuesto</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      L{presupuesto.ventasAcumuladas.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Ventas</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color={presupuesto.porcentajeCumplimiento >= 100 ? 'success.main' : 'warning.main'}>
                      {presupuesto.porcentajeCumplimiento.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2">Cumplimiento</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5">
                      L{(presupuesto.presupuestoDiario - presupuesto.ventasAcumuladas).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">Faltante</Typography>
                  </Box>
                </Grid>
              </Grid>

              <LinearProgress 
                variant="determinate" 
                value={Math.min(presupuesto.porcentajeCumplimiento, 100)}
                sx={{ height: 8, borderRadius: 4, mb: 3 }}
              />

              <Typography variant="h6" gutterBottom>
                Ventas por Hora (Estimado)
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Hora</TableCell>
                      <TableCell align="right">Ventas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {presupuesto.ventasPorHora.slice(0, 12).map((row) => (
                      <TableRow key={row.hora}>
                        <TableCell>{row.hora}</TableCell>
                        <TableCell align="right">L{row.ventas.toFixed(0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Botones de Acción */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </Box>
    </Box>
  );
};

export default BusinessCentralConfig; 