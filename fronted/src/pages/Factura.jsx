import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Factura.css';

const Factura = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let intervalId;
        let intentos = 0;
        const MAX_INTENTOS = 10;

        const fetchOrden = async () => {
            try {
                setLoading(true);
                console.log('Fetching orden con ID:', id);

                const response = await fetch(`/api/ordenes/${id}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo cargar la orden`);
                }

                const result = await response.json();
                console.log('Orden recibida:', result);

                if (result.success && result.data) {
                    setOrden(result.data);
                    // Si el estado de pago sigue pendiente, seguir refrescando
                    if (result.data.estado_pago === 'pendiente' && intentos < MAX_INTENTOS) {
                        intentos++;
                    } else {
                        clearInterval(intervalId);
                    }
                } else {
                    throw new Error('Datos de orden inválidos');
                }
            } catch (err) {
                console.error('Error fetching orden:', err);
                setError(err.message);
                clearInterval(intervalId);
            } finally {
                setLoading(false);
            }
        };

        fetchOrden();
        intervalId = setInterval(fetchOrden, 3000);

        return () => clearInterval(intervalId);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="factura-container">
                <div className="loading">Cargando factura...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="factura-container">
                <div className="error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
            </div>
        );
    }

    if (!orden) {
        return (
            <div className="factura-container">
                <div className="error">
                    <h2>Orden no encontrada</h2>
                    <button onClick={() => navigate('/')}>Volver al inicio</button>
                </div>
            </div>
        );
    }

    return (
        <div className="factura-container">
            <div className="factura-actions no-print">
                <button className="btn-print" onClick={handlePrint}>
                    🖨️ Imprimir Factura
                </button>
                <button className="btn-back" onClick={() => navigate('/')}>
                    ← Volver
                </button>
            </div>

            <div className="factura">
                {/* Header */}
                <div className="factura-header">
                    <div className="company-info">
                        <h1>NextLevelPC</h1>
                        <p>Servicios y Productos de Tecnología</p>
                        <p>NIT: 123456789-0</p>
                        <p>Bogotá, Colombia</p>
                        <p>Email: info@nextlevelpc.com</p>
                        <p>Tel: +57 (1) 234-5678</p>
                    </div>
                    <div className="invoice-details">
                        <h2>FACTURA</h2>
                        <p><strong>No. Orden:</strong> {orden.numero_orden}</p>
                        <p><strong>Fecha:</strong> {formatDate(orden.fecha_creacion)}</p>
                        <p>
                            <strong>Estado:</strong>{' '}
                            <span className={`status status-${orden.estado_pago}`}>
                                {orden.estado_pago === 'pagado' ? 'PAGADO' : orden.estado_pago?.toUpperCase()}
                            </span>
                        </p>
                    </div>
                </div>

                <hr className="divider" />

                {/* Cliente Info */}
                <div className="cliente-info">
                    <h3>Facturado a:</h3>
                    <p><strong>Cliente ID:</strong> {orden.cliente_id}</p>
                    <p><strong>Tipo:</strong> {orden.tipo}</p>
                </div>

                <hr className="divider" />

                {/* Items Table */}
                <div className="items-section">
                    <h3>Detalles de la Compra</h3>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Tipo</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orden.items && orden.items.length > 0 ? (
                                orden.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.descripcion}</td>
                                        <td>
                                            <span className={`badge badge-${item.tipo}`}>
                                                {item.tipo}
                                            </span>
                                        </td>
                                        <td className="text-center">{item.cantidad}</td>
                                        <td className="text-right">{formatCurrency(item.precio_unitario)}</td>
                                        <td className="text-right">{formatCurrency(item.subtotal)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">No hay items en esta orden</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <hr className="divider" />

                {/* Total */}
                <div className="total-section">
                    <div className="total-row">
                        <span className="total-label">TOTAL:</span>
                        <span className="total-amount">{formatCurrency(orden.total)}</span>
                    </div>
                    <div className="payment-info">
                        <p><strong>Método de Pago:</strong> Stripe (Tarjeta de Crédito/Débito)</p>
                        <p><strong>Estado de Pago:</strong> {orden.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}</p>
                        {orden.stripe_payment_intent_id && (
                            <p><strong>ID Transacción:</strong> {orden.stripe_payment_intent_id}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="factura-footer">
                    <p>Gracias por su compra en NextLevelPC</p>
                    <p className="small-text">Esta es una factura generada electrónicamente</p>
                </div>
            </div>

            {/* En el render, muestra mensaje si está pendiente */}
            {orden && orden.estado_pago === 'pendiente' && (
                <div className="alert alert-info">
                    Verificando pago... Si el estado no cambia a pagado en unos segundos, actualiza la página.
                </div>
            )}
        </div>
    );
};

export default Factura;
