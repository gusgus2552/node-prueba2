/**
 * Módulo para manejar validaciones
 */
const Validator = (() => {
    
    const validatePhoneNumber = (number) => {
        // Remover espacios y caracteres especiales
        const cleanNumber = number.replace(/\D/g, '');
        
        // Validar que tenga al menos 9 dígitos
        if (cleanNumber.length < 9) {
            return {
                isValid: false,
                error: 'El número debe tener al menos 9 dígitos'
            };
        }

        // Validar que no tenga más de 11 dígitos (estándar internacional)
        if (cleanNumber.length > 11) {
            return {
                isValid: false,
                error: 'El número no puede tener más de 11 dígitos'
            };
        }

        return {
            isValid: true,
            cleanNumber: cleanNumber
        };
    };

    const validateMessage = (message) => {
        if (!message || typeof message !== 'string') {
            return {
                isValid: false,
                error: 'El mensaje debe ser una cadena de texto'
            };
        }

        if (message.trim().length === 0) {
            return {
                isValid: false,
                error: 'El mensaje no puede estar vacío'
            };
        }

        if (message.length > 4096) {
            return {
                isValid: false,
                error: 'El mensaje no puede tener más de 4096 caracteres'
            };
        }

        return {
            isValid: true,
            cleanMessage: message.trim()
        };
    };

    const validateSendMessageRequest = (body) => {
        const { number, message } = body;

        if (!number || !message) {
            return {
                isValid: false,
                error: 'Los campos "number" y "message" son requeridos'
            };
        }

        const phoneValidation = validatePhoneNumber(number);
        if (!phoneValidation.isValid) {
            return phoneValidation;
        }

        const messageValidation = validateMessage(message);
        if (!messageValidation.isValid) {
            return messageValidation;
        }

        return {
            isValid: true,
            data: {
                number: phoneValidation.cleanNumber,
                message: messageValidation.cleanMessage
            }
        };
    };

    // API pública del módulo
    return {
        validatePhoneNumber,
        validateMessage,
        validateSendMessageRequest
    };
})();

module.exports = Validator;
