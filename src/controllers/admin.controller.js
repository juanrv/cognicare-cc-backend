import * as AdminService from '../services/admin.service.js';
import logger from '../config/logger.js';
import { checkCamposRequeridos, checkArrayNoVacio } from '../utils/validaciones.utils.js';

export const registrarEntrenador = async (req, res, next) => {
  logger.info('[CTRL] Petición recibida para registrar nuevo entrenador.', { body: req.body });

  // Definir los campos requeridos para el registro de un entrenador
  const camposRequeridosEntrenador = [
    'siglaTipoDocumento',
    'nombres',
    'apellidos',
    'numeroDocumento',
    'correo',
    'facultadNombres' // Para 'facultadNombres', haremos una validación adicional de que sea un array no vacío
  ];

  // Llamada a la función de validación
  const resultadoValidacion = checkCamposRequeridos(req.body, camposRequeridosEntrenador);

  if (!resultadoValidacion.isValid) {
    logger.warn(`[CTRL] Validación de campos requeridos fallida: ${resultadoValidacion.message}`, { body: req.body, missing: resultadoValidacion.missingFields });
    return res.status(400).json({ message: resultadoValidacion.message, missingFields: resultadoValidacion.missingFields });
  }

  // Validar que 'facultadNombres' sea un array no vacío
  const arrayValidationResult = checkArrayNoVacio(req.body, 'facultadNombres');

  if (!arrayValidationResult.isValid) {
    logger.warn(`[CTRL] Validación de 'facultadNombres' fallida: ${arrayValidationResult.message}`, { facultadNombres: req.body.facultadNombres });
    return res.status(400).json({ message: arrayValidationResult.message });
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
      pFechaFin: fechaFin,
    };

    const serviceResult = await AdminService.registrarEntrenador(entrenadorData);

    if (serviceResult.success && serviceResult.data) {
      logger.info('[CTRL] Entrenador registrado exitosamente (vía servicio).', { entrenadorId: serviceResult.data.identrenador });
      logger.debug('[CTRL] Datos del servicio (serviceResult.data): %o', serviceResult.data);
      res.status(201).json({
        message: serviceResult.data.mensaje || 'Entrenador registrado exitosamente.',
        entrenadorId: serviceResult.data.identrenador,
        details: serviceResult.data.detalles
      });
    } else {
      logger.warn('[CTRL] Fallo al registrar entrenador (vía servicio).', { message: serviceResult.message });
      res.status(serviceResult.statusCode || 400).json({ message: serviceResult.message || 'No se pudo registrar al entrenador.' });
    }
  } catch (error) {
    logger.error('[ERROR_CTRL] Error en registrarEntrenador:', error);
    // Aquí podríamos querer un mensaje de error más genérico para el cliente
    res.status(error.statusCode || 500).json({ message: error.message || 'Error interno del servidor al registrar entrenador.' });
  }
};