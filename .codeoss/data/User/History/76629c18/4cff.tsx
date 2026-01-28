'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Volume2, TrendingUp, Mic, AlertCircle, BadgeEuro 
} from 'lucide-react';
    
import RoiSimulator from '../../components/RoiSimulator';

   

// --- MOTOR DE NARRACIÓN PROFESIONAL ---
const narrar = (texto: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel(); // Detiene narraciones previas
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    msg.rate = 0.95;
    window.speechSynthesis.speak(msg);
  }
};

export default function AccessPage() {
  const [activeSection, setActiveSection] = useState("");
  // Ref para evitar ciclos infinitos y capturar el estado real dentro del observer
  const activeSectionRef = useRef("");

  useEffect(() => {
    const narraciones: Record<string, string> = {
      "hero": "Bienvenido a FisioTool Pro. Estás en la cabecera. Aquí comienza tu revolución hacia la soberanía clínica.",
      "experiencia": "Sección de resultados. Estás ante el testimonio real de éxito de la Clínica Doctor Murillo.",
      "ventajas": "Sección de ventajas estratégicas. Ana elimina tus no-shows y gestiona tus informes por voz.",
      "roi": "Calculadora de impacto. Aquí puedes medir cuánto dinero estás recuperando al año.",
      "licencia": "Suscripción Profesional. Activa tu Directora de Operaciones por cien euros al mes.",
      "faq": "Resolución de dudas. Aquí despejamos cualquier pregunta sobre el blindaje de tu clínica."
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          // Solo narramos si la sección es diferente a la última guardada en la Ref
          if (sectionId !== activeSectionRef.current) {
            activeSectionRef.current = sectionId;
            setActiveSection(sectionId);
            if (narraciones[sectionId]) {
              narrar(narraciones[sectionId]);
            }
          }
        }
      });
    }, { threshold: 0.6 }); // Umbral ajustado para precisión

    document.querySelectorAll('section, header').forEach((s) => observer.observe(s));

    return () => {
        observer.disconnect();
        if (window.speechSynthesis) window.speechSynthesis.cancel(); // Limpieza al salir
    };
  }, []); // Array vacío: Solo se ejecuta una vez al montar

  return (
    <div style={pageContainer}>
      <div style={glowCyan} />
      <div style={glowMagenta} />

      <div style={srOnly}>Estás en la versión inclusiva de FisioTool. Ana te narrará cada sección automáticamente.</div>

      {/* --- NAVBAR --- */}
      <nav style={navbarStyle}>
        <div style={logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff'}}>INCLUSIVE</span></span>
        </div>
        <button onClick={() => window.location.href='/login'} style={loginBtn}>ACCESO ÉLITE</button>
      </nav>

      {/* --- HERO --- */}
      <header id="hero" style={heroSection}>
        <div style={badgeStyle}><Volume2 size={14} color="#0066ff" /> EXPERIENCIA AUDIBLE ACTIVA</div>
        <h1 style={mainTitle}>Tu talento merece <br /><span style={gradientText}>un Ferrari.</span></h1>
        <p style={heroDescription}>Diseñado para el talento, no para la vista. El motor de IA que blinda tu agenda.</p>
        <button onClick={() => window.location.href='/setup'} style={btnMain}>RECLAMAR MI MES GRATIS ➜</button>
      </header>

      {/* --- VIDEO --- */}
      <section id="experiencia" style={sectionPadding}>
        <div style={videoContainer}>
           <Play size={80} color="#0066ff" style={{opacity:0.4}} />
           <p style={{marginTop:'20px', fontWeight:800}}>TESTIMONIO AUDIBLE: DR. MURILLO</p>
        </div>
      </section>

      {/* --- VENTAJAS --- */}
      <section id="ventajas" style={sectionPadding}>
        <div style={gridDolores}>
          <div style={painCardStyle}>
            <AlertCircle color="#ef4444" />
            <h4>Cero No-Shows</h4>
            <p>Ana cobra fianzas por ti. Dinero garantizado.</p>
          </div>
          <div style={painCardStyle}>
            <Mic color="#0066ff" />
            <h4>Informes por Voz</h4>
            <p>Dicta y Ana escribe. Ahorra 1h de papeleo al día.</p>
          </div>
          <div style={painCardStyle}>
            <TrendingUp color="#10b981" />
            <h4>Reactivación</h4>
            <p>Ana recupera a tus pacientes antiguos automáticamente.</p>
          </div>
        </div>
      </section>

      {/* --- ROI --- */}
      <section id="roi" style={roiSection}>
        <h2 style={sectionTitle}>Mide tu ahorro anual</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA --- */}
      <section id="licencia" style={sectionPadding}>
        <div style={pricingCard}>
          <BadgeEuro size={32} color="#10b981" />
          <h2 style={{fontSize:'36px', fontWeight:900}}>100€ / mes</h2>
          <p>Tu nueva Directora de Operaciones 24/7</p>
          <button onClick={() => window.location.href='/setup'} style={btnMain}>EMPEZAR AHORA ➜</button>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" style={sectionPadding}>
        <h2 style={sectionTitle}>Dudas de Ingeniería</h2>
        <div style={{maxWidth:'800px', margin:'0 auto', textAlign:'left'}}>
           <p><strong>¿Es seguro?</strong> Cifrado de grado médico en la Unión Europea.</p>
           <p><strong>¿Cómo cobro?</strong> Stripe, Bizum o Efectivo. Tú mandas.</p>
        </div>
      </section>

      <footer style={footerStyle}>
        © FISIOTOOL 2026 — VERSIÓN ACCESIBILIDAD TOTAL
      </footer>
    </div>
  );
}

