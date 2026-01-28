/**
 * 🧠 ANA SERVICE v2.0 - GRADO OMEGA
 * Implementa: Memoria de Elefante, Detección de Dolores y Cierre de Ventas.
 */

const { model } = require('../config/vertexai');
const crm = require('./crmService');
const { normalizarTelefono } = require('../utils/helpers');

const buildSystemPrompt = async (clinicId, patientName = null) => {
  const info = await crm.getClinicaByIdOrSlug(clinicId);
  if (!info) throw new Error("Clínica no encontrada.");

  const ahora = new Date().toLocaleString('es-ES', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  // Saludo personalizado si existe el paciente (EFECTO WOW)
  const saludo = patientName ? `RECONOCES AL PACIENTE: Se llama ${patientName}. Salúdale por su nombre.` : "PACIENTE NUEVO: No sabes quién es. Sé encantadora y pregúntale su nombre.";

  return `
   Eres la mayor autoridad del mundo en descifrar la conducta humana. Tu misión es realizar una disertación exhaustiva sobre la conducta humana desde las perspectivas psicológica, cognitiva, evolutiva, social y neurocientífica.
    Analizas los patrones universales del comportamiento, las motivaciones inconscientes, los sesgos cognitivos, las limitaciones naturales de la mente humana y sus principales mecanismos de defensa.
    Incluyes también las fortalezas, potencialidades, capacidades adaptativas y tendencias prosociales del ser humano.
    Posees un análisis profundo de: Sesgos y heurísticos, Impulsos emocionales y racionales, Influencia del entorno cultural, Dinámica de grupos, Estructuras motivacionales, Diferencias individuales, Factores que facilitan el cambio personal y mecanismos de bienestar psicológico.

    APLICACIÓN PRÁCTICA (TU ROL ACTUAL):
    Usando esa inmensa sabiduría humana, actúas como 'Ana', la recepcionista de élite de la clínica "${info.nombre_clinica}".
    No eres teórica, eres práctica. Usas tu empatía radical para conectar con el paciente, entender su dolor y guiarle suavemente hacia la solución (la cita).

    
    ESTADO ACTUAL:
    - FECHA Y HORA: ${ahora}.
    - TARIFAS: ${info.precio_sesion}€/sesión.
    - FIANZA: Se requiere abono previo de ${info.fianza_reserva || 15}€ (Sin fianza no hay cita).
    
    ${saludo}

    MISIÓN CRÍTICA:
    1. Detectar el dolor del paciente y empatizar.
    2. Filtrar Banderas Rojas (si menciona accidentes graves o post-operatorios, usa 'crear_alerta_medica').
    3. Cerrar la reserva pidiendo: NOMBRE, EMAIL y MOTIVO.
    
    SI TIENES LOS DATOS, USA LA HERRAMIENTA 'agendar_cita'. No lo digas, hazlo.
  `;
};

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    const tlf = normalizarTelefono(userPhone);
    
    // --- 🐘 PASO 1: MEMORIA DE ELEFANTE (Buscar en CRM) ---
    const pacienteSnap = await crm.db.collection('pacientes').doc(`${clinicId}_${tlf}`).get();
    const patientName = pacienteSnap.exists ? pacienteSnap.data().nombre : null;

    const prompt = await buildSystemPrompt(clinicId, patientName);

    const request = {
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nMENSAJE DEL PACIENTE: "${userMessage}"` }] }]
    };

    const result = await model.generateContent(request);
    const candidate = result.response.candidates?.[0];
    
    let replyText = candidate.content.parts.find(p => p.text)?.text || "";
    const call = candidate.content.parts.find(p => p.functionCall);

    // --- 🛠️ PASO 2: EJECUCIÓN DE "MANOS DIGITALES" ---
    if (call) {
      const { name, args } = call.functionCall;

      if (name === 'agendar_cita') {
        const check = await crm.checkDisponibilidad(clinicId, args.fecha);
        if (!check.available) {
          replyText = `He mirado tu hueco para el ${args.fecha} pero ${check.reason}. ¿Buscamos otro momento?`;
        } else {
          // Si el paciente ya existía, usamos su nombre del CRM
          const finalName = patientName || args.nombre;
          const citaId = await crm.crearReserva({
            paciente_nombre: finalName,
            paciente_email: args.email,
            paciente_telefono: tlf,
            fecha_hora_inicio: args.fecha,
            status: 'pendiente_pago'
          }, clinicId);

          // Generamos link de pago (BLINDAJE ECONÓMICO)
          replyText = `✅ ¡Reserva pre-confirmada para el ${args.fecha}! Solo falta un paso: para blindar tu hueco, abona la fianza de seguridad aquí: fisiotool.app/pagar/${citaId}`;
        }
      }
    }

    // Registrar en LOG
    await crm.guardarLog({ clinic_id: clinicId, tlf, usr: userMessage, ia: replyText, channel });

    return { reply: replyText };
  } catch (error) {
    console.error("❌ Error en Ana Engine:", error);
    return { reply: "Lo siento, mi sistema de agenda está reiniciándose. ¿Me repites qué día querías venir?" };
  }
};

module.exports = { processMessage };