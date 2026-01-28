const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');
const nodemailer = require('nodemailer');
const multer = require('multer');
const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');
// ✅ ACTUALIZACIÓN: MAPEADO DE PLANES Y PRECIOS
const PLANES_STRIPE = {
    'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

// ==========================================
// 🏭 1. CONFIGURACIÓN TÉCNICA (NIVEL NASA)
// ==========================================
const PROJECT_ID_FIXED = 'spatial-victory-480409-b7';
const REGION_FIXED = 'europe-west1'; // Sincronizado con Bélgica para soberanía de datos
const DEV_MODE = process.env.DEV_MODE === 'true'; // Se activa solo si se define explícitamente
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

// --- INICIALIZACIÓN FIREBASE (IDENTIDAD NATIVA) ---
// Usamos applicationDefault para que Cloud Run use su propia identidad sin archivos JSON externos
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

// Definimos el modelo globalmente para que todas las funciones lo vean
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
} else {
    console.log("⚠️ AVISO: Stripe operando en modo Offline/Presencial");
}

// --- CONFIGURACIÓN MENSAJERÍA (SMTP) ---
const transporter = nodemailer.createTransport({
  host: "mail.fisiotool.com",
  port: 465,
  secure: true, // Puerto 465 exige SSL/TLS
  auth: { 
    user: "ana@fisiotool.com", 
    pass: process.env.EMAIL_PASS 
  }
});

// --- INICIALIZACIÓN DEL SERVIDOR (EXPRESS) ---
const app = express();
app.use(cors()); // Permite la comunicación Dashboard <-> API
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CONFIGURACIÓN DE CARROCERÍA (NEXT.JS SYNC) ---
// Buscamos la carpeta out del Ferrari visual de forma resiliente
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out'); // Fallback para despliegue en raíz
}
// ==========================================
// 🛠️ 2. UTILIDADES DE INGENIERÍA (PRECISIÓN NASA)
// ==========================================

// Limpieza de teléfonos: elimina prefijos y asegura formato puro para WhatsApp/CRM
function normalizarTelefono(tlf) {
  if (!tlf) return "";
  // Eliminamos cualquier carácter que no sea número
  let limpio = tlf.replace(/\D/g, '');
  // Si empieza por 34 (España) y tiene 11 dígitos, quitamos el 34
  if (limpio.startsWith('34') && limpio.length > 9) {
    limpio = limpio.substring(2);
  }
  return limpio.trim();
}

// Detector dinámico de Host: garantiza que el dinero (Stripe) siempre encuentre el camino de vuelta
function getDynamicHost(req) {
  const host = req.get('host');
  // En Cloud Run forzamos HTTPS para seguridad de grado médico
  if (host.includes('run.app') || process.env.NODE_ENV === 'production') {
    return `https://${host}`;
  }
  return `${req.protocol}://${host}`;
}

// FUNCIÓN MAESTRA: Habla con el Microchip de Google Vertex AI
async function callVertexAI(contents) {
  try {
    console.log("🤖 Ana está procesando información conductual...");
    
    // Formateamos para cumplir el protocolo estricto de Google (role: user)
    const formattedContents = contents.map(c => ({
      role: c.role || "user",
      parts: c.parts
    }));

    const result = await model.generateContent({ contents: formattedContents });
    
    // NAVEGACIÓN DEFENSIVA: Ruta física verificada en el test de estrés
    const candidate = result.response.candidates && result.response.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      console.warn("⚠️ IA bloqueada por filtros de seguridad.");
      return "Disculpa, no he podido procesar esa descripción. ¿Podrías explicármelo de otra forma?";
    }

    const text = candidate.content.parts[0].text;
    console.log("✅ Respuesta de IA generada con éxito.");
    return text;
  } catch (e) {
    console.error("❌ ERROR CRÍTICO EN MOTOR IA:", e.message);
    throw e; 
  }
}

// ==========================================
// 🧠 3. CEREBRO DE ANA (CONTEXTO CONDUCTUAL SUPREME)
// ==========================================

