const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo global de errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    const status = error.status || 500;
    const message = error.message || 'Error interno del servidor';
    
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;