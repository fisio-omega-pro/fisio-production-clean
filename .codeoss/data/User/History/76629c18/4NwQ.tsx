'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Mic, Play } from 'lucide-react';

// Reutilizamos los componentes de la Landing principal (Ingeniería DRY)
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import AnaDemo from '../../components/landing/AnaDemo';
import RoiSection from '../../components/landing/RoiSection';
import TestimonialsGallery from '../../components/landing/TestimonialsGallery';
import Pricing from '../../components/landing/Pricing';
import FaqSection from '../../components/landing/FaqSection';
import TrustBar from '../../components/landing/TrustBar';
import Footer from '../../components/landing/Footer';

export const dynamic = 'force-dynamic';

export default function AccessPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true); // Por defecto: ACTIVADO

  // Función de Arranque (Rompe el bloqueo del navegador)
  const startExperience = () => {
    setHasStarted(true);
    
    // Inicia la narración inmediatamente
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        "Bienvenido al Modo Accesibilidad de Fisiotool Pro. " +
        "Soy Ana. He activado una interfaz simplificada y te guiaré por voz. " +
        "Estás en la sección principal. Detectamos que tu clínica necesita optimización..."
      );
      msg.rate = 1.0; // Velocidad normal
      msg.lang = 'es-ES';
      window.speechSynthesis.speak(msg);
    }
  };

  // Si el usuario no ha hecho clic, mostramos la CORTINA DE ACCESO
  if (!hasStarted) {
    return (
      <main 
        onClick={startExperience}
        onKeyDown={(e) => e.key === 'Enter' && startExperience()}
        tabIndex={0}
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '20px'
        }}
        aria-label="Bienvenido a Fisiotool Accesibilidad. Pulsa cualquier tecla o toca la pantalla para iniciar."
      >
        <div style={{
          width: '100px', height: '100px',
          borderRadius: '50%',
          background: '#0066ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '40px',
          boxShadow: '0 0 50px rgba(0,102,255,0.6)',
          animation: 'pulse 2s infinite'
        }}>
          <Mic size={40} color="#fff" />
        </div>
        
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px' }}>
          MODO ACCESIBILIDAD
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.8, maxWidth: '600px', lineHeight: '1.6' }}>
          Pulsa en cualquier parte de la pantalla para activar la <br/> 
          <strong style={{color:'#10b981'}}>Navegación por Voz con Ana</strong>.
        </p>

        <div style={{ marginTop: '50px', fontSize: '14px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Click to Enter • Tap to Enter
        </div>
        
        <style jsx>{`
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 102, 255, 0.7); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(0, 102, 255, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 102, 255, 0); }
          }
        `}</style>
      </main>
    );
  }

  // Una vez iniciado, mostramos la web normal pero con el VoiceMode ya activo
  return (
    <div style={{ position: 'relative', backgroundColor: '#020305' }}>
      {/* Indicador visual de que el modo voz está activo */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', 
        background: '#0066ff', color: '#fff', textAlign: 'center', 
        padding: '5px', fontSize: '12px', fontWeight: 800, zIndex: 9999
      }}>
        <Volume2 size={12} style={{marginRight: '8px', verticalAlign: 'middle'}} />
        MODO LECTURA ACTIVO
      </div>

      <div style={{ paddingTop: '25px' }}> {/* Espacio para la barra azul */}
        <Navbar />
        <Hero />
        <Features />
        <AnaDemo />
        <RoiSection />
        <TestimonialsGallery />
        <Pricing />
        <FaqSection />
        <TrustBar />
        <Footer />
      </div>
    </div>
  );
}