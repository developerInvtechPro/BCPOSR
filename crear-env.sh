#!/bin/bash

# Script para crear archivo .env con configuración PostgreSQL para BCPOS

echo "🔧 Creando archivo .env para BCPOS..."

cat > .env << 'EOF'
# =====================================================
# CONFIGURACIÓN BCPOS - BASE DE DATOS POSTGRESQL
# =====================================================

# Base de datos PostgreSQL
DATABASE_URL="postgresql://solmerlopez:@localhost:5432/pos_honduras"

# Business Central Configuration - PRECONFIGURADO HONDURAS
BC_TENANT_ID=0b48b68c-f813-4060-844f-2079fe72f87c
BC_CLIENT_ID=570853f4-2ca4-4dce-a433-a5322fa215fa
BC_CLIENT_SECRET=7i88Q~CJTBJ4a9LPLPW93Bjb6bJSiNprbkVGUbdG
BC_ENVIRONMENT=SB110225
BC_COMPANY_ID=88a8517e-4be2-ef11-9345-002248e0e739

# Puerto del servidor
PORT=3000

# Configuración de seguridad
NEXTAUTH_SECRET=bcpos-secret-key-2024
NEXTAUTH_URL=http://localhost:3000

# Configuración de desarrollo
ESLINT_NO_DEV_ERRORS=true
NODE_ENV=development
EOF

echo "✅ Archivo .env creado exitosamente"
echo "📋 Configuración:"
echo "   - Base de datos: PostgreSQL (pos_honduras)"
echo "   - Usuario: solmerlopez"
echo "   - Puerto: 5432"
echo "   - Business Central: Configurado para Honduras" 