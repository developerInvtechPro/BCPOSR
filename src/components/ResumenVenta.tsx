import { Box, Typography, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

interface ProductoVenta {
  nombre: string;
  cantidad: number;
}

interface ResumenVentaProps {
  carrito: ProductoVenta[];
  onSumar: (nombre: string) => void;
  onRestar: (nombre: string) => void;
  onEliminar: (nombre: string) => void;
}

export default function ResumenVenta({ carrito, onSumar, onRestar, onEliminar }: ResumenVentaProps) {
  const total = carrito.reduce((acc, prod) => acc + prod.cantidad * 100, 0); // Precio fijo de ejemplo
  return (
    <Box sx={{ bgcolor: '#23272b', borderRadius: 2, p: 2.5, color: '#fff', minHeight: 260, boxShadow: '0 2px 8px #0002' }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#2e7c8a' }}>
        Resumen de Venta
      </Typography>
      <Divider sx={{ mb: 2, borderColor: '#418892' }} />
      <List dense>
        {carrito.map((prod) => (
          <ListItem key={prod.nombre} sx={{ py: 0.5, display: 'flex', alignItems: 'center' }}
            secondaryAction={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => onRestar(prod.nombre)}><RemoveIcon fontSize="small" /></IconButton>
                <Typography fontWeight={600} color="#fff">{prod.cantidad}</Typography>
                <IconButton size="small" onClick={() => onSumar(prod.nombre)}><AddIcon fontSize="small" /></IconButton>
                <Typography sx={{ minWidth: 60, textAlign: 'right', ml: 2 }} color="#fff">$ {prod.cantidad * 100}</Typography>
                <IconButton size="small" color="error" onClick={() => onEliminar(prod.nombre)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            }
          >
            <ListItemText primary={prod.nombre} primaryTypographyProps={{ color: '#fff' }} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1, borderColor: '#418892' }} />
      <Typography variant="h6" sx={{ color: '#2e7c8a' }}>TOTAL A PAGAR: <b style={{ color: '#fff' }}>$ {total.toFixed(2)}</b></Typography>
    </Box>
  );
} 