const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path'); // Para servir archivos estáticos
const app = express();

app.use(express.json()); // Para manejar JSON en las solicitudes
app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos desde el directorio 'public'

// Configura la conexión a la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'paquetes'
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos: ', err.stack);
    return;
  }
  console.log('Conexión a la base de datos establecida.');
});

// Secreta para firmar los JWT
const JWT_SECRET = 'tu_clave_secreta';

// Función para verificar el rol de un usuario
function checkRole(role) {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Token de la cabecera

    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado, no se proporcionó token' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Error al verificar el token:', err);  // Para ver el error si falla la verificación
        return res.status(401).json({ message: 'Token no válido' });
      }

      console.log("Usuario decodificado:", decoded);  // Verifica si el usuario tiene el rol adecuado

      if (decoded.role !== role) {
        return res.status(403).json({ message: 'Acceso denegado, no tienes permisos' });
      }

      req.user = decoded; // Agregamos el usuario decodificado al request
      next(); // Continuamos con el siguiente middleware o ruta
    });
  };
}

// Ruta raíz para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ruta correcta a index.html en el directorio 'public'
});

// Endpoint para login y obtener un JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
    if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = results[0];

    // Verificar contraseña
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error al comparar contraseñas' });
      if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

      // Crear un token JWT
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

// Endpoint para registrar un nuevo usuario
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;

  // Verifica si ya existe el usuario
  db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
    if (results.length > 0) return res.status(400).json({ error: 'El nombre de usuario ya existe' });

    // Hashear la contraseña antes de guardarla
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Error al cifrar la contraseña' });

      // Insertar el nuevo usuario en la base de datos con la contraseña cifrada
      db.query('INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al insertar el usuario en la base de datos' });
        
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      });
    });
  });
});

// Endpoint para agregar un paquete (solo "camion")
app.post('/api/seguimiento', checkRole('camion'), (req, res) => {
  const { tracking_number, status } = req.body;

  db.query('INSERT INTO seguimiento (tracking_number, status) VALUES (?, ?)', [tracking_number, status], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al agregar el paquete' });
    res.status(201).json({ message: 'Paquete agregado exitosamente', tracking_number, status });
  });
});

// Endpoint para ver todos los paquetes (solo "admin")
app.get('/api/seguimiento', checkRole('admin'), (req, res) => {
  db.query('SELECT * FROM seguimiento', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
    res.json(results);
  });
});

// Endpoint para obtener el estado de un paquete por número de seguimiento (solo "admin")
app.get('/api/seguimiento/:trackingNumber', checkRole('admin'), (req, res) => {
  const { trackingNumber } = req.params;

  // Consulta a la base de datos para obtener el estado del paquete
  db.query('SELECT * FROM seguimiento WHERE tracking_number = ?', [trackingNumber], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al consultar la base de datos' });
    if (results.length === 0) return res.status(404).json({ message: 'Paquete no encontrado' });

    const package = results[0]; // Tomamos el primer paquete que encontramos
    res.json(package); // Devolvemos el paquete con su estado
  });
});

// Inicia el servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});

// Contraseña en texto claro
const password = 'adminpassword';

// Cifrar la contraseña
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;
  console.log('Contraseña cifrada: ', hashedPassword);
});

// Endpoint para login y obtener un JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
      if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
  
      const user = results[0];
  
      // Verificar contraseña
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return res.status(500).json({ error: 'Error al comparar contraseñas' });
        if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });
  
        // Crear un token JWT
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      });
    });
  });