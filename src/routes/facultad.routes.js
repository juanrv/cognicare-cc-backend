import { Router } from 'express';
import { obtenerFacultades } from '../controllers/facultad.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = Router();

// GET /api/facultades - Para listar todas las facultades
// Protegido: Solo usuarios autenticados pueden acceder
router.get(
  '/', // La ruta base será /api/facultades
  verificarToken,
  obtenerFacultades
);

export default router;