import * as AdminService from '../services/admin.service.js';
import logger from '../config/logger.js';
import { checkCamposRequeridos, checkArrayNoVacio } from '../utils/validaciones.utils.js';
import { validationResult } from 'express-validator';

/**
 * @file Controlador para manejar las funcionalidades de administración
 */

/**
 * Controlador para registrar un nuevo entrenador.
 * @async
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 */
export const registrarEntrenador = async (req, res, next) => {
  logger.info('[CTRL] Petición recibida para registrar nuevo entrenador.', { body: req.body });

  // Obtener los errores de validación de la petición
  const erroresValidacion = validationResult(req);
  if (!erroresValidacion.isEmpty()) {
    logger.warn('[CTRL_ADMIN] Fallaron las validaciones de entrada.', { errores: erroresValidacion.array() });
    return res.status(400).json({ message: "Errores de validación.", errors: erroresValidacion.array() });
  }

  const { facultadNombres, siglaTipoDocumento, nombres, apellidos, numeroDocumento, correo, fechaFin } = req.body;

  // Si todas las validaciones pasan, continuamos...
  try {
    const entrenadorData = {
      pSiglaTipoDocumento: siglaTipoDocumento,
      pNombres: nombres,
      pApellidos: apellidos,
      pNumeroDocumento: numeroDocumento,
      pCorreo: correo,
      pFacultadNombres: facultadNombres,
      pFechaFin: fechaFin ? fechaFin.toISOString().split('T')[0] : undefined,
    };

    const serviceResult = await AdminService.registrarEntrenador(entrenadorData);

    if (serviceResult.success && serviceResult.data) {
      logger.info('[CTRL] Entrenador registrado exitosamente (vía servicio).', { entrenadorId: serviceResult.data.identrenador });
      logger.debug('[CTRL] Datos del servicio (serviceResult.data): %o', serviceResult.data);
      return res.status(201).json({
        message: serviceResult.data.mensaje || 'Entrenador registrado exitosamente.',
        entrenadorId: serviceResult.data.identrenador,
        details: serviceResult.data.detalles
      });
    } else {
      logger.warn('[CTRL] Fallo al registrar entrenador (vía servicio).', { message: serviceResult.message });
      return res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo registrar al entrenador.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL_ADMIN] Error en registrarEntrenador:', error);
    // Pasamos el error al manejador de errores global de Express
    return next(error); // Es mejor pasar el error al manejador global
  }
};