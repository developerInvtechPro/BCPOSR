#!/bin/bash

echo "🔧 REPARANDO BASE DE DATOS BCPOS"
echo "================================"

# Generar cliente Prisma
echo "📦 Generando cliente Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Cliente Prisma generado correctamente"
else
    echo "❌ Error generando cliente Prisma"
    exit 1
fi

# Crear base de datos
echo "🗄️ Creando base de datos SQLite..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Base de datos creada correctamente"
else
    echo "❌ Error creando base de datos"
    exit 1
fi

echo ""
echo "✅ BASE DE DATOS REPARADA"
echo "========================"
echo ""
echo "Ahora puede ejecutar: npm run dev"
echo "" 