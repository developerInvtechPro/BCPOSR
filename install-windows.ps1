# Script de instalación para Sistema POS Honduras en Windows
# Ejecutar como: PowerShell -ExecutionPolicy Bypass -File install-windows.ps1

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🪟 INSTALADOR AUTOMÁTICO - SISTEMA POS HONDURAS" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Blue
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Para instalar Node.js:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://nodejs.org/"
    Write-Host "2. Descarga la versión LTS"
    Write-Host "3. Ejecuta el instalador"
    Write-Host "4. Reinicia PowerShell y ejecuta este script nuevamente"
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar Git
Write-Host ""
Write-Host "🔍 Verificando Git..." -ForegroundColor Blue
if (Test-Command "git") {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Git no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Para instalar Git:" -ForegroundColor Yellow
    Write-Host "1. Ve a: https://git-scm.com/download/win"
    Write-Host "2. Descarga e instala Git para Windows"
    Write-Host "3. Reinicia PowerShell y ejecuta este script nuevamente"
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando instalación..." -ForegroundColor Green
Write-Host ""

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️ Error en npm install, intentando con --force..." -ForegroundColor Yellow
        npm install --force
        if ($LASTEXITCODE -ne 0) {
            throw "Error instalando dependencias"
        }
    }
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias: $_" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Crear archivo .env.local si no existe
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "📝 Creando archivo de configuración..." -ForegroundColor Blue
    
    $envContent = @"
# Business Central Configuration
BC_TENANT_ID=tu-tenant-id
BC_CLIENT_ID=tu-client-id
BC_CLIENT_SECRET=tu-client-secret
BC_ENVIRONMENT=Production
BC_COMPANY_ID=tu-company-id

# Puerto personalizado (opcional)
PORT=3000
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
}

# Limpiar cache si existe
if (Test-Path ".next") {
    Write-Host ""
    Write-Host "🧹 Limpiando cache anterior..." -ForegroundColor Blue
    Remove-Item -Recurse -Force ".next"
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ejecuta: npm run dev"
Write-Host "2. Abre tu navegador en: http://localhost:3000"
Write-Host "3. Configura Business Central en SUPER → Business Central"
Write-Host ""
Write-Host "🔧 Scripts disponibles:" -ForegroundColor Yellow
Write-Host "  npm run dev          - Iniciar servidor de desarrollo"
Write-Host "  npm run build        - Construir para producción"
Write-Host "  npm run bc:restart   - Reinicio limpio del servidor"
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

# Preguntar si quiere iniciar el servidor
Write-Host ""
$start = Read-Host "¿Quieres iniciar el servidor ahora? (s/n)"
if ($start -eq "s" -or $start -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host "El sistema estará disponible en: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "Para iniciar el servidor más tarde, ejecuta: npm run dev" -ForegroundColor Yellow
}

Read-Host "Presiona Enter para salir" 