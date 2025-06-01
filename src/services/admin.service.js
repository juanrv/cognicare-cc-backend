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
  logger.debug('[SERVICIO_ADMIN] Solicitud para registrar nuevo entrenador recibida con datos: %o', datosParaRegistrar);
  try {
    // Llamar a la función del modelo
    const resultadoDelModelo = await EntrenadorModel.registrar(datosParaRegistrar);

    if (resultadoDelModelo) {
      // resultadoDelModelo es el objeto { mensaje, identrenador, detalles }
      logger.info('[SERVICIO_ADMIN] Entrenador registrado exitosamente a través del modelo.', { data: resultadoDelModelo });
      return { success: true, data: resultadoDelModelo };
    } else {
      // Esto pasaría si el modelo devuelve null (ej. la función DB no devuelve filas)
      logger.warn('[SERVICIO_ADMIN] El modelo de entrenador no devolvió un resultado para el registro.');
      return { success: false, message: 'No se pudo completar el registro del entrenador, la operación en base de datos no arrojó resultados.' };
    }
  } catch (error) {
    logger.error('[SERVICIO_ADMIN] Error en el servicio al registrar entrenador:', error);
    // El error ya fue logueado en el modelo. Aquí podríamos:
    // 1. Re-lanzar el error para que el controlador lo maneje como un 500 genérico.
    // 2. Devolver un objeto de error específico del servicio.
    // Por ahora, re-lanzamos para mantener el comportamiento anterior del controlador.
    throw error;
  }
};