const axios = require('axios');

async function enviarEmailPwa() {
  try {
    console.log('🔧 Enviando email PWA a fisiotoolsaas@gmail.com...');
    
    // Token válido generado
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGluaWNJZCI6IlZrWlFyV3BhZ2pyeUlTWWZ4MmxVIiwiZXVzZXJJZCI6IlZrWlFyV3BhZ2pyeUlTWWZ4MmxVIiwiaWF0IjoxNzcyNjk4NzEwLCJleHAiOjE3NzI3MDIzMTB9.n0sXmdrqQFNBuEJDh7XcqMzChx0MsaRwMVdFXLlcjqc';
    
    const response = await axios.post('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/dashboard/send-pwa-invitation', {
      patientIds: ['all'] // Enviar a todos los pacientes
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Email PWA enviado exitosamente:');
    console.log('📧 Enviados:', response.data.sent);
    console.log('📊 Total:', response.data.total);
    
  } catch (error) {
    console.error('🔥 Error enviando email PWA:', error.response?.data || error.message);
  }
}

enviarEmailPwa();
