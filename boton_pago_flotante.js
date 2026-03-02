// ENLACE DE PAGO DIRECTO - COPIA Y PEGA ESTO EN LA CONSOLA DEL NAVEGADOR

// Esto creará un botón de pago flotante que siempre estará visible
const paymentButton = document.createElement('div');
paymentButton.innerHTML = `
  <div style="
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0066ff;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,102,255,0.3);
    font-weight: bold;
  ">
    💳 Pagar Plan Multi-Sede (300€/mes)
  </div>
`;

paymentButton.onclick = async function() {
  this.innerHTML = '⏳ Procesando...';
  
  try {
    const response = await fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/dashboard/upgrade-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('fisio_token') || '')
      },
      body: JSON.stringify({ plan: 'business' })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error: No se pudo generar la URL de pago');
      }
    } else {
      alert('Error del servidor: ' + response.status);
    }
  } catch (error) {
    alert('Error de conexión: ' + error.message);
  }
  
  this.innerHTML = '💳 Pagar Plan Multi-Sede (300€/mes)';
};

document.body.appendChild(paymentButton);
console.log('✅ Botón de pago añadido - deberías verlo en la esquina superior derecha');
