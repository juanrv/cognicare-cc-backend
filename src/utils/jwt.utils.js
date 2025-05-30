import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/secrets.js";
import logger from "../config/logger.js";

/*
 * Genera un token JWT.
 * @param {string} userId - El ID del usuario.
 * @param {string} userRole - El rol del usuario.
 * @returns {string} El token JWT generado.
 */
export const generartoken = (userId, userRole) => {
  const payload = {
    id: userId,
    role: userRole,
  };
  logger.info("[JWT_UTIL] Generando token con payload: %o", payload);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// En el futuro, también podrías poner aquí una función para verificar tokens si
// la necesitas en un lugar diferente al middleware, aunque el middleware es lo común.
// export const verifyTokenUtility = (token) => { ... };