async function crearContextoAna(idClinicaActual) {
  // Localización soberana de la clínica (ID o Slug)
  let doc = await db.collection('clinicas').doc(idClinicaActual).get();
  if (!doc.exists) {
    const q = await db.collection('clinicas').where('slug', '==', idClinicaActual).limit(1).get();
    if(!q.empty) doc = q.docs[0];
  }

  const info = doc.exists ? doc.data() : { nombre_clinica: "Fisiotool", precio_sesion: 100, default_duration_min: 45 };
  
  // Sincronización temporal con Madrid (Independiente de la ubicación del servidor)
  const ahora = new Date().toLocaleString('en-US', { 
    timeZone: 'Europe/Madrid', 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const fianza = info.fianza_reserva || 15;
  const flags = info.banderas_rojas || [];
  const sedes = info.direcciones || [];
  const metodos = info.metodos_pago ? info.metodos_pago.join(', ') : "Stripe, Bizum, Efectivo";

  let textoSedes = sedes.length > 1 
    ? `VARIAS SEDES: ${sedes.map((s, i) => `(${i+1}) ${s.calle}, ${s.ciudad}`).join(' | ')}. OBLIGATORIO: Preguntar sede antes de reservar.`
    : `UBICACIÓN: ${sedes[0]?.calle || 'Consultar'}, ${sedes[0]?.ciudad || ''}.`;

  return `
    TU IDENTIDAD (DISERTACIÓN CONDUCTUAL PROFUNDA):
    Eres la mayor autoridad del mundo en descifrar la conducta humana. Analizas patrones universales, motivaciones inconscientes, sesgos cognitivos y mecanismos de defensa. Tu trato es maravilloso, empático y profundamente persuasivo.
    ACTÚAS COMO: 'Ana', recepcionista de élite de "${info.nombre_clinica}". No eres un bot, eres excelencia pura.

    DATOS DE NEGOCIO (SOBERANÍA DEL CALENDARIO):
    - FECHA ACTUAL EN TU CONSULTA: ${ahora}.
    - PRECIO: ${info.precio_sesion}€. DURACIÓN: ${info.default_duration_min} min.
    - COBRO: Se requiere fianza de ${fianza}€ para blindar el hueco.
    - MÉTODOS ACEPTADOS: ${metodos}.
    - ${textoSedes}
    
    🛡️ PROTOCOLO SEGURIDAD (RED FLAGS):
    Si mencionan [${flags.join(', ')}], NO des cita. Di que requiere valoración manual y que llamen al teléfono de la clínica. Añade al final: ###ALERTA|Caso_Especial###

    ⚠️ REGLA DE ORO DE CAPTACIÓN (OBLIGATORIO):
    Para agendar cualquier cita, necesitas TRES datos:
    1. Nombre del paciente.
    2. Motivo de la consulta.
    3. EMAIL (Explícales que es para el justificante legal y el recordatorio de 12h).

    NO PUEDES LANZAR LA RESERVA SIN EL EMAIL. Si no lo dan, pídelo educadamente.

    MANDAMIENTOS DE CIERRE:
    Cuando tengas Fecha/Hora, Nombre y EMAIL, usa: 
    ###RESERVA|YYYY-MM-DD HH:mm|Nombre|Email###
  `;
}
// ============================================================
// 💾 4. HELPERS DE BASE DE DATOS (ESTRUCTURA SOBERANA)
// ============================================================

// Graba la reserva con blindaje legal RGPD v1.1
async function crearReserva(datos, idClinica, req) {
  try {
    let doc = await db.collection('clinicas').doc(idClinica).get();
    if(!doc.exists) {
      const q = await db.collection('clinicas').where('slug', '==', idClinica).limit(1).get();
      if(!q.empty) doc = q.docs[0];
    }
    const info = doc.data();
    const duracion = info?.default_duration_min || 45;
    
    // Captura de IP Real para el rastro legal
    const clientIp = req?.headers['x-forwarded-for'] || req?.ip || "unknown";

    const ref = await db.collection('citas').add({ 
      ...datos, 
      clinic_id: idClinica, 
      nombre_clinica: info?.nombre_clinica || "FisioTool",
      fecha_hora_inicio: datos.fecha, // Guardado como String YYYY-MM-DD HH:mm para soberanía horaria
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

// Registro histórico de la conversación
async function guardarLogChat(tlf, usr, ia, idClinica) {
  try {
    await db.collection('chats').add({ 
      tlf, usr, ia, clinic_id: idClinica, ts: admin.firestore.Timestamp.now() 
    });
  } catch (e) { console.error("❌ Error en Log de Inteligencia:", e); }
}

// Emisión de alertas por Banderas Rojas
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
    console.log("🚨 Alerta de seguridad emitida.");
  } catch (e) { console.error("❌ Error en Sistema de Alertas:", e); }
}

// Gestión de Bonos (Fidelización)
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

// EL MOTOR DEL TIEMPO: Comprueba disponibilidad ignorando el desfase del servidor
async function checkAgendaDeterminista(idClinica, fechaIntentoStr) {
  let clinicaDoc = await db.collection('clinicas').doc(idClinica).get();
  if(!clinicaDoc.exists) {
    const q = await db.collection('clinicas').where('slug', '==', idClinica).limit(1).get();
    if(!q.empty) clinicaDoc = q.docs[0];
    else return { available: false, reason: "clínica no disponible" };
  }
  
  const clinicaData = clinicaDoc.data();
  const fechaSoloDia = fechaIntentoStr.split(' ')[0]; // Extrae YYYY-MM-DD

  // 1. COMPROBACIÓN DE BLOQUEOS (VACACIONES/FESTIVOS)
  const bloqueosSnap = await db.collection('bloqueos')
    .where('clinic_id', '==', idClinica)
    .where('inicio', '<=', fechaSoloDia)
    .get();

  for (const doc of bloqueosSnap.docs) {
    const b = doc.data();
    if (fechaSoloDia >= b.inicio && fechaSoloDia <= b.fin) {
      return { available: false, reason: `estamos cerrados por ${b.motivo}` };
    }
  }

  // 2. MATEMÁTICA DE HORARIO (Sincronización Madrid)
  const [y, m, d] = fechaSoloDia.split('-').map(Number);
  const [hh, mm] = fechaIntentoStr.split(' ')[1].split(':').map(Number);
  const diaSemana = new Date(y, m - 1, d).getDay().toString();
  const horarioDia = clinicaData?.weekly_schedule?.[diaSemana];

  if (!horarioDia || horarioDia.length === 0) return { available: false, reason: "está cerrado por calendario" };

  const duracionMinutos = clinicaData?.default_duration_min || 45;
  const citaStartMin = (hh * 60) + mm;
  const citaEndMin = citaStartMin + duracionMinutos;

  let dentroHorario = false;
  for (const slot of horarioDia) {
    const [sh, sm] = slot.start.split(':').map(Number);
    const [eh, em] = slot.end.split(':').map(Number);
    if (citaStartMin >= (sh * 60 + sm) && citaEndMin <= (eh * 60 + em)) {
      dentroHorario = true;
      break;
    }
  }
  if (!dentroHorario) return { available: false, reason: "fuera de horario comercial" };

  // 3. COLISIONES (Eficiencia de costes: solo consultamos hoy)
  const inicioMs = Date.UTC(y, m-1, d, hh, mm);
  const finMs = inicioMs + (duracionMinutos * 60000);

  const citasConflicto = await db.collection('citas')
    .where('clinic_id', '==', idClinica)
    .where('fecha_hora_inicio', '>=', fechaSoloDia) 
    .where('status', 'in', ['confirmada', 'pendiente_pago', 'pendiente_confirmacion'])
    .get();

  for (const doc of citasConflicto.docs) {
    const c = doc.data();
    // Descartamos citas amarillas que ya expiraron (liberación de hueco instantánea)
    if(c.status === 'pendiente_pago' && c.expira_el && Date.now() > c.expira_el.toMillis()) continue;

    const [cY, cM, cD] = c.fecha_hora_inicio.split(' ')[0].split('-').map(Number);
    const [cH, cMin] = c.fecha_hora_inicio.split(' ')[1].split(':').map(Number);
    const cInicio = Date.UTC(cY, cM-1, cD, cH, cMin);
    const cFin = cInicio + (c.duracion_minutos || 45) * 60000;

    if (inicioMs < cFin && cInicio < finMs) return { available: false, reason: "el hueco ya está ocupado" };
  }

  return { available: true };
}
// ==========================================
// 🔄 6. PROCESAMIENTO UNIFICADO (ANA ENGINE)
// ==========================================

async function procesarMensajeUnificado(idClinica, tlf, msg, isWhatsapp, req) {
  try {
    let currentID = idClinica;
    const tlfLimpio = normalizarTelefono(tlf);

    // 1. IDENTIFICACIÓN SOBERANA (¿Quién llama?)
    // Buscamos en la colección de pacientes usando el ID único de identidad
    const pacienteRef = db.collection('pacientes').doc(`${currentID}_${tlfLimpio}`);
    const pacienteDoc = await pacienteRef.get();
    
    let identityMsg = "El paciente es nuevo. Pide su nombre y email.";
    let nombreReconocido = null;

    if (pacienteDoc.exists) {
      nombreReconocido = pacienteDoc.data().nombre;
      identityMsg = `IMPORTANTE: Reconoces al paciente, se llama ${nombreReconocido}. No le preguntes su nombre. Salúdalo de forma cercana. Ya tienes su ficha técnica.`;
      console.log(`👤 Identidad detectada en el palacio: ${nombreReconocido}`);
    }

    // 2. RECUPERACIÓN DE HISTORIAL (MEMORIA DE CORTO PLAZO)
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

    // 3. CONSTRUCCIÓN DEL PROMPT Y LLAMADA A LA IA
    const promptFinal = `${promptBase}\n\nSITUACIÓN DE IDENTIDAD:\n${identityMsg}\n\nHISTORIAL RECIENTE:\n${historyTxt}\nMENSAJE ACTUAL DEL USUARIO: "${msg}"`;

    const contents = [{ role: "user", parts: [{ text: promptFinal }] }];
    const iaReply = await callVertexAI(contents);
    let finalReply = iaReply;

    // 4. LÓGICA DE COMANDOS (RESERVA | ALERTA)
    // Regex blindada para 3 grupos: [1]Fecha, [2]Nombre, [3]Email
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

      // Verificamos agenda con matemática pura
      const check = await checkAgendaDeterminista(currentID, fechaIntento);

      if (!check.available) {
        finalReply = `Vaya, acabo de revisar la agenda en tiempo real y ese hueco no está disponible (${check.reason}). ¿Te viene bien probar otra hora?`;
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
            expira_el: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 12*3600000))
        };

        const citaId = await crearReserva(citaData, currentID, req);
        
        // Notificación inmediata al email (Plan A)
        await enviarConfirmacionInmediata(citaData, currentID);

        if (bonoResult.bonoUsado) {
          finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ¡Cita confirmada! Se ha descontado de tu bono activo. Te quedan ${bonoResult.sesionesRestantes} sesiones.`;
        } else {
          // --- PROCESAMIENTO DE COBRO HÍBRIDO (STRIPE / BIZUM) ---
          const clinicaDoc = await db.collection('clinicas').doc(currentID).get();
          const cData = clinicaDoc.data();
          const fianza = parseInt(cData?.fianza_reserva || "15");

          // Si el fisio tiene Stripe activo
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
                metadata: { cita_id: citaId, tipo: "reserva_cita" }
              });
              finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n💳 **Para confirmar, abona la señal de ${fianza}€ aquí:**\n${session.url}\n\n(El hueco se liberará en 12h si no se completa el pago).`;
            } catch(e) {
              // Fallback si falla Stripe: Modo Manual
              await db.collection('citas').doc(citaId).update({ status: 'confirmada', tipo_pago: 'Presencial (Error Stripe)' });
              finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ¡Todo listo ${pacNombre}! Tu cita está confirmada. Abonarás la sesión directamente en la clínica.`;
            }
          } else {
            // Modo Bizum o Efectivo (Manual)
            const instruccion = cData?.metodos_pago?.includes('Bizum') 
                ? `Por favor, haz un Bizum de ${fianza}€ al número de la clínica para confirmar.`
                : `Tu cita está pre-reservada. Te esperamos en la clínica.`;
            
            finalReply = iaReply.replace(matchReserva[0], "").trim() + `\n\n✅ ${instruccion}`;
          }
        }
      }
    }

    // 5. LIMPIEZA FINAL Y ENVÍO
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
    return { reply: "Lo siento, mi conexión con la clínica ha tenido un breve parpadeo. ¿Podrías repetirme para qué día querías la cita?" };
  }
}

// Ayudante de envío de confirmación (Utilizado arriba)
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
          <p>Hemos recibido tu solicitud de cita para el día <strong>${cita.fecha}</strong>.</p>
          <p>Si es una reserva con fianza, recuerda que tienes 12 horas para abonarla o el sistema liberará el hueco.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Ubicación: ${info.direcciones?.[0]?.calle || 'Consultar clínica'}</p>
        </div>`
    });
  } catch (err) { console.error("❌ Error enviando mail informativo:", err.message); }
}
// ============================================================
// 📲 7. FUNCIÓN ASÍNCRONA PARA WHATSAPP (CONEXIÓN EXTERNA)
// ============================================================

// Esta función procesa los mensajes de WhatsApp en segundo plano
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

// --- WEBHOOK WHATSAPP: VERIFICACIÓN (META) ---
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
  // 📨 RESPONDER INMEDIATAMENTE (Evita que Meta reenvíe el mensaje si tardamos)
  res.sendStatus(200); 

  const reqBody = req.body;
  
  // Detectamos a qué número de teléfono va dirigido el mensaje (Para el Plan B)
  const phoneIDReceptor = reqBody.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
  
  try {
    let currentID = CLINIC_ID_DEFAULT;

    // LÓGICA PLAN B: Buscamos qué clínica es dueña de ese PhoneID
    if (phoneIDReceptor) {
      const q = await db.collection('clinicas').where('wa_phone_id_pro', '==', phoneIDReceptor).limit(1).get();
      if (!q.empty) currentID = q.docs[0].id;
    }

    // Ejecutamos el procesamiento en segundo plano para no bloquear el Webhook
    procesarMensajeAsync(reqBody, currentID);
    
  } catch (e) { console.error("Error identificando clínica en Webhook:", e); }
});

