# 🏪 Sistema POS Honduras - Business Central Integration

Sistema de Punto de Venta completo para restaurantes en Honduras con integración a Microsoft Business Central.

## 🚀 Características Principales

### 💼 Gestión de Ventas
- **Punto de Venta Completo**: Interfaz moderna y intuitiva
- **Gestión de Mesas**: Control de ocupación y reservas
- **Múltiples Tipos de Cliente**: RTN, Crédito, Final
- **Facturación Electrónica**: Integración con SAR Honduras

### 🔗 Integración Business Central
- **Sincronización en Tiempo Real**: Productos, inventario y ventas
- **OAuth 2.0**: Autenticación segura con Microsoft
- **API REST**: Comunicación bidireccional con Business Central
- **Configuración Multi-Empresa**: Soporte para múltiples compañías

### 📊 Gestión Operativa
- **Control de Almacenes**: Múltiples sucursales y ubicaciones
- **Cierre de Turno**: Validación con ERP y reportes
- **Backup Automático**: Google Drive y OneDrive
- **Reportes y Estadísticas**: Dashboard en tiempo real

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **UI Framework**: Material-UI (MUI)
- **Base de Datos**: Prisma ORM
- **Integración**: Microsoft Business Central API
- **Deployment**: Docker, PM2
- **Cloud Backup**: rclone (Google Drive/OneDrive)

## 📦 Instalación

### 🪟 Instalación en Windows (Recomendado)

#### Instalación Automática
1. **Descarga el proyecto** desde GitHub
2. **Ejecuta el instalador**:
   - Doble clic en `install-windows.bat` (Command Prompt)
   - O ejecuta `install-windows.ps1` en PowerShell como Administrador
3. **Sigue las instrucciones** en pantalla
4. **Accede al sistema** en `http://localhost:3000`

#### Instalación Manual en Windows
```cmd
# 1. Instalar Node.js LTS desde: https://nodejs.org/
# 2. Instalar Git desde: https://git-scm.com/download/win

# 3. Clonar repositorio
git clone https://github.com/tu-usuario/sistema-pos-honduras.git
cd sistema-pos-honduras

# 4. Instalar dependencias
npm install

# 5. Ejecutar sistema
npm run dev
```

📖 **Guía completa**: Ver [INSTALACION-WINDOWS.md](INSTALACION-WINDOWS.md)  
⚡ **Inicio rápido**: Ver [INICIO-RAPIDO-WINDOWS.md](INICIO-RAPIDO-WINDOWS.md)

### 🐧 Instalación Linux/Mac

#### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

#### Instalación Rápida
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/facturacion-app.git
cd facturacion-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

### 🐳 Instalación con Docker
```bash
# Construir imagen
docker build -t pos-honduras .

# Ejecutar contenedor
docker-compose up -d
```

## ⚙️ Configuración

### Business Central
1. Crear aplicación en Azure AD
2. Configurar permisos para Business Central API
3. Obtener Client ID, Client Secret y Tenant ID
4. Configurar en el panel SUPER del sistema

### Variables de Entorno
```env
# Business Central
BC_TENANT_ID=tu-tenant-id
BC_CLIENT_ID=tu-client-id
BC_CLIENT_SECRET=tu-client-secret
BC_ENVIRONMENT=production

# Base de Datos
DATABASE_URL="postgresql://..."

# Backup
GOOGLE_DRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_ID=
```

## 🚀 Uso

### Acceso al Sistema
1. Abrir `http://localhost:3000`
2. Configurar almacenes y sucursales
3. Conectar con Business Central
4. Comenzar a operar

### Panel SUPER
- **Business Central**: Configuración y pruebas de conexión
- **Sistema**: Mantenimiento y configuraciones
- **Estadísticas**: Reportes y métricas

### Funcionalidades Principales
- **Gestión de Pedidos**: Crear, modificar y facturar
- **Control de Mesas**: Estados y reservas
- **Productos**: Catálogo sincronizado con BC
- **Clientes**: RTN y crédito
- **Reportes**: Ventas y estadísticas

## 📁 Estructura del Proyecto

```
facturacion-app/
├── src/
│   ├── pages/           # Páginas Next.js
│   ├── components/      # Componentes React
│   └── services/        # Servicios y APIs
├── scripts/             # Scripts de utilidad
├── docs/               # Documentación
├── prisma/             # Esquemas de base de datos
└── docker/             # Configuración Docker
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Construir para producción
npm run start           # Servidor de producción

# Business Central
npm run bc:test         # Probar conexión BC
npm run bc:sync         # Sincronizar datos
npm run bc:restart      # Reinicio limpio

# Backup
npm run backup:setup    # Configurar backup
npm run backup:manual   # Backup manual
```

## 📚 Documentación

- [Integración Business Central](docs/business-central-integration.md)
- [Configuración de Backup](docs/backup-configuration.md)
- [Troubleshooting](docs/troubleshooting.md)
- [API Reference](docs/api-reference.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/facturacion-app/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/facturacion-app/wiki)
- **Email**: solmer@example.com

## 🏆 Características Destacadas

### ✅ Sistema Completo
- ✅ POS funcional y moderno
- ✅ Integración Business Central
- ✅ Backup automático
- ✅ Multi-sucursal
- ✅ Facturación electrónica

### 🔄 En Desarrollo
- 🔄 App móvil
- 🔄 Reportes avanzados
- 🔄 Integración WhatsApp
- 🔄 Dashboard analytics

---

**Desarrollado con ❤️ para restaurantes en Honduras** 