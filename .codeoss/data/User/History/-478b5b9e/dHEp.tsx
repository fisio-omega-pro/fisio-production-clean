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
const bcrypt = require('bcryptjs'); // Blindaje de seguridad para contraseñas
const jwt = require('jsonwebtoken'); // Sistema de tokens para acceso seguro

// ==========================================
// 1. CONFIGURACIÓN TÉCNICA GLOBAL
// ==========================================
const PROJECT_ID_FIXED = 'spatial-victory-480409-b7';
const REGION_FIXED = 'europe-west1';
const DEV_MODE = process.env.DEV_MODE === 'true';
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const JWT_SECRET = process.env.JWT_SECRET || "fisiotool_omega_secret_2026"; // Para firmar sesiones

// --- MAPEADO DE PLANES STRIPE ---
const PLANES_STRIPE = {
    'solo': 'price_1Sjy5kDRyuQXtENNfJ0YWOfh',
    'team': 'price_1Sm7MfDRyuQXtENNWCWL4WLH',
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'
};

// --- INICIALIZACIÓN FIREBASE ---
if (!admin.apps.length) {
    initializeApp({ 
        credential: applicationDefault(), 
        projectId: PROJECT_ID_FIXED 
    });
}
const db = getFirestore();

// --- CONFIGURACIÓN MOTOR IA (Sovereign SDK) ---
const vertex_ai = new VertexAI({ project: PROJECT_ID_FIXED, location: REGION_FIXED });
const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.5-flash', // Versión estable y ultra rápida
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

console.log("✅ BLOQUE 1: Configuración y Dependencias cargadas.");