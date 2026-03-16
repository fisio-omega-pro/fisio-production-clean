const { db } = require('./config/firebase');
const { sendEmail } = require('./services/emailSenderService');
const { pwaInvitationTemplate } = require('./services/emailTemplates');

async function testPwaSimplificado() {
  try {
    console.log('🔧 Test PWA simplificado...');
    
    const clinicId = 'VkZQrWpagjryISYfx2lU';
    
    // Obtener pacientes directamente
    const snap = await db.collection('clinicas').doc(clinicId).collection('pacientes').get();
    const patients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('👥 Pacientes encontrados:', patients.length);
    
    // Filtrar emails válidos
    const validPatients = patients.filter(p => p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email));
    
    console.log('📧 Pacientes válidos:', validPatients.length);
    
    if (validPatients.length === 0) {
      console.log('❌ No hay pacientes con email válido');
      return;
    }
    
    // Enviar emails
    let sentCount = 0;
    for (const patient of validPatients) {
      try {
        const html = pwaInvitationTemplate({
          patientName: patient.nombre,
          clinicName: 'Momentun',
          pwaUrl: 'https://fisiotool.com/ana?ref=' + clinicId
        });
        
        const result = await sendEmail({
          to: patient.email,
          subject: '📱 Instala la App de Momentun',
          html: html,
          type: 'ANA',
          clinicName: 'Momentun'
        });
        
        if (result.ok) {
          sentCount++;
          console.log('✅ Email enviado a:', patient.email);
        } else {
          console.log('❌ Error enviando a:', patient.email);
        }
        
      } catch (error) {
        console.error('🔥 Error con paciente', patient.email, ':', error.message);
      }
    }
    
    console.log('🎉 Resultado final:');
    console.log('📧 Enviados:', sentCount);
    console.log('👥 Total válidos:', validPatients.length);
    
  } catch (error) {
    console.error('🔥 Error general:', error);
  }
}

testPwaSimplificado();
