const citaServicioService = require('../services/CitaServicioService');

class CitaServicioController {
    static async create(req, res) {
        try {
            const cita = await citaServicioService.createCita(req.body);
            res.status(201).json({
                success: true,
                message: 'Cita creada exitosamente.',
                data: cita
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear la cita.',
                error: error.message
            });
        }
    }

   static async getAll(req, res) {
        try {
            const citas = await citaServicioService.getAllCitas();
            res.status(200).json({
                success: true,
                data: citas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener las citas.',
                error: error.message
            });
        }
    }

   static async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const citaActualizada = await citaServicioService.updateCitaStatus(id, estado);
            res.status(200).json({
                success: true,
                message: 'Estado de la cita actualizado correctamente.',
                data: citaActualizada
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado de la cita.',
                error: error.message
            });
        }
    }
}

module.exports = CitaServicioController;
