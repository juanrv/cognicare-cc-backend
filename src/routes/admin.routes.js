import { Router } from "express";
import { param } from "express-validator";
import { listarTodosLosEntrenadores, registrarEntrenador, actualizarInformacionEntrenador, desactivarEntrenador } from "../controllers/admin.controller.js";
import { verificarToken } from "../middlewares/verificarToken.js";
import { isAdmin } from "../middlewares/verificarRoles.js";
import { validacionesRegistroEntrenador, validacionesCompletasActualizarEntrenador, validacionesDesactivarEntrenador} from "../validators/admin.validators.js";
import { manejarResultadosValidacion } from "../middlewares/validation.middleware.js";

// Enrutador de Express
const router = Router();

// POST /api/admin/entrenadores - Para registrar un nuevo entrenador
// Protegido: Solo admins autenticados pueden acceder
router.post("/entrenadores", verificarToken, isAdmin, validacionesRegistroEntrenador, manejarResultadosValidacion, registrarEntrenador);

// GET /api/admin/entrenadores - Para listar todos los entrenadores
// Protegido: Solo admins autenticados pueden acceder
router.get("/entrenadores", verificarToken, isAdmin, listarTodosLosEntrenadores);

// PUT /api/admin/entrenadores/:entrenadorID - Actualizar información de un entrenador
// Protegido: Solo admins autenticados pueden acceder
router.put('/entrenadores/:entrenadorID', verificarToken, isAdmin, validacionesCompletasActualizarEntrenador, manejarResultadosValidacion, actualizarInformacionEntrenador);

// PUT /api/admin/entrenadores/:entrenadorID/desactivar - Para desactivar un entrenador
// Protegido: Solo admins autenticados pueden acceder
router.put('/entrenadores/:entrenadorID/desactivar', verificarToken, isAdmin, validacionesDesactivarEntrenador, manejarResultadosValidacion, desactivarEntrenador);

export default router;