// --- API CHAT: EL MOTOR DEL LANDINGBOT (PLAN A) ---
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
    res.status(500).json({ error: "Error en el cerebro de Ana." });
  }
});

// --- API CONFIG: ENTREGA DATOS AL FRONTEND ---
app.get('/api/config/:clinicId', async (req, res) => {
  const { clinicId } = req.params;
  try {
    let doc = await db.collection('clinicas').doc(clinicId).get();
    
    // Fallback por slug si no se encuentra por ID directo
    if (!doc.exists) {
      const q = await db.collection('clinicas').where('slug', '==', clinicId).limit(1).get();
      if(!q.empty) doc = q.docs[0];
    }

    if (!doc.exists) return res.status(404).send({ error: "Clínica no encontrada." });

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
    res.status(500).send({ error: "Error al cargar configuración." });
  }
});
// ============================================================
// 📝 9. REGISTRO DE NUEVA CLÍNICA (ESTRATEGIA 100€ + TRIAL)
// ============================================================

app.post('/api/register', async (req, res) => {
  const d = req.body;
  
  try {
    // 1. GENERACIÓN DE IDENTIDAD SOBERANA (SLUG)
    let slug = d.nombre_clinica.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Verificación de unicidad del slug para evitar colisiones
    const existe = await db.collection('clinicas').where('slug', '==', slug).get();
    if (!existe.empty) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 2. CONFIGURACIÓN DE HORARIOS
    const slots = d.descanso_mediodia === 'si' 
      ? [{start: d.hora_apertura, end: d.descanso_inicio}, {start: d.descanso_fin, end: d.hora_cierre}] 
      : [{start: d.hora_apertura, end: d.hora_cierre}];

    const miCodigoReferido = 'FT-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    const newClinicData = {
      nombre_clinica: d.nombre_clinica, 
      slug, 
      email: d.email, 
      password: d.password, // Nota: Se recomienda hashear en producción
      precio_sesion: parseInt(d.precio || 100), 
      fianza_reserva: parseInt(d.fianza || 15),
      default_duration_min: parseInt(d.duracion || 45),
      banderas_rojas: d.banderas_rojas ? d.banderas_rojas.split(',') : [],
      metodos_pago: d.metodos_pago || ['Efectivo'],
      weekly_schedule: { "1": slots, "2": slots, "3": slots, "4": slots, "5": slots, "6": [], "0": [] },
      direcciones: [{ calle: d.calle, numero: d.numero, cp: d.cp, ciudad: d.ciudad, provincia: d.provincia, principal: true }],
      mi_codigo_referido: miCodigoReferido,
      created_at: admin.firestore.Timestamp.now(), 
      status: 'pendiente_pago', // Se activa tras el pago/trial exitoso
      aceptacion_legal: { aceptado: true, fecha: admin.firestore.Timestamp.now() }
    };
    // 1. Guardamos la clínica en la base de datos para obtener su ID real
    const ref = await db.collection('clinicas').add(newClinicData);

    // 2. ==========================================
    // 💳 INTEGRACIÓN STRIPE MULTI-PLAN (CON TRIAL)
    // ==========================================
    if (stripe) {
      const planElegido = d.plan || 'solo'; // 'solo', 'team' o 'clinic'
      const priceId = PLANES_STRIPE[planElegido] || PLANES_STRIPE['solo'];

      const sessionConfig = {
        payment_method_types: ['card'],
        customer_email: d.email,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 30, // 🎁 30 días gratis para todos
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
          metadata: {
            clinic_id: ref.id,
            referente_id: (planElegido === 'solo' && d.codigo_invitacion) ? d.codigo_invitacion : ""
          }
        },
        payment_method_collection: 'always',
        success_url: `${getDynamicHost(req)}/dashboard?id=${ref.id}&pago=ok`,
        cancel_url: `${getDynamicHost(req)}/setup?error=pago_cancelado`,
        metadata: { 
            clinic_id: ref.id, 
            tipo: 'suscripcion',
            referente_id: (planElegido === 'solo' && d.codigo_invitacion) ? d.codigo_invitacion : ""
        }
      };

      // Si es el plan SOLO y trae referido, aplicamos el cupón del 50%
      if (planElegido === 'solo' && d.codigo_invitacion) {
        sessionConfig.subscription_data.discounts = [{ coupon: 'feMDHJlj' }];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);
      console.log(`🚀 Checkout generado (${planElegido}) para: ${d.nombre_clinica}`);
      return res.json({ success: true, payment_url: session.url });
    }

    // Fallback si Stripe no está activo
    res.json({ success: true, dashboard_url: `/dashboard?id=${ref.id}` });

    const ref = await db.collection('clinicas').add(newClinicData);

    // 3. GENERACIÓN DE SESIÓN DE PAGO (STRIPE CONNECT READY)
    if (stripe) {
      const sessionData = {
        payment_method_types: ['card'],
        customer_email: d.email,
        line_items: [{
          price: 'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // ✅ Tu ID de precio de 100€
          quantity: 1,
        }],
        mode: 'subscription',
        subscription_data: {
          trial_period_days: 30, // 🎁 30 días gratis
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
          metadata: {
            referente_id: d.codigo_invitacion || "" // Huella del amigo para el premio final
          }
        },
        payment_method_collection: 'always',
        success_url: `${getDynamicHost(req)}/dashboard?id=${ref.id}&pago=ok`,
        cancel_url: `${getDynamicHost(req)}/setup?error=pago_cancelado`,
        metadata: { 
            clinic_id: ref.id, 
            tipo: 'suscripcion',
            referente_id: d.codigo_invitacion || "" 
        }
      };

      // Si viene con invitación, aplicamos el cupón del 50% al nuevo cliente
      if (d.codigo_invitacion) {
        sessionData.subscription_data.discounts = [{
          coupon: 'feMDHJlj', // ✅ Tu cupón de 50%
        }];
      }

      const session = await stripe.checkout.sessions.create(sessionData);
      
      console.log(`🚀 Suscripción generada para: ${d.nombre_clinica}`);
      return res.json({ success: true, payment_url: session.url });
    }

    // Fallback si Stripe no está configurado (Modo Desarrollo)
    res.json({ success: true, dashboard_url: `/dashboard?id=${ref.id}` });

  } catch(e) { 
    console.error("❌ Error en Registro Maestro:", e);
    res.status(500).json({ error: e.message }); 
  }
});
// ============================================================
// 🔄 10. WEBHOOK VIGILANTE DE STRIPE (CIERRE DE CICLO)
// ============================================================

