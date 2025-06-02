import { Router } from "express";
import { param } from "express-validator";
import { listarTodosLosEntrenadores, registrarEntrenador, actualizarInformacionEntrenador } from "../controllers/admin.controller.js";
import { verificarToken } from "../middlewares/verificarToken.js";
import { isAdmin } from "../middlewares/verificarRoles.js";
import { validacionesRegistroEntrenador, validacionesActualizarEntrenador } from "../validators/admin.validators.js";

// Enrutador de Express
const router = Router();

// POST /api/admin/entrenadores - Para registrar un nuevo entrenador
// Protegido: Solo admins autenticados pueden acceder
router.post("/entrenadores", verificarToken, isAdmin, validacionesRegistroEntrenador, registrarEntrenador);

// GET /api/admin/entrenadores - Para listar todos los entrenadores
router.get("/entrenadores", verificarToken, isAdmin, listarTodosLosEntrenadores);

// PUT /api/admin/entrenadores/:entrenadorID - Actualizar información de un entrenador
router.put(
  '/entrenadores/:entrenadorID', // <-- Ruta ahora incluye el ID
  verificarToken,
  isAdmin,
  [ // Array de validaciones: primero el parámetro de la URL, luego el cuerpo
    param('entrenadorID').isUUID().withMessage('El ID del entrenador en la URL debe ser un UUID válido.'),
    ...validacionesActualizarEntrenador // Desestructuramos las validaciones del cuerpo
  ],
  actualizarInformacionEntrenador
);

export default router;
