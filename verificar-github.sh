#!/bin/bash

echo "🔍 VERIFICANDO CONFIGURACIÓN DE GITHUB"
echo "======================================"

echo ""
echo "📋 Configuración Global de Git:"
echo "-------------------------------"
echo "👤 Nombre: $(git config --global user.name || echo 'No configurado')"
echo "📧 Email: $(git config --global user.email || echo 'No configurado')"

echo ""
echo "📋 Configuración Local del Proyecto:"
echo "------------------------------------"
echo "👤 Nombre: $(git config user.name || echo 'No configurado')"
echo "📧 Email: $(git config user.email || echo 'No configurado')"

echo ""
echo "🔗 Repositorios Remotos:"
echo "------------------------"
if git remote -v 2>/dev/null | grep -q origin; then
    git remote -v
else
    echo "❌ No hay repositorios remotos configurados"
fi

echo ""
echo "📊 Estado del Repositorio:"
echo "-------------------------"
if git log --oneline -1 2>/dev/null; then
    echo "✅ Hay commits en el repositorio"
else
    echo "⚠️ No hay commits aún"
fi

echo ""
echo "🔐 Métodos de Autenticación Disponibles:"
echo "---------------------------------------"
if [ -f ~/.ssh/id_rsa ] || [ -f ~/.ssh/id_ed25519 ]; then
    echo "✅ SSH keys encontradas:"
    ls -la ~/.ssh/id_* 2>/dev/null | grep -v ".pub"
else
    echo "❌ No se encontraron SSH keys"
fi

echo ""
echo "🌐 Para verificar tu cuenta de GitHub:"
echo "1. Ve a https://github.com/settings/profile"
echo "2. O ejecuta: gh auth status (si tienes GitHub CLI)" 