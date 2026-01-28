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
