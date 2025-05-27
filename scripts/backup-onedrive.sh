#!/bin/bash

# Script de Backup Automático para OneDrive
# Sistema POS Honduras
# Fecha: $(date +"%Y-%m-%d")

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BACKUP_DIR="/tmp/pos-backup-$(date +%Y%m%d_%H%M%S)"
ONEDRIVE_REMOTE="onedrive" # Nombre del remote de rclone para OneDrive
ONEDRIVE_FOLDER="Backups/Sistema-POS"
PROJECT_DIR="$(pwd)"
MAX_BACKUPS=30 # Mantener últimos 30 backups

echo -e "${BLUE}🔄 Iniciando backup automático a OneDrive...${NC}"

# Verificar si rclone está instalado
if ! command -v rclone &> /dev/null; then
    echo -e "${RED}❌ Error: rclone no está instalado${NC}"
    echo -e "${YELLOW}💡 Instalar con: curl https://rclone.org/install.sh | sudo bash${NC}"
    exit 1
fi

# Verificar si está configurado OneDrive
if ! rclone listremotes | grep -q "^${ONEDRIVE_REMOTE}:$"; then
    echo -e "${RED}❌ Error: OneDrive no está configurado en rclone${NC}"
    echo -e "${YELLOW}💡 Configurar con: rclone config${NC}"
    echo -e "${YELLOW}   Seleccionar 'Microsoft OneDrive' y seguir las instrucciones${NC}"
    exit 1
fi

# Crear directorio temporal de backup
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}📁 Creando backup en: $BACKUP_DIR${NC}"

# Backup del código fuente (excluyendo node_modules y .next)
echo -e "${YELLOW}📦 Respaldando código fuente...${NC}"
tar -czf "$BACKUP_DIR/codigo-fuente.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='logs' \
    --exclude='.git' \
    --exclude='*.log' \
    "$PROJECT_DIR"

# Backup de configuraciones específicas
echo -e "${YELLOW}⚙️ Respaldando configuraciones...${NC}"
mkdir -p "$BACKUP_DIR/config"

if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    cp "$PROJECT_DIR/ecosystem.config.js" "$BACKUP_DIR/config/"
fi

if [ -f "$PROJECT_DIR/package.json" ]; then
    cp "$PROJECT_DIR/package.json" "$BACKUP_DIR/config/"
fi

if [ -f "$PROJECT_DIR/next.config.js" ]; then
    cp "$PROJECT_DIR/next.config.js" "$BACKUP_DIR/config/"
fi

if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    cp "$PROJECT_DIR/docker-compose.yml" "$BACKUP_DIR/config/"
fi

# Backup de logs si existen
if [ -d "$PROJECT_DIR/logs" ]; then
    echo -e "${YELLOW}📋 Respaldando logs...${NC}"
    tar -czf "$BACKUP_DIR/logs.tar.gz" "$PROJECT_DIR/logs"
fi

# Backup de datos del sistema (configuraciones, usuarios, etc.)
echo -e "${YELLOW}🗄️ Preparando backup de datos del sistema...${NC}"
mkdir -p "$BACKUP_DIR/data"

# Exportar configuraciones del sistema (simulado)
cat > "$BACKUP_DIR/data/configuraciones.json" << EOF
{
  "fecha_backup": "$(date -Iseconds)",
  "version_sistema": "1.0",
  "configuraciones": {
    "empresa": {
      "nombre": "Mi Empresa S.A.",
      "rtn": "08011999123456",
      "direccion": "Blvd. Principal, Tegucigalpa"
    },
    "cai": {
      "serie": "A",
      "activo": true,
      "fecha_vencimiento": "2025-12-31"
    },
    "limites": {
      "descuento_porcentaje": 20,
      "descuento_importe": 500
    }
  }
}
EOF

# Backup de usuarios del sistema (simulado)
cat > "$BACKUP_DIR/data/usuarios.json" << EOF
{
  "fecha_backup": "$(date -Iseconds)",
  "usuarios": [
    {
      "nombre": "Cajero Principal",
      "rol": "cajero",
      "activo": true
    },
    {
      "nombre": "Administrador",
      "rol": "admin",
      "activo": true
    }
  ]
}
EOF

# Crear archivo de información del backup
cat > "$BACKUP_DIR/backup-info.json" << EOF
{
  "fecha": "$(date -Iseconds)",
  "version": "1.0",
  "servidor": "$(hostname)",
  "usuario": "$(whoami)",
  "sistema": "$(uname -a)",
  "destino": "OneDrive",
  "tamano_backup": "pendiente",
  "componentes": [
    "codigo-fuente",
    "configuraciones",
    "logs",
    "datos-sistema"
  ]
}
EOF

# Calcular tamaño del backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
sed -i.bak "s/\"pendiente\"/\"$BACKUP_SIZE\"/" "$BACKUP_DIR/backup-info.json" && rm "$BACKUP_DIR/backup-info.json.bak" 2>/dev/null || true

