# 🚨 Guía de Manejo de Errores - Comanda Digital

## 📋 Situaciones Comunes y Soluciones

### 🔄 **Reversión de Estados**

#### ¿Cuándo usar?
- Chef marcó "Listo" por error
- Pedido necesita más tiempo de preparación
- Se olvidó agregar un ingrediente
- Cliente pidió modificación de último momento

#### ¿Cómo revertir?
1. **Buscar el pedido** en la comanda
2. **Hacer clic en "Revertir"** (botón con ícono ↶)
3. **Especificar motivo** de la reversión
4. **Confirmar** la acción

#### Estados que se pueden revertir:
- ✅ **En Preparación** → Pendiente
- ✅ **Listo** → En Preparación  
- ✅ **Entregado** → Listo (solo en casos especiales)

---

### ❌ **Cancelación de Pedidos**

#### Motivos comunes:
- **Cliente canceló** - Cliente cambió de opinión
- **Falta de ingredientes** - No hay stock suficiente
- **Error en la orden** - Pedido mal tomado
- **Problema en cocina** - Equipo dañado, etc.
- **Cliente no esperó** - Se fue del restaurante

#### Proceso de cancelación:
1. **Hacer clic en "Cancelar"** en el pedido
2. **Seleccionar motivo** del menú desplegable
3. **Confirmar cancelación**
4. El pedido se marca como **CANCELADO** 🔴

#### ¿Qué pasa después?
- ✅ Pedido queda registrado para estadísticas
- ✅ Se puede **rehacer** si es necesario
- ✅ Mesero recibe notificación automática
- ✅ Se actualiza el estado de la mesa

---

### ↩️ **Devoluciones de Comida**

#### Motivos frecuentes:
- **Comida fría** - Llegó fría al cliente
- **Mal sabor** - Problema en preparación
- **Orden incorrecta** - No es lo que pidió
- **Tiempo excesivo** - Demoró demasiado
- **Ingrediente faltante** - Falta algo del pedido
- **Alérgeno no especificado** - Problema de salud

#### Proceso de devolución:
1. **Cliente devuelve** el plato al mesero
2. **Mesero informa** a cocina
3. **Chef hace clic en "Devolver"** en la comanda
4. **Seleccionar motivo** específico
5. **Confirmar devolución**

#### Acciones automáticas:
- 🔄 **Rehacer automático** si es posible
- 📊 **Registro para mejoras** de proceso
- 🚨 **Alerta al gerente** si hay muchas devoluciones
- 💰 **Nota para descuento/cortesía**

---

### 🔄 **Rehacer Pedidos**

#### ¿Cuándo rehacer?
- Pedido cancelado por error
- Devolución que se puede corregir
- Cliente regresó y quiere el mismo pedido
- Error solucionado (ej: llegaron ingredientes)

#### Proceso:
1. **Buscar pedido cancelado/devuelto**
2. **Hacer clic en "Rehacer"** 
3. **Especificar motivo** del rehecho
4. **Pedido vuelve a "Pendiente"** 🟠

---

## 🎯 Escenarios Específicos del Restaurante

### 🍳 **Errores de Cocina**

#### **Escenario 1: Plato quemado**
```
Problema: Chef quemó el pollo a la plancha
Solución:
1. Revertir de "Listo" a "En Preparación"
2. Motivo: "Plato quemado, preparando nuevo"
3. Reiniciar preparación
4. Notificar tiempo adicional al mesero
```

#### **Escenario 2: Ingrediente equivocado**
```
Problema: Pusieron pollo en lugar de carne
Solución:
1. Si no se entregó: Revertir a "En Preparación"
2. Si se entregó: Marcar como "Devuelto"
3. Motivo: "Ingrediente incorrecto"
4. Rehacer con ingrediente correcto
```

#### **Escenario 3: Falta un acompañamiento**
```
Problema: Olvidaron las papas fritas
Solución:
1. Revertir de "Listo" a "En Preparación"
2. Motivo: "Falta acompañamiento"
3. Agregar las papas
4. Marcar como "Listo" nuevamente
```

### 👥 **Errores de Servicio**

#### **Escenario 4: Mesero se equivocó de mesa**
```
Problema: Llevó el pedido a mesa incorrecta
Solución:
1. Marcar como "Devuelto"
2. Motivo: "Entregado en mesa incorrecta"
3. Rehacer si la comida se enfrió
4. Entregar en mesa correcta
```

#### **Escenario 5: Cliente cambió de opinión**
```
Problema: Cliente quiere cambiar el pedido
Estado: En Preparación
Solución:
1. Evaluar si se puede modificar
2. Si no: Cancelar con motivo "Cliente cambió pedido"
3. Crear nuevo pedido con lo solicitado
```

### 🕐 **Problemas de Tiempo**

