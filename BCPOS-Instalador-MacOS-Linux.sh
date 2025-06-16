#!/bin/bash

# =====================================================
# BCPOS - INSTALADOR COMPLETO PARA MACOS/LINUX
# Instalador definitivo con todas las funcionalidades
# =====================================================

echo "🚀 BCPOS - INSTALADOR COMPLETO PARA MACOS/LINUX"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración de rutas
FACTURACION_PATH="$HOME/Downloads/facturacion-app"
BCPOS_PATH="$HOME/Desktop/BCPOS"

# Función para mostrar mensajes
show_message() {
    local type=$1
    local message=$2
    
    case $type in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️ $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}ℹ️ $message${NC}"
            ;;
        *)
            echo -e "${CYAN}$message${NC}"
            ;;
    esac
}

# Función para verificar Node.js
check_nodejs() {
    if command -v node &> /dev/null; then
        local version=$(node --version)
        show_message "success" "Node.js encontrado: $version"
        return 0
    else
        return 1
    fi
}

# Función para instalar Node.js
install_nodejs() {
    show_message "info" "Instalando Node.js..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install node
        else
            show_message "warning" "Homebrew no encontrado. Por favor instale Node.js manualmente desde nodejs.org"
            return 1
        fi
    else
        # Linux
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo yum install -y nodejs
        elif command -v pacman &> /dev/null; then
            # Arch Linux
            sudo pacman -S nodejs npm
        else
            show_message "warning" "Distribución no soportada. Por favor instale Node.js manualmente"
            return 1
        fi
    fi
    
    if check_nodejs; then
        show_message "success" "Node.js instalado correctamente"
        return 0
    else
        show_message "error" "Error instalando Node.js"
        return 1
    fi
}

