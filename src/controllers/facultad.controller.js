import * as FacultadService from '../services/facultad.service.js';
import logger from '../config/logger.js';

/**
 * @file Controladores para las funcionalidades relacionadas con Facultades.
 */

/**
 * Controlador para listar todas las facultades.
 * @async
 */
export const obtenerFacultades = async (req, res, next) => {
  logger.info('[CTRL_FACULTAD] Petición recibida para listar todas las facultades.');
  try {
    const serviceResult = await FacultadService.listarFacultades();
    if (serviceResult.success) {
      logger.info(`[CTRL_FACULTAD] Listado de ${serviceResult.data.length} facultades obtenido exitosamente.`);
      return res.status(200).json({
        message: 'Facultades obtenidas exitosamente.',
        total: serviceResult.data.length,
        facultades: serviceResult.data
      });
    } else {
      logger.warn('[CTRL_FACULTAD] Fallo al listar facultades (vía servicio).', { message: serviceResult.message });
      return res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo obtener la lista de facultades.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL_FACULTAD] Error en obtenerFacultades:', error);
    next(error);
  }
};