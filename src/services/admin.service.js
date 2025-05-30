import pool from "../config/db.js";
import logger from "../config/logger.js";

/**
 * Registra un nuevo entrenador utilizando la función de base de datos.
 * @param {object} entrenadorData - Datos del entrenador a registrar.
 * @param {string} entrenadorData.pSiglaTipoDocumento - Sigla del tipo de documento.
 * @param {string} entrenadorData.pNombres - Nombres del entrenador.
 * @param {string} entrenadorData.pApellidos - Apellidos del entrenador.
 * @param {string} entrenadorData.pNumeroDocumento - Número de documento.
 * @param {string} entrenadorData.pCorreo - Correo electrónico.
 * @param {string[]} entrenadorData.pFacultadNombres - Array con nombres de las facultades.
 * @param {string} [entrenadorData.pFechaFin] - Fecha de fin del contrato (opcional, formato YYYY-MM-DD).
 * @returns {Promise<object>} El resultado de la función de base de datos.
 */
export const registrarEntrenador = async (entrenadorData) => {
  const {
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pFacultadNombres,
    pFechaFin = null,
  } = entrenadorData;
  logger.debug(
    "[SERVICE] Intentando registrar nuevo entrenador con datos:",
    entrenadorData
  );

  // La función de base de datos espera un array de parámetros en el orden correcto
  const queryParams = [
    pSiglaTipoDocumento,
    pNombres,
    pApellidos,
    pNumeroDocumento,
    pCorreo,
    pFacultadNombres, // PG lo interpreta como un array de texto
  ];

  let queryString =
    "SELECT * FROM CC.registrarEntrenadorUFT($1, $2, $3, $4, $5, $6";
  if (pFechaFin) {
    queryParams.push(pFechaFin);
    queryString += ", $7";
  }
  queryString += ");";
  try {
    logger.debug(
      `[SERVICE] Ejecutando query: ${queryString} con params: %o`,
      queryParams
    );
    const result = await pool.query(queryString, queryParams);
    logger.debug("[SERVICE] Resultado de la consulta: %o", result.rows);

    if (result.rows.length > 0) {
      logger.info(
        "[SERVICE] Entrenador registrado exitosamente a través de la BD."
      );
      logger.debug(
        "[SERVICE] Data de la primera fila (result.rows[0]): %o",
        result.rows[0]
      );
      // La función DB devuelve una tabla, tomamos la primera fila.
      return { success: true, data: result.rows[0] };
    } else {
      // Esto no debería pasar si la función DB siempre devuelve una fila con un mensaje.
      // Pero es bueno tener un fallback.
      logger.warn(
        "[SERVICE] La función RegistrarEntrenadorUFT no devolvió filas.",
        { queryParams }
      );
      return {
        success: false,
        message:
          "No se pudo registrar al entrenador, la función no devolvió resultado.",
      };
    }
  } catch (error) {
    logger.error(
      "[SERVICE] Error al registrar entrenador en la BD:",
      error
    );
    // Podríamos querer devolver un mensaje más amigable o el mensaje del error de la BD
    throw error; // Re-lanzamos el error para que el controlador lo maneje
  }
};
