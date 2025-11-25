const { executeQuery } = require('../config/db');

class ImagenProducto {
    static async crear(data) {
        const { producto_id, url, es_principal = 0 } = data;
        
        const result = await executeQuery(
            'INSERT INTO imagenes_productos (producto_id, url, es_principal) VALUES (?, ?, ?)',
            [producto_id, url, es_principal]
        );
        return result.insertId;
    }

    static async obtenerPorProducto(producto_id) {
        return await executeQuery(
            'SELECT * FROM imagenes_productos WHERE producto_id = ? ORDER BY es_principal DESC, id',
            [producto_id]
        );
    }

    static async obtenerPrincipal(producto_id) {
        const result = await executeQuery(
            'SELECT * FROM imagenes_productos WHERE producto_id = ? AND es_principal = 1',
            [producto_id]
        );
        return result.length > 0 ? result[0] : null;
    }

    static async eliminar(id) {
        const result = await executeQuery('DELETE FROM imagenes_productos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    
    static async obtenerPorId(id){
     const result = await executeQuery('SELECT * FROM imagenes_productos WHERE id = ?', [id]);
            return result.length > 0 ? result[0] : null;
    }

    static async establecerPrincipal(producto_id, imagen_id) {
        // Quitar principal de todas
        await executeQuery(
            'UPDATE imagenes_productos SET es_principal = 0 WHERE producto_id = ?',
            [producto_id]
        );
        // Establecer nueva principal
        const result = await executeQuery(
            'UPDATE imagenes_productos SET es_principal = 1 WHERE id = ? AND producto_id = ?',
            [imagen_id, producto_id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = ImagenProducto;