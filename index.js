const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const whatsappRoutes = require('./routes/whatsapp');
const ResponseHandler = require('./modules/responseHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// Middlewares
app.use(cors());
app.use(bodyParser.json());


// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas
app.use('/api/whatsapp', whatsappRoutes);

// Ruta principal
app.get('/', (req, res) => {
    ResponseHandler.success(res, {
        name: 'WhatsApp API',
        version: '1.0.0',
        endpoints: {
            'GET /qr': 'Página para escanear código QR de WhatsApp (alternativa)',
            'GET /api/whatsapp/qr': 'Página para escanear código QR de WhatsApp',
            'POST /api/whatsapp/init': 'Inicializar cliente de WhatsApp',
            'GET /api/whatsapp/status': 'Obtener estado del cliente',
            'POST /api/whatsapp/send': 'Enviar mensaje',
            'POST /api/whatsapp/disconnect': 'Desconectar cliente'
        }
    }, 'API de WhatsApp funcionando correctamente');
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    ResponseHandler.notFound(res, `Ruta ${req.originalUrl} no encontrada`);
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    ResponseHandler.error(res, 'Error interno del servidor');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
    console.log(`📱 API de WhatsApp disponible en http://localhost:${PORT}`);
    console.log('');
    console.log('Endpoints disponibles:');
    console.log(`  POST http://localhost:${PORT}/api/whatsapp/init`);
    console.log(`  GET  http://localhost:${PORT}/api/whatsapp/status`);
    console.log(`  POST http://localhost:${PORT}/api/whatsapp/send`);
    console.log(`  POST http://localhost:${PORT}/api/whatsapp/disconnect`);
    console.log('');
    console.log('💡 Ejecuta POST /api/whatsapp/init para comenzar 2');
});




