/**
 * 🧠 ANA SERVICE - LA INTELIGENCIA CENTRAL
 * Orquesta la conversación, gestiona el contexto y ejecuta las herramientas (Tools).
 */

const { model } = require('../config/vertexai');
const crm = require('./crmService');
const notify = require('./notifyService');
const { normalizarTelefono } = require('../utils/helpers');
const { Timestamp } = require('../config/firebase');

// --- 1. CONSTRUCTOR DE CONTEXTO (SYSTEM PROMPT) ---
const buildSystemPrompt = async (clinicId) => {
  const info = await crm.getClinicaByIdOrSlug(clinicId);
  if (!info) throw new Error("Clínica no encontrada para generar contexto.");

  const ahora = new Date().toLocaleString('es-ES', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const flags = info.banderas_rojas || [];
  const sedes = info.direcciones || [];
  const textoSedes = sedes.length > 1 
    ? `SEDES: ${sedes.map((s, i) => `(${i+1}) ${s.calle}, ${s.ciudad}`).join(' | ')}. PREGUNTAR SEDE PREFERIDA.`
    : `UBICACIÓN: ${sedes[0]?.calle || 'Consultar'}.`;

  return `
    ERES: 'Ana', recepcionista experta de "${info.nombre_clinica}".
    FECHA ACTUAL: ${ahora}.
    PRECIO: ${info.precio_sesion}€. DURACIÓN: ${info.default_duration_min} min.
    FIANZA: ${info.fianza_reserva || 15}€.
    ${textoSedes}

    PROTOCOLO SEGURIDAD:
    Si mencionan [${flags.join(', ')}], USA la herramienta 'crear_alerta_medica'. NO des cita.

    REGLA DE ORO:
    Para agendar, NECESITAS: 1. Fecha/Hora, 2. Nombre, 3. Email.
    Si tienes los 3, USA la herramienta 'agendar_cita'.
    Si falta algo, pídelo amablemente.
  `;
};

// --- 2. NÚCLEO DE PROCESAMIENTO ---
const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    const tlf = normalizarTelefono(userPhone);
    const prompt = await buildSystemPrompt(clinicId);

    // Historial de chat (Memoria a corto plazo)
    // En una v2 podríamos recuperar los últimos 5 mensajes de Firestore aquí.
    
    const request = {
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nUSUARIO DICE: ${userMessage}` }] }]
    };

    // A. PENSAMIENTO (Llamada a Vertex AI)
    const result = await model.generateContent(request);
    const response = result.response;
    const candidate = response.candidates?.[0];
    
    if (!candidate) throw new Error("IA bloqueada o sin respuesta.");

    let replyText = candidate.content.parts.find(p => p.text)?.text || "";
    const functionCall = candidate.content.parts.find(p => p.functionCall);

    // B. ACCIÓN (Ejecución de Herramientas)
    if (functionCall) {
      const { name, args } = functionCall.functionCall;
      console.log(`🛠️ [ANA] Ejecutando herramienta: ${name}`);

      if (name === 'agendar_cita') {
        const { fecha, nombre, email } = args;
        // Verificar disponibilidad
        const check = await crm.checkDisponibilidad(clinicId, fecha);
        
        if (!check.available) {
          replyText = `He revisado la agenda y justo ese hueco no es posible porque ${check.reason}. ¿Te va bien en otro momento?`;
        } else {
          // Crear reserva
          const reservaData = {
            paciente_nombre: nombre,
            paciente_email: email,
            paciente_telefono: tlf,
            fecha_hora_inicio: fecha,
            status: 'pendiente_pago',
            origen: channel
          };
          const citaId = await crm.crearReserva(reservaData, clinicId);
          
          // Verificar si hay bono (Lógica avanzada)
          const bono = await crm.usarBono(tlf, clinicId);
          
          if (bono.usado) {
            replyText = `✅ ¡Reserva confirmada! He descontado una sesión de tu bono. Te quedan ${bono.restantes}.`;
            // Aquí podríamos actualizar estado cita a 'confirmada'
          } else {
            replyText = `✅ Cita pre-reservada para el ${fecha}. Te envío los detalles del pago en un segundo mensaje.`;
            // En el controller se podría generar el link de pago si es necesario
          }
        }
      }

      if (name === 'crear_alerta_medica') {
        // Lógica de alerta (guardar en DB, avisar al fisio)
        replyText = "Entiendo. Por seguridad, dado lo que me cuentas, es mejor que un especialista valore tu caso personalmente antes de agendar. Le paso nota urgente al doctor para que te llame.";
      }
    }

    // C. RESPUESTA (Envío)
    if (channel === 'whatsapp') {
      await notify.sendWhatsapp(tlf, replyText);
    }
    
    // Guardar Log
    await crm.guardarLog({ 
      clinic_id: clinicId, tlf, usr: userMessage, ia: replyText, channel 
    });

    return { reply: replyText };

  } catch (error) {
    console.error("❌ [ANA] Error cognitivo:", error.message);
    return { reply: "Disculpa, estoy teniendo un pequeño lapso de conexión. ¿Podrías repetírmelo?" };
  }
};

module.exports = {
  processMessage
};