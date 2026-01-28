const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');

// ==========================================
// 🏭 1. CONFIGURACIÓN TÉCNICA GLOBAL
// ==========================================
const PROJECT_ID_FIXED = 'spatial-victory-480409-b7';
const REGION_FIXED = 'europe-west1'; 
const DEV_MODE = process.env.DEV_MODE === 'true'; 
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

// --- MAPEADO DE PLANES STRIPE ---
const PLANES_STRIPE = {
    'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

// --- INICIALIZACIÓN FIREBASE ADC ---
if (!admin.apps.length) {
    initializeApp({ 
        credential: applicationDefault(), 
        projectId: PROJECT_ID_FIXED 
    });
}
const db = getFirestore();

// --- CONFIGURACIÓN MOTOR IA (SDK OFICIAL) ---
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
const vertex_ai = new VertexAI({ project: PROJECT_ID_FIXED, location: REGION_FIXED });

const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2,
    topP: 0.8,
    topK: 40
  }
});

// --- MOTOR DE PAGOS (STRIPE) ---
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe;
if (STRIPE_SECRET_KEY) {
    stripe = require('stripe')(STRIPE_SECRET_KEY);
    console.log("✅ STRIPE ENGINE: CONECTADO");
}

// --- CONFIGURACIÓN CORREO SMTP ---
const transporter = nodemailer.createTransport({
    host: "mail.fisiotool.com",
    port: 465,
    secure: true,
    auth: { user: "ana@fisiotool.com", pass: process.env.EMAIL_PASS }
});

// --- INICIALIZACIÓN EXPRESS ---
const app = express();
app.use(cors());
// El orden de los body-parsers es vital para el Webhook de Stripe después
const jsonParser = bodyParser.json();

// --- SINCRONIZACIÓN CARROCERÍA NEXT.JS ---
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out');
}
// ==========================================
// 🛠️ 2. UTILIDADES DE INGENIERÍA (NASA PRECISION)
// ==========================================

// Limpieza de teléfonos: asegura formato puro para WhatsApp y CRM
function normalizarTelefono(tlf) {
  if (!tlf) return "";
  let limpio = tlf.replace(/\D/g, ''); // Quitamos todo lo que no sea número
  if (limpio.startsWith('34') && limpio.length > 9) {
    limpio = limpio.substring(2); // Quitamos prefijo español
  }
  return limpio.trim();
}

// Detector dinámico de Host: garantiza que Stripe y los links siempre apunten al sitio correcto
function getDynamicHost(req) {
  const host = req.get('host');
  if (host.includes('run.app') || process.env.NODE_ENV === 'production') {
    return `https://${host}`;
  }
  return `${req.protocol}://${host}`;
}

// FUNCIÓN MAESTRA DE COMUNICACIÓN IA (Sovereign SDK)
async function callVertexAI(contents) {
  try {
    console.log("🤖 Ana está procesando información conductual...");
    
    // Formateamos para cumplir el protocolo estricto de Google (role: user)
    const formattedContents = contents.map(c => ({
      role: c.role || "user",
      parts: c.parts
    }));

    const result = await model.generateContent({ contents: formattedContents });
    
    // NAVEGACIÓN DEFENSIVA: Ruta física del microchip (Gemini 2.5 Flash)
    const candidate = result.response.candidates && result.response.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.warn("⚠️ IA bloqueada por filtros de seguridad.");
      return "Disculpa, no he podido procesar esa consulta por seguridad médica. ¿Podrías explicarlo de otra forma?";
    }

    // Usamos el acceso directo que confirmamos en el test de estrés
    const text = candidate.content.parts[0].text;
    console.log("✅ Respuesta de Ana generada con éxito.");
    return text;
  } catch (e) {
    console.error("❌ ERROR CRÍTICO MOTOR IA:", e.message);
    throw e; 
  }
}

// ==========================================
// 🧠 3. CEREBRO DE ANA (DISERTACIÓN CONDUCTUAL)
// ==========================================

