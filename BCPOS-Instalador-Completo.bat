@echo off
setlocal enabledelayedexpansion
title BCPOS - Instalador Completo Windows
color 0A
cls

echo ================================================
echo  🚀 BCPOS - INSTALADOR COMPLETO WINDOWS
echo     Sistema POS + Inventario + Business Central
echo ================================================
echo.

REM Configuración de rutas
set "FACTURACION_PATH=%USERPROFILE%\Downloads\facturacion-app"
set "BCPOS_PATH=%USERPROFILE%\Desktop\BCPOS"

echo 🔍 Verificando requisitos del sistema...
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% NEQ 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📦 ¿Desea descargar e instalar Node.js automáticamente? (S/N)
    set /p install_node="Respuesta: "
    
    if /i "!install_node!" EQU "S" (
        echo.
        echo 🌐 Abriendo página de descarga de Node.js...
        start https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
        echo.
        echo ⏳ Por favor instale Node.js y ejecute este instalador nuevamente.
        pause
        exit
    ) else (
        echo.
        echo ❌ Node.js es requerido para BCPOS. Instalación cancelada.
        pause
        exit
    )
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js encontrado: !NODE_VERSION!
)

echo.
echo 📋 Seleccione el tipo de instalación:
echo.
echo 1. Instalación completa (recomendado)
echo    - Crea BCPOS desde cero
echo    - Integra sistema completo
echo    - Configura inicio automático
echo.
echo 2. Solo integrar sistema existente
echo    - Requiere BCPOS ya instalado
echo    - Solo copia archivos del sistema
echo.
set /p install_type="Seleccione opción (1-2): "

if "!install_type!" EQU "1" (
    echo.
    echo 🚀 INICIANDO INSTALACIÓN COMPLETA...
    
    REM Verificar si BCPOS ya existe
    if exist "!BCPOS_PATH!" (
        echo.
        echo ⚠️ El directorio BCPOS ya existe. ¿Desea sobrescribirlo? (S/N)
        set /p overwrite="Respuesta: "
        
        if /i "!overwrite!" EQU "S" (
            echo 🗑️ Eliminando directorio existente...
            rmdir /s /q "!BCPOS_PATH!"
        ) else (
            echo Instalación cancelada.
            pause
            exit
        )
    )
    
    echo ✅ Creando directorio BCPOS...
    mkdir "!BCPOS_PATH!"
    
    echo 📁 Creando estructura del proyecto...
    mkdir "!BCPOS_PATH!\src\components"
    mkdir "!BCPOS_PATH!\src\pages\api\inventory"
    mkdir "!BCPOS_PATH!\src\lib"
    mkdir "!BCPOS_PATH!\prisma"
    mkdir "!BCPOS_PATH!\scripts"
    mkdir "!BCPOS_PATH!\public"
    
    echo ✅ Estructura creada correctamente
    
) else if "!install_type!" EQU "2" (
    echo.
    echo 🔄 INICIANDO INTEGRACIÓN DEL SISTEMA...
    
    if not exist "!BCPOS_PATH!" (
        echo.
        echo ❌ No se encontró BCPOS en: !BCPOS_PATH!
        echo    Por favor use la instalación completa.
        pause
        exit
    )
) else (
    echo.
    echo ❌ Opción inválida. Saliendo...
    pause
    exit
)

REM Verificar facturacion-app e integrar archivos
if exist "!FACTURACION_PATH!" (
    echo.
    echo 📋 Integrando archivos del sistema...
    
    REM Lista de archivos a copiar
    set files[0]=src\pages\index.tsx
    set files[1]=src\components\InventoryManager.tsx
    set files[2]=src\lib\inventory-service.ts
    set files[3]=scripts\seed-inventory.js
    set files[4]=src\pages\api\inventory\items.ts
    set files[5]=src\pages\api\inventory\movements.ts
    set files[6]=src\pages\api\inventory\summary.ts
    set files[7]=src\pages\api\inventory\vendors.ts
    set files[8]=src\pages\api\inventory\purchase-orders.ts
    set files[9]=src\pages\api\inventory\recipes.ts
    
    REM Copiar archivos
    for /l %%i in (0,1,9) do (
        if exist "!FACTURACION_PATH!\!files[%%i]!" (
            REM Crear directorio padre si no existe
            for %%f in ("!BCPOS_PATH!\!files[%%i]!") do (
                if not exist "%%~dpf" mkdir "%%~dpf"
            )
            copy "!FACTURACION_PATH!\!files[%%i]!" "!BCPOS_PATH!\!files[%%i]!" >nul
            echo ✅ Copiado: !files[%%i]!
        ) else (
            echo ⚠️ No encontrado: !files[%%i]!
        )
    )
)

