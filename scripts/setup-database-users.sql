-- =====================================================
-- CONFIGURACIÓN DE USUARIOS Y PERMISOS POSTGRESQL
-- Sistema POS Honduras - Gestión de Usuarios y Roles
-- =====================================================

-- 1. CREAR ROLES PRINCIPALES
-- =====================================================

-- Rol de solo lectura (para reportes y consultas)
CREATE ROLE pos_readonly;
GRANT CONNECT ON DATABASE pos_honduras TO pos_readonly;
GRANT USAGE ON SCHEMA public TO pos_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pos_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO pos_readonly;

-- Rol de cajero (operaciones básicas de venta)
CREATE ROLE pos_cajero;
GRANT CONNECT ON DATABASE pos_honduras TO pos_cajero;
GRANT USAGE ON SCHEMA public TO pos_cajero;
GRANT SELECT, INSERT, UPDATE ON productos, pedidos, pedido_items, mesas TO pos_cajero;
GRANT SELECT ON usuarios, configuracion TO pos_cajero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pos_cajero;

-- Rol de mesero (gestión de mesas y pedidos)
CREATE ROLE pos_mesero;
GRANT CONNECT ON DATABASE pos_honduras TO pos_mesero;
GRANT USAGE ON SCHEMA public TO pos_mesero;
GRANT SELECT, INSERT, UPDATE ON productos, pedidos, pedido_items, mesas, reservas TO pos_mesero;
GRANT SELECT ON usuarios, configuracion TO pos_mesero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pos_mesero;

-- Rol de gerente (acceso completo excepto configuración crítica)
CREATE ROLE pos_gerente;
GRANT CONNECT ON DATABASE pos_honduras TO pos_gerente;
GRANT USAGE ON SCHEMA public TO pos_gerente;
GRANT SELECT, INSERT, UPDATE, DELETE ON productos, pedidos, pedido_items, mesas, reservas, ventas_diarias TO pos_gerente;
GRANT SELECT, UPDATE ON usuarios TO pos_gerente;
GRANT SELECT, INSERT, UPDATE ON configuracion TO pos_gerente;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO pos_gerente;

-- Rol de administrador (acceso completo)
CREATE ROLE pos_admin;
GRANT CONNECT ON DATABASE pos_honduras TO pos_admin;
GRANT USAGE ON SCHEMA public TO pos_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pos_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pos_admin;
GRANT CREATE ON SCHEMA public TO pos_admin;

-- 2. CREAR USUARIOS ESPECÍFICOS
-- =====================================================

-- Usuario para reportes y análisis (solo lectura)
CREATE USER pos_reports WITH PASSWORD 'Reports2024!';
GRANT pos_readonly TO pos_reports;

-- Usuario cajero principal
CREATE USER pos_cajero_01 WITH PASSWORD 'Cajero2024!';
GRANT pos_cajero TO pos_cajero_01;

-- Usuario cajero secundario
CREATE USER pos_cajero_02 WITH PASSWORD 'Cajero2024!';
GRANT pos_cajero TO pos_cajero_02;

-- Usuario mesero principal
CREATE USER pos_mesero_01 WITH PASSWORD 'Mesero2024!';
GRANT pos_mesero TO pos_mesero_01;

-- Usuario mesero secundario
CREATE USER pos_mesero_02 WITH PASSWORD 'Mesero2024!';
GRANT pos_mesero TO pos_mesero_02;

-- Usuario gerente
CREATE USER pos_gerente_01 WITH PASSWORD 'Gerente2024!';
GRANT pos_gerente TO pos_gerente_01;

-- Usuario administrador
CREATE USER pos_admin_01 WITH PASSWORD 'Admin2024!';
GRANT pos_admin TO pos_admin_01;

-- Usuario para aplicación (conexión principal)
CREATE USER pos_app WITH PASSWORD 'PosApp2024!';
GRANT pos_admin TO pos_app;

