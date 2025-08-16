
require('dotenv').config();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { AwsS3Store } = require('wwebjs-aws-s3');
const {
    S3Client,
    PutObjectCommand,
    HeadObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');
const qrcode = require('qrcode-terminal');


const WhatsAppClient = (() => {
    let client;
    let isReady = false;
    let currentQR = null;
    let isManualDisconnect = false;
    let lastDisconnectReason = null;

    // 1. Conexión a S3
    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    // 2. Comandos que el AwsS3Store necesita
    const putObjectCommand = PutObjectCommand;
    const headObjectCommand = HeadObjectCommand;
    const getObjectCommand = GetObjectCommand;
    const deleteObjectCommand = DeleteObjectCommand;

    // 3. Configuración del store
    const store = new AwsS3Store({
        bucketName: process.env.AWS_BUCKET_NAME,
        remoteDataPath: process.env.AWS_BUCKET_PATH || '',
        s3Client: s3,
        putObjectCommand,
        headObjectCommand,
        getObjectCommand,
        deleteObjectCommand
    });

    const init = async () => {
        if (client || isReady) return client;

        client = new Client({
            authStrategy: new RemoteAuth({
                clientId: process.env.SESSION_NAME,
                // dataPath: './.wwebjs_auth',
                backupSyncIntervalMs: 600000,
                store: store
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage'
                ]
            }
        });

        client.on('qr', (qr) => {
            currentQR = qr;
            qrcode.generate(qr, { small: true });
            console.log('QR RECEIVED', qr);
        });

        client.on('ready', async () => {
            console.log('✅ Cliente listo (pero la sesión aún puede no estar en S3)');
            isReady = true;
            currentQR = null;
        });

        client.on('remote_session_saved', () => {
            console.log('💾 Sesión guardada correctamente en S3');
        });
        await client.initialize();
        return client;
    };

    // Forzar reconexión: destruye y reinicia el cliente
    const forceReconnect = async () => {
       if (client && isReady) {
        console.log("Cliente ya listo, no se destruye.");
        return getStatus();
    }
    return init(); // reinicia solo si no está listo
    };

    const wait = ms => new Promise(res => setTimeout(res, ms));
    const sendMessage = async (number, message, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            if (isReady) {
                return client.sendMessage(`${number}@c.us`, message);
            }
            console.log(`[WhatsApp] Cliente no listo, reintentando... (${i+1}/${retries})`);
            await wait(2000);
        }
        throw new Error('[WhatsApp] Cliente no inicializado después de varios intentos');
    };

    const disconnect = async () => {
        isManualDisconnect = true;
        if (client) {
            await client.destroy();
            client = null;
        }
        isReady = false;
        currentQR = null;
    };

    // Mejorar getStatus para exponer más información
    const getStatus = () => ({
        isReady,
        qr: currentQR,
        hasClient: !!client,
        lastDisconnectReason
    });

    return { init, sendMessage, disconnect, getStatus, forceReconnect };
})();

module.exports = WhatsAppClient;
