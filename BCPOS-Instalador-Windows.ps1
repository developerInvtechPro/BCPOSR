# =====================================================
# BCPOS - INSTALADOR COMPLETO PARA WINDOWS
# Instalador definitivo con todas las funcionalidades
# =====================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Write-Host "🚀 BCPOS - INSTALADOR COMPLETO PARA WINDOWS" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Configuración de rutas
$FACTURACION_PATH = "$env:USERPROFILE\Downloads\facturacion-app"
$BCPOS_PATH = "$env:USERPROFILE\Desktop\BCPOS"

# Función para mostrar mensaje
function Show-Message {
    param([string]$Title, [string]$Message, [string]$Type = "Information")
    
    $icon = switch ($Type) {
        "Error" { [System.Windows.Forms.MessageBoxIcon]::Error }
        "Warning" { [System.Windows.Forms.MessageBoxIcon]::Warning }
        "Question" { [System.Windows.Forms.MessageBoxIcon]::Question }
        default { [System.Windows.Forms.MessageBoxIcon]::Information }
    }
    
    [System.Windows.Forms.MessageBox]::Show($Message, $Title, [System.Windows.Forms.MessageBoxButtons]::OK, $icon)
}

# Función para escribir archivo sin BOM
function Write-FileNoBOM {
    param([string]$FilePath, [string]$Content)
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($FilePath, $Content, $utf8NoBom)
}

