#!/bin/bash

# Script de Instalación Automática de rclone
# Sistema POS Honduras

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Instalador de rclone para Sistema POS${NC}"
echo -e "${BLUE}=====================================${NC}"

# Detectar sistema operativo
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Verificar si rclone ya está instalado
check_rclone() {
    if command -v rclone &> /dev/null; then
        local version=$(rclone version | head -n1)
        echo -e "${GREEN}✅ rclone ya está instalado: ${version}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ rclone no está instalado${NC}"
        return 1
    fi
}

# Instalar rclone en Linux
install_linux() {
    echo -e "${YELLOW}📦 Instalando rclone en Linux...${NC}"
    
    # Verificar si curl está instalado
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl no está instalado. Instalando curl...${NC}"
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y curl
        elif command -v yum &> /dev/null; then
            sudo yum install -y curl
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y curl
        else
            echo -e "${RED}❌ No se pudo instalar curl automáticamente${NC}"
            exit 1
        fi
    fi
    
    # Instalar rclone
    curl https://rclone.org/install.sh | sudo bash
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ rclone instalado exitosamente${NC}"
    else
        echo -e "${RED}❌ Error al instalar rclone${NC}"
        exit 1
    fi
}

# Instalar rclone en macOS
install_macos() {
    echo -e "${YELLOW}📦 Instalando rclone en macOS...${NC}"
    
    # Verificar si Homebrew está instalado
    if command -v brew &> /dev/null; then
        echo -e "${BLUE}🍺 Usando Homebrew para instalar rclone...${NC}"
        brew install rclone
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ rclone instalado exitosamente con Homebrew${NC}"
        else
            echo -e "${RED}❌ Error al instalar rclone con Homebrew${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️ Homebrew no está instalado. Usando instalador oficial...${NC}"
        
        # Instalar usando el script oficial
        curl https://rclone.org/install.sh | sudo bash
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ rclone instalado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al instalar rclone${NC}"
            exit 1
        fi
    fi
}

# Instalar rclone en Windows
install_windows() {
    echo -e "${YELLOW}📦 Para Windows, descargue rclone manualmente:${NC}"
    echo -e "${BLUE}1. Visite: https://rclone.org/downloads/${NC}"
    echo -e "${BLUE}2. Descargue la versión para Windows${NC}"
    echo -e "${BLUE}3. Extraiga el archivo ZIP${NC}"
    echo -e "${BLUE}4. Agregue rclone.exe al PATH del sistema${NC}"
    echo -e "${BLUE}5. Reinicie la aplicación POS${NC}"
    
    # Intentar abrir la página de descarga
    if command -v start &> /dev/null; then
        start https://rclone.org/downloads/
    elif command -v open &> /dev/null; then
        open https://rclone.org/downloads/
    fi
}

# Configurar rclone después de la instalación
configure_rclone() {
    echo -e "\n${BLUE}🔧 Configuración de rclone${NC}"
    echo -e "${YELLOW}Para configurar Google Drive o OneDrive:${NC}"
    echo -e "${BLUE}1. Ejecute: rclone config${NC}"
    echo -e "${BLUE}2. Seleccione 'n' para nuevo remote${NC}"
    echo -e "${BLUE}3. Para Google Drive: nombre='gdrive', tipo='drive'${NC}"
    echo -e "${BLUE}4. Para OneDrive: nombre='onedrive', tipo='onedrive'${NC}"
    echo -e "${BLUE}5. Siga las instrucciones de autenticación${NC}"
    echo -e "${BLUE}6. Vuelva al sistema POS para probar la conexión${NC}"
}

# Función principal
main() {
    echo -e "${BLUE}🔍 Verificando instalación actual...${NC}"
    
    if check_rclone; then
        echo -e "${GREEN}✅ rclone ya está disponible${NC}"
        configure_rclone
        exit 0
    fi
    
    local os=$(detect_os)
    echo -e "${BLUE}🖥️ Sistema operativo detectado: ${os}${NC}"
    
    case $os in
        "linux")
            install_linux
            ;;
        "macos")
            install_macos
            ;;
        "windows")
            install_windows
            ;;
        "unknown")
            echo -e "${RED}❌ Sistema operativo no compatible${NC}"
            echo -e "${YELLOW}Visite https://rclone.org/downloads/ para descargar manualmente${NC}"
            exit 1
            ;;
    esac
    
    # Verificar instalación exitosa
    echo -e "\n${BLUE}🔍 Verificando instalación...${NC}"
    if check_rclone; then
        echo -e "${GREEN}🎉 ¡Instalación completada exitosamente!${NC}"
        configure_rclone
    else
        echo -e "${RED}❌ Error en la instalación. Intente instalar manualmente.${NC}"
        exit 1
    fi
}

# Ejecutar función principal
main 