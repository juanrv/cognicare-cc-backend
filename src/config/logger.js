import winston from "winston";

const { combine, timestamp, printf, colorize, splat, errors } = winston.format;

// Define el formato de log para la consola
const consoleLogFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Nivel de log (puedes cambiarlo o usar variable de entorno)
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    splat(), // Permite formatear strings tipo printf: logger.info('Mensaje %s', 'valor')
    errors({ stack: true }), // Para loguear el stack trace de los errores
    consoleLogFormat
  ),
  transports: [
    new winston.transports.Console(),
    // En el futuro, podrías añadir aquí un transporte a archivo para producción:
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'combined.log' }),
  ],
  exitOnError: false, // No salir en excepciones no manejadas (para que tu app no crashee por un log)
});

// Si no estamos en producción, logueamos todo a nivel 'debug'
if (process.env.NODE_ENV !== "production") {
  logger.level = "debug";
}

export default logger;
