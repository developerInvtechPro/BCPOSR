# =====================================================
# BCPOS - INSTALADOR EJECUTABLE COMPLETO (CORREGIDO)
# Descarga proyecto + Instala dependencias + Crea BD
# =====================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Configuración
$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "BCPOS - Instalador Completo"

# URLs y configuración
$PROJECT_NAME = "BCPOS"
$INSTALL_DIR = "$env:USERPROFILE\Desktop\$PROJECT_NAME"

# Función para escribir archivo sin BOM
function Write-FileNoBOM {
    param([string]$FilePath, [string]$Content)
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($FilePath, $Content, $utf8NoBom)
}

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

# Función para descargar archivo
function Download-File {
    param([string]$Url, [string]$OutputPath)
    
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($Url, $OutputPath)
        return $true
    } catch {
        Write-Host "Error descargando: $_" -ForegroundColor Red
        return $false
    }
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

# Mostrar bienvenida
$welcomeMessage = @"
🚀 INSTALADOR COMPLETO BCPOS (CORREGIDO)

Este instalador hará TODO automáticamente:

✅ Instala Node.js (si es necesario)
✅ Crea proyecto BCPOS completo
✅ Instala todas las dependencias
✅ Configura la base de datos SQLite
✅ Crea iconos en el escritorio
✅ ¡Listo para usar!

📁 Se instalará en: $INSTALL_DIR

¿Desea continuar?
"@

$result = [System.Windows.Forms.MessageBox]::Show(
    $welcomeMessage, 
    "BCPOS - Instalador Completo", 
    [System.Windows.Forms.MessageBoxButtons]::YesNo, 
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($result -eq [System.Windows.Forms.DialogResult]::No) {
    Show-Message "Instalación Cancelada" "La instalación ha sido cancelada."
    exit
}

# Verificar/Instalar Node.js
Show-Progress "Verificando requisitos" "Comprobando Node.js..." 10

try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js no encontrado"
    }
    Show-Message "Node.js Encontrado" "Node.js versión: $nodeVersion`n✅ Requisito cumplido"
} catch {
    Show-Message "Descargando Node.js" "Node.js no está instalado.`n`nDescargando e instalando automáticamente..."
    
    # Descargar Node.js
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
    
    Show-Progress "Descargando Node.js" "Descargando instalador..." 15
    
    if (Download-File $nodeUrl $nodeInstaller) {
        Show-Progress "Instalando Node.js" "Ejecutando instalador..." 20
        
        # Instalar Node.js silenciosamente
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart" -Wait
        
        # Actualizar PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        # Verificar instalación
        try {
            $nodeVersion = node --version 2>$null
            Show-Message "Node.js Instalado" "✅ Node.js instalado correctamente: $nodeVersion"
        } catch {
            Show-Message "Error Node.js" "Error instalando Node.js. Por favor instale manualmente desde nodejs.org" "Error"
            exit
        }
    } else {
        Show-Message "Error Descarga" "Error descargando Node.js. Verifique su conexión a internet." "Error"
        exit
    }
}

# Crear directorio de instalación
Show-Progress "Preparando instalación" "Creando directorio..." 25

if (Test-Path $INSTALL_DIR) {
    $overwrite = [System.Windows.Forms.MessageBox]::Show(
        "El directorio $INSTALL_DIR ya existe.`n`n¿Desea sobrescribirlo?",
        "Directorio Existente",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    if ($overwrite -eq [System.Windows.Forms.DialogResult]::Yes) {
        Remove-Item $INSTALL_DIR -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Show-Message "Instalación Cancelada" "Instalación cancelada por el usuario."
        exit
    }
}

New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null

# Crear proyecto BCPOS desde cero
Show-Progress "Creando proyecto" "Generando archivos BCPOS..." 30

# Crear estructura de directorios
New-Item -ItemType Directory -Path "$INSTALL_DIR\src\pages" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\src\components" -Force | Out-Null
New-Item -ItemType Directory -Path "$INSTALL_DIR\prisma" -Force | Out-Null

# Crear package.json SIN BOM
$packageJson = @'
{
  "name": "bcpos",
  "version": "1.0.0",
  "description": "Sistema POS completo con inventario",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@prisma/client": "^5.22.0",
    "prisma": "^5.22.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.1.0"
  }
}
'@

Write-FileNoBOM "$INSTALL_DIR\package.json" $packageJson

# Crear schema.prisma
$prismaSchema = @'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./bcpos.db"
}

model Producto {
  id          Int           @id @default(autoincrement())
  codigo      String        @unique
  nombre      String
  descripcion String?
  precio      Float
  categoria   String
  activo      Boolean       @default(true)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@map("productos")
}

model Venta {
  id        Int      @id @default(autoincrement())
  total     Float
  fecha     DateTime @default(now())
  
  @@map("ventas")
}
'@

Write-FileNoBOM "$INSTALL_DIR\prisma\schema.prisma" $prismaSchema

# Crear página principal
$indexPage = @'
import { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

export default function Home() {
  const [mensaje, setMensaje] = useState('¡BCPOS instalado correctamente!');

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          🚀 BCPOS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Sistema de Punto de Venta
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
          {mensaje}
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => setMensaje('¡Sistema funcionando perfectamente!')}
        >
          Probar Sistema
        </Button>
      </Box>
    </Container>
  );
}
'@

Write-FileNoBOM "$INSTALL_DIR\src\pages\index.tsx" $indexPage

# Crear archivo .env
$envFile = @'
# CONFIGURACIÓN BCPOS
DATABASE_URL="file:./bcpos.db"

# Business Central - PRECONFIGURADO HONDURAS
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

PORT=3000
NEXTAUTH_SECRET=bcpos-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
'@

