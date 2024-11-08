// Login.jsx
import React from 'react';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!email || !password) {
          setErrorMessage('Por favor, complete todos los campos.');
          return;
        }

        try {
            const response = await axios.post('https://tu-api.com/api/login', {
              email,
              password
            });
      
            if (response.data.success) {
                    
              window.location.href = '/'; 
            } else {
              setErrorMessage('Credenciales incorrectas.');
            }
          } catch (error) {
            // Manejo de errores de la solicitud
            console.error('Error de autenticación:', error);
            setErrorMessage('Hubo un error al intentar iniciar sesión.');
          } finally {
            setLoading(false); // Desactivar el indicador de carga
          }
        };



        return (
            <div className="main-g">
              <h2>Inicio de sesión</h2>
        
              {errorMessage && <div className="error">{errorMessage}</div>}
        
              <form onSubmit={handleSubmit}>
                <label htmlFor="email">Correo electrónico:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
        
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
        
                <button type="submit" disabled={loading}>
                  {loading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
              </form>
            </div>
          );
        }
        
        export default Login;