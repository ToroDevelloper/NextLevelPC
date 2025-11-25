import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Productos.css';
import { useCart } from '../utils/CartContext';

const API_BASE = '';

const Home = () => {
   
    const [productosDestacados, setProductosDestacados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const trackRef = useRef(null);
    const containerRef = useRef(null);
    const [slideWidth, setSlideWidth] = useState(0);
    const [visibleItems, setVisibleItems] = useState(3);
    const totalItems = productosDestacados.length;
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        const calculateMetrics = () => {
            if (trackRef.current && trackRef.current.children.length > 0) {
                const track = trackRef.current;
                const firstItem = track.children[0];
                const trackStyle = window.getComputedStyle(track);

                const itemWidth = firstItem.offsetWidth;
                const itemGap = parseFloat(trackStyle.gap) || 0;

                setSlideWidth(itemWidth + itemGap);

                if (containerRef.current) {
                    const containerWidth = containerRef.current.offsetWidth;
                    const newVisibleItems = Math.floor(containerWidth / (itemWidth + itemGap));
                    setVisibleItems(Math.max(1, newVisibleItems));
                }
            }
        };

        calculateMetrics();
        window.addEventListener('resize', calculateMetrics);

        return () => window.removeEventListener('resize', calculateMetrics);
    }, [productosDestacados, loading]);

    useEffect(() => {
        if (trackRef.current && slideWidth > 0) {
            const offset = -currentIndex * slideWidth;
            trackRef.current.style.transform = `translateX(${offset}px)`;
        }
    }, [currentIndex, slideWidth]);

    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => {
            if (prev >= totalItems - visibleItems) {
                return 0;
            }
            return prev + 1;
        });
    }, [totalItems, visibleItems]);

    const prevSlide = useCallback(() => {
        setCurrentIndex(prev => {
            if (prev <= 0) {
                return Math.max(0, totalItems - visibleItems);
            }
            return prev - 1;
        });
    }, [totalItems, visibleItems]);

    const goToSlide = (index) => {
        setCurrentIndex(Math.max(0, Math.min(index, totalItems - visibleItems)));
    };

    useEffect(() => {
        if (!isAutoPlaying || totalItems <= visibleItems) return;

        const autoPlay = setInterval(nextSlide, 4000);

        return () => clearInterval(autoPlay);
    }, [nextSlide, totalItems, visibleItems, isAutoPlaying]);

    const handleInteraction = () => {
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    // --- Cargar productos ---
    useEffect(() => {
        const fetchProductosDestacados = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/api/productos/destacados?limite=6`);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setProductosDestacados(data.data);
                } else {
                    setError('No se pudieron cargar los productos');
                }
            } catch (err) {
                console.error('Error cargando productos destacados:', err);
                setError('Error al cargar productos destacados');
            } finally {
                setLoading(false);
            }
        };

        fetchProductosDestacados();
    }, []);

    const formatPrice = (price) => {
        const number = Number(price);
        if (isNaN(number)) {
            return 'N/A';
        }
        return new Intl.NumberFormat('es-ES').format(number);
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart({
            id: product.id,
            nombre: product.nombre,
            price: Number(product.precio_actual),
            stock: product.stock,
            image: product.imagen_principal,
            type: 'producto',
            quantity: 1,
        });
    };

    return (
        <div className="home-page">
            {/* Banner "Lo mas vendido" */}
            <div className="featured-title-banner">
                <h2>Lo mas vendido:</h2>
            </div>

            {/* Estados de Carga y Error */}
            {loading && (
                <div className="loading-message">
                    Cargando productos destacados...
                </div>
            )}
            {error && (
                <div className="error-message">
                    No hay productos para mostrar
                </div>
            )}
            {!loading && !error && productosDestacados.length === 0 && (
                <div className="error-message">
                    No hay productos destacados disponibles
                </div>
            )}

            {/* Carrusel de Productos */}
            {!loading && !error && productosDestacados.length > 0 && (
                <div
                    className="scroll-wrapper"
                    ref={containerRef}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <div
                        className="home-products-scroll-container"
                        ref={trackRef}
                    >
                        {productosDestacados.map(product => (
                            <div
                                key={product.id}
                                className="home-product-card"
                                onClick={() => navigate(`/productos/${product.id}`)}
                                style={{ cursor: 'pointer' }}
                            >

                                <div className="product-image-container">
                                    <img
                                        src={product.imagen_principal || 'https://placehold.co/600x400/EEE/31343C?text=Producto'}
                                        alt={product.nombre || 'Producto'}
                                        className="home-product-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=Producto';
                                        }}
                                    />
                                </div>

                                <div className="home-product-content">
                                    <h3>{product.nombre}</h3>
                                    <p className="product-stock">
                                        Stock: {product.stock} unidades
                                    </p>
                                    <p className="product-price">
                                        ${formatPrice(product.precio_actual)}
                                    </p>
                                    <button
                                        className="producto-add-btn"
                                        type="button"
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.1 6M7 13l-2 7h13" />
                                        </svg>
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botones del Carrusel */}
                    {totalItems > visibleItems && (
                        <>
                            <button
                                className="carousel-btn prev"
                                onClick={() => {
                                    prevSlide();
                                    handleInteraction();
                                }}
                                aria-label="Producto anterior"
                                disabled={currentIndex === 0}
                            >
                                &#10094;
                            </button>
                            <button
                                className="carousel-btn next"
                                onClick={() => {
                                    nextSlide();
                                    handleInteraction();
                                }}
                                aria-label="Producto siguiente"
                                disabled={currentIndex >= totalItems - visibleItems}
                            >
                                &#10095;
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Indicadores del Carrusel */}
            {!loading && !error && totalItems > visibleItems && (
                <div className="carousel-indicators">
                    {Array.from({ length: Math.ceil(totalItems / visibleItems) }).map((_, index) => (
                        <button
                            key={index}
                            className={`carousel-indicator ${Math.floor(currentIndex / visibleItems) === index ? 'active' : ''}`}
                            onClick={() => {
                                goToSlide(index * visibleItems);
                                handleInteraction();
                            }}
                            aria-label={`Ir a slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Botón "Ver Todos los Productos" */}
            {!loading && !error && productosDestacados.length > 0 && (
                <div className="view-all-container">
                    <Link
                        to="/productos"
                        className="btn-view-all"
                    >
                        Ver Todos los Productos →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Home;