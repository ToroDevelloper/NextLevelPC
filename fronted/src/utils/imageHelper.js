/**
 * Configuración de la URL base de la API
 * Idealmente esto debería venir de variables de entorno (import.meta.env.VITE_API_URL)
 */
export const API_BASE_URL = 'http://localhost:8080';

/**
 * Construye una URL completa para una imagen
 * Maneja URLs absolutas, rutas relativas y nombres de archivo
 * 
 * @param {string} path - La ruta o URL de la imagen
 * @param {string} type - Tipo de recurso ('upload' por defecto)
 * @returns {string} URL completa lista para usar en src
 */
export const getImageUrl = (path) => {
    // 1. Si no hay path, retornar placeholder
    if (!path) {
        return 'https://placehold.co/600x400/EEE/31343C?text=Sin+Imagen';
    }

    // 2. Si ya es una URL absoluta (http/https), retornarla tal cual
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // 3. Si empieza con '/', asumimos que es una ruta relativa desde la raíz del servidor
    // Ejemplo: /uploads/imagen.jpg -> http://localhost:8080/uploads/imagen.jpg
    if (path.startsWith('/')) {
        return `${API_BASE_URL}${path}`;
    }

    // 4. Si es solo un nombre de archivo o ruta relativa sin slash inicial
    // Asumimos que está en la carpeta uploads si no se especifica otra cosa
    return `${API_BASE_URL}/uploads/${path}`;
};

/**
 * Manejador de error para eventos onError de imágenes
 * @param {Event} e - Evento del navegador
 */
export const handleImageError = (e) => {
    e.target.onerror = null; // Prevenir bucle infinito
    e.target.src = 'https://placehold.co/600x400/EEE/31343C?text=No+Disponible';
};