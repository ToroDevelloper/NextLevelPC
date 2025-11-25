const { executeQuery } = require('../config/db');

class Servicio {

    static async findAll() {
        const query = `
            SELECT * 
            FROM servicios 
            WHERE activo = 1
            ORDER BY tipo, nombre
        `;
        return await executeQuery(query);
    }


    static async findByTipo(tipo) {
        const query = `
            SELECT * 
            FROM servicios 
            WHERE activo = 1 AND tipo = ?
            ORDER BY nombre
        `;
        return await executeQuery(query, [tipo]);
    }


    static async findById(id) {
        // Get service basic data
        const query = `
            SELECT * 
            FROM servicios 
            WHERE id = ? AND activo = 1
        `;
        const resultados = await executeQuery(query, [id]);

        if (resultados.length === 0) {
            return null;
        }

        const servicio = resultados[0];

        // Get gallery images
        const imagenesQuery = `
            SELECT id, url, alt_text, orden, es_principal
            FROM servicio_imagenes
            WHERE servicio_id = ? AND activo = 1
            ORDER BY orden ASC
        `;
        const imagenes = await executeQuery(imagenesQuery, [id]);

        // Attach images to service object
        servicio.galeria_imagenes = imagenes;

        return servicio;
    }


    static async create(servicioData) {
        const { nombre, tipo = 'basico', precio, descripcion = null, imagen_url = null } = servicioData;

        const query = `
            INSERT INTO servicios (nombre, tipo, precio, descripcion, imagen_url, activo) 
            VALUES (?, ?, ?, ?, ?, 1)
        `;

        const result = await executeQuery(query, [nombre, tipo, precio, descripcion, imagen_url]);
        return this.findById(result.insertId);
    }


    static async update(id, servicioData) {
        const { nombre, tipo, precio, descripcion, imagen_url } = servicioData;

        const query = `
            UPDATE servicios 
            SET nombre = ?, tipo = ?, precio = ?, descripcion = ?, imagen_url = ? 
            WHERE id = ? AND activo = 1
        `;

        await executeQuery(query, [nombre, tipo, precio, descripcion, imagen_url, id]);
        return this.findById(id);
    }


    static async delete(id) {
        const query = `UPDATE servicios SET activo = 0 WHERE id = ?`;
        const result = await executeQuery(query, [id]);
        return result.affectedRows > 0;
    }


    static async findByNombre(nombre, excludeId = null) {
        let query = `SELECT * FROM servicios WHERE nombre = ? AND activo = 1`;
        const params = [nombre];

        if (excludeId) {
            query += ` AND id != ?`;
            params.push(excludeId);
        }

        const resultados = await executeQuery(query, params);
        return resultados.length > 0 ? resultados[0] : null;
    }
}

module.exports = Servicio;