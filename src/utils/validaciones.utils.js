import logger from '../config/logger.js'; // Opcional, si quieres loguear desde las utils

/**
 * Verifica si todos los campos requeridos están presentes y no son nulos, indefinidos o strings vacíos en el objeto.
 * @param {object} obj - El objeto a validar (ej. req.body).
 * @param {string[]} requiredFields - Un array de strings con los nombres de los campos requeridos.
 * @returns {{isValid: boolean, missingFields: string[], message?: string}}
 * Retorna un objeto indicando si la validación pasó, una lista de campos faltantes,
 * y un mensaje de error si no es válido.
 */
export const checkCamposRequeridos = (obj, requiredFields) => {
  const missingFields = [];
  if (!obj) { // Si el objeto principal es nulo o indefinido
    return {
      isValid: false,
      missingFields: [...requiredFields], // Todos los campos se consideran faltantes
      message: `El objeto de datos no fue proporcionado. Campos requeridos: ${requiredFields.join(', ')}.`
    };
  }

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    const message = `Faltan los siguientes campos requeridos o están vacíos: ${missingFields.join(', ')}.`;
    logger.debug(`[VALIDATION_UTIL] checkRequiredFields falló: ${message}`, { objectChecked: obj, required: requiredFields });
    return {
      isValid: false,
      missingFields,
      message
    };
  }

    logger.debug('[VALIDATION_UTIL] checkRequiredFields pasó exitosamente.', { objectChecked: obj, required: requiredFields });
  return { isValid: true, missingFields: [] };
};

/**
 * Verifica si un campo específico en un objeto es un array y no está vacío.
 * @param {object} obj - El objeto que contiene el campo a validar.
 * @param {string} fieldName - El nombre del campo que debe ser un array no vacío.
 * @returns {{isValid: boolean, message?: string}}
 * Retorna un objeto indicando si la validación pasó y un mensaje de error si no es válido.
 */
export const checkArrayNoVacio = (obj, fieldName) => {
  if (!obj || obj[fieldName] === undefined) {
    // Esto podría ser redundante si checkRequiredFields ya se ejecutó para este campo,
    // pero es una buena práctica para una función de utilidad independiente.
    const message = `El campo '${fieldName}' es requerido.`;
    logger.debug(`[VALIDATION_UTIL] checkArrayNotEmpty falló: ${message}`, { fieldName, objectChecked: obj });
    return { isValid: false, message };
  }

  if (!Array.isArray(obj[fieldName])) {
    const message = `El campo '${fieldName}' debe ser un array.`;
    logger.debug(`[VALIDATION_UTIL] checkArrayNotEmpty falló: ${message}`, { fieldName, type: typeof obj[fieldName] });
    return { isValid: false, message };
  }

  if (obj[fieldName].length === 0) {
    const message = `El campo '${fieldName}' no puede ser un array vacío.`;
    logger.debug(`[VALIDATION_UTIL] checkArrayNotEmpty falló: ${message}`, { fieldName });
    return { isValid: false, message };
  }

  logger.debug(`[VALIDATION_UTIL] checkArrayNotEmpty pasó para '${fieldName}'.`);
  return { isValid: true };
};