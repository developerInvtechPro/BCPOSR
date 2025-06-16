#!/bin/bash

echo "🚀 CONFIGURANDO BCPOS CON POSTGRESQL"
echo "===================================="

# 1. Verificar que PostgreSQL esté instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado"
    echo "💡 Instala PostgreSQL con: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL encontrado: $(which psql)"

# 2. Verificar/crear base de datos
echo "🔍 Verificando base de datos pos_honduras..."

# Crear base de datos si no existe
psql -h localhost -U solmerlopez -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'pos_honduras';" | grep -q 1
if [ $? -ne 0 ]; then
    echo "📦 Creando base de datos pos_honduras..."
    psql -h localhost -U solmerlopez -d postgres -c "CREATE DATABASE pos_honduras;"
    echo "✅ Base de datos pos_honduras creada"
else
    echo "✅ Base de datos pos_honduras ya existe"
fi

# 3. Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Cliente Prisma generado exitosamente"
else
    echo "❌ Error generando cliente Prisma"
    exit 1
fi

# 4. Sincronizar esquema con base de datos
echo "🔄 Sincronizando esquema con base de datos..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Esquema sincronizado exitosamente"
else
    echo "❌ Error sincronizando esquema"
    exit 1
fi

# 5. Verificar conexión
echo "🔍 Verificando conexión a base de datos..."
psql -h localhost -U solmerlopez pos_honduras -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';"

echo ""
echo "🎉 ¡BCPOS CONFIGURADO EXITOSAMENTE!"
echo "=================================="
echo "📋 Configuración:"
echo "   ✅ Base de datos: PostgreSQL (pos_honduras)"
echo "   ✅ Usuario: solmerlopez"
echo "   ✅ Puerto: 5432"
echo "   ✅ Esquema: Sincronizado"
echo "   ✅ Cliente Prisma: Generado"
echo ""
echo "🚀 Para iniciar BCPOS ejecuta:"
echo "   npm run dev"
echo ""
echo "🌐 Acceso:"
echo "   http://localhost:3000" 