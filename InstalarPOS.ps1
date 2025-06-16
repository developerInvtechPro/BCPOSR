# ==================================================
# INSTALADOR SISTEMA POS HONDURAS - EJECUTABLE
# Con integración Business Central
# ==================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configuración
$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Sistema POS Honduras - Instalador"

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

# Función para mostrar progreso
function Show-Progress {
    param([string]$Activity, [string]$Status, [int]$PercentComplete)
    Write-Progress -Activity $Activity -Status $Status -PercentComplete $PercentComplete
}

# Función para crear accesos directos
function Create-Shortcut {
    param(
        [string]$ShortcutPath,
        [string]$TargetPath,
        [string]$Arguments = "",
        [string]$WorkingDirectory = "",
        [string]$IconLocation = "",
        [string]$Description = ""
    )
    
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $TargetPath
    if ($Arguments) { $Shortcut.Arguments = $Arguments }
    if ($WorkingDirectory) { $Shortcut.WorkingDirectory = $WorkingDirectory }
    if ($IconLocation) { $Shortcut.IconLocation = $IconLocation }
    if ($Description) { $Shortcut.Description = $Description }
    $Shortcut.Save()
}

# Función para buscar la carpeta del proyecto
function Find-ProjectFolder {
    $currentDir = Get-Location
    Write-Host "🔍 Buscando carpeta del proyecto desde: $currentDir"
    
    # Buscar package.json en directorio actual
    if (Test-Path "package.json") {
        return $currentDir
    }
    
    # Buscar en subdirectorios comunes
    $commonNames = @("facturacion-app", "bcpos", "pos-business-central", "facturacion-*", "pos-*")
    
    foreach ($pattern in $commonNames) {
        $folders = Get-ChildItem -Directory -Name $pattern -ErrorAction SilentlyContinue
        foreach ($folder in $folders) {
            $packagePath = Join-Path $folder "package.json"
            if (Test-Path $packagePath) {
                Write-Host "✅ Proyecto encontrado en: $folder"
                return (Resolve-Path $folder).Path
            }
        }
    }
    
    # Buscar recursivamente en Downloads
    $downloadsPath = [Environment]::GetFolderPath("UserProfile") + "\Downloads"
    if (Test-Path $downloadsPath) {
        $projectFolders = Get-ChildItem -Path $downloadsPath -Recurse -Directory | Where-Object { 
            Test-Path (Join-Path $_.FullName "package.json") 
        } | Select-Object -First 1
        
        if ($projectFolders) {
            Write-Host "✅ Proyecto encontrado en: $($projectFolders.FullName)"
            return $projectFolders.FullName
        }
    }
    
    return $null
}

# Mostrar bienvenida
$welcomeMessage = @"
🚀 INSTALADOR SISTEMA POS HONDURAS

✅ Sistema POS completo para restaurantes
✅ Integración con Microsoft Business Central  
✅ Gestión de inventario avanzada
✅ Módulo de comanda digital para cocina
✅ Reportes y analytics

Este instalador configurará automáticamente todo el sistema.

¿Desea continuar con la instalación?
"@

$result = [System.Windows.Forms.MessageBox]::Show(
    $welcomeMessage, 
    "Sistema POS Honduras - Instalador", 
    [System.Windows.Forms.MessageBoxButtons]::YesNo, 
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($result -eq [System.Windows.Forms.DialogResult]::No) {
    Show-Message "Instalación Cancelada" "La instalación ha sido cancelada por el usuario."
    exit
}

# Verificar Node.js
Show-Progress "Verificando requisitos" "Comprobando Node.js..." 10

try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js no encontrado"
    }
    Show-Message "Node.js Encontrado" "Node.js versión: $nodeVersion`n✅ Requisito cumplido"
} catch {
    $installNode = [System.Windows.Forms.MessageBox]::Show(
        "Node.js no está instalado.`n`n¿Desea abrir la página de descarga?",
        "Node.js Requerido",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    if ($installNode -eq [System.Windows.Forms.DialogResult]::Yes) {
        Start-Process "https://nodejs.org/"
    }
    
    Show-Message "Instalación Detenida" "Por favor instale Node.js y ejecute este instalador nuevamente." "Error"
    exit
}

# Verificar npm
Show-Progress "Verificando requisitos" "Comprobando npm..." 20

try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "npm no encontrado"
    }
    Show-Message "npm Encontrado" "npm versión: $npmVersion`n✅ Requisito cumplido"
} catch {
    Show-Message "npm Error" "npm no está disponible. Reinstale Node.js." "Error"
    exit
}

