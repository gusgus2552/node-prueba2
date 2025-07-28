FROM node:22.17.1-alpine

WORKDIR /app

# 1. Instalar dependencias con versión específica de Chromium compatible
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Dependencias adicionales críticas
    libstdc++ \
    libgcc \
    libx11 \
    libxcb \
    libxdamage \
    libxext \
    libxfixes \
    libxrandr \
    libxrender \
    libxshmfence \
    libxtst \
    && rm -rf /var/cache/apk/*

# 2. Variables de entorno esenciales
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    # Configuraciones críticas para Alpine
    LD_LIBRARY_PATH=/usr/lib:/lib \
    DISABLE_CRASH_REPORTER=true \
    CHROME_BIN=/usr/bin/chromium-browser

# 3. Copiar solo lo necesario (mejora el caching de capas)
COPY package*.json ./

# 4. Instalar dependencias específicas
RUN npm install \
    whatsapp-web.js \
    qrcode-terminal \
    # Puppeteer compatible con Alpine
    puppeteer-core@21.3.6

# 5. Configuración de usuario seguro
RUN addgroup -S whatsapp && adduser -S -G whatsapp whatsapp \
    && chown -R whatsapp:whatsapp /app

USER whatsapp

# 6. Copiar el resto de la aplicación
COPY --chown=whatsapp:whatsapp . .

# 7. Puerto expuesto
EXPOSE 3000

CMD ["npm", "start"]