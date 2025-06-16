# 🚀 CREAR EJECUTABLE BCPOS - INSTRUCCIONES

## **MÉTODO 1: PowerShell a EXE (Recomendado)**

### **Paso 1: Instalar ps2exe**
```powershell
# Ejecutar en PowerShell como Administrador
Install-Module -Name ps2exe -Force
```

### **Paso 2: Convertir a EXE**
```powershell
# Navegar a la carpeta donde está el archivo .ps1
cd "C:\ruta\donde\esta\el\archivo"

# Convertir a EXE
ps2exe -inputFile "BCPOS-Instalador-Completo.ps1" -outputFile "BCPOS-Instalador.exe" -iconFile "icono.ico" -title "BCPOS Instalador" -description "Instalador completo de BCPOS" -company "BCPOS" -product "Sistema POS" -version "1.0.0.0"
```

### **Paso 3: Opciones avanzadas**
```powershell
# Con más opciones
ps2exe -inputFile "BCPOS-Instalador-Completo.ps1" -outputFile "BCPOS-Instalador.exe" -iconFile "icono.ico" -title "BCPOS Instalador Completo" -description "Instalador automático de BCPOS con base de datos" -company "BCPOS Honduras" -product "Sistema POS Completo" -version "1.0.0.0" -requireAdmin -noConsole -noOutput
```

---

## **MÉTODO 2: Usando IExpress (Windows nativo)**

### **Paso 1: Abrir IExpress**
1. Presionar `Win + R`
2. Escribir `iexpress`
3. Presionar Enter

### **Paso 2: Configurar el paquete**
1. Seleccionar "Create new Self Extraction Directive file"
2. Seleccionar "Extract files and run an installation command"
3. Título del paquete: `BCPOS - Instalador Completo`
4. Prompt de confirmación: `¿Desea instalar BCPOS?`
5. Licencia: (Opcional)
6. Archivos a empaquetar:
   - `BCPOS-Instalador-Completo.bat`
   - Cualquier archivo adicional necesario
7. Comando de instalación: `BCPOS-Instalador-Completo.bat`
8. Ventana de progreso: `Instalando BCPOS...`
9. Mensaje final: `BCPOS instalado correctamente`
10. Nombre del ejecutable: `BCPOS-Instalador.exe`
11. Opciones de reinicio: `No restart`
12. Guardar directiva: `BCPOS-Installer.SED`

---

## **MÉTODO 3: Usando NSIS (Nullsoft Scriptable Install System)**

### **Paso 1: Instalar NSIS**
- Descargar desde: https://nsis.sourceforge.io/
- Instalar normalmente

### **Paso 2: Crear script NSIS**
```nsis
; BCPOS Installer Script
!define APPNAME "BCPOS"
!define COMPANYNAME "BCPOS Honduras"
!define DESCRIPTION "Sistema de Punto de Venta Completo"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0

RequestExecutionLevel admin
InstallDir "$DESKTOP\${APPNAME}"

Name "${APPNAME}"
Icon "icono.ico"
outFile "BCPOS-Instalador.exe"

Page directory
Page instfiles

Section "install"
    SetOutPath $INSTDIR
    
    ; Copiar archivos del instalador
    File "BCPOS-Instalador-Completo.bat"
    
    ; Ejecutar instalador
    ExecWait "$INSTDIR\BCPOS-Instalador-Completo.bat"
    
    ; Crear accesos directos
    CreateShortCut "$DESKTOP\BCPOS Instalador.lnk" "$INSTDIR\BCPOS-Instalador-Completo.bat"
SectionEnd
```

### **Paso 3: Compilar**
1. Abrir NSIS
2. Compilar el script
3. Generar el ejecutable

---

## **MÉTODO 4: Usando Inno Setup (Más profesional)**

### **Paso 1: Instalar Inno Setup**
- Descargar desde: https://jrsoftware.org/isinfo.php
- Instalar normalmente

### **Paso 2: Crear script Inno Setup**
```pascal
[Setup]
AppName=BCPOS
AppVersion=1.0
DefaultDirName={autopf}\BCPOS
DefaultGroupName=BCPOS
OutputBaseFilename=BCPOS-Instalador
Compression=lzma
SolidCompression=yes
WizardStyle=modern
SetupIconFile=icono.ico

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Files]
Source: "BCPOS-Instalador-Completo.bat"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\BCPOS Instalador"; Filename: "{app}\BCPOS-Instalador-Completo.bat"
Name: "{commondesktop}\BCPOS Instalador"; Filename: "{app}\BCPOS-Instalador-Completo.bat"

[Run]
Filename: "{app}\BCPOS-Instalador-Completo.bat"; Description: "Ejecutar instalador BCPOS"; Flags: nowait postinstall skipifsilent
```

---

## **RECOMENDACIÓN FINAL**

### **Para uso simple:**
- **Usar Método 1 (ps2exe)** - Más rápido y directo

### **Para distribución profesional:**
- **Usar Método 4 (Inno Setup)** - Más opciones y profesional

### **Comando final recomendado:**
```powershell
ps2exe -inputFile "BCPOS-Instalador-Completo.ps1" -outputFile "BCPOS-Instalador.exe" -title "BCPOS Instalador" -requireAdmin -noConsole
```

---

## **VENTAJAS DEL EJECUTABLE:**

✅ **Un solo archivo** - Fácil distribución
✅ **No se minimiza** - Mejor experiencia de usuario  
✅ **Interfaz gráfica** - Ventanas profesionales
✅ **Instalación automática** - Todo en uno
✅ **Iconos automáticos** - Se crean en el escritorio
✅ **Base de datos incluida** - SQLite configurado automáticamente

## **RESULTADO FINAL:**

Un archivo `BCPOS-Instalador.exe` que:
1. **Instala Node.js** automáticamente si no existe
2. **Crea el proyecto** completo en `Desktop\BCPOS`
3. **Instala dependencias** automáticamente
4. **Configura la base de datos** SQLite
5. **Crea iconos** en el escritorio
6. **¡Listo para usar!** - Un solo clic 