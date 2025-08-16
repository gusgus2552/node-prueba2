const express = require('express');
const WhatsAppClient = require('../modules/whatsappClient');
const Validator = require('../modules/validator');
const ResponseHandler = require('../modules/responseHandler');

const router = express.Router();

/**
 * POST /api/whatsapp/send
 * Envía un mensaje de WhatsApp
 */
router.post('/send', async (req, res) => {
    try {
        // Validar los datos de entrada
        const validation = Validator.validateSendMessageRequest(req.body);
        if (!validation.isValid) {
            return ResponseHandler.validationError(res, validation.error);
        }

        const { number, message } = validation.data;

        // Verificar el estado del cliente
        const status = WhatsAppClient.getStatus();
        if (!status.isReady) {
            if (!status.hasClient) {
                return ResponseHandler.serviceUnavailable(res, 'Cliente de WhatsApp no inicializado. Use el endpoint /init primero.');
            }
            return ResponseHandler.serviceUnavailable(res, 'Cliente de WhatsApp no está listo. Asegúrese de haber escaneado el código QR.');
        }

        // Enviar el mensaje
        await WhatsAppClient.sendMessage(number, message);
        
        return ResponseHandler.success(res, {
            to: number,
            message: message,
        }, 'Mensaje enviado correctamente');

    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return ResponseHandler.error(res, error.message);
    }
});

/**
 * GET /api/whatsapp/status
 * Obtiene el estado del cliente de WhatsApp
 */
router.get('/status', (req, res) => {
    try {
        const status = WhatsAppClient.getStatus();
        return ResponseHandler.success(res, status, 'Estado en del clienteee obtenido correctamente');
    } catch (error) {
        console.error('Error al obtener estado:', error);
        return ResponseHandler.error(res, error.message);
    }
});

/**
 * POST /api/whatsapp/init
 * Inicializa el cliente de WhatsApp
 */
router.post('/init', (req, res) => {
    try {
        const status = WhatsAppClient.getStatus();
        if (status.hasClient) {
            return ResponseHandler.success(res, status, 'Cliente ya inicializado');
        }

        WhatsAppClient.init();
        return ResponseHandler.success(res, {
            message: 'Cliente inicializado. Escanee el código QR que aparece en la consola.'
        }, 'Cliente inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar cliente:', error);
        return ResponseHandler.error(res, error.message);
    }
});

/**
 * POST /api/whatsapp/disconnect
 * Desconecta el cliente de WhatsApp
 */
router.post('/disconnect', async (req, res) => {
    try {
        await WhatsAppClient.disconnect();
        return ResponseHandler.success(res, null, 'Cliente desconectado correctamente');
    } catch (error) {
        console.error('Error al desconectar cliente:', error);
        return ResponseHandler.error(res, error.message);
    }
});


/**
 * POST /api/whatsapp/reconnect
 * Fuerza la reconexión del cliente de WhatsApp
 */
router.post('/reconnect', async (req, res) => {
    try {
        const status = WhatsAppClient.getStatus();

        if (!status.hasClient) {
            // Si nunca se inicializó, volvemos a init
            WhatsAppClient.init();
            return ResponseHandler.success(res, null, 'Cliente no existía, inicializando...');
        }

        await WhatsAppClient.forceReconnect();
        if (!status.isReady) {
            return ResponseHandler.success(res, status, 'Cliente ya estaba conectado y listo');
        }
        return ResponseHandler.success(res, null, 'Cliente esta volviendo a iniciar...');

    } catch (error) {
        console.error('Error al reconectar cliente:', error);
        return ResponseHandler.error(res, error.message);
    }
});

module.exports = router;
