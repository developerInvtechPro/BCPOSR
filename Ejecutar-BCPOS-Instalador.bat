@echo off
title BCPOS - Ejecutar Instalador
cls

echo ================================================
echo  🚀 BCPOS - EJECUTAR INSTALADOR WINDOWS
echo     Solucionando permisos de PowerShell
echo ================================================
echo.

echo 🔧 Configurando permisos de PowerShell temporalmente...
echo.

REM Ejecutar PowerShell con política de ejecución bypass
powershell.exe -ExecutionPolicy Bypass -File "BCPOS-Instalador-Windows.ps1"

echo.
echo ✅ Instalación completada
echo.
pause 