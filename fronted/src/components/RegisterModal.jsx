import React from 'react';
import { useAuthModal } from '../contexts/AuthContext';
import '../styles/login.css';

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const RegisterModal = ({ onClose }) => {
    const {
        registerData,
        loading,
        error,
        setLoading,
        setError,
        updateRegisterData,
        switchToLogin
    } = useAuthModal();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!registerData.nombre || !registerData.correo || !registerData.hash_password) {
            setError('Completa todos los campos obligatorios.');
            return;
        }

        if (registerData.hash_password !== registerData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (registerData.hash_password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: registerData.nombre,
                    apellido: registerData.apellido,
                    correo: registerData.correo,
                    hash_password: registerData.hash_password
                }),
            });

            const text = await res.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (err) {
                console.warn('Respuesta no JSON:', text);
            }

            if (!res.ok) {
                setError(data.mensaje || data.message || `Error ${res.status}`);
                setLoading(false);
                return;
            }

            setLoading(false);
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            switchToLogin();

        } catch (err) {
            console.error('Error en registro:', err);
            setError('No se pudo conectar con el servidor.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        updateRegisterData(e.target.name, e.target.value);
    };

    return (
        <div className="auth-modal-wrapper register-modal">
            <div className="auth-modal-container">
                <button 
                    onClick={onClose}
                    className="auth-modal-close"
                    aria-label="Cerrar"
                >
                    <IconX />
                </button>
                
                <div className="auth-modal-header">
                    <h2>Crear Cuenta</h2>
                    <p className="auth-modal-subtitle">Únete a nuestra comunidad</p>
                </div>

                <form className="auth-modal-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="register-nombre">Nombre *</label>
                            <input
                                type="text"
                                id="register-nombre"
                                name="nombre"
                                value={registerData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Tu nombre"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-apellido">Apellido</label>
                            <input
                                type="text"
                                id="register-apellido"
                                name="apellido"
                                value={registerData.apellido}
                                onChange={handleChange}
                                placeholder="Tu apellido"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-correo">Correo electrónico *</label>
                        <input
                            type="email"
                            id="register-correo"
                            name="correo"
                            value={registerData.correo}
                            onChange={handleChange}
                            required
                            placeholder="tu@correo.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="register-password">Contraseña *</label>
                            <input
                                type="password"
                                id="register-password"
                                name="hash_password"
                                value={registerData.hash_password}
                                onChange={handleChange}
                                required
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-confirmPassword">Confirmar contraseña *</label>
                            <input
                                type="password"
                                id="register-confirmPassword"
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Repite tu contraseña"
                                disabled={loading}
                            />
                        </div>
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
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <div className="auth-modal-footer">
                    <p>¿Ya tienes cuenta?</p>
                    <button 
                        className="auth-switch-btn"
                        onClick={switchToLogin}
                        disabled={loading}
                    >
                        Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;