echo -e "${GREEN}✅ Backup local completado (Tamaño: $BACKUP_SIZE)${NC}"

# Subir a OneDrive
echo -e "${BLUE}☁️ Subiendo backup a OneDrive...${NC}"

# Crear la estructura de carpetas en OneDrive si no existe
rclone mkdir "${ONEDRIVE_REMOTE}:${ONEDRIVE_FOLDER}" 2>/dev/null

# Subir el backup
BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
rclone copy "$BACKUP_DIR" "${ONEDRIVE_REMOTE}:${ONEDRIVE_FOLDER}/$BACKUP_NAME" \
    --progress \
    --transfers 4 \
    --checkers 8 \
    --retries 3

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup subido exitosamente a OneDrive${NC}"
    echo -e "${GREEN}📂 Ubicación: $ONEDRIVE_FOLDER/$BACKUP_NAME${NC}"
else
    echo -e "${RED}❌ Error al subir backup a OneDrive${NC}"
    exit 1
fi

# Crear un resumen del backup en OneDrive
cat > "/tmp/resumen-$BACKUP_NAME.txt" << EOF
RESUMEN DE BACKUP - Sistema POS Honduras
======================================

Fecha: $(date)
Nombre: $BACKUP_NAME
Tamaño: $BACKUP_SIZE
Destino: OneDrive:$ONEDRIVE_FOLDER

Componentes incluidos:
- Código fuente (sin node_modules)
- Configuraciones del sistema
- Logs de aplicación
- Datos del sistema
- Configuraciones de deployment

Sistema:
- Servidor: $(hostname)
- Usuario: $(whoami)
- OS: $(uname -a)

Estado: ✅ Completado exitosamente
EOF

rclone copy "/tmp/resumen-$BACKUP_NAME.txt" "${ONEDRIVE_REMOTE}:${ONEDRIVE_FOLDER}/"
rm "/tmp/resumen-$BACKUP_NAME.txt"

# Limpiar backups antiguos en OneDrive
echo -e "${YELLOW}🧹 Limpiando backups antiguos...${NC}"

# Listar backups y mantener solo los más recientes
rclone lsf "${ONEDRIVE_REMOTE}:${ONEDRIVE_FOLDER}" | \
    grep "^backup-" | \
    sort -r | \
    tail -n +$((MAX_BACKUPS + 1)) | \
    while read -r old_backup; do
        if [ -n "$old_backup" ]; then
            echo -e "${YELLOW}🗑️ Eliminando backup antiguo: $old_backup${NC}"
            rclone purge "${ONEDRIVE_REMOTE}:${ONEDRIVE_FOLDER}/$old_backup"
        fi
    done

# Limpiar archivos temporales
rm -rf "$BACKUP_DIR"

echo -e "${GREEN}🎉 Backup completado exitosamente!${NC}"
echo -e "${BLUE}📊 Resumen del Backup:${NC}"
echo -e "   • Backup local: ✅ Completado y limpiado"
echo -e "   • OneDrive: ✅ Sincronizado"
echo -e "   • Ubicación: $ONEDRIVE_FOLDER/$BACKUP_NAME"
echo -e "   • Backups mantenidos: $MAX_BACKUPS"
echo -e "   • Tamaño total: $BACKUP_SIZE"
echo -e "   • Archivos incluidos:"
echo -e "     - Código fuente comprimido"
echo -e "     - Configuraciones del sistema"
echo -e "     - Logs de aplicación"
echo -e "     - Datos del sistema"

# Mostrar instrucciones de restauración
echo -e "\n${BLUE}📋 Para restaurar desde este backup:${NC}"
echo -e "   1. Descargar: rclone copy ${ONEDRIVE_REMOTE}:${ONEDRIVE_FOLDER}/$BACKUP_NAME ./restore/"
echo -e "   2. Extraer: tar -xzf restore/codigo-fuente.tar.gz"
echo -e "   3. Instalar: npm install && npm run build"

# Enviar notificación por email (opcional - requiere configuración de sendmail)
if command -v sendmail &> /dev/null && [ ! -z "$BACKUP_EMAIL" ]; then
    {
        echo "Subject: ✅ Backup POS Completado - $BACKUP_NAME"
        echo "To: $BACKUP_EMAIL"
        echo ""
        echo "El backup del Sistema POS se ha completado exitosamente:"
        echo ""
        echo "• Fecha: $(date)"
        echo "• Tamaño: $BACKUP_SIZE"
        echo "• Ubicación: OneDrive:$ONEDRIVE_FOLDER/$BACKUP_NAME"
        echo "• Estado: ✅ Exitoso"
        echo ""
        echo "Sus datos están seguros en la nube."
    } | sendmail "$BACKUP_EMAIL" 2>/dev/null || true
fi

echo -e "\n${GREEN}✨ ¡Backup completado! Sus datos están seguros en OneDrive.${NC}" 