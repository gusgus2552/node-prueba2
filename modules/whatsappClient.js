const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const WhatsAppClient = (() => {
    let client;
    let isReady = false;
    let currentQR = null;
    let isManualDisconnect = false;
    let reconnectTimeout;
    let gcInterval; // Intervalo para limpieza de memoria

    // Configuración de Puppeteer optimizada
    const puppeteerOpts = {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-offline-load-stale-cache',
            '--disable-software-rasterizer',
            '--js-flags=--expose-gc',
            '--js-flags="--max-old-space-size=128"'
        ],
        defaultViewport: {width: 800, height: 600},
    };

    // Interceptar recursos innecesarios
    const blockResources = async (page) => {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const blockedTypes = ['image', 'stylesheet', 'font', 'media', 'other'];
            const blockedUrls = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.css', 'google-analytics', 'facebook', 'twitter'];
            
            const url = req.url().toLowerCase();
            const resourceType = req.resourceType();
            
            if (blockedTypes.includes(resourceType) || blockedUrls.some(item => url.includes(item))) {
                return req.abort();
            }
            req.continue();
        });
    };
    const init = async () => {
        if (client || isReady) return client;

        client = new Client({
            authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: puppeteerOpts,
            takeoverOnConflict: false,
        });

        client.on('qr', (qr) => {
            currentQR = qr;
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', async () => {
            console.log('[WhatsApp] Cliente listo');
            isReady = true;
            currentQR = null;

            try {
                if (client.pupPage) {
                    await blockResources(client.pupPage);

                    // Limitar la caché del navegador
                    await client.pupPage.setCacheEnabled(false);
                    
                    
                } else {
                    console.warn('[WhatsApp] No se encontró la página de Puppeteer');
                }
            } catch (error) {
                console.warn('[WhatsApp] No se pudo optimizar recursos:', error.message);
            }
        });

        client.on('disconnected', (reason) => {
            console.log(`[WhatsApp] Desconectado (${reason})`);
            isReady = false;
            
            // Limpiar recursos
            if (client) {
                client = null;
            }
            
            if (!isManualDisconnect) {
                console.log('[WhatsApp] Reconectando en 30s...');
                
                // Limpiar timeout anterior si existe
                if (reconnectTimeout) {
                    clearTimeout(reconnectTimeout);
                }
                
                reconnectTimeout = setTimeout(() => {
                    init().catch(err => {
                        console.error('[WhatsApp] Error al reconectar:', err.message);
                    });
                }, 30000);
            }
        });

        await client.initialize();
        return client;
    };

    const sendMessage = async (number, message) => {
        if (!isReady) throw new Error('[WhatsApp] Cliente no inicializado');
        return client.sendMessage(`${number}@c.us`, message);
    };

    const disconnect = async () => {
        isManualDisconnect = true;
        
        // Limpiar todos los intervalos
        if (gcInterval) {
            clearInterval(gcInterval);
            gcInterval = null;
        }
        
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
        
        if (client) {
            try {
                // Cerrar todas las páginas abiertas antes de destruir
                if (client.pupBrowser) {
                    const pages = await client.pupBrowser.pages();
                    await Promise.all(pages.map(page => page.close().catch(e => console.warn('[WhatsApp] Error al cerrar página:', e.message))));
                }
                
                await client.destroy();
                client = null;
                isReady = false;
                currentQR = null;
            } catch (error) {
                console.error('[WhatsApp] Error durante desconexión:', error.message);
            }
        }
    };

    return { init, sendMessage, disconnect, getStatus: () => ({ isReady, qr: currentQR }) };
})();

module.exports = WhatsAppClient;
