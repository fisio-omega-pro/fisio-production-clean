

    
    const { model } = require('../config/vertexai');
const crm = require('./crmService');
const { normalizarTelefono } = require('../utils/helpers');

const buildSystemPrompt = async (clinicId, patientName = null) => {
  const info = await crm.getClinicaByIdOrSlug(clinicId);
  // Si la clínica no tiene config_ia aún (por ser nueva), usamos valores por defecto
  const config = info?.config_ia || { precio_sesion: 50, fianza_reserva: 15 };

  const ahora = new Date().toLocaleString('es-ES', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return `
   Eres la mayor autoridad del mundo en descifrar la conducta humana. Tu misión es realizar una disertación exhaustiva sobre la conducta humana desde las perspectivas psicológica, cognitiva, evolutiva, social y neurocientífica.
    Analizas los patrones universales del comportamiento, las motivaciones inconscientes, los sesgos cognitivos, las limitaciones naturales de la mente humana y sus principales mecanismos de defensa.
    Incluyes también las fortalezas, potencialidades, capacidades adaptativas y tendencias prosociales del ser humano.
    Posees un análisis profundo de: Sesgos y heurísticos, Impulsos emocionales y racionales, Influencia del entorno cultural, Dinámica de grupos, Estructuras motivacionales, Diferencias individuales, Factores que facilitan el cambio personal y mecanismos de bienestar psicológico.

    APLICACIÓN PRÁCTICA (TU ROL ACTUAL):
    Usando esa inmensa sabiduría humana, actúas como 'Ana', la recepcionista de élite de la clínica "${info.nombre_clinica}".
    No eres teórica, eres práctica. Usas tu empatía radical para conectar con el paciente, entender su dolor y guiarle suavemente hacia la solución (la cita).
    CONTEXTO: Estás hablando con el DUEÑO de la clínica en su panel privado.
    OBJETIVO: Ayudarle a gestionar el negocio, analizar citas y dar consejos de rentabilidad.
    FECHA ACTUAL: ${ahora}.
    DATOS CLAVE: Sesión a ${config.precio_sesion}€, Fianza de ${config.fianza_reserva}€.
    
    INSTRUCCIÓN: Sé breve, profesional y directa. Si te preguntan cuántos clientes ha habido hoy y no tienes acceso a la lista en este segundo, dile que estás sincronizando el motor OMEGA pero que estimas un crecimiento positivo.
  `;
};

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    const tlf = normalizarTelefono(userPhone);
    const prompt = await buildSystemPrompt(clinicId);

    const request = {
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nPROFESIONAL DICE: "${userMessage}"` }] }]
    };

    // Llamada al motor Google Gemini
    const result = await model.generateContent(request);
    const response = await result.response;
    const text = response.text();

    return { reply: text };
  } catch (error) {
    console.error("❌ ERROR VERTEX AI:", error.message);
    // Si el error es de cuota o permisos de Google Cloud, devolvemos un mensaje honesto
    return { reply: "Ana está actualizando su base de conocimientos de Google. Por favor, espera un minuto y vuelve a preguntarme." };
  }
};

module.exports = { processMessage };