app.post('/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (DEV_MODE) return res.status(200).send("Webhook ignorado en DEV");

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificación de Firma (Garantiza que el mensaje viene de Stripe y no de un hacker)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Error de Firma Webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // --- EVENTO A: ALTA INICIAL (Checkout Completado) ---
    // Esto ocurre nada más registrarse (aunque sea con 0€ de Trial)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { tipo, cita_id, clinic_id, referente_id } = session.metadata;

      // CASO 1: Pago de Fianza de un Paciente
      if (tipo === 'reserva_cita') {
        const citaRef = db.collection('citas').doc(cita_id);
        const snap = await citaRef.get();
        await citaRef.update({ 
          status: 'confirmada', 
          tipo_pago: 'Stripe Online', 
          pagado_el: admin.firestore.Timestamp.now() 
        });
        if (snap.exists) await enviarConfirmacionInmediata(snap.data(), clinic_id);
        console.log(`✅ Dinero de paciente recibido. Cita ${cita_id} confirmada.`);
      } 
      
      // CASO 2: Alta de nueva Clínica
      else if (tipo === 'suscripcion') {
        const clinicaRef = db.collection('clinicas').doc(clinic_id);
        const snap = await clinicaRef.get();
        const cData = snap.data();

        await clinicaRef.update({ 
          status: 'activo', 
          suscripcion_id: session.subscription,
          stripe_customer_id: session.customer,
          activado_el: admin.firestore.Timestamp.now(),
          referente_id_pendiente: referente_id || "" // Guardamos la huella para la Fase C
        });

        if (cData && cData.email) {
          await enviarEmailBienvenida(cData.email, cData.nombre_clinica, clinic_id);
        }
        console.log(`🚀 El Ferrari de ${cData?.nombre_clinica} ha sido activado.`);
      }
    }

    // --- EVENTO B: COBRO DE FACTURA (Recompensa al Referente) ---
    // Este evento salta cuando el dinero real se cobra (al día 31 tras el trial)
    if (event.type === 'invoice.paid') {
      const factura = event.data.object;

      // Solo actuamos si es un pago recurrente mayor a 0€
      if (factura.subscription && factura.amount_paid > 0) {
        // Recuperamos la suscripción para leer los metadatos que guardamos en la Fase 6
        const suscripcion = await stripe.subscriptions.retrieve(factura.subscription);
        const idReferente = suscripcion.metadata.referente_id;

        if (idReferente && idReferente !== "") {
          console.log(`💰 ¡Dinero real recibido! Recompensando al referente: ${idReferente}`);
          
          const refDoc = await db.collection('clinicas').doc(idReferente).get();
          if (refDoc.exists && refDoc.data().suscripcion_id) {
            // Aplicamos el cupón del 50% a la próxima factura del amigo referente
            await stripe.subscriptions.update(refDoc.data().suscripcion_id, {
              coupon: 'feMDHJlj', // ✅ Tu ID de cupón del 50%
            });
            console.log(`🎟️ Recompensa aplicada con éxito a: ${refDoc.data().nombre_clinica}`);
          }
        }
      }
    }

    res.json({ received: true });

  } catch (error) {
    console.error("🔥 ERROR INTERNO EN EL VIGILANTE:", error.message);
    res.status(500).send("Internal Server Error");
  }
});
// ============================================================
// 💳 11. MOTOR STRIPE CONNECT (COBRO DIRECTO PARA FISIOS)
// ============================================================

