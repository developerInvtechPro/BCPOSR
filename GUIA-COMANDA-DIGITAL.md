# 🍽️ Guía de la Comanda Digital - Sistema POS Honduras

## 📋 ¿Qué es la Comanda Digital?

La Comanda Digital es una pantalla especializada para la cocina que muestra todos los pedidos en tiempo real, permitiendo al personal de cocina gestionar eficientemente la preparación de alimentos.

## 🚀 Características Principales

### ✅ Gestión de Estados
- **Pendiente** 🟠: Pedidos recién llegados
- **En Preparación** 🔵: Pedidos siendo cocinados
- **Listo** 🟢: Pedidos terminados para entregar
- **Entregado** ⚫: Pedidos completados

### ✅ Información Detallada
- **Tiempo Real**: Actualización automática cada segundo
- **Tiempos de Espera**: Cálculo automático desde creación
- **Progreso Visual**: Barras de progreso para pedidos en preparación
- **Prioridades**: Urgente, Alta, Normal con colores distintivos

### ✅ Alertas Inteligentes
- ⚠️ Pedidos con más de 10 minutos de espera
- 🚨 Pedidos listos esperando entrega por más de 5 minutos
- 🔔 Notificaciones sonoras configurables

## 🖥️ Cómo Acceder a la Comanda

### Opción 1: URL Directa
```
http://localhost:3000/comanda
```

### Opción 2: Desde el Sistema Principal
1. En tu sistema POS principal
2. Busca el botón **"🍽️ Comanda Cocina"**
3. Haz clic para abrir en nueva ventana

### Opción 3: Pantalla Dedicada
- Abre en una tablet o monitor dedicado para la cocina
- Funciona en pantalla completa
- Ideal para montaje en pared

## 🎯 Flujo de Trabajo Recomendado

### 1. **Recepción de Pedidos**
```
Nuevo Pedido → Estado: PENDIENTE → Aparece en comanda
```

### 2. **Inicio de Preparación**
```
Clic en "Iniciar" → Estado: EN PREPARACIÓN → Inicia cronómetro
```

### 3. **Finalización**
```
Clic en "Listo" → Estado: LISTO → Notificación sonora
```

### 4. **Entrega**
```
Clic en "Entregar" → Estado: ENTREGADO → Pedido completado
```

## 🔧 Funcionalidades Avanzadas

### 📊 Filtros Inteligentes
- **Todos**: Ver todos los pedidos
- **Pendientes**: Solo pedidos por iniciar
- **En Preparación**: Pedidos activos
- **Listos**: Pedidos para entregar

### 🖨️ Impresión de Comandas
- Formato optimizado para cocina
- Información completa del pedido
- Observaciones destacadas
- Tiempos estimados

### 📈 Estadísticas en Tiempo Real
- **Pedidos Activos**: Cantidad actual en proceso
- **Tiempo Promedio**: Eficiencia de preparación
- **Pedidos del Día**: Productividad diaria
- **Eficiencia**: Porcentaje de pedidos a tiempo

## 🎨 Códigos de Color

### Estados de Pedidos
- 🟠 **Naranja**: Pendiente
- 🔵 **Azul**: En Preparación  
- 🟢 **Verde**: Listo
- ⚫ **Gris**: Entregado

### Prioridades
- 🔴 **Rojo**: Urgente (delivery, clientes VIP)
- 🟡 **Amarillo**: Alta (mesas ocupadas hace tiempo)
- 🟢 **Verde**: Normal

### Tipos de Servicio
- 🏠 **Mesa**: Servicio en restaurante
- 📦 **Llevar**: Para recoger
- 🚗 **Delivery**: Entrega a domicilio

## ⚙️ Configuración

### 🔊 Sonidos
- **Activar/Desactivar**: Botón de altavoz en header
- **Nuevo Pedido**: Tono ascendente
- **Pedido Listo**: Tono de confirmación
- **Alertas**: Tono de advertencia

