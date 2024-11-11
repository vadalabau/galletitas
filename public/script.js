// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Si ya hay un token guardado, muestra la sección de tracking y oculta el login
  if (localStorage.getItem('token')) {
    showTrackingSection();
  } else {
    showLoginSection();
  }

  // Manejar el inicio de sesión
  document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita el envío tradicional del formulario

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Guarda el token
        showTrackingSection(); // Muestra la sección de verificación de paquetes
        hideLoginSection(); // Oculta la sección de login
      } else {
        document.getElementById('loginError').innerText = data.error || data.message;
      }
    } catch (error) {
      document.getElementById('loginError').innerText = 'Error de conexión al servidor';
    }
  });

  // Manejar la búsqueda del estado del paquete
  document.getElementById('searchBtn').addEventListener('click', async function() {
    const trackingNumber = document.getElementById('trackingNumber').value;
    const token = localStorage.getItem('token');

    if (!token) {
      document.getElementById('result').innerHTML = 'Por favor, inicie sesión primero.';
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/seguimiento/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        document.getElementById('result').innerHTML = `
          <h2>Estado del Paquete</h2>
          <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        `;
      } else {
        document.getElementById('result').innerHTML = `<p style="color: red;">Error: ${data.message}</p>`;
      }
    } catch (error) {
      document.getElementById('result').innerHTML = `<p style="color: red;">Error al contactar al servidor.</p>`;
    }
  });
});

function showTrackingSection() {
  document.getElementById('trackingSection').classList.remove('hidden');
  document.getElementById('loginSection').classList.add('hidden');
}

function hideTrackingSection() {
  document.getElementById('trackingSection').classList.add('hidden');
}

function showLoginSection() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('trackingSection').classList.add('hidden');
}

function hideLoginSection() {
  document.getElementById('loginSection').classList.add('hidden');
}