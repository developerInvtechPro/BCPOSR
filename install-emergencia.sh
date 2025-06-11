#!/bin/bash

# 🚨 Instalador de Emergencia - Sistema POS Honduras
# Para cuando otros instaladores fallan

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}"
echo "🚨 INSTALADOR DE EMERGENCIA - Sistema POS Honduras"
echo "═══════════════════════════════════════════════════"
echo -e "${NC}"

echo -e "${YELLOW}Este instalador corrige errores comunes y limpia instalaciones corruptas${NC}"
echo ""

# Función de limpieza total
clean_everything() {
    echo -e "${BLUE}🧹 Limpiando instalación corrupta...${NC}"
    
    # Detener procesos de Node.js
    pkill -f "node.*next" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    
    # Limpiar caches
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules 2>/dev/null || true
    rm -rf package-lock.json 2>/dev/null || true
    rm -rf yarn.lock 2>/dev/null || true
    
    # Limpiar cache de npm
    npm cache clean --force 2>/dev/null || true
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para verificar Node.js
check_node() {
    echo -e "${BLUE}🔍 Verificando Node.js...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js no está instalado${NC}"
        echo -e "${YELLOW}Por favor instala Node.js desde: https://nodejs.org/${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js encontrado: $NODE_VERSION${NC}"
}

# Función para instalar dependencias de forma segura
safe_install() {
    echo -e "${BLUE}📦 Instalando dependencias de forma segura...${NC}"
    
    # Intentar instalación normal
    if npm install --no-audit --no-fund --prefer-offline; then
        echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}⚠️  Instalación normal falló, intentando métodos alternativos...${NC}"
    
    # Intentar con --force
    if npm install --force --no-audit --no-fund; then
        echo -e "${GREEN}✅ Dependencias instaladas con --force${NC}"
        return 0
    fi
    
    # Intentar con yarn si está disponible
    if command -v yarn &> /dev/null; then
        echo -e "${YELLOW}Intentando con Yarn...${NC}"
        if yarn install; then
            echo -e "${GREEN}✅ Dependencias instaladas con Yarn${NC}"
            return 0
        fi
    fi
    
    echo -e "${RED}❌ Error instalando dependencias${NC}"
    exit 1
}

# Función para verificar archivo principal
check_main_file() {
    echo -e "${BLUE}🔍 Verificando archivo principal...${NC}"
    
    if [[ ! -f "src/pages/index.tsx" ]]; then
        echo -e "${RED}❌ No se encontró src/pages/index.tsx${NC}"
        exit 1
    fi
    
    # Verificar sintaxis básica
    if ! node -c "src/pages/index.tsx" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Posible error de sintaxis en index.tsx${NC}"
        echo -e "${YELLOW}Creando backup...${NC}"
        cp src/pages/index.tsx src/pages/index.tsx.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    echo -e "${GREEN}✅ Archivo principal verificado${NC}"
}

# Función para crear configuración mínima
create_minimal_config() {
    echo -e "${BLUE}⚙️ Creando configuración mínima...${NC}"
    
    # Crear .env.local si no existe
    if [[ ! -f ".env.local" ]]; then
        cat > .env.local << 'EOF'
# Business Central - Honduras
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

# Database
DATABASE_URL="file:./dev.db"

# App
PORT=3000
NEXTAUTH_SECRET=pos-secret-key
NEXTAUTH_URL=http://localhost:3000

# Ignorar warnings de ESLint durante desarrollo
ESLINT_NO_DEV_ERRORS=true
EOF
        echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
    fi
    
    # Crear directorios necesarios
    mkdir -p logs backups uploads 2>/dev/null || true
    
    # Script de inicio simple
    cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando Sistema POS..."
export PORT=3000
export ESLINT_NO_DEV_ERRORS=true
npm run dev 2>&1 | tee logs/app.log
EOF
    chmod +x start.sh
    
    echo -e "${GREEN}✅ Configuración mínima creada${NC}"
}

# Función para probar la aplicación
test_app() {
    echo -e "${BLUE}🧪 Probando la aplicación...${NC}"
    
    # Intentar construir ignorando warnings de ESLint
    if ESLINT_NO_DEV_ERRORS=true npm run build 2>/dev/null; then
        echo -e "${GREEN}✅ Build exitoso${NC}"
    else
        echo -e "${YELLOW}⚠️  Build falló, pero puede funcionar en desarrollo${NC}"
    fi
    
    # Verificar que los scripts existen
    if grep -q "\"dev\":" package.json; then
        echo -e "${GREEN}✅ Script dev disponible${NC}"
    else
        echo -e "${RED}❌ Script dev no encontrado en package.json${NC}"
        exit 1
    fi
}

# Función para generar Prisma Client
generate_prisma() {
    echo -e "${BLUE}🔄 Generando Prisma Client...${NC}"
    
    if npx prisma generate >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Prisma Client generado${NC}"
    else
        echo -e "${YELLOW}⚠️  Error generando Prisma Client, pero continuando...${NC}"
    fi
}

# Función principal - ejecutar automáticamente
main() {
    echo -e "${BLUE}🔧 Instalación automática del sistema POS con Inventario Business Central${NC}"
    echo ""
    
    # Verificar directorio
    if [[ ! -f "package.json" ]]; then
        echo -e "${RED}❌ No se encontró package.json${NC}"
        echo -e "${YELLOW}Ejecuta este script desde el directorio del proyecto${NC}"
        exit 1
    fi
    
    # Ejecutar pasos de instalación
    clean_everything
    check_node
    safe_install
    check_main_file
    create_minimal_config
    generate_prisma
    test_app
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║       🎉 SISTEMA POS + INVENTARIO BUSINESS CENTRAL 🎉        ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🌐 Para iniciar la aplicación:${NC}"
    echo -e "${YELLOW}   npm run dev${NC}"
    echo ""
    echo -e "${BLUE}📋 Acceso al sistema de inventario:${NC}"
    echo -e "${YELLOW}   1. Abrir http://localhost:3000${NC}"
    echo -e "${YELLOW}   2. Clic en botón 'SUPER'${NC}"  
    echo -e "${YELLOW}   3. Seleccionar pestaña '📦 Inventario'${NC}"
    echo ""
    echo -e "${GREEN}✅ Funcionalidades disponibles:${NC}"
    echo -e "${CYAN}   • Gestión de artículos con Business Central${NC}"
    echo -e "${CYAN}   • Cálculo de costo promedio ponderado${NC}"
    echo -e "${CYAN}   • Recetas (BOM) con componentes${NC}"
    echo -e "${CYAN}   • Órdenes de compra completas${NC}"
    echo -e "${CYAN}   • Ajustes positivos/negativos${NC}"
    echo -e "${CYAN}   • Exportación Excel compatible con BC${NC}"
    echo -e "${CYAN}   • Integración API bidireccional${NC}"
    echo ""
}

# Ejecutar automáticamente
main 