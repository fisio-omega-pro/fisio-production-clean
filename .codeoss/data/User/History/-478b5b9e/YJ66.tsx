/**
 * FISIOTOOL ONLINE - CORE SERVER (GRADO OMEGA)
 * Bloque 1: Inicialización y Dependencias
 */

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
const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');

// ==========================================
// 1. CONFIGURACIÓN TÉCNICA GLOBAL
// ==========================================

const PROJECT_ID = process.env.PROJECT_ID || 'spatial-victory-480409-b7';
const REGION = process.env.REGION || 'europe-west1';
const DEV_MODE = process.env.DEV_MODE === 'true';
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";

// Mapeado de Planes Stripe (IDs de producto/precio reales)
const PLANES_STRIPE = {
    'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

// Inicialización Firebase Admin
if (!admin.apps.length) {
    initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID
    });
}
const db = getFirestore();

// Configuración Vertex AI (Gemini Engine)
const auth = new GoogleAuth({ 
    scopes: ['https://www.googleapis.com/auth/cloud-platform'] 
});
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: REGION });
const model = vertex_ai.getGenerativeModel({
    model: 'gemini-1.5-flash', // Corregido: 2.5 no es una versión estable/actual
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 40
    }
});

// Motor de Pagos (Stripe)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null;

// Configuración Correo SMTP
const transporter = nodemailer.createTransport({
    host: "mail.fisiotool.com",
    port: 465,
    secure: true,
    auth: { 
        user: "ana@fisiotool.com", 
        pass: process.env.EMAIL_PASS 
    }
});

// Inicialización Express
const app = express();
app.use(cors());

// Rutas estáticas de Next.js
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out');
}

// Nota: El body-parser global se define en el siguiente bloque 
// para no interferir con el stream raw de Stripe.
/**
 * FISIOTOOL ONLINE - BLOQUE 2: Utilidades y Helpers de Persistencia
 */

// ==========================================
// 2. UTILIDADES DE INGENIERÍA (PRECISIÓN)
// ==========================================

// Limpieza de teléfonos: asegura formato E.164 simplificado
function normalizarTelefono(tlf) {
    if (!tlf) return "";
    // Eliminamos todo lo que no sea número
    let limpio = tlf.toString().replace(/\D/g, ''); 
    // Si empieza por 34 (España) y es largo, quitamos el prefijo para consistencia interna
    if (limpio.startsWith('34') && limpio.length > 9) {
        limpio = limpio.substring(2);
    }
    return limpio.trim();
}

// Detector dinámico de Host para redirecciones de Stripe
function getDynamicHost(req) {
    const host = req.get('host');
    const protocol = (req.headers['x-forwarded-proto'] || req.protocol);
    // Soporte para Cloud Run y entornos locales
    if (host.includes('run.app') || process.env.NODE_ENV === 'production') {
        return `https://${host}`;
    }
    return `${protocol}://${host}`;
}

// FUNCIÓN MAESTRA DE COMUNICACIÓN IA (Vertex AI SDK)
async function callVertexAI(contents) {
    try {
        console.log("🧠 Ana procesando consulta...");
        
        // El rol debe ser estrictamente 'user' o 'model'
        const formattedContents = contents.map(c => ({
            role: c.role === "assistant" ? "model" : "user",
            parts: Array.isArray(c.parts) ? c.parts : [{ text: c.parts }]
        }));

        const result = await model.generateContent({ contents: formattedContents });
        const response = await result.response;
        
        // Navegación defensiva del objeto de respuesta
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("La IA no generó candidatos (posible bloqueo de seguridad/filtro).");
        }

        const text = response.candidates[0].content.parts[0].text;
        console.log("✅ Respuesta generada con éxito.");
        return text;

    } catch (e) {
        console.error("❌ ERROR CRÍTICO MOTOR IA:", e.message);
        return "Lo siento, he tenido un problema técnico. ¿Podrías repetirme tu consulta?";
    }
}

