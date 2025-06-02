import pool from "../config/db.js";
import logger from "../config/logger.js";
import * as EntrenadorModel from "../models/entrenador.model.js";

/**
 * @file Contiene los servicios del administración
 * /

/**
 * Servicio para registrar un nuevo entrenador.
 * Llama al modelo de entrenador para interactuar con la base de datos.
 * @async
 * @param {object} datosParaRegistrar - Datos del entrenador a registrar. Ver parámetros en EntrenadorModel.registrar.
 * @returns {Promise<object>} Objeto indicando éxito o fallo, y los datos del entrenador si es exitoso.
 * @throws {Error} Si ocurre un error durante el proceso en la capa del modelo.
 */
export const registrarEntrenador = async (datosParaRegistrar) => {
  logger.debug(
    "[SERVICIO_ADMIN] Solicitud para registrar nuevo entrenador recibida con datos: %o",
    datosParaRegistrar
  );
  try {
    // Llamar a la función del modelo
    const resultadoDelModelo = await EntrenadorModel.registrar(
      datosParaRegistrar
    );

    if (resultadoDelModelo) {
      // resultadoDelModelo es el objeto { mensaje, identrenador, detalles }
      logger.info(
        "[SERVICIO_ADMIN] Entrenador registrado exitosamente a través del modelo.",
        { data: resultadoDelModelo }
      );
      return { success: true, data: resultadoDelModelo };
    } else {
      // Esto pasaría si el modelo devuelve null (ej. la función DB no devuelve filas)
      logger.warn(
        "[SERVICIO_ADMIN] El modelo de entrenador no devolvió un resultado para el registro."
      );
      return {
        success: false,
        message:
          "No se pudo completar el registro del entrenador, la operación en base de datos no arrojó resultados.",
      };
    }
  } catch (error) {
    logger.error(
      "[SERVICIO_ADMIN] Error en el servicio al registrar entrenador:",
      error
    );
    // Re-lanzamos el error para que el controlador lo maneje
    throw error;
  }
};

/**
 * Servicio para obtener la lista de entrenadores, con opción de aplicar filtros.
 * @async
 * @param {object} [filtrosDeUrl={}] - Objeto opcional con los filtros provenientes de la URL.
 * @param {string} [filtrosDeUrl.nombreFacultad] - Nombre de la facultad para filtrar.
 * @returns {Promise<object>} Objeto indicando éxito y los datos de los entrenadores.
 * @throws {Error} Si ocurre un error.
 */
export const obtenerListaCompletaEntrenadores = async (filtrosDeUrl = {}) => {
  logger.debug('[SERVICIO_ADMIN] Solicitud para obtener lista de entrenadores con filtros: %o', filtrosDeUrl);
  
  // Aquí podrías hacer validaciones o transformaciones de los filtros si fueran más complejos.
  // Por ahora, pasamos el filtro de facultad directamente si existe.
  const filtrosParaModelo = {};
  if (filtrosDeUrl.nombreFacultad) {
    filtrosParaModelo.nombreFacultad = filtrosDeUrl.nombreFacultad;
  }

  try {
    const listaEntrenadores = await EntrenadorModel.obtenerTodos(filtrosParaModelo);

    logger.info(`[SERVICIO_ADMIN] Se obtuvo lista con ${listaEntrenadores.length} entrenadores (con filtros).`);
    return { success: true, data: listaEntrenadores };
  } catch (error) {
    logger.error('[SERVICIO_ADMIN] Error en servicio al obtener lista de entrenadores (con filtros):', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};

/**
 * Servicio para modificar la información de un entrenador existente.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a modificar.
 * @param {object} datosAActualizar - Campos con los nuevos valores.
 * @returns {Promise<object>} Objeto indicando éxito o fallo, y los datos actualizados.
 * @throws {Error} Si ocurre un error durante el proceso, incluyendo si el entrenador no se encuentra.
 */
export const modificarInformacionEntrenador = async (entrenadorID, datosAActualizar) => {
  logger.debug('[SERVICIO_ADMIN] Solicitud para modificar entrenador ID: %s, Datos a actualizar: %o',entrenadorID,datosAActualizar);
  try {
    const resultadoDelModelo = await EntrenadorModel.actualizar(entrenadorID, datosAActualizar);

    if (!resultadoDelModelo) {
      logger.warn('[SERVICIO_ADMIN] El modelo no devolvió resultado para la modificación del entrenador ID: %s', entrenadorID);
      throw Object.assign(new Error('No se pudo completar la modificación del entrenador, la operación no produjo resultado.'), { statusCode: 500 });
    }

    // Si el mensaje de la BD indica un error "controlado" (ej. "Entrenador no encontrado" que ahora lanza la propia func DB)
    // La capa del modelo ya lo relanzó y el catch de abajo lo tomará.
    // Si el mensaje es de éxito o "no hubo cambios", el `entrenadorid` debería estar presente.
    if (resultadoDelModelo.mensaje && resultadoDelModelo.mensaje.toLowerCase().includes('error')) {
      logger.warn(`[SERVICIO_ADMIN] La función de BD indicó un problema al modificar entrenador: ${resultadoDelModelo.mensaje}`);
      throw Object.assign(new Error(resultadoDelModelo.mensaje), { statusCode: 400, details: resultadoDelModelo.detalles });
    }

    if (!resultadoDelModelo.entrenadorid && !(resultadoDelModelo.mensaje && resultadoDelModelo.mensaje.toLowerCase().includes('no se especificaron cambios'))) {
        logger.warn('[SERVICIO_ADMIN] Modificación de entrenador no confirmó ID, posible problema no capturado.', { resultadoDelModelo });
        throw Object.assign(new Error(resultadoDelModelo.mensaje || 'La modificación no confirmó la actualización del entrenador.'), { statusCode: 400 });
    }

    logger.info('[SERVICIO_ADMIN] Información de entrenador modificada exitosamente.', { data: resultadoDelModelo });
    return { success: true, data: resultadoDelModelo };

  } catch (error) {
    logger.error('[SERVICIO_ADMIN] Error en servicio al modificar entrenador:', error);
    if (!error.statusCode) {
      // Si el error de la BD es "Entrenador con ID % no encontrado."
      if (error.message && error.message.toLowerCase().includes('no encontrado')) {
        error.statusCode = 404; 
      } else {
        error.statusCode = 500; // Error genérico del servidor
      }
    }
    throw error;
  }
};