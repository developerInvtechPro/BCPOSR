#!/bin/bash

# Script de Backup Automático para Google Drive
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
GOOGLE_DRIVE_REMOTE="gdrive" # Nombre del remote de rclone para Google Drive
GOOGLE_DRIVE_FOLDER="Backups/Sistema-POS"
PROJECT_DIR="$(pwd)"
MAX_BACKUPS=30 # Mantener últimos 30 backups

echo -e "${BLUE}🔄 Iniciando backup automático a Google Drive...${NC}"

# Verificar si rclone está instalado
if ! command -v rclone &> /dev/null; then
    echo -e "${RED}❌ Error: rclone no está instalado${NC}"
    echo -e "${YELLOW}💡 Instalar con: curl https://rclone.org/install.sh | sudo bash${NC}"
    exit 1
fi

# Verificar si está configurado Google Drive
if ! rclone listremotes | grep -q "^${GOOGLE_DRIVE_REMOTE}:$"; then
    echo -e "${RED}❌ Error: Google Drive no está configurado en rclone${NC}"
    echo -e "${YELLOW}💡 Configurar con: rclone config${NC}"
    echo -e "${YELLOW}   Seleccionar 'Google Drive' y seguir las instrucciones${NC}"
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

# Backup de logs si existen
if [ -d "$PROJECT_DIR/logs" ]; then
    echo -e "${YELLOW}📋 Respaldando logs...${NC}"
    tar -czf "$BACKUP_DIR/logs.tar.gz" "$PROJECT_DIR/logs"
fi

# Simulación de backup de base de datos (agregar cuando se implemente)
echo -e "${YELLOW}🗄️ Preparando backup de datos...${NC}"
mkdir -p "$BACKUP_DIR/database"
echo "# Backup de datos del sistema POS" > "$BACKUP_DIR/database/README.md"
echo "# Fecha: $(date)" >> "$BACKUP_DIR/database/README.md"
echo "# Versión: 1.0" >> "$BACKUP_DIR/database/README.md"

# Crear archivo de información del backup
cat > "$BACKUP_DIR/backup-info.json" << EOF
{
  "fecha": "$(date -Iseconds)",
  "version": "1.0",
  "servidor": "$(hostname)",
  "usuario": "$(whoami)",
  "sistema": "$(uname -a)",
  "tamano_backup": "pendiente"
}
EOF

# Calcular tamaño del backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
sed -i.bak "s/\"pendiente\"/\"$BACKUP_SIZE\"/" "$BACKUP_DIR/backup-info.json" && rm "$BACKUP_DIR/backup-info.json.bak" 2>/dev/null || true

echo -e "${GREEN}✅ Backup local completado (Tamaño: $BACKUP_SIZE)${NC}"

# Subir a Google Drive
echo -e "${BLUE}☁️ Subiendo backup a Google Drive...${NC}"

# Crear la estructura de carpetas en Google Drive si no existe
rclone mkdir "${GOOGLE_DRIVE_REMOTE}:${GOOGLE_DRIVE_FOLDER}" 2>/dev/null

# Subir el backup
BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
rclone copy "$BACKUP_DIR" "${GOOGLE_DRIVE_REMOTE}:${GOOGLE_DRIVE_FOLDER}/$BACKUP_NAME" \
    --progress \
    --transfers 4 \
    --checkers 8

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup subido exitosamente a Google Drive${NC}"
    echo -e "${GREEN}📂 Ubicación: $GOOGLE_DRIVE_FOLDER/$BACKUP_NAME${NC}"
else
    echo -e "${RED}❌ Error al subir backup a Google Drive${NC}"
    exit 1
fi

# Limpiar backups antiguos en Google Drive
echo -e "${YELLOW}🧹 Limpiando backups antiguos...${NC}"

# Listar backups y mantener solo los más recientes
rclone lsf "${GOOGLE_DRIVE_REMOTE}:${GOOGLE_DRIVE_FOLDER}" | \
    grep "^backup-" | \
    sort -r | \
    tail -n +$((MAX_BACKUPS + 1)) | \
    while read -r old_backup; do
        if [ -n "$old_backup" ]; then
            echo -e "${YELLOW}🗑️ Eliminando backup antiguo: $old_backup${NC}"
            rclone purge "${GOOGLE_DRIVE_REMOTE}:${GOOGLE_DRIVE_FOLDER}/$old_backup"
        fi
    done

# Limpiar archivos temporales
rm -rf "$BACKUP_DIR"

echo -e "${GREEN}🎉 Backup completado exitosamente!${NC}"
echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "   • Backup local: Completado y limpiado"
echo -e "   • Google Drive: ✅ Sincronizado"
echo -e "   • Ubicación: $GOOGLE_DRIVE_FOLDER/$BACKUP_NAME"
echo -e "   • Backups mantenidos: $MAX_BACKUPS"
echo -e "   • Tamaño: $BACKUP_SIZE"

# Enviar notificación (opcional - requiere configuración adicional)
if command -v curl &> /dev/null && [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "{\"text\":\"✅ Backup POS completado: $BACKUP_SIZE en Google Drive\"}" \
         2>/dev/null || true
fi

echo -e "${GREEN}✨ ¡Backup completado! Sus datos están seguros en la nube.${NC}" 