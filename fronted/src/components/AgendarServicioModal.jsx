import React, { useState, useEffect } from 'react';
import '../styles/AgendarServicioModal.css';
import { useAuth } from '../utils/AuthContext';

const AgendarServicioModal = ({ servicio, onClose, onSubmit, isOpen }) => {
    const { user, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        fecha_cita: '',
        descripcion_problema: ''
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                nombre: user.nombre || user.name || '',
                email: user.email || user.correo || '',
                telefono: user.telefono || '',
                direccion: user.direccion || ''
            }));
        }
    }, [isAuthenticated, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    // Calcular fecha mínima (mañana)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <h2>Agendar: {servicio?.nombre}</h2>
                </div>

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre Completo</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Tu nombre completo"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="tucorreo@ejemplo.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                                placeholder="Tu número de contacto"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="fecha_cita">Fecha Preferida</label>
                            <input
                                type="date"
                                id="fecha_cita"
                                name="fecha_cita"
                                value={formData.fecha_cita}
                                onChange={handleChange}
                                required
                                min={getMinDate()}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="direccion">Dirección del Servicio</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                            placeholder="Dirección donde se realizará el servicio"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion_problema">Descripción del Problema</label>
                        <textarea
                            id="descripcion_problema"
                            name="descripcion_problema"
                            value={formData.descripcion_problema}
                            onChange={handleChange}
                            required
                            placeholder="Describe brevemente el problema o servicio que necesitas..."
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Agendar y Pagar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AgendarServicioModal;
