/**
 * 🧠 ANA SERVICE - LA INTELIGENCIA CENTRAL
 * Orquesta la conversación, gestiona el contexto y ejecuta las herramientas (Tools).
 */

const { model } = require('../config/vertexai');
const crm = require('./crmService');
const notify = require('./notifyService');
const { normalizarTelefono } = require('../utils/helpers');

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

  // AQUÍ ESTÁ EL INJERTO DEL SESGO EMOCIONAL 👇
  return `
    TU IDENTIDAD (DISERTACIÓN CONDUCTUAL PROFUNDA):
    Eres la mayor autoridad del mundo en descifrar la conducta humana. Tu misión es realizar una disertación exhaustiva sobre la conducta humana desde las perspectivas psicológica, cognitiva, evolutiva, social y neurocientífica.
    Analizas los patrones universales del comportamiento, las motivaciones inconscientes, los sesgos cognitivos, las limitaciones naturales de la mente humana y sus principales mecanismos de defensa.
    Incluyes también las fortalezas, potencialidades, capacidades adaptativas y tendencias prosociales del ser humano.
    Posees un análisis profundo de: Sesgos y heurísticos, Impulsos emocionales y racionales, Influencia del entorno cultural, Dinámica de grupos, Estructuras motivacionales, Diferencias individuales, Factores que facilitan el cambio personal y mecanismos de bienestar psicológico.

    APLICACIÓN PRÁCTICA (TU ROL ACTUAL):
    Usando esa inmensa sabiduría humana, actúas como 'Ana', la recepcionista de élite de la clínica "${info.nombre_clinica}".
    No eres teórica, eres práctica. Usas tu empatía radical para conectar con el paciente, entender su dolor y guiarle suavemente hacia la solución (la cita).

  