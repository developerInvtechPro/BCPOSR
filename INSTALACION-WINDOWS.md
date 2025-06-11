# 🪟 Instalación del Sistema POS en Windows

## 📋 Requisitos Previos

### 1. Node.js (Versión 18 o superior)
1. Ve a https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador y sigue las instrucciones
4. **IMPORTANTE**: Marca la casilla "Add to PATH" durante la instalación

### 2. Git para Windows
1. Ve a https://git-scm.com/download/win
2. Descarga e instala Git
3. Durante la instalación, selecciona "Git from the command line and also from 3rd-party software"

### 3. Editor de Código (Opcional pero recomendado)
- **Visual Studio Code**: https://code.visualstudio.com/
- **Notepad++**: https://notepad-plus-plus.org/

## 🚀 Instalación Paso a Paso

### Paso 1: Verificar Instalaciones
Abre **Command Prompt** (cmd) o **PowerShell** y ejecuta:

```cmd
node --version
npm --version
git --version
```

Deberías ver las versiones instaladas. Si algún comando no funciona, reinstala ese componente.

### Paso 2: Descargar el Proyecto

#### Opción A: Desde GitHub (Recomendado)
```cmd
git clone https://github.com/TU_USUARIO/sistema-pos-honduras.git
cd sistema-pos-honduras
```

