@echo off
title Crear Icono de Instalador POS

echo ================================================
echo  CREANDO ICONO DE INSTALADOR PROFESIONAL
echo ================================================
echo.

:: Crear script VBS para acceso directo
echo Set objShell = CreateObject("WScript.Shell") > crear_acceso.vbs
echo Set objShortcut = objShell.CreateShortcut("%USERPROFILE%\Desktop\Instalar Sistema POS.lnk") >> crear_acceso.vbs
echo objShortcut.TargetPath = "powershell.exe" >> crear_acceso.vbs
echo objShortcut.Arguments = "-ExecutionPolicy Bypass -File ""%CD%\InstalarPOS.ps1""" >> crear_acceso.vbs
echo objShortcut.WorkingDirectory = "%CD%" >> crear_acceso.vbs
echo objShortcut.IconLocation = "%CD%\pos-icon.ico,0" >> crear_acceso.vbs
echo objShortcut.Description = "Sistema POS Honduras - Instalador Automatico" >> crear_acceso.vbs
echo objShortcut.WindowStyle = 1 >> crear_acceso.vbs
echo objShortcut.Save >> crear_acceso.vbs

:: Ejecutar script VBS
cscript //nologo crear_acceso.vbs

:: Limpiar archivo temporal
del crear_acceso.vbs

echo ✅ ICONO CREADO EN ESCRITORIO
echo.
echo 📁 Archivo: "Instalar Sistema POS.lnk"
echo 🎯 Ubicación: Escritorio
echo 🎮 Función: Doble clic para instalar
echo.
echo ================================================
echo  INSTRUCCIONES DE USO:
echo ================================================
echo.
echo 1. Ve a tu Escritorio
echo 2. Busca: "Instalar Sistema POS"
echo 3. Doble clic en el icono
echo 4. Sigue las instrucciones graficas
echo.
pause 