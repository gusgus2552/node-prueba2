const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

/**
 * Módulo para manejar el cliente de WhatsApp
 */
const WhatsAppClient = (() => {
    let client;
    let isReady = false;
    let qrGenerated = false;

    const init = () => {
        if (client) {
            return client;
        }

        client = new Client();

        client.on('qr', qr => {
            console.log('QR Code generado. Escanéalo con WhatsApp:');
            qrcode.generate(qr, { small: true });
            qrGenerated = true;
        });

        client.on('ready', () => {
            console.log('Cliente de WhatsApp está listo!');
            console.log('---------------');
            isReady = true;
        });

        client.on('message', msg => {
            if (msg.body == '!ping') {
                msg.reply('pong');
            }
        });

        client.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            isReady = false;
        });

        client.initialize();
        return client;
    };

    const sendMessage = async (number, message) => {
        if (!client || !isReady) {
            throw new Error('Cliente de WhatsApp no está listo. Asegúrate de haber escaneado el código QR.');
        }

        try {
            const response = await client.sendMessage(number + '@c.us', message);
            return {
                success: true,
                message: 'Mensaje enviado correctamente',
                response: response
            };
        } catch (error) {
            throw new Error(`Error al enviar el mensaje: ${error.message}`);
        }
    };

    const getStatus = () => {
        return {
            isReady,
            qrGenerated,
            hasClient: !!client
        };
    };

    const disconnect = async () => {
        if (client) {
            await client.destroy();
            client = null;
            isReady = false;
            qrGenerated = false;
        }
    };

    // API pública del módulo
    return {
        init,
        sendMessage,
        getStatus,
        disconnect
    };
})();

module.exports = WhatsAppClient;