// ==========================================
// 3. HELPERS DE BASE DE DATOS (CRM & LOGS)
// ==========================================

// Registro histórico de conversación
async function guardarLogChat(tlf, usrMsg, iaReply, idClinica) {
    try {
        await db.collection('chats').add({
            tlf: normalizarTelefono(tlf),
            usr: usrMsg,
            ia: iaReply,
            clinic_id: idClinica,
            ts: Timestamp.now()
        });
    } catch (e) {
        console.error("⚠️ Error en Log de Inteligencia:", e.message);
    }
}

// Emisión de alertas por Banderas Rojas (Triaje médico)
async function crearAlerta(tlf, iaReply, idClinica, motivo) {
    try {
        await db.collection('alertas_red_flag').add({
            paciente_tlf: normalizarTelefono(tlf),
            mensaje_ia: iaReply,
            clinic_id: idClinica,
            motivo: motivo,
            creado: Timestamp.now(),
            status: 'pendiente'
        });
        console.log("🚨 Alerta de seguridad emitida.");
    } catch (e) {
        console.error("❌ Error en Sistema de Alertas:", e.message);
    }
}

// Gestión de Bonos (Fidelización)
async function consultarYDescontarBono(tlf, idClinica) {
    try {
        const tlfLimpio = normalizarTelefono(tlf);
        const snap = await db.collection('bonos')
            .where('clinic_id', '==', idClinica)
            .where('paciente_tlf', '==', tlfLimpio)
            .where('status', '==', 'activo')
            .where('sesiones_disponibles', '>', 0)
            .limit(1).get();

        if (snap.empty) return { bonoUsado: false };

        const bonoDoc = snap.docs[0];
        const nuevasSesiones = bonoDoc.data().sesiones_disponibles - 1;
        
        await bonoDoc.ref.update({
            sesiones_disponibles: nuevasSesiones,
            status: nuevasSesiones <= 0 ? 'consumido' : 'activo'
        });

        return { 
            bonoUsado: true, 
            sesionesRestantes: nuevasSesiones 
        };
    } catch (e) {
        console.error("⚠️ Error consultando bono:", e.message);
        return { bonoUsado: false };
    }
}
/**
 * FISIOTOOL ONLINE - BLOQUE 3: Motor de Agenda y Onboarding
 */

// ============================================================
// 4. CEREBRO DE ANA (SISTEMA DE PROMPTING)
// ============================================================

