/**
 * Prueba de Ana: comprobar que responde breve y resolutivo en todas las vertientes.
 * Uso: node backend/scripts/test-ana-brevity.js
 * Requiere GOOGLE_AI_KEY y GOOGLE_AI_MODEL en env (o Secret Manager si aplica).
 */
// Ejecutar desde la raíz del repo: node backend/scripts/test-ana-brevity.js
// Opcional: export GOOGLE_AI_KEY=... GOOGLE_AI_MODEL=gemini-1.5-flash (o el que uses)
const anaService = require('../services/anaService');

const countWords = (text) => (String(text || '').trim().split(/\s+/).filter(Boolean).length);
const countLines = (text) => (String(text || '').trim().split(/\n/).filter(Boolean).length);

async function run() {
  console.log('=== Pruebas de brevedad de Ana ===\n');

  // 1. Chat dashboard (processMessage)
  console.log('1. CHAT DASHBOARD (processMessage)');
  const questions = [
    '¿Cómo exporto la lista de pacientes?',
    '¿Dónde veo los cobros del mes?',
    'Explícame en detalle todas las funcionalidades del dashboard.',
  ];
  for (const q of questions) {
    try {
      const { reply } = await anaService.processMessage(null, q);
      const words = countWords(reply);
      const lines = countLines(reply);
      console.log(`   Pregunta: "${q}"`);
      console.log(`   Respuesta (${words} palabras, ${lines} líneas): ${reply.slice(0, 200)}${reply.length > 200 ? '...' : ''}`);
      console.log(`   ¿Breve? ${words <= 80 && lines <= 6 ? 'SÍ' : 'REVISAR (objetivo ≤80 palabras, ≤6 líneas)'}\n`);
    } catch (e) {
      console.log(`   Error: ${e.message}\n`);
    }
  }

  // 2. Admin consulta legal (processAdminConsultation)
  console.log('2. ADMIN CONSULTA LEGAL (processAdminConsultation)');
  try {
    const { reply } = await anaService.processAdminConsultation('¿Debo facturar con IVA si mi cliente es particular?');
    const words = countWords(reply);
    const lines = countLines(reply);
    console.log(`   Respuesta (${words} palabras, ${lines} líneas): ${reply.slice(0, 200)}${reply.length > 200 ? '...' : ''}`);
    console.log(`   ¿Breve? ${words <= 80 && lines <= 6 ? 'SÍ' : 'REVISAR'}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  // 3. Email entrante (processIncomingEmail) - respuesta en JSON
  console.log('3. EMAIL ENTRANTE (processIncomingEmail)');
  try {
    const result = await anaService.processIncomingEmail(
      'juan@clinica.es',
      'Consulta sobre precios',
      'Hola, me interesa FisioTool. ¿Cuánto cuesta el plan para una sola clínica?',
      null
    );
    const respWords = countWords(result.respuesta || '');
    const resumenWords = countWords(result.resumen || '');
    console.log(`   clasificacion: ${result.clasificacion}, tipo: ${result.tipo}`);
    console.log(`   respuesta (${respWords} palabras): ${(result.respuesta || 'null').slice(0, 150)}...`);
    console.log(`   resumen (${resumenWords} palabras): ${(result.resumen || '').slice(0, 100)}...`);
    console.log(`   ¿Breve? ${respWords <= 60 && resumenWords <= 20 ? 'SÍ' : 'REVISAR'}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  // 4. Email prospección (generateProspectEmail)
  console.log('4. EMAIL PROSPECCIÓN (generateProspectEmail)');
  try {
    const email = await anaService.generateProspectEmail({
      nombre: 'María',
      clinica: 'Fisio Salud',
      contexto: 'Primer contacto',
      attempts: 0,
      link: 'https://fisiotool.com',
    });
    const words = countWords(email);
    console.log(`   Email (${words} palabras): ${email.slice(0, 180)}...`);
    console.log(`   ¿≤160 palabras? ${words <= 160 ? 'SÍ' : 'REVISAR'}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  // 5. Lead Corporate (processCorporateLead) - JSON con resumen y respuesta
  console.log('5. LEAD CORPORATE (processCorporateLead)');
  try {
    const lead = await anaService.processCorporateLead({
      companyName: 'Fisio Group SL',
      contactName: 'Carlos',
      email: 'carlos@fisiogroup.com',
      clinicsCount: '2',
      practitionersCount: '5',
      timeline: '30 días',
    });
    const resumenWords = countWords(lead.resumen);
    const respuestaLines = countLines(lead.respuesta);
    console.log(`   clasificacion: ${lead.clasificacion}`);
    console.log(`   resumen (${resumenWords} palabras): ${lead.resumen.slice(0, 120)}...`);
    console.log(`   respuesta (email) líneas: ${respuestaLines}`);
    console.log(`   ¿Conciso? ${resumenWords <= 80 && respuestaLines <= 15 ? 'SÍ' : 'REVISAR'}\n`);
  } catch (e) {
    console.log(`   Error: ${e.message}\n`);
  }

  console.log('=== Fin pruebas ===');
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
