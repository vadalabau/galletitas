// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());  // Habilitar CORS para que el frontend React pueda hacer peticiones
app.use(express.json());  // Para poder leer los datos JSON de las solicitudes

// Endpoint de login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Simulación de autenticación simple
  if (email === 'usuario@example.com' && password === '123456') {
    return res.json({ success: true, token: 'faketoken123' });
  }

  // Si las credenciales no son correctas
  res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});