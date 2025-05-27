#!/bin/bash

# 🍽️ Script de Instalación - Sistema POS Honduras
# Autor: Equipo de Desarrollo
# Versión: 1.0

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[ÉXITO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                   SISTEMA POS HONDURAS                          ║"
echo "║                    Instalación Automática                       ║"
echo "║                      Versión 1.0                                ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si es root
if [[ $EUID -eq 0 ]]; then
   print_error "No ejecutar como root. Usa un usuario normal con sudo."
   exit 1
fi

# Detectar sistema operativo
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    print_error "Sistema operativo no soportado: $OSTYPE"
    exit 1
fi

print_step "Sistema detectado: $OS"

# Función para instalar en Linux
install_linux() {
    print_step "Actualizando repositorios..."
    sudo apt update

    print_step "Instalando dependencias del sistema..."
    sudo apt install -y curl wget git

    print_step "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs

    print_step "Instalando PM2..."
    sudo npm install -g pm2

    print_step "Configurando firewall..."
    sudo ufw allow 3000/tcp
    print_warning "Puerto 3000 habilitado en firewall"
}

# Función para instalar en macOS
install_macos() {
    # Verificar si Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        print_step "Instalando Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    print_step "Instalando Node.js 18..."
    brew install node@18

    print_step "Instalando PM2..."
    npm install -g pm2
}

# Función principal de instalación
main_install() {
    print_step "Creando directorio de aplicación..."
    mkdir -p ~/pos-honduras
    cd ~/pos-honduras

    print_step "Descargando aplicación..."
    # Aquí deberías cambiar por tu repositorio real
    # git clone https://github.com/tu-usuario/pos-honduras.git .
    
    # Por ahora copiamos los archivos actuales
    cp -r /Users/solmerlopez/Downloads/facturacion-app/* .
    
    print_step "Instalando dependencias de Node.js..."
    npm install

    print_step "Construyendo aplicación para producción..."
    npm run build

    print_step "Creando directorio de logs..."
    mkdir -p logs

    print_step "Configurando PM2..."
    pm2 start ecosystem.config.js

    print_step "Configurando arranque automático..."
    pm2 startup
    pm2 save

    print_success "¡Instalación completada!"
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    ¡INSTALACIÓN EXITOSA!                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📍 Ubicación:${NC} ~/pos-honduras"
    echo -e "${BLUE}🌐 URL Local:${NC} http://localhost:3000"
    echo -e "${BLUE}📱 Red Local:${NC} http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
    echo "  pm2 status           - Ver estado de la aplicación"
    echo "  pm2 logs             - Ver logs en tiempo real"
    echo "  pm2 restart all      - Reiniciar aplicación"
    echo "  pm2 stop all         - Detener aplicación"
    echo "  pm2 delete all       - Eliminar aplicación de PM2"
    echo ""
    echo -e "${GREEN}🎉 ¡El Sistema POS está listo para usar!${NC}"
    echo ""
}

# Función para crear script de backup
create_backup_script() {
    print_step "Creando script de backup automático..."
    
    cat > ~/pos-honduras/backup.sh << 'EOF'
#!/bin/bash
# Script de Backup Automático - Sistema POS Honduras

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/pos-honduras/backups"
APP_DIR="$HOME/pos-honduras"

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

# Crear backup
print_step "Creando backup del sistema..."
tar -czf "$BACKUP_DIR/pos_backup_$DATE.tar.gz" \
    -C "$APP_DIR" \
    --exclude="backups" \
    --exclude="node_modules" \
    --exclude=".next" \
    .

# Limpiar backups antiguos (mantener últimos 30)
find "$BACKUP_DIR" -name "pos_backup_*.tar.gz" -mtime +30 -delete

echo "✅ Backup completado: pos_backup_$DATE.tar.gz"
echo "📁 Ubicación: $BACKUP_DIR"
EOF

    chmod +x ~/pos-honduras/backup.sh
    print_success "Script de backup creado en ~/pos-honduras/backup.sh"
}

# Función para configurar backup automático
setup_auto_backup() {
    read -p "¿Deseas configurar backup automático diario? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Configurando backup automático..."
        
        # Agregar crontab para backup diario a las 2 AM
        (crontab -l 2>/dev/null; echo "0 2 * * * $HOME/pos-honduras/backup.sh >> $HOME/pos-honduras/logs/backup.log 2>&1") | crontab -
        
        print_success "Backup automático configurado para las 2:00 AM diariamente"
    fi
}

# Ejecución principal
echo ""
print_step "Iniciando instalación del Sistema POS Honduras..."
echo ""

# Instalar según el sistema operativo
if [[ "$OS" == "linux" ]]; then
    install_linux
elif [[ "$OS" == "macos" ]]; then
    install_macos
fi

# Instalación principal
main_install

# Crear scripts adicionales
create_backup_script

# Configurar backup automático
setup_auto_backup

# Mostrar información final
show_final_info

# Abrir navegador automáticamente
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

print_success "¡Instalación del Sistema POS Honduras completada!" 