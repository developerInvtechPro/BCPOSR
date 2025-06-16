# =====================================================
# REPARAR PACKAGE.JSON - QUITAR BOM
# =====================================================

Write-Host "🔧 REPARANDO PACKAGE.JSON..." -ForegroundColor Yellow

# Función para escribir archivo sin BOM
function Write-FileNoBOM {
    param([string]$FilePath, [string]$Content)
    
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($FilePath, $Content, $utf8NoBom)
}

# Buscar carpeta BCPOS
$bcposPath = "$env:USERPROFILE\Desktop\BCPOS"

if (-not (Test-Path $bcposPath)) {
    Write-Host "❌ No se encontró la carpeta BCPOS en el escritorio" -ForegroundColor Red
    Write-Host "Buscando en otras ubicaciones..." -ForegroundColor Yellow
    
    # Buscar en Downloads
    $downloadPath = "$env:USERPROFILE\Downloads\BCPOS"
    if (Test-Path $downloadPath) {
        $bcposPath = $downloadPath
        Write-Host "✅ Encontrado en Downloads" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró BCPOS. Por favor ejecute desde la carpeta del proyecto." -ForegroundColor Red
        Read-Host "Presione Enter para salir"
        exit
    }
}

Write-Host "📁 Trabajando en: $bcposPath" -ForegroundColor Cyan

# Cambiar al directorio
Set-Location $bcposPath

# Verificar que existe package.json
if (-not (Test-Path "package.json")) {
    Write-Host "❌ No se encontró package.json en la carpeta" -ForegroundColor Red
    Read-Host "Presione Enter para salir"
    exit
}

# Leer el contenido actual
$content = Get-Content "package.json" -Raw

# Quitar BOM si existe
$content = $content -replace "^\uFEFF", ""

# Crear package.json corregido
$packageJsonCorregido = @'
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

# Escribir archivo sin BOM
Write-FileNoBOM "package.json" $packageJsonCorregido

Write-Host "✅ package.json reparado (BOM eliminado)" -ForegroundColor Green

# Crear tsconfig.json si no existe
if (-not (Test-Path "tsconfig.json")) {
    Write-Host "📝 Creando tsconfig.json..." -ForegroundColor Yellow
    
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
    
    Write-FileNoBOM "tsconfig.json" $tsConfig
    Write-Host "✅ tsconfig.json creado" -ForegroundColor Green
}

# Crear next.config.js si no existe
if (-not (Test-Path "next.config.js")) {
    Write-Host "📝 Creando next.config.js..." -ForegroundColor Yellow
    
    $nextConfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
'@
    
    Write-FileNoBOM "next.config.js" $nextConfig
    Write-Host "✅ next.config.js creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 REPARACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos reparados:" -ForegroundColor Cyan
Write-Host "✅ package.json (sin BOM)" -ForegroundColor White
Write-Host "✅ tsconfig.json" -ForegroundColor White
Write-Host "✅ next.config.js" -ForegroundColor White
Write-Host ""
Write-Host "Ahora puede ejecutar:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""

# Preguntar si desea iniciar automáticamente
$iniciar = Read-Host "¿Desea iniciar BCPOS ahora? (S/N)"
if ($iniciar -eq "S" -or $iniciar -eq "s") {
    Write-Host ""
    Write-Host "🚀 Iniciando BCPOS..." -ForegroundColor Green
    Start-Process "cmd.exe" -ArgumentList "/c npm run dev && pause"
    Start-Sleep 3
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "¡Reparación finalizada!" -ForegroundColor Green
Read-Host "Presione Enter para salir" 