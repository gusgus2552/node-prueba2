const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

/**
 * Módulo para manejar el cliente de WhatsApp
 */
const WhatsAppClient = (() => {
    let client;
    let isReady = false;
    let qrGenerated = false;
    let currentQR = null;
    let isInitializing = false;
    const init = () => {
        if (client || isInitializing) {
            return client;
        }

        isInitializing = true;

        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './.wwebjs_auth', // Ruta para almacenar la sesión
            }),
            puppeteer: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ],
                    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser'
                }
        });

        client.on('qr', qr => {
            console.log('QR Code generado2. Escanéalo con WhatsApp:');
            qrcode.generate(qr, { small: true });
            currentQR = qr;
            qrGenerated = true;
        });

        client.on('ready', () => {
            console.log('Cliente de WhatsApp está listo!');
            console.log('---------------');
            currentQR = null; // Limpiar QR cuando esté listo
            isReady = true;
        });

        client.on('message', async msg => {
            const chat = await msg.getChat();
            const chatType = chat.isGroup ? 'grupo' : 'individual';
            if (chatType === 'grupo') {
                if (msg.body.toLowerCase().includes('hola')) {
                    msg.reply('¡Hola! ¿Cómo puedo ayudarte hoy?');
                }
            } else {
                msg.reply('Este mensaje es automático, responderé pronto 😁');
            }

            console.log(`Mensaje recibido de ${msg.from} (${chat.type}): ${msg.body}`);
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
            hasClient: !!client,
            qrCode: currentQR
        };
    };

    const disconnect = async () => {
        if (client) {
            await client.destroy();
            client = null;
            isReady = false;
            qrGenerated = false;
            currentQR = null;
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