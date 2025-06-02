import * as FacultadModel from '../models/facultad.model.js';
import logger from '../config/logger.js';

/**
 * @file Contiene los servicios relacionados con las Facultades.
 */

/**
 * Servicio para obtener la lista completa de todas las facultades.
 * @async
 * @returns {Promise<object>} Objeto indicando éxito y los datos de las facultades.
 * @throws {Error} Si ocurre un error.
 */
export const listarFacultades = async () => {
  logger.debug('[SERVICIO_FACULTAD] Solicitud para obtener todas las facultades.');
  try {
    const listaFacultades = await FacultadModel.obtenerTodas();
    logger.info(`[SERVICIO_FACULTAD] Se obtuvo la lista con ${listaFacultades.length} facultades.`);
    return { success: true, data: listaFacultades };
  } catch (error) {
    logger.error('[SERVICIO_FACULTAD] Error en el servicio al obtener la lista de facultades:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};