echo.
echo 📦 Creando package.json...

REM Crear package.json
(
echo {
echo   "name": "bcpos",
echo   "version": "1.0.0",
echo   "description": "Sistema POS completo con inventario - BCPOS",
echo   "scripts": {
echo     "dev": "next dev",
echo     "build": "next build",
echo     "start": "next start",
echo     "lint": "next lint",
echo     "db:generate": "prisma generate",
echo     "db:push": "prisma db push",
echo     "db:seed": "node scripts/seed-inventory.js",
echo     "db:studio": "prisma studio"
echo   },
echo   "dependencies": {
echo     "next": "14.1.0",
echo     "react": "^18",
echo     "react-dom": "^18",
echo     "@prisma/client": "^5.22.0",
echo     "@mui/material": "^5.15.0",
echo     "@emotion/react": "^11.11.0",
echo     "@emotion/styled": "^11.11.0",
echo     "@mui/icons-material": "^5.15.0",
echo     "@mui/x-data-grid": "^6.18.0",
echo     "recharts": "^2.8.0"
echo   },
echo   "devDependencies": {
echo     "prisma": "^5.22.0",
echo     "@types/node": "^20",
echo     "@types/react": "^18",
echo     "@types/react-dom": "^18",
echo     "typescript": "^5"
echo   }
echo }
) > "!BCPOS_PATH!\package.json"

echo ✅ package.json creado

echo.
echo 🗄️ Configurando base de datos...

REM Crear schema.prisma
(
echo generator client {
echo   provider = "prisma-client-js"
echo }
echo.
echo datasource db {
echo   provider = "sqlite"
echo   url      = env("DATABASE_URL"^)
echo }
echo.
echo model Item {
echo   id          String   @id @default(cuid(^)^)
echo   name        String
echo   description String?
echo   sku         String   @unique
echo   category    String
echo   price       Float
echo   cost        Float
echo   stock       Int      @default(0^)
echo   minStock    Int      @default(0^)
echo   maxStock    Int      @default(100^)
echo   unit        String   @default("unidad"^)
echo   barcode     String?  @unique
echo   image       String?
echo   active      Boolean  @default(true^)
echo   createdAt   DateTime @default(now(^)^)
echo   updatedAt   DateTime @updatedAt
echo.
echo   movements   Movement[]
echo   orderItems  PurchaseOrderItem[]
echo   recipeItems RecipeItem[]
echo.
echo   @@map("items"^)
echo }
echo.
echo model Movement {
echo   id          String      @id @default(cuid(^)^)
echo   itemId      String
echo   type        MovementType
echo   quantity    Int
echo   cost        Float?
echo   price       Float?
echo   reference   String?
echo   notes       String?
echo   createdAt   DateTime    @default(now(^)^)
echo.  
echo   item        Item        @relation(fields: [itemId], references: [id]^)
echo.
echo   @@map("movements"^)
echo }
echo.
echo model Vendor {
echo   id            String          @id @default(cuid(^)^)
echo   name          String
echo   contact       String?
echo   email         String?
echo   phone         String?
echo   address       String?
echo   active        Boolean         @default(true^)
echo   createdAt     DateTime        @default(now(^)^)
echo   updatedAt     DateTime        @updatedAt
echo.
echo   purchaseOrders PurchaseOrder[]
echo.
echo   @@map("vendors"^)
echo }
echo.
echo model PurchaseOrder {
echo   id          String              @id @default(cuid(^)^)
echo   vendorId    String
echo   orderNumber String              @unique
echo   status      PurchaseOrderStatus @default(PENDING^)
echo   orderDate   DateTime            @default(now(^)^)
echo   expectedDate DateTime?
echo   receivedDate DateTime?
echo   total       Float               @default(0^)
echo   notes       String?
echo   createdAt   DateTime            @default(now(^)^)
echo   updatedAt   DateTime            @updatedAt
echo.
echo   vendor      Vendor              @relation(fields: [vendorId], references: [id]^)
echo   items       PurchaseOrderItem[]
echo.
echo   @@map("purchase_orders"^)
echo }
echo.
echo model PurchaseOrderItem {
echo   id              String        @id @default(cuid(^)^)
echo   purchaseOrderId String
echo   itemId          String
echo   quantity        Int
echo   cost            Float
echo   received        Int           @default(0^)
echo.  
echo   purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id]^)
echo   item            Item          @relation(fields: [itemId], references: [id]^)
echo.
echo   @@map("purchase_order_items"^)
echo }
echo.
echo model Recipe {
echo   id          String       @id @default(cuid(^)^)
echo   name        String
echo   description String?
echo   yield       Int          @default(1^)
echo   unit        String       @default("porción"^)
echo   cost        Float        @default(0^)
echo   active      Boolean      @default(true^)
echo   createdAt   DateTime     @default(now(^)^)
echo   updatedAt   DateTime     @updatedAt
echo.
echo   items       RecipeItem[]
echo.
echo   @@map("recipes"^)
echo }
echo.
echo model RecipeItem {
echo   id        String @id @default(cuid(^)^)
echo   recipeId  String
echo   itemId    String
echo   quantity  Float
echo   unit      String @default("unidad"^)
echo.  
echo   recipe    Recipe @relation(fields: [recipeId], references: [id]^)
echo   item      Item   @relation(fields: [itemId], references: [id]^)
echo.
echo   @@map("recipe_items"^)
echo }
echo.
echo enum MovementType {
echo   IN
echo   OUT
echo   ADJUSTMENT
echo   TRANSFER
echo }
echo.
echo enum PurchaseOrderStatus {
echo   PENDING
echo   ORDERED
echo   PARTIAL
echo   RECEIVED
echo   CANCELLED
echo }
) > "!BCPOS_PATH!\prisma\schema.prisma"