-- 3. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para tabla productos
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_nombre_busqueda ON productos USING gin(to_tsvector('spanish', nombre || ' ' || COALESCE(descripcion, '')));

-- Índices para tabla mesas
CREATE INDEX IF NOT EXISTS idx_mesas_numero ON mesas(numero);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_activa ON mesas(activa);

-- Índices para tabla pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo ON pedidos(tipo);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_id ON pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_creacion ON pedidos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_cierre ON pedidos(fecha_cierre);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_telefono ON pedidos(cliente_telefono);

-- Índices para tabla pedido_items
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_producto_id ON pedido_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_created_at ON pedido_items(created_at);

-- Índices para tabla reservas
CREATE INDEX IF NOT EXISTS idx_reservas_mesa_id ON reservas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_hora ON reservas(hora);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente_telefono ON reservas(cliente_telefono);

-- Índices para tabla usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Índices para tabla configuracion
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion(clave);
CREATE INDEX IF NOT EXISTS idx_configuracion_tipo ON configuracion(tipo);

-- Índices para tabla ventas_diarias
CREATE INDEX IF NOT EXISTS idx_ventas_diarias_fecha ON ventas_diarias(fecha);

-- 4. ÍNDICES COMPUESTOS PARA CONSULTAS COMPLEJAS
-- =====================================================

-- Para consultas de pedidos por fecha y estado
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_estado ON pedidos(fecha_creacion, estado);

-- Para consultas de pedidos por mesa y estado
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_estado ON pedidos(mesa_id, estado) WHERE mesa_id IS NOT NULL;

-- Para consultas de items por pedido y producto
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_producto ON pedido_items(pedido_id, producto_id);

-- Para consultas de reservas por fecha y mesa
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_mesa ON reservas(fecha, mesa_id);

-- Para consultas de productos activos por categoría
CREATE INDEX IF NOT EXISTS idx_productos_categoria_activo ON productos(categoria, activo) WHERE activo = true;

-- 5. CONFIGURACIONES DE SEGURIDAD ADICIONALES
-- =====================================================

-- Configurar límites de conexión por usuario
ALTER USER pos_reports CONNECTION LIMIT 5;
ALTER USER pos_cajero_01 CONNECTION LIMIT 3;
ALTER USER pos_cajero_02 CONNECTION LIMIT 3;
ALTER USER pos_mesero_01 CONNECTION LIMIT 3;
ALTER USER pos_mesero_02 CONNECTION LIMIT 3;
ALTER USER pos_gerente_01 CONNECTION LIMIT 5;
ALTER USER pos_admin_01 CONNECTION LIMIT 10;
ALTER USER pos_app CONNECTION LIMIT 20;

-- Configurar timeout de sesión (en segundos)
ALTER USER pos_reports SET statement_timeout = '300000'; -- 5 minutos
ALTER USER pos_cajero_01 SET statement_timeout = '60000'; -- 1 minuto
ALTER USER pos_cajero_02 SET statement_timeout = '60000'; -- 1 minuto
ALTER USER pos_mesero_01 SET statement_timeout = '60000'; -- 1 minuto
ALTER USER pos_mesero_02 SET statement_timeout = '60000'; -- 1 minuto

-- 6. VISTAS PARA REPORTES OPTIMIZADOS
-- =====================================================

-- Vista para resumen de ventas diarias
CREATE OR REPLACE VIEW v_resumen_ventas_diarias AS
SELECT 
    DATE(p.fecha_creacion) as fecha,
    COUNT(*) as total_pedidos,
    SUM(p.total) as total_ventas,
    AVG(p.total) as promedio_ticket,
    COUNT(DISTINCT p.mesa_id) as mesas_utilizadas,
    COUNT(CASE WHEN p.tipo = 'delivery' THEN 1 END) as pedidos_delivery,
    COUNT(CASE WHEN p.tipo = 'pickup' THEN 1 END) as pedidos_pickup
FROM pedidos p
WHERE p.estado = 'cerrado'
GROUP BY DATE(p.fecha_creacion)
ORDER BY fecha DESC;

