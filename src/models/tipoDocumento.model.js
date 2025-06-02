import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para la entidad TipoDocumento.
 */

/**
 * Obtiene todos los tipos de documento de la base de datos.
 * Ordena por nombre del tipo de documento.
 * @async
 * @returns {Promise<Array<object>>} Un array de objetos, donde cada objeto representa un tipo de documento
 * (con id, sigla, nombre). Devuelve un array vacío si no hay tipos de documento.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const obtenerTodos = async () => {
  const queryString = 'SELECT id, sigla, nombre FROM CC.ListarTiposDocumentoUV;';

  logger.debug('[MODELO_TIPO_DOCUMENTO] Ejecutando obtenerTodos con query: %s', queryString);
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_TIPO_DOCUMENTO] Se encontraron ${rows.length} tipos de documento.`);
    // No es necesario loguear todos los datos aquí si son muchos, a menos que sea para depuración intensa.
    // logger.debug('[MODELO_TIPO_DOCUMENTO] Datos de tipos de documento: %o', rows);
    return rows;
  } catch (error) {
    logger.error('[MODELO_TIPO_DOCUMENTO] Error al listar todos los tipos de documento desde la BD:', error);
    throw error;
  }
};