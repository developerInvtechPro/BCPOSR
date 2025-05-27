#!/bin/bash

# Script de Configuración de Backup en la Nube
# Sistema POS Honduras - Configuración automática de Google Drive y OneDrive

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}☁️ Configuración de Backup Automático en la Nube${NC}"
echo -e "${BLUE}=================================================${NC}"

# Función para mostrar el menú principal
show_menu() {
    echo -e "\n${YELLOW}Seleccione el servicio de nube para configurar:${NC}"
    echo "1. 📁 Google Drive"
    echo "2. 📂 Microsoft OneDrive"
    echo "3. ⚙️ Configurar backup automático (cron)"
    echo "4. 🧪 Probar backup"
    echo "5. 📋 Ver estado de configuración"
    echo "6. 🚪 Salir"
    echo ""
}

# Función para verificar e instalar rclone
install_rclone() {
    if ! command -v rclone &> /dev/null; then
        echo -e "${YELLOW}📦 Instalando rclone...${NC}"
        curl https://rclone.org/install.sh | sudo bash
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ rclone instalado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al instalar rclone${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ rclone ya está instalado${NC}"
    fi
}

# Función para configurar Google Drive
setup_google_drive() {
    echo -e "\n${BLUE}📁 Configurando Google Drive...${NC}"
    
    # Verificar si ya está configurado
    if rclone listremotes | grep -q "^gdrive:$"; then
        echo -e "${YELLOW}⚠️ Google Drive ya está configurado${NC}"
        read -p "¿Desea reconfigurar? (y/N): " reconfigure
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    echo -e "${YELLOW}📋 Instrucciones para configurar Google Drive:${NC}"
    echo "1. Se abrirá la configuración interactiva de rclone"
    echo "2. Seleccione 'Google Drive' como tipo de storage"
    echo "3. Use 'gdrive' como nombre del remote"
    echo "4. Siga las instrucciones para autorizar el acceso"
    echo ""
    read -p "Presione Enter para continuar..."
    
    # Configurar Google Drive
    rclone config create gdrive drive --interactive
    
    # Verificar configuración
    if rclone listremotes | grep -q "^gdrive:$"; then
        echo -e "${GREEN}✅ Google Drive configurado exitosamente${NC}"
        
        # Probar conexión
        echo -e "${YELLOW}🧪 Probando conexión...${NC}"
        rclone mkdir gdrive:Backups/Sistema-POS/test 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Conexión a Google Drive exitosa${NC}"
            rclone rmdir gdrive:Backups/Sistema-POS/test 2>/dev/null
        else
            echo -e "${RED}❌ Error de conexión a Google Drive${NC}"
        fi
    else
        echo -e "${RED}❌ Error al configurar Google Drive${NC}"
    fi
}

# Función para configurar OneDrive
setup_onedrive() {
    echo -e "\n${BLUE}📂 Configurando OneDrive...${NC}"
    
    # Verificar si ya está configurado
    if rclone listremotes | grep -q "^onedrive:$"; then
        echo -e "${YELLOW}⚠️ OneDrive ya está configurado${NC}"
        read -p "¿Desea reconfigurar? (y/N): " reconfigure
        if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    echo -e "${YELLOW}📋 Instrucciones para configurar OneDrive:${NC}"
    echo "1. Se abrirá la configuración interactiva de rclone"
    echo "2. Seleccione 'Microsoft OneDrive' como tipo de storage"
    echo "3. Use 'onedrive' como nombre del remote"
    echo "4. Siga las instrucciones para autorizar el acceso"
    echo ""
    read -p "Presione Enter para continuar..."
    
    # Configurar OneDrive
    rclone config create onedrive onedrive --interactive
    
    # Verificar configuración
    if rclone listremotes | grep -q "^onedrive:$"; then
        echo -e "${GREEN}✅ OneDrive configurado exitosamente${NC}"
        
        # Probar conexión
        echo -e "${YELLOW}🧪 Probando conexión...${NC}"
        rclone mkdir onedrive:Backups/Sistema-POS/test 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Conexión a OneDrive exitosa${NC}"
            rclone rmdir onedrive:Backups/Sistema-POS/test 2>/dev/null
        else
            echo -e "${RED}❌ Error de conexión a OneDrive${NC}"
        fi
    else
        echo -e "${RED}❌ Error al configurar OneDrive${NC}"
    fi
}

# Función para configurar backup automático
setup_automatic_backup() {
    echo -e "\n${BLUE}⚙️ Configurando Backup Automático...${NC}"
    
    # Verificar qué servicios están configurados
    services=()
    if rclone listremotes | grep -q "^gdrive:$"; then
        services+=("Google Drive")
    fi
    if rclone listremotes | grep -q "^onedrive:$"; then
        services+=("OneDrive")
    fi
    
    if [ ${#services[@]} -eq 0 ]; then
        echo -e "${RED}❌ No hay servicios de nube configurados${NC}"
        echo -e "${YELLOW}💡 Configure primero Google Drive o OneDrive${NC}"
        return
    fi
    
    echo -e "${GREEN}✅ Servicios disponibles: ${services[*]}${NC}"
    
    # Seleccionar servicio para backup automático
    echo -e "\n${YELLOW}Seleccione el servicio para backup automático:${NC}"
    for i in "${!services[@]}"; do
        echo "$((i+1)). ${services[$i]}"
    done
    
    read -p "Selección (1-${#services[@]}): " service_choice
    
    if [[ $service_choice -ge 1 && $service_choice -le ${#services[@]} ]]; then
        selected_service="${services[$((service_choice-1))]}"
        
        # Seleccionar frecuencia
        echo -e "\n${YELLOW}Seleccione la frecuencia de backup:${NC}"
        echo "1. Diario (2:00 AM)"
        echo "2. Semanal (Domingo 2:00 AM)"
        echo "3. Personalizado"
        
        read -p "Selección (1-3): " freq_choice
        
        case $freq_choice in
            1)
                cron_schedule="0 2 * * *"
                description="diario a las 2:00 AM"
                ;;
            2)
                cron_schedule="0 2 * * 0"
                description="semanal (domingos a las 2:00 AM)"
                ;;
            3)
                echo -e "${YELLOW}Ingrese el schedule de cron (ej: 0 2 * * * para diario a las 2 AM):${NC}"
                read -p "Schedule: " cron_schedule
                description="personalizado ($cron_schedule)"
                ;;
            *)
                echo -e "${RED}❌ Selección inválida${NC}"
                return
                ;;
        esac
        
        # Determinar script de backup
        if [[ "$selected_service" == "Google Drive" ]]; then
            backup_script="scripts/backup-google-drive.sh"
        else
            backup_script="scripts/backup-onedrive.sh"
        fi
        
        # Crear entrada de cron
        backup_command="cd $(pwd) && bash $backup_script >> logs/backup.log 2>&1"
        cron_entry="$cron_schedule $backup_command"
        
        # Agregar a crontab
        (crontab -l 2>/dev/null | grep -v "Sistema POS Honduras"; echo "# Sistema POS Honduras - Backup $description"; echo "$cron_entry") | crontab -
        
        echo -e "${GREEN}✅ Backup automático configurado:${NC}"
        echo -e "   • Servicio: $selected_service"
        echo -e "   • Frecuencia: $description"
        echo -e "   • Logs: logs/backup.log"
        
        # Crear directorio de logs si no existe
        mkdir -p logs
        
    else
        echo -e "${RED}❌ Selección inválida${NC}"
    fi
}

# Función para probar backup
test_backup() {
    echo -e "\n${BLUE}🧪 Probando Backup...${NC}"
    
    # Verificar qué servicios están configurados
    if rclone listremotes | grep -q "^gdrive:$"; then
        echo -e "${YELLOW}📁 Probando backup a Google Drive...${NC}"
        if [ -f "scripts/backup-google-drive.sh" ]; then
            bash scripts/backup-google-drive.sh
        else
            echo -e "${RED}❌ Script de Google Drive no encontrado${NC}"
        fi
    fi
    
    if rclone listremotes | grep -q "^onedrive:$"; then
        echo -e "${YELLOW}📂 Probando backup a OneDrive...${NC}"
        if [ -f "scripts/backup-onedrive.sh" ]; then
            bash scripts/backup-onedrive.sh
        else
            echo -e "${RED}❌ Script de OneDrive no encontrado${NC}"
        fi
    fi
    
    if ! rclone listremotes | grep -qE "^(gdrive|onedrive):$"; then
        echo -e "${RED}❌ No hay servicios de nube configurados${NC}"
    fi
}

# Función para mostrar estado
show_status() {
    echo -e "\n${BLUE}📋 Estado de Configuración${NC}"
    echo -e "${BLUE}=========================${NC}"
    
    # Estado de rclone
    if command -v rclone &> /dev/null; then
        echo -e "${GREEN}✅ rclone: Instalado$(NC) ($(rclone version | head -1))"
    else
        echo -e "${RED}❌ rclone: No instalado${NC}"
    fi
    
    # Estado de Google Drive
    if rclone listremotes | grep -q "^gdrive:$"; then
        echo -e "${GREEN}✅ Google Drive: Configurado${NC}"
        if [ -f "scripts/backup-google-drive.sh" ]; then
            echo -e "${GREEN}  └── Script: Disponible${NC}"
        else
            echo -e "${RED}  └── Script: No encontrado${NC}"
        fi
    else
        echo -e "${RED}❌ Google Drive: No configurado${NC}"
    fi
    
    # Estado de OneDrive
    if rclone listremotes | grep -q "^onedrive:$"; then
        echo -e "${GREEN}✅ OneDrive: Configurado${NC}"
        if [ -f "scripts/backup-onedrive.sh" ]; then
            echo -e "${GREEN}  └── Script: Disponible${NC}"
        else
            echo -e "${RED}  └── Script: No encontrado${NC}"
        fi
    else
        echo -e "${RED}❌ OneDrive: No configurado${NC}"
    fi
    
    # Estado de cron
    if crontab -l 2>/dev/null | grep -q "Sistema POS Honduras"; then
        echo -e "${GREEN}✅ Backup Automático: Configurado${NC}"
        echo -e "${BLUE}  └── Tareas programadas:${NC}"
        crontab -l 2>/dev/null | grep -A1 "Sistema POS Honduras" | grep -v "Sistema POS Honduras" | sed 's/^/      /'
    else
        echo -e "${RED}❌ Backup Automático: No configurado${NC}"
    fi
    
    # Estado de logs
    if [ -d "logs" ]; then
        echo -e "${GREEN}✅ Directorio de logs: Existe${NC}"
        if [ -f "logs/backup.log" ]; then
            log_size=$(du -h logs/backup.log | cut -f1)
            echo -e "${BLUE}  └── backup.log: $log_size${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Directorio de logs: No existe${NC}"
    fi
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Ejecute este script desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Crear directorio de scripts si no existe
mkdir -p scripts

# Dar permisos de ejecución a los scripts
chmod +x scripts/backup-*.sh 2>/dev/null || true

# Instalar rclone si no está disponible
install_rclone

# Menú principal
while true; do
    show_menu
    read -p "Seleccione una opción (1-6): " choice
    
    case $choice in
        1)
            setup_google_drive
            ;;
        2)
            setup_onedrive
            ;;
        3)
            setup_automatic_backup
            ;;
        4)
            test_backup
            ;;
        5)
            show_status
            ;;
        6)
            echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opción inválida. Seleccione 1-6${NC}"
            ;;
    esac
    
    echo ""
    read -p "Presione Enter para continuar..."
done 