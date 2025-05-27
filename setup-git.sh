#!/bin/bash

echo "🔧 Configurando Git para el proyecto..."

# Configurar usuario Git
git config user.name "Solmer Lopez"
git config user.email "solmer@example.com"

echo "✅ Usuario Git configurado"

# Hacer commit inicial
git commit -m "Initial commit: Sistema POS Honduras con integración Business Central

- Sistema POS completo para restaurantes
- Integración con Microsoft Business Central
- Gestión de mesas, pedidos y facturación
- Configuración de almacenes y sucursales
- Sistema de backup automático (Google Drive/OneDrive)
- Interfaz moderna con Material-UI
- Soporte para múltiples tipos de cliente (RTN/Crédito)
- Funcionalidades de cierre de turno y reportes"

echo "✅ Commit inicial creado"

# Mostrar estado
git log --oneline -1
echo ""
echo "🎉 Repositorio Git configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crear repositorio en GitHub"
echo "2. Agregar remote: git remote add origin https://github.com/tu-usuario/tu-repo.git"
echo "3. Subir código: git push -u origin main" 