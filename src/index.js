import express from "express";
import cors from "cors";
import morgan from "morgan";
import logger from "./config/logger.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tipoDocumentoRoutes from "./routes/tipoDocumento.routes.js";
import facultadRoutes from "./routes/facultad.routes.js";

const app = express();
const port = 3001;

// Configuración CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configuración de Morgan para que use Winston como logger
// El formato 'combined' es un formato estándar de Apache
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()), // Envía los logs HTTP a Winston con nivel 'http'
    },
  })
);

// Ruta de prueba
app.get("/test", (req, res) => {
  logger.info("--- [LOG] ¡¡¡Petición recibida en /test !!! ---");
  res.status(200).send("¡El backend (reestructurado) está respondiendo!");
});

// Rutas
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tipos-documento", tipoDocumentoRoutes);
app.use("/api/facultades", facultadRoutes);


// Middleware para manejar 404
app.use((req, res) => {
  logger.warn(`--- [404] Ruta no encontrada: ${req.method} ${req.path}`);
  res
    .status(404)
    .json({ message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  logger.error("--- [ERROR_HANDLER] Error no controlado ---", err);
  res.status(err.status || 500).json({
    message: err.message || "Error interno del servidor.",
    // Considera no enviar el stack en producción por seguridad
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Iniciar el servidor
app.listen(port, () => {
  logger.info(`Backend escuchando en http://localhost:${port}`); //
});
