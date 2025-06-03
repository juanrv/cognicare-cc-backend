import { body, param } from 'express-validator'; // 'param' no se usa aquí, pero 'body' sí

/**
 * @file Define los conjuntos de reglas de validación para las rutas de administración.
 */

// Validaciones para el endpoint de registrar un nuevo entrenador
export const validacionesRegistroEntrenador = [
  body('siglaTipoDocumento')
    .trim()
    .notEmpty().withMessage('La sigla del tipo de documento es requerida.')
    .isLength({ min: 1, max: 5 }).withMessage('La sigla del tipo de documento debe tener entre 2 y 5 caracteres.'),
  body('nombres')
    .trim()
    .notEmpty().withMessage('Los nombres del entrenador son requeridos.')
    .isString().withMessage('Los nombres deben ser texto.')
    .isLength({ min: 1, max: 200 }).withMessage('Los nombres deben tener entre 2 y 200 caracteres.'),
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos del entrenador son requeridos.')
    .isString().withMessage('Los apellidos deben ser texto.')
    .isLength({ min: 1, max: 200 }).withMessage('Los apellidos deben tener entre 2 y 200 caracteres.'),
  body('numeroDocumento')
    .trim()
    .notEmpty().withMessage('El número de documento es requerido.')
    // Tu CHECK en la BD es '^[0-9]+$', así que usamos isNumeric
    .isNumeric({ no_symbols: true }).withMessage('El número de documento solo puede contener números.')
    .isLength({ min: 5, max: 20 }).withMessage('El número de documento debe tener entre 5 y 20 caracteres.'),
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo electrónico es requerido.')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail(), // Ayuda a normalizar el email (ej. a minúsculas)
  body('facultadNombres')
    .notEmpty().withMessage('Se requiere el campo de facultades.') // Asegura que el campo exista
    .isArray({ min: 1 }).withMessage('Se requiere al menos una facultad y debe ser un array con al menos un elemento.')
    .custom((value) => { // Validación personalizada para asegurar que los elementos del array no estén vacíos
      if (!value.every(item => typeof item === 'string' && item.trim() !== '')) {
        throw new Error('Cada nombre de facultad en el array debe ser un texto no vacío.');
      }
      return true;
    }),
  body('fechaFin')
    .optional({ nullable: true, checkFalsy: true }) // Hace que este campo sea opcional
    .isISO8601().withMessage('La fecha de fin debe tener formato YYYY-MM-DD.')
    .toDate() // Convierte la cadena a un objeto Date si es válida
    .custom((value, { req }) => { // Validación personalizada para fechaFin >= fechaInicio (que es CURRENT_DATE en la BD)
        if (value && value < new Date(new Date().setHours(0,0,0,0)) ) { // Compara con el inicio del día actual
            throw new Error('La fecha de fin no puede ser anterior a la fecha actual.');
        }
        return true;
    }),
];

// --- Validaciones para Actualizar Entrenador ---
// Validación para el parámetro de URL 'entrenadorID'
export const validacionParametroEntrenadorID = [
  param('entrenadorID').isUUID().withMessage('El ID del entrenador en la URL debe ser un UUID válido.')
];

// Validaciones para el cuerpo de la actualización de un entrenador
export const validacionesCuerpoActualizarEntrenador = [
  // ... (las que ya tenías: nuevosNombres, nuevosApellidos, etc. son opcionales)
  body('nuevosNombres')
    .optional({ checkFalsy: true })
    .trim()
    .isString().withMessage('Los nuevos nombres deben ser texto.')
    .isLength({ min: 2, max: 200 }).withMessage('Los nuevos nombres deben tener entre 2 y 200 caracteres.'),
  body('nuevosApellidos')
    .optional({ checkFalsy: true })
    .trim()
    .isString().withMessage('Los nuevos apellidos deben ser texto.')
    .isLength({ min: 2, max: 200 }).withMessage('Los nuevos apellidos deben tener entre 2 y 200 caracteres.'),
  body('nuevoCorreo')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('El nuevo correo debe ser un correo electrónico válido.')
    .normalizeEmail(),
  body('nuevaFechaFin')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('La nueva fecha de fin debe tener formato YYYY-MM-DD.')
    .toDate(), // Aquí también validamos la lógica de fecha en la función de BD
  body('nuevosNombresFacultades')
    .optional({ nullable: true })
    .isArray().withMessage('Las nuevas facultades deben ser un array.')
    .custom((value) => {
      if (value && value.length > 0 && !value.every(item => typeof item === 'string' && item.trim() !== '')) {
        throw new Error('Si se proporcionan facultades, cada nombre en el array debe ser un texto no vacío.');
      }
      // Tu función de BD ModificarInformacionEntrenadorUFT maneja la lógica de array vacío para quitar todas las facultades
      // o requiere al menos una si se pretende cambiar. Esta validación solo asegura el formato.
      return true;
    }),
];

// Combinamos las validaciones para la ruta de actualizar
export const validacionesCompletasActualizarEntrenador = [
  ...validacionParametroEntrenadorID,
  ...validacionesCuerpoActualizarEntrenador
];

// Para la ruta de desactivar, solo necesitamos validar el ID de la URL
export const validacionesDesactivarEntrenador = [
  ...validacionParametroEntrenadorID
];