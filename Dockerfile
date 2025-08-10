FROM node:22.17.1-alpine

WORKDIR /app

# Instalar Chromium y dependencias mínimas necesarias
RUN apk add --no-cache chromium ca-certificates dumb-init

# Variables para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=256 --expose-gc"

# Instalar dependencias Node.js
COPY package*.json ./
RUN npm install --production && npm cache clean --force

# Copiar código
COPY . .

EXPOSE 3000

# Usar dumb-init para manejar correctamente las señales del sistema
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--expose-gc", "index.js"]