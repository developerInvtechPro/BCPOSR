# 🎯 PASOS EXACTOS PARA SUBIR A GITHUB

## ⚠️ IMPORTANTE: Usa Terminal de Mac, NO PowerShell

### Paso 1: Abrir Terminal de Mac
1. Presiona `Cmd + Espacio`
2. Escribe "Terminal" 
3. Presiona Enter

### Paso 2: Navegar al Proyecto
```bash
cd /Users/solmerlopez/Downloads/facturacion-app
```

### Paso 3: Verificar Estado de Git
```bash
git status
```

### Paso 4: Hacer Commit Inicial
```bash
git commit -m "Initial commit: Sistema POS Honduras con integración Business Central"
```

### Paso 5: Crear Repositorio en GitHub
1. Ve a https://github.com
2. Haz clic en el botón verde "New" o "New repository"
3. **Nombre del repositorio**: `sistema-pos-honduras`
4. **Descripción**: `Sistema POS para restaurantes con integración Business Central`
5. Selecciona **Public** (o Private si prefieres)
6. **NO marques** "Add a README file" (ya tenemos uno)
7. **NO marques** "Add .gitignore" (ya tenemos uno)
8. Haz clic en "Create repository"

### Paso 6: Conectar con GitHub
GitHub te mostrará comandos similares a estos (copia los que te muestre):

```bash
git remote add origin https://github.com/TU-USUARIO/sistema-pos-honduras.git
git branch -M main
git push -u origin main
```

**IMPORTANTE**: Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

### Paso 7: Verificar
1. Refresca la página de tu repositorio en GitHub
2. Deberías ver todos tus archivos
3. El README.md se mostrará automáticamente

## 🔧 Si hay Problemas de Autenticación

Si GitHub pide autenticación:

### Opción A: Token Personal
1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con permisos de "repo"
3. Usa el token como contraseña cuando te lo pida

### Opción B: SSH (Recomendado)
```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@example.com"

# Agregar a SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Mostrar clave pública para copiar
cat ~/.ssh/id_ed25519.pub
```

Luego ve a GitHub → Settings → SSH and GPG keys → New SSH key y pega la clave.

## 📊 Tu Proyecto Incluye

- ✅ **Sistema POS completo** (5,242 líneas)
- ✅ **Integración Business Central**
- ✅ **50+ archivos** organizados
- ✅ **Scripts de utilidad**
- ✅ **Documentación completa**
- ✅ **README profesional**
- ✅ **.gitignore configurado**

## 🎉 Después de Subir

Tu repositorio estará disponible en:
`https://github.com/TU-USUARIO/sistema-pos-honduras`

¡Y podrás compartirlo con quien quieras!

---

**💡 Tip**: Si algo no funciona, copia el error exacto y te ayudo a solucionarlo. 