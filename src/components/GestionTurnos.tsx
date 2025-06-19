import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useTurnos } from '../hooks/useTurnos';
import { TurnoData } from '../lib/turno-service';

interface GestionTurnosProps {
  open: boolean;
  onClose: () => void;
  sucursal?: string;
  codigoPV?: string;
}

export const GestionTurnos: React.FC<GestionTurnosProps> = ({
  open,
  onClose,
  sucursal,
  codigoPV
}) => {
  const {
    turnoActual,
    turnos,
    loading,
    error,
    obtenerTurnoActual,
    crearTurno,
    cerrarTurno,
    listarTurnos,
    obtenerSiguienteNumero
  } = useTurnos();

  const [openNuevoTurno, setOpenNuevoTurno] = useState(false);
  const [openCerrarTurno, setOpenCerrarTurno] = useState(false);
  const [formNuevoTurno, setFormNuevoTurno] = useState({
    montoApertura: 0,
    observaciones: ''
  });
  const [formCerrarTurno, setFormCerrarTurno] = useState({
    montoCierre: 0,
    observaciones: ''
  });
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    usuario: '',
    estado: ''
  });

  useEffect(() => {
    if (open) {
      obtenerTurnoActual(sucursal, codigoPV);
      listarTurnos(filtros);
    }
  }, [open, sucursal, codigoPV]);

  const handleCrearTurno = async () => {
    const siguienteNumero = await obtenerSiguienteNumero(sucursal, codigoPV);
    
    if (siguienteNumero.success) {
      const turnoData: TurnoData = {
        numero: siguienteNumero.data,
        fechaApertura: new Date(),
        horaApertura: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        montoApertura: formNuevoTurno.montoApertura,
        usuarioApertura: 'Usuario Actual', // TODO: Obtener usuario actual
        sucursal,
        codigoPV,
        observaciones: formNuevoTurno.observaciones
      };

      const result = await crearTurno(turnoData);
      if (result.success) {
        setOpenNuevoTurno(false);
        setFormNuevoTurno({ montoApertura: 0, observaciones: '' });
        obtenerTurnoActual(sucursal, codigoPV);
        listarTurnos(filtros);
      }
    }
  };

  const handleCerrarTurno = async () => {
    if (turnoActual) {
      const result = await cerrarTurno(turnoActual.id, {
        fechaCierre: new Date(),
        horaCierre: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        montoCierre: formCerrarTurno.montoCierre,
        usuarioCierre: 'Usuario Actual', // TODO: Obtener usuario actual
        ventasDelTurno: turnoActual.ventasDelTurno,
        observaciones: formCerrarTurno.observaciones
      });

      if (result.success) {
        setOpenCerrarTurno(false);
        setFormCerrarTurno({ montoCierre: 0, observaciones: '' });
        obtenerTurnoActual(sucursal, codigoPV);
        listarTurnos(filtros);
      }
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierto': return 'success';
      case 'cerrado': return 'default';
      case 'anulado': return 'error';
      default: return 'default';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'abierto': return 'Abierto';
      case 'cerrado': return 'Cerrado';
      case 'anulado': return 'Anulado';
      default: return estado;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Gestión de Turnos</Typography>
          <Box>
            {turnoActual ? (
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenCerrarTurno(true)}
                disabled={loading}
              >
                Cerrar Turno Actual
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenNuevoTurno(true)}
                disabled={loading}
              >
                Abrir Nuevo Turno
              </Button>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Estado del turno actual */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Turno Actual
            </Typography>
            {turnoActual ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Número de Turno
                  </Typography>
                  <Typography variant="h5">
                    #{turnoActual.numero}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip 
                    label={getEstadoText(turnoActual.estado)}
                    color={getEstadoColor(turnoActual.estado) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Apertura
                  </Typography>
                  <Typography variant="body1">
                    {new Date(turnoActual.fechaApertura).toLocaleDateString()} {turnoActual.horaApertura}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Usuario
                  </Typography>
                  <Typography variant="body1">
                    {turnoActual.usuarioApertura}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Monto de Apertura
                  </Typography>
                  <Typography variant="h6" color="primary">
                    L{turnoActual.montoApertura.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ventas del Turno
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    L{turnoActual.ventasDelTurno.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                No hay turno abierto actualmente
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Filtros */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Historial de Turnos
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha Desde"
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha Hasta"
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Usuario"
                value={filtros.usuario}
                onChange={(e) => setFiltros(prev => ({ ...prev, usuario: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                size="small"
              >
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="cerrado">Cerrado</option>
                <option value="anulado">Anulado</option>
              </TextField>
            </Grid>
          </Grid>
          <Button
            variant="outlined"
            onClick={() => listarTurnos(filtros)}
            disabled={loading}
          >
            Filtrar
          </Button>
        </Box>

        {/* Tabla de turnos */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Apertura</TableCell>
                <TableCell align="right">Ventas</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {turnos.map((turno) => (
                <TableRow key={turno.id}>
                  <TableCell>#{turno.numero}</TableCell>
                  <TableCell>
                    {new Date(turno.fechaApertura).toLocaleDateString()}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {turno.horaApertura}
                    </Typography>
                  </TableCell>
                  <TableCell>{turno.usuarioApertura}</TableCell>
                  <TableCell align="right">L{turno.montoApertura.toFixed(2)}</TableCell>
                  <TableCell align="right">L{turno.ventasDelTurno.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getEstadoText(turno.estado)}
                      color={getEstadoColor(turno.estado) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined">
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>

      {/* Modal para abrir nuevo turno */}
      <Dialog open={openNuevoTurno} onClose={() => setOpenNuevoTurno(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Abrir Nuevo Turno</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Monto de Apertura"
            type="number"
            value={formNuevoTurno.montoApertura}
            onChange={(e) => setFormNuevoTurno(prev => ({ 
              ...prev, 
              montoApertura: parseFloat(e.target.value) || 0 
            }))}
            margin="normal"
            InputProps={{
              startAdornment: <Typography>L</Typography>
            }}
          />
          <TextField
            fullWidth
            label="Observaciones"
            value={formNuevoTurno.observaciones}
            onChange={(e) => setFormNuevoTurno(prev => ({ 
              ...prev, 
              observaciones: e.target.value 
            }))}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNuevoTurno(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCrearTurno}
            disabled={loading || formNuevoTurno.montoApertura <= 0}
          >
            Abrir Turno
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para cerrar turno */}
      <Dialog open={openCerrarTurno} onClose={() => setOpenCerrarTurno(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cerrar Turno #{turnoActual?.numero}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ventas del turno: L{turnoActual?.ventasDelTurno.toFixed(2)}
          </Typography>
          <TextField
            fullWidth
            label="Monto de Cierre"
            type="number"
            value={formCerrarTurno.montoCierre}
            onChange={(e) => setFormCerrarTurno(prev => ({ 
              ...prev, 
              montoCierre: parseFloat(e.target.value) || 0 
            }))}
            margin="normal"
            InputProps={{
              startAdornment: <Typography>L</Typography>
            }}
          />
          <TextField
            fullWidth
            label="Observaciones"
            value={formCerrarTurno.observaciones}
            onChange={(e) => setFormCerrarTurno(prev => ({ 
              ...prev, 
              observaciones: e.target.value 
            }))}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCerrarTurno(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleCerrarTurno}
            disabled={loading}
          >
            Cerrar Turno
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}; 