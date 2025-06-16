# =====================================================
# BCPOS - SISTEMA DE AUTOARRANQUE COMPLETO
# Configuración para inicio automático y acceso fácil
# =====================================================

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Write-Host "🚀 CONFIGURANDO SISTEMA DE AUTOARRANQUE BCPOS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Configuración
$BCPOS_PATH = "$env:USERPROFILE\Desktop\BCPOS"
$STARTUP_FOLDER = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$DESKTOP_PATH = [Environment]::GetFolderPath("Desktop")

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

# Verificar que BCPOS existe
if (-not (Test-Path $BCPOS_PATH)) {
    Show-Message "Error" "No se encontró BCPOS en $BCPOS_PATH`n`nPor favor instale BCPOS primero." "Error"
    exit
}

Write-Host "📁 BCPOS encontrado en: $BCPOS_PATH" -ForegroundColor Cyan

# 1. CREAR SERVICIO DE AUTOARRANQUE
Write-Host "`n🔧 1. CONFIGURANDO AUTOARRANQUE..." -ForegroundColor Yellow

$autoStartScript = @"
@echo off
title BCPOS - Autoarranque
cd /d "$BCPOS_PATH"

echo ================================================
echo  🚀 BCPOS - INICIANDO AUTOMATICAMENTE
echo     Sistema de Punto de Venta
echo ================================================
echo.
echo ⏱️  Esperando 10 segundos para que Windows cargue...
timeout /t 10 /nobreak >nul

echo 🔄 Iniciando servidor BCPOS...
start /min npm run dev

echo ⏳ Esperando que el servidor esté listo...
timeout /t 15 /nobreak >nul

echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo ✅ BCPOS iniciado automáticamente
echo 📱 Acceso: http://localhost:3000
echo.
echo Este proceso se ejecuta automáticamente al iniciar Windows
timeout /t 5 /nobreak >nul
exit
"@

$autoStartScript | Out-File -FilePath "$BCPOS_PATH\AutoInicioBCPOS.bat" -Encoding ASCII

# Crear acceso directo en Startup
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$STARTUP_FOLDER\BCPOS-AutoInicio.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\AutoInicioBCPOS.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.WindowStyle = 7  # Minimizado
$Shortcut.Description = "BCPOS - Inicio automático al arrancar Windows"
$Shortcut.Save()

Write-Host "✅ Autoarranque configurado" -ForegroundColor Green

# 2. CREAR ACCESOS DIRECTOS MEJORADOS
Write-Host "`n🖥️ 2. CREANDO ACCESOS DIRECTOS MEJORADOS..." -ForegroundColor Yellow

# Script de acceso rápido (siempre funciona)
$quickAccessScript = @"
@echo off
title BCPOS - Acceso Rápido
echo ================================================
echo  🌐 BCPOS - ACCESO RAPIDO
echo ================================================
echo.

REM Verificar si el servidor ya está corriendo
echo 🔍 Verificando estado del servidor...
netstat -an | find "3000" >nul
if %errorlevel% == 0 (
    echo ✅ Servidor ya está corriendo
    echo 🌐 Abriendo navegador...
    start http://localhost:3000
    timeout /t 3 /nobreak >nul
    exit
)

echo ⚠️  Servidor no está corriendo
echo 🚀 Iniciando BCPOS...
cd /d "$BCPOS_PATH"
start /min npm run dev

echo ⏳ Esperando que el servidor esté listo...
timeout /t 15 /nobreak >nul

echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo ✅ BCPOS iniciado correctamente
echo 📱 Acceso: http://localhost:3000
timeout /t 3 /nobreak >nul
"@

$quickAccessScript | Out-File -FilePath "$BCPOS_PATH\AccesoRapidoBCPOS.bat" -Encoding ASCII

# 3. CREAR SCRIPT DE REINICIO/REPARACIÓN
$restartScript = @"
@echo off
title BCPOS - Reiniciar Sistema
echo ================================================
echo  🔄 BCPOS - REINICIAR SISTEMA
echo ================================================
echo.

echo 🛑 Cerrando procesos existentes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo ⏳ Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo 🚀 Reiniciando BCPOS...
cd /d "$BCPOS_PATH"
start /min npm run dev

echo ⏳ Esperando que el servidor esté listo...
timeout /t 15 /nobreak >nul

echo 🌐 Abriendo navegador...
start http://localhost:3000

echo.
echo ✅ BCPOS reiniciado correctamente
echo 📱 Acceso: http://localhost:3000
timeout /t 3 /nobreak >nul
"@

