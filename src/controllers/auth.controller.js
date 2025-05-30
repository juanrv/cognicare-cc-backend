import * as AuthService from "../services/auth.service.js";
import logger from "../config/logger.js";

// Login para Administrador
export const loginAdmin = async (req, res, next) => {
  logger.info("[CTRL] Petición recibida en loginAdmin ---", {
    body: req.body,
  });
  const { numeroDocumento } = req.body;

  if (!numeroDocumento) {
    logger.warn("[CTRL] Error 400: Número de documento no proporcionado.");
    return res.status(400).json({ message: "Número de documento requerido." });
  }

  try {
    const authResult = await AuthService.autenticarAdmin(numeroDocumento);
    if (authResult.success) {
      logger.info("[CTRL] Login Admin exitoso (vía servicio).", {
        adminId: authResult.user.id,
      });
      res.json(authResult);
    } else {
      logger.warn("[CTRL] Login Admin fallido (vía servicio).", {
        reason: authResult.message,
      });
      res.status(401).json({ success: false, message: authResult.message });
    }
  } catch (error) {
    logger.error("[ERROR_CTRL] Error en loginAdmin:", error);
    next(error); // Pasa el error al manejador de errores global
  }
};

// Login para Entrenador
export const loginEntrenador = async (req, res, next) => {
  logger.info("[CTRL] Petición recibida en loginTrainer ---", {
    body: req.body,
  });
  const { correo, numeroDocumento } = req.body;

  if (!correo || !numeroDocumento) {
    logger.warn("[CTRL] Error 400 Entrenador: Faltan datos.");
    return res
      .status(400)
      .json({ message: "Correo y número de documento requeridos." });
  }

  try {
    const authResult = await AuthService.autenticarEntrenador(
      correo,
      numeroDocumento
    );
    if (authResult.success) {
      logger.info("[CTRL] Login Entrenador exitoso (vía servicio).", {
        trainerId: authResult.user.id,
      });
      res.json(authResult);
    } else {
      logger.warn("[CTRL] Login Entrenador fallido (vía servicio).", {
        reason: authResult.message,
      });
      res.status(401).json({ success: false, message: authResult.message });
    }
  } catch (error) {
    logger.error("[ERROR_CTRL] Error en loginTrainer:", error);
    next(error); // Pasa el error al manejador de errores global
  }
};
