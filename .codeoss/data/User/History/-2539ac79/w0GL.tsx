'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Importamos los componentes de Ingeniería (Bloques 1-4)
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import AnaDemo from '../components/landing/AnaDemo';
import RoiSection from '../components/landing/RoiSection';
import TestimonialsGallery from '../components/landing/TestimonialsGallery';
import Pricing from '../components/landing/Pricing';
import FaqSection from '../components/landing/FaqSection';
import TrustBar from '../components/landing/TrustBar';
import Footer from '../components/landing/Footer';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  const [voiceMode, setVoiceMode] = useState(false);

  // --- MOTOR DE ACCESIBILIDAD (NIVEL OMEGA) ---
  const toggleVoice = () => {
    const newState = !voiceMode;
    setVoiceMode(newState);
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (newState) {
        const msg = new SpeechSynthesisUtterance("Modo Accesibilidad Activado. Bienvenido a FisioTool Pro. Soy Ana, tu asistente de navegación.");
        msg.lang = 'es-ES';
        window.speechSynthesis.speak(msg);
      } else {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Efecto visual de fondo (Sutil y elegante)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) * 100, 
        y: (e.clientY / window.innerHeight) * 100 
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <main style={{ 
      backgroundColor: '#020305', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* FONDO INTERACTIVO */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', 
        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.08) 0%, transparent 40%)` 
      }} />

      {/* --- ESTRUCTURA MODULAR --- */}
      <div style={{ position: 'relative', zIndex: 1 }}>
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

      {/* --- BOTÓN FLOTANTE ACCESIBILIDAD --- */}
      <button 
        onClick={toggleVoice}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: voiceMode ? '#10b981' : 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease'
        }}
        aria-label={voiceMode ? "Desactivar narración" : "Activar modo lectura para invidentes"}
        title="Accesibilidad / Modo Lectura"
      >
        {voiceMode ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

    </main>
  );
}