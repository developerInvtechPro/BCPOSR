# 🚀 INSTALADOR - Sistema POS con Business Central

Sistema completo de punto de venta integrado con Microsoft Business Central para Honduras.

## 📋 Requisitos Previos

### Windows
- Windows 10/11
- 4GB RAM mínimo (8GB recomendado)
- 2GB espacio libre en disco

### macOS
- macOS 10.15 o superior
- 4GB RAM mínimo (8GB recomendado)
- 2GB espacio libre en disco

### Linux (Ubuntu/Debian)
- Ubuntu 18.04+ o Debian 10+
- 4GB RAM mínimo (8GB recomendado)
- 2GB espacio libre en disco

## 🔧 Instalación Automática

### Para Windows

1. **Descargar e instalar prerequisitos:**
   ```batch
   # Ejecutar install-windows.bat
   install-windows.bat
   ```

2. **O instalación manual:**
   - Node.js LTS: https://nodejs.org/
   - Git: https://git-scm.com/download/win

### Para macOS/Linux

1. **Ejecutar instalador automático:**
   ```bash
   chmod +x install-pos.sh
   ./install-pos.sh
   ```

## 📱 Instalación Manual Paso a Paso

### 1. Instalar Node.js

**Windows:**
- Ir a https://nodejs.org/
- Descargar LTS (18.x o superior)
- Ejecutar instalador

**macOS:**
```bash
# Con Homebrew
brew install node@18

# O descargar de https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clonar/Descargar Proyecto

```bash
# Opción 1: Si tienes el proyecto en GitHub
git clone https://github.com/tu-usuario/pos-business-central.git
cd pos-business-central

# Opción 2: Si tienes el archivo ZIP
# Extraer facturacion-app.zip
cd facturacion-app
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Variables de Entorno

Crear archivo `.env.local`:

```env
# Business Central Configuration
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/pos_db"

# Puerto personalizado (opcional)
PORT=3000
```

### 5. Inicializar Base de Datos

```bash
# Instalar PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt install postgresql postgresql-contrib

# Configurar base de datos
npx prisma generate
npx prisma db push
```

### 6. Iniciar Aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🌐 Acceso al Sistema

- **URL Local:** http://localhost:3000
- **Red Local:** http://[IP-LOCAL]:3000

## ⚙️ Configuración de Business Central

### 1. Acceder al Panel SUPER

1. Ir a http://localhost:3000
2. Hacer clic en **"⚙️ SUPER"** (esquina superior derecha)
3. Ir a pestaña **"🔗 Business Central"**

### 2. Configuración Pre-cargada

Los datos ya están configurados:
- ✅ **Tenant ID:** 0b48b68c-f813-4060-844f-2079fe72f87c
- ✅ **Company ID:** 88a8517e-4be2-ef11-9345-002248e0e739
- ✅ **Client ID:** 570853f4-2ca4-4dce-a433-a5322fa215fa
- ✅ **Environment:** SB110225

### 3. Probar Conexión

1. Hacer clic en **"🔍 Probar Conexión"**
2. Para análisis detallado: **"🧪 Test Tipo Postman"**

## 🔄 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot-reload

# Producción
npm run build        # Construir aplicación optimizada
npm start           # Iniciar servidor de producción

# Base de datos
npm run db:generate  # Generar cliente Prisma
npm run db:push     # Aplicar cambios al esquema
npm run db:migrate  # Crear migración
npm run db:studio   # Abrir interfaz visual de BD

# Utilidades
npm run lint        # Verificar código
npm run type-check  # Verificar tipos TypeScript
```

## 🛠️ Características Incluidas

### ✅ Sistema POS Completo
- 🛒 Gestión de ventas
- 📄 Pre-cuentas (formato listing)
- 🖨️ Impresión térmica optimizada
- 💰 Múltiples formas de pago
- 📊 Reportes básicos

### ✅ Integración Business Central
- 🔗 Conexión OAuth 2.0
- 📦 Sincronización de productos
- 👥 Gestión de clientes
- 📈 Reportes empresariales
- 🧪 Herramientas de testing

### ✅ Base de Datos Local
- 🗄️ PostgreSQL con Prisma
- 📝 Gestión de inventario
- 📋 Histórico de transacciones
- 🔄 Sincronización bidireccional

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Limpiar e instalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"
```bash
# Cambiar puerto en .env.local
PORT=3001

# O detener proceso en puerto 3000
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -ti:3000 | xargs kill
```

### Error de conexión Business Central
1. Verificar credenciales en SUPER → Business Central
2. Verificar conexión a internet
3. Ejecutar "Test Tipo Postman" para diagnóstico

### Error de base de datos
```bash
# Reinicializar base de datos
npx prisma db push --force-reset
```

## 📞 Soporte Técnico

### Logs del Sistema
```bash
# Ver logs en tiempo real
npm run dev > logs/app.log 2>&1

# En producción con PM2
pm2 logs
```

### Información del Sistema
- **Versión Node.js:** `node --version`
- **Versión npm:** `npm --version`
- **Sistema Operativo:** Verificar con instalador

### Contacto
- **Documentación:** Ver archivos `/docs`
- **Issues:** Reportar problemas técnicos
- **Business Central:** Ver troubleshooting en `/docs`

## 🔐 Seguridad

### Variables Sensibles
- ❌ **NO** commitear archivos `.env*`
- ✅ Usar variables de entorno en producción
- 🔒 Rotar Client Secrets periódicamente

### Backup Automático
```bash
# Ejecutar script de backup
./backup.sh

# Configurar backup automático
# Se configura durante la instalación
```

---

## 🎉 ¡Sistema Listo!

Una vez completada la instalación:

1. **Ir a:** http://localhost:3000
2. **Probar función de cuentas:** Agregar productos → "📄 CUENTA"
3. **Configurar Business Central:** ⚙️ SUPER → 🔗 Business Central
4. **Ejecutar pruebas:** 🧪 Test Tipo Postman

**¡El Sistema POS con Business Central está listo para usar!** 🚀 