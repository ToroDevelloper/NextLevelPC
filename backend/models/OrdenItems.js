const { executeQuery } = require('../config/db');

class OrdenItems {
static async crear(data) {
    const { 
        orden_id, 
        tipo, 
        producto_id,
        servicio_id,
        descripcion, 
        cantidad = 1, 
        precio_unitario 
    } = data;

    // Validaciones básicas
    if (!orden_id || !tipo || !descripcion || !precio_unitario) {
        throw new Error('Faltan campos requeridos para crear item de orden');
    }

    // Validar que cantidad sea positiva
    if (cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
    }

    // Validar que precio sea válido
    if (precio_unitario <= 0) {
        throw new Error('El precio unitario debe ser mayor a 0');
    }

    const subtotal = precio_unitario * cantidad;

    const result = await executeQuery(
        `INSERT INTO orden_items 
         (orden_id, tipo, producto_id, servicio_id, descripcion, cantidad, precio_unitario, subtotal) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orden_id, tipo, producto_id, servicio_id, descripcion, cantidad, precio_unitario, subtotal]
    );

    return result.insertId;
}

static async obtenerTodos() {
    return await executeQuery(`
        SELECT oi.*,
               p.nombre as producto_nombre,
               p.precio_actual,
               s.nombre as servicio_nombre, 
               s.precio as servicio_precio,
               o.numero_orden,
               o.cliente_id
        FROM orden_items oi 
        LEFT JOIN productos p ON oi.producto_id = p.id 
        LEFT JOIN servicios s ON oi.servicio_id = s.id
        LEFT JOIN ordenes o ON oi.orden_id = o.id
        ORDER BY oi.id DESC
    `);
}

static async obtenerPorId(id) {
    const result = await executeQuery(`
        SELECT oi.*,
               p.nombre as producto_nombre,
               p.precio_actual,
               s.nombre as servicio_nombre,
               s.precio as servicio_precio,
               o.numero_orden,
               o.cliente_id,
               o.estado_orden,
               o.estado_pago
        FROM orden_items oi 
        LEFT JOIN productos p ON oi.producto_id = p.id 
        LEFT JOIN servicios s ON oi.servicio_id = s.id
        LEFT JOIN ordenes o ON oi.orden_id = o.id
        WHERE oi.id = ?
    `, [id]);
    
    return result.length > 0 ? result[0] : null;
}

static async obtenerPorOrden(ordenId) {
    if (!ordenId) {
        throw new Error('El ID de la orden es requerido');
    }

    return await executeQuery(`
        SELECT oi.*,
               p.nombre as producto_nombre,
               p.precio_actual,
               p.stock,
               s.nombre as servicio_nombre,
               s.precio as servicio_precio
        FROM orden_items oi 
        LEFT JOIN productos p ON oi.producto_id = p.id 
        LEFT JOIN servicios s ON oi.servicio_id = s.id
        WHERE oi.orden_id = ?
        ORDER BY oi.id ASC
    `, [ordenId]);
}

    static async actualizar(id, data) {
        const camposPermitidos = ['cantidad', 'precio_unitario', 'subtotal', 'descripcion'];
        const campos = Object.keys(data).filter(campo => camposPermitidos.includes(campo));
        
        if (campos.length === 0) {
            throw new Error('No hay campos válidos para actualizar');
        }

        // Recalcular subtotal si se actualiza cantidad o precio
        if (data.cantidad !== undefined || data.precio_unitario !== undefined) {
            const itemExistente = await this.obtenerPorId(id);
            
            if (!itemExistente) {
                throw new Error('Item de orden no encontrado');
            }

            const nuevaCantidad = data.cantidad !== undefined ? data.cantidad : itemExistente.cantidad;
            const nuevoPrecio = data.precio_unitario !== undefined ? data.precio_unitario : itemExistente.precio_unitario;
            
            // Validaciones
            if (nuevaCantidad <= 0) {
                throw new Error('La cantidad debe ser mayor a 0');
            }
            if (nuevoPrecio <= 0) {
                throw new Error('El precio debe ser mayor a 0');
            }

            data.subtotal = nuevaCantidad * nuevoPrecio;
            
            // Asegurar que subtotal esté en los campos a actualizar
            if (!campos.includes('subtotal')) {
                campos.push('subtotal');
            }
        }

        const columnas = campos.map(campo => `${campo} = ?`).join(', ');
        const valores = campos.map(campo => data[campo]);

        const result = await executeQuery(
            `UPDATE orden_items SET ${columnas} WHERE id = ?`,
            [...valores, id]
        );

        return result.affectedRows > 0;
    }

    static async eliminar(id) {
        if (!id) {
            throw new Error('El ID del item es requerido');
        }

        const result = await executeQuery('DELETE FROM orden_items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async eliminarPorOrden(ordenId) {
        if (!ordenId) {
            throw new Error('El ID de la orden es requerido');
        }

        const result = await executeQuery('DELETE FROM orden_items WHERE orden_id = ?', [ordenId]);
        return result.affectedRows;
    }

    /**
     * Obtener el total de items de una orden específica
     */
    static async obtenerTotalPorOrden(ordenId) {
        if (!ordenId) {
            throw new Error('El ID de la orden es requerido');
        }

        const result = await executeQuery(`
            SELECT 
                COALESCE(SUM(subtotal), 0) as total,
                COUNT(*) as total_items
            FROM orden_items 
            WHERE orden_id = ?
        `, [ordenId]);
        
        return result[0];
    }

    /**
     * Verificar si un producto está en alguna orden
     */
    static async verificarProductoEnOrdenes(productoId) {
        if (!productoId) {
            throw new Error('El ID del producto es requerido');
        }

        const result = await executeQuery(`
            SELECT COUNT(*) as total 
            FROM orden_items 
            WHERE producto_id = ?
        `, [productoId]);
        
        return result[0].total > 0;
    }

    /**
     * Obtener items por tipo (producto o servicio)
     */
    static async obtenerPorTipo(tipo) {
        if (!tipo || !['producto', 'servicio'].includes(tipo)) {
            throw new Error('Tipo debe ser "producto" o "servicio"');
        }

        return await executeQuery(`
            SELECT oi.*,
                   p.nombre as producto_nombre,
                   o.numero_orden,
                   o.estado_orden
            FROM orden_items oi 
            LEFT JOIN productos p ON oi.producto_id = p.id 
            LEFT JOIN ordenes o ON oi.orden_id = o.id
            WHERE oi.tipo = ?
            ORDER BY oi.id DESC
        `, [tipo]);
    }
}

module.exports = OrdenItems;