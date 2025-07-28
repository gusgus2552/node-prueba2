#!/bin/bash

# Script para construir y ejecutar la aplicación WhatsApp API en Docker

set -e

echo "🐳 Dockerizando WhatsApp API..."

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  build    - Construir la imagen Docker"
    echo "  start    - Iniciar el contenedor con docker-compose"
    echo "  stop     - Detener el contenedor"
    echo "  restart  - Reiniciar el contenedor"
    echo "  logs     - Mostrar logs del contenedor"
    echo "  shell    - Abrir shell en el contenedor"
    echo "  clean    - Limpiar imágenes y volúmenes no utilizados"
    echo "  help     - Mostrar esta ayuda"
    echo ""
}

# Verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no está instalado. Por favor, instala Docker primero."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
        exit 1
    fi
}

# Función para construir la imagen
build_image() {
    echo "🔨 Construyendo imagen Docker..."
    docker build -t whatsapp-api:latest .
    echo "✅ Imagen construida exitosamente"
}

# Función para iniciar el contenedor
start_container() {
    echo "🚀 Iniciando contenedor..."
    docker-compose up -d
    echo "✅ Contenedor iniciado"
    echo "📱 API disponible en: http://localhost:3000"
    echo "📊 Para ver logs: ./docker.sh logs"
}

# Función para detener el contenedor
stop_container() {
    echo "🛑 Deteniendo contenedor..."
    docker-compose down
    echo "✅ Contenedor detenido"
}

# Función para reiniciar el contenedor
restart_container() {
    echo "🔄 Reiniciando contenedor..."
    docker-compose restart
    echo "✅ Contenedor reiniciado"
}

# Función para mostrar logs
show_logs() {
    echo "📊 Mostrando logs del contenedor..."
    docker-compose logs -f whatsapp-api
}

# Función para abrir shell en el contenedor
open_shell() {
    echo "🐚 Abriendo shell en el contenedor..."
    docker-compose exec whatsapp-api sh
}

# Función para limpiar
clean_docker() {
    echo "🧹 Limpiando imágenes y volúmenes no utilizados..."
    docker system prune -f
    echo "✅ Limpieza completada"
}

# Verificar Docker
check_docker

# Procesar comando
case "${1:-help}" in
    build)
        build_image
        ;;
    start)
        build_image
        start_container
        ;;
    stop)
        stop_container
        ;;
    restart)
        restart_container
        ;;
    logs)
        show_logs
        ;;
    shell)
        open_shell
        ;;
    clean)
        clean_docker
        ;;
    help|*)
        show_help
        ;;
esac