app.post('/api/stripe/onboard', async (req, res) => {
  const { clinic_id } = req.body;
  if (!clinic_id) return res.status(400).send("ID de clínica requerido.");

  try {
    // 1. Creamos una cuenta conectada tipo Express para el fisio
    const account = await stripe.accounts.create({ 
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // 2. Generamos el link de alta rápida (5 minutos)
    const host = getDynamicHost(req);
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${host}/dashboard?id=${clinic_id}&stripe=retry`,
      return_url: `${host}/dashboard?id=${clinic_id}&stripe=success`,
      type: 'account_onboarding',
    });

    // 3. Guardamos el ID en su ficha soberana
    await db.collection('clinicas').doc(clinic_id).update({ 
        stripe_connect_id: account.id,
        pago_configurado: false 
    });

    res.json({ url: accountLink.url });
  } catch (e) {
    console.error("❌ Error en Stripe Connect:", e.message);
    res.status(500).send("No se pudo iniciar el alta de cobros.");
  }
});

// ============================================================
// 🕵️‍♂️ 12. THE FOUNDRY: MONITORIZACIÓN GLOBAL (VISTA DE DIOS)
// ============================================================

app.get('/api/admin/stats-globales', async (req, res) => {
  try {
    const clinicasSnap = await db.collection('clinicas').get();
    const citasSnap = await db.collection('citas').get();
    
    let mrr = 0; // Ingreso Mensual Recurrente
    const listaClinicas = [];

    clinicasSnap.forEach(doc => {
      const d = doc.data();
      listaClinicas.push({
        id: doc.id,
        nombre: d.nombre_clinica,
        email: d.email,
        status: d.status,
        fecha: d.created_at?.toDate().toLocaleDateString() || 'Antigua'
      });
      // Solo sumamos al MRR las clínicas que han pasado el trial
      if (d.status === 'activo') mrr += 100;
    });

    res.json({
      success: true,
      stats: {
        totalClinicas: clinicasSnap.size,
        totalCitasAna: citasSnap.size,
        mrr: mrr + "€"
      },
      clinicas: listaClinicas
    });
  } catch (e) { 
    console.error("❌ Error en Foundry Stats:", e.message);
    res.status(500).send("Fallo en la lectura global."); 
  }
});

// ============================================================
// 🧠 13. ANA ASSISTANT: CONSULTORÍA ESTRATÉGICA 24/7
// ============================================================

app.post('/api/dashboard/ana-assistant', async (req, res) => {
  const { clinic_id, message } = req.body;
  if (!clinic_id || !message) return res.status(400).send("Faltan datos.");

  try {
    const doc = await db.collection('clinicas').doc(clinic_id).get();
    if (!doc.exists) return res.status(404).send("Clínica no encontrada.");
    const info = doc.data();
    
    // Recuperamos datos reales para que Ana asesore con base científica
    const citasSnap = await db.collection('citas').where('clinic_id', '==', clinic_id).get();

    const promptAsistente = `
      Eres la Consultora de Élite para el dueño de la clínica "${info.nombre_clinica}".
      Tu Identidad Conductual Profunda se aplica ahora para ayudar al profesional a escalar su negocio.
      
      DATOS DE LA CLÍNICA:
      - Pacientes en sistema: ${citasSnap.size}
      - Precio sesión: ${info.precio_sesion}€
      - Localización: ${info.direcciones?.[0]?.ciudad || "No definida"}

      MISIÓN: Responder dudas sobre gestión, psicología de pacientes difíciles, o estrategias para aumentar la rentabilidad. 
      Sé su mano derecha, analítica y brillante.
      
      MENSAJE DEL PROFESIONAL: "${message}"
    `;

    const respuesta = await callVertexAI([{ role: 'user', parts: [{ text: promptAsistente }] }]);
    res.json({ success: true, reply: respuesta });
    
  } catch (e) {
    console.error("❌ Error en Consultoría Ana:", e.message);
    res.status(500).send("Ana está procesando otros datos, reintenta.");
  }
});
// ============================================================
// 📊 14. ENDPOINTS DEL DASHBOARD: OPERACIONES Y CRM
// ============================================================

// --- LISTADO DE PACIENTES (OPTIMIZADO PARA VELOCIDAD) ---
app.get('/api/dashboard/pacientes', async (req, res) => {
  const { clinic_id } = req.query;
  if (!clinic_id) return res.status(400).send("clinic_id requerido.");

  try {
    // Leemos de la colección soberana de pacientes (instantáneo)
    const snap = await db.collection('pacientes')
      .where('clinic_id', '==', clinic_id)
      .orderBy('creado_el', 'desc')
      .get();

    const lista = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Formateamos la fecha para el chasis de Next.js
      fecha_alta: doc.data().creado_el?.toDate().toLocaleDateString() || 'N/A'
    }));

    res.json(lista);
  } catch (e) {
    console.error("❌ Error en lectura CRM:", e.message);
    res.status(500).json([]);
  }
});

// --- INFO DETALLADA DEL PACIENTE (HISTORIAL + CHATS) ---
app.get('/api/dashboard/paciente-info', async (req, res) => {
  const { clinic_id, telefono } = req.query;
  const tlfLimpio = normalizarTelefono(telefono);

  try {
    // 1. Recuperamos las Notas Clínicas (Dictados de voz)
    const notasSnap = await db.collection('notas_clinicas')
      .where('clinic_id', '==', clinic_id)
      .where('paciente_tlf', '==', tlfLimpio)
      .orderBy('creado', 'desc')
      .get();

    const notas = notasSnap.docs.map(d => ({
      contenido: d.data().contenido,
      creado: d.data().creado?.toDate().toISOString()
    }));

    // 2. Recuperamos los últimos 15 chats con Ana
    const chatsSnap = await db.collection('chats')
      .where('clinic_id', '==', clinic_id)
      .where('tlf', '==', tlfLimpio)
      .orderBy('ts', 'desc')
      .limit(15)
      .get();

    const chats = chatsSnap.docs.map(d => ({
      msg: d.data().usr,
      reply: d.data().ia,
      ts: d.data().ts?.toDate().toISOString()
    }));

    res.json({ notas, chats });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- MOTOR DE IMPORTACIÓN MASIVA (GRADO OMEGA) ---
app.post('/api/dashboard/importar-pacientes', async (req, res) => {
  const { clinic_id, pacientes } = req.body; 
  if (!pacientes || !Array.isArray(pacientes)) return res.status(400).send("Datos inválidos.");

  try {
    // Fraccionamos en lotes de 500 para cumplir con la ley de Google Firestore
    const chunks = [];
    for (let i = 0; i < pacientes.length; i += 500) {
      chunks.push(pacientes.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = db.batch();
      chunk.forEach(p => {
        const tlf = normalizarTelefono(p.telefono);
        if (tlf) {
          const ref = db.collection('pacientes').doc(`${clinic_id}_${tlf}`);
          batch.set(ref, {
            clinic_id,
            nombre: p.nombre.trim(),
            telefono: tlf,
            email: p.email?.toLowerCase().trim() || "",
            creado_el: admin.firestore.Timestamp.now(),
            origen: "importacion_masiva"
          }, { merge: true });
        }
      });
      await batch.commit();
    }

    console.log(`📦 Lotes procesados: ${pacientes.length} pacientes.`);
    res.json({ success: true, total: pacientes.length });
  } catch (e) { res.status(500).send(e.message); }
});

// --- EMISIÓN DE BONOS DE SESIONES ---
app.post('/api/dashboard/vender-bono', async (req, res) => {
  const { clinic_id, telefono, nombre, sesiones } = req.body;
  try {
    const tlfLimpio = normalizarTelefono(telefono);
    await db.collection('bonos').add({
      clinic_id,
      paciente_tlf: tlfLimpio,
      paciente_nombre: nombre,
      sesiones_disponibles: parseInt(sesiones),
      total_sesiones: parseInt(sesiones),
      fecha_compra: admin.firestore.Timestamp.now(),
      status: 'activo'
    });
    res.json({ success: true });
  } catch (e) { res.status(500).send(e.message); }
});

// --- GUARDADO DE NOTAS CLÍNICAS (SINCRO CON T-2) ---
app.post('/api/dashboard/guardar-nota', async (req, res) => {
  const { clinic_id, telefono, nombre, texto } = req.body;
  try {
    const tlfLimpio = normalizarTelefono(telefono);
    await db.collection('notas_clinicas').add({
      clinic_id,
      paciente_tlf: tlfLimpio,
      paciente_nombre: nombre,
      contenido: texto.trim(),
      creado: admin.firestore.Timestamp.now(),
      metodo: 'dictado_voz'
    });
    // Actualizamos el rastro en el CRM
    await db.collection('pacientes').doc(`${clinic_id}_${tlfLimpio}`).set({
      ultima_visita: admin.firestore.Timestamp.now()
    }, { merge: true });
    res.json({ success: true });
  } catch (e) { res.status(500).send(e.message); }
});
// ============================================================
// ⏰ 15. MOTOR CENTINELA INTEGRAL (EL SHERIFF DEL PALACIO)
// ============================================================

app.post('/api/tasks/centinela', async (req, res) => {
  console.log("👁️ Centinela: Iniciando patrulla de seguridad y ventas...");
  
  try {
    const ahora = new Date();
    // Sincronización horaria con el huso de la clínica (Madrid)
    const horaMadrid = parseInt(new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false
    }).format(ahora));

    const esHorarioComercial = (horaMadrid >= 8 && horaMadrid < 21);

    // --- FASE A: LIMPIEZA DE IMPAGOS (24/7) ---
    const expiradasSnap = await db.collection('citas')
      .where('status', '==', 'pendiente_pago')
      .where('expira_el', '<=', ahora)
      .get();

    for (const doc of expiradasSnap.docs) {
      await doc.ref.update({ 
        status: 'cancelada_por_expiracion',
        cancelado_el: admin.firestore.Timestamp.now()
      });
      console.log(`🗑️ Cita liberada por tiempo excedido: ${doc.id}`);
    }

    // --- FASES B Y C: COMUNICACIONES (SOLO EN HORARIO DE VIDA) ---
    let recordatoriosCount = 0;
    let prospeccionesCount = 0;

    if (esHorarioComercial) {
      
      // 1. AVISO DEL JUICIO FINAL (1 hora antes de expirar)
      const proximaHora = new Date(ahora.getTime() + (60 * 60 * 1000));
      const pendientesSnap = await db.collection('citas')
        .where('status', '==', 'pendiente_pago')
        .where('recordatorio_enviado', '==', false)
        .where('expira_el', '<=', proximaHora)
        .get();

      for (const doc of pendientesSnap.docs) {
        const cita = doc.data();
        await enviarAvisoJuicioFinal(cita);
        await doc.ref.update({ recordatorio_enviado: true });
        recordatoriosCount++;
      }

      // 2. GOTEO DE PROSPECCIÓN ASG (Crecimiento del SaaS)
      // Enviamos de 3 en 3 cada 30 min para proteger tu número de baneo
      const prospectosSnap = await db.collection('prospectos')
        .where('estado', '==', 'frio')
        .limit(3)
        .get();

      for (const doc of prospectosSnap.docs) {
        try {
          await enviarPlantillaProspeccion(doc.data());
          await doc.ref.update({ 
            estado: 'wa_enviado', 
            ultima_accion: admin.firestore.Timestamp.now(),
            intentos: 1 
          });
          prospeccionesCount++;
        } catch (e) { console.error("❌ Error goteo ASG:", e.message); }
      }
    }

    res.json({ 
      success: true, 
      resumen: {
        canceladas: expiradasSnap.size,
        recordatorios: recordatoriosCount,
        prospeccion: prospeccionesCount,
        hora_madrid: horaMadrid
      }
    });

  } catch (e) {
    console.error("🔥 Error Centinela Integral:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// 🎯 16. MOTOR ASG (AI SALES GENERATOR) Y HELPERS
// ============================================================

// Envío de Plantilla WhatsApp (Prospección)
async function enviarPlantillaProspeccion(prospecto) {
  const URL = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  await axios.post(URL, {
    messaging_product: "whatsapp",
    to: prospecto.telefono,
    type: "template",
    template: {
      name: "mensaje_prospeccion_1",
      language: { code: "es" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: prospecto.nombre_contacto }, // {{1}}
          { type: "text", text: prospecto.ciudad }            // {{2}}
        ]
      }]
    }
  }, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
}

// Envío de Aviso de Expiración (Email + Estructura PWA)
async function enviarAvisoJuicioFinal(cita) {
  try {
    await transporter.sendMail({
      from: '"Ana de FisioTool" <ana@fisiotool.com>',
      to: cita.paciente_email,
      subject: "⚠️ ÚLTIMA HORA: Tu reserva en FisioTool expira pronto",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #0066ff; padding: 30px; text-align: center; color: white;">
            <h2 style="margin: 0;">Confirmación Urgente</h2>
          </div>
          <div style="padding: 40px; color: #333;">
            <p>Hola <strong>${cita.paciente_nombre}</strong>,</p>
            <p>Tu reserva para el <strong>${cita.fecha_hora_inicio}</strong> está a punto de ser liberada.</p>
            <p>Solo queda <strong>1 HORA</strong> para confirmar el abono de la señal o el hueco se entregará a otro paciente.</p>
            <a href="https://fisiotool-1050901900632.us-central1.run.app/agenda/${cita.clinic_id}" 
               style="background: #0066ff; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin-top: 20px;">
               ASEGURAR MI CITA AHORA ➜
            </a>
          </div>
        </div>`
    });
    // Nota: Aquí se dispararía el push notification si el token PWA existiera
    console.log(`📧 Aviso de Juicio Final enviado a: ${cita.paciente_nombre}`);
  } catch (e) { console.error("Error aviso juicio final:", e.message); }
}

// Endpoint Manual para Generar Emails de Venta (ASG Individual)
app.post('/api/asg/generar-email', async (req, res) => {
  const { tipo_dolor, test_email } = req.body;
  const promptVenta = `Eres un experto en Copywriting. Redacta un email de prospección para un fisio que sufre por ${tipo_dolor}. Véndele FisioTool Pro.`;
  
  try {
    const texto = await callVertexAI([{ parts: [{ text: promptVenta }] }]);
    const destinatario = test_email || "admin@fisiotool.com";

    await transporter.sendMail({
      from: '"Ana de FisioTool" <ana@fisiotool.com>',
      to: destinatario,
      subject: `Solución estratégica para su Clínica`,
      html: `<div style="font-family:sans-serif; max-width:600px; margin:auto; border:1px solid #e2e8f0; border-radius:24px; overflow:hidden;">
              <div style="background:#0066ff; padding:40px; text-align:center;"><h1 style="color:white; margin:0;">FISIOTOOL PRO</h1></div>
              <div style="padding:40px; color:#1e293b; line-height:1.8;">
                ${texto.replace(/\n/g, '<br>')}
                <div style="text-align:center; margin-top:40px;"><a href="https://fisiotool.com/?promo=PROSPECT" style="background:#0066ff; color:white; padding:18px 35px; text-decoration:none; border-radius:50px; font-weight:bold;">RECLAMAR MI MES GRATIS ➜</a></div>
              </div>
              <div style="padding:30px; background:#f8fafc; border-top:1px solid #e2e8f0;">
                <strong>Ana</strong><br><span style="font-size:12px; color:#64748b;">Directora de Inteligencia Operativa</span><br>
                WhatsApp: +34 615 200 612
              </div>
            </div>`
    });
    res.json({ success: true, message: "Email ASG enviado." });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// ============================================================
// 🏁 17. ARRANQUE FINAL Y RUTAS SOBERANAS (FERRARI OMEGA)
// ============================================================

// 1. SERVIR CARROCERÍA (Archivos Estáticos de Next.js)
// El servidor entrega primero los estilos, imágenes y scripts del Ferrari
app.use(express.static(nextOutPath));

// 2. RUTA ESPECÍFICA PARA EL BOT DE PACIENTES (LANDINGBOT)
// Mantenemos la compatibilidad con el sistema de citas vía URL
app.get('/agenda/:clinicId', (req, res) => {
  const botPath = path.join(nextOutPath, 'landingbot.html');
  if (fs.existsSync(botPath)) {
    res.sendFile(botPath);
  } else {
    res.status(404).send("Motor visual del bot no encontrado.");
  }
});

// 3. RUTA COMODÍN (SPA HANDLING): El cerebro de navegación de Next.js
// Esta ruta captura cualquier dirección (setup, login, dashboard, foundry)
// y le entrega el chasis Next.js para que el Ferrari ruede por dentro.
// 3. RUTA COMODÍN (SPA HANDLING): El cerebro de navegación de Next.js
// Esta ruta asegura que /setup, /foundry o /login carguen su archivo real
app.get('*', (req, res, next) => {
  // Si la ruta es para la API o Webhooks, saltamos este bloque
  if (req.path.startsWith('/api') || req.path.startsWith('/webhook')) return next();
  
  // Normalizamos la ruta para buscar el archivo físico .html
  let sanitizedPath = req.path;
  if (sanitizedPath === '/') {
    sanitizedPath = '/index.html';
  } else if (!sanitizedPath.endsWith('.html')) {
    sanitizedPath += '.html';
  }

  const fullPath = path.join(nextOutPath, sanitizedPath);

  // Verificamos si el archivo existe en el disco duro de Google
  if (fs.existsSync(fullPath)) {
    res.sendFile(fullPath);
  } else {
    // Si la página exacta no existe, Next.js se encarga desde el index principal
    console.log(`⚠️ Redirigiendo ruta no encontrada: ${req.path}`);
    res.sendFile(path.join(nextOutPath, 'index.html'));
  }
});

// 4. ENCENDIDO DEL MOTOR (PUERTO 8080)
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    // Verificamos si la identidad del proyecto está cargada
    const displayProject = PROJECT_ID_FIXED;
    
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🏎️  FERRARI FISIOTOOL ONLINE: 100%               ║
║                                                           ║
║  Puerto: ${PORT}                                           ║
║  Estado: OPERATIVO (Grado Omega)                          ║
║  Proyecto: ${displayProject}                ║
║  Región: ${REGION_FIXED} (Soberanía Bélgica)              ║
║  IA Engine: Gemini 2.5 Flash                              ║
║  Seguridad: SSL/TLS + Secret Manager                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});