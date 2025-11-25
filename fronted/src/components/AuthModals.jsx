import React from 'react';
import { useAuthModal } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const AuthModals = () => {
    const { authModal, closeAuthModal } = useAuthModal();

    if (!authModal.isOpen) return null;

    return (
        <div className="auth-modals-container">
            <div className="auth-modal-backdrop" onClick={closeAuthModal}></div>
            {authModal.type === 'login' && (
                <LoginModal onClose={closeAuthModal} />
            )}
            {authModal.type === 'register' && (
                <RegisterModal onClose={closeAuthModal} />
            )}
        </div>
    );
};

export default AuthModals;