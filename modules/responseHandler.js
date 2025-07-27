/**
 * Módulo para manejar respuestas HTTP estandarizadas
 */
const ResponseHandler = (() => {
    
    const success = (res, data, message = 'Operación exitosa', statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    };

    const error = (res, message = 'Error interno del servidor', statusCode = 500, details = null) => {
        return res.status(statusCode).json({
            success: false,
            message,
            error: details,
            timestamp: new Date().toISOString()
        });
    };

    const validationError = (res, message, details = null) => {
        return error(res, message, 400, details);
    };

    const notFound = (res, message = 'Recurso no encontrado') => {
        return error(res, message, 404);
    };

    const unauthorized = (res, message = 'No autorizado') => {
        return error(res, message, 401);
    };

    const serviceUnavailable = (res, message = 'Servicio no disponible') => {
        return error(res, message, 503);
    };

    // API pública del módulo
    return {
        success,
        error,
        validationError,
        notFound,
        unauthorized,
        serviceUnavailable
    };
})();

module.exports = ResponseHandler;
