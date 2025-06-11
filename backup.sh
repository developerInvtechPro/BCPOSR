#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/pos_backup_$DATE.tar.gz" \
    --exclude="backups" \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude="logs" \
    .
echo "✅ Backup completado: pos_backup_$DATE.tar.gz"
