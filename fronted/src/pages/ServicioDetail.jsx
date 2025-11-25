import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ServicioDetail.css';
import AgendarServicioModal from '../components/AgendarServicioModal'; // Importar el modal
import { useAuth } from '../utils/AuthContext';
import { useCart } from '../utils/CartContext';

const API_BASE = 'http://localhost:8080';

const ServicioDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('descripcion');
    const [relatedServices, setRelatedServices] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [galleryImages, setGalleryImages] = useState([]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitModal = (formData) => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para agendar una cita de servicio.');
            return { success: false };
        }

        try {
            // Construir objeto del servicio con datos de la cita
            const servicioConCita = {
                id: servicio.id,
                nombre: servicio.nombre,
                precio: servicio.precio,
                imagen: servicio.imagen_url || (galleryImages.length > 0 ? galleryImages[0] : null),
                type: 'servicio',
                cantidad: 1,
                // Metadata de la cita para procesar después del pago
                citaData: {
                    nombre_cliente: formData.nombre,
                    email_cliente: formData.email,
                    telefono_cliente: formData.telefono,
                    direccion_cliente: formData.direccion,
                    fecha_cita: formData.fecha_cita,
                    descripcion_problema: formData.descripcion_problema
                }
            };

            // Agregar al carrito
            addToCart(servicioConCita);

            // Cerrar modal y redirigir al checkout
            setIsModalOpen(false);
            navigate('/checkout');

            return { success: true };
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            alert(`Error: ${error.message}`);
            return { success: false };
        }
    };

    useEffect(() => {
        const fetchServicio = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/api/servicios/${id}`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const json = await res.json();
                if (json.success) {
                    setServicio(json.data);

                    // Process gallery images from servicio_imagenes table
                    if (json.data.galeria_imagenes && Array.isArray(json.data.galeria_imagenes)) {
                        const urls = json.data.galeria_imagenes.map(img => `${API_BASE}/uploads/${img.url}`);
                        setGalleryImages(urls.length > 0 ? urls : ['https://placehold.co/600x400/EEE/31343C?text=Servicio']);
                    } else if (json.data.imagen_url) {
                        // Fallback to imagen_url if no gallery images
                        setGalleryImages([`${API_BASE}${json.data.imagen_url}`]);
                    } else {
                        setGalleryImages(['https://placehold.co/600x400/EEE/31343C?text=Servicio']);
                    }
                } else {
                    throw new Error(json.message || 'Error al cargar el servicio');
                }
            } catch (err) {
                console.error(err);
                setError(err.message || 'Error cargando el servicio');
            } finally {
                setLoading(false);
            }
        };

        fetchServicio();
    }, [id]);

    // Fetch related services
    useEffect(() => {
        const fetchRelatedServices = async () => {
            if (!servicio?.tipo) return;

            try {
                const res = await fetch(`${API_BASE}/api/servicios/tipo/${encodeURIComponent(servicio.tipo)}`);
                if (!res.ok) return;

                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    // Filter out current service and limit to 3
                    const filtered = json.data
                        .filter(s => s.id !== servicio.id)
                        .slice(0, 3);
                    setRelatedServices(filtered);
                }
            } catch (err) {
                console.error('Error fetching related services:', err);
            }
        };

        fetchRelatedServices();
    }, [servicio]);

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!servicio) {
        return <div className="not-found">Servicio no encontrado.</div>;
    }

    // Descripción y especificaciones similares a detalle de producto
    const descripcion = servicio.descripcion_detallada || servicio.descripcion || 'Sin descripción disponible.';

    let specs = [];
    if (servicio.especificaciones) {
        try {
            const parsed = JSON.parse(servicio.especificaciones);
            if (Array.isArray(parsed)) {
                specs = parsed;
            }
        } catch (e) {
            console.warn('No se pudo parsear `especificaciones` de servicio como JSON, se usará layout por defecto.', e);
        }
    }

    if (specs.length === 0) {
        specs = [
            { label: 'Tipo', value: servicio.tipo || 'No especificado' },
            { label: 'Duración', value: servicio.duracion || 'Según requerimiento' },
            { label: 'Estado', value: servicio.activo === 0 ? 'No disponible' : 'Disponible' },
        ];
    }

    return (
        <div className="servicio-detail-page">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <ol className="breadcrumb-list">
                    <li className="breadcrumb-item">
                        <a href="/">Inicio</a>
                    </li>
                    <li className="breadcrumb-separator">/</li>
                    <li className="breadcrumb-item">
                        <a href="/servicios">Servicios</a>
                    </li>
                    <li className="breadcrumb-separator">/</li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {servicio.nombre}
                    </li>
                </ol>
            </nav>

            <div className="servicio-detail-main">
                {/* Image Gallery */}
                <div className="servicio-detail-gallery">
                    <div className="gallery-main-image">
                        <img
                            src={galleryImages[selectedImage]}
                            alt={`${servicio.nombre} - Imagen ${selectedImage + 1}`}
                            className="servicio-detail-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=Servicio';
                            }}
                        />
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="gallery-thumbnails">
                            {galleryImages.map((img, index) => (
                                <button
                                    key={index}
                                    className={`gallery-thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                    type="button"
                                >
                                    <img
                                        src={img}
                                        alt={`${servicio.nombre} - Miniatura ${index + 1}`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/100x100/EEE/31343C?text=Img';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="servicio-detail-info servicio-detail-content">
                    <section className="servicio-detail-top">
                        <div>
                            <h1 className="servicio-detail-name">{servicio.nombre}</h1>
                            {servicio.tipo && <p className="servicio-tipo">{servicio.tipo}</p>}
                        </div>
                        <div className="servicio-detail-summary">
                            <div className="servicio-detail-price-box">
                                <span className="servicio-detail-price">
                                    ${Number(servicio.precio || 0).toFixed(2)}
                                </span>
                            </div>
                            <span className="servicio-detail-stock">
                                Estado: {servicio.activo === 0 ? 'No disponible' : 'Disponible'}
                            </span>
                            <div className="servicio-detail-extra-info">
                                <p><strong>Modalidad:</strong> {servicio.modalidad || 'Presencial / Remoto'}</p>
                                <p><strong>Garantía:</strong> {servicio.garantia || 'Garantía estándar'}</p>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="trust-badges">
                            <div className="trust-badge">
                                <svg className="trust-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Servicio Verificado</span>
                            </div>
                            <div className="trust-badge">
                                <svg className="trust-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Respuesta en 24h</span>
                            </div>
                            <div className="trust-badge">
                                <svg className="trust-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" />
                                </svg>
                                <span>Servicio Garantizado</span>
                            </div>
                        </div>
                    </section>

                    {/* Tabs: Descripción, Especificaciones, Opiniones */}
                    <div className="servicio-detail-tabs">
                        <div className="tab-buttons">
                            <button
                                className={`tab-button ${activeTab === 'descripcion' ? 'active' : ''}`}
                                onClick={() => setActiveTab('descripcion')}
                                type="button"
                            >
                                Descripción
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'especificaciones' ? 'active' : ''}`}
                                onClick={() => setActiveTab('especificaciones')}
                                type="button"
                            >
                                Especificaciones
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'opiniones' ? 'active' : ''}`}
                                onClick={() => setActiveTab('opiniones')}
                                type="button"
                            >
                                Opiniones
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'descripcion' && (
                                <div className="tab-descripcion">
                                    <h2>Descripción del Servicio</h2>
                                    <p>{descripcion}</p>
                                </div>
                            )}

                            {activeTab === 'especificaciones' && (
                                <div className="tab-especificaciones">
                                    <h2>Especificaciones</h2>
                                    <div className="especificaciones-list">
                                        {specs.map((spec, index) => (
                                            <div key={index} className="especificacion-item">
                                                <strong>{spec.label}:</strong> {spec.value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'opiniones' && (
                                <div className="tab-opiniones">
                                    <h2>Opiniones de Clientes</h2>
                                    {/* Aquí iría el componente o lógica para mostrar opiniones */}
                                    <p>Aún no hay opiniones para este servicio.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="servicio-detail-actions">
                        <button className="btn-agendar" onClick={handleOpenModal}>
                            Agendar Cita de Servicio
                        </button>
                    </div>
                </div>
            </div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
                <div className="related-services-section">
                    <h2>Servicios Relacionados</h2>
                    <div className="related-services-grid">
                        {relatedServices.map((rel) => (
                            <div
                                key={rel.id}
                                className="related-service-card"
                                onClick={() => navigate(`/servicios/${rel.id}`)}
                            >
                                <div className="related-service-image">
                                    <img
                                        src={rel.imagen_url ? `${API_BASE}${rel.imagen_url}` : 'https://placehold.co/600x400/EEE/31343C?text=Servicio'}
                                        alt={rel.nombre}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=Servicio';
                                        }}
                                    />
                                </div>
                                <div className="related-service-info">
                                    <h3>{rel.nombre}</h3>
                                    <p className="price">${Number(rel.precio).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AgendarServicioModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitModal}
                servicio={servicio}
            />
        </div>
    );
};

export default ServicioDetail;
