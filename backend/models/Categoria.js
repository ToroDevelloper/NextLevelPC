const { db, executeQuery } = require('../config/db');

class Categoria {
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM categorias ORDER BY nombre');
            return rows.map(row => ({
                id: row.id,
                nombre: row.nombre,
                tipo: row.tipo
            }));
        } catch (error) {
            console.error('Error en Categoria.findAll:', error.message);
            throw new Error('Error al obtener categorías de la base de datos');
        }
    }

    static async findAllProductos() {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM categorias WHERE tipo = 'producto' ORDER BY nombre"
        );
        return rows;
    } catch (error) {
        console.error('Error en Categoria.findAllProductos:', error.message);
        throw new Error('Error al obtener categorías de productos');
    }
}


    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM categorias WHERE id = ?', [id]);
            if (rows.length === 0) return null;

            const row = rows[0];
            return {
                id: row.id,
                nombre: row.nombre,
                tipo: row.tipo
            };
        } catch (error) {
            console.error('Error en Categoria.findById:', error.message);
            throw new Error('Error al obtener la categoría');
        }
    }

    static async create(dto) {
        try {
            const {nombre,tipo} = dto;
            const [result] = await db.execute(
                'INSERT INTO categorias (nombre, tipo) VALUES (?, ?)',
                [nombre, tipo || 'Producto']
            );
            return this.findById(result.insertId);
        } catch (error) {
            console.error('Error en Categoria.create:', error.message);

            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con este nombre');
            }

            throw new Error('Error al crear la categoría');
        }
    }

    static async update(id, categoriaData) {
        try {
            const campos = Object.keys(categoriaData);
            const columnas = campos.map(campo => `${campo} = ?`).join(', ');
            const valores = Object.values(categoriaData)

            await db.execute(
                `UPDATE categorias SET ${columnas} WHERE id = ?`,
                [...valores, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error en Categoria.update:', error.message);

            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con este nombre');
            }

            throw new Error('Error al actualizar la categoría: ' + error.message);
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.execute(
                'DELETE FROM categorias WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en Categoria.delete:', error.message);
            throw new Error('Error al eliminar la categoría');
        }
    }

    static async exists(nombre, excludeId = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM categorias WHERE nombre = ?';
            const params = [nombre];

            if (excludeId) {
                query += ' AND id != ?';
                params.push(excludeId);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error en Categoria.exists:', error.message);
            return false;
        }
    }

    static async getForName(){
        try {
            let query = 'SELECT id, nombre FROM categorias ORDER BY nombre'
            const result = executeQuery(query);
            return result;
        } catch (error) {
            console.error('Error al obtener categorias: ',{message: error.message})
        }
    }
}

module.exports = Categoria;