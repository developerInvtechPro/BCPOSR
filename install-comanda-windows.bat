@echo off
chcp 65001 >nul
echo.
echo ===============================================
echo 🍽️ INSTALADOR COMANDA DIGITAL - SISTEMA POS
echo ===============================================
echo.

:: Verificar si Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 Instala Node.js primero desde: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado
    node --version
)

echo.
echo 🍽️ Configurando Comanda Digital...
echo.

:: Verificar que el sistema esté instalado
if not exist "package.json" (
    echo ❌ Sistema POS no encontrado en esta carpeta
    echo.
    echo 📋 Instrucciones:
    echo 1. Asegúrate de estar en la carpeta del sistema POS
    echo 2. Ejecuta primero install-windows.bat
    pause
    exit /b 1
)

:: Verificar que las dependencias estén instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

:: Verificar que los archivos de comanda existan
echo 🔍 Verificando archivos de comanda...

if not exist "src\pages\comanda.tsx" (
    echo ❌ Archivo comanda.tsx no encontrado
    echo.
    echo 📋 El sistema necesita ser actualizado con los archivos de comanda
    echo Contacta al soporte técnico
    pause
    exit /b 1
)

if not exist "src\components\ComandaCocina.tsx" (
    echo ❌ Componente ComandaCocina.tsx no encontrado
    echo.
    echo 📋 El sistema necesita ser actualizado con los archivos de comanda
    echo Contacta al soporte técnico
    pause
    exit /b 1
)

echo ✅ Archivos de comanda verificados

:: Limpiar cache si existe
if exist ".next" (
    echo 🧹 Limpiando cache...
    rmdir /s /q .next
)

echo.
echo ===============================================
echo 🎉 COMANDA DIGITAL CONFIGURADA
echo ===============================================
echo.
echo 📋 URLs de Acceso:
echo.
echo 🖥️  Sistema Principal: http://localhost:3000
echo 🍽️  Comanda Cocina:    http://localhost:3000/comanda
echo.
echo 📱 Para acceso desde tablet/móvil:
echo 1. Encuentra tu IP con: ipconfig
echo 2. Usa: http://TU_IP:3000/comanda
echo.
echo 🔧 Configuración Recomendada:
echo.
echo 💻 Para Computadora Principal:
echo   - Abre: http://localhost:3000
echo   - Usa para tomar pedidos y facturar
echo.
echo 📱 Para Tablet/Monitor de Cocina:
echo   - Abre: http://localhost:3000/comanda
echo   - Coloca en cocina para gestionar pedidos
echo   - Funciona en pantalla completa
echo.
echo 🎯 Características de la Comanda:
echo   ✅ Estados: Pendiente → En Preparación → Listo
echo   ✅ Alertas sonoras para nuevos pedidos
echo   ✅ Filtros por estado de pedido
echo   ✅ Impresión de comandas
echo   ✅ Tiempo real y cronómetros
echo   ✅ Prioridades visuales (Urgente/Alta/Normal)
echo.
echo ===============================================

:: Preguntar si quiere iniciar el servidor
echo.
set /p start="¿Quieres iniciar el servidor ahora? (s/n): "
if /i "%start%"=="s" (
    echo.
    echo 🚀 Iniciando servidor...
    echo.
    echo 📋 Instrucciones de Uso:
    echo.
    echo 1. Sistema Principal se abrirá en: http://localhost:3000
    echo 2. Para abrir Comanda, busca el botón "COMANDA COCINA"
    echo 3. O ve directamente a: http://localhost:3000/comanda
    echo.
    echo 💡 Tip: Abre la comanda en una tablet y colócala en la cocina
    echo.
    echo Presiona Ctrl+C para detener el servidor
    echo.
    npm run dev
) else (
    echo.
    echo 📋 Para iniciar más tarde:
    echo.
    echo 1. Ejecuta: npm run dev
    echo 2. Abre: http://localhost:3000 (Sistema Principal)
    echo 3. Abre: http://localhost:3000/comanda (Comanda Cocina)
    echo.
    echo 📖 Consulta GUIA-COMANDA-DIGITAL.md para más información
)

pause 