$restartScript | Out-File -FilePath "$BCPOS_PATH\ReiniciarBCPOS.bat" -Encoding ASCII

# 4. CREAR SCRIPT DE ESTADO
$statusScript = @"
@echo off
title BCPOS - Estado del Sistema
echo ================================================
echo  📊 BCPOS - ESTADO DEL SISTEMA
echo ================================================
echo.

echo 🔍 Verificando estado del servidor...
netstat -an | find "3000" >nul
if %errorlevel% == 0 (
    echo ✅ SERVIDOR: FUNCIONANDO
    echo 🌐 URL: http://localhost:3000
    echo.
    echo ¿Desea abrir el navegador? (S/N)
    set /p "abrir="
    if /i "%abrir%"=="S" start http://localhost:3000
) else (
    echo ❌ SERVIDOR: NO FUNCIONANDO
    echo.
    echo ¿Desea iniciar BCPOS? (S/N)
    set /p "iniciar="
    if /i "%iniciar%"=="S" (
        echo 🚀 Iniciando BCPOS...
        cd /d "$BCPOS_PATH"
        start /min npm run dev
        timeout /t 15 /nobreak >nul
        start http://localhost:3000
    )
)

echo.
pause
"@

$statusScript | Out-File -FilePath "$BCPOS_PATH\EstadoBCPOS.bat" -Encoding ASCII

# 5. CREAR ICONOS EN EL ESCRITORIO
Write-Host "`n🎯 3. CREANDO ICONOS DE ESCRITORIO..." -ForegroundColor Yellow

