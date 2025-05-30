import { Router } from "express";
import { loginAdmin, loginEntrenador } from "../controllers/auth.controller.js";

// Enrutador de Express
const router = Router();

// Definimos las rutas y les asignamos su controlador
router.post("/login/admin", loginAdmin);
router.post("/login/entrenador", loginEntrenador);

// Exportamos el enrutador para usarlo en el servidor principal
export default router;
