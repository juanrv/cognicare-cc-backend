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

/**
 * Obtiene los entrenadores con sus facultades asignadas, con opción de filtrar por nombre de facultad.
 * Ordena por apellidos y luego por nombres.
 * @async
 * @param {object} [filtros={}] - Objeto opcional con los filtros a aplicar.
 * @param {string} [filtros.nombreFacultad] - Nombre de la facultad por la cual filtrar.
 * @returns {Promise<Array<object>>} Un array de objetos de entrenadores.
 * @throws {Error} Si ocurre un error durante la consulta.
 */
export const obtenerTodos = async (filtros = {}) => {
  let queryString = 'SELECT * FROM CC.DetalleEntrenadoresFacultadesUV';
  const queryParams = [];
  const condicionesWhere = [];

  if (filtros.nombreFacultad) {
    queryParams.push(filtros.nombreFacultad);
    // Usamos $N para el placeholder y lo añadimos al array de parámetros
    condicionesWhere.push(`$${queryParams.length} = ANY(facultadesAsignadas)`);
    logger.debug('[MODELO_ENTRENADOR] Aplicando filtro: facultadNombre = %s', filtros.nombreFacultad);
  }

  if (condicionesWhere.length > 0) {
    queryString += ` WHERE ${condicionesWhere.join(' AND ')}`;
  }

  queryString += ' ORDER BY apellidosEntrenador, nombresEntrenador;';
  
  logger.debug('[MODELO_ENTRENADOR] Ejecutando obtenerTodos con query: %s, params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    logger.info(`[MODELO_ENTRENADOR] Se encontraron ${rows.length} entrenadores (con filtros aplicados).`);
    logger.debug('[MODELO_ENTRENADOR] Datos de entrenadores listados (filtrados): %o', rows);
    return rows;
  } catch (error) {
    logger.error('[MODELO_ENTRENADOR] Error al listar entrenadores (filtrados) desde la BD:', error);
    throw error;
  }
};


/**
 * Actualiza la información de un entrenador existente utilizando la función PL/pgSQL.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a modificar.
 * @param {object} datosAActualizar - Campos a actualizar.
 * @param {string} [datosAActualizar.pNuevosNombres]
 * @param {string} [datosAActualizar.pNuevosApellidos]
 * @param {string} [datosAActualizar.pNuevoCorreo]
 * @param {Date|string|null} [datosAActualizar.pNuevaFechaFin]
 * @param {string[]|null} [datosAActualizar.pNuevosNombresFacultades]
 * @returns {Promise<object|null>} La primera fila del resultado de la función de base de datos.
 * @throws {Error} Si ocurre un error durante la consulta, o si el entrenador no se encuentra.
 */
export const actualizar = async (entrenadorID, datosAActualizar) => {
  const {
    pNuevosNombres,
    pNuevosApellidos,
    pNuevoCorreo,
    pNuevaFechaFin,
    pNuevosNombresFacultades,
  } = datosAActualizar;

  const queryParams = [
    entrenadorID,               // $1
    pNuevosNombres,             // $2
    pNuevosApellidos,           // $3
    pNuevoCorreo,               // $4
    pNuevaFechaFin,             // $5
    pNuevosNombresFacultades,   // $6
  ];

  // Query para llamar a la función de BD ModificarInformacionEntrenadorUFT creadi de forma dinámica
  const queryString = 'SELECT * FROM CC.ModificarInformacionEntrenadorUFT($1, $2, $3, $4, $5, $6);';

  logger.debug('[MODELO_ENTRENADOR] Ejecutando actualizar con query: %s y params: %o', queryString, queryParams);
  try {
    const { rows } = await pool.query(queryString, queryParams);
    logger.debug('[MODELO_ENTRENADOR] Filas devueltas por ModificarInformacionEntrenadorUFT: %o', rows);
    if (rows.length > 0) {
      logger.info('[MODELO_ENTRENADOR] Información de entrenador actualizada vía DB función, resultado: %o', rows[0]);
      return rows[0];
    }
    logger.warn('[MODELO_ENTRENADOR] La función ModificarInformacionEntrenadorUFT no devolvió filas (inesperado).');
    return null;
  } catch (error) {
    // La función de BD ahora lanza "Entrenador con ID % no encontrado." si no existe.
    logger.error('[MODELO_ENTRENADOR] Error al ejecutar ModificarInformacionEntrenadorUFT en la BD:', error);
    throw error;
  }
};