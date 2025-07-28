// whatsappClient.js
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.qrGenerated = false;
    }

    async init() {
        // Evitar múltiples inicializaciones
        if (this.client) {
            console.log('Cliente ya inicializado');
            return this.client;
        }

        try {
            this.client = new Client({
                puppeteer: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            });

            this.setupEventListeners();
            await this.client.initialize();
            
            return this.client;
        } catch (error) {
            console.error('Error al inicializar cliente:', error);
            this.client = null;
            throw error;
        }
    }

    setupEventListeners() {
        this.client.on('qr', (qr) => {
            console.log('QR Code generado. Escanéalo con WhatsApp:');
            qrcode.generate(qr, { small: true });
            this.qrGenerated = true;
        });

        this.client.on('ready', () => {
            console.log('Cliente de WhatsApp está listo!');
            console.log('---------------');
            this.isReady = true;
        });

        this.client.on('message', (msg) => {
            if (msg.body == '!ping') {
                msg.reply('pong');
            }
            msg.reply('Respondo rápido pero no soy yo, luego veo tu mensaje 🥺🙌🏽 .....!');
        });

        this.client.on('disconnected', (reason) => {
            console.log('Cliente desconectado:', reason);
            this.isReady = false;
            this.qrGenerated = false;
            this.client = null;
        });
    }

    getClient() {
        if (!this.client) {
            throw new Error('Cliente no inicializado. Llama a init() primero.');
        }
        return this.client;
    }

    getStatus() {
        return {
            isReady: this.isReady,
            qrGenerated: this.qrGenerated,
            hasClient: !!this.client
        };
    }

    async sendMessage(number, message) {
        if (!this.isReady) {
            throw new Error('Cliente no está listo');
        }
        
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        return await this.client.sendMessage(chatId, message);
    }

    async destroy() {
        if (this.client) {
            await this.client.destroy();
            this.client = null;
            this.isReady = false;
            this.qrGenerated = false;
        }
    }
}

// Crear instancia singleton
const whatsappService = new WhatsAppService();

module.exports = whatsappService;