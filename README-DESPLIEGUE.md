# 🚀 Guía de Despliegue - Sistema POS Honduras

## 📋 Opciones de Despliegue

### 🔥 **OPCIÓN 1: DESPLIEGUE LOCAL SIMPLE (RECOMENDADO PARA RESTAURANTES)**
**Ideal para:** Restaurantes con una o pocas ubicaciones, fácil mantenimiento

```bash
# 1. Construir la aplicación
npm run build

# 2. Instalar PM2 globalmente
npm install -g pm2

# 3. Iniciar con PM2
pm2 start ecosystem.config.js

# 4. Configurar para arranque automático
pm2 startup
pm2 save
```

**Ventajas:**
- ✅ Funciona sin internet
- ✅ Rendimiento óptimo
- ✅ Datos locales seguros
- ✅ Fácil mantenimiento

---

### 🌐 **OPCIÓN 2: SERVIDOR DEDICADO EN LA RED LOCAL**
**Ideal para:** Restaurantes con múltiples terminales/estaciones

```bash
# 1. En el servidor principal
npm run build
pm2 start ecosystem.config.js

# 2. Configurar IP estática en el servidor
# 3. Acceder desde otras terminales via: http://IP-SERVIDOR:3000
```

**Configuración de Red:**
```bash
# Encontrar IP del servidor
ifconfig | grep inet

# Permitir conexiones en el firewall
ufw allow 3000
```

---

### 🐳 **OPCIÓN 3: DOCKER (PROFESIONAL)**
**Ideal para:** Despliegues múltiples, escalabilidad, backup automático

```bash
# 1. Construir imagen Docker
docker build -t pos-honduras .

# 2. Ejecutar con Docker Compose
docker-compose up -d

# 3. Ver logs
docker-compose logs -f pos-app
```

---

### ☁️ **OPCIÓN 4: EN LA NUBE (PARA CADENAS)**
**Ideal para:** Múltiples restaurantes, gestión centralizada

#### **Vercel (Más Fácil):**
```bash
npm install -g vercel
vercel --prod
```

#### **AWS/DigitalOcean (Más Control):**
```bash
# 1. Crear servidor Ubuntu 20.04
# 2. Instalar Docker y Docker Compose
# 3. Clonar repositorio
# 4. docker-compose up -d
```

---

## 🔧 Configuración Específica por Entorno

### **Para Restaurante Individual:**
```bash
# Setup.sh - Script de instalación
#!/bin/bash
echo "🍽️ Instalando Sistema POS Honduras..."

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar e instalar
git clone <repository-url> pos-system
cd pos-system
npm install
npm run build

# Instalar PM2
sudo npm install -g pm2

# Iniciar aplicación
pm2 start ecosystem.config.js
pm2 startup
pm2 save

echo "✅ Sistema POS instalado en: http://localhost:3000"
```

### **Para Red de Restaurantes:**
```bash
# docker-compose.production.yml
version: '3.8'
services:
  pos-app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/pos
    ports:
      - "3000:3000"
  
  database:
    image: postgres:13
    environment:
      - POSTGRES_DB=pos
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## 🔒 Configuración de Seguridad

### **SSL/HTTPS (Recomendado):**
```bash
# Generar certificado SSL con Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d tu-dominio.com
```

### **Firewall:**
```bash
# Ubuntu/Debian
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Aplicación
```

---

## 📱 Acceso desde Tablets/Móviles

### **Configurar WiFi para Tablets:**
1. Conectar tablets a la misma red WiFi
2. Abrir navegador web
3. Ir a: `http://IP-DEL-SERVIDOR:3000`
4. Guardar como bookmark en pantalla inicio

### **Modo Kiosco (Fullscreen):**
```javascript
// Agregar al navegador
window.addEventListener('load', () => {
  if (window.location.search.includes('kiosk=true')) {
    document.body.requestFullscreen();
  }
});
```

---

## ⚡ Optimización para Producción

### **Variables de Entorno:**
```bash
# .env.production
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
```

### **Configuración Nginx (Opcional):**
```nginx
server {
    listen 80;
    server_name tu-restaurante.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔄 Backup y Recuperación

### **Script de Backup Automático:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups

# Backup de datos (localStorage se guarda automáticamente)
tar -czf backups/pos_backup_$DATE.tar.gz logs/ .next/

# Mantener solo últimos 30 backups
find backups/ -name "pos_backup_*.tar.gz" -mtime +30 -delete

echo "✅ Backup completado: pos_backup_$DATE.tar.gz"
```

### **Configurar Backup Automático:**
```bash
# Crontab - backup diario a las 2 AM
crontab -e
# Agregar línea:
0 2 * * * /path/to/backup.sh
```

---

## 🎯 Recomendación Final

**Para la mayoría de restaurantes en Honduras, recomiendo:**