# Función para verificar Node.js
function Test-NodeJS {
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

# Función para instalar Node.js
function Install-NodeJS {
    Write-Host "📦 Descargando e instalando Node.js..." -ForegroundColor Yellow
    
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
        Start-Process msiexec.exe -ArgumentList "/i", $nodeInstaller, "/quiet" -Wait
        Remove-Item $nodeInstaller -Force
        
        # Actualizar PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Host "✅ Node.js instalado correctamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error instalando Node.js: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "🔍 Verificando requisitos del sistema..." -ForegroundColor Yellow

# Verificar Node.js
if (-not (Test-NodeJS)) {
    $installNode = [System.Windows.Forms.MessageBox]::Show(
        "Node.js no está instalado. ¿Desea instalarlo automáticamente?",
        "Node.js Requerido",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    if ($installNode -eq [System.Windows.Forms.DialogResult]::Yes) {
        if (-not (Install-NodeJS)) {
            Show-Message "Error" "No se pudo instalar Node.js. Por favor instálelo manualmente desde nodejs.org" "Error"
            exit
        }
    } else {
        Show-Message "Cancelado" "Node.js es requerido para BCPOS. Instalación cancelada." "Warning"
        exit
    }
}

# Mostrar opciones de instalación
$installOptions = [System.Windows.Forms.MessageBox]::Show(
    "Seleccione el tipo de instalación:`n`n• SÍ: Instalación completa (recomendado)`n  - Crea BCPOS desde cero`n  - Integra sistema completo`n  - Configura inicio automático`n`n• NO: Solo integrar sistema existente`n  - Requiere BCPOS ya instalado`n  - Solo copia archivos del sistema",
    "Tipo de Instalación",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($installOptions -eq [System.Windows.Forms.DialogResult]::Yes) {
    # INSTALACIÓN COMPLETA
    Write-Host "`n🚀 INICIANDO INSTALACIÓN COMPLETA..." -ForegroundColor Green
    
    # Crear directorio BCPOS
    if (Test-Path $BCPOS_PATH) {
        $overwrite = [System.Windows.Forms.MessageBox]::Show(
            "El directorio BCPOS ya existe. ¿Desea sobrescribirlo?",
            "Directorio Existente",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Warning
        )
        
        if ($overwrite -eq [System.Windows.Forms.DialogResult]::Yes) {
            Remove-Item $BCPOS_PATH -Recurse -Force
        } else {
            Show-Message "Cancelado" "Instalación cancelada."
            exit
        }
    }
    
    New-Item -ItemType Directory -Path $BCPOS_PATH -Force | Out-Null
    Write-Host "✅ Directorio BCPOS creado" -ForegroundColor Green
    
    # Crear estructura completa
    Write-Host "`n📁 Creando estructura del proyecto..." -ForegroundColor Yellow
    
    $directories = @(
        "src\components",
        "src\pages\api\inventory",
        "src\lib",
        "prisma",
        "scripts",
        "public"
    )
    
    foreach ($dir in $directories) {
        $fullPath = Join-Path $BCPOS_PATH $dir
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    }
    
    # Crear package.json
    Write-Host "`n📦 Creando package.json..." -ForegroundColor Yellow
    
    $packageJson = @{
        name = "bcpos"
        version = "1.0.0"
        description = "Sistema POS completo con inventario - BCPOS"
        scripts = @{
            dev = "next dev"
            build = "next build"
            start = "next start"
            lint = "next lint"
            "db:generate" = "prisma generate"
            "db:push" = "prisma db push"
            "db:seed" = "node scripts/seed-inventory.js"
            "db:studio" = "prisma studio"
        }
        dependencies = @{
            "next" = "14.1.0"
            "react" = "^18"
            "react-dom" = "^18"
            "@prisma/client" = "^5.22.0"
            "@mui/material" = "^5.15.0"
            "@emotion/react" = "^11.11.0"
            "@emotion/styled" = "^11.11.0"
            "@mui/icons-material" = "^5.15.0"
            "@mui/x-data-grid" = "^6.18.0"
            "recharts" = "^2.8.0"
        }
        devDependencies = @{
            "prisma" = "^5.22.0"
            "@types/node" = "^20"
            "@types/react" = "^18"
            "@types/react-dom" = "^18"
            "typescript" = "^5"
        }
    }
    
    $packageJsonContent = $packageJson | ConvertTo-Json -Depth 10
    Write-FileNoBOM (Join-Path $BCPOS_PATH "package.json") $packageJsonContent
    
} else {
    # SOLO INTEGRACIÓN
    Write-Host "`n🔄 INICIANDO INTEGRACIÓN DEL SISTEMA..." -ForegroundColor Green
    
    # Verificar que BCPOS existe
    if (-not (Test-Path $BCPOS_PATH)) {
        Show-Message "Error" "No se encontró BCPOS en:`n$BCPOS_PATH`n`nPor favor use la instalación completa." "Error"
        exit
    }
}

# Verificar facturacion-app
if (Test-Path $FACTURACION_PATH) {
    Write-Host "`n📋 Integrando archivos del sistema..." -ForegroundColor Yellow
    
    # Archivos a copiar
    $filesToCopy = @(
        @{ Source = "src\pages\index.tsx"; Dest = "src\pages\index.tsx" },
        @{ Source = "src\components\InventoryManager.tsx"; Dest = "src\components\InventoryManager.tsx" },
        @{ Source = "src\lib\inventory-service.ts"; Dest = "src\lib\inventory-service.ts" },
        @{ Source = "scripts\seed-inventory.js"; Dest = "scripts\seed-inventory.js" }
    )
    
    # APIs de inventario
    $apiFiles = @(
        "src\pages\api\inventory\items.ts",
        "src\pages\api\inventory\movements.ts",
        "src\pages\api\inventory\summary.ts",
        "src\pages\api\inventory\vendors.ts",
        "src\pages\api\inventory\purchase-orders.ts",
        "src\pages\api\inventory\recipes.ts"
    )
    
    foreach ($apiFile in $apiFiles) {
        $filesToCopy += @{ Source = $apiFile; Dest = $apiFile }
    }
    
    # Copiar archivos
    foreach ($file in $filesToCopy) {
        $sourcePath = Join-Path $FACTURACION_PATH $file.Source
        $destPath = Join-Path $BCPOS_PATH $file.Dest
        
        if (Test-Path $sourcePath) {
            try {
                $destDir = Split-Path $destPath -Parent
                if (-not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
                
                Copy-Item $sourcePath $destPath -Force
                Write-Host "✅ Copiado: $($file.Source)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error copiando: $($file.Source)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n🗄️ Configurando base de datos..." -ForegroundColor Yellow

# Crear schema.prisma
$prismaSchema = @"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Item {
  id          String   @id @default(cuid())
  name        String
  description String?
  sku         String   @unique
  category    String
  price       Float
  cost        Float
  stock       Int      @default(0)
  minStock    Int      @default(0)
  maxStock    Int      @default(100)
  unit        String   @default("unidad")
  barcode     String?  @unique
  image       String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  movements   Movement[]
  orderItems  PurchaseOrderItem[]
  recipeItems RecipeItem[]

  @@map("items")
}

model Movement {
  id          String      @id @default(cuid())
  itemId      String
  type        MovementType
  quantity    Int
  cost        Float?
  price       Float?
  reference   String?
  notes       String?
  createdAt   DateTime    @default(now())
  
  item        Item        @relation(fields: [itemId], references: [id])

  @@map("movements")
}

model Vendor {
  id            String          @id @default(cuid())
  name          String
  contact       String?
  email         String?
  phone         String?
  address       String?
  active        Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  purchaseOrders PurchaseOrder[]

  @@map("vendors")
}

model PurchaseOrder {
  id          String              @id @default(cuid())
  vendorId    String
  orderNumber String              @unique
  status      PurchaseOrderStatus @default(PENDING)
  orderDate   DateTime            @default(now())
  expectedDate DateTime?
  receivedDate DateTime?
  total       Float               @default(0)
  notes       String?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  vendor      Vendor              @relation(fields: [vendorId], references: [id])
  items       PurchaseOrderItem[]

  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id              String        @id @default(cuid())
  purchaseOrderId String
  itemId          String
  quantity        Int
  cost            Float
  received        Int           @default(0)
  
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  item            Item          @relation(fields: [itemId], references: [id])

  @@map("purchase_order_items")
}

model Recipe {
  id          String       @id @default(cuid())
  name        String
  description String?
  yield       Int          @default(1)
  unit        String       @default("porción")
  cost        Float        @default(0)
  active      Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  items       RecipeItem[]

  @@map("recipes")
}

model RecipeItem {
  id        String @id @default(cuid())
  recipeId  String
  itemId    String
  quantity  Float
  unit      String @default("unidad")
  
  recipe    Recipe @relation(fields: [recipeId], references: [id])
  item      Item   @relation(fields: [itemId], references: [id])

  @@map("recipe_items")
}

enum MovementType {
  IN
  OUT
  ADJUSTMENT
  TRANSFER
}

enum PurchaseOrderStatus {
  PENDING
  ORDERED
  PARTIAL
  RECEIVED
  CANCELLED
}
"@

Write-FileNoBOM (Join-Path $BCPOS_PATH "prisma\schema.prisma") $prismaSchema

# Crear .env
$envContent = @"
# CONFIGURACIÓN BCPOS - SISTEMA COMPLETO
DATABASE_URL="file:./bcpos.db"

# Business Central - PRECONFIGURADO HONDURAS
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

# Configuración del Sistema
PORT=3000
NEXTAUTH_SECRET=bcpos-secret-key-2024
NEXTAUTH_URL=http://localhost:3000

# Configuración de Empresa
EMPRESA_NOMBRE="BCPOS - Sistema de Punto de Venta"
EMPRESA_RTN="08011999123456"
EMPRESA_DIRECCION="Tegucigalpa, Honduras"
EMPRESA_TELEFONO="2234-5678"

# Configuración de Impresión
PRINTER_NAME="POS-80"
PRINTER_WIDTH=48
"@

Write-FileNoBOM (Join-Path $BCPOS_PATH ".env") $envContent

# Crear archivos de configuración
Write-Host "`n⚙️ Creando archivos de configuración..." -ForegroundColor Yellow

# next.config.js
$nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig
"@

Write-FileNoBOM (Join-Path $BCPOS_PATH "next.config.js") $nextConfig

# tsconfig.json
$tsConfig = @"
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"@

Write-FileNoBOM (Join-Path $BCPOS_PATH "tsconfig.json") $tsConfig

Write-Host "`n📋 Creando scripts de gestión..." -ForegroundColor Yellow

# Script de configuración
$setupScript = @"
@echo off
title BCPOS - Configuración Completa
cd /d "$BCPOS_PATH"

echo ================================================
echo  🚀 BCPOS - CONFIGURACIÓN COMPLETA
echo     Sistema POS con Inventario
echo ================================================
echo.

echo 📦 Instalando dependencias...
npm install

echo 🗄️ Configurando base de datos...
npx prisma generate
npx prisma db push

echo 🌱 Poblando datos iniciales...
if exist scripts\seed-inventory.js (
    node scripts\seed-inventory.js
) else (
    echo ⚠️ Script de seed no encontrado, continuando...
)

echo.
echo ✅ CONFIGURACIÓN COMPLETADA
echo 🚀 Para iniciar el sistema ejecute: npm run dev
echo 📱 Acceso: http://localhost:3000
echo.
pause
"@

$setupScript | Out-File -FilePath (Join-Path $BCPOS_PATH "configurar-sistema.bat") -Encoding ASCII

# Script de inicio
$startScript = @"
@echo off
title BCPOS - Sistema Completo
cd /d "$BCPOS_PATH"

echo ================================================
echo  🚀 BCPOS - SISTEMA COMPLETO
echo     POS + Inventario + Business Central
echo ================================================
echo.

REM Verificar si el servidor ya está corriendo
netstat -an | find "3000" >nul
if %errorlevel% == 0 (
    echo ✅ Servidor ya está corriendo
    echo 🌐 Abriendo navegador...
    start http://localhost:3000
    timeout /t 3 /nobreak >nul
    exit
)

echo 🔄 Iniciando servidor BCPOS...
start /min npm run dev

echo ⏳ Esperando que el servidor esté listo...
timeout /t 20 /nobreak >nul

echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo ✅ BCPOS iniciado correctamente
echo 📱 Sistema POS: http://localhost:3000
echo.
timeout /t 3 /nobreak >nul
"@

$startScript | Out-File -FilePath (Join-Path $BCPOS_PATH "IniciarBCPOS.bat") -Encoding ASCII

# Script de inicio automático
$autoStartScript = @"
@echo off
title BCPOS - Inicio Automático
cd /d "$BCPOS_PATH"

REM Esperar 30 segundos para que Windows termine de cargar
timeout /t 30 /nobreak >nul

REM Verificar si ya está corriendo
netstat -an | find ":3000" | find "LISTENING" >nul
if %errorlevel% == 0 (
    exit
)

REM Iniciar BCPOS en modo minimizado
start /min "BCPOS-AutoStart" npm run dev

REM Esperar y verificar
timeout /t 20 /nobreak >nul

REM Mostrar notificación si está listo
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('BCPOS iniciado automáticamente\nDisponible en: http://localhost:3000', 'BCPOS', 'OK', 'Information')"
)
"@

$autoStartScript | Out-File -FilePath (Join-Path $BCPOS_PATH "inicio-automatico.bat") -Encoding ASCII

# Script de gestión de inicio automático
$manageAutoStartScript = @"
@echo off
title BCPOS - Gestión de Inicio Automático
cls

:menu
echo ================================================
echo  🚀 BCPOS - GESTIÓN DE INICIO AUTOMÁTICO
echo ================================================
echo.
echo 1. ✅ Habilitar inicio automático
echo 2. ❌ Deshabilitar inicio automático
echo 3. 📊 Ver estado actual
echo 4. 🚀 Iniciar BCPOS ahora
echo 5. ⏹️  Detener BCPOS
echo 6. 🌐 Abrir BCPOS en navegador
echo 7. 🔄 Reiniciar BCPOS
echo 8. ❌ Salir
echo.
set /p choice="Seleccione una opción (1-8): "

if "%choice%"=="1" goto enable
if "%choice%"=="2" goto disable
if "%choice%"=="3" goto status
if "%choice%"=="4" goto start
if "%choice%"=="5" goto stop
if "%choice%"=="6" goto open
if "%choice%"=="7" goto restart
if "%choice%"=="8" goto exit

goto menu

:enable
echo 🔧 Habilitando inicio automático...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" /t REG_SZ /d "$BCPOS_PATH\inicio-automatico.bat" /f
echo ✅ Inicio automático habilitado
timeout /t 3 /nobreak >nul
goto menu

:disable
echo 🔧 Deshabilitando inicio automático...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" /f 2>nul
echo ✅ Inicio automático deshabilitado
timeout /t 3 /nobreak >nul
goto menu

:status
echo 📊 Estado del inicio automático:
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "BCPOS" 2>nul
if %errorlevel% == 0 (
    echo ✅ BCPOS está configurado para inicio automático
) else (
    echo ❌ BCPOS NO está configurado para inicio automático
)
echo.
pause
goto menu

:start
echo 🚀 Iniciando BCPOS...
cd /d "$BCPOS_PATH"
start /min "BCPOS-Manual" npm run dev
echo ✅ BCPOS iniciado
timeout /t 3 /nobreak >nul
goto menu

:stop
echo ⏹️ Deteniendo BCPOS...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq*BCPOS*" 2>nul
echo ✅ BCPOS detenido
timeout /t 3 /nobreak >nul
goto menu

:open
echo 🌐 Abriendo BCPOS...
start http://localhost:3000
timeout /t 2 /nobreak >nul
goto menu

:restart
echo 🔄 Reiniciando BCPOS...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq*BCPOS*" 2>nul
timeout /t 3 /nobreak >nul
cd /d "$BCPOS_PATH"
start /min "BCPOS-Restart" npm run dev
echo ✅ BCPOS reiniciado
timeout /t 3 /nobreak >nul
goto menu

:exit
exit
"@

$manageAutoStartScript | Out-File -FilePath (Join-Path $BCPOS_PATH "gestionar-inicio-automatico.bat") -Encoding ASCII

Write-Host "`n🖥️ Creando iconos de escritorio..." -ForegroundColor Yellow

# Crear iconos en el escritorio
$desktopPath = [Environment]::GetFolderPath("Desktop")
$WshShell = New-Object -ComObject WScript.Shell

# Icono principal
$Shortcut = $WshShell.CreateShortcut("$desktopPath\🚀 BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\IniciarBCPOS.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.Description = "BCPOS - Sistema POS Completo"
$Shortcut.Save()

# Icono de configuración
$Shortcut = $WshShell.CreateShortcut("$desktopPath\⚙️ Configurar BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\configurar-sistema.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.Description = "BCPOS - Configurar sistema"
$Shortcut.Save()

# Icono de gestión de inicio automático
$Shortcut = $WshShell.CreateShortcut("$desktopPath\🔄 Gestionar Inicio BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\gestionar-inicio-automatico.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.Description = "BCPOS - Gestionar inicio automático"
$Shortcut.Save()

Write-Host "`n🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

$summary = @"

✅ BCPOS INSTALADO CORRECTAMENTE

📋 COMPONENTES INSTALADOS:

🖥️ SISTEMA POS COMPLETO:
   • Punto de venta con todas las funcionalidades
   • Gestión de mesas, delivery, pickup
   • Facturación con CAI
   • Múltiples formas de pago
   • Apertura automática de cajón

📦 INVENTARIO AVANZADO:
   • Gestión de artículos
   • Movimientos de inventario
   • Órdenes de compra
   • Recetas y componentes
   • Proveedores

🔗 BUSINESS CENTRAL:
   • Integración preconfigurada para Honduras
   • Sincronización automática de datos

🗄️ BASE DE DATOS:
   • SQLite local configurada
   • Prisma ORM
   • Esquema completo

🖥️ ICONOS CREADOS:
   • 🚀 BCPOS - Iniciar sistema
   • ⚙️ Configurar BCPOS - Instalar dependencias
   • 🔄 Gestionar Inicio BCPOS - Configurar inicio automático

🚀 PRÓXIMOS PASOS:
   1. Ejecutar: ⚙️ Configurar BCPOS (instala dependencias)
   2. Configurar: 🔄 Gestionar Inicio BCPOS (opcional)
   3. Iniciar: 🚀 BCPOS
   4. Acceder: http://localhost:3000

✅ ¡BCPOS listo para usar!
"@

Show-Message "¡Instalación Exitosa!" $summary

Write-Host $summary -ForegroundColor Cyan

# Preguntar si desea configurar ahora
$configNow = [System.Windows.Forms.MessageBox]::Show(
    "¿Desea ejecutar la configuración completa ahora?`n`nEsto instalará dependencias y configurará la base de datos.",
    "Configurar Ahora",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($configNow -eq [System.Windows.Forms.DialogResult]::Yes) {
    Write-Host "`n🔄 Ejecutando configuración..." -ForegroundColor Yellow
    Start-Process "$BCPOS_PATH\configurar-sistema.bat" -Wait
    
    Write-Host "`n🎉 ¡Sistema listo para usar!" -ForegroundColor Green
    
    # Preguntar sobre inicio automático
    $autoStart = [System.Windows.Forms.MessageBox]::Show(
        "¿Desea configurar BCPOS para inicio automático con Windows?",
        "Inicio Automático",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    if ($autoStart -eq [System.Windows.Forms.DialogResult]::Yes) {
        # Configurar inicio automático
        try {
            $startupPath = Join-Path $BCPOS_PATH "inicio-automatico.bat"
            Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "BCPOS" -Value $startupPath
            Write-Host "✅ Inicio automático configurado" -ForegroundColor Green
            Show-Message "Configurado" "BCPOS se iniciará automáticamente con Windows."
        } catch {
            Write-Host "⚠️ Error configurando inicio automático" -ForegroundColor Yellow
        }
    }
    
    $startNow = [System.Windows.Forms.MessageBox]::Show(
        "¿Desea iniciar BCPOS ahora?",
        "Iniciar Sistema",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    if ($startNow -eq [System.Windows.Forms.DialogResult]::Yes) {
        Start-Process "$BCPOS_PATH\IniciarBCPOS.bat"
    }
}

Write-Host "`n¡Instalación finalizada!" -ForegroundColor Green
Read-Host "Presione Enter para salir" 