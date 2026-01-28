'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, StopCircle } from 'lucide-react';

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

export default function AccessPage() {
  const [hasStarted, setHasStarted] = useState(false);
  
  // Referencia para saber qué ya hemos leído y no repetir como loros
  const readElements = useRef(new Set());

  // --- MOTOR DE SÍNTESIS DE VOZ ---
  const speak = (text: string, force = false) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Si ya estamos hablando, cancelamos para decir lo nuevo (prioridad inmediata)
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0; // Velocidad normal
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  // --- ARRANQUE INICIAL ---
  const startExperience = () => {
    setHasStarted(true);
    speak("Bienvenido al Modo Accesibilidad de Fisiotool Pro. Soy Ana. Desplázate hacia abajo y te leeré el contenido automáticamente.");
  };

  // --- OBSERVADOR DE SCROLL (EL OJO DE ANA) ---
  useEffect(() => {
    if (!hasStarted) return;

    // Seleccionamos todo lo que queremos que Ana lea
    const elements = document.querySelectorAll('h1, h2, h3, p, button, a');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const text = el.innerText || el.textContent;

          // Solo leemos si tiene texto, es visible y no lo hemos leído hace un momento
          // (Usamos un dataset 'read' temporal para evitar bucles, pero permitimos releer si vuelves)
          if (text && text.trim().length > 2 && el.getAttribute('data-ana-read') !== 'true') {
            
            // Leemos
            speak(text);
            
            // Marcamos como leído temporalmente
            el.setAttribute('data-ana-read', 'true');
            
            // Efecto visual (borde amarillo para baja visión)
            el.style.outline = '2px solid #f59e0b';
            el.style.transition = 'outline 0.3s';
            setTimeout(() => { 
                el.style.outline = 'none'; 
                // Permitimos volver a leerlo pasados 10 segundos si vuelve a pasar
                setTimeout(() => el.removeAttribute('data-ana-read'), 10000);
            }, 2000);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 1.0 // Solo lee cuando el elemento está 100% visible (evita leer cosas cortadas)
    });

    elements.forEach(el => {
        // Añadimos evento MouseOver para usuarios con ratón
        el.addEventListener('mouseenter', () => {
             const t = (el as HTMLElement).innerText;
             if(t && t.length > 2) speak(t);
        });
        observer.observe(el);
    });

    return () => observer.disconnect();
  }, [hasStarted]);

  // PANTALLA DE INICIO (CORTINA)
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
        aria-label="Pantalla de bienvenida. Pulsa para activar la voz."
      >
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%', background: '#0066ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px',
          boxShadow: '0 0 60px rgba(0,102,255,0.8)', animation: 'pulse 2s infinite'
        }}>
          <Mic size={50} color="#fff" />
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 900, marginBottom: '20px' }}>MODO INVIDENTE</h1>
        <p style={{ fontSize: '24px', opacity: 0.8 }}>Toca la pantalla para iniciar.</p>
        <style jsx>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }`}</style>
      </main>
    );
  }

  return (
    <div style={{ position: 'relative', backgroundColor: '#020305', minHeight: '100vh' }}>
      
      {/* BARRA DE CONTROL SUPERIOR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '60px',
        background: '#0066ff', color: '#fff', display: 'flex', alignItems: 'center', 
        justifyContent: 'space-between', padding: '0 20px', zIndex: 9999,
        boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px'}}>
            <Volume2 size={24} className="animate-pulse"/> ANA ESTÁ LEYENDO...
        </div>
        <button 
            onClick={() => window.speechSynthesis.cancel()} 
            style={{background:'rgba(0,0,0,0.2)', border:'none', padding:'10px', borderRadius:'8px', color:'#fff', cursor:'pointer'}}
        >
            <StopCircle size={24} /> SILENCIAR
        </button>
      </div>

      <div style={{ paddingTop: '60px' }}>
        <div data-ana-section="navbar"><Navbar /></div>
        <div data-ana-section="hero"><Hero /></div>
        <div data-ana-section="features"><Features /></div>
        <div data-ana-section="demo"><AnaDemo /></div>
        <div data-ana-section="roi"><RoiSection /></div>
        <div data-ana-section="testimonials"><TestimonialsGallery /></div>
        <div data-ana-section="pricing"><Pricing /></div>
        <div data-ana-section="faq"><FaqSection /></div>
        <div data-ana-section="trust"><TrustBar /></div>
        <div data-ana-section="footer"><Footer /></div>
      </div>
    </div>
  );
}