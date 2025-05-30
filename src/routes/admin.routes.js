import { Router } from 'express';
import { registrarEntrenador } from '../controllers/admin.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { isAdmin } from '../middlewares/verificarRoles.js';

// Enrutador de Express 
const router = Router();

// POST /api/admin/entrenadores - Para registrar un nuevo entrenador
// Protegido: Solo admins autenticados pueden acceder
router.post('/entrenadores', verificarToken, isAdmin, registrarEntrenador);

// Aquí puedes añadir más rutas para administración en el futuro
// EJ: GET /entrenadores, PUT /entrenadores/:id, etc.

export default router;