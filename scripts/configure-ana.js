#!/usr/bin/env node

// Script para configurar Ana en Firestore automáticamente
const admin = require('firebase-admin');

// Configuración de Firebase Admin
const serviceAccount = require('../fisiotool-pro-2026-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fisiotool-pro-2026'
});

const db = admin.firestore();

async function configureAna() {
  try {
    const clinicId = 'bleRbykAj1TgF4lOYdMh'; // Tu clínica de prueba
    
    // Configuración personalizada de Ana
    const anaConfig = {
      ana_name: "María",
      ana_photo: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5a?w=150&h=150&fit=crop&crop=face&auto=format",
      ana_color: "#FF5722",
      ana_welcome: "¡Hola! Soy María, tu asistente personalizada. Estoy aquí para ayudarte con tus citas y seguimiento.",
      ana_use_clinic_logo: false,
      updated_at: new Date()
    };

    console.log('🔥 Configurando Ana para la clínica:', clinicId);
    console.log('📋 Configuración:', anaConfig);

    // Actualizar el documento de la clínica
    await db.collection('clinicas').doc(clinicId).update(anaConfig);

    console.log('✅ ¡Ana ha sido configurada exitosamente!');
    console.log('🎉 Nombre:', anaConfig.ana_name);
    console.log('🎨 Color:', anaConfig.ana_color);
    console.log('📸 Foto:', anaConfig.ana_photo);
    console.log('💬 Mensaje:', anaConfig.ana_welcome);

  } catch (error) {
    console.error('🔥 Error al configurar Ana:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la configuración
configureAna();
