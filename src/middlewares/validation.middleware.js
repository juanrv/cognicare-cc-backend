// src/middlewares/validation.middleware.js
import { validationResult } from 'express-validator';
import logger from '../config/logger.js';


/**
 * Middleware para manejar los resultados de las validaciones de express-validator.
 * Si hay errores de validación, responde con un 400.
 * Si no hay errores, pasa al siguiente middleware o controlador.
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
export const manejarResultadosValidacion = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    logger.warn('[MW_VALIDACION] Fallaron las validaciones de entrada.', {
      ruta: req.originalUrl,
      errores: errores.array()
    });
    return res.status(400).json({ message: "Errores de validación.", errors: errores.array() });
  }
  next(); // Pasa al siguiente middleware o al controlador
};