#### Opción B: Descarga Manual
1. Ve al repositorio en GitHub
2. Clic en "Code" → "Download ZIP"
3. Extrae el archivo en una carpeta (ej: `C:\pos-sistema\`)
4. Abre Command Prompt en esa carpeta

### Paso 3: Instalar Dependencias
```cmd
npm install
```

**Si hay errores**, prueba:
```cmd
npm install --force
```

### Paso 4: Configurar Variables de Entorno (Opcional)
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Business Central Configuration
BC_TENANT_ID=tu-tenant-id
BC_CLIENT_ID=tu-client-id
BC_CLIENT_SECRET=tu-client-secret
BC_ENVIRONMENT=Production
BC_COMPANY_ID=tu-company-id

# Database (si usas una)
DATABASE_URL=tu-database-url

# Puerto personalizado (opcional)
PORT=3000
```

### Paso 5: Iniciar el Sistema
```cmd
npm run dev
```

El sistema estará disponible en: **http://localhost:3000**

## 🍽️ Comanda Digital para Cocina

### ¿Qué es la Comanda Digital?
Una pantalla especializada para la cocina que muestra todos los pedidos en tiempo real, permitiendo gestionar eficientemente la preparación de alimentos.

### Cómo Acceder
1. **Desde el Sistema Principal**: Busca el botón **"COMANDA COCINA"** en la interfaz
2. **URL Directa**: `http://localhost:3000/comanda`
3. **Pantalla Dedicada**: Ideal para tablet o monitor en la cocina

### Características
- ✅ **Estados de Pedidos**: Pendiente → En Preparación → Listo → Entregado
- ✅ **Tiempo Real**: Actualización automática cada segundo
- ✅ **Alertas Sonoras**: Notificaciones para nuevos pedidos y pedidos listos
- ✅ **Filtros**: Ver pedidos por estado
- ✅ **Impresión**: Comandas optimizadas para cocina
- ✅ **Prioridades**: Urgente, Alta, Normal con colores distintivos

## 🔧 Scripts Disponibles

### Desarrollo
```cmd
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción
npm run bc:restart   # Reinicio limpio del servidor
```

### Mantenimiento
```cmd
npm run lint         # Verifica código
npm run type-check   # Verifica tipos TypeScript
```

## 🛠️ Solución de Problemas Comunes

### Error: "node no se reconoce como comando"
**Solución:**
1. Reinstala Node.js
2. Asegúrate de marcar "Add to PATH"
3. Reinicia Command Prompt
4. Si persiste, agrega manualmente a PATH:
   - `C:\Program Files\nodejs\`

### Error: "npm install" falla
**Soluciones:**
```cmd
# Limpiar cache
npm cache clean --force

# Instalar con permisos de administrador
npm install --force

# Usar yarn como alternativa
npm install -g yarn
yarn install
```

### Error: Puerto 3000 en uso
**Soluciones:**
```cmd
# Usar otro puerto
npm run dev -- -p 3001

# O matar procesos en puerto 3000
netstat -ano | findstr :3000
taskkill /PID [NUMERO_PID] /F
```

### Error: "Cannot find module"
**Solución:**
```cmd
# Eliminar node_modules y reinstalar
rmdir /s node_modules
del package-lock.json
npm install
```

### La Comanda no carga
**Soluciones:**
```cmd
# Limpiar cache y reiniciar
rmdir /s .next
npm run dev

# Verificar puerto
# La comanda está en: http://localhost:PUERTO/comanda
```

## 🔒 Configuración de Business Central

### 1. Obtener Credenciales
1. Ve al **Azure Portal** (portal.azure.com)
2. Registra una nueva aplicación
3. Obtén: Tenant ID, Client ID, Client Secret
4. Configura permisos para Business Central API

### 2. Configurar en el Sistema
1. Abre el sistema POS
2. Ve a **SUPER** → **Business Central**
3. Ingresa las credenciales obtenidas
4. Haz clic en **🧪 Test Tipo Postman** para probar

## 📁 Estructura de Archivos

```
sistema-pos-honduras/
├── src/
│   ├── pages/           # Páginas de la aplicación
│   │   ├── index.tsx    # Sistema POS principal
│   │   └── comanda.tsx  # Comanda digital para cocina
│   ├── components/      # Componentes reutilizables
│   │   └── ComandaCocina.tsx  # Componente de comanda
│   ├── hooks/           # Hooks personalizados
│   │   └── useComanda.ts      # Hook para gestión de comanda
│   └── styles/          # Estilos CSS
├── public/              # Archivos estáticos
├── scripts/             # Scripts de utilidad
├── .env.local           # Variables de entorno (crear)
├── package.json         # Dependencias del proyecto
├── GUIA-COMANDA-DIGITAL.md    # Guía completa de la comanda
└── README.md           # Documentación principal
```

## 🌐 Acceso desde Otros Dispositivos

### En la Misma Red
1. Encuentra tu IP local:
   ```cmd
   ipconfig
   ```
2. Busca "IPv4 Address" (ej: 192.168.1.100)
3. Otros dispositivos pueden acceder via: `http://192.168.1.100:3000`
4. **Comanda en tablet**: `http://192.168.1.100:3000/comanda`

### Configurar Firewall
1. Abre **Windows Defender Firewall**
2. Clic en "Allow an app through firewall"
3. Agrega Node.js si no está listado

## 🔄 Actualización del Sistema

```cmd
# Detener servidor (Ctrl+C)
git pull origin main     # Si usas Git
npm install             # Instalar nuevas dependencias
npm run dev             # Reiniciar servidor
```

## 📞 Soporte

### Logs del Sistema
Los logs se encuentran en:
- Console del navegador (F12)
- Terminal donde ejecutas `npm run dev`

### Información del Sistema
Para reportar problemas, incluye:
- Versión de Windows
- Versión de Node.js (`node --version`)
- Mensaje de error completo
- Pasos para reproducir el problema

## 🎯 Próximos Pasos

1. **Configurar Business Central** con tus credenciales
2. **Personalizar menú** y productos según tu restaurante
3. **Configurar comanda** en tablet o monitor dedicado para cocina
4. **Configurar backup automático** (Google Drive/OneDrive)
5. **Entrenar personal** en el uso del sistema y comanda
6. **Configurar impresoras** para tickets y facturas

---

## 📋 Lista de Verificación Post-Instalación

- [ ] Node.js instalado y funcionando
- [ ] Sistema POS ejecutándose en http://localhost:3000
- [ ] **Comanda digital funcionando** en http://localhost:3000/comanda
- [ ] Business Central configurado y probado
- [ ] Productos y menú configurados
- [ ] Mesas configuradas según tu restaurante
- [ ] **Tablet/monitor configurado** para comanda de cocina
- [ ] Usuarios creados para el personal
- [ ] **Personal de cocina entrenado** en uso de comanda
- [ ] Backup automático configurado
- [ ] Impresoras configuradas (si aplica)
- [ ] Personal entrenado en el uso del sistema

¡Tu Sistema POS con Comanda Digital está listo para usar! 🎉 