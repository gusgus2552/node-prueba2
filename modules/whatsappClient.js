const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const WhatsAppClient = (() => {
    let client;
    let isReady = false;
    let currentQR = null;
    let isManualDisconnect = false;


    const init = async () => {
        if (client || isReady) return client;

        client = new Client({
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });

        client.on('qr', (qr) => {
            currentQR = qr;
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', async () => {
            console.log('[WhatsApp] Cliente listo');
            isReady = true;
            currentQR = null;
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
        await client.destroy();
        client = null;
        isReady = false;
        currentQR = null;
    };

    return { init, sendMessage, disconnect, getStatus: () => ({ isReady, qr: currentQR }) };
})();

module.exports = WhatsAppClient;
