#!/bin/bash

echo "🚀 CONFIGURACIÓN FINAL DE GIT PARA GITHUB"
echo "========================================="

# Configurar usuario Git
echo "🔧 Configurando usuario Git..."
git config --global user.email "selopez@invtech.pro"
git config --global user.name "Solmer Lopez"

echo "✅ Usuario configurado:"
echo "   📧 Email: $(git config --global user.email)"
echo "   👤 Nombre: $(git config --global user.name)"

# Verificar estado del repositorio
echo ""
echo "📊 Estado del repositorio:"
git status --porcelain | wc -l | xargs echo "   📁 Archivos para commit:"

# Hacer commit inicial
echo ""
echo "💾 Haciendo commit inicial..."
git commit -m "Initial commit: Sistema POS Honduras con integración Business Central

🏪 Sistema completo de Punto de Venta para restaurantes
🔗 Integración con Microsoft Business Central
📊 Gestión de mesas, pedidos y facturación
🏢 Configuración multi-almacén y sucursales
💾 Sistema de backup automático (Google Drive/OneDrive)
🎨 Interfaz moderna con Material-UI
👥 Soporte para múltiples tipos de cliente
📈 Funcionalidades de cierre de turno y reportes
🔐 Autenticación OAuth 2.0 con Business Central"

if [ $? -eq 0 ]; then
    echo "✅ Commit inicial creado exitosamente!"
    echo ""
    echo "📋 Información del commit:"
    git log --oneline -1
    echo ""
    echo "🎯 PRÓXIMOS PASOS:"
    echo "=================="
    echo "1. Ve a https://github.com"
    echo "2. Haz clic en 'New repository'"
    echo "3. Nombre: sistema-pos-honduras"
    echo "4. Descripción: Sistema POS para restaurantes con integración Business Central"
    echo "5. Selecciona Public o Private"
    echo "6. NO marques ninguna opción adicional"
    echo "7. Haz clic en 'Create repository'"
    echo ""
    echo "8. Luego ejecuta estos comandos:"
    echo "   git remote add origin https://github.com/TU_USUARIO/sistema-pos-honduras.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "🎉 ¡Tu proyecto estará en GitHub!"
else
    echo "❌ Error en el commit. Verifica el estado:"
    git status
fi 