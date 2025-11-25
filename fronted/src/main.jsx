import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './utils/AuthContext.jsx';
import { CartProvider } from './utils/CartContext.jsx'; // Importar CartProvider
import "./styles/Global.css"; // Solo este import

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <CartProvider> {/* Envolver App con CartProvider */}
                    <App />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)