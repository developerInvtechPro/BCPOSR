#!/bin/bash

# Script de Restauración de Backup desde la Nube
# Sistema POS Honduras

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Sistema de Restauración de Backup${NC}"
echo -e "${BLUE}====================================${NC}"

# Función para mostrar servicios disponibles
show_cloud_services() {
    services=()
    
    if rclone listremotes | grep -q "^gdrive:$"; then
        services+=("Google Drive")
    fi
    
    if rclone listremotes | grep -q "^onedrive:$"; then
        services+=("OneDrive")
    fi
    
    if [ ${#services[@]} -eq 0 ]; then
        echo -e "${RED}❌ No hay servicios de nube configurados${NC}"
        echo -e "${YELLOW}💡 Configure primero Google Drive o OneDrive con el script setup-backup-cloud.sh${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Servicios disponibles: ${services[*]}${NC}"
    return 0
}

# Función para listar backups disponibles
list_backups() {
    local service=$1
    local remote_name=""
    local folder=""
    
    if [[ "$service" == "Google Drive" ]]; then
        remote_name="gdrive"
        folder="Backups/Sistema-POS"
    elif [[ "$service" == "OneDrive" ]]; then
        remote_name="onedrive"
        folder="Backups/Sistema-POS"
    fi
    
    echo -e "${BLUE}📁 Listando backups en $service...${NC}"
    
    # Listar carpetas de backup
    backups=$(rclone lsf "${remote_name}:${folder}" 2>/dev/null | grep "^backup-" | sort -r)
    
    if [ -z "$backups" ]; then
        echo -e "${RED}❌ No se encontraron backups en $service${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Backups disponibles:${NC}"
    echo "$backups" | nl -w2 -s'. '
    
    return 0
}

# Función para obtener información de un backup
get_backup_info() {
    local service=$1
    local backup_name=$2
    local remote_name=""
    local folder=""
    
    if [[ "$service" == "Google Drive" ]]; then
        remote_name="gdrive"
        folder="Backups/Sistema-POS"
    elif [[ "$service" == "OneDrive" ]]; then
        remote_name="onedrive"
        folder="Backups/Sistema-POS"
    fi
    
    echo -e "${BLUE}📋 Información del backup: $backup_name${NC}"
    
    # Verificar si existe backup-info.json
    if rclone ls "${remote_name}:${folder}/${backup_name}/backup-info.json" >/dev/null 2>&1; then
        # Descargar y mostrar información
        rclone cat "${remote_name}:${folder}/${backup_name}/backup-info.json" 2>/dev/null | jq -r '
            "📅 Fecha: " + .fecha +
            "\n💾 Tamaño: " + .tamano_backup +
            "\n🖥️ Servidor: " + .servidor +
            "\n👤 Usuario: " + .usuario +
            "\n🏷️ Versión: " + .version
        ' 2>/dev/null || {
            # Si jq no está disponible, mostrar JSON crudo
            echo -e "${YELLOW}⚠️ Información básica (jq no disponible):${NC}"
            rclone cat "${remote_name}:${folder}/${backup_name}/backup-info.json" 2>/dev/null
        }
    else
        echo -e "${YELLOW}⚠️ No se encontró información detallada del backup${NC}"
    fi
    
    # Mostrar archivos en el backup
    echo -e "\n${BLUE}📂 Contenido del backup:${NC}"
    rclone ls "${remote_name}:${folder}/${backup_name}" 2>/dev/null | head -10
}

# Función para restaurar backup
restore_backup() {
    local service=$1
    local backup_name=$2
    local restore_dir="./restore-$(date +%Y%m%d_%H%M%S)"
    local remote_name=""
    local folder=""
    
    if [[ "$service" == "Google Drive" ]]; then
        remote_name="gdrive"
        folder="Backups/Sistema-POS"
    elif [[ "$service" == "OneDrive" ]]; then
        remote_name="onedrive"
        folder="Backups/Sistema-POS"
    fi
    
    echo -e "${BLUE}🔄 Iniciando restauración...${NC}"
    echo -e "   • Backup: $backup_name"
    echo -e "   • Servicio: $service"
    echo -e "   • Destino: $restore_dir"
    
    # Crear directorio de restauración
    mkdir -p "$restore_dir"
    
    # Descargar backup
    echo -e "${YELLOW}📥 Descargando backup desde $service...${NC}"
    rclone copy "${remote_name}:${folder}/${backup_name}" "$restore_dir" \
        --progress \
        --transfers 4 \
        --checkers 8
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al descargar el backup${NC}"
        rm -rf "$restore_dir"
        return 1
    fi
    
    echo -e "${GREEN}✅ Backup descargado exitosamente${NC}"
    
    # Extraer código fuente si existe
    if [ -f "$restore_dir/codigo-fuente.tar.gz" ]; then
        echo -e "${YELLOW}📦 Extrayendo código fuente...${NC}"
        tar -xzf "$restore_dir/codigo-fuente.tar.gz" -C "$restore_dir"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Código fuente extraído${NC}"
        else
            echo -e "${RED}❌ Error al extraer código fuente${NC}"
        fi
    fi
    
    # Extraer logs si existen
    if [ -f "$restore_dir/logs.tar.gz" ]; then
        echo -e "${YELLOW}📋 Extrayendo logs...${NC}"
        tar -xzf "$restore_dir/logs.tar.gz" -C "$restore_dir"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Logs extraídos${NC}"
        else
            echo -e "${RED}❌ Error al extraer logs${NC}"
        fi
    fi
    
    echo -e "\n${GREEN}🎉 Restauración completada!${NC}"
    echo -e "${BLUE}📋 Pasos siguientes:${NC}"
    echo -e "   1. Navegar a: cd $restore_dir"
    echo -e "   2. Instalar dependencias: npm install"
    echo -e "   3. Construir aplicación: npm run build"
    echo -e "   4. Verificar configuraciones en: $restore_dir/config/"
    echo -e "   5. Revisar datos en: $restore_dir/data/"
    
    # Mostrar resumen de archivos restaurados
    echo -e "\n${BLUE}📂 Archivos restaurados:${NC}"
    find "$restore_dir" -type f -name "*.json" -o -name "*.js" -o -name "*.md" | head -10
    
    return 0
}

# Función principal del menú
main_menu() {
    while true; do
        echo -e "\n${YELLOW}¿Qué desea hacer?${NC}"
        echo "1. 📋 Ver backups disponibles"
        echo "2. 🔄 Restaurar un backup"
        echo "3. 📊 Ver información de un backup"
        echo "4. 🚪 Salir"
        echo ""
        
        read -p "Seleccione una opción (1-4): " choice
        
        case $choice in
            1)
                view_backups
                ;;
            2)
                restore_menu
                ;;
            3)
                info_menu
                ;;
            4)
                echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opción inválida. Seleccione 1-4${NC}"
                ;;
        esac
    done
}

