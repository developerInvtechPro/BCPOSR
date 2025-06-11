@echo off
chcp 65001 >nul
echo.
echo ===============================================
echo 🪟 INSTALADOR AUTOMÁTICO - SISTEMA POS HONDURAS
echo ===============================================
echo.

:: Verificar si Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 Descargando Node.js...
    echo Ve a: https://nodejs.org/
    echo Descarga la versión LTS y ejecuta el instalador
    echo Luego ejecuta este script nuevamente
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado
    node --version
)

:: Verificar si Git está instalado
echo.
echo 🔍 Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git no está instalado
    echo.
    echo 📥 Descargando Git...
    echo Ve a: https://git-scm.com/download/win
    echo Descarga e instala Git para Windows
    echo Luego ejecuta este script nuevamente
    pause
    exit /b 1
) else (
    echo ✅ Git encontrado
    git --version
)

echo.
echo 🚀 Iniciando instalación...
echo.

:: Instalar dependencias
echo 📦 Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Error en npm install, intentando con --force...
    npm install --force
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependencias instaladas correctamente

:: Crear archivo .env.local si no existe
if not exist ".env.local" (
    echo.
    echo 📝 Creando archivo de configuración...
    (
        echo # Business Central Configuration
        echo BC_TENANT_ID=tu-tenant-id
        echo BC_CLIENT_ID=tu-client-id
        echo BC_CLIENT_SECRET=tu-client-secret
        echo BC_ENVIRONMENT=Production
        echo BC_COMPANY_ID=tu-company-id
        echo.
        echo # Puerto personalizado ^(opcional^)
        echo PORT=3000
    ) > .env.local
    echo ✅ Archivo .env.local creado
)

:: Limpiar cache si existe
if exist ".next" (
    echo.
    echo 🧹 Limpiando cache anterior...
    rmdir /s /q .next
)

echo.
echo ===============================================
echo 🎉 INSTALACIÓN COMPLETADA
echo ===============================================
echo.
echo 📋 Próximos pasos:
echo.
echo 1. Ejecuta: npm run dev
echo 2. Abre tu navegador en: http://localhost:3000
echo 3. Configura Business Central en SUPER → Business Central
echo.
echo 🔧 Scripts disponibles:
echo   npm run dev          - Iniciar servidor de desarrollo
echo   npm run build        - Construir para producción
echo   npm run bc:restart   - Reinicio limpio del servidor
echo.
echo ===============================================

:: Preguntar si quiere iniciar el servidor
echo.
set /p start="¿Quieres iniciar el servidor ahora? (s/n): "
if /i "%start%"=="s" (
    echo.
    echo 🚀 Iniciando servidor...
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo El sistema estará disponible en: http://localhost:3000
    echo.
    npm run dev
) else (
    echo.
    echo Para iniciar el servidor más tarde, ejecuta: npm run dev
)

pause 