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
    let shouldReconnect = true; // Flag para controlar reconexiones automáticas
    let isManualDisconnection = false; // Flag para identificar desconexiones manuales
    const init = () => {
        if (client || isInitializing) {
            return client;
        }

        isInitializing = true;
        // setupKeepAlive(); // Configurar keep alive

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
            if (msg.body == 'ping') {
                msg.reply('pong');
            }
        });

        client.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            isReady = false;
            isInitializing = false;
            
            // Solo intentar reconexión si no fue una desconexión manual
            if (!isManualDisconnection && shouldReconnect) {
                console.log('Iniciando reconexión automática en 30 segundos...');
                setTimeout(() => {
                    attemptReconnect();
                }, 30000);
            } else {
                console.log('Reconexión automática deshabilitada o desconexión manual');
            }
        });

        client.initialize();
        return client;
    };

    // Función para mantener la actividad (cada 5 minutos)
    // const setupKeepAlive = () => {
    //     keepAliveInterval = setInterval(() => {
    //         console.log('KeepAlive: WhatsApp Client activo');
    //     }, 3 * 60 * 1000); 
    // };

    // Función para intentar reconexión automática
    const attemptReconnect = () => {
        // Verificar si debe seguir reconectando
        if (!shouldReconnect || isManualDisconnection) {
            console.log('Reconexión cancelada: deshabilitada o desconexión manual');
            return;
        }

        if (client && isReady) {
            console.log('Cliente ya está conectado, cancelando reconexión.');
            return;
        }

        console.log('Intentando reconectar...');
        let attempts = 0;
        const maxAttempts = 3; // Reducido a 3 intentos para optimizar recursos

        reconnectInterval = setInterval(async () => {
            // Verificar nuevamente si debe continuar
            if (!shouldReconnect || isManualDisconnection) {
                console.log('Reconexión cancelada durante el proceso');
                clearInterval(reconnectInterval);
                return;
            }

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

                // Reducir tiempo de espera a 45 segundos para optimizar recursos
                setTimeout(() => {
                    if (!isReady && attempts < maxAttempts && shouldReconnect && !isManualDisconnection) {
                        console.log(`Intento ${attempts} falló, preparando siguiente intento...`);
                    } else if (attempts >= maxAttempts || !shouldReconnect || isManualDisconnection) {
                        console.log('Máximo número de intentos de reconexión alcanzado o reconexión deshabilitada');
                        clearInterval(reconnectInterval);
                    }
                }, 45000); // Reducido de 60 a 45 segundos

            } catch (error) {
                console.error(`Error en intento de reconexión ${attempts}:`, error);
            }

            if (attempts >= maxAttempts || !shouldReconnect || isManualDisconnection) {
                console.log('Finalizando intentos de reconexión');
                clearInterval(reconnectInterval);
            }
        }, 90000); // Reducido de 120 a 90 segundos entre intentos
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
            qrCode: currentQR,
            shouldReconnect,
            isManualDisconnection
        };
    };

    const disconnect = async () => {
        console.log('Iniciando desconexión manual del cliente...');
        
        // Marcar como desconexión manual para evitar reconexiones
        isManualDisconnection = true;
        shouldReconnect = false;
        
        // Cancelar cualquier intento de reconexión en progreso
        if (reconnectInterval) {
            console.log('Cancelando intentos de reconexión activos...');
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        
        // Limpiar intervalos de keep alive
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
            keepAliveInterval = null;
        }
        
        // Destruir cliente
        if (client) {
            try {
                await client.destroy();
                console.log('Cliente destruido correctamente');
            } catch (error) {
                console.error('Error al destruir cliente:', error);
            }
            client = null;
        }
        
        // Resetear estados
        isReady = false;
        qrGenerated = false;
        currentQR = null;
        isInitializing = false;
        
        console.log('Cliente desconectado y limpieza completada - No se intentará reconexión automática');
    };

    // Función para habilitar/deshabilitar reconexión automática
    const setAutoReconnect = (enabled) => {
        shouldReconnect = enabled;
        if (enabled) {
            isManualDisconnection = false;
        }
        console.log(`Reconexión automática ${enabled ? 'habilitada' : 'deshabilitada'}`);
    };

    // Función para reconectar manualmente
    const manualReconnect = async () => {
        console.log('Iniciando reconexión manual...');
        isManualDisconnection = false;
        shouldReconnect = true;
        
        // Si ya hay un cliente, desconectarlo primero
        if (client) {
            await disconnect();
            // Esperar un momento antes de reiniciar
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return init();
    };

    // API pública del módulo
    return {
        init,
        sendMessage,
        getStatus,
        disconnect,
        setAutoReconnect,
        manualReconnect
    };
})();

module.exports = WhatsAppClient;