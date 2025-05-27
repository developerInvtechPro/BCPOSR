import { ReactNode } from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';

const clientes = [
  'CONSUMIDOR FINAL',
  'CLIENTE RTN',
  'CLIENTE CRÉDITO',
  'CLIENTE LEAL',
];

const categorias = [
  'HAMBURGUESAS',
  'COMPLEMENTOS',
  'BEBIDAS NATURALES',
  'GASEOSAS',
  'POSTRES',
  'ADICIONALES',
];

interface LayoutPOSProps {
  children: ReactNode;
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (cat: string) => void;
}

export default function LayoutPOS({ children, categoriaSeleccionada, setCategoriaSeleccionada }: LayoutPOSProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#23272b' }}>
      {/* Barra superior */}
      <AppBar position="static" sx={{ bgcolor: '#181b1f', boxShadow: 'none', minHeight: 60 }}>
        <Toolbar sx={{ minHeight: 60 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: '#fff' }}>
            Punto de Venta - Business Central
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Fila de clientes */}
      <Box sx={{ bgcolor: '#23272b', p: 1, display: 'flex', gap: 2, justifyContent: 'center', borderBottom: '2px solid #418892' }}>
        {clientes.map((cliente) => (
          <Button
            key={cliente}
            sx={{
              bgcolor: '#2e7c8a',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              minWidth: 150,
              minHeight: 40,
              textTransform: 'none',
              boxShadow: 'none',
              border: '2px solid #23272b',
            }}
          >
            {cliente}
          </Button>
        ))}
      </Box>
      {/* Fila de categorías */}
      <Box sx={{ bgcolor: '#23272b', p: 1, display: 'flex', gap: 2, borderBottom: '4px solid #418892', justifyContent: 'center' }}>
        {categorias.map((cat) => (
          <Button
            key={cat}
            onClick={() => setCategoriaSeleccionada(cat)}
            sx={{
              bgcolor: categoriaSeleccionada === cat ? '#418892' : '#2e7c8a',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              minWidth: 150,
              minHeight: 40,
              boxShadow: categoriaSeleccionada === cat ? '0 2px 8px #41889255' : 'none',
              border: categoriaSeleccionada === cat ? '2px solid #fff' : '2px solid #23272b',
              textTransform: 'none',
            }}
          >
            {cat}
          </Button>
        ))}
      </Box>
      {/* Contenido principal */}
      <Box sx={{ p: 2 }}>{children}</Box>
      {/* Pie de página */}
      <Box sx={{ bgcolor: '#181b1f', p: 1, mt: 2, borderTop: '2px solid #418892', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="#fff">
          Sucursal: 012 | Terminal: 03 | Usuario: TEST | Turno: 1 | Fecha: 2025-03-22
        </Typography>
        <Typography variant="body2" color="#fff">
          V1.1
        </Typography>
      </Box>
    </Box>
  );
} 