# Función para confirmar acción
confirm() {
    local message=$1
    echo -e "${YELLOW}$message (s/N): ${NC}"
    read -r response
    case "$response" in
        [sS][iI]|[sS]|[yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

echo -e "${YELLOW}🔍 Verificando requisitos del sistema...${NC}"

# Verificar Node.js
if ! check_nodejs; then
    if confirm "Node.js no está instalado. ¿Desea instalarlo automáticamente?"; then
        if ! install_nodejs; then
            show_message "error" "No se pudo instalar Node.js. Por favor instálelo manualmente desde nodejs.org"
            exit 1
        fi
    else
        show_message "error" "Node.js es requerido para BCPOS. Instalación cancelada."
        exit 1
    fi
fi

# Mostrar opciones de instalación
echo ""
echo -e "${CYAN}Seleccione el tipo de instalación:${NC}"
echo "1. Instalación completa (recomendado)"
echo "   - Crea BCPOS desde cero"
echo "   - Integra sistema completo"
echo "   - Configura inicio automático"
echo ""
echo "2. Solo integrar sistema existente"
echo "   - Requiere BCPOS ya instalado"
echo "   - Solo copia archivos del sistema"
echo ""
echo -n "Seleccione opción (1-2): "
read -r install_option

if [[ "$install_option" == "1" ]]; then
    # INSTALACIÓN COMPLETA
    echo -e "${GREEN}🚀 INICIANDO INSTALACIÓN COMPLETA...${NC}"
    
    # Crear directorio BCPOS
    if [[ -d "$BCPOS_PATH" ]]; then
        if confirm "El directorio BCPOS ya existe. ¿Desea sobrescribirlo?"; then
            rm -rf "$BCPOS_PATH"
        else
            show_message "error" "Instalación cancelada."
            exit 1
        fi
    fi
    
    mkdir -p "$BCPOS_PATH"
    show_message "success" "Directorio BCPOS creado"
    
    # Crear estructura completa
    echo -e "${YELLOW}📁 Creando estructura del proyecto...${NC}"
    
    mkdir -p "$BCPOS_PATH/src/components"
    mkdir -p "$BCPOS_PATH/src/pages/api/inventory"
    mkdir -p "$BCPOS_PATH/src/lib"
    mkdir -p "$BCPOS_PATH/prisma"
    mkdir -p "$BCPOS_PATH/scripts"
    mkdir -p "$BCPOS_PATH/public"
    
    # Crear package.json
    echo -e "${YELLOW}📦 Creando package.json...${NC}"
    
    cat > "$BCPOS_PATH/package.json" << 'EOF'
{
  "name": "bcpos",
  "version": "1.0.0",
  "description": "Sistema POS completo con inventario - BCPOS",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "node scripts/seed-inventory.js",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^5.22.0",
    "@mui/material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.15.0",
    "@mui/x-data-grid": "^6.18.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "prisma": "^5.22.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
EOF

elif [[ "$install_option" == "2" ]]; then
    # SOLO INTEGRACIÓN
    echo -e "${GREEN}🔄 INICIANDO INTEGRACIÓN DEL SISTEMA...${NC}"
    
    # Verificar que BCPOS existe
    if [[ ! -d "$BCPOS_PATH" ]]; then
        show_message "error" "No se encontró BCPOS en: $BCPOS_PATH"
        show_message "error" "Por favor use la instalación completa."
        exit 1
    fi
else
    show_message "error" "Opción inválida. Saliendo..."
    exit 1
fi

# Verificar facturacion-app e integrar archivos
if [[ -d "$FACTURACION_PATH" ]]; then
    echo -e "${YELLOW}📋 Integrando archivos del sistema...${NC}"
    
    # Archivos a copiar
    declare -A files_to_copy=(
        ["src/pages/index.tsx"]="src/pages/index.tsx"
        ["src/components/InventoryManager.tsx"]="src/components/InventoryManager.tsx"
        ["src/lib/inventory-service.ts"]="src/lib/inventory-service.ts"
        ["scripts/seed-inventory.js"]="scripts/seed-inventory.js"
        ["src/pages/api/inventory/items.ts"]="src/pages/api/inventory/items.ts"
        ["src/pages/api/inventory/movements.ts"]="src/pages/api/inventory/movements.ts"
        ["src/pages/api/inventory/summary.ts"]="src/pages/api/inventory/summary.ts"
        ["src/pages/api/inventory/vendors.ts"]="src/pages/api/inventory/vendors.ts"
        ["src/pages/api/inventory/purchase-orders.ts"]="src/pages/api/inventory/purchase-orders.ts"
        ["src/pages/api/inventory/recipes.ts"]="src/pages/api/inventory/recipes.ts"
    )
    
    # Copiar archivos
    for source_file in "${!files_to_copy[@]}"; do
        dest_file="${files_to_copy[$source_file]}"
        source_path="$FACTURACION_PATH/$source_file"
        dest_path="$BCPOS_PATH/$dest_file"
        
        if [[ -f "$source_path" ]]; then
            # Crear directorio padre si no existe
            mkdir -p "$(dirname "$dest_path")"
            cp "$source_path" "$dest_path"
            show_message "success" "Copiado: $source_file"
        else
            show_message "warning" "No encontrado: $source_file"
        fi
    done
fi

echo -e "${YELLOW}🗄️ Configurando base de datos...${NC}"

# Crear schema.prisma
cat > "$BCPOS_PATH/prisma/schema.prisma" << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Item {
  id          String   @id @default(cuid())
  name        String
  description String?
  sku         String   @unique
  category    String
  price       Float
  cost        Float
  stock       Int      @default(0)
  minStock    Int      @default(0)
  maxStock    Int      @default(100)
  unit        String   @default("unidad")
  barcode     String?  @unique
  image       String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  movements   Movement[]
  orderItems  PurchaseOrderItem[]
  recipeItems RecipeItem[]

  @@map("items")
}

model Movement {
  id          String      @id @default(cuid())
  itemId      String
  type        MovementType
  quantity    Int
  cost        Float?
  price       Float?
  reference   String?
  notes       String?
  createdAt   DateTime    @default(now())
  
  item        Item        @relation(fields: [itemId], references: [id])

  @@map("movements")
}

model Vendor {
  id            String          @id @default(cuid())
  name          String
  contact       String?
  email         String?
  phone         String?
  address       String?
  active        Boolean         @default(true)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  purchaseOrders PurchaseOrder[]

  @@map("vendors")
}

model PurchaseOrder {
  id          String              @id @default(cuid())
  vendorId    String
  orderNumber String              @unique
  status      PurchaseOrderStatus @default(PENDING)
  orderDate   DateTime            @default(now())
  expectedDate DateTime?
  receivedDate DateTime?
  total       Float               @default(0)
  notes       String?
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  vendor      Vendor              @relation(fields: [vendorId], references: [id])
  items       PurchaseOrderItem[]

  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id              String        @id @default(cuid())
  purchaseOrderId String
  itemId          String
  quantity        Int
  cost            Float
  received        Int           @default(0)
  
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])
  item            Item          @relation(fields: [itemId], references: [id])

  @@map("purchase_order_items")
}

model Recipe {
  id          String       @id @default(cuid())
  name        String
  description String?
  yield       Int          @default(1)
  unit        String       @default("porción")
  cost        Float        @default(0)
  active      Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  items       RecipeItem[]

  @@map("recipes")
}

model RecipeItem {
  id        String @id @default(cuid())
  recipeId  String
  itemId    String
  quantity  Float
  unit      String @default("unidad")
  
  recipe    Recipe @relation(fields: [recipeId], references: [id])
  item      Item   @relation(fields: [itemId], references: [id])

  @@map("recipe_items")
}

enum MovementType {
  IN
  OUT
  ADJUSTMENT
  TRANSFER
}

enum PurchaseOrderStatus {
  PENDING
  ORDERED
  PARTIAL
  RECEIVED
  CANCELLED
}
EOF

# Crear .env
cat > "$BCPOS_PATH/.env" << 'EOF'
# CONFIGURACIÓN BCPOS - SISTEMA COMPLETO
DATABASE_URL="file:./bcpos.db"

# Business Central - PRECONFIGURADO HONDURAS
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

# Configuración del Sistema
PORT=3000
NEXTAUTH_SECRET=bcpos-secret-key-2024
NEXTAUTH_URL=http://localhost:3000

# Configuración de Empresa
EMPRESA_NOMBRE="BCPOS - Sistema de Punto de Venta"
EMPRESA_RTN="08011999123456"
EMPRESA_DIRECCION="Tegucigalpa, Honduras"
EMPRESA_TELEFONO="2234-5678"

# Configuración de Impresión
PRINTER_NAME="POS-80"
PRINTER_WIDTH=48
EOF

# Crear archivos de configuración
echo -e "${YELLOW}⚙️ Creando archivos de configuración...${NC}"

# next.config.js
cat > "$BCPOS_PATH/next.config.js" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig
EOF

# tsconfig.json
cat > "$BCPOS_PATH/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

echo -e "${YELLOW}📋 Creando scripts de gestión...${NC}"

# Script de configuración
cat > "$BCPOS_PATH/configurar-sistema.sh" << 'EOF'
#!/bin/bash

echo "================================================"
echo "  🚀 BCPOS - CONFIGURACIÓN COMPLETA"
echo "     Sistema POS con Inventario"
echo "================================================"
echo ""

cd "$(dirname "$0")"

echo "📦 Instalando dependencias..."
npm install

echo "🗄️ Configurando base de datos..."
npx prisma generate
npx prisma db push

echo "🌱 Poblando datos iniciales..."
if [[ -f "scripts/seed-inventory.js" ]]; then
    node scripts/seed-inventory.js
else
    echo "⚠️ Script de seed no encontrado, continuando..."
fi

echo ""
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "🚀 Para iniciar el sistema ejecute: npm run dev"
echo "📱 Acceso: http://localhost:3000"
echo ""
read -p "Presione Enter para continuar..."
EOF

chmod +x "$BCPOS_PATH/configurar-sistema.sh"

# Script de inicio
cat > "$BCPOS_PATH/iniciar-bcpos.sh" << 'EOF'
#!/bin/bash

echo "================================================"
echo "  🚀 BCPOS - SISTEMA COMPLETO"
echo "     POS + Inventario + Business Central"
echo "================================================"
echo ""

cd "$(dirname "$0")"

# Verificar si el servidor ya está corriendo
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Servidor ya está corriendo"
    echo "🌐 Abriendo navegador..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3000
    else
        xdg-open http://localhost:3000 2>/dev/null || echo "Por favor abra http://localhost:3000 en su navegador"
    fi
    sleep 3
    exit 0
fi

echo "🔄 Iniciando servidor BCPOS..."
npm run dev &

echo "⏳ Esperando que el servidor esté listo..."
sleep 20

echo "🌐 Abriendo navegador..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
else
    xdg-open http://localhost:3000 2>/dev/null || echo "Por favor abra http://localhost:3000 en su navegador"
fi

echo ""
echo "✅ BCPOS iniciado correctamente"
echo "📱 Sistema POS: http://localhost:3000"
echo ""
sleep 3
EOF

chmod +x "$BCPOS_PATH/iniciar-bcpos.sh"

# Script de inicio automático
cat > "$BCPOS_PATH/inicio-automatico.sh" << 'EOF'
#!/bin/bash

# Esperar 30 segundos para que el sistema termine de cargar
sleep 30

cd "$(dirname "$0")"

# Verificar si ya está corriendo
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    exit 0
fi

# Iniciar BCPOS en segundo plano
nohup npm run dev > /dev/null 2>&1 &

# Esperar y verificar
sleep 20

# Mostrar notificación si está listo
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e 'display notification "BCPOS iniciado automáticamente\nDisponible en: http://localhost:3000" with title "BCPOS"'
    else
        notify-send "BCPOS" "BCPOS iniciado automáticamente\nDisponible en: http://localhost:3000" 2>/dev/null || echo "BCPOS iniciado automáticamente en http://localhost:3000"
    fi
fi
EOF

chmod +x "$BCPOS_PATH/inicio-automatico.sh"

# Script de gestión de inicio automático
cat > "$BCPOS_PATH/gestionar-inicio-automatico.sh" << 'EOF'
#!/bin/bash

SCRIPT_DIR="$(dirname "$0")"
AUTOSTART_SCRIPT="$SCRIPT_DIR/inicio-automatico.sh"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - usar LaunchAgent
    PLIST_PATH="$HOME/Library/LaunchAgents/com.bcpos.autostart.plist"
    
    enable_autostart() {
        cat > "$PLIST_PATH" << EOL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.bcpos.autostart</string>
    <key>ProgramArguments</key>
    <array>
        <string>$AUTOSTART_SCRIPT</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOL
        launchctl load "$PLIST_PATH"
        echo "✅ Inicio automático habilitado (macOS LaunchAgent)"
    }
    
    disable_autostart() {
        if [[ -f "$PLIST_PATH" ]]; then
            launchctl unload "$PLIST_PATH"
            rm "$PLIST_PATH"
        fi
        echo "✅ Inicio automático deshabilitado"
    }
    
    check_status() {
        if [[ -f "$PLIST_PATH" ]]; then
            echo "✅ BCPOS está configurado para inicio automático (macOS)"
        else
            echo "❌ BCPOS NO está configurado para inicio automático"
        fi
    }
    
else
    # Linux - usar autostart desktop entry
    AUTOSTART_DIR="$HOME/.config/autostart"
    DESKTOP_FILE="$AUTOSTART_DIR/bcpos.desktop"
    
    enable_autostart() {
        mkdir -p "$AUTOSTART_DIR"
        cat > "$DESKTOP_FILE" << EOL
[Desktop Entry]
Type=Application
Name=BCPOS
Exec=$AUTOSTART_SCRIPT
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOL
        echo "✅ Inicio automático habilitado (Linux autostart)"
    }
    
    disable_autostart() {
        if [[ -f "$DESKTOP_FILE" ]]; then
            rm "$DESKTOP_FILE"
        fi
        echo "✅ Inicio automático deshabilitado"
    }
    
    check_status() {
        if [[ -f "$DESKTOP_FILE" ]]; then
            echo "✅ BCPOS está configurado para inicio automático (Linux)"
        else
            echo "❌ BCPOS NO está configurado para inicio automático"
        fi
    }
fi

while true; do
    clear
    echo "================================================"
    echo "  🚀 BCPOS - GESTIÓN DE INICIO AUTOMÁTICO"
    echo "================================================"
    echo ""
    echo "1. ✅ Habilitar inicio automático"
    echo "2. ❌ Deshabilitar inicio automático"
    echo "3. 📊 Ver estado actual"
    echo "4. 🚀 Iniciar BCPOS ahora"
    echo "5. ⏹️  Detener BCPOS"
    echo "6. 🌐 Abrir BCPOS en navegador"
    echo "7. 🔄 Reiniciar BCPOS"
    echo "8. ❌ Salir"
    echo ""
    read -p "Seleccione una opción (1-8): " choice
    
    case $choice in
        1)
            enable_autostart
            sleep 3
            ;;
        2)
            disable_autostart
            sleep 3
            ;;
        3)
            check_status
            read -p "Presione Enter para continuar..."
            ;;
        4)
            echo "🚀 Iniciando BCPOS..."
            cd "$SCRIPT_DIR"
            nohup npm run dev > /dev/null 2>&1 &
            echo "✅ BCPOS iniciado"
            sleep 3
            ;;
        5)
            echo "⏹️ Deteniendo BCPOS..."
            pkill -f "npm run dev" 2>/dev/null
            pkill -f "next dev" 2>/dev/null
            echo "✅ BCPOS detenido"
            sleep 3
            ;;
        6)
            echo "🌐 Abriendo BCPOS..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                open http://localhost:3000
            else
                xdg-open http://localhost:3000 2>/dev/null || echo "Por favor abra http://localhost:3000 en su navegador"
            fi
            sleep 2
            ;;
        7)
            echo "🔄 Reiniciando BCPOS..."
            pkill -f "npm run dev" 2>/dev/null
            pkill -f "next dev" 2>/dev/null
            sleep 3
            cd "$SCRIPT_DIR"
            nohup npm run dev > /dev/null 2>&1 &
            echo "✅ BCPOS reiniciado"
            sleep 3
            ;;
        8)
            exit 0
            ;;
        *)
            echo "Opción inválida"
            sleep 2
            ;;
    esac
