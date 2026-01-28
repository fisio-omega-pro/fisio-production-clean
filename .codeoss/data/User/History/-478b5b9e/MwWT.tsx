/**
 * BLOQUE 1: CONFIGURACIÓN Y DEPENDENCIAS
 * Lenguaje: JavaScript (Node.js/Express)
 * Estado: Corregido, Limpio y Auditado.
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

// --- CONFIGURACIÓN TÉCNICA ---
const PROJECT_ID = 'spatial-victory-480409-b7';
const REGION = 'europe-west1';
const DEV_MODE = process.env.DEV_MODE === 'true';
const CLINIC_ID_DEFAULT = "5MQYJxwAXUn879OahUfc";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "fisio_prod_secure_2026";

// --- MAPEADO DE PLANES STRIPE (IDs de Precio) ---
const PLANES_STRIPE = {
    'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

// --- INICIALIZACIÓN FIREBASE ---
if (!admin.apps.length) {
    initializeApp({
        credential: applicationDefault(),
        projectId: PROJECT_ID
    });
}
const db = getFirestore();

// --- CONFIGURACIÓN MOTOR IA (Vertex AI) ---
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: REGION });
const model = vertex_ai.getGenerativeModel({
    model: 'gemini-1.5-flash', // Corregido: Versión estable de producción
    generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.2,
        topP: 0.8,
        topK: 40
    }
});

// --- MOTOR DE PAGOS (STRIPE) ---
const stripe = process.env.STRIPE_SECRET_KEY 
    ? require('stripe')(process.env.STRIPE_SECRET_KEY) 
    : null;

// --- CONFIGURACIÓN CORREO SMTP ---
const transporter = nodemailer.createTransport({
    host: "mail.fisiotool.com",
    port: 465,
    secure: true,
    auth: { 
        user: "ana@fisiotool.com", 
        pass: process.env.EMAIL_PASS 
    }
});

const app = express();
app.use(cors());

// El orden es vital: Stripe Webhook necesita raw body antes que el JSON parser global
const jsonParser = bodyParser.json();

// --- RUTAS DE NEXT.JS ---
let nextOutPath = path.join(__dirname, 'public-next/out');
if (!fs.existsSync(nextOutPath)) {
    nextOutPath = path.join(__dirname, 'out');
}