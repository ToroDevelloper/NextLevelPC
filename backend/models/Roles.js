const { executeQuery } = require('../config/db.js');

class Roles {
    static async crear(data) {
        const { nombre } = data;

        const result = await executeQuery(
            'INSERT INTO roles (nombre) VALUES (?)',
            [nombre]
        );

        return result.insertId;
    }

    static async obtenerTodos() {
        return await executeQuery('SELECT * FROM roles ORDER BY id');
    }

    static async obtenerPorId(id) {
        const result = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
        return result.length > 0 ? result[0] : null;
    }

    static async obtenerPorNombre(nombre) {
        const result = await executeQuery('SELECT * FROM roles WHERE nombre = ?', [nombre]);
        return result.length > 0 ? result[0] : null;
    }

    static async actualizar(id, data) {
        const campos = Object.keys(data);
        const columnas = campos.map(campo => `${campo} = ?`).join(', ');
        const valores = Object.values(data);

        const result = await executeQuery(
            `UPDATE roles SET ${columnas} WHERE id = ?`,
            [...valores, id]
        );

        return result.affectedRows > 0;
    }

    static async eliminar(id) {
        // Verificar si el rol está siendo usado antes de eliminar
        const usuariosConRol = await executeQuery('SELECT COUNT(*) as count FROM usuarios WHERE rol_id = ?', [id]);

        if (usuariosConRol[0].count > 0) {
            throw new Error('No se puede eliminar el rol porque está siendo usado por uno o más usuarios');
        }

        const result = await executeQuery('DELETE FROM roles WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async verificarUso(id) {
        const result = await executeQuery('SELECT COUNT(*) as count FROM usuarios WHERE rol_id = ?', [id]);
        return result[0].count > 0;
    }

    static async obtenerRolesConConteoUsuarios() {
        return await executeQuery(`
            SELECT r.*, COUNT(u.id) as total_usuarios 
            FROM roles r 
            LEFT JOIN usuarios u ON r.id = u.rol_id 
            GROUP BY r.id 
            ORDER BY r.id
        `);
    }
}

module.exports = Roles;