done
EOF

chmod +x "$BCPOS_PATH/gestionar-inicio-automatico.sh"

echo -e "${YELLOW}🖥️ Creando accesos directos...${NC}"

# Crear accesos directos en el escritorio
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - crear alias
    osascript << EOD
tell application "Finder"
    make alias file to POSIX file "$BCPOS_PATH/iniciar-bcpos.sh" at desktop
    set name of result to "🚀 BCPOS"
end tell

tell application "Finder"
    make alias file to POSIX file "$BCPOS_PATH/configurar-sistema.sh" at desktop
    set name of result to "⚙️ Configurar BCPOS"
end tell

tell application "Finder"
    make alias file to POSIX file "$BCPOS_PATH/gestionar-inicio-automatico.sh" at desktop
    set name of result to "🔄 Gestionar Inicio BCPOS"
end tell
EOD
else
    # Linux - crear archivos .desktop
    cat > "$HOME/Desktop/BCPOS.desktop" << EOL
[Desktop Entry]
Version=1.0
Type=Application
Name=🚀 BCPOS
Comment=Sistema POS Completo
Exec=$BCPOS_PATH/iniciar-bcpos.sh
Icon=applications-office
Terminal=true
Categories=Office;
EOL

    cat > "$HOME/Desktop/Configurar-BCPOS.desktop" << EOL
