import pg from "pg";
import logger from "./logger.js";

const { Pool } = pg;

// Pool de conexión a PostgreSQL
// Usamos Pool para manejar múltiples conexiones de manera eficiente
const pool = new Pool({
  user: "admin", // Usuario de la base de datos (debería coincidir con tu docker-compose.yml)
  host: "localhost", // Cambiado a 'localhost' para correr fuera de Docker
  database: "CC", // Nombre de la base de datos (debería coincidir con tu docker-compose.yml)
  password: "password", // Contraseña de la base de datos (debería coincidir con tu docker-compose.yml)
  port: 5432, // Puerto por defecto de PostgreSQL
});

// Intento de conexión al pool
pool.connect((err, client, release) => {
  if (err) {
    return logger.error(
      "Error adquiriendo cliente de la base de datos",
      err.stack
    );
  }
  logger.info(
    "[DB] Conexión a la base de datos establecida correctamente"
  );
  client.release(); // Se libera el cliente para que pueda ser reutilizado
});

// Exportamos el pool para usarlo en otros archivos
export default pool;
