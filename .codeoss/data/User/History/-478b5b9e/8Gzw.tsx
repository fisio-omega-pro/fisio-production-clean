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
// 🚀 1. CONFIGURACIÓN TÉCNICA GLOBAL
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
    'solo':    'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
    'team':    'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
    'clinic':  'price_1Sm7NyDRyuQXtENNYF8wf0oQ'   // 500€
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
  model: 'gemini-1.5-flash', // Corregido de 2.5 a 1.5-flash para compatibilidad actual en GCP
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
/**
 * BLOQUE 2: UTILIDADES DE INGENIERÍA Y LÓGICA DE DASHBOARD
 * Archivo: dashboard.page.tsx
 */

import React, { useState, useEffect } from 'react';

// ==========================================
// 🛠️ 2. UTILIDADES DE INGENIERÍA (NASA PRECISION)
// ==========================================

// Limpieza de teléfonos: asegura formato puro para WhatsApp y CRM
function normalizarTelefono(tlf: string) {
  if (!tlf) return "";
  let limpio = tlf.replace(/\D/g, ''); // Quitamos todo lo que no sea número
  if (limpio.startsWith('34') && limpio.length > 9) {
    limpio = limpio.substring(2); // Quitamos prefijo español
  }
  return limpio.trim();
}

// Detector dinámico de Host: garantiza que Stripe y los links siempre apunten al sitio correcto
function getDynamicHost(req: any) {
  // Nota: En frontend req puede ser opcional, mantenemos la lógica original del RTF
  if (typeof window !== 'undefined') return window.location.origin;
  const host = req?.get('host') || "";
  if (host.includes('run.app') || process.env.NODE_ENV === 'production') {
    return `https://${host}`;
  }
  return `${req?.protocol || 'http'}://${host}`;
}

// ==========================================
// 👸 3. COMPONENTE PRINCIPAL: DashboardOmega
// ==========================================

export default function DashboardOmega() {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const API_BASE = ""; // Se asume del entorno o configuración global

  // Función de ayuda para narración (Placeholder para respetar el llamado en conectarStripe)
  const narrar = (msg: string) => console.log("Ana dice: " + msg);

  // Carga de datos (Placeholder para respetar la posición de conectarStripe)
  const loadData = async (id: string) => {
    console.log("Cargando datos de la clínica: " + id);
  };

  // --- FUNCIÓN SOLICITADA: CONEXIÓN STRIPE ---
  const conectarStripe = async () => {
    if (!clinicId) return;
    narrar("Iniciando conexión segura con Stripe Connect.");
    try {
      const res = await fetch(`${API_BASE}/api/stripe/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_id: clinicId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Saltamos al formulario Express de Stripe
      }
    } catch (e) {
      alert("Error al conectar con la pasarela financiera.");
    }
  };

  // --- LÓGICA SOLICITADA: DETECTAR ÉXITO DEL ALTA ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const stripeStatus = params.get('stripe'); // Detectamos ?stripe=success
    if (id) {
      setClinicId(id);
      loadData(id);
      if (stripeStatus === 'success') {
        narrar("¡Felicidades! Tus cobros automáticos ya están activos. Ana ya puede cobrar fianzas por ti.");
        alert("✅ Pasarela de cobros configurada con éxito.");
      }
    }
  }, []);
  