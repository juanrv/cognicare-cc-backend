import pool from '../config/db.js';
import logger from '../config/logger.js';

/**
 * @file Contiene las funciones de acceso a datos para la entidad Entrenador.
 */

/**
 * Registra un nuevo entrenador en la base de datos utilizando la función PL/pgSQL.
 * @async
 * @param {object} datosEntrenador - Datos del entrenador a registrar.
 * @param {string} datosEntrenador.pSiglaTipoDocumento - Sigla del tipo de documento.
 * @param {string} datosEntrenador.pNombres - Nombres del entrenador.
 * @param {string} datosEntrenador.pApellidos - Apellidos del entrenador.
 * @param {string} datosEntrenador.pNumeroDocumento - Número de documento.
 * @param {string} datosEntrenador.pCorreo - Correo electrónico.
 * @param {string[]} datosEntrenador.pFacultadNombres - Array con nombres de las facultades.
 * @param {string} [datosEntrenador.pFechaFin] - Fecha de fin del contrato (opcional, formato YYYY-MM-DD).
 * @returns {Promise<object|null>} La primera fila del resultado de la función de base de datos
 * (que contiene mensaje, identrenador, detalles), o null si no hay resultado.
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */
export const registrar = async (datosEntrenador) => {
  const {
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pFacultadNombres,
    pFechaFin,
  } = datosEntrenador;

  const queryParams = [
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pFacultadNombres,
  ];

  // Construimos la query dinámicamente para el parámetro opcional pFechaFin
  let queryString = `SELECT * FROM CC.RegistrarEntrenadorUFT($1, $2, $3, $4, $5, $6`;
  if (pFechaFin !== undefined && pFechaFin !== null) { // Asegurarse de que si viene, se incluya
    queryParams.push(pFechaFin);
    queryString += `, $${queryParams.length}`; // El placeholder será $7 si pFechaFin está presente
  }
  queryString += ');';

  logger.debug('[MODELO_ENTRENADOR] Ejecutando registrar con query: %s y params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    
    logger.debug('[MODELO_ENTRENADOR] Filas devueltas por la función de BD: %o', rows);

    if (rows.length > 0) {
      // La función de BD devuelve una tabla, tomamos la primera fila.
      logger.info('[MODELO_ENTRENADOR] Entrenador procesado por función DB, resultado: %o', rows[0]);
      return rows[0]; 
    }
    logger.warn('[MODELO_ENTRENADOR] La función RegistrarEntrenadorUFT no devolvió filas.');
    return null; // Indica que la función DB no devolvió datos, el servicio lo manejará.
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al ejecutar RegistrarEntrenadorUFT en la BD:', error);
    throw error; // Re-lanzamos el error para que la capa de servicio lo maneje
  }
};

// Aquí irían otras funciones del modelo para Entrenador: findById, findAll, update, delete, etc.