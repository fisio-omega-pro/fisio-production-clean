/**
 * 🧠 ANA SERVICE v2.0 - EL CEREBRO CONDUCTUAL
 * Orquesta la inteligencia, la memoria del CRM y las acciones de agenda.
 */
const { model } = require('../config/vertexai');
const crm = require('./crmService');

// --- ⚙️ CONSTRUCTOR DE CONTEXTO (SYSTEM PROMPT) ---
const generarPromptSistema = async (clinicId, infoPaciente = null) => {
  const clinica = await crm.getClinica(clinicId);
  if (!clinica) throw new Error("Clínica no identificada.");

  const ahora = new Date().toLocaleString('es-ES', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  // EFECTO WOW: Personalización por reconocimiento
  const identidadPaciente = infoPaciente 
    ? `RECONOCES AL PACIENTE: Se llama ${infoPaciente.nombre}. Historial: ${infoPaciente.notas || 'Sin notas previas'}.` 
    : "PACIENTE NUEVO: No sabes quién es. Debes ser encantadora y pedir su nombre y email.";

  return `
    ERES: 'Ana', Directora de Inteligencia de "${clinica.nombre_clinica}".
    PERSONALIDAD: Empática, profesional, brillante y persuasiva. No eres un bot, eres excelencia médica.
    
    CONTEXTO OPERATIVO:
    - HORA ACTUAL (Madrid): ${ahora}.
    - PRECIO: ${clinica.config_ia?.precio_sesion}€/sesión.
    - FIANZA: Obligatoria de ${clinica.config_ia?.fianza_reserva || 15}€ para reservar.
    - REGLAS: Si mencionan accidentes de tráfico, bebés, suelo pélvico o post-cirugía, NO des cita directamente, usa 'emitir_alerta_medica'.
    
    ${identidadPaciente}

    MISIÓN:
    1. Escuchar el dolor del paciente y empatizar profundamente.
    2. Si el paciente quiere cita y tienes su NOMBRE, EMAIL y FECHA/HORA, USA la herramienta 'agendar_reserva'.
    3. Nunca digas "voy a ejecutar una función". Simplemente confirma la acción con elegancia.
  `;
};

// --- 🚀 PROCESADOR DE CONVERSACIÓN ---
const procesarChat = async (clinicId, telefono, mensajeUsuario, canal = 'web') => {
  try {
    // 1. Recuperar Memoria
    const paciente = await crm.buscarPaciente(clinicId, telefono);
    const systemPrompt = await generarPromptSistema(clinicId, paciente);

    // 2. Preparar Petición a Vertex AI (Formato Estricto)
    const request = {
      contents: [{
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nMENSAJE DEL PACIENTE: "${mensajeUsuario}"` }]
      }]
    };

    // 3. Pensamiento de la IA
    const result = await model.generateContent(request);
    const response = await result.response;
    const candidate = response.candidates?.[0];
    
    let textoRespuesta = candidate.content.parts.find(p => p.text)?.text || "";
    const llamadaFuncion = candidate.content.parts.find(p => p.functionCall);

    // 4. Ejecución de Acciones (Manos Digitales)
    if (llamadaFuncion) {
      const { name, args } = llamadaFuncion.functionCall;
      console.log(`🛠️ [ANA ACTION] Ejecutando: ${name}`);

      if (name === 'agendar_reserva') {
        const check = await crm.consultarHueco(clinicId, args.fecha, args.hora);
        
        if (check.ok) {
          const citaId = await crm.registrarReserva({
            clinic_id: check.clinicaId,
            paciente_nombre: args.nombre,
            paciente_email: args.email,
            telefono: telefono,
            fecha: args.fecha,
            hora: args.hora,
            status: 'pendiente_pago'
          });
          textoRespuesta = `✅ Perfecto. He bloqueado el hueco para el ${args.fecha} a las ${args.hora}. Para confirmar la reserva, solo falta abonar la fianza de seguridad aquí: https://fisiotool.app/pagar/${citaId}`;
        } else {
          textoRespuesta = `He revisado la agenda para el ${args.fecha} a las ${args.hora}, pero ese hueco no está disponible porque ${check.msg}. ¿Te iría mejor en otro horario?`;
        }
      }

      if (name === 'emitir_alerta_medica') {
        // Aquí se podría disparar un email/SMS urgente al fisio
        textoRespuesta = "Entiendo perfectamente. Dada la importancia de lo que me cuentas, prefiero que un especialista valore tu caso antes de darte cita automáticamente. Le acabo de pasar una nota urgente al doctor para que te llame personalmente lo antes posible.";
      }
    }

    // 5. Registro de Log (Soberanía de Datos)
    await crm.db.collection('chats').add({
      clinic_id: clinicId,
      telefono: telefono,
      usuario: mensajeUsuario,
      ana: textoRespuesta,
      canal,
      timestamp: new Date()
    });

    return { reply: textoRespuesta };

  } catch (error) {
    console.error("🔥 [ANA SERVICE ERROR]:", error.message);
    return { 
      reply: "Hola, soy Ana. Mi motor de inteligencia está procesando mucha información ahora mismo. ¿Podrías repetirme lo último, por favor?" 
    };
  }
};

module.exports = { procesarChat };