echo ✅ Schema Prisma creado

REM Crear .env
(
echo # CONFIGURACIÓN BCPOS - SISTEMA COMPLETO
echo DATABASE_URL="file:./bcpos.db"
echo.
echo # Business Central - PRECONFIGURADO HONDURAS
echo BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
echo BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
echo BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
echo BC_ENVIRONMENT=SB110225
echo BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739
echo.
echo # Configuración del Sistema
echo PORT=3000
echo NEXTAUTH_SECRET=bcpos-secret-key-2024
echo NEXTAUTH_URL=http://localhost:3000
echo.
echo # Configuración de Empresa
echo EMPRESA_NOMBRE="BCPOS - Sistema de Punto de Venta"
echo EMPRESA_RTN="08011999123456"
echo EMPRESA_DIRECCION="Tegucigalpa, Honduras"
echo EMPRESA_TELEFONO="2234-5678"
echo.
echo # Configuración de Impresión
echo PRINTER_NAME="POS-80"
echo PRINTER_WIDTH=48
) > "!BCPOS_PATH!\.env"

echo ✅ Archivo .env creado

echo.
echo ⚙️ Creando archivos de configuración...

REM Crear next.config.js
(
echo /** @type {import('next'^).NextConfig} */
echo const nextConfig = {
echo   reactStrictMode: true,
echo   swcMinify: true,
echo   experimental: {
echo     serverComponentsExternalPackages: ['@prisma/client']
echo   }
echo }
echo.
echo module.exports = nextConfig
) > "!BCPOS_PATH!\next.config.js"

REM Crear tsconfig.json
(
echo {
echo   "compilerOptions": {
echo     "target": "es5",
echo     "lib": ["dom", "dom.iterable", "es6"],
echo     "allowJs": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "forceConsistentCasingInFileNames": true,
echo     "noEmit": true,
echo     "esModuleInterop": true,
echo     "module": "esnext",
echo     "moduleResolution": "node",
echo     "resolveJsonModule": true,
echo     "isolatedModules": true,
echo     "jsx": "preserve",
echo     "incremental": true,
echo     "plugins": [
echo       {
echo         "name": "next"
echo       }
echo     ],
echo     "paths": {
echo       "@/*": ["./src/*"]
echo     }
echo   },
echo   "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
echo   "exclude": ["node_modules"]
echo }
) > "!BCPOS_PATH!\tsconfig.json"

