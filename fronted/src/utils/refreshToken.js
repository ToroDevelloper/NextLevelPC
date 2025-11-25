/**
 * Llama al endpoint de refresco para obtener un nuevo Access Token.
 * @returns {Promise<string>} El nuevo Access Token.
 */
const refreshAccessToken = async () => {
    try {
        const response = await fetch('/api/usuarios/refresh', {
            method: 'POST',
        });

        if (!response.ok) {
            console.error('El refresh token falló o expiró. Forzando logout.');
            throw new Error('Refresh fallido'); 
        }

        const data = await response.json();
        const newAccessToken = data.access_token;
        
        if (!newAccessToken) {
            throw new Error('Respuesta de refresh incompleta');
        }

        return newAccessToken;

    } catch (error) {
        console.error('Error durante el proceso de refresco:', error);
        throw error;
    }
};

export default refreshAccessToken;