import { body } from 'express-validator';

// Validaciones para el endpoint de registrar un nuevo entrenador
export const validacionesRegistroEntrenador = [
  body('siglaTipoDocumento')
    .trim()
    .notEmpty().withMessage('La sigla del tipo de documento es requerida.')
    .isLength({ min: 2, max: 5 }).withMessage('La sigla debe tener entre 2 y 5 caracteres.'),
  body('nombres')
    .trim()
    .notEmpty().withMessage('Los nombres son requeridos.')
    .isString().withMessage('Los nombres deben ser texto.')
    .isLength({ min: 2 }).withMessage('Los nombres deben tener al menos 2 caracteres.'),
  body('apellidos')
    .trim()
    .notEmpty().withMessage('Los apellidos son requeridos.')
    .isString().withMessage('Los apellidos deben ser texto.')
    .isLength({ min: 2 }).withMessage('Los apellidos deben tener al menos 2 caracteres.'),
  body('numeroDocumento')
    .trim()
    .notEmpty().withMessage('El número de documento es requerido.')
    .isAlphanumeric('es-ES', { ignore: ' ' }).withMessage('El número de documento solo puede contener números y letras.'),
  body('correo')
    .trim()
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail(),
  body('facultadNombres')
    .isArray({ min: 1 }).withMessage('Se requiere al menos una facultad y debe ser un array.')
    .custom((value) => {
      if (!value.every(item => typeof item === 'string' && item.trim() !== '')) {
        throw new Error('Cada nombre de facultad en el array debe ser un texto no vacío.');
      }
      return true;
    }),
  body('fechaFin')
    .optional()
    .isISO8601().withMessage('La fecha de fin debe tener formato YYYY-MM-DD.')
    .toDate(),
];

// Aquí podrías añadir otras validaciones para otras rutas de admin
// export const validacionesActualizarEntrenador = [ ... ];