const { executeQuery } = require('../config/db');
const UsuariosService = require('../services/UsuariosService');

class Ordenes {
static async crear(data) {
    const { cliente_id, tipo, total = 0.00, cita_servicio_id = null } = data;

    // Validaciones básicas
    if (!tipo || !['producto', 'servicio', 'mixto'].includes(tipo)) {
        throw new Error('Tipo debe ser "producto", "servicio" o "mixto"');
    }

    if (total < 0) {
        throw new Error('El total no puede ser negativo');
    }

    // Verificar que el cliente existe (si se proporciona)
    if (cliente_id) {
        const clienteExiste = await UsuariosService.obtenerPorId(cliente_id);
        if (clienteExiste.length === 0) {
            throw new Error('El cliente especificado no existe');
        }
    }

    const numero_orden = `ORD-${Date.now()}`;

    const result = await executeQuery(
        `INSERT INTO ordenes (cliente_id, tipo, numero_orden, total, estado_orden, estado_pago, cita_servicio_id) 
         VALUES (?, ?, ?, ?, 'pendiente', 'pendiente', ?)`,
        [cliente_id, tipo, numero_orden, total, cita_servicio_id]
    );

    return result.insertId;
}

    static async obtenerTodos() {
        // LEFT JOIN porque cliente_id puede ser NULL
        return await executeQuery(`
            SELECT o.*, 
                   u.nombre as cliente_nombre, 
                   u.apellido as cliente_apellido,
                   u.correo as cliente_correo
            FROM ordenes o 
            LEFT JOIN usuarios u ON o.cliente_id = u.id 
            ORDER BY o.created_at DESC
        `);
    }

    static async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID de la orden es requerido');
        }

        // LEFT JOIN porque cliente_id puede ser NULL
        const result = await executeQuery(`
            SELECT o.*, 
                   u.nombre as cliente_nombre, 
                   u.apellido as cliente_apellido,
                   u.correo as cliente_correo
            FROM ordenes o 
            LEFT JOIN usuarios u ON o.cliente_id = u.id 
            WHERE o.id = ?
        `, [id]);
        
        return result.length > 0 ? result[0] : null;
    }

static async actualizar(id, data) {
    if (!id) {
        throw new Error('El ID de la orden es requerido');
    }

    // Verificar que la orden existe
    const ordenExiste = await this.obtenerPorId(id);
    if (!ordenExiste) {
        throw new Error('Orden no encontrada');
    }

    const camposPermitidos = ['estado_orden', 'estado_pago', 'total', 'tipo', 'cita_servicio_id'];
    const campos = Object.keys(data).filter(campo => camposPermitidos.includes(campo));
    
    if (campos.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
    }

    // Validaciones adicionales
    if (data.total !== undefined && data.total < 0) {
        throw new Error('El total no puede ser negativo');
    }

    if (data.tipo !== undefined && !['producto', 'servicio','mixto'].includes(data.tipo)) {
        throw new Error('Tipo debe ser "producto" o "servicio"');
    }

    if (data.estado_orden !== undefined && !['pendiente', 'procesando', 'completada', 'cancelada'].includes(data.estado_orden)) {
        throw new Error('Estado de orden inválido');
    }

    if (data.estado_pago !== undefined && !['pendiente', 'pagado', 'reembolsado'].includes(data.estado_pago)) {
        throw new Error('Estado de pago inválido');
    }

    const columnas = campos.map(campo => `${campo} = ?`).join(', ');
    const valores = campos.map(campo => data[campo]);

    const result = await executeQuery(
        `UPDATE ordenes SET ${columnas} WHERE id = ?`,
        [...valores, id]
    );

    return result.affectedRows > 0;
}

    static async eliminar(id) {
        if (!id) {
            throw new Error('El ID de la orden es requerido');
        }

        // Verificar que la orden existe
        const ordenExiste = await this.obtenerPorId(id);
        if (!ordenExiste) {
            throw new Error('Orden no encontrada');
        }

        const result = await executeQuery('DELETE FROM ordenes WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async obtenerPorCliente(clienteId) {
        if (!clienteId) {
            throw new Error('El ID del cliente es requerido');
        }

        return await executeQuery(`
            SELECT o.* 
            FROM ordenes o 
            WHERE o.cliente_id = ? 
            ORDER BY o.created_at DESC
        `, [clienteId]);
    }

    // Método adicional útil
    static async obtenerPorNumeroOrden(numeroOrden) {
        if (!numeroOrden) {
            throw new Error('El número de orden es requerido');
        }

        const result = await executeQuery(`
            SELECT o.*, 
                   u.nombre as cliente_nombre, 
                   u.apellido as cliente_apellido,
                   u.correo as cliente_correo
            FROM ordenes o 
            LEFT JOIN usuarios u ON o.cliente_id = u.id 
            WHERE o.numero_orden = ?
        `, [numeroOrden]);
        
        return result.length > 0 ? result[0] : null;
    }
}

module.exports = Ordenes;