async function crearContextoAna(idClinicaActual) {
    let doc = await db.collection('clinicas').doc(idClinicaActual).get();
    
    // Fallback por slug si el ID no es directo
    if (!doc.exists) {
        const q = await db.collection('clinicas').where('slug', '==', idClinicaActual).limit(1).get();
        if (!q.empty) doc = q.docs[0];
    }

    const info = doc.exists ? doc.data() : { nombre_clinica: "FisioTool", precio_sesion: 100 };
    
    // Sincronización horaria (Servidor en Bélgica -> Operación en Madrid)
    const ahora = new Date().toLocaleString('es-ES', { 
        timeZone: 'Europe/Madrid', 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    const fianza = info.fianza_reserva || 15;
    const sedes = info.direcciones || [];
    const metodos = info.metodos_pago ? info.metodos_pago.join(', ') : "Stripe, Bizum, Efectivo";

    let textoSedes = sedes.length > 1 
        ? `VARIAS SEDES: ${sedes.map((s, i) => `(${i+1}) ${s.calle}, ${s.ciudad}`).join(' | ')}. PREGUNTA SEDE.`
        : `UBICACIÓN: ${sedes[0]?.calle || 'Consultar'}, ${sedes[0]?.ciudad || ''}.`;

    return `
    IDENTIDAD: Eres 'Ana', recepcionista de élite de "${info.nombre_clinica}". 
    Eres experta en conducta humana, empática y extremadamente profesional.
    
    DATOS DE NEGOCIO:
    - FECHA ACTUAL: ${ahora}.
    - PRECIO: ${info.precio_sesion}€. DURACIÓN: ${info.default_duration_min || 45} min.
    - RESERVA: Requiere fianza de ${fianza}€ para blindar la agenda.
    - MÉTODOS: ${metodos}.
    - ${textoSedes}

    REGLAS DE ORO:
    Para agendar necesitas: 1. Nombre, 2. Motivo, 3. EMAIL (para justificante legal).
    NO reserves sin el EMAIL. 

    FORMATO DE COMANDO:
    Al confirmar, usa: ###RESERVA|YYYY-MM-DD HH:mm|Nombre|Email###
    `;
}

// ============================================================
// 5. AGENDA DETERMINISTA (CÁLCULO DE DISPONIBILIDAD)
// ============================================================

async function checkAgendaDeterminista(idClinica, fechaIntentoStr) {
    const clinicaDoc = await db.collection('clinicas').doc(idClinica).get();
    if (!clinicaDoc.exists) return { available: false, reason: "clínica no encontrada" };
    
    const data = clinicaDoc.data();
    const [fechaSoloDia, horaCita] = fechaIntentoStr.split(' ');
    const [hh, mm] = horaCita.split(':').map(Number);
    const citaInicioTotalMin = hh * 60 + mm;
    const duracionMinutos = data.default_duration_min || 45;
    const citaFinTotalMin = citaInicioTotalMin + duracionMinutos;

    // 1. Comprobación de bloqueos (Vacaciones/Cierres)
    const bloqueosSnap = await db.collection('bloqueos').where('clinic_id', '==', idClinica).get();
    for (const doc of bloqueosSnap.docs) {
        const b = doc.data();
        if (!b.hora_inicio && fechaSoloDia >= b.inicio && fechaSoloDia <= b.fin) return { available: false, reason: "Cerrado por vacaciones" };
        if (b.hora_inicio && fechaSoloDia === b.inicio) {
            const bIni = b.hora_inicio.split(':').map(Number);
            const bFin = b.hora_fin.split(':').map(Number);
            const blockStart = bIni[0] * 60 + bIni[1];
            const blockEnd = bFin[0] * 60 + bFin[1];
            if (citaInicioTotalMin < blockEnd && blockStart < citaFinTotalMin) return { available: false, reason: "Bloqueo horario" };
        }
    }

    // 2. Colisión con otras citas activas
    const citasHoy = await db.collection('citas')
        .where('clinic_id', '==', idClinica)
        .where('fecha', '>=', fechaSoloDia) // Simplificado para optimizar
        .get();

    for (const doc of citasHoy.docs) {
        const c = doc.data();
        if (['cancelada', 'cancelada_por_expiracion'].includes(c.status)) continue;
        if (c.fecha === fechaIntentoStr) return { available: false, reason: "Hueco ya ocupado" };
    }

    return { available: true };
}

// ============================================================
// 12. MOTOR STRIPE CONNECT (EL "CABLE" PARA EL FRONTEND)
// ============================================================

app.post('/api/stripe/onboard', async (req, res) => {
    const { clinic_id } = req.body;
    if (!stripe) return res.status(500).json({ error: "Stripe no configurado en el servidor." });

    try {
        // 1. Creamos la cuenta Connect Express
        const account = await stripe.accounts.create({
            type: 'express',
            capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        });

        // 2. Generamos el link de onboarding
        const host = getDynamicHost(req);
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${host}/dashboard?id=${clinic_id}&stripe=retry`,
            return_url: `${host}/dashboard?id=${clinic_id}&stripe=success`,
            type: 'account_onboarding',
        });

        // 3. Actualizamos la clínica con el ID de Connect
        await db.collection('clinicas').doc(clinic_id).update({
            stripe_connect_id: account.id,
            cobros_configurados: false
        });

        res.json({ url: accountLink.url });
    } catch (e) {
        console.error("❌ Error en Onboarding Stripe:", e.message);
        res.status(500).json({ error: e.message });
    }
});