### 🖥️ Pantalla Completa
- Optimizada para tablets y monitores
- Responsive para diferentes tamaños
- Modo oscuro automático disponible

## 📱 Uso en Dispositivos

### 💻 Computadora
- Navegador web estándar
- Recomendado: Chrome, Firefox, Safari
- Resolución mínima: 1024x768

### 📱 Tablet
- iPad, Android tablets
- Orientación horizontal recomendada
- Touch optimizado

### 📺 Monitor Dedicado
- Montaje en pared de cocina
- Actualización automática
- Sin necesidad de interacción constante

## 🔄 Integración con el Sistema Principal

### Sincronización Automática
- Los pedidos del POS aparecen automáticamente
- Estados se sincronizan en tiempo real
- Cambios visibles en ambas pantallas

### Datos Compartidos
- Información de mesas
- Detalles de clientes
- Observaciones especiales
- Tiempos estimados

## 🛠️ Solución de Problemas

### ❌ La comanda no carga
**Solución:**
1. Verificar conexión a internet
2. Actualizar navegador (F5)
3. Limpiar cache del navegador

### ❌ No aparecen pedidos nuevos
**Solución:**
1. Verificar que el POS esté funcionando
2. Refrescar la página
3. Revisar filtros activos

### ❌ No hay sonido
**Solución:**
1. Verificar botón de sonido (🔊/🔇)
2. Revisar volumen del dispositivo
3. Permitir audio en el navegador

### ❌ Pantalla no se actualiza
**Solución:**
1. Recargar página (Ctrl+R)
2. Verificar conexión de red
3. Cerrar y reabrir navegador

## 📋 Mejores Prácticas

### 👨‍🍳 Para el Personal de Cocina
1. **Revisar constantemente** los pedidos pendientes
2. **Iniciar inmediatamente** los pedidos urgentes
3. **Marcar como listo** tan pronto termine
4. **Comunicar** cualquier retraso al mesero

### 👨‍💼 Para Gerentes
1. **Monitorear estadísticas** regularmente
2. **Identificar cuellos de botella** en preparación
3. **Ajustar tiempos estimados** según experiencia
4. **Capacitar personal** en uso del sistema

### 🔧 Para Administradores
1. **Mantener actualizado** el sistema
2. **Configurar impresoras** si es necesario
3. **Hacer backup** de configuraciones
4. **Monitorear rendimiento** del sistema

## 📊 Métricas Importantes

### KPIs de Cocina
- **Tiempo Promedio de Preparación**
- **Pedidos Completados por Hora**
- **Porcentaje de Pedidos a Tiempo**
- **Tiempo de Espera Promedio**

### Alertas de Rendimiento
- Pedidos con más de 15 min de retraso
- Eficiencia menor al 80%
- Más de 5 pedidos pendientes
- Tiempo promedio superior a 30 min

## 🎯 Beneficios del Sistema

### ✅ Para la Cocina
- Mayor organización visual
- Reducción de errores
- Mejor control de tiempos
- Comunicación clara con meseros

### ✅ Para el Restaurante
- Mejor experiencia del cliente
- Reducción de quejas por demoras
- Mayor eficiencia operativa
- Datos para optimización

### ✅ Para la Gestión
- Métricas en tiempo real
- Identificación de problemas
- Optimización de procesos
- Mejor toma de decisiones

---

## 🆘 Soporte Técnico

**¿Necesitas ayuda?**
- 📧 Email: soporte@sistempos-honduras.com
- 📱 WhatsApp: +504 XXXX-XXXX
- 🌐 Web: www.sistempos-honduras.com

**Horarios de Soporte:**
- Lunes a Viernes: 8:00 AM - 6:00 PM
- Sábados: 9:00 AM - 2:00 PM
- Emergencias: 24/7

---

¡Tu comanda digital está lista para revolucionar la cocina de tu restaurante! 🚀 