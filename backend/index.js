const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

require('dotenv').config();

const app = express();

// Confiar en el proxy de Render para que las cookies seguras funcionen
app.set('trust proxy', 1);

// Importar rutas
const categoriasRoutes = require('./routes/Categorias');
const serviciosRoutes = require('./routes/servicios');
const productosRoutes = require('./routes/Productos');
const rolesRoutes = require('./routes/roles');
const usuariosRoutes = require('./routes/usuarios');
const ordenesRoutes = require('./routes/Ordenes');
const ordenItemsRoutes = require('./routes/OrdenItems');
const imagenProductoRoutes = require('./routes/imagenProductoRoutes');
const citasServiciosRoutes = require('./routes/citasServicios');
const paymentsRoutes = require('./routes/payments');

// Vistas
const productosViews = require('./routesViews/productosViews');
const ordenesViews = require('./routesViews/ordenesViews');
const citasServiciosViews = require('./routesViews/citaServicioViews');
const usersViews = require('./routesViews/usersViews');

const { testConnection } = require('./config/db');

//WEBHOOK PRIMERO - ANTES DE express.json()
app.use('/api/payments/webhook',
    express.raw({ type: 'application/json' })
);

// Middlewares
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    process.env.FRONTEND_URL // URL de producción en Netlify
].filter(Boolean);

console.log('Orígenes permitidos:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como apps móviles o curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Origen bloqueado por CORS:', origin);
            // En desarrollo o si FRONTEND_URL no está definido, permitir temporalmente para depuración
            // return callback(null, true); // Descomentar para permitir todo (INSEGURO)
            
            const msg = `La política CORS para este sitio no permite el acceso desde el origen especificado: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.use(express.static('public'));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Rutas de VISTAS
app.use('/productos', productosViews);
app.use('/ordenes', ordenesViews);
app.use('/dashboard', citasServiciosViews);
app.use('/usuarios', usersViews);

// Rutas API
app.use('/api/categorias', categoriasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/ordenitems', ordenItemsRoutes);
app.use('/api/imagenes-producto', imagenProductoRoutes);
app.use('/api/citas-servicios', citasServiciosRoutes);
app.use('/api/payments', paymentsRoutes);

// Ruta de salud
app.get('/api/health', async (req, res) => {
    try {
        const dbStatus = await testConnection();
        res.json({
            status: 'OK',
            message: 'Backend de NextLevelPC funcionando',
            database: dbStatus ? 'Conectado' : 'Desconectado',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error en el servidor',
            database: 'Error',
            timestamp: new Date().toISOString()
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a NextLevelPC Backend API',
        version: '1.0.0',
        endpoints: {
            categorias: '/api/categorias',
            servicios: '/api/servicios',
            productos: '/api/productos',
            usuarios: '/api/usuarios',
            ordenes: '/api/ordenes',
            ordenitems: '/api/ordenitems',
            roles: '/api/roles',
            imagenes_producto: '/api/imagenes-producto',
            health: '/api/health'
        },
        vistas: {
            productos: '/productos',
            ordenes: '/ordenes'
        }
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Ruta no encontrada
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Inicializar servidor
const PORT = process.env.BACKEND_PORT || 8080;

const startServer = async () => {
    try {
        console.log('Verificando conexión a la base de datos...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.log('> No se pudo conectar a la base de datos');
            process.exit(1);
        }

        app.listen(PORT, () => {
            console.log('-------------------------------');
            console.log('BACKEND NEXTLEVELPC INICIADO');
            console.log('-------------------------------');
            console.log(`Puerto: ${PORT}`);
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`Health: http://localhost:${PORT}/api/health`);
            console.log(`Vista Productos: http://localhost:${PORT}/productos`);
            console.log(`Vista Órdenes: http://localhost:${PORT}/ordenes`);
        });

    } catch (error) {
        console.error('> Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();