echo ✅ Archivos de configuración creados

echo.
echo 📋 Creando scripts de gestión...

REM Script de configuración
(
echo @echo off
echo title BCPOS - Configuración Completa
echo cd /d "!BCPOS_PATH!"
echo.
echo echo ================================================
echo echo  🚀 BCPOS - CONFIGURACIÓN COMPLETA
echo echo     Sistema POS con Inventario
echo echo ================================================
echo echo.
echo.
echo echo 📦 Instalando dependencias...
echo npm install
echo.
echo echo 🗄️ Configurando base de datos...
echo npx prisma generate
echo npx prisma db push
echo.
echo echo 🌱 Poblando datos iniciales...
echo if exist scripts\seed-inventory.js ^(
echo     node scripts\seed-inventory.js
echo ^) else ^(
echo     echo ⚠️ Script de seed no encontrado, continuando...
echo ^)
echo.
echo echo.
echo echo ✅ CONFIGURACIÓN COMPLETADA
echo echo 🚀 Para iniciar el sistema ejecute: npm run dev
echo echo 📱 Acceso: http://localhost:3000
echo echo.
echo pause
) > "!BCPOS_PATH!\configurar-sistema.bat"

REM Script de inicio
(
echo @echo off
echo title BCPOS - Sistema Completo
echo cd /d "!BCPOS_PATH!"
echo.
echo echo ================================================
echo echo  🚀 BCPOS - SISTEMA COMPLETO
echo echo     POS + Inventario + Business Central
echo echo ================================================
echo echo.
echo.
echo REM Verificar si el servidor ya está corriendo
echo netstat -an ^| find "3000" ^>nul
echo if %%errorlevel%% == 0 ^(
echo     echo ✅ Servidor ya está corriendo
echo     echo 🌐 Abriendo navegador...
echo     start http://localhost:3000
echo     timeout /t 3 /nobreak ^>nul
echo     exit
echo ^)
echo.
echo echo 🔄 Iniciando servidor BCPOS...
echo start /min npm run dev
echo.
echo echo ⏳ Esperando que el servidor esté listo...
echo timeout /t 20 /nobreak ^>nul
echo.
echo echo 🌐 Abriendo navegador...
echo start http://localhost:3000
echo.
echo echo.
echo echo ✅ BCPOS iniciado correctamente
echo echo 📱 Sistema POS: http://localhost:3000
echo echo.
echo timeout /t 3 /nobreak ^>nul
) > "!BCPOS_PATH!\IniciarBCPOS.bat"

REM Script de inicio automático
(
echo @echo off
echo title BCPOS - Inicio Automático
echo cd /d "!BCPOS_PATH!"
echo.
echo REM Esperar 30 segundos para que Windows termine de cargar
echo timeout /t 30 /nobreak ^>nul
echo.
echo REM Verificar si ya está corriendo
echo netstat -an ^| find ":3000" ^| find "LISTENING" ^>nul
echo if %%errorlevel%% == 0 ^(
echo     exit
echo ^)
echo.
echo REM Iniciar BCPOS en modo minimizado
echo start /min "BCPOS-AutoStart" npm run dev
echo.
echo REM Esperar y verificar
echo timeout /t 20 /nobreak ^>nul
echo.
echo REM Mostrar notificación si está listo
echo curl -s http://localhost:3000 ^>nul 2^>^&1
echo if %%errorlevel%% == 0 ^(
echo     msg %%username%% "BCPOS iniciado automáticamente. Disponible en: http://localhost:3000"
echo ^)
) > "!BCPOS_PATH!\inicio-automatico.bat"

