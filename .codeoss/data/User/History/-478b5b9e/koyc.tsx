const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { GoogleAuth } = require('google-auth-library');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { VertexAI } = require('@google-cloud/vertexai');

// ==========================================
// 1. CONFIGURACIÓN TÉCNICA GLOBAL
// ==========================================
const PROJECT_ID_FIXED = 'spatial-victory-480409-b7';
const REGION_FIXED = 'europe-west1';
const DEV_MODE = process.env.DEV_MODE === 'true';
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";

const PLANES_STRIPE = {
    'solo': 'price_1Sjy5kDRyuQXtENNfJ0YWOfh',
    'team': 'price_1Sm7MfDRyuQXtENNWCWL4WLH',
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'
};

// Inicialización de Firebase con validación de estado
if (!admin.apps.length) {
    initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID_FIXED
    });
}
const db = getFirestore();

// Configuración Motor IA
const vertex_ai = new VertexAI({ project: PROJECT_ID_FIXED, location: REGION_FIXED });
const model = vertex_ai.getGenerativeModel({
    model: 'gemini-1.5-flash', // Corregido: 2.5 no es versión estable actual, 1.5 es la recomendada
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 40
    }
});

// Motor de Pagos
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const app = express();
app.use(cors());
// Usamos el parser nativo de express para evitar redundancia
app.use((req, res, next) => {
    if (req.originalUrl === '/stripe-webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

// Sincronización de rutas Next.js
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out');
}

// ==========================================
// 2. UTILIDADES DE INGENIERÍA
// ==========================================
function normalizarTelefono(tlf) {
    if (!tlf) return "";
    let limpio = tlf.replace(/\D/g, '');
    if (limpio.startsWith('34') && limpio.length > 9) {
        limpio = limpio.substring(2);
    }
    return limpio.trim();
}

async function callVertexAI(contents) {
    try {
        const formattedContents = contents.map(c => ({
            role: c.role || "user",
            parts: c.parts
        }));
        const result = await model.generateContent({ contents: formattedContents });
        const candidate = result.response.candidates?.[0];
        
        if (!candidate?.content?.parts?.[0]?.text) {
            return "Disculpa, he tenido un problema de conexión. ¿Podrías repetir tu consulta?";
        }
        return candidate.content.parts[0].text;
    } catch (e) {
        console.error("❌ ERROR CRÍTICO MOTOR IA:", e.message);
        throw e;
    }
}