[Desktop Entry]
Version=1.0
Type=Application
Name=⚙️ Configurar BCPOS
Comment=Configurar sistema BCPOS
Exec=$BCPOS_PATH/configurar-sistema.sh
Icon=preferences-system
Terminal=true
Categories=System;
EOL

    cat > "$HOME/Desktop/Gestionar-Inicio-BCPOS.desktop" << EOL
[Desktop Entry]
Version=1.0
Type=Application
Name=🔄 Gestionar Inicio BCPOS
Comment=Gestionar inicio automático de BCPOS
Exec=$BCPOS_PATH/gestionar-inicio-automatico.sh
Icon=preferences-desktop-startup
Terminal=true
Categories=System;
EOL

    chmod +x "$HOME/Desktop/"*.desktop
fi

echo -e "${GREEN}🎉 INSTALACIÓN COMPLETADA${NC}"
echo "========================="

cat << 'EOF'

✅ BCPOS INSTALADO CORRECTAMENTE

📋 COMPONENTES INSTALADOS:

🖥️ SISTEMA POS COMPLETO:
   • Punto de venta con todas las funcionalidades
   • Gestión de mesas, delivery, pickup
   • Facturación con CAI
   • Múltiples formas de pago
   • Apertura automática de cajón

📦 INVENTARIO AVANZADO:
   • Gestión de artículos
   • Movimientos de inventario
   • Órdenes de compra
   • Recetas y componentes
   • Proveedores

