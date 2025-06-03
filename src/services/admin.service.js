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
 * @param {object} datosParaRegistrar - Datos del entrenador a registrar.
 * @returns {Promise<object>} Objeto indicando éxito o fallo, y los datos del entrenador si es exitoso.
 * @throws {Error} Si ocurre un error durante el proceso, incluyendo violaciones de unicidad.
 */
export const registrarEntrenador = async (datosParaRegistrar) => {
  logger.debug('[SERVICIO_ADMIN] Solicitud para registrar nuevo entrenador recibida con datos: %o', datosParaRegistrar);
  try {
    const resultadoDelModelo = await EntrenadorModel.registrar(datosParaRegistrar);

    if (!resultadoDelModelo) {
      logger.warn('[SERVICIO_ADMIN] El modelo no devolvió resultado para el registro del entrenador.');
      const errServicio = new Error('No se pudo completar el registro, la operación DB no arrojó resultado.');
      errServicio.statusCode = 500; // Falla inesperada
      throw errServicio;
    }

   
    if (resultadoDelModelo.mensaje && resultadoDelModelo.mensaje.toLowerCase().includes('error de unicidad')) {
        // Este bloque es por si la función DB maneja el error y devuelve un mensaje en lugar de RAISERROR
        logger.warn(`[SERVICIO_ADMIN] La función de BD devolvió un mensaje de "error de unicidad": ${resultadoDelModelo.mensaje}`);
        const errCliente = new Error(resultadoDelModelo.hint || 'Ya existe un entrenador con ese tipo y número de documento, o con ese correo electrónico.');
        errCliente.statusCode = 409; // Conflicto
        throw errCliente;
    }
    
    
    if (!resultadoDelModelo.identrenador && !(resultadoDelModelo.mensaje && resultadoDelModelo.mensaje.toLowerCase().includes('no se especificaron cambios'))) {
        logger.warn('[SERVICIO_ADMIN] Registro no confirmó ID de entrenador, posible problema.', { resultadoDelModelo });
        const errInesperado = new Error(resultadoDelModelo.mensaje || 'El registro no confirmó la creación del entrenador.');
        errInesperado.statusCode = 400; // O 500
        throw errInesperado;
    }

    logger.info('[SERVICIO_ADMIN] Entrenador registrado exitosamente a través del modelo.', { data: resultadoDelModelo });
    return { success: true, data: resultadoDelModelo };

  } catch (error) { // Catch para errores lanzados por el modelo o por los 'throw' de este 'try'
    // Si el error ya tiene un statusCode, confiamos en él.
    if (error.statusCode) {
      logger.warn(`[SERVICIO_ADMIN] Propagando error con statusCode ${error.statusCode}: ${error.message}`);
      throw error; // Relanzar tal cual para que el controlador lo pase a next()
    }

    // Si el error NO tiene statusCode, intentamos identificarlo (viene crudo del modelo/DB)
    // Principalmente para el caso de unique_violation (23505) o el mensaje de RAISE EXCEPTION de la BD
    if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('error de unicidad'))) {
      let mensajeAmigable = error.hint || 'Ya existe un entrenador con ese tipo y número de documento, o con ese correo electrónico.';
      // El mensaje de error.message de la BD ya es bastante descriptivo, el hint lo mejora.
      if (error.message.toLowerCase().includes('error de unicidad') && error.hint) {
          mensajeAmigable = error.hint;
      } else if (error.message.toLowerCase().includes('error de unicidad')) {
          // Si no hay hint, pero el mensaje de error principal es el de unicidad.
          mensajeAmigable = error.message;
      }

      const errCliente = new Error(mensajeAmigable);
      errCliente.statusCode = 409; // Conflicto
      logger.warn(`[SERVICIO_ADMIN] Detectada violación de unicidad. Transformando a error ${errCliente.statusCode}: ${errCliente.message}`);
      throw errCliente; // Lanzar el error de cliente con statusCode.
    }

    // Para cualquier otro error no identificado y sin statusCode previo, lo tratamos como 500.
    logger.error('[SERVICIO_ADMIN] Error inesperado (sin statusCode previo) en el servicio:', error);
    const errServidor = new Error('Ocurrió un error inesperado en el servicio al procesar el registro.');
    errServidor.statusCode = 500;
    // errServidor.originalError = error; // Puedes adjuntar el error original si quieres más info en el manejador global
    throw errServidor;
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

/**
 * Servicio para desactivar un entrenador existente.
 * @async
 * @param {string} entrenadorID - El UUID del entrenador a desactivar.
 * @returns {Promise<object>} Objeto indicando el resultado de la operación.
 * @throws {Error} Si ocurre un error durante el proceso.
 */
export const desactivarEntrenador = async (entrenadorID) => {
  logger.debug('[SERVICIO_ADMIN] Solicitud para desactivar entrenador ID: %s', entrenadorID);
  try {
    const resultadoDelModelo = await EntrenadorModel.desactivar(entrenadorID);

    if (!resultadoDelModelo) {
      logger.warn('[SERVICIO_ADMIN] El modelo no devolvió resultado para la desactivación del entrenador ID: %s', entrenadorID);
      throw Object.assign(new Error('No se pudo completar la desactivación del entrenador, la operación no produjo resultado.'), { statusCode: 500 });
    }

    // La función de BD DesactivarEntrenadorUFT devuelve { mensaje, entrenadorId, exito }
    if (!resultadoDelModelo.exito) { // Si la función DB indica que no fue exitoso (ej. no encontrado)
        logger.warn(`[SERVICIO_ADMIN] La función de BD indicó un fallo al desactivar entrenador: ${resultadoDelModelo.mensaje}`);
        // Usamos 404 si el mensaje sugiere "no encontrado", sino 400.
        const statusCode = resultadoDelModelo.mensaje.toLowerCase().includes('no encontrado') ? 404 : 400;
        throw Object.assign(new Error(resultadoDelModelo.mensaje), { statusCode });
    }
    
    logger.info('[SERVICIO_ADMIN] Entrenador desactivado exitosamente.', { data: resultadoDelModelo });
    return { success: true, message: resultadoDelModelo.mensaje, data: { entrenadorId: resultadoDelModelo.entrenadorid } };

  } catch (error) {
    logger.error('[SERVICIO_ADMIN] Error en servicio al desactivar entrenador:', error);
    if (!error.statusCode) {
        error.statusCode = 500;
    }
    throw error;
  }
};