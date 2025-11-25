import React from 'react';
import { useAuthModal } from '../contexts/AuthContext';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LoginModal = ({ onClose }) => {
    const {
        loginData,
        loading,
        error,
        setLoading,
        setError,
        updateLoginData,
        switchToRegister
    } = useAuthModal();

    const { login } = useAuth();
    const navigate = useNavigate();
    const API_BASE = '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/usuarios/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    correo: loginData.correo,
                    hash_password: loginData.password
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.mensaje || 'Credenciales inválidas o error de servidor.';
                setError(errorMessage);
                setLoading(false);
                return;
            }

            const data = await res.json();
            const token = data.access_token;

            try {
                const loggedInUser = login(token);
                onClose();

                if (loggedInUser && (loggedInUser.rol === 'admin' || loggedInUser.rol === 'empleado')) {
                    window.location.href = '/ordenes';
                } else {
                    navigate('/home');
                }
            } catch (error) {
                setError("Error al procesar la sesión. Intente de nuevo.");
            }
        } catch (error) {
            console.error('Error durante el proceso de login:', error);
            setError('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal-wrapper">
            <div className="auth-modal-container">
                <button 
                    onClick={onClose}
                    className="auth-modal-close"
                    aria-label="Cerrar"
                >
                    <IconX />
                </button>
                
                <div className="auth-modal-header">
                    <h2>Iniciar Sesión</h2>
                    <p className="auth-modal-subtitle">Tu información está protegida</p>
                </div>

                <form className="auth-modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login-correo">Email</label>
                        <input 
                            type="email" 
                            id="login-correo"
                            value={loginData.correo}
                            onChange={(e) => updateLoginData('correo', e.target.value)}
                            placeholder="Ingresa tu email"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login-password">Contraseña</label>
                        <input 
                            type="password" 
                            id="login-password"
                            value={loginData.password}
                            onChange={(e) => updateLoginData('password', e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            required
                            disabled={loading}
                        />
                    </div>
                    
                    {error && (
                        <div className="auth-modal-error">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="auth-submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-modal-footer">
                    <p>¿No tienes cuenta?</p>
                    <button 
                        className="auth-switch-btn"
                        onClick={switchToRegister}
                        disabled={loading}
                    >
                        Registrarse
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;