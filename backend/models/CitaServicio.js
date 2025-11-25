const { executeQuery } = require('../config/db');

class CitaServicio {
static async create(citaData) {
    const {
        servicio_id,
        nombre_cliente,     
        nombre,           
        email_cliente,     
        email,              
        telefono_cliente,   
        telefono,          
        direccion_cliente,  
        direccion,         
        fecha_cita,       
        fecha,          
        descripcion_problema, 
        descripcion,        
        estado = 'pendiente',
        estado_pago = 'pendiente',
        orden_id = null
    } = citaData;

    const query = `
        INSERT INTO citas_servicios (
            servicio_id, nombre_cliente, email_cliente, telefono_cliente, 
            direccion_cliente, fecha_cita, descripcion_problema,
            estado, estado_pago, orden_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        servicio_id,
        nombre_cliente || nombre,         
        email_cliente || email,             
        telefono_cliente || telefono,      
        direccion_cliente || direccion,     
        fecha_cita || fecha,               
        descripcion_problema || descripcion, 
        estado,
        estado_pago,
        orden_id
    ];

    const result = await executeQuery(query, params);
    return { id: result.insertId, ...citaData };
}

    static async findAll() {
        const query = `
            SELECT cs.*, s.nombre as servicio_nombre 
            FROM citas_servicios cs
            JOIN servicios s ON cs.servicio_id = s.id
            ORDER BY cs.created_at DESC
        `;
        return await executeQuery(query);
    }

    static async findById(id) {
        const query = `SELECT * FROM citas_servicios WHERE id = ?`;
        const result = await executeQuery(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    static async updateStatus(id, estado) {
        const query = `UPDATE citas_servicios SET estado = ? WHERE id = ?`;
        await executeQuery(query, [estado, id]);
        return this.findById(id);
    }

    // NUEVO: Actualizar estado de pago y orden asociada
    static async updateEstadoPago(id, estadoPago, ordenId = null) {
        const query = `
            UPDATE citas_servicios 
            SET estado_pago = ?, orden_id = ? 
            WHERE id = ?
        `;
        await executeQuery(query, [estadoPago, ordenId, id]);
        return this.findById(id);
    }
}

module.exports = CitaServicio;

