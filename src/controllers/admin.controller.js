import * as AdminService from '../services/admin.service.js';
import logger from '../config/logger.js';
import { checkCamposRequeridos, checkArrayNoVacio } from '../utils/validaciones.utils.js';
import { validationResult } from 'express-validator';

/**
 * @file Controlador para manejar las funcionalidades de administración
 */

/**
 * Controlador para registrar un nuevo entrenador.
 * @async
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 */
export const registrarEntrenador = async (req, res, next) => {
  logger.info('[CTRL] Petición recibida para registrar nuevo entrenador.', { body: req.body });

  // Obtener los errores de validación de la petición
  const erroresValidacion = validationResult(req);
  if (!erroresValidacion.isEmpty()) {
    logger.warn('[CTRL_ADMIN] Fallaron las validaciones de entrada.', { errores: erroresValidacion.array() });
    return res.status(400).json({ message: "Errores de validación.", errors: erroresValidacion.array() });
  }

  const { facultadNombres, siglaTipoDocumento, nombres, apellidos, numeroDocumento, correo, fechaFin } = req.body;

  // Si todas las validaciones pasan, continuamos...
  try {
    const entrenadorData = {
      pSiglaTipoDocumento: siglaTipoDocumento,
      pNombres: nombres,
      pApellidos: apellidos,
      pNumeroDocumento: numeroDocumento,
      pCorreo: correo,
      pFacultadNombres: facultadNombres,
      pFechaFin: fechaFin ? fechaFin.toISOString().split('T')[0] : undefined,
    };

    const serviceResult = await AdminService.registrarEntrenador(entrenadorData);

    if (serviceResult.success && serviceResult.data) {
      logger.info('[CTRL] Entrenador registrado exitosamente (vía servicio).', { entrenadorId: serviceResult.data.identrenador });
      logger.debug('[CTRL] Datos del servicio (serviceResult.data): %o', serviceResult.data);
      return res.status(201).json({
        message: serviceResult.data.mensaje || 'Entrenador registrado exitosamente.',
        entrenadorId: serviceResult.data.identrenador,
        details: serviceResult.data.detalles
      });
    } else {
      logger.warn('[CTRL] Fallo al registrar entrenador (vía servicio).', { message: serviceResult.message });
      return res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo registrar al entrenador.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL_ADMIN] Error en registrarEntrenador:', error);
    // Pasamos el error al manejador de errores global de Express
    next(error); // Es mejor pasar el error al manejador global
  }
};

/**
 * Controlador para listar todos los entrenadores.
 * @async
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware (para errores).
 */
export const listarTodosLosEntrenadores = async (req, res, next) => {
  const { nombreFacultad } = req.query; 
  logger.info('[CTRL_ADMIN] Petición para listar entrenadores recibida.', { query: req.query });

  try {
    const filtrosAplicar = {};
    if (nombreFacultad) {
      filtrosAplicar.nombreFacultad = nombreFacultad;
    }

    const serviceResult = await AdminService.obtenerListaCompletaEntrenadores(filtrosAplicar);

    if (serviceResult.success) {
      logger.info(`[CTRL_ADMIN] Listado de ${serviceResult.data.length} entrenadores obtenido exitosamente.`);
      return res.status(200).json({
        message: 'Lista de entrenadores obtenida exitosamente.',
        total: serviceResult.data.length,
        filtrosAplicados: filtrosAplicar, // Devolvemos los filtros que se usaron
        entrenadores: serviceResult.data
      });
    } else {
      logger.warn('[CTRL_ADMIN] Fallo al listar entrenadores.', { message: serviceResult.message });
      return res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo obtener la lista de entrenadores.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL_ADMIN] Error en listarTodosLosEntrenadores:', error);
    next(error);
  }
};

/**
 * Controlador para actualizar la información de un entrenador.
 * @async
 * @param {object} req - Objeto de petición Express.
 * @param {object} res - Objeto de respuesta Express.
 * @param {function} next - Función para pasar al siguiente middleware (para errores).
 */

export const actualizarInformacionEntrenador = async (req, res, next) => {
  // El ID ahora viene de los parámetros de la ruta
  const { entrenadorID } = req.params; 
  logger.info(`[CTRL_ADMIN] Petición recibida para actualizar entrenador ID: ${entrenadorID}`, { body: req.body });

  const erroresValidacion = validationResult(req);
  if (!erroresValidacion.isEmpty()) {
    logger.warn('[CTRL_ADMIN] Fallaron las validaciones de entrada para actualizar entrenador.', { errores: erroresValidacion.array() });
    return res.status(400).json({ message: "Errores de validación.", errors: erroresValidacion.array() });
  }

  // Los datos a actualizar vienen del cuerpo.
  // No necesitamos siglaTipoDocumentoActual ni numeroDocumentoActual del body.
  const {
    nuevosNombres,
    nuevosApellidos,
    nuevoCorreo,
    nuevaFechaFin,
    nuevosNombresFacultades
  } = req.body;

  const datosAActualizar = { // Solo pasamos los campos que pueden cambiar
    pNuevosNombres: nuevosNombres,
    pNuevosApellidos: nuevosApellidos,
    pNuevoCorreo: nuevoCorreo,
    pNuevaFechaFin: nuevaFechaFin,
    pNuevosNombresFacultades: nuevosNombresFacultades,
  };

  // Filtrar propiedades undefined para no enviarlas al servicio si no se proveyeron
  Object.keys(datosAActualizar).forEach(key => datosAActualizar[key] === undefined && delete datosAActualizar[key]);


  if (Object.keys(datosAActualizar).length === 0) {
    logger.info('[CTRL_ADMIN] No se proporcionaron datos para actualizar para el entrenador ID: %s', entrenadorID);
    // Según la función de BD, si no se envían campos de actualización, devuelve "No se especificaron cambios..."
    // Dejaremos que el servicio y modelo lo manejen, ya que la función DB devuelve un mensaje para este caso.
    // return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
  }
  
  try {
    // Pasamos el entrenadorID y los datosAActualizar al servicio
    const serviceResult = await AdminService.modificarInformacionEntrenador(entrenadorID, datosAActualizar);

    if (serviceResult.success && serviceResult.data) {
      logger.info('[CTRL_ADMIN] Información de entrenador actualizada exitosamente.', { entrenadorId: serviceResult.data.entrenadorid });
      return res.status(200).json({
        message: serviceResult.data.mensaje || 'Información del entrenador actualizada.',
        entrenadorId: serviceResult.data.entrenadorid,
        details: serviceResult.data.detalles
      });
    } else {
      logger.warn('[CTRL_ADMIN] Fallo al actualizar entrenador (vía servicio).', { message: serviceResult.message });
      return res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo actualizar la información del entrenador.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL_ADMIN] Error en actualizarInformacionEntrenador:', error);
    next(error);
  }
};