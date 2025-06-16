@echo off
chcp 65001 >nul
title Sistema POS Honduras - Instalador Visible

:: MANTENER VENTANA ABIERTA SIEMPRE
echo ================================================
echo  🪟 INSTALADOR SISTEMA POS HONDURAS (VISIBLE)
echo     Con integración Business Central
echo ================================================
echo.
echo ⏰ ESTE INSTALADOR SE MANTENDRA ABIERTO
echo 👀 PODRAS VER TODO EL PROCESO
echo.
pause

:: Verificar Node.js
echo.
echo [1/7] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO instalado
    echo.
    echo 📥 Por favor instala Node.js desde: https://nodejs.org/
    echo    Descarga la versión LTS (recomendada)
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado:
    node --version
    echo.
)

:: Verificar npm
echo [2/7] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no disponible
    pause
    exit /b 1
) else (
    echo ✅ npm encontrado:
    npm --version
    echo.
)

:: Verificar directorio
echo [3/7] Verificando archivos del proyecto...
if not exist "package.json" (
    echo ❌ No se encontró package.json
    echo    Directorio actual: %CD%
    echo    Asegúrate de estar en la carpeta correcta
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Archivos del proyecto encontrados
    echo.
)

:: Configurar .env
echo [4/7] Configurando variables de entorno...
if not exist ".env.local" (
    echo 📝 Creando .env.local...
    (
        echo # Business Central Configuration
        echo BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
        echo BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
        echo BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
        echo BC_ENVIRONMENT=SB110225
        echo BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739
        echo.
        echo # Database ^(SQLite local^)
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # Puerto
        echo PORT=3000
        echo.
        echo # Configuración adicional
        echo NEXTAUTH_SECRET=pos-honduras-secret-key
        echo NEXTAUTH_URL=http://localhost:3000
    ) > .env.local
    echo ✅ Archivo .env.local creado
) else (
    echo ✅ Archivo .env.local ya existe
)
echo.

:: Limpiar cache
echo [5/7] Limpiando cache anterior...
if exist ".next" (
    echo 🧹 Eliminando .next...
    rmdir /s /q .next 2>nul
)
if exist "node_modules" (
    echo 🧹 Eliminando node_modules...
    rmdir /s /q node_modules 2>nul
)
echo ✅ Cache limpiado
echo.

:: Instalar dependencias
echo [6/7] Instalando dependencias...
echo ⏱️  ESTO PUEDE TOMAR 2-5 MINUTOS
echo.
npm install
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Reintentando con --force...
    npm install --force
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        echo.
        pause
        exit /b 1
    )
)
echo ✅ Dependencias instaladas
echo.

:: Configurar base de datos
echo [7/7] Configurando base de datos...
npx prisma generate
npx prisma db push
echo ✅ Base de datos configurada
echo.

:: Finalizar
echo ================================================
echo 🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE
echo ================================================
echo.
echo 🚀 Para iniciar el sistema:
echo    npm run dev
echo.
echo 🌐 El sistema estará en:
echo    http://localhost:3000
echo.
echo 📦 Para acceder al inventario:
echo    http://localhost:3000 → SUPER → 📦 Inventario
echo.
echo ================================================
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul 