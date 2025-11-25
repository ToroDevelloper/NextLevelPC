import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Servicios.css';
import AgendarServicioModal from '../components/AgendarServicioModal';

const API_BASE = '';

const Servicios = () => {
    const [servicios, setServicios] = useState([]);
    const [serviciosFiltrados, setServiciosFiltrados] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (id) => {
        navigate(`/servicios/${id}`);
    };

    const handleOpenModalDesdeCard = (e, servicio) => {
        e.stopPropagation(); // que no dispare la navegación al detalle
        setServicioSeleccionado(servicio);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setServicioSeleccionado(null);
    };

    const handleSubmitModal = async (formData) => {
        if (!servicioSeleccionado) return;
        try {
            const response = await fetch(`${API_BASE}/api/citas-servicios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    servicio_id: servicioSeleccionado.id,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                alert('¡Cita agendada con éxito! Nos pondremos en contacto contigo pronto.');
                setIsModalOpen(false);
                setServicioSeleccionado(null);
            } else {
                throw new Error(result.message || 'No se pudo agendar la cita.');
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert(`Error: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchTodosLosServicios();
    }, []);

    const fetchTodosLosServicios = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/servicios`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const json = await res.json();
            const serviciosData = json.success ? json.data : json;
            const serviciosArray = Array.isArray(serviciosData) ? serviciosData : [];
            setServicios(serviciosArray);
            setServiciosFiltrados(serviciosArray);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error cargando servicios');
        } finally {
            setLoading(false);
        }
    };

    const filtrarPorTipo = async (tipo) => {
        setFiltroActivo(tipo);
        setLoading(true);
        setError(null);

        try {
            let url = `${API_BASE}/api/servicios`;

            if (tipo !== 'todos') {
                url = `${API_BASE}/api/servicios/tipo/${tipo}`;
            }

            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const json = await res.json();
            const serviciosData = json.success ? json.data : json;
            setServiciosFiltrados(Array.isArray(serviciosData) ? serviciosData : []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error cargando servicios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="servicios-page">
            <h2 className="servicios-title">Nuestros Servicios Técnicos</h2>

            {/* Tarjetas de filtro - MANTENIENDO EL ESTILO ORIGINAL */}
            <div className="servicios-filtros">
                {/* Servicio Básico */}
                <div
                    className={`filtro-card ${filtroActivo === 'basico' ? 'active' : ''}`}
                    onClick={() => filtrarPorTipo('basico')}
                >
                    <img
                        src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=600&fit=crop"
                        alt="Servicio Básico"
                    />
                    <div className="filtro-overlay">
                        <h3>BÁSICO</h3>
                        <p>Mantenimiento y reparaciones estándar</p>
                    </div>
                </div>

                {/* Servicio Avanzado */}
                <div
                    className={`filtro-card ${filtroActivo === 'avanzado' ? 'active' : ''}`}
                    onClick={() => filtrarPorTipo('avanzado')}
                >
                    <img
                        src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=600&fit=crop"
                        alt="Servicio Avanzado"
                    />
                    <div className="filtro-overlay">
                        <h3>AVANZADO</h3>
                        <p>Reparaciones especializadas y upgrades</p>
                    </div>
                </div>
            </div>

            {/* Botón para mostrar todos */}
            {filtroActivo !== 'todos' && (
                <button
                    className="btn-mostrar-todos"
                    onClick={() => filtrarPorTipo('todos')}
                >
                    Mostrar Todos los Servicios
                </button>
            )}

            {/* Lista de servicios - MANTENIENDO EL ESTILO ORIGINAL */}
            <div className="servicios-content">
                <h3 className="servicios-subtitle">
                    {filtroActivo === 'todos' ? 'Todos los Servicios' :
                        filtroActivo === 'basico' ? 'Servicios Básicos' : 'Servicios Avanzados'}
                </h3>

                {loading && <p className="loading-message">Cargando servicios...</p>}
                {error && (
                    <div className="error-message">
                        No hay servicios para mostrar
                    </div>
                )}
                {!loading && !error && serviciosFiltrados.length === 0 && (
                    <div className="error-message">
                        No hay servicios disponibles en esta categoría.
                    </div>
                )}

                <div className="servicios-grid">
                    {serviciosFiltrados.map(servicio => (
                        <div key={servicio.id} className="servicio-card-link" onClick={() => handleCardClick(servicio.id)}>
                            <div className="servicio-card">
                                <img
                                    src={servicio.imagen_url || 'https://placehold.co/600x400/EEE/31343C?text=Servicio'}
                                    alt={servicio.nombre}
                                    className="servicio-card-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=Servicio'; }}
                                />
                                <div className="servicio-info">
                                    <h3>{servicio.nombre}</h3>
                                    {servicio.descripcion && (
                                        <p className="servicio-descripcion">
                                            {servicio.descripcion.substring(0, 100)}{servicio.descripcion.length > 100 && '...'}
                                        </p>
                                    )}
                                    <p className="servicio-precio">
                                        ${Number(servicio.precio).toFixed(2)}
                                    </p>
                                    <button
                                        type="button"
                                        className="servicio-contratar-btn"
                                        onClick={(e) => handleOpenModalDesdeCard(e, servicio)}
                                    >
                                        Contratar servicio
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && servicioSeleccionado && (
                <AgendarServicioModal
                    servicio={servicioSeleccionado}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitModal}
                />
            )}
        </div>
    );
};

export default Servicios;