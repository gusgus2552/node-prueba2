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

### Opción 1: Instalación Local

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

### Opción 2: Usando Docker (Recomendado)

#### Prerrequisitos
- Docker
- Docker Compose

#### Comandos disponibles

1. **Construir e iniciar la aplicación:**
```bash
./docker.sh start
```

2. **Ver logs en tiempo real:**
```bash
./docker.sh logs
```

3. **Detener la aplicación:**
```bash
./docker.sh stop
```

4. **Reiniciar la aplicación:**
```bash
./docker.sh restart
```

5. **Abrir shell en el contenedor:**
```bash
./docker.sh shell
```

6. **Limpiar imágenes y volúmenes no utilizados:**
```bash
./docker.sh clean
```

#### Comandos Docker manuales

Si prefieres usar Docker directamente:

```bash
# Construir imagen
docker build -t whatsapp-api:latest .

# Ejecutar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

#### Características del contenedor Docker

- **Imagen base**: Node.js v22 Alpine (ligera y segura)
- **Puerto expuesto**: 3000
- **Volúmenes persistentes**: Para mantener la sesión de WhatsApp entre reinicios
- **Health check**: Monitoreo automático del estado de la aplicación
- **Usuario no-root**: Mayor seguridad
- **Chromium incluido**: Para whatsapp-web.js

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

## Notas Importantes para Docker

### Persistencia de Sesión
- Los volúmenes Docker mantienen la sesión de WhatsApp entre reinicios del contenedor
- No necesitas escanear el código QR cada vez que reinicies el contenedor

### Puertos
- La aplicación estará disponible en `http://localhost:3000`
- Asegúrate de que el puerto 3000 esté libre en tu sistema

### Logs y Debugging
- Usa `./docker.sh logs` para ver los logs en tiempo real
- El código QR aparecerá en los logs del contenedor cuando inicialices el cliente

### Recursos del Sistema
- El contenedor incluye Chromium para whatsapp-web.js
- Requiere aproximadamente 200-300MB de RAM en funcionamiento