1. **OPCIÓN 1** (Local con PM2) - Más simple y confiable
2. **Tablet Android/iPad** como terminales adicionales
3. **Backup automático** en USB/Disco externo
4. **UPS** para proteger contra cortes de luz

**Comandos de instalación rápida:**
```bash
# En Ubuntu/Linux
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
git clone <tu-repo> pos-system
cd pos-system
npm install && npm run build
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup && pm2 save
```

¡El sistema estará disponible en `http://localhost:3000`! 🎉 

# Guía Completa de Despliegue - Sistema POS Honduras

## 📋 Índice
1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Métodos de Despliegue](#métodos-de-despliegue)
4. [Backup Automático en la Nube](#backup-automático-en-la-nube)
5. [Configuración de Seguridad](#configuración-de-seguridad)
6. [Mantenimiento](#mantenimiento)
7. [Solución de Problemas](#solución-de-problemas)

## 🚀 Introducción

Esta guía proporciona instrucciones completas para desplegar el Sistema POS Honduras en diferentes entornos, con enfoque especial en la configuración de backups automáticos en la nube para máxima seguridad de datos.

## 💻 Requisitos del Sistema

### Mínimos
- **RAM**: 4GB
- **Procesador**: 2 núcleos
- **Almacenamiento**: 20GB libres
- **Sistema Operativo**: Ubuntu 20.04+, macOS 11+, Windows 10+
- **Node.js**: Versión 18 o superior
- **Conexión a Internet**: Para backups en la nube

### Recomendados
- **RAM**: 8GB
- **Procesador**: 4 núcleos
- **Almacenamiento**: 50GB libres (SSD)
- **Conexión estable a Internet**: 10 Mbps+

## 🛠️ Métodos de Despliegue

### 1. Instalación Automática (Recomendado)

```bash
# Descargar e instalar automáticamente
curl -sSL https://raw.githubusercontent.com/tu-repo/sistema-pos/main/install-pos.sh | bash

# O descargar y ejecutar manualmente
wget https://raw.githubusercontent.com/tu-repo/sistema-pos/main/install-pos.sh
chmod +x install-pos.sh
./install-pos.sh
```

### 2. Despliegue Local con PM2

#### Paso 1: Instalar Dependencias
```bash
# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2
```

#### Paso 2: Configurar el Proyecto
```bash
# Clonar proyecto
git clone https://github.com/tu-usuario/sistema-pos-honduras.git
cd sistema-pos-honduras

# Instalar dependencias
npm install

# Construir aplicación
npm run build
```

#### Paso 3: Configurar PM2
```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Configurar auto-arranque
pm2 startup
pm2 save

# Verificar estado
pm2 status
```

### 3. Despliegue con Docker

#### Dockerfile Incluido
```bash
# Construir imagen
docker build -t sistema-pos-honduras .

# Ejecutar contenedor
docker run -d \
  --name pos-sistema \
  -p 3000:3000 \
  --restart unless-stopped \
  sistema-pos-honduras
```

#### Con Docker Compose
```bash
# Iniciar servicios completos
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 4. Despliegue en la Nube

#### Vercel (Más Simple)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

#### AWS/DigitalOcean (Más Control)
- Usar la imagen Docker
- Configurar Load Balancer
- Configurar auto-scaling

## ☁️ Backup Automático en la Nube

### 🆕 Nueva Funcionalidad: Configuración Automática

#### Configuración Inicial
```bash
# Ejecutar configurador automático
./scripts/setup-backup-cloud.sh
```

**El configurador incluye:**
- ✅ Instalación automática de rclone
- ✅ Configuración guiada de Google Drive
- ✅ Configuración guiada de OneDrive
- ✅ Programación automática de backups
- ✅ Pruebas de conectividad

#### Opciones de Servicios de Nube

##### Google Drive
```bash
# Configuración manual (opcional)
rclone config

# Seleccionar:
# - Google Drive
# - Nombre: gdrive
# - Seguir autenticación web
```

##### Microsoft OneDrive
```bash
# Configuración manual (opcional)
rclone config

# Seleccionar:
# - Microsoft OneDrive
# - Nombre: onedrive
# - Seguir autenticación web
```

#### Scripts de Backup Disponibles

##### Backup a Google Drive
```bash
# Backup manual
./scripts/backup-google-drive.sh

# Configurar automático (diario a las 2:00 AM)
echo "0 2 * * * cd $(pwd) && ./scripts/backup-google-drive.sh >> logs/backup.log 2>&1" | crontab -
```

##### Backup a OneDrive
```bash
# Backup manual
./scripts/backup-onedrive.sh

# Configurar automático (semanal, domingos 2:00 AM)
echo "0 2 * * 0 cd $(pwd) && ./scripts/backup-onedrive.sh >> logs/backup.log 2>&1" | crontab -
```

#### Funcionalidades de Backup Incluidas

**✅ Backup Completo:**
- Código fuente (sin node_modules)
- Configuraciones del sistema
- Logs de aplicación
- Datos del sistema
- Configuraciones de deployment

**✅ Gestión Inteligente:**
- Limpieza automática de backups antiguos
- Mantiene últimos 30 backups por defecto
- Compresión automática
- Verificación de integridad

**✅ Monitoreo:**
- Logs detallados
- Notificaciones de estado
- Información de tamaño y fecha
- Detección de errores

#### Restauración de Backups
```bash
# Script interactivo de restauración
./scripts/restore-backup.sh

# Funciones incluidas:
# - Listar backups disponibles
# - Ver información detallada
# - Restauración automática
# - Extracción de archivos
```

### Verificación de Backups

#### Ver Estado de Configuración
```bash
# Usar el configurador para ver estado
./scripts/setup-backup-cloud.sh
# Seleccionar opción 5: "Ver estado de configuración"
```

#### Verificar Logs
```bash
# Ver logs de backup
tail -f logs/backup.log

# Ver últimos backups
ls -la logs/
```

#### Probar Conectividad
```bash
# Probar Google Drive
rclone ls gdrive:Backups/Sistema-POS

# Probar OneDrive
rclone ls onedrive:Backups/Sistema-POS
```

## 🔒 Configuración de Seguridad

### Variables de Entorno
```bash
# Crear archivo .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
BACKUP_EMAIL=admin@mirestaurante.com
WEBHOOK_URL=https://hooks.slack.com/...
EOF
```

### Firewall (Ubuntu/CentOS)
```bash
# Ubuntu
sudo ufw allow 3000
sudo ufw enable

# CentOS
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Certificados SSL (Opcional)
```bash
# Con Certbot (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d tu-dominio.com
```

## 🔧 Mantenimiento

### Monitoreo del Sistema
```bash
# Estado de PM2
pm2 status
pm2 logs

# Estado de Docker
docker ps
docker logs pos-sistema

# Estado de backups
crontab -l | grep "Sistema POS"
```

### Actualizaciones
```bash
# Actualizar código
git pull origin main
npm install
npm run build

# Reiniciar servicios
pm2 reload all
# O con Docker
docker-compose restart
```

### Limpieza de Logs
```bash
# Rotar logs de PM2
pm2 flush

# Limpiar logs antiguos
find logs/ -name "*.log" -mtime +30 -delete
```

## 🆘 Solución de Problemas

### Problemas Comunes

#### 1. Puerto 3000 en uso
```bash
# Verificar qué proceso usa el puerto
sudo lsof -i :3000
# Cambiar puerto en ecosystem.config.js
```

#### 2. Error de permisos
```bash
# Dar permisos correctos
chmod +x scripts/*.sh
sudo chown -R $USER:$USER .
```

#### 3. Fallos de backup
```bash
# Verificar configuración de rclone
rclone config show

# Verificar conectividad
rclone ls gdrive:
rclone ls onedrive:

# Verificar logs
tail -n 50 logs/backup.log
```

#### 4. Memoria insuficiente
```bash
# Aumentar memoria de Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# O en ecosystem.config.js
node_args: ['--max-old-space-size=4096']
```

### Comandos de Diagnóstico

```bash
# Información del sistema
./install-pos.sh --check

# Estado completo
./scripts/setup-backup-cloud.sh
# Seleccionar: "Ver estado de configuración"

# Logs en tiempo real
pm2 logs --raw | grep ERROR
tail -f logs/backup.log
```

### Recuperación de Emergencia

#### Restaurar desde Backup en la Nube
```bash
# Usar script de restauración
./scripts/restore-backup.sh

# O manualmente
rclone copy gdrive:Backups/Sistema-POS/backup-YYYYMMDD_HHMMSS ./restore/
cd restore/
tar -xzf codigo-fuente.tar.gz
npm install
npm run build
```

#### Backup Manual de Emergencia
```bash
# Backup rápido manual
tar -czf emergency-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=logs \
  .

# Subir a nube
rclone copy emergency-backup-*.tar.gz gdrive:Emergency-Backups/
```

## 📞 Soporte

### Información de Contacto
- **Email**: soporte@sistema-pos-honduras.com
- **Documentación**: Incluida en el proyecto
- **Logs**: Ubicados en `logs/`

### Reporte de Bugs
Incluir en el reporte:
1. Versión del sistema (`npm run version`)
2. Sistema operativo
3. Logs relevantes
4. Pasos para reproducir

---

**Sistema POS Honduras** - Versión 1.0  
Última actualización: $(date +"%Y-%m-%d")  
Incluye: ✅ Backup automático en la nube | ✅ Restauración inteligente | ✅ Monitoreo avanzado 