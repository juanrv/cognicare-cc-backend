import pool from "../config/db.js";
import { generartoken } from "../utils/jwt.utils.js";
import logger from "../config/logger.js";

/**
 * Autentica a un administrador.
 * @param {string} numeroDocumento - El número de documento del administrador.
 * @returns {Promise<object>} Objeto con el resultado de la autenticación.
 * @throws {Error} Si el número de documento no se proporciona.
 */
export const autenticarAdmin = async (numeroDocumento) => {
  logger.debug(
    "[SERVICE] Intentando autenticar Admin con documento: %s",
    numeroDocumento
  );
  if (!numeroDocumento) {
    // Este error será capturado por el catch del controlador si no se maneja antes.
    throw new Error("Número de documento es requerido.");
  }

  const query = `
    SELECT id, nombres, apellidos
    FROM CC.Administrador
    WHERE numeroDocumento = $1 AND fechaFin > CURRENT_TIMESTAMP`;

  logger.debug("[SERVICE] Ejecutando query Admin...");
  const result = await pool.query(query, [numeroDocumento]);

  if (result.rows.length > 0) {
    const admin = result.rows[0];
    const token = generartoken(admin.id, "admin");
    logger.info("[SERVICE] Admin autenticado exitosamente.");
    return { success: true, user: admin, role: "admin", token };
  } else {
    logger.warn("[SERVICE] Admin no encontrado o inactivo.");
    return {
      success: false,
      message: "Credenciales inválidas o administrador inactivo.",
    };
  }
};

/**
 * Autentica a un entrenador.
 * @param {string} correo - El correo del entrenador.
 * @param {string} numeroDocumento - El número de documento (usado como contraseña).
 * @returns {Promise<object>} Objeto con el resultado de la autenticación.
 * @throws {Error} Si el correo o número de documento no se proporcionan.
 */
export const autenticarEntrenador = async (correo, numeroDocumento) => {
  logger.debug(
    "[SERVICE] Intentando autenticar Entrenador con correo:",
    correo
  );
  if (!correo || !numeroDocumento) {
    throw new Error("Correo y número de documento son requeridos.");
  }

  const query = `
    SELECT id, nombres, apellidos
    FROM CC.Entrenador
    WHERE correo = $1 AND numeroDocumento = $2 AND fechaFin > CURRENT_TIMESTAMP`;

  logger.debug("[SERVICE] Ejecutando query Entrenador...");
  const result = await pool.query(query, [correo, numeroDocumento]);

  if (result.rows.length > 0) {
    const entrenador = result.rows[0];
    const token = generartoken(entrenador.id, "entrenador");
    logger.info("[SERVICE] Entrenador autenticado exitosamente.");
    return { success: true, user: entrenador, role: "entrenador", token };
  } else {
    logger.warn("[SERVICE] Entrenador no encontrado o inactivo.");
    return {
      success: false,
      message: "Credenciales inválidas o entrenador inactivo.",
    };
  }
};
