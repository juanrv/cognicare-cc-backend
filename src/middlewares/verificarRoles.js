import logger from "../config/logger.js";

// Middleware para verificar si es Admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Es admin, continuar
  } else {
    logger.warn(
      `[ROLE_MW] Acceso denegado. Se requiere rol Admin. Usuario:`,
      req.user
    );
    res
      .status(403)
      .json({ message: "Acceso denegado: Se requiere rol de Administrador." });
  }
};

// Middleware para verificar si es Entrenador
export const isEntrenador = (req, res, next) => {
  if (req.user && req.user.role === "entrenador") {
    next(); // Es entrenador, continuar
  } else {
    logger.warn(
      `[ROLE_MW] Acceso denegado. Se requiere rol Entrenador. Usuario:`,
      req.user
    );
    res
      .status(403)
      .json({ message: "Acceso denegado: Se requiere rol de Entrenador." });
  }
};