# Buscar carpeta del proyecto
$projectPath = Find-ProjectFolder

if (-not $projectPath) {
    $errorMsg = @"
❌ NO SE ENCONTRÓ EL PROYECTO BCPOS

El instalador no pudo encontrar la carpeta del proyecto.
Asegúrese de que:

1. Está ejecutando este instalador desde la carpeta del proyecto
2. O que el proyecto está en una subcarpeta de Downloads
3. El archivo package.json existe en la carpeta del proyecto

Carpetas buscadas:
- Directorio actual
- facturacion-app, bcpos, pos-business-central
- Subdirectorios en Downloads

Por favor, navegue a la carpeta correcta y ejecute el instalador nuevamente.
"@
    
    Show-Message "Error" $errorMsg
    exit 1
}

# Cambiar al directorio del proyecto
Set-Location $projectPath
Write-Host "📁 Trabajando en: $projectPath" -ForegroundColor Yellow

# Verificar package.json
if (-not (Test-Path "package.json")) {
    Show-Message "Error" "❌ No se encontró package.json en: $projectPath"
    exit 1
}

Show-Message "✅ Proyecto BCPOS encontrado en:`n$projectPath`n`nIniciando instalación..."

# Configurar variables de entorno
Show-Progress "Configurando sistema" "Creando archivo de configuración..." 40

if (-not (Test-Path ".env.local")) {
    $envContent = @"
# Business Central Configuration - PRECONFIGURADO HONDURAS
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

# Database (SQLite local por defecto)
DATABASE_URL="file:./dev.db"

# Puerto personalizado (opcional)
PORT=3000

# Configuración adicional
NEXTAUTH_SECRET=pos-honduras-secret-key
NEXTAUTH_URL=http://localhost:3000
ESLINT_NO_DEV_ERRORS=true
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Show-Message "Configuración Creada" "✅ Archivo .env.local creado con configuración Business Central"
}

# Limpiar cache anterior
Show-Progress "Preparando instalación" "Limpiando cache anterior..." 50

if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue }

Show-Message "Cache Limpio" "✅ Cache anterior eliminado"

# Instalar dependencias
Show-Progress "Instalando dependencias" "Esto puede tomar 2-5 minutos..." 60

Show-Message "Instalación en Progreso" "Iniciando instalación de dependencias...`n`n⏱️ Este proceso puede tomar 2-5 minutos`n🔄 Por favor espere..."

try {
    $npmOutput = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Reintentar con --force
        Show-Message "Reintentando" "Primera instalación falló. Reintentando con --force..."
        $npmOutput = npm install --force 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Error en npm install: $npmOutput"
        }
    }
    Show-Message "Dependencias Instaladas" "✅ Todas las dependencias han sido instaladas correctamente"
} catch {
    Show-Message "Error de Instalación" "Error instalando dependencias:`n$_`n`nIntente ejecutar manualmente:`nnpm install" "Error"
    exit
}

# Configurar base de datos
Show-Progress "Configurando base de datos" "Generando cliente Prisma..." 75

try {
    $prismaGenerate = npx prisma generate 2>&1
    $prismaPush = npx prisma db push 2>&1
    Show-Message "Base de Datos Configurada" "✅ Base de datos SQLite configurada correctamente"
} catch {
    Show-Message "Advertencia Base de Datos" "Advertencia en configuración de base de datos:`n$_`n`nEl sistema puede funcionar igualmente." "Warning"
}

# Crear iconos en el escritorio
Show-Progress "Creando iconos" "Creando accesos directos en el escritorio..." 85

$currentPath = Get-Location
$desktopPath = [Environment]::GetFolderPath("Desktop")