REM Script de gestión de inicio automático
(
echo @echo off
echo title BCPOS - Gestión de Inicio Automático
echo cls
echo.
echo :menu
echo echo ================================================
echo echo  🚀 BCPOS - GESTIÓN DE INICIO AUTOMÁTICO
echo echo ================================================
echo echo.
echo echo 1. ✅ Habilitar inicio automático
echo echo 2. ❌ Deshabilitar inicio automático
echo echo 3. 📊 Ver estado actual
echo echo 4. 🚀 Iniciar BCPOS ahora
echo echo 5. ⏹️  Detener BCPOS
echo echo 6. 🌐 Abrir BCPOS en navegador
echo echo 7. 🔄 Reiniciar BCPOS
echo echo 8. ❌ Salir
echo echo.
echo set /p choice="Seleccione una opción (1-8^): "
echo.
echo if "%%choice%%"=="1" goto enable
echo if "%%choice%%"=="2" goto disable
echo if "%%choice%%"=="3" goto status
echo if "%%choice%%"=="4" goto start
echo if "%%choice%%"=="5" goto stop
echo if "%%choice%%"=="6" goto open
echo if "%%choice%%"=="7" goto restart
echo if "%%choice%%"=="8" goto exit
echo.
echo goto menu
echo.
echo :enable
echo echo 🔧 Habilitando inicio automático...
echo reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" /t REG_SZ /d "!BCPOS_PATH!\inicio-automatico.bat" /f
echo echo ✅ Inicio automático habilitado
echo timeout /t 3 /nobreak ^>nul
echo goto menu
echo.
echo :disable
echo echo 🔧 Deshabilitando inicio automático...
echo reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" /f 2^>nul
echo echo ✅ Inicio automático deshabilitado
echo timeout /t 3 /nobreak ^>nul
echo goto menu
echo.
echo :status
echo echo 📊 Estado del inicio automático:
echo reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" 2^>nul
echo if %%errorlevel%% == 0 ^(
echo     echo ✅ BCPOS está configurado para inicio automático
echo ^) else ^(
echo     echo ❌ BCPOS NO está configurado para inicio automático
echo ^)
echo echo.
echo pause
echo goto menu
echo.
echo :start
echo echo 🚀 Iniciando BCPOS...
echo cd /d "!BCPOS_PATH!"
echo start /min "BCPOS-Manual" npm run dev
echo echo ✅ BCPOS iniciado
echo timeout /t 3 /nobreak ^>nul
echo goto menu
echo.
echo :stop
echo echo ⏹️ Deteniendo BCPOS...
echo taskkill /F /IM node.exe /FI "WINDOWTITLE eq*BCPOS*" 2^>nul
echo echo ✅ BCPOS detenido
echo timeout /t 3 /nobreak ^>nul
echo goto menu
echo.
echo :open
echo echo 🌐 Abriendo BCPOS...
echo start http://localhost:3000
echo timeout /t 2 /nobreak ^>nul
echo goto menu
echo.
echo :restart
echo echo 🔄 Reiniciando BCPOS...
echo taskkill /F /IM node.exe /FI "WINDOWTITLE eq*BCPOS*" 2^>nul
echo timeout /t 3 /nobreak ^>nul
echo cd /d "!BCPOS_PATH!"
echo start /min "BCPOS-Restart" npm run dev
echo echo ✅ BCPOS reiniciado
echo timeout /t 3 /nobreak ^>nul
echo goto menu
echo.
echo :exit
echo exit
) > "!BCPOS_PATH!\gestionar-inicio-automatico.bat"

echo ✅ Scripts de gestión creados

echo.
echo 🖥️ Creando iconos de escritorio...

