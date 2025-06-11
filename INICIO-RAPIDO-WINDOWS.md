# 🚀 Inicio Rápido - Windows

## ⚡ Instalación Automática (Recomendado)

### Opción 1: Script Batch (.bat)
1. Descarga el proyecto
2. Haz doble clic en `install-windows.bat`
3. Sigue las instrucciones en pantalla

### Opción 2: Script PowerShell (.ps1)
1. Abre PowerShell como Administrador
2. Ejecuta: `PowerShell -ExecutionPolicy Bypass -File install-windows.ps1`

## 📋 Instalación Manual

### 1. Instalar Requisitos
```cmd
# Descargar e instalar Node.js LTS desde:
https://nodejs.org/

# Descargar e instalar Git desde:
https://git-scm.com/download/win
```

### 2. Descargar Proyecto
```cmd
git clone https://github.com/TU_USUARIO/sistema-pos-honduras.git
cd sistema-pos-honduras
```

### 3. Instalar y Ejecutar
```cmd
npm install
npm run dev
```

## 🌐 Acceder al Sistema

Abre tu navegador en: **http://localhost:3000**

## 🔧 Comandos Útiles

```cmd
# Iniciar servidor
npm run dev

# Reinicio limpio
npm run bc:restart

# Construir para producción
npm run build

# Iniciar producción
npm run start
```

## 🛠️ Solución Rápida de Problemas

### Puerto ocupado
```cmd
# Usar otro puerto
npm run dev -- -p 3001

# O matar proceso
netstat -ano | findstr :3000
taskkill /PID [NUMERO] /F
```

### Error de dependencias
```cmd
# Limpiar e instalar
rmdir /s node_modules
del package-lock.json
npm install
```

### Error de cache
```cmd
# Limpiar cache
rmdir /s .next
npm run dev
```

## 📱 Acceso desde Otros Dispositivos

1. Encuentra tu IP:
   ```cmd
   ipconfig
   ```

2. Otros dispositivos: `http://TU_IP:3000`

## ⚙️ Configuración Business Central

1. Ve a **SUPER** → **Business Central**
2. Ingresa tus credenciales de Azure
3. Haz clic en **🧪 Test Tipo Postman**

## 🎯 ¡Listo para Usar!

Tu sistema POS está funcionando en Windows. 

**Próximos pasos:**
- Configurar productos y menú
- Configurar mesas del restaurante
- Entrenar al personal
- Configurar impresoras (opcional) 