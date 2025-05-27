# 📋 Instrucciones para Subir a GitHub

## ✅ Estado Actual
- ✅ Git inicializado
- ✅ .gitignore creado
- ✅ Archivos agregados al staging area
- ✅ README actualizado

## 🚀 Pasos para Completar la Subida

### Paso 1: Hacer Commit Inicial
Ejecuta estos comandos en la terminal (usa bash si PowerShell da problemas):

```bash
# Configurar usuario Git (si no está configurado)
git config user.name "Tu Nombre"
git config user.email "tu-email@example.com"

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
```

### Paso 2: Crear Repositorio en GitHub
1. Ve a [GitHub.com](https://github.com)
2. Haz clic en "New repository" (botón verde)
3. Nombre sugerido: `sistema-pos-honduras` o `facturacion-app`
4. Descripción: "Sistema POS para restaurantes con integración Business Central"
5. Selecciona "Public" o "Private" según prefieras
6. **NO** marques "Initialize with README" (ya tenemos uno)
7. Haz clic en "Create repository"

### Paso 3: Conectar Repositorio Local con GitHub
Copia los comandos que GitHub te muestra, algo así:

```bash
# Agregar remote origin (reemplaza con tu URL)
git remote add origin https://github.com/tu-usuario/sistema-pos-honduras.git

# Cambiar rama principal a main (si es necesario)
git branch -M main

# Subir código por primera vez
git push -u origin main
```

### Paso 4: Verificar Subida
1. Refresca la página de tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. El README.md se mostrará automáticamente

## 🔧 Si hay Problemas con PowerShell

Si PowerShell sigue dando errores, usa estos comandos alternativos:

```bash
# Usar bash directamente
bash -c "git commit -m 'Initial commit: Sistema POS Honduras'"
bash -c "git remote add origin https://github.com/tu-usuario/tu-repo.git"
bash -c "git push -u origin main"
```

O abre Terminal (no PowerShell) en Mac:
1. Presiona Cmd + Espacio
2. Escribe "Terminal"
3. Navega a tu proyecto: `cd /Users/solmerlopez/Downloads/facturacion-app`
4. Ejecuta los comandos git normalmente

## 📊 Información del Proyecto

**Tamaño actual**: ~210 KB (código fuente)
**Archivos**: 50+ archivos
**Características**:
- ✅ Sistema POS completo
- ✅ Integración Business Central
- ✅ Backup automático
- ✅ Scripts de utilidad
- ✅ Documentación completa

## 🎯 Próximos Pasos Después de Subir

1. **Configurar GitHub Pages** (opcional)
2. **Agregar badges** al README
3. **Configurar GitHub Actions** para CI/CD
4. **Crear releases** para versiones
5. **Configurar issues templates**

## 🆘 Si Necesitas Ayuda

1. **Error de autenticación**: Configura SSH keys o usa token personal
2. **Repositorio ya existe**: Usa `git remote set-url origin nueva-url`
3. **Archivos muy grandes**: Revisa .gitignore y usa Git LFS si es necesario

---

**¡Tu proyecto estará en GitHub en pocos minutos!** 🚀 