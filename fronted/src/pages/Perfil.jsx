import React from 'react';
import { useAuth } from '../utils/AuthContext';
import '../styles/Perfil.css';

const Perfil = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="perfil-page">
        <h2>Perfil de usuario</h2>
        <p>No hay usuario en sesión.</p>
      </div>
    );
  }

  const handleLogoutClick = () => {
    logout(true); // cerrar sesión y redirigir al home sin login
  };

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <h2>Mi perfil</h2>
        <div className="perfil-row">
          <span className="perfil-label">ID:</span>
          <span>{user.id}</span>
        </div>
        <div className="perfil-row">
          <span className="perfil-label">Correo:</span>
          <span>{user.correo}</span>
        </div>
        <div className="perfil-row">
          <span className="perfil-label">Rol:</span>
          <span>{user.rol}</span>
        </div>
        <button className="perfil-logout-btn" onClick={handleLogoutClick}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Perfil;
