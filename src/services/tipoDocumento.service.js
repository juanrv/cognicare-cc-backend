import * as TipoDocumentoModel from '../models/tipoDocumento.model.js';
import logger from '../config/logger.js';

/**
 * @file Contiene los servicios relacionados con los tipos de documento.
 */

/**
 * Servicio para obtener la lista completa de todos los tipos de documento.
 * @async
 * @returns {Promise<object>} Objeto indicando éxito y los datos de los tipos de documento.
 * @throws {Error} Si ocurre un error durante el proceso en la capa del modelo.
 */
export const listarTiposDocumento = async () => {
  logger.debug('[SERVICIO_TIPO_DOCUMENTO] Solicitud para obtener todos los tipos de documento.');
  try {
    const listaTiposDocumento = await TipoDocumentoModel.obtenerTodos();

    logger.info(`[SERVICIO_TIPO_DOCUMENTO] Se obtuvo la lista con ${listaTiposDocumento.length} tipos de documento.`);
    return { success: true, data: listaTiposDocumento };
  } catch (error) {
    logger.error('[SERVICIO_TIPO_DOCUMENTO] Error en el servicio al obtener la lista de tipos de documento:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};