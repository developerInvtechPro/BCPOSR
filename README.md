# POS Business Central

Sistema de Punto de Venta integrado con Microsoft Dynamics 365 Business Central.

## Características

- Interfaz moderna y responsiva
- Integración con Business Central
- Gestión de productos y clientes
- Sistema de ventas en tiempo real
- Reportes y análisis

## Requisitos Previos

- Node.js 18 o superior
- Cuenta de Microsoft Dynamics 365 Business Central
- Credenciales de API de Business Central

## Instalación

1. Clonar el repositorio:
```bash
git clone [url-del-repositorio]
cd pos-business-central
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env.local` con las siguientes variables:
```
NEXT_PUBLIC_BC_API_URL=https://api.businesscentral.dynamics.com/v2.0
NEXT_PUBLIC_BC_COMPANY_ID=your-company-id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Configuración de Business Central

1. Obtener las credenciales de API de Business Central
2. Configurar los permisos necesarios en Business Central
3. Actualizar las variables de entorno con los valores correctos

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes reutilizables
  ├── pages/         # Páginas de la aplicación
  ├── services/      # Servicios de API
  ├── styles/        # Estilos globales
  └── utils/         # Utilidades y helpers
```

## Desarrollo

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## Licencia

MIT 