# Función para ver backups
view_backups() {
    echo -e "\n${BLUE}📋 Ver Backups Disponibles${NC}"
    
    # Verificar servicios disponibles
    if ! show_cloud_services; then
        return
    fi
    
    # Seleccionar servicio
    services=()
    if rclone listremotes | grep -q "^gdrive:$"; then
        services+=("Google Drive")
    fi
    if rclone listremotes | grep -q "^onedrive:$"; then
        services+=("OneDrive")
    fi
    
    if [ ${#services[@]} -eq 1 ]; then
        selected_service="${services[0]}"
    else
        echo -e "\n${YELLOW}Seleccione el servicio:${NC}"
        for i in "${!services[@]}"; do
            echo "$((i+1)). ${services[$i]}"
        done
        
        read -p "Selección (1-${#services[@]}): " service_choice
        
        if [[ $service_choice -ge 1 && $service_choice -le ${#services[@]} ]]; then
            selected_service="${services[$((service_choice-1))]}"
        else
            echo -e "${RED}❌ Selección inválida${NC}"
            return
        fi
    fi
    
    list_backups "$selected_service"
}

# Función para menú de restauración
restore_menu() {
    echo -e "\n${BLUE}🔄 Restaurar Backup${NC}"
    
    # Verificar servicios disponibles
    if ! show_cloud_services; then
        return
    fi
    
    # Seleccionar servicio
    services=()
    if rclone listremotes | grep -q "^gdrive:$"; then
        services+=("Google Drive")
    fi
    if rclone listremotes | grep -q "^onedrive:$"; then
        services+=("OneDrive")
    fi
    
    if [ ${#services[@]} -eq 1 ]; then
        selected_service="${services[0]}"
    else
        echo -e "\n${YELLOW}Seleccione el servicio:${NC}"
        for i in "${!services[@]}"; do
            echo "$((i+1)). ${services[$i]}"
        done
        
        read -p "Selección (1-${#services[@]}): " service_choice
        
        if [[ $service_choice -ge 1 && $service_choice -le ${#services[@]} ]]; then
            selected_service="${services[$((service_choice-1))]}"
        else
            echo -e "${RED}❌ Selección inválida${NC}"
            return
        fi
    fi
    
    # Listar backups y seleccionar
    if ! list_backups "$selected_service"; then
        return
    fi
    
    # Obtener lista de backups
    local remote_name=""
    local folder=""
    
    if [[ "$selected_service" == "Google Drive" ]]; then
        remote_name="gdrive"
        folder="Backups/Sistema-POS"
    elif [[ "$selected_service" == "OneDrive" ]]; then
        remote_name="onedrive"
        folder="Backups/Sistema-POS"
    fi
    
    backups=$(rclone lsf "${remote_name}:${folder}" 2>/dev/null | grep "^backup-" | sort -r)
    backup_array=($backups)
    
    echo ""
    read -p "Seleccione el número del backup a restaurar: " backup_choice
    
    if [[ $backup_choice -ge 1 && $backup_choice -le ${#backup_array[@]} ]]; then
        selected_backup="${backup_array[$((backup_choice-1))]}"
        selected_backup="${selected_backup%/}" # Remover trailing slash
        
        # Confirmar restauración
        echo -e "\n${YELLOW}⚠️ Está a punto de restaurar:${NC}"
        echo -e "   • Backup: $selected_backup"
        echo -e "   • Servicio: $selected_service"
        echo ""
        read -p "¿Continuar? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            restore_backup "$selected_service" "$selected_backup"
        else
            echo -e "${YELLOW}⏸️ Restauración cancelada${NC}"
        fi
    else
        echo -e "${RED}❌ Selección inválida${NC}"
    fi
}

# Función para menú de información
info_menu() {
    echo -e "\n${BLUE}📊 Información de Backup${NC}"
    
    # Misma lógica que restore_menu pero solo para mostrar información
    if ! show_cloud_services; then
        return
    fi
    
    # Seleccionar servicio (código simplificado)
    services=()
    if rclone listremotes | grep -q "^gdrive:$"; then
        services+=("Google Drive")
    fi
    if rclone listremotes | grep -q "^onedrive:$"; then
        services+=("OneDrive")
    fi
    
    if [ ${#services[@]} -eq 1 ]; then
        selected_service="${services[0]}"
    else
        echo -e "\n${YELLOW}Seleccione el servicio:${NC}"
        for i in "${!services[@]}"; do
            echo "$((i+1)). ${services[$i]}"
        done
        
        read -p "Selección (1-${#services[@]}): " service_choice
        selected_service="${services[$((service_choice-1))]}"
    fi
    
    if ! list_backups "$selected_service"; then
        return
    fi
    
    # Obtener selección y mostrar información
    local remote_name=""
    local folder=""
    
    if [[ "$selected_service" == "Google Drive" ]]; then
        remote_name="gdrive"
        folder="Backups/Sistema-POS"
    elif [[ "$selected_service" == "OneDrive" ]]; then
        remote_name="onedrive"
        folder="Backups/Sistema-POS"
    fi
    
    backups=$(rclone lsf "${remote_name}:${folder}" 2>/dev/null | grep "^backup-" | sort -r)
    backup_array=($backups)
    
    echo ""
    read -p "Seleccione el número del backup para ver información: " backup_choice
    
    if [[ $backup_choice -ge 1 && $backup_choice -le ${#backup_array[@]} ]]; then
        selected_backup="${backup_array[$((backup_choice-1))]}"
        selected_backup="${selected_backup%/}"
        get_backup_info "$selected_service" "$selected_backup"
    else
        echo -e "${RED}❌ Selección inválida${NC}"
    fi
}

# Verificar prerrequisitos
if ! command -v rclone &> /dev/null; then
    echo -e "${RED}❌ Error: rclone no está instalado${NC}"
    echo -e "${YELLOW}💡 Instalar con: curl https://rclone.org/install.sh | sudo bash${NC}"
    exit 1
fi

# Verificar servicios configurados
if ! show_cloud_services; then
    exit 1
fi

# Iniciar menú principal
main_menu 