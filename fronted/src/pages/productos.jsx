import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../utils/CartContext';
import "../styles/Productos.css";

// --- Constantes ---
const API_BASE = '';
const DEFAULT_IMAGE = 'https://placehold.co/600x400/EEE/31343C?text=Producto';
const PRODUCT_DEFAULTS = {
  description: 'Producto disponible en NextLevelPC.',
  category: 'No especificada'
};
// Constantes de paginación
const PRODUCTOS_POR_PAGINA = 15;

// --- Funciones de Normalización (Helpers) ---

/**
 * Parsea un campo de texto de imágenes separadas por comas.
 */
const parseImagenesField = (field) => {
  if (!field) return [];
  return String(field)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map((url, idx) => ({ url, es_principal: idx === 0 }));
};

/**
 * Obtiene la imagen principal de un producto.
 */
const getProductImage = (raw) => {
  if (raw.imagen_principal) {
    return raw.imagen_principal;
  }
  const imagenes = getProductImages(raw); // Reutiliza la lógica
  if (Array.isArray(imagenes) && imagenes.length > 0) {
    const primera = imagenes[0];
    return typeof primera === 'string' ? primera : (primera.url || DEFAULT_IMAGE);
  }
  return DEFAULT_IMAGE;
};

/**
 * Obtiene y normaliza el array de imágenes.
 */
const getProductImages = (raw) => {
  if (Array.isArray(raw.imagenes)) {
    return raw.imagenes;
  }
  if (typeof raw.imagenes === 'string') {
    return parseImagenesField(raw.imagenes);
  }
  if (raw.imagenes === null && (raw.url_imagen || raw.url)) {
    const url = raw.url_imagen || raw.url;
    return [{ url, es_principal: raw.es_principal === 1 }];
  }
  return []; // Devuelve array vacío si no hay nada
};

/**
 * Obtiene la descripción del producto.
 */
const getProductDescription = (raw) => {
  return raw.descripcion_detallada || raw.descripcion || raw.descripcion_corta || PRODUCT_DEFAULTS.description;
};

/**
 * Función de normalización robusta.
 * Transforma un objeto `raw` de la API a un objeto de producto consistente.
 */
const normalizeProduct = (raw) => {
  const baseProduct = {
    id: raw.id ?? raw.producto_id ?? raw.productoId,
    nombre: raw.nombre ?? raw.title ?? raw.name ?? '',
    price: Number(raw.precio_actual ?? raw.precio ?? raw.price ?? 0),
    stock: raw.stock ?? 0,
    activo: raw.activo ?? 1,
    raw // Guarda el objeto original por si acaso
  };

  return {
    ...baseProduct,
    image: getProductImage(raw),
    imagenes: getProductImages(raw),
    description: getProductDescription(raw),
    // Asegura que las especificaciones sean un array
    specs: parseSpecs(raw.especificaciones, raw, baseProduct.stock)
  };
};

/**
 * Parsea las especificaciones (JSON o campos sueltos).
 */
const parseSpecs = (specsJSON, raw, stock) => {
  let specs = [];
  if (specsJSON) {
    try {
      const parsed = JSON.parse(specsJSON);
      if (Array.isArray(parsed)) {
        specs = parsed;
      }
    } catch (e) {
      console.warn('No se pudo parsear `especificaciones` como JSON.', e);
    }
  }

  // Si no hay specs parseadas, usa las de por defecto
  if (specs.length === 0) {
    specs = [
      { label: 'Categoría', value: raw.categoria_nombre || raw.categoria || PRODUCT_DEFAULTS.category },
      { label: 'Stock', value: `${stock} unidades` },
      { label: 'Estado', value: raw.activo === 0 ? 'No disponible' : 'Disponible' }
    ];
  }
  return specs;
};

// --- Componentes de UI ---
const ProductImage = React.memo(({ product, className = "producto-card-image" }) => (
  <img
    src={product.image || DEFAULT_IMAGE}
    alt={product.nombre || 'Producto'}
    className={className}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = DEFAULT_IMAGE;
    }}
  />
));

/**
 * Componente para la información de la tarjeta.
 */
const ProductInfo = React.memo(({ product, onAddToCart }) => {

  // Detiene la propagación del evento click para que no navegue
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div className="producto-info">
      <h3>{product.nombre}</h3>
      <p className="producto-descripcion">
        {product.raw?.descripcion_corta || product.description}
      </p>
      <p className="producto-precio">
        ${Number(product.price).toFixed(2)}
      </p>
      <button
        className="producto-add-btn"
        onClick={handleAddToCartClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l3-8H6.4M7 13L5.1 6M7 13l-2 7h13" />
        </svg>
        Añadir al carrito
      </button>
    </div>
  );
});

/**
 * Componente para tarjeta individual.
 */