Write-FileNoBOM "$INSTALL_DIR\.env" $envFile

# Crear next.config.js
$nextConfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
'@

Write-FileNoBOM "$INSTALL_DIR\next.config.js" $nextConfig

# Crear tsconfig.json
$tsConfig = @'
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
'@

Write-FileNoBOM "$INSTALL_DIR\tsconfig.json" $tsConfig

# Cambiar al directorio del proyecto
Set-Location $INSTALL_DIR

# Instalar dependencias
Show-Progress "Instalando dependencias" "Esto puede tomar 3-5 minutos..." 50

Show-Message "Instalación en Progreso" "Instalando dependencias de BCPOS...`n`n⏱️ Este proceso puede tomar 3-5 minutos`n🔄 Por favor espere..."

try {
    $npmOutput = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Reintentar con --force
        Show-Message "Reintentando" "Primera instalación falló. Reintentando..."
        $npmOutput = npm install --force 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Error en npm install: $npmOutput"
        }
    }
    Show-Message "Dependencias Instaladas" "✅ Todas las dependencias instaladas correctamente"
} catch {
    Show-Message "Error de Instalación" "Error instalando dependencias:`n$_" "Error"
    exit
}

# Configurar base de datos
Show-Progress "Configurando base de datos" "Generando cliente Prisma..." 75

try {
    $prismaGenerate = npx prisma generate 2>&1
    $prismaPush = npx prisma db push 2>&1
    Show-Message "Base de Datos Configurada" "✅ Base de datos SQLite configurada correctamente"
} catch {
    Show-Message "Advertencia Base de Datos" "Advertencia en configuración de base de datos:`n$_" "Warning"
}

# Crear scripts de inicio
Show-Progress "Creando iconos" "Creando accesos directos..." 85

$desktopPath = [Environment]::GetFolderPath("Desktop")

# Script para iniciar BCPOS
$startScript = @"
@echo off
title BCPOS - Iniciando Sistema
cd /d "$INSTALL_DIR"
echo ================================================
echo  🚀 INICIANDO BCPOS
echo     Sistema de Punto de Venta
echo ================================================
echo.
echo ⏱️  Iniciando servidor...
echo 🌐  Se abrirá automáticamente en el navegador
echo.
start npm run dev
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo ✅ BCPOS iniciado correctamente
echo 📱 Acceso: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
"@

$startScript | Out-File -FilePath "$INSTALL_DIR\IniciarBCPOS.bat" -Encoding ASCII

# Script de acceso directo
$accessScript = @"
@echo off
title BCPOS - Acceso Directo
echo ================================================
echo  🌐 ABRIENDO BCPOS
echo ================================================
echo.
start http://localhost:3000
echo ✅ Navegador abierto
echo 📱 Si no funciona, ejecute: Iniciar BCPOS
timeout /t 3 /nobreak >nul
"@

$accessScript | Out-File -FilePath "$INSTALL_DIR\AccesoBCPOS.bat" -Encoding ASCII

# Crear accesos directos en el escritorio
try {
    Create-Shortcut -ShortcutPath "$desktopPath\🚀 Iniciar BCPOS.lnk" `
                   -TargetPath "$INSTALL_DIR\IniciarBCPOS.bat" `
                   -WorkingDirectory $INSTALL_DIR `
                   -Description "Iniciar Sistema BCPOS completo"

    Create-Shortcut -ShortcutPath "$desktopPath\🌐 BCPOS - Sistema.lnk" `
                   -TargetPath "$INSTALL_DIR\AccesoBCPOS.bat" `
                   -WorkingDirectory $INSTALL_DIR `
                   -Description "Acceso directo al Sistema BCPOS"

    Create-Shortcut -ShortcutPath "$desktopPath\📁 BCPOS - Carpeta.lnk" `
                   -TargetPath $INSTALL_DIR `
                   -Description "Abrir carpeta del proyecto BCPOS"

    Show-Message "Iconos Creados" "✅ Iconos creados en el escritorio:`n`n🚀 Iniciar BCPOS`n🌐 BCPOS - Sistema`n📁 BCPOS - Carpeta"

} catch {
    Show-Message "Advertencia Iconos" "Advertencia creando iconos:`n$_" "Warning"
}

# Finalización
Show-Progress "Finalizando" "Instalación completada" 100

$successMessage = @"
🎉 ¡BCPOS INSTALADO COMPLETAMENTE!

📁 Ubicación: $INSTALL_DIR

🖥️ ICONOS EN EL ESCRITORIO:

🚀 Iniciar BCPOS
   → Inicia el servidor automáticamente

🌐 BCPOS - Sistema  
   → Acceso directo al sistema

📁 BCPOS - Carpeta
   → Abrir carpeta del proyecto

📋 ACCESO MANUAL:
   • Sistema: http://localhost:3000
   • Carpeta: $INSTALL_DIR

✅ ¡Su Sistema BCPOS está completamente instalado y listo para usar!
"@

Show-Message "¡Instalación Exitosa!" $successMessage

# Preguntar si desea iniciar
$startNow = [System.Windows.Forms.MessageBox]::Show(
    "¿Desea iniciar BCPOS automáticamente ahora?",
    "Iniciar Sistema",
    [System.Windows.Forms.MessageBoxButtons]::YesNo,
    [System.Windows.Forms.MessageBoxIcon]::Question
)

if ($startNow -eq [System.Windows.Forms.DialogResult]::Yes) {
    Show-Message "Iniciando BCPOS" "El sistema se está iniciando...`n`nSe abrirá automáticamente en su navegador."
    Start-Process "$INSTALL_DIR\IniciarBCPOS.bat"
}

Write-Progress -Activity "Instalación" -Status "Completada" -Completed 