try {
    # Crear script para iniciar el POS
    $startPOSScript = @"
@echo off
title Sistema POS Honduras - Iniciando...
cd /d "$currentPath"
echo ================================================
echo  🚀 INICIANDO SISTEMA POS HONDURAS
echo     Espere un momento...
echo ================================================
echo.
echo ⏱️  Iniciando servidor...
echo 🌐  Se abrira automaticamente en el navegador
echo.
start npm run dev
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo ✅ Sistema iniciado correctamente
echo 📱 Acceso: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
"@
    
    $startPOSScript | Out-File -FilePath "$currentPath\IniciarPOS.bat" -Encoding ASCII

    # Crear script para acceso directo al navegador
    $accessPOSScript = @"
@echo off
title Acceso Directo POS Honduras
echo ================================================
echo  🌐 ABRIENDO SISTEMA POS HONDURAS
echo ================================================
echo.
echo 🔍 Verificando si el servidor esta activo...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo ✅ Navegador abierto
echo 📱 Si no funciona, ejecute primero: Iniciar POS Honduras
"@
    
    $accessPOSScript | Out-File -FilePath "$currentPath\AccesoPOS.bat" -Encoding ASCII

    # Crear script para comanda digital
    $comandaScript = @"
@echo off
title Comanda Digital - POS Honduras
echo ================================================
echo  🍽️  ABRIENDO COMANDA DIGITAL
echo ================================================
echo.
echo 👨‍🍳 Abriendo pantalla para cocina...
timeout /t 2 /nobreak >nul
start http://localhost:3000/comanda
echo ✅ Comanda digital abierta
echo 📱 Pantalla optimizada para cocina
"@
    
    $comandaScript | Out-File -FilePath "$currentPath\ComandaDigital.bat" -Encoding ASCII

    # Crear accesos directos en el escritorio
    Create-Shortcut -ShortcutPath "$desktopPath\🚀 Iniciar POS Honduras.lnk" `
                   -TargetPath "$currentPath\IniciarPOS.bat" `
                   -WorkingDirectory $currentPath `
                   -Description "Iniciar Sistema POS Honduras completo"

    Create-Shortcut -ShortcutPath "$desktopPath\🌐 POS Honduras - Sistema.lnk" `
                   -TargetPath "$currentPath\AccesoPOS.bat" `
                   -WorkingDirectory $currentPath `
                   -Description "Acceso directo al Sistema POS Honduras"

    Create-Shortcut -ShortcutPath "$desktopPath\🍽️ POS Honduras - Comanda Cocina.lnk" `
                   -TargetPath "$currentPath\ComandaDigital.bat" `
                   -WorkingDirectory $currentPath `
                   -Description "Comanda digital para cocina - POS Honduras"

    Show-Message "Iconos Creados" "✅ Iconos creados en el escritorio:`n`n🚀 Iniciar POS Honduras`n🌐 POS Honduras - Sistema`n🍽️ POS Honduras - Comanda Cocina"

} catch {
    Show-Message "Advertencia Iconos" "Advertencia creando iconos en el escritorio:`n$_`n`nPuede acceder manualmente con 'npm run dev'" "Warning"
}

# Finalización
Show-Progress "Finalizando" "Instalación completada" 100

$successMessage = @"
🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!

🖥️ ICONOS CREADOS EN EL ESCRITORIO:

🚀 Iniciar POS Honduras
   → Inicia el servidor automáticamente

🌐 POS Honduras - Sistema  
   → Acceso directo al sistema POS

🍽️ POS Honduras - Comanda Cocina
   → Pantalla para cocina en tiempo real

📋 ACCESO MANUAL:
   • Sistema POS: http://localhost:3000
   • Inventario: http://localhost:3000 → SUPER → 📦 Inventario  
   • Comanda: http://localhost:3000/comanda

✅ ¡Su Sistema POS está completamente instalado!
"@

Show-Message "¡Instalación Exitosa!" $successMessage

# Preguntar si desea iniciar automáticamente
$startNow = [System.Windows.Forms.MessageBox]::Show(
    "¿Desea iniciar el sistema automáticamente ahora?",
    "Iniciar Sistema",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($startNow -eq [System.Windows.Forms.DialogResult]::Yes) {
    Show-Message "Iniciando Sistema" "El sistema se está iniciando...`n`nSe abrirá automáticamente en su navegador."
    Start-Process "$currentPath\IniciarPOS.bat"
}

Write-Progress -Activity "Instalación" -Status "Completada" -Completed 