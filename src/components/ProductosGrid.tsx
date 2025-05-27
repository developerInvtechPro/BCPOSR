import { Grid, Card, CardActionArea, Typography } from '@mui/material';

const productosPorCategoria: Record<string, string[]> = {
  'HAMBURGUESAS': [
    'ROKO BURGUER ORIGINAL', 'CHICKEN GUACAMOLE', 'CHORIBURGER', 'CHICKEN BUFALO', 'CHICKEN CHIPOTLE', 'CHICKEN JALAPEÑO', 'HONEY CHIPOTLE', 'SWEET ASIAN', 'CABRO LOCO', 'RACH O JALAPEÑO'
  ],
  'COMPLEMENTOS': [
    'BONLES', 'FINGERS', 'PLATTER JR', 'PLATTER GRANDE', 'ORDEN DE PAPAS', 'PAPAS PREPARADAS', 'EMPAQUE', 'EXTRA SALSA'
  ],
  'BEBIDAS NATURALES': [
    'FANTA', 'TAMARINDO', 'JAMAICA', 'NANCE', 'HORCHATA'
  ],
  'GASEOSAS': [
    'COCA COLA', 'PEPSI', 'SPRITE', 'SEVEN UP'
  ],
  'POSTRES': [
    'PASTEL DE CHOCOLATE', 'FLAN', 'CHEESECAKE'
  ],
  'ADICIONALES': [
    'EXTRA QUESO', 'EXTRA CARNE', 'EXTRA SALSA'
  ]
};

interface ProductosGridProps {
  categoria: string;
  onAgregar: (nombre: string) => void;
}

export default function ProductosGrid({ categoria, onAgregar }: ProductosGridProps) {
  const productos = productosPorCategoria[categoria] || [];
  return (
    <Grid container spacing={1.5}>
      {productos.map((producto) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={producto}>
          <Card sx={{ bgcolor: '#2e7c8a', color: '#fff', borderRadius: 1.5, minHeight: 70, boxShadow: '0 2px 8px #0002', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardActionArea sx={{ height: '100%', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => onAgregar(producto)}>
              <Typography align="center" fontWeight={700} fontSize={15} sx={{ width: '100%' }}>
                {producto}
              </Typography>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
} 