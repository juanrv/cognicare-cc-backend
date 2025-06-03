import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/secrets.js";
import logger from "../config/logger.js";

export const verificarToken = (req, res, next) => {
  // 1. Obtener el token de la cabecera 'Authorization'
  const authHeader = req.headers["authorization"];
  // Esperamos 'Bearer TOKEN_AQUI'
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Si no hay token, enviar error 401 (No autorizado)
  if (token == null) {
    logger.warn("[AUTH_MW] Token no encontrado.");
    return res
      .status(401)
      .json({ message: "Acceso denegado: Token no proporcionado." });
  }

  // 3. Verificar el token
  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    // Si hay error (token inválido, expirado, etc.), enviar error 403 (Prohibido)
    if (err) {
      logger.warn("[AUTH_MW] Token inválido:", err.message);
      return res
        .status(403)
        .json({ message: "Acceso denegado: Token inválido." });
    }

    // 4. Si el token es válido, guardamos el payload (info del usuario) en 'req.user'
    //    para que los siguientes middlewares o controladores puedan usarlo.
    logger.info("[AUTH_MW] Token válido. Usuario:", userPayload);
    req.user = userPayload; // ¡Importante! Aquí pasamos la info del usuario.

    // 5. Llamamos a 'next()' para pasar a la siguiente función (el controlador)
    next();
  });
};
