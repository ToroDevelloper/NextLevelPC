import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useStripeContext } from "../utils/StripeContext";
import { useCart } from "../utils/CartContext";
import "../styles/Checkout.css";

const Checkout = ({ cart, onSuccess, onError }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { createPaymentIntent } = useStripeContext();
  const { clearCart } = useCart();

  // Estados
  const [clientSecret, setClientSecret] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Normalizar productos del carrito
  const productos = Array.isArray(cart)
    ? cart
    : Array.isArray(cart?.items)
      ? cart.items
      : [];

  const normalizedProductos = productos.map((it) => ({
    id: it.id,
    nombre: it.nombre ?? it.name ?? "Sin nombre",
    precio: Number(it.precio ?? it.price ?? 0) || 0,
    cantidad: Number(it.cantidad ?? it.quantity ?? 1) || 1,
    imagen: it.imagen_url ?? it.image ?? it.imageUrl ?? null,
    type: it.type ?? "producto",
    citaData: it.citaData || null, // Preservar citaData
  }));

  // Calcular total
  useEffect(() => {
    const t = normalizedProductos.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );
    setTotal(t);

    // Validar monto mínimo
    if (t > 0 && t < 20) { // 20,000 COP = $20.00
      setError(`El monto mínimo de compra es $20,000 COP. Tu total actual es ${formatCurrency(t)}.`);
    } else {
      setError(null);
    }
  }, [cart]);

  // Crear PaymentIntent cuando hay total
  useEffect(() => {
    if (total > 0 && !clientSecret && !paymentSuccess) {
      crearIntent();
    }
  }, [total]);

  const crearIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validar monto mínimo antes de proceder
      if (total < 20) { // 20,000 COP
        throw new Error(`El monto mínimo de compra es $20,000 COP. Tu total actual es ${formatCurrency(total)}.`);
      }

      const metadata = {
        productos: JSON.stringify(
          normalizedProductos.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            cantidad: p.cantidad,
            precio: p.precio,
            type: p.type,
          }))
        ),
      };

      // Buscar si hay datos de cita en algún producto
      const itemConCita = normalizedProductos.find(p => p.citaData);
      if (itemConCita) {
        // Incluir servicio_id en citaData para asegurar que el backend lo reciba
        const citaDataCompleta = {
          ...itemConCita.citaData,
          servicio_id: itemConCita.id
        };
        metadata.citaData = JSON.stringify(citaDataCompleta);
      }

      console.log("Creando PaymentIntent...");
      const response = await createPaymentIntent(total, metadata);

      if (!response) {
        throw new Error("No se recibió respuesta del servidor.");
      }

      console.log("PaymentIntent creado:", response);

      // Extraer clientSecret del response (response es {clientSecret, ordenId, numeroOrden})
      const secret = response.clientSecret || response;
      setClientSecret(secret);

      console.log("ClientSecret:", secret);
      console.log("OrdenId recibido:", response.ordenId);

      // Si el servidor devuelve info de la orden, guardarla
      if (response.ordenId || response.numeroOrden) {
        setOrdenCreada({
          id: response.ordenId,
          numero: response.numeroOrden,
        });
        console.log("Orden guardada:", { id: response.ordenId, numero: response.numeroOrden });
      }
    } catch (err) {
      console.error("Error creando intent:", err);
      setError(err.message || "Error creando la sesión de pago.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!stripe) {
      setError("Stripe no está listo todavía.");
      return;
    }
    if (!elements) {
      setError("Error al cargar el formulario de pago.");
      return;
    }
    if (!clientSecret) {
      setError("Esperando sesión de pago. Intenta de nuevo en unos segundos.");
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("No se encontró el elemento de tarjeta.");

      console.log("Confirmando pago...");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        console.error("Error de Stripe:", result.error);
        throw new Error(result.error.message);
      }

      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        console.log("Pago exitoso:", result.paymentIntent);

        setPaymentSuccess(true);
        clearCart(); // Vaciar el carrito

        // Extraer información del pago
        const numeroOrden = result.paymentIntent.metadata?.numero_orden || ordenCreada?.numero;
        const ordenId = result.paymentIntent.metadata?.orden_id || ordenCreada?.id;

        // Callback de éxito si existe
        if (onSuccess) {
          onSuccess({
            paymentIntentId: result.paymentIntent.id,
            numeroOrden,
            ordenId,
            amount: result.paymentIntent.amount / 100,
          });
        }

        // Redirigir directamente a la factura sin alert
        console.log('Pago completado. Redirigiendo a factura...');
        console.log('ordenId:', ordenId, 'ordenCreada:', ordenCreada);

        if (ordenId) {
          navigate(`/factura/${ordenId}`);
        } else {
          console.error('No hay ordenId. No se puede redirigir.');
        }

      } else {
        console.log("Estado del pago:", result.paymentIntent?.status);
        setError(`Pago procesado con estado: ${result.paymentIntent?.status || "desconocido"}`);
      }
    } catch (err) {
      console.error("Error confirmando pago:", err);
      setError(err.message || "Error al procesar el pago.");

      // Callback de error si existe
      if (onError) {
        onError(err);
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Opciones de estilo para CardElement
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Finalizar Compra</h2>

      {/* Mensaje de orden creada */}
      {ordenCreada && (
        <div className="orden-info">
          <p>Orden creada: <strong>{ordenCreada.numero}</strong></p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="checkout-error">
          <p>{error}</p>
        </div>
      )}

      {/* Mensaje de éxito */}
      {paymentSuccess && (
        <div className="checkout-success">
          <p>¡Pago completado exitosamente!</p>
          {ordenCreada?.numero && (
            <p>Orden: <strong>{ordenCreada.numero}</strong></p>
          )}
        </div>
      )}

      <div className="checkout-box">
        {/* RESUMEN DEL PEDIDO */}
        <div className="checkout-summary">
          <h3>Resumen del Pedido</h3>

          {normalizedProductos.length === 0 && (
            <div className="empty-cart">
              <p>Tu carrito está vacío.</p>
            </div>
          )}

          {normalizedProductos.map((item, index) => (
            <div key={`${item.type}-${item.id}-${index}`} className="summary-item">
              <div className="item-info">
                {item.imagen && (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="item-image"
                  />
                )}
                <div className="item-details">
                  <span className="item-name">{item.nombre}</span>
                  <span className="item-quantity">Cantidad: {item.cantidad}</span>
                  <span className="item-type-badge">{item.type}</span>
                </div>
              </div>
              <div className="item-price">
                <span className="item-unit-price">
                  {formatCurrency(item.precio)} c/u
                </span>
                <span className="item-subtotal">
                  {formatCurrency(item.precio * item.cantidad)}
                </span>
              </div>
            </div>
          ))}

          {normalizedProductos.length > 0 && (
            <>
              <hr className="summary-divider" />
              <div className="total-box">
                <strong>Total a Pagar:</strong>
                <strong className="total-amount">{formatCurrency(total)}</strong>
              </div>
            </>
          )}
        </div>

        {/* FORMULARIO DE PAGO */}
        {normalizedProductos.length > 0 && !paymentSuccess && (
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3>Datos de Pago</h3>

            <div className="form-group">
              <label htmlFor="card-element">
                Información de la Tarjeta
              </label>
              <div className="card-element-box">
                <CardElement
                  id="card-element"
                  options={cardElementOptions}
                />
              </div>
              <small className="form-help">
                Ingresa los datos de tu tarjeta de crédito o débito
              </small>
            </div>

            {/* Información de seguridad */}
            <div className="payment-security">
              <p>Pago seguro procesado por Stripe</p>
            </div>

            <button
              type="submit"
              className="checkout-btn"
              disabled={!stripe || loading || processingPayment || total < 20}
            >
              {loading ? (
                "Preparando..."
              ) : processingPayment ? (
                <span>
                  <span className="spinner"></span> Procesando Pago...
                </span>
              ) : (
                `Pagar ${formatCurrency(total)}`
              )}
            </button>

            {total < 20 && (
              <div className="minimum-amount-warning">
                <p>Monto mínimo requerido: $20,000 COP</p>
              </div>
            )}
          </form>
        )}

        {/* Vista de éxito */}
        {paymentSuccess && (
          <div className="payment-success-view">
            <div className="success-icon">✓</div>
            <h3>¡Pago Completado!</h3>
            <p>Tu pedido ha sido procesado exitosamente.</p>
            {ordenCreada?.numero && (
              <p className="order-number">
                Número de orden: <strong>{ordenCreada.numero}</strong>
              </p>
            )}
            <button
              className="btn-continue"
              onClick={() => window.location.href = '/mis-ordenes'}
            >
              Ver Mis Órdenes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;