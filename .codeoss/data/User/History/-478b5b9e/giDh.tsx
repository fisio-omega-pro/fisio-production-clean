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