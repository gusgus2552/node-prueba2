
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
                dataPath: './.wwebjs_auth',
                store: store
                // backupSyncIntervalMs eliminado para reducir costos: solo guarda cuando la sesión cambia
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

        client.on('disconnected', (reason) => {
            console.log('❌ Cliente desconectado:', reason);
            isReady = false;
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