// --- ESTILOS OPTIMIZADOS ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', textAlign: 'center' };
const glowCyan: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.08) 0%, transparent 50%)' };
const glowMagenta: React.CSSProperties = { position: 'absolute', bottom: 0, right: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 90% 90%, rgba(255,0,150,0.05) 0%, transparent 50%)' };
const navbarStyle: React.CSSProperties = { padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const logoWrapper: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' };
const logoTextStyle: React.CSSProperties = { fontWeight: 900, fontSize: '18px', letterSpacing: '-1px' };
const loginBtn: React.CSSProperties = { background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '8px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' };

const heroSection: React.CSSProperties = { 
    paddingTop: '150px', 
    paddingBottom: '100px', 
    paddingLeft: '20px',   // Corregido: px no existe
    paddingRight: '20px'   // Corregido: px no existe
};

const badgeStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0,102,255,0.1)', borderRadius: '100px', fontSize: '10px', fontWeight: 800, color: '#38bdf8', marginBottom: '30px' };
const mainTitle: React.CSSProperties = { fontSize: 'clamp(40px, 10vw, 100px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: '0.9', marginBottom: '40px' };
const gradientText: React.CSSProperties = { color: '#0066ff' };
const heroDescription: React.CSSProperties = { fontSize: '18px', color: 'rgba(255,255,255,0.4)', maxWidth: '700px', margin: '0 auto 60px' };
const btnMain: React.CSSProperties = { background: '#0066ff', color: '#fff', border: 'none', padding: '20px 50px', borderRadius: '18px', fontWeight: 800, fontSize: '18px', cursor: 'pointer' };
const videoContainer: React.CSSProperties = { maxWidth: '900px', margin: '0 auto', aspectRatio: '16/9', background: '#05070a', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const sectionPadding: React.CSSProperties = { padding: '100px 20px' };
const gridDolores: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' };
const painCardStyle: React.CSSProperties = { padding: '40px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px' };
const roiSection: React.CSSProperties = { padding: '100px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '80px', margin: '0 20px' };
const sectionTitle: React.CSSProperties = { fontSize: '32px', fontWeight: 900, marginBottom: '60px' };
const pricingCard: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', padding: '60px' };
const footerStyle: React.CSSProperties = { padding: '100px 5% 40px', opacity: 0.2, fontSize: '11px', fontWeight: 800, letterSpacing: '2px' };
const srOnly: React.CSSProperties = { position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: '0' };