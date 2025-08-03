const { Client, LocalAuth, ChatTypes } = require('whatsapp-web.js');
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
    let reconnectInterval;
    let keepAliveInterval;
    const init = () => {
        if (client || isInitializing) {
            return client;
        }

        isInitializing = true;
        setupKeepAlive(); // Configurar keep alive

        client = new Client({
            authStrategy: new LocalAuth({
                dataPath: './.wwebjs_auth',
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
            isInitializing = false;
            clearInterval(reconnectInterval); // Detener intentos de reconexión
        });

        client.on('message', msg => {
            if (msg.body == '!ping') {
                msg.reply('pong');
            }
        });

        client.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            isReady = false;
            isInitializing = false;
            
            // Intentar reconexión automática después de 30 segundos
            console.log('Iniciando reconexión automática en 30 segundos...');
            setTimeout(() => {
                attemptReconnect();
            }, 30000);
        });

        client.initialize();
        return client;
    };

    // Función para mantener la actividad (cada 5 minutos)
    const setupKeepAlive = () => {
        keepAliveInterval = setInterval(() => {
            console.log('KeepAlive: WhatsApp Client activo');
        }, 3 * 60 * 1000); // 3 minutos
    };

    // Función para intentar reconexión automática
    const attemptReconnect = () => {
        if (client && isReady) {
            console.log('Cliente ya está conectado, cancelando reconexión.');
            return;
        }

        console.log('Intentando reconectar...');
        let attempts = 0;
        const maxAttempts = 5;

        reconnectInterval = setInterval(async () => {
            attempts++;
            console.log(`Intento de reconexión ${attempts}/${maxAttempts}`);

            try {
                // Limpiar cliente anterior si existe
                if (client) {
                    await client.destroy();
                    client = null;
                }

                // Reinicializar
                isInitializing = false;
                init();

                // Si después de 60 segundos no está listo, continuar con el siguiente intento
                setTimeout(() => {
                    if (!isReady && attempts < maxAttempts) {
                        console.log(`Intento ${attempts} falló, preparando siguiente intento...`);
                    } else if (attempts >= maxAttempts) {
                        console.log('Máximo número de intentos de reconexión alcanzado');
                        clearInterval(reconnectInterval);
                    }
                }, 60000);

            } catch (error) {
                console.error(`Error en intento de reconexión ${attempts}:`, error);
            }

            if (attempts >= maxAttempts) {
                console.log('Máximo número de intentos de reconexión alcanzado');
                clearInterval(reconnectInterval);
            }
        }, 120000); // Intentar cada 2 minutos
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
            isInitializing = false;
        }
        
        // Limpiar intervalos
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            keepAliveInterval = null;
        }
        
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        
        console.log('Cliente desconectado y limpieza completada');
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