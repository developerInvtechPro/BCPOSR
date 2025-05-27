# 🍎 INSTRUCCIONES PARA TERMINAL DE MAC

## ⚠️ IMPORTANTE: PowerShell está dando problemas, usa Terminal de Mac

### Paso 1: Abrir Terminal de Mac
1. Presiona `Cmd + Espacio` (Spotlight)
2. Escribe "Terminal"
3. Presiona Enter

### Paso 2: Navegar al Proyecto
```bash
cd /Users/solmerlopez/Downloads/facturacion-app
```

### Paso 3: Ejecutar Script de Configuración
```bash
chmod +x setup-git-final.sh
./setup-git-final.sh
```

### Paso 4: Si el Script Funciona
El script te dará las instrucciones exactas para crear el repositorio en GitHub.

### Paso 5: Si Hay Problemas, Ejecuta Manualmente
```bash
# Configurar Git
git config --global user.email "selopez@invtech.pro"
git config --global user.name "Solmer Lopez"

# Verificar configuración
git config --global user.email
git config --global user.name

# Hacer commit
git commit -m "Initial commit: Sistema POS Honduras"

# Verificar commit
git log --oneline -1
```

## 🎯 Después del Commit

1. Ve a https://github.com
2. Haz clic en "New repository"
3. **Nombre**: `sistema-pos-honduras`
4. **Descripción**: `Sistema POS para restaurantes con integración Business Central`
5. Selecciona **Public** (recomendado) o Private
6. **NO marques** ninguna opción adicional
7. Haz clic en "Create repository"

## 🚀 Subir a GitHub

Después de crear el repositorio, ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/sistema-pos-honduras.git
git branch -M main
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

## ✅ ¡Listo!

Tu sistema POS estará disponible en GitHub con:
- ✅ Código fuente completo
- ✅ README profesional
- ✅ .gitignore configurado
- ✅ Historial de commits
- ✅ Documentación incluida 