# WhatsApp API

API REST para enviar mensajes de WhatsApp utilizando el patrón de diseño módulo.

## Estructura del Proyecto

```
├── index.js                 # Archivo principal del servidor
├── package.json            # Dependencias y configuración
├── modules/                # Módulos de la aplicación
│   ├── whatsappClient.js   # Cliente de WhatsApp
│   ├── validator.js        # Validaciones
│   └── responseHandler.js  # Manejo de respuestas HTTP
└── routes/                 # Rutas de la API
    └── whatsapp.js         # Rutas de WhatsApp
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor:
```bash
npm start
```

O para desarrollo con auto-reload:
```bash
npm run dev
```

## Uso de la API

### 1. Inicializar el cliente de WhatsApp

```http
POST /api/whatsapp/init
```

Respuesta:
```json
{
  "success": true,
  "message": "Cliente inicializado correctamente",
  "data": {
    "message": "Cliente inicializado. Escanee el código QR que aparece en la consola."
  },
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

**Nota:** Después de este endpoint, verás un código QR en la consola que debes escanear con WhatsApp.

### 2. Verificar estado del cliente

```http
GET /api/whatsapp/status
```

Respuesta:
```json
{
  "success": true,
  "message": "Estado del cliente obtenido correctamente",
  "data": {
    "isReady": true,
    "qrGenerated": true,
    "hasClient": true
  },
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

### 3. Enviar mensaje

```http
POST /api/whatsapp/send
Content-Type: application/json

{
  "number": "51950939937",
  "message": "Hola, este es un mensaje de prueba desde la API"
}
```

Respuesta exitosa:
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "data": {
    "to": "51950939937",
    "message": "Hola, este es un mensaje de prueba desde la API",
    "messageId": "false_51950939937@c.us_ABC123..."
  },
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

### 4. Desconectar cliente

```http
POST /api/whatsapp/disconnect
```

Respuesta:
```json
{
  "success": true,
  "message": "Cliente desconectado correctamente",
  "data": null,
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

## Validaciones

- **Número de teléfono**: Debe tener entre 8 y 15 dígitos
- **Mensaje**: No puede estar vacío y máximo 4096 caracteres

## Errores Comunes

### Cliente no inicializado
```json
{
  "success": false,
  "message": "Cliente de WhatsApp no inicializado. Use el endpoint /init primero.",
  "error": null,
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

### Cliente no listo
```json
{
  "success": false,
  "message": "Cliente de WhatsApp no está listo. Asegúrese de haber escaneado el código QR.",
  "error": null,
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

### Validación de datos
```json
{
  "success": false,
  "message": "Los campos \"number\" y \"message\" son requeridos",
  "error": null,
  "timestamp": "2025-07-27T10:30:00.000Z"
}
```

## Patrón de Diseño Módulo

Este proyecto utiliza el patrón de diseño módulo para organizar el código:

- **WhatsAppClient**: Maneja la conexión y operaciones con WhatsApp
- **Validator**: Valida los datos de entrada
- **ResponseHandler**: Estandariza las respuestas HTTP

Cada módulo expone solo las funciones necesarias, manteniendo el código organizado y encapsulado.
