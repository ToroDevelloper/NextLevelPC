import React, { useState, useEffect } from 'react';
import '../styles/TransicionBienvenida.css';

const TransicionBienvenida = () => {
  const [animandoSalida, setAnimandoSalida] = useState(false);
  const [destruirComponente, setDestruirComponente] = useState(false);

  useEffect(() => {
    // 1. Inicia el temporizador para comenzar la animación de salida
    // Damos 2.5 segundos para que se vean las animaciones de entrada + lectura
    const fadeOutTimer = setTimeout(() => {
      setAnimandoSalida(true);
    }, 2500); // 2.5 segundos visible

    // 2. Inicia el temporizador para destruir el componente
    // (2.5s visibles + 0.7s de animación de salida = 3.2s total)
    const destroyTimer = setTimeout(() => {
      setDestruirComponente(true);
    }, 3200); 

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (destruirComponente) {
    return null; // El componente se desmonta del DOM
  }

  return (
    // Aplicamos la clase 'oculto' cuando 'animandoSalida' es true
    <div className={`fondo-bienvenida ${animandoSalida ? 'oculto' : ''}`}>
      <div className="contenido-bienvenida">
        
        {/* 1. El texto de bienvenida */}
        <h2 className="texto-bienvenida">Bienvenidos a</h2>
        
        {/* 2. La imagen del logo */}
        <img 
          src="/logo.png" // Ruta desde la carpeta public
          alt="NextLevelPC Logo" 
          className="logo-imagen"
        />

        {/* 3. El eslogan */}
        <p className="subtitulo-bienvenida">Despierta tu poder digital.</p>
      </div>
    </div>
  );
};

export default TransicionBienvenida;