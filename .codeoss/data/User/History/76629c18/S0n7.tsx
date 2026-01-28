'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Eye } from 'lucide-react';

// Importamos componentes
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

// --- GUIONES ---
const SCRIPTS: Record<string, string> = {
  'hero': "Bienvenido a Fisiotool Pro. El sistema operativo inteligente para tu clínica.",
  'features': "Sección de Soluciones. Unificamos agenda, cobros y notas de voz en una sola herramienta.",
  'demo': "Demostración Interactiva. Escucha cómo Ana negocia y cierra citas automáticamente.",
  'roi': "Calculadora de Impacto. Descubre cuánto dinero pierdes realmente por cada paciente que falta.",
  'testimonials': "Testimonios. Lo que dicen las clínicas que ya usan Fisiotool.",
  'pricing': "Planes de Precios. Desde cien euros al mes para profesionales.",
  'faq': "Preguntas Frecuentes. Resolvemos tus dudas sobre seguridad y privacidad.",
  'trust': "Zona de Confianza y seguridad certificada.",
  'footer': "Pie de página y contacto."
};

export default function AccessPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('Esperando...');
  const [voiceReady, setVoiceReady] = useState(false);
  
  // Referencia para guardar la voz seleccionada
  const selectedVoice = useRef<SpeechSynthesisVoice | null>(null);

  // --- 1. CARGADOR DE VOCES (FIX CRÍTICO) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Buscamos preferiblemente una voz de Google o Microsoft en Español
        const esVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Google') || v.name.includes('Monica')));
        // Si no, cualquiera en español
        const fallbackVoice = voices.find(v => v.lang.includes('es'));
        
        selectedVoice.current = esVoice || fallbackVoice || voices[0];
        setVoiceReady(true);
        console.log("✅ Voz cargada:", selectedVoice.current?.name);
      }
    };

    loadVoices();
    // Chrome necesita este evento para cargar voces dinámicamente
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // --- 2. MOTOR DE HABLA ROBUSTO ---
  const speak = (text: string) => {
    if (!voiceReady || typeof window === 'undefined') return;

    // Cancelamos cola anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice.current) utterance.voice = selectedVoice.current;
    utterance.rate = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const startExperience = () => {
    setHasStarted(true);
    speak("Sistema de voz activo. Desliza hacia abajo para explorar.");
  };

  // --- 3. OBSERVADOR DE SCROLL (DEBUG MODE) ---
  useEffect(() => {
    if (!hasStarted) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Log para ver en consola si detecta algo
        // console.log("Revisando:", entry.target.id, "Visible:", entry.isIntersecting);

        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id !== currentSection) {
            setCurrentSection(id);
            if (SCRIPTS[id]) speak(SCRIPTS[id]);
          }
        }
      });
    }, { threshold: 0.15, rootMargin: "-10% 0px -10% 0px" }); 
    // rootMargin reduce el área de visión para que sea más preciso al centro

    // Conectamos a los IDs
    Object.keys(SCRIPTS).forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [hasStarted, currentSection]);

  // --- VISTA CORTINA ---
  if (!hasStarted) {
    return (
      <main onClick={startExperience} style={styles.curtain}>
        <div style={styles.pulseBtn}><Mic size={40} color="#fff" /></div>
        <h1 style={{fontSize:'32px', marginBottom:'20px'}}>MODO ACCESIBLE</h1>
        <p>Toca la pantalla para activar el audio.</p>
        {!voiceReady && <p style={{fontSize:'12px', color:'#ef4444', marginTop:'20px'}}>Cargando voces...</p>}
      </main>
    );
  }

  // --- VISTA PRINCIPAL ---
  return (
    <div style={{ backgroundColor: '#020305', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* BARRA DE DEBUG (Visual para ti, útil para el usuario) */}
      <div style={styles.stickyBar}>
        <Volume2 size={18} className="animate-pulse" />
        <span>LEYENDO: {currentSection.toUpperCase()}</span>
      </div>

      <div style={{ paddingTop: '60px' }}>
        {/* ENVOLTORIOS CON ID */}
        <section id="hero"><Navbar /><Hero /></section>
        <section id="features"><Features /></section>
        <section id="demo"><AnaDemo /></section>
        <section id="roi"><RoiSection /></section>
        <section id="testimonials"><TestimonialsGallery /></section>
        <section id="pricing"><Pricing /></section>
        <section id="faq"><FaqSection /></section>
        <section id="trust"><TrustBar /></section>
        <section id="footer"><Footer /></section>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  curtain: {
    height: '100vh', width: '100vw', backgroundColor: '#000', color: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer'
  },
  pulseBtn: {
    width: '100px', height: '100px', borderRadius: '50%', background: '#0066ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px',
    boxShadow: '0 0 30px rgba(0,102,255,0.8)'
  },
  stickyBar: {
    position: 'fixed', top: 0, left: 0, width: '100%', 
    background: '#0066ff', color: '#fff', textAlign: 'center', 
    padding: '15px', fontSize: '14px', fontWeight: 800, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
  }
};