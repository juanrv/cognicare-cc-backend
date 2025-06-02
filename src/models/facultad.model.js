import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para la entidad Facultad.
 */

/**
 * Obtiene todas las facultades de la base de datos.
 * Ordena por nombre de la facultad.
 * @async
 * @returns {Promise<Array<object>>} Un array de objetos (id, nombre).
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTodas = async () => {
  const queryString = 'SELECT id, nombre FROM CC.ListarFacultadesUV;';
  logger.debug('[MODELO_FACULTAD] Ejecutando obtenerTodas con query: %s', queryString);
  try {
    const { rows } = await pool.query(queryString);
    logger.info(`[MODELO_FACULTAD] Se encontraron ${rows.length} facultades.`);
    return rows;
  } catch (error) {
    logger.error('[MODELO_FACULTAD] Error al listar todas las facultades desde la BD:', error);
    throw error;
  }
};