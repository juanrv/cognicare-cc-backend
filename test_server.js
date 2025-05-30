import express from 'express';

const app = express();
const port = 3001;

// Ruta de prueba
app.get('/test', (req, res) => {
  console.log('*** ¡¡¡TEST SERVER: Petición /test RECIBIDA!!! ***');
  res.send('¡Test Server OK!');
});

// Ruta para cualquier otra cosa (404)
app.use((req, res) => {
  console.log(`*** TEST SERVER: Ruta no encontrada: ${req.method} ${req.path} ***`);
  res.status(404).send(`Test Server: Cannot ${req.method} ${req.path}`);
});

app.listen(port, () => {
  console.log(`*** TEST SERVER: Escuchando en http://localhost:${port} ***`);
});