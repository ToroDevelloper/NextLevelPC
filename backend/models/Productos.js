const { executeQuery } = require('../config/db.js');

class Productos {
    static async crear(data) {
        const { nombre, categoria_id, precio_actual, stock, estado } = data;

        const result = await executeQuery(
            'INSERT INTO productos (nombre, categoria_id, precio_actual, stock, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, categoria_id, precio_actual, stock, estado || 1]
        );

        return result.insertId;
    }

    static async obtenerTodos() {
       const productos = await executeQuery('SELECT * FROM productos');
       return productos;
    }
static async buscarPorNombre(query) {
        const searchQuery = `%${query}%`;
        return await executeQuery(` 
            SELECT p.*, 
                   ip.url as imagen_principal,
                   c.nombre as categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN imagenes_productos ip ON p.id = ip.producto_id AND ip.es_principal = 1
            WHERE p.nombre LIKE ? AND p.estado = 1
            ORDER BY p.nombre
        `, [searchQuery]);
    }

    static async obtenerActivos() {
        const productos = await executeQuery('SELECT * FROM productos WHERE estado = 1');
        return productos;
    }

    static async obtenerPorId(id) {
        const result = await executeQuery(`
            SELECT p.*, 
                   ip.url AS imagen_principal
            FROM productos p
            LEFT JOIN imagenes_productos ip 
              ON p.id = ip.producto_id 
             AND ip.es_principal = 1
            WHERE p.id = ?
            LIMIT 1
        `, [id]);
        return result.length > 0 ? result[0] : null;
    }

    static async obtenerPorCategoria(categoria_id) {
       const productos =  await executeQuery('SELECT * FROM productos WHERE categoria_id = ?', [categoria_id]);
       return productos;
    }

    static async actualizar(id, data) {
        const campos = Object.keys(data);
        const columnas = campos.map(campo => `${campo} = ?`).join(', ');
        const valores = Object.values(data);

        const result = await executeQuery(
            `UPDATE productos SET ${columnas} WHERE id = ?`,
            [...valores, id]
        );

        return result.affectedRows > 0;
    }

    static async eliminar(id) {
        const result = await executeQuery('DELETE FROM productos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    
    static async productosConImagenes() {
        return await executeQuery(`
            SELECT p.*, 
                   GROUP_CONCAT(pi.url) AS imagenes
            FROM productos p
            LEFT JOIN imagenes_productos pi ON p.id = pi.producto_id
            GROUP BY p.id
        `);
    }

    static async obtenerTodosConImagenes() {
    return await executeQuery(`
        SELECT p.*, 
               ip.url as imagen_principal,
               c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        LEFT JOIN imagenes_productos ip ON p.id = ip.producto_id AND ip.es_principal = 1
        ORDER BY p.nombre
    `);
}



static async obtenerDestacados(limite) {
    const lim = limite;

    return await executeQuery(`
        SELECT p.*, 
               ip.url as imagen_principal,
               ip.es_principal
        FROM productos p
        LEFT JOIN imagenes_productos ip ON p.id = ip.producto_id AND ip.es_principal = 1
        WHERE p.estado = 1 AND p.stock > 0
        ORDER BY p.stock DESC
        LIMIT ${lim}
    `);
}

static async obtenerProductosFiltrados(busqueda, categoriaId) {
    let query = `
        SELECT 
            p.id, 
            p.nombre, 
            p.precio_actual, 
            p.stock,
            p.estado, 
            c.nombre AS categoria_nombre,
            ip.url AS imagen_principal
        FROM 
            productos p
        JOIN 
            categorias c ON p.categoria_id = c.id
        LEFT JOIN 
            imagenes_productos ip ON p.id = ip.producto_id AND ip.es_principal = 1
        WHERE 
            1=1 
    `;
    
    const params = [];

    // 1. PRIMER PLACEHOLDER (?) -> BÚSQUEDA
    if (busqueda && busqueda.trim() !== '') {
        query += ` AND p.nombre LIKE ?`;
        params.push(`%${busqueda}%`); 
    }

    // 2. SEGUNDO PLACEHOLDER (?) -> CATEGORÍA
    if (categoriaId && categoriaId > 0) {
        query += ` AND p.categoria_id = ?`;
        params.push(categoriaId); 
    }
    
    query += ` ORDER BY p.nombre`;

    return await executeQuery(query, params);
}

}

module.exports = Productos;