const ProductCard = React.memo(({ product, onProductClick, onAddToCart }) => (
  <div
    className="producto-card-link"
    onClick={() => onProductClick(product.id)}
  >
    <div className="producto-card">
      <ProductImage product={product} />
      <ProductInfo product={product} onAddToCart={onAddToCart} />
    </div>
  </div>
));

/**
 * Componente para la lista de productos.
 */
const ProductList = React.memo(({ products, onProductClick, onAddToCart }) => (
  <div className="products-grid productos-grid">
    {products.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        onProductClick={onProductClick}
        onAddToCart={onAddToCart}
      />
    ))}
  </div>
));

/**
 * Componente de Paginación
 */
const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Botón anterior
  if (currentPage > 1) {
    pages.push(
      <button
        key="prev"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹ Anterior
      </button>
    );
  }

  // Primera página
  if (startPage > 1) {
    pages.push(
      <button
        key={1}
        className={`pagination-btn ${1 === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(1)}
      >
        1
      </button>
    );
    if (startPage > 2) {
      pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
    }
  }

  // Páginas visibles
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }

  // Última página
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
    }
    pages.push(
      <button
        key={totalPages}
        className={`pagination-btn ${totalPages === currentPage ? 'active' : ''}`}
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </button>
    );
  }

  // Botón siguiente
  if (currentPage < totalPages) {
    pages.push(
      <button
        key="next"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente ›
      </button>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination">
        {pages}
      </div>
    </div>
  );
});

/**
 * Componente para el detalle del producto.
 */
const ProductDetail = React.memo(({ product, onAddToCart }) => {
  const [activeTab, setActiveTab] = useState('descripcion');

  const handleDetailAddToCart = () => {
    const qtyInput = document.getElementById('product-detail-qty');
    const qty = Number(qtyInput?.value || 1);
    const safeQty = isNaN(qty) || qty <= 0 ? 1 : qty;

    // Llama a la función onAddToCart con la cantidad
    onAddToCart(product, safeQty);
  };

  const { nombre, price, stock, specs, description } = product;

  return (
    <div className="product-detail">
      <div className="product-detail-main">
        <div className="product-detail-image-wrapper">
          <ProductImage product={product} className="product-detail-image" />
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-name">{nombre}</h1>
          <div className="product-detail-price-box">
            <span className="product-detail-price">${price.toFixed(2)}</span>
          </div>
          <p className="product-detail-stock">
            Stock: {stock > 0 ? `${stock} unidades disponibles` : 'Sin stock'}
          </p>

          <div className="product-detail-actions">
            <input
              id="product-detail-qty"
              type="number"
              min="1"
              defaultValue="1"
              className="product-detail-quantity"
            />
            <button
              className="product-detail-buy-btn"
              type="button"
              onClick={handleDetailAddToCart}
            >
              Añadir al carrito
            </button>
          </div>

          <div className="product-detail-extra">
            <p>Envío: {product.raw.envioDescripcion || 'Envío estándar disponible.'}</p>
            <p>Devolución: {product.raw.politicaDevolucion || 'Devoluciones dentro de 30 días.'}</p>
          </div>


        </div>
      </div>

      <div className="product-detail-tabs">
        <div className="product-detail-tab-headers">
          <button
            className={`producto-tab-header ${activeTab === 'descripcion' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('descripcion')}
          >
            Descripción
          </button>
          <button
            className={`producto-tab-header ${activeTab === 'especificaciones' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveTab('especificaciones')}
          >
            Especificaciones
          </button>
        </div>
        <div className="product-detail-tab-body">
          <div className={`producto-tab-panel ${activeTab === 'descripcion' ? 'active' : ''}`}>
            <p className="product-detail-description">{description}</p>
          </div>
          <div className={`producto-tab-panel ${activeTab === 'especificaciones' ? 'active' : ''}`}>
            <table className="product-specs-table">
              <tbody>
                {specs.map(spec => (
                  <tr key={spec.label}>
                    <th>{spec.label}</th>
                    <td>{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});


// --- Componente Principal ---

const Productos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Estado unificado
  const [state, setState] = useState({
    products: [],
    loading: false,
    error: null
  });
  const { products, loading, error } = state;

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Helpers para actualizar el estado
  const setProducts = (newProducts) => {
    setState(prev => ({ ...prev, products: newProducts }));
  };
  const setLoading = (isLoading) => {
    setState(prev => ({ ...prev, loading: isLoading }));
  };
  const setError = (newError) => {
    setState(prev => ({ ...prev, error: newError }));
  };

  // Detección de ruta memoizada
  const routeInfo = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q') || '';
    const categoriaId = searchParams.get('categoria_id') || '0';

    const isProductsRoute = location.pathname === '/productos';
    const isSearchRoute = location.pathname === '/productos/buscar';
    const isProductDetailRoute = /^\/productos\/[^/]+\/?$/.test(location.pathname) && !isSearchRoute;

    let productId = null;
    if (isProductDetailRoute) {
      const match = location.pathname.match(/^\/productos\/([^/]+)\/?$/);
      productId = match ? match[1] : null;
    }

    return {
      searchQuery,
      categoriaId,
      isProductsRoute,
      isSearchRoute,
      isProductDetailRoute,
      productId
    };
  }, [location.pathname, location.search]);

  const { productId, searchQuery, categoriaId, isProductsRoute, isSearchRoute, isProductDetailRoute } = routeInfo;

  // --- Lógica de Paginación ---

  // Calcular productos para la página actual
  const paginatedProducts = useMemo(() => {
    if (productId) return products; // No paginar en vista de detalle
    
    const startIndex = (currentPage - 1) * PRODUCTOS_POR_PAGINA;
    const endIndex = startIndex + PRODUCTOS_POR_PAGINA;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, productId]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    if (productId) return 1;
    return Math.ceil(products.length / PRODUCTOS_POR_PAGINA);
  }, [products.length, productId]);

  // Resetear a página 1 cuando cambian los filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoriaId, location.pathname]);


  // Helper memoizado para construir el endpoint
  const buildEndpoint = useCallback(() => {
    // El detalle del producto sigue igual
    if (productId) {
      return `${API_BASE}/api/productos/${encodeURIComponent(productId)}`;
    }

    // Lógica unificada para filtros
    const params = new URLSearchParams();

    if (searchQuery) {
      params.append('busqueda', searchQuery);
    }

    if (categoriaId && categoriaId !== '0') {
      params.append('categoria_id', categoriaId);
    }

    return `${API_BASE}/api/productos/con-imagenes?${params.toString()}`;

  }, [productId, searchQuery, categoriaId]);

  // Helper memoizado para normalizar la respuesta
  const normalizeData = useCallback((data) => {
    if (productId) {
      const product = Array.isArray(data) ? data[0] : data;
      return product ? [normalizeProduct(product)] : [];
    }
    return Array.isArray(data) ? data.map(normalizeProduct) : [];
  }, [productId]);

  // useEffect de Carga de Datos
  useEffect(() => {
    const fetchProducts = async () => {
  
      if (isSearchRoute && !searchQuery && (categoriaId === '0' || !categoriaId)) {
        setLoading(false);
        setProducts([]);
        setError(null);
        return;
      }

      if (isProductDetailRoute && !productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = buildEndpoint();
        if (!endpoint) {
          setLoading(false);
          return;
        }

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudieron cargar los productos`);
        }

        const { data, success } = await response.json();

        if (!success) {
          if (data) {
            console.warn('Respuesta de API marcada como no exitosa, pero se encontraron datos.');
          } else {
            throw new Error('Respuesta inválida de la API');
          }
        }

        const normalizedProducts = normalizeData(data || []);
        setProducts(normalizedProducts);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, [location.pathname, location.search, productId, isSearchRoute, searchQuery, categoriaId, buildEndpoint, normalizeData, isProductDetailRoute]);

  // --- Event Handlers (Memoizados) ---

  const handleAddToCart = useCallback((product, quantity = 1) => {
    addToCart({
      id: product.id,
      nombre: product.nombre,
      price: product.price,
      stock: product.stock,
      image: product.image,
      type: 'producto',
      quantity: quantity,
    });
  }, [addToCart]);

  const handleProductClick = useCallback((productId) => {
    navigate(`/productos/${productId}`);
  }, [navigate]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Scroll suave hacia arriba al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Render ---

  const getTitle = () => {
    if (productId) return 'Detalle del Producto';
    if (isSearchRoute) return `Resultados para: "${searchQuery}"`;
    if (isProductsRoute) return 'Todos los Productos';
    const pageName = location.pathname.replace('/', '');
    return pageName.charAt(0).toUpperCase() + pageName.slice(1);
  };

  const renderContent = () => {
    if (loading) {
      return <p className="loading-message">Cargando productos...</p>;
    }

    if (error) {
      return <div className="error-message">Error al cargar productos -- {error}</div>;
    }

    if (products.length === 0) {
      return (
        <div className="error-message">
          {isSearchRoute
            ? 'No se encontraron productos para tu búsqueda.'
            : 'No hay productos para mostrar.'
          }
        </div>
      );
    }

    // Si hay ID, muestra detalle. Si no, muestra lista.
    return productId ? (
      <ProductDetail product={products[0]} onAddToCart={handleAddToCart} />
    ) : (
      <>
  <ProductList
    products={paginatedProducts}
    onProductClick={handleProductClick}
    onAddToCart={handleAddToCart}
  />
  
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={handlePageChange}
  />
</>
    );
  };

  return (
    <div className="productos-page">
      <h2 className="productos-title">{getTitle()}</h2>

      {renderContent()}
    </div>
  );
};

export default Productos;