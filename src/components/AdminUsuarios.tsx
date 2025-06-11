import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimoLogin?: string;
  createdAt: string;
  limitesConexion?: number;
  permisos: string[];
}

interface UsuarioDB {
  usuario: string;
  puede_login: boolean;
  limite_conexiones: number;
  rol_tipo: string;
}

const AdminUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosDB, setUsuariosDB] = useState<UsuarioDB[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDBDialog, setOpenDBDialog] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'cajero',
    activo: true
  });

  const roles = [
    { value: 'admin', label: 'Administrador', color: '#dc2626', permisos: ['Acceso completo', 'Gestión usuarios', 'Configuración sistema'] },
    { value: 'gerente', label: 'Gerente', color: '#ea580c', permisos: ['Gestión ventas', 'Reportes', 'Configuración básica'] },
    { value: 'cajero', label: 'Cajero', color: '#16a34a', permisos: ['Ventas', 'Consulta productos', 'Imprimir recibos'] },
    { value: 'mesero', label: 'Mesero', color: '#2563eb', permisos: ['Gestión mesas', 'Pedidos', 'Reservas'] },
    { value: 'readonly', label: 'Solo Lectura', color: '#6b7280', permisos: ['Consulta reportes', 'Ver información'] }
  ];

  const rolesDB = [
    { value: 'pos_app', label: 'App Principal', descripcion: 'Usuario principal de la aplicación' },
    { value: 'pos_readonly', label: 'Solo Lectura', descripcion: 'Acceso de solo lectura para reportes' },
    { value: 'pos_cajero', label: 'Cajero DB', descripcion: 'Operaciones de caja y ventas' },
    { value: 'pos_mesero', label: 'Mesero DB', descripcion: 'Gestión de mesas y pedidos' },
    { value: 'pos_gerente', label: 'Gerente DB', descripcion: 'Gestión completa excepto configuración crítica' },
    { value: 'pos_admin', label: 'Admin DB', descripcion: 'Acceso completo a la base de datos' }
  ];

  const mostrarMensaje = useCallback((tipo: 'success' | 'error' | 'info', texto: string) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 5000);
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      // Simular carga de usuarios desde la API
      const usuariosSimulados: Usuario[] = [
        {
          id: 1,
          nombre: 'Admin Principal',
          email: 'admin@pos.com',
          rol: 'admin',
          activo: true,
          ultimoLogin: '2024-01-15 10:30:00',
          createdAt: '2024-01-01',
          limitesConexion: 10,
          permisos: ['Acceso completo', 'Gestión usuarios', 'Configuración sistema']
        },
        {
          id: 2,
          nombre: 'Gerente Turno',
          email: 'gerente@pos.com',
          rol: 'gerente',
          activo: true,
          ultimoLogin: '2024-01-15 09:15:00',
          createdAt: '2024-01-02',
          limitesConexion: 5,
          permisos: ['Gestión ventas', 'Reportes', 'Configuración básica']
        },
        {
          id: 3,
          nombre: 'Cajero 01',
          email: 'cajero01@pos.com',
          rol: 'cajero',
          activo: true,
          ultimoLogin: '2024-01-15 08:00:00',
          createdAt: '2024-01-03',
          limitesConexion: 3,
          permisos: ['Ventas', 'Consulta productos', 'Imprimir recibos']
        },
        {
          id: 4,
          nombre: 'Mesero 01',
          email: 'mesero01@pos.com',
          rol: 'mesero',
          activo: true,
          ultimoLogin: '2024-01-15 07:45:00',
          createdAt: '2024-01-04',
          limitesConexion: 3,
          permisos: ['Gestión mesas', 'Pedidos', 'Reservas']
        }
      ];
      setUsuarios(usuariosSimulados);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [mostrarMensaje]);

  const cargarUsuariosDB = useCallback(async () => {
    try {
      // Simular carga de usuarios de base de datos
      const usuariosDBSimulados: UsuarioDB[] = [
        { usuario: 'pos_admin_01', puede_login: true, limite_conexiones: 10, rol_tipo: 'admin' },
        { usuario: 'pos_gerente_01', puede_login: true, limite_conexiones: 5, rol_tipo: 'gerente' },
        { usuario: 'pos_cajero_01', puede_login: true, limite_conexiones: 3, rol_tipo: 'cajero' },
        { usuario: 'pos_cajero_02', puede_login: true, limite_conexiones: 3, rol_tipo: 'cajero' },
        { usuario: 'pos_mesero_01', puede_login: true, limite_conexiones: 3, rol_tipo: 'mesero' },
        { usuario: 'pos_mesero_02', puede_login: true, limite_conexiones: 3, rol_tipo: 'mesero' },
        { usuario: 'pos_reports', puede_login: true, limite_conexiones: 5, rol_tipo: 'readonly' },
        { usuario: 'pos_app', puede_login: true, limite_conexiones: 20, rol_tipo: 'app' }
      ];
      setUsuariosDB(usuariosDBSimulados);
    } catch (error) {
      mostrarMensaje('error', 'Error al cargar usuarios de base de datos');
    }
  }, [mostrarMensaje]);

  useEffect(() => {
    cargarUsuarios();
    cargarUsuariosDB();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const abrirDialogoNuevo = () => {
    setUsuarioEditando(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'cajero',
      activo: true
    });
    setOpenDialog(true);
  };

  const abrirDialogoEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      activo: usuario.activo
    });
    setOpenDialog(true);
  };

  const cerrarDialog = () => {
    setOpenDialog(false);
    setUsuarioEditando(null);
    setMostrarPassword(false);
  };

  const guardarUsuario = async () => {
    try {
      setLoading(true);
      
      if (usuarioEditando) {
        // Actualizar usuario existente
        const usuariosActualizados = usuarios.map(u => 
          u.id === usuarioEditando.id 
            ? { ...u, ...formData, permisos: roles.find(r => r.value === formData.rol)?.permisos || [] }
            : u
        );
        setUsuarios(usuariosActualizados);
        mostrarMensaje('success', 'Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        const nuevoUsuario: Usuario = {
          id: Math.max(...usuarios.map(u => u.id)) + 1,
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          limitesConexion: formData.rol === 'admin' ? 10 : formData.rol === 'gerente' ? 5 : 3,
          permisos: roles.find(r => r.value === formData.rol)?.permisos || []
        };
        setUsuarios([...usuarios, nuevoUsuario]);
        mostrarMensaje('success', 'Usuario creado correctamente');
      }
      
      cerrarDialog();
    } catch (error) {
      mostrarMensaje('error', 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const eliminarUsuario = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        setUsuarios(usuarios.filter(u => u.id !== id));
        mostrarMensaje('success', 'Usuario eliminado correctamente');
      } catch (error) {
        mostrarMensaje('error', 'Error al eliminar usuario');
      }
    }
  };

  const toggleUsuarioActivo = async (id: number) => {
    try {
      const usuariosActualizados = usuarios.map(u => 
        u.id === id ? { ...u, activo: !u.activo } : u
      );
      setUsuarios(usuariosActualizados);
      mostrarMensaje('success', 'Estado del usuario actualizado');
    } catch (error) {
      mostrarMensaje('error', 'Error al actualizar estado del usuario');
    }
  };

  const ejecutarOptimizacionDB = async () => {
    try {
      setLoading(true);
      mostrarMensaje('info', 'Ejecutando optimización de base de datos...');
      
      // Simular ejecución del script de optimización
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      mostrarMensaje('success', 'Optimización de base de datos completada');
      cargarUsuariosDB();
    } catch (error) {
      mostrarMensaje('error', 'Error en la optimización de base de datos');
    } finally {
      setLoading(false);
    }
  };

  const getRolColor = (rol: string) => {
    return roles.find(r => r.value === rol)?.color || '#666';
  };

  const getRolLabel = (rol: string) => {
    return roles.find(r => r.value === rol)?.label || rol;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon />
        Administración de Usuarios
      </Typography>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {usuarios.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Usuarios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {usuarios.filter(u => u.activo).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {usuariosDB.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios DB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {usuarios.filter(u => u.ultimoLogin && new Date(u.ultimoLogin) > new Date(Date.now() - 24*60*60*1000)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activos Hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usuarios de Aplicación */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Usuarios de Aplicación</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarUsuarios}
              sx={{ mr: 1 }}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirDialogoNuevo}
            >
              Nuevo Usuario
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Último Login</TableCell>
                <TableCell>Permisos</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.nombre}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRolLabel(usuario.rol)}
                      size="small"
                      sx={{ bgcolor: getRolColor(usuario.rol), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={usuario.activo}
                          onChange={() => toggleUsuarioActivo(usuario.id)}
                          size="small"
                        />
                      }
                      label={usuario.activo ? 'Activo' : 'Inactivo'}
                    />
                  </TableCell>
                  <TableCell>
                    {usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleString() : 'Nunca'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {usuario.permisos.slice(0, 2).map((permiso, index) => (
                        <Chip key={index} label={permiso} size="small" variant="outlined" />
                      ))}
                      {usuario.permisos.length > 2 && (
                        <Chip label={`+${usuario.permisos.length - 2}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => abrirDialogoEditar(usuario)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        onClick={() => eliminarUsuario(usuario.id)} 
                        size="small"
                        color="error"
                        disabled={usuario.rol === 'admin'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Usuarios de Base de Datos */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Usuarios de Base de Datos PostgreSQL</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<StorageIcon />}
              onClick={() => setOpenDBDialog(true)}
              sx={{ mr: 1 }}
            >
              Ver Detalles
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={ejecutarOptimizacionDB}
              disabled={loading}
            >
              Optimizar DB
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Puede Login</TableCell>
                <TableCell>Límite Conexiones</TableCell>
                <TableCell>Tipo de Rol</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosDB.map((usuario, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {usuario.usuario}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.puede_login ? 'Sí' : 'No'}
                      size="small"
                      color={usuario.puede_login ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>{usuario.limite_conexiones}</TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.rol_tipo}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label="Configurado"
                      size="small"
                      color="success"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para crear/editar usuario */}
      <Dialog open={openDialog} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={mostrarPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setMostrarPassword(!mostrarPassword)}>
                    {mostrarPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
              helperText={usuarioEditando ? 'Dejar vacío para mantener contraseña actual' : ''}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                label="Rol"
              >
                {roles.map((rol) => (
                  <MenuItem key={rol.value} value={rol.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: rol.color
                        }}
                      />
                      {rol.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                />
              }
              label="Usuario activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button onClick={guardarUsuario} variant="contained" disabled={loading}>
            {usuarioEditando ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para detalles de usuarios DB */}
      <Dialog open={openDBDialog} onClose={() => setOpenDBDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles de Usuarios de Base de Datos</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Usuarios configurados en PostgreSQL con diferentes niveles de acceso
          </Typography>
          
          {rolesDB.map((tipo, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {tipo.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tipo.descripcion}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', mt: 1, display: 'block' }}>
                Usuario: {tipo.value}_01
              </Typography>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDBDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsuarios; 