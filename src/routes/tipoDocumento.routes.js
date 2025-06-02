import { Router } from 'express';
import { obtenerTiposDocumento } from '../controllers/tipoDocumento.controller.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = Router();

// GET /api/tipos-documento - Para listar todos los tipos de documento
// Protegido: Solo usuarios autenticados pueden acceder
router.get(
  '/', // La ruta base será /api/tipos-documento (definida en index.js)
  verificarToken, // Solo requiere estar logueado, no un rol específico
  obtenerTiposDocumento
);

export default router;