async function crearContextoAna(idClinicaActual) {
  // Localización soberana de la clínica (por ID o por Slug)
  let doc = await db.collection('clinicas').doc(idClinicaActual).get();
  if (!doc.exists) {
    const q = await db.collection('clinicas').where('slug', '==', idClinicaActual).limit(1).get();
    if(!q.empty) doc = q.docs[0];
  }

  const info = doc.exists ? doc.data() : { nombre_clinica: "Fisiotool", precio_sesion: 100 };
  
  // Sincronización temporal con Madrid (Independiente de la ubicación del servidor en Bélgica)
  const ahora = new Date().toLocaleString('en-US', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const fianza = info.fianza_reserva || 15;
  const flags = info.banderas_rojas || [];
  const sedes = info.direcciones || [];
  const metodos = info.metodos_pago ? info.metodos_pago.join(', ') : "Stripe, Bizum, Efectivo";

  let textoSedes = sedes.length > 1 
    ? `VARIAS SEDES DISPONIBLES: ${sedes.map((s, i) => `(${i+1}) ${s.calle}, ${s.ciudad}`).join(' | ')}. OBLIGATORIO: Preguntar sede antes de reservar.`
    : `UBICACIÓN: ${sedes[0]?.calle || 'Consultar en clínica'}, ${sedes[0]?.ciudad || ''}.`;

  let textoSeguridad = flags.length > 0 
    ? `🛡️ PROTOCOLO RED FLAGS: Si mencionan [${flags.join(', ')}], NO des cita. Explica que requiere valoración manual y que llamen al teléfono de la clínica. Añade al final: ###ALERTA|Caso_Especial###`
    : "";

  return `
    TU IDENTIDAD (DISERTACIÓN CONDUCTUAL PROFUNDA):
    Eres la mayor autoridad del mundo en descifrar la conducta humana. Analizas patrones universales, motivaciones inconscientes y sesgos cognitivos. Tu trato es maravilloso, empático y profesional.
    ACTÚAS COMO: 'Ana', la recepcionista de élite de "${info.nombre_clinica}". No eres un bot, eres excelencia pura.

    DATOS DE NEGOCIO (SOBERANÍA DEL CALENDARIO):
    - FECHA ACTUAL EN TU CONSULTA: ${ahora}.
    - PRECIO: ${info.precio_sesion}€. DURACIÓN: ${info.default_duration_min || 45} min.
    - COBRO: Se requiere fianza de ${fianza}€ para blindar el hueco de agenda.
    - MÉTODOS ACEPTADOS: ${metodos}.
    - ${textoSedes}
    
    ${textoSeguridad}

    ⚠️ REGLA DE ORO DE CAPTACIÓN (OBLIGATORIO):
    Para agendar cualquier cita, necesitas TRES datos sagrados:
    1. Nombre del paciente.
    2. Motivo de la consulta.
    3. EMAIL (Explícales que es imprescindible para enviarles el justificante legal y el recordatorio de 12h).

    NO PUEDES LANZAR LA RESERVA SIN EL EMAIL. Si no lo dan, pídelo educadamente antes de cerrar.

    MANDAMIENTOS DE CIERRE:
    Cuando tengas Fecha/Hora, Nombre y EMAIL, usa estrictamente este formato: 
    ###RESERVA|YYYY-MM-DD HH:mm|Nombre|Email###
  `;
}
// ============================================================
// 💾 4. HELPERS DE BASE DE DATOS (ESTRUCTURA SOBERANA)
// ============================================================

// Graba la reserva con blindaje legal RGPD v1.1 e IP del paciente
async function crearReserva(datos, idClinica, req) {
  try {
    let doc = await db.collection('clinicas').doc(idClinica).get();
    if(!doc.exists) {
      const q = await db.collection('clinicas').where('slug', '==', idClinica).limit(1).get();
      if(!q.empty) doc = q.docs[0];
    }
    const info = doc.data();
    const duracion = info?.default_duration_min || 45;
    
    // Captura de IP Real para el rastro legal (Compatible con Cloud Run)
    const clientIp = req?.headers['x-forwarded-for'] || req?.ip || "unknown";

    const ref = await db.collection('citas').add({ 
      ...datos, 
      clinic_id: idClinica, 
      nombre_clinica: info?.nombre_clinica || "FisioTool",
      fecha_hora_inicio: datos.fecha, // Guardado como String "YYYY-MM-DD HH:mm"
      duracion_minutos: duracion, 
      creado: admin.firestore.Timestamp.now(), 
      status: datos.status || 'pendiente_confirmacion',
      recordatorio_enviado: false,
      aceptacion_rgpd: {
        aceptado: true,
        fecha: admin.firestore.Timestamp.now(),
        version: "1.1",
        ip: clientIp
      }
    }); 
    
    console.log("✅ Cita Sincronizada en el Palacio (ID):", ref.id);
    return ref.id;
  } catch (e) { 
    console.error("❌ ERROR EN GRABACIÓN DE RESERVA:", e); 
    return null; 
  }
}

// Registro histórico de la conversación para el CRM
async function guardarLogChat(tlf, usr, ia, idClinica) {
  try {
    await db.collection('chats').add({ 
      tlf, usr, ia, clinic_id: idClinica, ts: admin.firestore.Timestamp.now() 
    });
  } catch (e) { console.error("❌ Error en Log de Inteligencia:", e); }
}

// Emisión de alertas por Banderas Rojas (Triaje)
async function crearAlerta(tlf, iaReply, idClinica, motivo) {
  try {
    await db.collection('alertas_red_flag').add({
      paciente_tlf: tlf,
      mensaje_ia: iaReply,
      clinic_id: idClinica,
      motivo: motivo,
      creado: admin.firestore.Timestamp.now(),
      status: 'pendiente'
    });
    console.log("🚨 Alerta de seguridad emitida por Ana.");
  } catch (e) { console.error("❌ Error en Sistema de Alertas:", e); }
}

// Gestión de Bonos (Fidelización Activa)
async function consultarYDescontarBono(tlf, idClinica) {
  try {
    const snap = await db.collection('bonos')
      .where('clinic_id', '==', idClinica)
      .where('paciente_tlf', '==', tlf)
      .where('status', '==', 'activo')
      .where('sesiones_disponibles', '>', 0)
      .limit(1).get();

    if (snap.empty) return { bonoUsado: false };

    const bonoDoc = snap.docs[0];
    const nuevas = bonoDoc.data().sesiones_disponibles - 1;
    await bonoDoc.ref.update({
      sesiones_disponibles: nuevas,
      status: nuevas <= 0 ? 'consumido' : 'activo'
    });
    console.log(`🎟️ Bono detectado: -1 sesión. Restan: ${nuevas}`);
    return { bonoUsado: true, sesionesRestantes: nuevas };
  } catch (e) { return { bonoUsado: false }; }
}

// ============================================================
// 📅 5. AGENDA SOBERANA (CALIBRACIÓN NASA)
// ============================================================

async function checkAgendaDeterminista(idClinica, fechaIntentoStr) {
  let clinicaDoc = await db.collection('clinicas').doc(idClinica).get();
  if(!clinicaDoc.exists) {
    const q = await db.collection('clinicas').where('slug', '==', idClinica).limit(1).get();
    if(!q.empty) clinicaDoc = q.docs[0];
    else return { available: false, reason: "clínica no encontrada" };
  }
  
  const data = clinicaDoc.data();
  const fechaSoloDia = fechaIntentoStr.split(' ')[0]; // Extrae YYYY-MM-DD

  // 1. COMPROBACIÓN DE BLOQUEOS GRANULARES (VACACIONES O HORAS SUELTAS)
  const bloqueosSnap = await db.collection('bloqueos')
    .where('clinic_id', '==', idClinica)
    .get();

  const [y, m, d] = fechaSoloDia.split('-').map(Number);
  const [hh, mm] = fechaIntentoStr.split(' ')[1].split(':').map(Number);
  const citaInicioTotalMin = hh * 60 + mm;
  const duracionMinutos = data.default_duration_min || 45;
  const citaFinTotalMin = citaInicioTotalMin + duracionMinutos;

  for (const doc of bloqueosSnap.docs) {
    const b = doc.data();
    // Bloqueo de día completo
    if (!b.hora_inicio && fechaSoloDia >= b.inicio && fechaSoloDia <= b.fin) {
      return { available: false, reason: `Cerrado por: ${b.motivo}` };
    }
    // Bloqueo por horas en un día específico
    if (b.hora_inicio && fechaSoloDia === b.inicio) {
      const [bh_ini, bm_ini] = b.hora_inicio.split(':').map(Number);
      const [bh_fin, bm_fin] = b.hora_fin.split(':').map(Number);
      const blockStart = bh_ini * 60 + bm_ini;
      const blockEnd = bh_fin * 60 + bm_fin;
      
      // Colisión: (CitaIn < BloqueoFin) Y (BloqueoIn < CitaFin)
      if (citaInicioTotalMin < blockEnd && blockStart < citaFinTotalMin) {
        return { available: false, reason: `Bloqueo horario: ${b.motivo}` };
      }
    }
  }

  // 2. HORARIO COMERCIAL SEMANAL (Sincro Madrid)
  const diaSemana = new Date(y, m - 1, d).getDay().toString();
  const horarioDia = data.weekly_schedule?.[diaSemana];
  if (!horarioDia || horarioDia.length === 0) return { available: false, reason: "Día no laborable" };

  let dentroDeHorario = false;
  for (const slot of horarioDia) {
    const [sh, sm] = slot.start.split(':').map(Number);
    const [eh, em] = slot.end.split(':').map(Number);
    if (citaInicioTotalMin >= (sh * 60 + sm) && citaFinTotalMin <= (eh * 60 + em)) {
      dentroDeHorario = true;
      break;
    }
  }
  if (!dentroDeHorario) return { available: false, reason: "Fuera de horario comercial" };

  // 3. COLISIONES CON OTRAS CITAS (Eficiencia de costes: solo consultamos hoy)
  // Usamos UTC puro para evitar desfases de la máquina del servidor
  const inicioMs = Date.UTC(y, m - 1, d, hh, mm);
  const finMs = inicioMs + (duracionMinutos * 60000);

  const citasHoy = await db.collection('citas')
    .where('clinic_id', '==', idClinica)
    .where('fecha_hora_inicio', '>=', fechaSoloDia) 
    .get();

  for (const doc of citasHoy.docs) {
    const c = doc.data();
    if (c.status === 'cancelada_por_expiracion' || c.status === 'cancelada') continue;
    
    // Ignorar citas amarillas expiradas
    if(c.status === 'pendiente_pago' && c.expira_el && Date.now() > c.expira_el.toMillis()) continue;

    const [cY, cM, cD] = c.fecha_hora_inicio.split(' ')[0].split('-').map(Number);
    const [cH, cMi] = c.fecha_hora_inicio.split(' ')[1].split(':').map(Number);
    const cIni = Date.UTC(cY, cM - 1, cD, cH, cMi);
    const cDur = c.duracion_minutos || 45;
    const cFin = cIni + (cDur * 60000);

    if (inicioMs < cFin && cIni < finMs) return { available: false, reason: "Hueco ya ocupado" };
  }

  return { available: true };
}
// ============================================================
// 🔄 6. PROCESAMIENTO UNIFICADO (ANA ENGINE - MODO ACCIÓN)
// ============================================================

async function procesarMensajeUnificado(idClinica, tlf, msg, isWhatsapp, req) {
  try {
    let currentID = idClinica;
    const tlfLimpio = normalizarTelefono(tlf);

    // 1. IDENTIFICACIÓN SOBERANA (¿Quién llama?)
    // Buscamos en la colección de pacientes usando el ID único [clinic_tlf]
    const pacienteRef = db.collection('pacientes').doc(`${currentID}_${tlfLimpio}`);
    const pacienteDoc = await pacienteRef.get();
    
    let identityMsg = "El paciente es nuevo. Pide su nombre y EMAIL obligatoriamente.";
    let nombreReconocido = null;

    if (pacienteDoc.exists) {
      nombreReconocido = pacienteDoc.data().nombre;
      identityMsg = `IMPORTANTE: Reconoces al paciente, se llama ${nombreReconocido}. No le preguntes su nombre. Salúdalo de forma cercana. Ya tienes su email en ficha.`;
      console.log(`👤 Identidad detectada en el palacio: ${nombreReconocido}`);
    }

    // 2. RECUPERACIÓN DE HISTORIAL (MEMORIA RECIENTE)
    const promptBase = await crearContextoAna(currentID);
    const chatsSnap = await db.collection('chats')
      .where('clinic_id', '==', currentID)
      .where('tlf', '==', tlfLimpio)
      .orderBy('ts', 'desc')
      .limit(6)
      .get();
    
    let historyTxt = "";
    chatsSnap.docs.reverse().forEach(d => {
      const data = d.data();
      historyTxt += `Usuario: ${data.usr}\nAna: ${data.ia}\n`;
    });

    // 3. CONSTRUCCIÓN DEL PROMPT FINAL Y LLAMADA AL CEREBRO
    const promptFinal = `${promptBase}\n\nSITUACIÓN DE IDENTIDAD:\n${identityMsg}\n\nHISTORIAL RECIENTE:\n${historyTxt}\nMENSAJE ACTUAL DEL USUARIO: "${msg}"`;

    const contents = [{ role: "user", parts: [{ text: promptFinal }] }];
    const iaReply = await callVertexAI(contents);
    let finalReply = iaReply;

    // 4. LÓGICA DE COMANDOS (RESERVA | ALERTA)
    // Captura: [1]Fecha, [2]Nombre, [3]Email
    const matchReserva = iaReply.match(/###\s*RESERVA\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*###/i);
    const matchAlerta = iaReply.match(/###\s*ALERTA\s*\|\s*(.*?)\s*###/i); 

    if (matchAlerta) {
      await crearAlerta(tlfLimpio, iaReply, currentID, matchAlerta[1].trim());
      finalReply = iaReply.replace(matchAlerta[0], "").trim();
    }

    if (matchReserva) {
      const fechaIntento = matchReserva[1].trim();
      const pacNombre = nombreReconocido || matchReserva[2].trim();
      const pacEmail = matchReserva[3].trim();

      // Validación de agenda física
      const check = await checkAgendaDeterminista(currentID, fechaIntento);

      if (!check.available) {
        finalReply = `Vaya, acabo de revisar la agenda y ese hueco no está disponible (${check.reason}). ¿Te viene bien probar otra hora?`;
      } else {
        // --- GESTIÓN DE BONOS (PAGO PREVIO) ---
        const bonoResult = await consultarYDescontarBono(tlfLimpio, currentID); 

        const citaData = { 
            paciente_telefono: tlfLimpio, 
            fecha: fechaIntento, 
            paciente_nombre: pacNombre,
            paciente_email: pacEmail,
            tipo_pago: bonoResult.bonoUsado ? 'Bono' : 'Pendiente',
            status: bonoResult.bonoUsado ? 'confirmada' : 'pendiente_pago',
            expira_el: Timestamp.fromDate(new Date(Date.now() + 12*3600000))
        };

        const citaId = await crearReserva(citaData, currentID, req);
        
        // Notificación inmediata al email (Confirmación o Recibo de solicitud)
        await enviarConfirmacionInmediata(citaData, currentID);

        if (bonoResult.bonoUsado) {
          finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ¡Cita confirmada! Se ha descontado de tu bono activo. Te quedan ${bonoResult.sesionesRestantes} sesiones.`;
        } else {
          // --- PROCESAMIENTO DE COBRO HÍBRIDO (STRIPE / BIZUM / CASH) ---
          const clinicaDoc = await db.collection('clinicas').doc(currentID).get();
          const cData = clinicaDoc.data();
          const fianza = parseInt(cData?.fianza_reserva || "15");

          // Escenario A: Stripe Connect (Automático)
          if (stripe && cData?.stripe_account_id) {
            try {
              const host = getDynamicHost(req);
              const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                  price_data: { 
                    currency: 'eur', 
                    product_data: { name: `Reserva Cita - ${cData.nombre_clinica}` }, 
                    unit_amount: fianza * 100 
                  },
                  quantity: 1,
                }],
                mode: 'payment',
                success_url: `${host}/dashboard?id=${currentID}&pago=ok`,
                cancel_url: `${host}/agenda/${currentID}`,
                metadata: { cita_id: citaId, tipo: "reserva_cita", clinic_id: currentID }
              });
              finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n💳 **Para confirmar, abona la señal de ${fianza}€ aquí:**\n${session.url}\n\n(El hueco se liberará en 12h si no se completa el pago).`;
            } catch(e) {
              console.error("Fallo Stripe en reserva:", e.message);
              await db.collection('citas').doc(citaId).update({ status: 'confirmada', tipo_pago: 'Presencial' });
              finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ¡Listo ${pacNombre}! Tu cita está confirmada. Abonarás la sesión directamente en la clínica.`;
            }
          } else {
            // Escenario B: Bizum o Efectivo (Manual)
            const prefiereBizum = cData?.metodos_pago?.includes('Bizum');
            const instruccion = prefiereBizum 
                ? `Por favor, haz un Bizum de ${fianza}€ al teléfono de la clínica para confirmar tu hueco. Avísame cuando lo tengas.`
                : `Tu cita ha sido pre-reservada con éxito. El pago se realizará en la clínica. ¡Te esperamos!`;
            
            finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ${instruccion}`;
          }
        }
      }
    }

    // 5. LIMPIEZA FINAL Y ENVÍO POR CANAL
    const cleanText = finalReply.replace(/###.*?###/g, '').trim();

    if (isWhatsapp && WHATSAPP_TOKEN) {
      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp', to: tlfLimpio, type: 'text', text: { body: cleanText }
      }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
    }

    await guardarLogChat(tlfLimpio, msg, cleanText, currentID);
    return { reply: cleanText };

  } catch (e) {
    console.error("❌ Error en Procesamiento Unificado:", e);
    return { reply: "Lo siento, mi conexión con el servidor de la clínica ha tenido un parpadeo. ¿Podrías repetirme para qué día querías la cita?" };
  }
}

// --- AYUDANTE DE NOTIFICACIÓN (PLAN A) ---
async function enviarConfirmacionInmediata(cita, idClinica) {
  try {
    const doc = await db.collection('clinicas').doc(idClinica).get();
    const info = doc.data();
    await transporter.sendMail({
      from: '"Ana de FisioTool" <ana@fisiotool.com>',
      to: cita.paciente_email,
      subject: `✅ Reserva recibida: ${info.nombre_clinica}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 15px; padding: 30px;">
          <h2 style="color: #0066ff;">¡Hola ${cita.paciente_nombre}!</h2>
          <p>Hemos registrado tu solicitud de cita para el día <strong>${cita.fecha}</strong>.</p>
          <p>Ubicación: ${info.direcciones?.[0]?.calle || 'Consultar clínica'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999;">FisioTool Pro Edition - Gestión de Salud Superior</p>
        </div>`
    });
  } catch (err) { console.error("❌ Error enviando mail de bienvenida:", err.message); }
}
// ============================================================
// 📲 7. FUNCIÓN ASÍNCRONA PARA WHATSAPP (CONEXIÓN EXTERNA)
// ============================================================

// Esta función procesa los mensajes de WhatsApp en segundo plano para no bloquear a Meta
async function procesarMensajeAsync(reqBody, clinicId) {
  try {
    if (!reqBody.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) return;
    
    const messageData = reqBody.entry[0].changes[0].value.messages[0];
    const tlf = messageData.from;
    const msg = messageData.text?.body;

    if (tlf && msg) {
      // Llamamos al motor unificado con flag de WhatsApp (isWhatsapp = true)
      await procesarMensajeUnificado(clinicId, tlf, msg, true, null);
    }
  } catch (e) {
    console.error("❌ Error en Procesador Async WhatsApp:", e.message);
  }
}

// ============================================================
// 🌐 8. ENDPOINTS DE INTERACCIÓN (CHATS Y CONFIG)
// ============================================================

// --- WEBHOOK WHATSAPP: VERIFICACIÓN (PASO OBLIGATORIO DE META) ---
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK VERIFICADO POR META");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// --- WEBHOOK WHATSAPP: RECEPCIÓN DE MENSAJES (PLAN B) ---
app.post('/webhook', async (req, res) => {
  // 📨 RESPONDER 200 OK INMEDIATAMENTE (Evita reenvíos de Meta por timeout)
  res.sendStatus(200); 

  const reqBody = req.body;
  
  // Detectamos a qué ID de teléfono va dirigido el mensaje (Soporte Multi-Sede Plan B)
  const phoneIDReceptor = reqBody.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
  
  try {
    let currentID = CLINIC_ID_DEFAULT;

    // LÓGICA PLAN B: Buscamos qué clínica es dueña de este PhoneID de Meta
    if (phoneIDReceptor) {
      const q = await db.collection('clinicas').where('wa_phone_id_pro', '==', phoneIDReceptor).limit(1).get();
      if (!q.empty) currentID = q.docs[0].id;
    }

    // El trabajo pesado se hace en segundo plano
    procesarMensajeAsync(reqBody, currentID);
    
  } catch (e) { console.error("Error identificando clínica en Webhook:", e); }
});

// --- API CHAT: EL MOTOR DE LA LANDING DE NEXT.JS (PLAN A) ---
app.post('/api/chat/:clinicId', async (req, res) => {
  const { message, patient_tlf } = req.body;
  const { clinicId } = req.params;

  if (!message || !patient_tlf) {
    return res.status(400).send({ error: "Faltan parámetros críticos (message, patient_tlf)." });
  }

  try {
    // El flag isWhatsapp es false (Plan A: Web)
    const result = await procesarMensajeUnificado(clinicId, patient_tlf, message, false, req); 
    res.json(result); 
  } catch (e) {
    res.status(500).json({ error: "Error en la transmisión con Ana." });
  }
});

// --- API CONFIG: ENTREGA DATOS DE MARCA AL FRONTEND ---
app.get('/api/config/:clinicId', async (req, res) => {
  const { clinicId } = req.params;
  try {
    let doc = await db.collection('clinicas').doc(clinicId).get();
    
    // Fallback por slug para permitir URLs amigables (fisiotool.com/clinica-murillo)
    if (!doc.exists) {
      const q = await db.collection('clinicas').where('slug', '==', clinicId).limit(1).get();
      if(!q.empty) doc = q.docs[0];
    }

    if (!doc.exists) return res.status(404).send({ error: "Clínica no encontrada en el sistema soberano." });

    const data = doc.data();
    res.json({
      id: doc.id,
      nombre_clinica: data.nombre_clinica,
      logo_url: data.logo_url,
      phone: data.phone,
      address: data.direcciones?.[0]?.calle || "Consultar clínica",
      weekly_schedule: data.weekly_schedule,
      default_duration_min: data.default_duration_min || 45,
      mi_codigo_referido: data.mi_codigo_referido || doc.id.substring(0,8).toUpperCase()
    });
  } catch (e) {
    res.status(500).send({ error: "Error al cargar configuración de palacio." });
  }
});