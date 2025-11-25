import React, { createContext, useContext, useState } from 'react';
import AuthModals from '../components/AuthModals'; 

const AuthModalContext = createContext();

export const AuthModalProvider = ({ children }) => {
    const [authModal, setAuthModal] = useState({
        isOpen: false,
        type: 'login'
    });

    const [loginData, setLoginData] = useState({
        correo: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        hash_password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const openLogin = () => {
        console.log('Abriendo modal de login');
        setAuthModal({ isOpen: true, type: 'login' });
    };

    const openRegister = () => {
        console.log('Abriendo modal de registro');
        setAuthModal({ isOpen: true, type: 'register' });
    };

    const closeAuthModal = () => {
        console.log('Cerrando modal de auth');
        setAuthModal({ isOpen: false, type: 'login' });
        setError(null);
        setLoginData({ correo: '', password: '' });
        setRegisterData({
            nombre: '',
            apellido: '',
            correo: '',
            hash_password: '',
            confirmPassword: ''
        });
    };

    const updateLoginData = (field, value) => {
        setLoginData(prev => ({ ...prev, [field]: value }));
    };

    const updateRegisterData = (field, value) => {
        setRegisterData(prev => ({ ...prev, [field]: value }));
    };

    const switchToRegister = () => {
        setAuthModal({ isOpen: true, type: 'register' });
        setError(null);
    };

    const switchToLogin = () => {
        setAuthModal({ isOpen: true, type: 'login' });
        setError(null);
    };

    return (
        <AuthModalContext.Provider value={{
            authModal,
            loginData,
            registerData,
            loading,
            error,
            setLoading,
            setError,
            openLogin,
            openRegister,
            closeAuthModal,
            updateLoginData,
            updateRegisterData,
            switchToRegister,
            switchToLogin
        }}>
            {children}
            {/* AuthModals se renderiza aquí para que esté disponible en toda la app */}
            <AuthModals />
        </AuthModalContext.Provider>
    );
};

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModal debe ser usado dentro de AuthModalProvider');
    }
    return context;
};