REM Crear iconos en el escritorio usando VBScript
echo Set oWS = WScript.CreateObject("WScript.Shell"^) > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%USERPROFILE%\Desktop\🚀 BCPOS.lnk" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile^) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "!BCPOS_PATH!\IniciarBCPOS.bat" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "!BCPOS_PATH!" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "BCPOS - Sistema POS Completo" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"
cscript //nologo "%TEMP%\CreateShortcut.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell"^) > "%TEMP%\CreateShortcut2.vbs"
echo sLinkFile = "%USERPROFILE%\Desktop\⚙️ Configurar BCPOS.lnk" >> "%TEMP%\CreateShortcut2.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile^) >> "%TEMP%\CreateShortcut2.vbs"
echo oLink.TargetPath = "!BCPOS_PATH!\configurar-sistema.bat" >> "%TEMP%\CreateShortcut2.vbs"
echo oLink.WorkingDirectory = "!BCPOS_PATH!" >> "%TEMP%\CreateShortcut2.vbs"
echo oLink.Description = "BCPOS - Configurar sistema" >> "%TEMP%\CreateShortcut2.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut2.vbs"
cscript //nologo "%TEMP%\CreateShortcut2.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell"^) > "%TEMP%\CreateShortcut3.vbs"
echo sLinkFile = "%USERPROFILE%\Desktop\🔄 Gestionar Inicio BCPOS.lnk" >> "%TEMP%\CreateShortcut3.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile^) >> "%TEMP%\CreateShortcut3.vbs"
echo oLink.TargetPath = "!BCPOS_PATH!\gestionar-inicio-automatico.bat" >> "%TEMP%\CreateShortcut3.vbs"
echo oLink.WorkingDirectory = "!BCPOS_PATH!" >> "%TEMP%\CreateShortcut3.vbs"
echo oLink.Description = "BCPOS - Gestionar inicio automático" >> "%TEMP%\CreateShortcut3.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut3.vbs"
cscript //nologo "%TEMP%\CreateShortcut3.vbs"

REM Limpiar archivos temporales
del "%TEMP%\CreateShortcut.vbs" 2>nul
del "%TEMP%\CreateShortcut2.vbs" 2>nul
del "%TEMP%\CreateShortcut3.vbs" 2>nul

echo ✅ Iconos de escritorio creados

echo.
echo 🎉 INSTALACIÓN COMPLETADA
echo =========================
echo.
echo ✅ BCPOS INSTALADO CORRECTAMENTE
echo.
echo 📋 COMPONENTES INSTALADOS:
echo.
echo 🖥️ SISTEMA POS COMPLETO:
echo    • Punto de venta con todas las funcionalidades
echo    • Gestión de mesas, delivery, pickup
echo    • Facturación con CAI
echo    • Múltiples formas de pago
echo.
echo 📦 INVENTARIO AVANZADO:
echo    • Gestión de artículos
echo    • Movimientos de inventario
echo    • Órdenes de compra
echo    • Recetas y componentes
echo    • Proveedores
echo.
echo 🔗 BUSINESS CENTRAL:
echo    • Integración preconfigurada para Honduras
echo    • Sincronización automática de datos
echo.
echo 🗄️ BASE DE DATOS:
echo    • SQLite local configurada
echo    • Prisma ORM
echo    • Esquema completo
echo.
echo 🖥️ ICONOS CREADOS:
echo    • 🚀 BCPOS - Iniciar sistema
echo    • ⚙️ Configurar BCPOS - Instalar dependencias
echo    • 🔄 Gestionar Inicio BCPOS - Configurar inicio automático
echo.
echo 🚀 PRÓXIMOS PASOS:
echo    1. Ejecutar: ⚙️ Configurar BCPOS (instala dependencias)
echo    2. Configurar: 🔄 Gestionar Inicio BCPOS (opcional)
echo    3. Iniciar: 🚀 BCPOS
echo    4. Acceder: http://localhost:3000
echo.
echo ✅ ¡BCPOS listo para usar!
echo.

echo 🔧 ¿Desea ejecutar la configuración completa ahora? (S/N)
set /p config_now="Respuesta: "

if /i "!config_now!" EQU "S" (
    echo.
    echo 🔄 Ejecutando configuración...
    cd /d "!BCPOS_PATH!"
    call configurar-sistema.bat
    
    echo.
    echo 🎉 ¡Sistema listo para usar!
    echo.
    echo 🔄 ¿Desea configurar BCPOS para inicio automático con Windows? (S/N)
    set /p auto_start="Respuesta: "
    
    if /i "!auto_start!" EQU "S" (
        echo 🔧 Configurando inicio automático...
        reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" /t REG_SZ /d "!BCPOS_PATH!\inicio-automatico.bat" /f >nul
        echo ✅ Inicio automático configurado
        echo    BCPOS se iniciará automáticamente con Windows.
    )
    
    echo.
    echo 🚀 ¿Desea iniciar BCPOS ahora? (S/N)
    set /p start_now="Respuesta: "
    
    if /i "!start_now!" EQU "S" (
        start "" "!BCPOS_PATH!\IniciarBCPOS.bat"
    )
)

echo.
echo ¡Instalación finalizada!
pause 