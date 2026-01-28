'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic } from 'lucide-react';

// Importamos los componentes visuales
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

// --- GUIONES DE NARRACIÓN POR SECCIÓN ---
// Ana leerá esto automáticamente cuando la sección aparezca en pantalla.
const SCRIPTS: Record<string, string> = {
  'hero': "Estás en la cabecera. Fisiotool Pro es el sistema operativo inteligente para tu clínica. Ana gestiona tus citas, cobros y notas de voz.",
  'features': "Sección de Soluciones. Unificamos 6 herramientas en 1: Inteligencia conductual, cobros automáticos con Stripe, historia clínica por voz y reactivación de pacientes.",
  'demo': "Demostración Interactiva. Aquí puedes ver cómo Ana negocia con un paciente real, gestiona el dolor y cierra la cita automáticamente.",
  'roi': "Sección de Impacto Económico. ¿Sabías que cada paciente que no aparece te cuesta dinero del alquiler? Nuestra calculadora muestra cuánto pierdes al año.",
  'testimonials': "Casos de éxito. Escucha lo que dicen clínicas como Avanza Madrid o FisioSport sobre cómo han recuperado su tiempo libre.",
  'pricing': "Planes de Precios. Tenemos tres niveles: Professional por 100 euros, Business por 300, y Corporate para grandes redes.",
  'faq': "Preguntas Frecuentes. Resolvemos dudas sobre la seguridad de tus datos en Bélgica, la ley RGPD y cómo funcionan los cobros.",
  'trust': "Estás al final de la página. Zona de confianza. Certificados de seguridad AES-256 activos. Botón disponible para crear cuenta ahora.",
  'footer': "Pie de página. Enlaces legales, contacto por WhatsApp y dirección fiscal."
};

export default function AccessPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('');
  
  // Referencias para el observador
  const observerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // --- MOTOR DE VOZ (ANA TTS ENGINE) ---
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // 1. Cancelamos lo que estuviera diciendo antes (PRIORIDAD ABSOLUTA)
    window.speechSynthesis.cancel();

    // 2. Preparamos el nuevo mensaje
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'es-ES'; // Español de España
    msg.rate = 1.0;     // Velocidad normal
    msg.pitch = 1.0;    // Tono natural

    // 3. Hablamos
    window.speechSynthesis.speak(msg);
  };

  // --- ARRANQUE INICIAL (Rompe el bloqueo del navegador) ---
  const startExperience = () => {
    setHasStarted(true);
    speak("Modo Accesibilidad Activado. Soy Ana. Desliza hacia abajo para que te lea cada sección.");
  };

  // --- OBSERVADOR DE SCROLL (EL OJO DIGITAL) ---
  useEffect(() => {
    if (!hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Si más del 50% de la sección es visible...
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            
            // Evitamos que repita lo mismo si subes y bajas rápido
            if (sectionId !== currentSection) {
              setCurrentSection(sectionId);
              const script = SCRIPTS[sectionId];
              if (script) speak(script);
            }
          }
        });
      },
      { threshold: 0.5 } // Sensibilidad: Se activa cuando ves la mitad de la sección
    );

    // Conectamos el observador a todos los elementos registrados
    observerRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [hasStarted, currentSection]); // Re-ejecutar si cambia el estado

  // Helper para registrar refs limpiamente
  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) observerRefs.current.set(id, el);
  };

  // --- RENDERIZADO (CORTINA DE ENTRADA) ---
  if (!hasStarted) {
    return (
      <main 
        onClick={startExperience}
        onKeyDown={(e) => e.key === 'Enter' && startExperience()}
        tabIndex={0}
        style={{
          height: '100vh', width: '100vw', backgroundColor: '#000', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', textAlign: 'center', padding: '20px'
        }}
        aria-label="Pulsa para activar navegación por voz."
      >
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%', background: '#0066ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px',
          animation: 'pulse 2s infinite', boxShadow: '0 0 50px rgba(0,102,255,0.6)'
        }}>
          <Mic size={40} color="#fff" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px' }}>MODO ACCESIBILIDAD</h1>
        <p style={{ fontSize: '20px', opacity: 0.8 }}>Toca la pantalla para iniciar a Ana.</p>
        <style jsx>{`@keyframes pulse { 0% {transform:scale(1);} 50% {transform:scale(1.1);} 100% {transform:scale(1);} }`}</style>
      </main>
    );
  }

  // --- RENDERIZADO (WEB ACTIVA CON WRAPPERS) ---
  return (
    <div style={{ position: 'relative', backgroundColor: '#020305' }}>
      
      {/* BARRA DE ESTADO DE VOZ */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', 
        background: '#0066ff', color: '#fff', textAlign: 'center', 
        padding: '10px', fontSize: '14px', fontWeight: 800, zIndex: 9999,
        boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
           <Volume2 size={16} className="animate-pulse" />
           <span>ANA ESTÁ LEYENDO: {currentSection.toUpperCase()}</span>
        </div>
      </div>

      <div style={{ paddingTop: '50px' }}> {/* Espacio para la barra azul */}
        
        {/* Envolvemos cada componente en un DIV con ID para que el observador lo vea */}
        
        <div id="hero" ref={setRef('hero')}>
          <Navbar /> {/* Navbar va dentro del Hero lógico para no interrumpir */}
          <Hero />
        </div>

        <div id="features" ref={setRef('features')}>
          <Features />
        </div>

        <div id="demo" ref={setRef('demo')}>
          <AnaDemo />
        </div>

        <div id="roi" ref={setRef('roi')}>
          <RoiSection />
        </div>

        <div id="testimonials" ref={setRef('testimonials')}>
          <TestimonialsGallery />
        </div>

        <div id="pricing" ref={setRef('pricing')}>
          <Pricing />
        </div>

        <div id="faq" ref={setRef('faq')}>
          <FaqSection />
        </div>

        <div id="trust" ref={setRef('trust')}>
          <TrustBar />
        </div>

        <div id="footer" ref={setRef('footer')}>
          <Footer />
        </div>

      </div>
    </div>
  );
}