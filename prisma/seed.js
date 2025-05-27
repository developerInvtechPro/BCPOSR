const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales...');

  // Crear usuarios iniciales
  const adminPassword = await bcrypt.hash('admin123', 10);
  const gerentePassword = await bcrypt.hash('gerente123', 10);
  const cajeroPassword = await bcrypt.hash('cajero123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@poshonduras.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@poshonduras.com',
      password: adminPassword,
      rol: 'admin',
    },
  });

  const gerente = await prisma.usuario.upsert({
    where: { email: 'gerente@poshonduras.com' },
    update: {},
    create: {
      nombre: 'Gerente Demo',
      email: 'gerente@poshonduras.com',
      password: gerentePassword,
      rol: 'gerente',
    },
  });

  const cajero = await prisma.usuario.upsert({
    where: { email: 'cajero@poshonduras.com' },
    update: {},
    create: {
      nombre: 'Cajero Demo',
      email: 'cajero@poshonduras.com',
      password: cajeroPassword,
      rol: 'cajero',
    },
  });

  // Crear mesas
  const mesas = [];
  for (let i = 1; i <= 20; i++) {
    const mesa = await prisma.mesa.upsert({
      where: { numero: i },
      update: {},
      create: {
        numero: i,
        capacidad: i <= 10 ? 4 : i <= 15 ? 6 : 8,
        estado: 'libre',
      },
    });
    mesas.push(mesa);
  }

  // Crear categorías de productos
  const categorias = [
    'Bebidas Calientes',
    'Bebidas Frías', 
    'Desayunos',
    'Almuerzos',
    'Cenas',
    'Postres',
    'Aperitivos',
    'Ensaladas',
    'Carnes',
    'Mariscos',
    'Pastas',
    'Pizzas'
  ];

  // Crear productos de ejemplo
  const productos = [
    // Bebidas Calientes
    { codigo: 'BEB001', nombre: 'Café Americano', precio: 45.00, categoria: 'Bebidas Calientes' },
    { codigo: 'BEB002', nombre: 'Café con Leche', precio: 55.00, categoria: 'Bebidas Calientes' },
    { codigo: 'BEB003', nombre: 'Cappuccino', precio: 65.00, categoria: 'Bebidas Calientes' },
    { codigo: 'BEB004', nombre: 'Té Verde', precio: 40.00, categoria: 'Bebidas Calientes' },
    
    // Bebidas Frías
    { codigo: 'BEB005', nombre: 'Coca Cola', precio: 35.00, categoria: 'Bebidas Frías' },
    { codigo: 'BEB006', nombre: 'Agua Natural', precio: 25.00, categoria: 'Bebidas Frías' },
    { codigo: 'BEB007', nombre: 'Jugo de Naranja', precio: 50.00, categoria: 'Bebidas Frías' },
    { codigo: 'BEB008', nombre: 'Cerveza Nacional', precio: 45.00, categoria: 'Bebidas Frías' },
    
    // Desayunos
    { codigo: 'DES001', nombre: 'Desayuno Típico', precio: 120.00, categoria: 'Desayunos' },
    { codigo: 'DES002', nombre: 'Huevos Rancheros', precio: 95.00, categoria: 'Desayunos' },
    { codigo: 'DES003', nombre: 'Pancakes', precio: 85.00, categoria: 'Desayunos' },
    { codigo: 'DES004', nombre: 'Tostadas Francesas', precio: 75.00, categoria: 'Desayunos' },
    
    // Almuerzos
    { codigo: 'ALM001', nombre: 'Pollo Chuco', precio: 150.00, categoria: 'Almuerzos' },
    { codigo: 'ALM002', nombre: 'Carne Asada', precio: 180.00, categoria: 'Almuerzos' },
    { codigo: 'ALM003', nombre: 'Pescado Frito', precio: 160.00, categoria: 'Almuerzos' },
    { codigo: 'ALM004', nombre: 'Baleadas', precio: 45.00, categoria: 'Almuerzos' },
    
    // Postres
    { codigo: 'POS001', nombre: 'Tres Leches', precio: 65.00, categoria: 'Postres' },
    { codigo: 'POS002', nombre: 'Flan', precio: 55.00, categoria: 'Postres' },
    { codigo: 'POS003', nombre: 'Helado', precio: 40.00, categoria: 'Postres' },
    
    // Aperitivos
    { codigo: 'APE001', nombre: 'Nachos', precio: 85.00, categoria: 'Aperitivos' },
    { codigo: 'APE002', nombre: 'Alitas Buffalo', precio: 95.00, categoria: 'Aperitivos' },
    { codigo: 'APE003', nombre: 'Quesadillas', precio: 75.00, categoria: 'Aperitivos' }
  ];

  for (const producto of productos) {
    await prisma.producto.upsert({
      where: { codigo: producto.codigo },
      update: {},
      create: {
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: `Deliciosa ${producto.nombre.toLowerCase()} preparada con ingredientes frescos`,
        precio: producto.precio,
        categoria: producto.categoria,
      },
    });
  }

  // Configuración inicial
  const configuraciones = [
    { clave: 'nombre_restaurante', valor: 'Restaurante Honduras', tipo: 'string' },
    { clave: 'direccion', valor: 'Tegucigalpa, Honduras', tipo: 'string' },
    { clave: 'telefono', valor: '+504 2222-3333', tipo: 'string' },
    { clave: 'rtn', valor: '08019999999999', tipo: 'string' },
    { clave: 'tasa_impuesto', valor: '0.15', tipo: 'number' },
    { clave: 'moneda', valor: 'HNL', tipo: 'string' },
    { clave: 'simbolo_moneda', valor: 'L', tipo: 'string' },
    { clave: 'backup_automatico', valor: 'false', tipo: 'boolean' },
    { clave: 'servicio_backup', valor: 'ninguno', tipo: 'string' }
  ];

  for (const config of configuraciones) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: {},
      create: config,
    });
  }

  console.log('✅ Datos iniciales sembrados exitosamente');
  console.log(`👤 Admin: admin@poshonduras.com / admin123`);
  console.log(`👨‍💼 Gerente: gerente@poshonduras.com / gerente123`);
  console.log(`💰 Cajero: cajero@poshonduras.com / cajero123`);
  console.log(`🍽️ ${productos.length} productos creados`);
  console.log(`🪑 ${mesas.length} mesas creadas`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 