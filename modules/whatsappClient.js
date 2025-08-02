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
    let welcomedChats = new Set(); // Almacenar chats que ya recibieron bienvenida
    
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
                // Solo enviar bienvenida si es la primera vez que escribe este chat
                if (!welcomedChats.has(msg.from)) {
                    try {
                        // 1. Primero reaccionamos al mensaje
                        await msg.react("✅");
                        
                        // 2. Luego enviamos el mensaje de bienvenida
                        const welcomeMessage = await msg.reply(
                            '👋 ¡Hola! Bienvenido a *Centro Gas Alex*.\n\n🚛 Entrega de gas a domicilio.\n📞 Contáctanos: 917709727\n🌐 Visita: https://centrogasalex.laravel.cloud \n\n💬 *El mejor servicio a tu servicio*'
                        );
                        
                        // 3. Intentar fijar el mensaje de bienvenida
                        try {
                            await welcomeMessage.pin();
                            console.log(`Mensaje de bienvenida fijado para: ${msg.from}`);
                        } catch (pinError) {
                            console.warn(`No se pudo fijar el mensaje para ${msg.from}:`, pinError.message);
                        }
                        
                        // 4. Marcar este chat como que ya recibió la bienvenida
                        welcomedChats.add(msg.from);
                        
                        console.log(`Mensaje de bienvenida enviado a: ${msg.from}`);
                    } catch (error) {
                        console.error("Error al procesar mensaje individual:", error.message);
                    }
                } else {
                    // Solo reaccionar a mensajes posteriores sin enviar mensaje
                    try {
                        await msg.react("👀");
                        console.log(`Mensaje posterior de ${msg.from}: ${msg.body}`);
                    } catch (error) {
                        console.error("Error al reaccionar a mensaje posterior:", error.message);
                    }
                }
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
            welcomedChats.clear(); // Limpiar el registro de chats bienvenidos
        }
    };

    const resetWelcomedChats = () => {
        welcomedChats.clear();
        console.log('Registro de chats bienvenidos limpiado');
    };

    // API pública del módulo
    return {
        init,
        sendMessage,
        getStatus,
        disconnect,
        resetWelcomedChats
    };
})();

module.exports = WhatsAppClient;