-- Vista para productos más vendidos
CREATE OR REPLACE VIEW v_productos_mas_vendidos AS
SELECT 
    pr.codigo,
    pr.nombre,
    pr.categoria,
    SUM(pi.cantidad) as total_vendido,
    SUM(pi.subtotal) as total_ingresos,
    COUNT(DISTINCT pi.pedido_id) as pedidos_incluido
FROM productos pr
JOIN pedido_items pi ON pr.id = pi.producto_id
JOIN pedidos p ON pi.pedido_id = p.id
WHERE p.estado = 'cerrado'
GROUP BY pr.id, pr.codigo, pr.nombre, pr.categoria
ORDER BY total_vendido DESC;

-- Vista para estado actual de mesas
CREATE OR REPLACE VIEW v_estado_mesas AS
SELECT 
    m.numero,
    m.estado,
    m.capacidad,
    CASE 
        WHEN p.id IS NOT NULL THEN p.numero
        ELSE NULL
    END as pedido_actual,
    CASE 
        WHEN p.id IS NOT NULL THEN p.total
        ELSE 0
    END as total_consumo,
    r.cliente_nombre as reserva_cliente,
    r.hora as reserva_hora
FROM mesas m
LEFT JOIN pedidos p ON m.id = p.mesa_id AND p.estado = 'abierto'
LEFT JOIN reservas r ON m.id = r.mesa_id 
    AND r.fecha = CURRENT_DATE::text 
    AND r.estado = 'confirmada'
    AND r.hora > CURRENT_TIME::text
ORDER BY m.numero;

-- 7. FUNCIONES PARA AUDITORÍA
-- =====================================================

-- Función para registrar cambios en pedidos
CREATE OR REPLACE FUNCTION audit_pedidos()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO configuracion (clave, valor, tipo)
        VALUES (
            'audit_pedido_' || NEW.id || '_' || extract(epoch from now()),
            json_build_object(
                'accion', 'UPDATE',
                'usuario', current_user,
                'timestamp', now(),
                'pedido_id', NEW.id,
                'estado_anterior', OLD.estado,
                'estado_nuevo', NEW.estado,
                'total_anterior', OLD.total,
                'total_nuevo', NEW.total
            )::text,
            'audit'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auditoría de pedidos
DROP TRIGGER IF EXISTS trigger_audit_pedidos ON pedidos;
CREATE TRIGGER trigger_audit_pedidos
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION audit_pedidos();

-- 8. ESTADÍSTICAS Y MANTENIMIENTO
-- =====================================================

-- Actualizar estadísticas de todas las tablas
ANALYZE productos;
ANALYZE mesas;
ANALYZE pedidos;
ANALYZE pedido_items;
ANALYZE reservas;
ANALYZE usuarios;
ANALYZE configuracion;
ANALYZE ventas_diarias;

-- 9. COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON ROLE pos_readonly IS 'Rol de solo lectura para reportes y consultas';
COMMENT ON ROLE pos_cajero IS 'Rol para operaciones básicas de caja y ventas';
COMMENT ON ROLE pos_mesero IS 'Rol para gestión de mesas, pedidos y reservas';
COMMENT ON ROLE pos_gerente IS 'Rol para gestión completa excepto configuración crítica';
COMMENT ON ROLE pos_admin IS 'Rol de administrador con acceso completo';

COMMENT ON USER pos_reports IS 'Usuario para reportes y análisis de datos';
COMMENT ON USER pos_app IS 'Usuario principal de la aplicación POS';

-- 10. SCRIPT DE VERIFICACIÓN
-- =====================================================

-- Verificar usuarios creados
SELECT 
    rolname as usuario,
    rolcanlogin as puede_login,
    rolconnlimit as limite_conexiones
FROM pg_roles 
WHERE rolname LIKE 'pos_%'
ORDER BY rolname;

-- Verificar índices creados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar vistas creadas
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname LIKE 'v_%'
ORDER BY viewname;

COMMIT; 