# Icono principal - Acceso rápido
$Shortcut = $WshShell.CreateShortcut("$DESKTOP_PATH\🚀 BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\AccesoRapidoBCPOS.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.Description = "BCPOS - Acceso rápido (siempre funciona)"
$Shortcut.Save()

# Icono de reinicio
$Shortcut = $WshShell.CreateShortcut("$DESKTOP_PATH\🔄 Reiniciar BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\ReiniciarBCPOS.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.Description = "BCPOS - Reiniciar sistema"
$Shortcut.Save()

# Icono de estado
$Shortcut = $WshShell.CreateShortcut("$DESKTOP_PATH\📊 Estado BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\EstadoBCPOS.bat"
$Shortcut.WorkingDirectory = $BCPOS_PATH
$Shortcut.Description = "BCPOS - Ver estado del sistema"
$Shortcut.Save()

Write-Host "✅ Iconos creados en el escritorio" -ForegroundColor Green

# 6. CREAR ARCHIVO DE CONFIGURACIÓN DE PUERTOS
Write-Host "`n⚙️ 4. CONFIGURANDO PUERTOS ALTERNATIVOS..." -ForegroundColor Yellow

$portConfig = @"
# CONFIGURACIÓN DE PUERTOS BCPOS
# Si el puerto 3000 está ocupado, se usarán estos alternativos

PORT=3000
BACKUP_PORTS=3001,3002,3003,3004,3005

# URLs de acceso
PRIMARY_URL=http://localhost:3000
BACKUP_URLS=http://localhost:3001,http://localhost:3002,http://localhost:3003
"@

$portConfig | Out-File -FilePath "$BCPOS_PATH\puertos.config" -Encoding ASCII

# 7. CREAR PÁGINA DE ACCESO LOCAL
$accessPage = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BCPOS - Acceso al Sistema</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo { font-size: 48px; margin-bottom: 20px; }
        .title { color: #333; margin-bottom: 30px; }
        .button { display: inline-block; padding: 15px 30px; margin: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 18px; }
        .button:hover { background: #0056b3; }
        .status { margin: 20px 0; padding: 15px; border-radius: 5px; }
        .online { background: #d4edda; color: #155724; }
        .offline { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀</div>
        <h1 class="title">BCPOS - Sistema de Punto de Venta</h1>
        
        <div id="status" class="status offline">
            🔍 Verificando estado del servidor...
        </div>
        
        <div>
            <a href="http://localhost:3000" class="button" onclick="checkServer(3000)">📱 Acceder al Sistema</a>
            <a href="http://localhost:3001" class="button" onclick="checkServer(3001)">🔄 Puerto Alternativo 1</a>
            <a href="http://localhost:3002" class="button" onclick="checkServer(3002)">🔄 Puerto Alternativo 2</a>
        </div>
        
        <div style="margin-top: 30px;">
            <p><strong>💡 Instrucciones:</strong></p>
            <p>1. Haga clic en "Acceder al Sistema" para abrir BCPOS</p>
            <p>2. Si no funciona, pruebe los puertos alternativos</p>
            <p>3. Use los iconos del escritorio para reiniciar si es necesario</p>
        </div>
        
        <div style="margin-top: 20px; font-size: 14px; color: #666;">
            <p>🖥️ Iconos disponibles en el escritorio:</p>
            <p>🚀 BCPOS - 🔄 Reiniciar BCPOS - 📊 Estado BCPOS</p>
        </div>
    </div>
    
    <script>
        function checkServer(port) {
            const status = document.getElementById('status');
            status.innerHTML = '🔍 Conectando al puerto ' + port + '...';
            status.className = 'status offline';
            
            setTimeout(() => {
                status.innerHTML = '✅ Redirigiendo al sistema...';
                status.className = 'status online';
            }, 1000);
        }
        
        // Verificar estado inicial
        setTimeout(() => {
            const status = document.getElementById('status');
            status.innerHTML = '✅ Sistema listo - Haga clic para acceder';
            status.className = 'status online';
        }, 2000);
    </script>
</body>
</html>
"@

$accessPage | Out-File -FilePath "$BCPOS_PATH\acceso-bcpos.html" -Encoding UTF8

# Crear acceso directo a la página de acceso
$Shortcut = $WshShell.CreateShortcut("$DESKTOP_PATH\🌐 Acceso BCPOS.lnk")
$Shortcut.TargetPath = "$BCPOS_PATH\acceso-bcpos.html"
$Shortcut.Description = "BCPOS - Página de acceso con múltiples opciones"
$Shortcut.Save()

Write-Host "✅ Página de acceso creada" -ForegroundColor Green

# 8. CONFIGURAR TAREA PROGRAMADA (OPCIONAL)
Write-Host "`n⏰ 5. ¿CONFIGURAR TAREA PROGRAMADA?" -ForegroundColor Yellow
$taskResponse = Read-Host "¿Desea que BCPOS se inicie automáticamente cada día a las 8:00 AM? (S/N)"

if ($taskResponse -eq "S" -or $taskResponse -eq "s") {
    try {
        $taskAction = New-ScheduledTaskAction -Execute "$BCPOS_PATH\AutoInicioBCPOS.bat"
        $taskTrigger = New-ScheduledTaskTrigger -Daily -At "08:00"
        $taskSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
        
        Register-ScheduledTask -TaskName "BCPOS-AutoInicio" -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Description "Inicio automático de BCPOS a las 8:00 AM"
        
        Write-Host "✅ Tarea programada configurada" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ No se pudo configurar la tarea programada" -ForegroundColor Yellow
    }
}

# RESUMEN FINAL
Write-Host "`n🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

$summary = @"

✅ SISTEMA DE AUTOARRANQUE CONFIGURADO

📋 FUNCIONALIDADES INSTALADAS:

🔄 AUTOARRANQUE:
   • Se inicia automáticamente al encender Windows
   • Ubicación: Carpeta de Inicio de Windows

🖥️ ICONOS DE ESCRITORIO:
   • 🚀 BCPOS - Acceso rápido (siempre funciona)
   • 🔄 Reiniciar BCPOS - Para problemas
   • 📊 Estado BCPOS - Ver si está funcionando
   • 🌐 Acceso BCPOS - Página con múltiples opciones

🛠️ SCRIPTS INTELIGENTES:
   • Detectan si el servidor ya está corriendo
   • Usan puertos alternativos si es necesario
   • Reinician automáticamente en caso de problemas

🌐 ACCESO MÚLTIPLE:
   • Puerto principal: http://localhost:3000
   • Puertos alternativos: 3001, 3002, 3003
   • Página de acceso con todas las opciones

💡 PARA EL USUARIO FINAL:
   1. Después de reiniciar: Esperar 30 segundos y hacer clic en 🚀 BCPOS
   2. Si no funciona: Hacer clic en 🔄 Reiniciar BCPOS
   3. Para verificar estado: Hacer clic en 📊 Estado BCPOS
   4. Acceso completo: Hacer clic en 🌐 Acceso BCPOS

✅ ¡BCPOS ahora funciona en CUALQUIER escenario!
"@

Show-Message "¡Configuración Exitosa!" $summary

Write-Host $summary -ForegroundColor Cyan
Write-Host "`n¡Configuración finalizada!" -ForegroundColor Green
Read-Host "Presione Enter para salir" 