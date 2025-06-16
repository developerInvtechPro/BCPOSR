@echo off
title BCPOS - Habilitar PowerShell y Ejecutar
cls

echo ================================================
echo  🚀 BCPOS - HABILITAR POWERSHELL Y EJECUTAR
echo     Configuración permanente de permisos
echo ================================================
echo.

echo ⚠️ IMPORTANTE: Este script requiere permisos de administrador
echo    para cambiar la política de ejecución de PowerShell.
echo.
echo 🔧 ¿Desea continuar? (S/N)
set /p choice="Respuesta: "

if /i "%choice%" NEQ "S" (
    echo Operación cancelada.
    pause
    exit
)

echo.
echo 🔧 Habilitando ejecución de scripts PowerShell...

REM Verificar si se ejecuta como administrador
net session >nul 2>&1
if %errorlevel% NEQ 0 (
    echo.
    echo ❌ ERROR: Se requieren permisos de administrador
    echo    Haga clic derecho en este archivo y seleccione "Ejecutar como administrador"
    echo.
    pause
    exit
)

REM Cambiar política de ejecución
powershell.exe -Command "Set-ExecutionPolicy RemoteSigned -Force"

echo ✅ Política de PowerShell configurada
echo.
echo 🚀 Ejecutando instalador BCPOS...
echo.

REM Ejecutar el instalador
powershell.exe -File "BCPOS-Instalador-Windows.ps1"

echo.
echo ✅ Proceso completado
echo.
pause 