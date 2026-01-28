'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Mic } from 'lucide-react';

// Importamos los componentes
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

// --- GUIONES (TEXTOS QUE LEERÁ ANA) ---
const SCRIPTS: Record<string, string> = {
  'hero': "Estás en la cabecera. Fisiotool Pro. El sistema operativo inteligente. Ana gestiona tus citas y notas de voz.",
  'features': "Sección de Soluciones. 6 herramientas en 1: Inteligencia artificial, cobros automáticos, historia clínica por voz y reactivación de pacientes.",
  'demo': "Demostración. Observa cómo Ana negocia con un paciente y cierra la cita automáticamente.",
  'roi': "Impacto Económico. Nuestra calculadora te muestra cuánto dinero pierdes al año por los pacientes que no aparecen.",
  'testimonials': "Casos de éxito. Clínicas reales que han recuperado su tiempo libre gracias a Fisiotool.",
  'pricing': "Precios. Plan Profesional por 100 euros, Business por 300, y Corporativo para grandes redes.",
  'faq': "Preguntas Frecuentes. Seguridad de datos en Europa y normativa legal cumplida.",
  'trust': "Zona de confianza. Certificados de seguridad activos. Crea tu cuenta ahora.",
  'footer': "Pie de página. Enlaces de contacto y legales."
};

// Lista ordenada de secciones para el observador
const SECTION_IDS = ['hero', 'features', 'demo', 'roi', 'testimonials', 'pricing', 'faq', 'trust', 'footer'];

export default function AccessPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('');

  // --- MOTOR DE VOZ ---
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cortamos lo anterior para que no se acumule
    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-ES';
    msg.rate = 1.0;
    
    console.log("🔊 Ana dice:", text); // Para depurar en consola
    window.speechSynthesis.speak(msg);
  };

  const startExperience = () => {
    setHasStarted(true);
    speak("Modo Accesibilidad Activado. Baja la pantalla para que te lea el contenido.");
  };

  // --- EL OJO DIGITAL (NUEVA VERSIÓN MÁS SENSIBLE) ---
  useEffect(() => {
    if (!hasStarted) return;

    // Configuración más agresiva: Se activa al ver solo el 10% del elemento
    const observerOptions = {
      root: null, // El viewport
      rootMargin: '0px',
      threshold: 0.15 // <--- CAMBIO CLAVE: Antes era 0.5. Ahora con un 15% visible ya habla.
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          
          // Solo hablamos si es una sección nueva
          // y evitamos que lea el footer si apenas asoma mientras lees otra cosa
          if (sectionId !== currentSection) {
            console.log("👁️ Sección detectada:", sectionId);
            setCurrentSection(sectionId);
            if (SCRIPTS[sectionId]) speak(SCRIPTS[sectionId]);
          }
        }
      });
    }, observerOptions);

    // Conectamos el observador buscando los IDs directamente (Más robusto)
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
      else console.warn(`⚠️ No encuentro la sección: ${id}`);
    });

    return () => observer.disconnect();
  }, [hasStarted, currentSection]); // Eliminamos dependencias innecesarias

  // --- PANTALLA DE INICIO (CORTINA) ---
  if (!hasStarted) {
    return (
      <main 
        onClick={startExperience}
        style={{
          height: '100vh', width: '100vw', backgroundColor: '#000', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: '20px'
        }}
      >
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', background: '#0066ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px',
          animation: 'pulse 2s infinite', boxShadow: '0 0 50px rgba(0,102,255,0.6)'
        }}>
          <Mic size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px' }}>MODO ACCESIBILIDAD</h1>
        <p style={{ fontSize: '18px', opacity: 0.8 }}>Pulsa la pantalla para activar la Voz de Ana.</p>
        <style jsx>{`@keyframes pulse { 0% {transform:scale(1);} 50% {transform:scale(1.1);} 100% {transform:scale(1);} }`}</style>
      </main>
    );
  }
// --- WEB REAL (Con los IDs corregidos) ---
  return (
    <div style={{ backgroundColor: '#020305', minHeight: '100vh' }}>
      
      {/* BARRA SUPERIOR FIJA */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', 
        background: '#0066ff', color: '#fff', textAlign: 'center', 
        padding: '12px', fontSize: '14px', fontWeight: 800, zIndex: 9999,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
           <Volume2 size={18} />
           <span>LEYENDO: {currentSection ? currentSection.toUpperCase() : 'INICIO'}</span>
        </div>
      </div>

      <div style={{ paddingTop: '50px' }}>
        {/* ENVOLTORIOS CON ID EXPLÍCITO */}
        <div id="hero"><Navbar /><Hero /></div>
        <div id="features"><Features /></div>
        <div id="demo"><AnaDemo /></div>
        <div id="roi"><RoiSection /></div>
        <div id="testimonials"><TestimonialsGallery /></div>
        <div id="pricing"><Pricing /></div>
        <div id="faq"><FaqSection /></div>
        <div id="trust"><TrustBar /></div>
        <div id="footer"><Footer /></div>
      </div>

    </div>
  );
}