🔗 BUSINESS CENTRAL:
   • Integración preconfigurada para Honduras
   • Sincronización automática de datos

🗄️ BASE DE DATOS:
   • SQLite local configurada
   • Prisma ORM
   • Esquema completo

🖥️ ACCESOS CREADOS:
   • 🚀 BCPOS - Iniciar sistema
   • ⚙️ Configurar BCPOS - Instalar dependencias
   • 🔄 Gestionar Inicio BCPOS - Configurar inicio automático

🚀 PRÓXIMOS PASOS:
   1. Ejecutar: ⚙️ Configurar BCPOS (instala dependencias)
   2. Configurar: 🔄 Gestionar Inicio BCPOS (opcional)
   3. Iniciar: 🚀 BCPOS
   4. Acceder: http://localhost:3000

✅ ¡BCPOS listo para usar!

EOF

# Preguntar si desea configurar ahora
if confirm "¿Desea ejecutar la configuración completa ahora?"; then
    echo -e "${YELLOW}🔄 Ejecutando configuración...${NC}"
    cd "$BCPOS_PATH"
    ./configurar-sistema.sh
    
    echo -e "${GREEN}🎉 ¡Sistema listo para usar!${NC}"
    
    # Preguntar sobre inicio automático
    if confirm "¿Desea configurar BCPOS para inicio automático?"; then
        ./gestionar-inicio-automatico.sh
    fi
    
    if confirm "¿Desea iniciar BCPOS ahora?"; then
        ./iniciar-bcpos.sh &
    fi
fi

show_message "success" "¡Instalación finalizada!"
echo "Presione Enter para salir..."
read 