#### **Escenario 6: Demora excesiva**
```
Problema: Pedido lleva 45 minutos
Solución:
1. Verificar estado real en cocina
2. Si está listo: Marcar como "Listo"
3. Si no: Estimar tiempo restante
4. Notificar al cliente con cortesía
```

#### **Escenario 7: Cliente impaciente se fue**
```
Problema: Cliente se fue sin esperar
Solución:
1. Cancelar pedido
2. Motivo: "Cliente no esperó"
3. Evaluar si se puede vender a otro cliente
4. Si no: Descartar y registrar pérdida
```

---

## 📊 **Monitoreo y Prevención**

### 🚨 **Alertas Automáticas**

#### **Alertas de Tiempo:**
- ⚠️ **10 minutos**: Pedido pendiente sin iniciar
- 🚨 **15 minutos**: Pedido en preparación excedido
- 🔥 **20 minutos**: Pedido listo sin entregar

#### **Alertas de Calidad:**
- 📈 **3+ cancelaciones/día**: Revisar procesos
- 📉 **2+ devoluciones/día**: Problema de calidad
- 🔄 **5+ reversiones/día**: Entrenamiento necesario

### 📈 **Métricas de Mejora**

#### **KPIs a monitorear:**
- **% de cancelaciones** (meta: <5%)
- **% de devoluciones** (meta: <2%)
- **Tiempo promedio** de preparación
- **% de pedidos a tiempo** (meta: >90%)

#### **Reportes diarios:**
- Total de errores por tipo
- Motivos más frecuentes
- Horarios con más problemas
- Sugerencias de mejora

---

## 🎓 **Entrenamiento del Personal**

### 👨‍🍳 **Para Chefs:**

#### **Buenas prácticas:**
1. **Verificar pedido** antes de marcar "Listo"
2. **Revisar temperatura** de la comida
3. **Confirmar todos los acompañamientos**
4. **Usar "Revertir" sin miedo** si hay error

#### **Cuándo pedir ayuda:**
- No está seguro del estado del pedido
- Hay problema con ingredientes
- Equipo no funciona correctamente
- Cliente tiene alergia no especificada

### 👨‍💼 **Para Meseros:**

#### **Comunicación con cocina:**
1. **Informar cambios** del cliente inmediatamente
2. **Verificar pedidos** antes de entregar
3. **Reportar devoluciones** con motivo claro
4. **Coordinar tiempos** con cocina

#### **Manejo de quejas:**
1. **Escuchar al cliente** sin interrumpir
2. **Disculparse** por el inconveniente
3. **Informar a cocina** inmediatamente
4. **Ofrecer soluciones** (rehacer, descuento, etc.)

---

## 🔧 **Configuración Avanzada**

### ⚙️ **Personalización de Motivos**

Puedes agregar motivos específicos de tu restaurante:

```javascript
// Motivos de cancelación personalizados
const motivosCancelacion = [
  "Cliente canceló",
  "Falta de ingredientes", 
  "Error en la orden",
  "Problema en cocina",
  "Cliente no esperó",
  "Corte de luz",           // Específico
  "Problema con gas",       // Específico  
  "Ingrediente vencido"     // Específico
];
```

### 📱 **Notificaciones Personalizadas**

```javascript
// Configurar alertas por WhatsApp
const alertasWhatsApp = {
  gerente: "+504-XXXX-XXXX",
  chef: "+504-YYYY-YYYY",
  alertas: {
    cancelaciones: 3,    // Alertar después de 3
    devoluciones: 2,     // Alertar después de 2
    demoras: 20          // Alertar después de 20 min
  }
};
```

---

## 📞 **Soporte y Escalación**

### 🆘 **Cuándo contactar soporte:**
- Sistema no responde correctamente
- Botones no funcionan
- Datos se pierden
- Errores técnicos recurrentes

### 📱 **Contactos de emergencia:**
- **Soporte Técnico**: +504 XXXX-XXXX
- **Gerente General**: +504 YYYY-YYYY
- **Proveedor Sistema**: soporte@sistempos.com

### 🔄 **Procedimiento de escalación:**
1. **Nivel 1**: Chef/Mesero resuelve
2. **Nivel 2**: Supervisor de turno
3. **Nivel 3**: Gerente del restaurante
4. **Nivel 4**: Soporte técnico

---

## ✅ **Lista de Verificación Diaria**

### 🌅 **Al inicio del turno:**
- [ ] Verificar que la comanda funcione
- [ ] Revisar pedidos pendientes del turno anterior
- [ ] Confirmar stock de ingredientes principales
- [ ] Probar botones de estado
- [ ] Verificar sonido de alertas

### 🌙 **Al final del turno:**
- [ ] Revisar estadísticas del día
- [ ] Documentar problemas recurrentes
- [ ] Limpiar pedidos antiguos
- [ ] Reportar mejoras sugeridas
- [ ] Backup de datos importantes

---

**¡Con estas herramientas, tu cocina estará preparada para manejar cualquier situación!** 🚀👨‍🍳 