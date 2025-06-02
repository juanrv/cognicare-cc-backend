import * as TipoDocumentoService from '../services/tipoDocumento.service.js';
import logger from '../config/logger.js';

/**
 * @file Controladores para las funcionalidades relacionadas con Tipos de Documento.
 */

/**
 * Controlador para listar todos los tipos de documento.
 * @async
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware (para errores).
 */
export const obtenerTiposDocumento = async (req, res, next) => {
  logger.info('[CTRL_TIPO_DOCUMENTO] Petición recibida para listar todos los tipos de documento.');

  try {
    const serviceResult = await TipoDocumentoService.listarTiposDocumento();

    if (serviceResult.success) {
      logger.info(`[CTRL_TIPO_DOCUMENTO] Listado de ${serviceResult.data.length} tipos de documento obtenido exitosamente.`);
      return res.status(200).json({
        message: 'Tipos de documento obtenidos exitosamente.',
        total: serviceResult.data.length,
        tiposDocumento: serviceResult.data
      });
    } else {
      // Este caso es menos probable si el servicio solo devuelve datos o lanza error
      logger.warn('[CTRL_TIPO_DOCUMENTO] Fallo al listar tipos de documento (vía servicio).', { message: serviceResult.message });
      return res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo obtener la lista de tipos de documento.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL_TIPO_DOCUMENTO] Error en obtenerTiposDocumento:', error);
    next(error); // Pasa el error al manejador global
  }
};