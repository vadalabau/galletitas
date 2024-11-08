import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Login'; // Asegúrate de tener el archivo Login.jsx en tu proyecto

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <h1>Página de seguimiento</h1>
            <div className="login_class">
              <a href="/login">Inicio de sesión</a>
            </div>

            <div className="main-g">
              <h1>Página de seguimiento de galletitas</h1>
            </div>
          </>
        } />
        
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App;