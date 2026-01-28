'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Mic, 
  CheckCircle2, BadgeEuro, MessageCircle, ShieldAlert
} from 'lucide-react';

// --- MOTOR DE NARRACIÓN DE ÉLITE ---
const narrar = (texto: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    msg.rate = 0.9; // Velocidad pausada para máxima comprensión
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
  }
};

export default function AccessPage() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId !== activeSection) {
            setActiveSection(sectionId);
            const scripts: any = {
              "hero": "Bienvenido a la versión de accesibilidad total de FisioTool Pro. Estás en la cabecera. Aquí es donde tu talento recupera su soberanía. Ana, tu nueva inteligencia conductual, está lista para gestionar tu clínica mientras tú te centras en el paciente. Para nosotros, tu falta de visión no es una limitación, es una oportunidad para usar la mejor tecnología manos libres del mercado.",
              
              "testimonio": "Sección de autoridad. Estás ante el testimonio real de un fisioterapeuta que ya utiliza FisioTool. Él describe cómo Ana ha eliminado el estrés de su agenda y cómo la interfaz audible le permite gestionar su centro con total autonomía, sin depender de terceras personas para leer su calendario.",
              
              "ventajas": "Análisis de ventajas estratégicas. Primero: Cero No-Shows. Ana exige una fianza automática de 15 euros, blindando tu facturación ante pacientes olvidadizos. Segundo: Historial por Voz. No vuelvas a tocar un teclado; dicta la evolución del paciente tras la sesión y Ana la guardará de forma estructurada. Tercero: Reactivación Activa. Ana detecta a los pacientes que no han vuelto en 3 meses y los invita a regresar por WhatsApp para cuidar su salud.",
              
              "roi": "Impacto económico real. Imagina que pierdes solo 10 citas al mes a 50 euros cada una. Eso son 6.000 euros al año tirados a la basura. FisioTool recupera el 90% de esas pérdidas mediante el cobro de fianzas y recordatorios inteligentes. En un solo mes, Ana ha pagado su propia suscripción y te ha generado un beneficio neto extra de 400 euros.",
              
              "licencia": "Suscripción FisioTool Pro Edition. Por solo 100 euros al mes, activas a tu Directora de Operaciones 24/7. Es un agente de élite que no duerme, no se equivoca y te garantiza la soberanía total de tu negocio. El botón de activación está justo debajo de este bloque.",
              
              "faq": "Sección de ingeniería de dudas. Aquí respondemos tus preguntas técnicas. Confirmamos que tus datos se cifran en Bélgica bajo estándares militares y que tienes control total sobre tus métodos de cobro, ya sea Bizum, Stripe o efectivo."
            };
            if (scripts[sectionId]) narrar(scripts[sectionId]);
          }
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('section, header').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [activeSection]);

  return (
    <div style={pageContainer}>
      <div style={glowCyan} />
      <div style={glowMagenta} />

      {/* --- NAVBAR --- */}
      <nav style={navbarStyle} aria-label="Navegación superior">
        <div style={logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo de FisioTool" style={{ height: '32px' }} />
          <span style={logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff'}}>INCLUSIVE</span></span>
        </div>
        <button onClick={() => window.location.href='/login'} aria-label="Botón: Acceso profesional a tu panel" style={loginBtn}>ACCESO ÉLITE</button>
      </nav>

      {/* --- HERO --- */}
      <header id="hero" style={heroSection}>
        <div style={badgeStyle}><Volume2 size={14} color="#38bdf8" /> MODO AUDIBLE DE ALTA PRECISIÓN ACTIVO</div>
        <h1 style={mainTitle}>Tu talento merece <br /><span style={gradientText}>soberanía total.</span></h1>
        <p style={heroDescription}>La primera plataforma SaaS diseñada para que los profesionales invidentes lideren el sector con IA conductual y manos libres.</p>
        <button onClick={() => window.location.href='/setup'} aria-label="Botón: Empezar ahora y reclamar mes gratuito" style={btnMain}>RECLAMAR MI MES GRATIS ➜</button>
      </header>

      {/* --- TESTIMONIO --- */}
      <section id="testimonio" style={sectionPadding} aria-label="Sección de testimonio de usuario">
        <div style={videoBox}>
           <Play size={80} color="#0066ff" style={{opacity:0.4}} />
           <div style={{marginTop:'20px', fontWeight:800, letterSpacing:'2px'}}>TESTIMONIO REAL DE USUARIO PRO</div>
        </div>
      </section>

      {/* --- VENTAJAS --- */}
      <section id="ventajas" style={sectionPadding} aria-label="Sección de beneficios">
        <div style={gridDolores}>
          <div style={painCardStyle} aria-label="Ventaja 1: Blindaje contra cancelaciones">
            <ShieldCheck color="#10b981" size={32} />
            <h4 style={cardTitle}>Facturación Blindada</h4>
            <p style={cardText}>Ana gestiona el cobro de fianzas para que cada minuto de tu tiempo esté pagado de antemano.</p>
          </div>
          <div style={painCardStyle} aria-label="Ventaja 2: Historial por voz">
            <Mic color="#0066ff" size={32} />
            <h4 style={cardTitle}>Mando por Voz</h4>
            <p style={cardText}>Dicta tus notas clínicas y evoluciones. Ana las organiza y las guarda sin que toques el teclado.</p>
          </div>
          <div style={painCardStyle} aria-label="Ventaja 3: Reactivación automática">
            <TrendingUp color="#38bdf8" size={32} />
            <h4 style={cardTitle}>Comercial Inteligente</h4>
            <p style={cardText}>Ana detecta pacientes antiguos y los invita a volver, manteniendo tu agenda siempre llena.</p>
          </div>
        </div>
      </section>

      {/* --- ROI NARRATIVO (SIN SLIDERS COMPLEJOS) --- */}
      <section id="roi" style={roiSection} aria-label="Sección de cálculo de ahorro anual">
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          <h2 style={sectionTitle}>El valor de tu libertad</h2>
          <div style={roiNarrativeBox}>
             <div style={{fontSize:'24px', fontWeight:800, color:'#10b981', marginBottom:'20px'}}>Caso Real: 6.000€ recuperados al año</div>
             <p style={{fontSize:'18px', opacity:0.7, lineHeight:'1.8'}}>
               Un fisioterapeuta con 10 cancelaciones al mes pierde una fortuna. <br/>
               Con el <strong>Módulo Centinela</strong>, Ana recupera ese dinero exigiendo compromiso. <br/>
               FisioTool Pro Edition no es un coste de 100€, es una ganancia neta desde el primer día.
             </p>
          </div>
        </div>
      </section>

      {/* --- LICENCIA --- */}
      <section id="licencia" style={sectionPadding} aria-label="Sección de precio y suscripción">
        <div style={pricingCard}>
          <BadgeEuro size={48} color="#0066ff" style={{marginBottom:'20px'}} />
          <h2 style={{fontSize:'48px', fontWeight:900, color:'#0066ff'}}>100€ <small style={{fontSize:'20px', color:'#fff', opacity:0.4}}>/ mes</small></h2>
          <p style={{fontSize:'20px', fontWeight:600, marginBottom:'40px'}}>Tu Directora de Operaciones 24/7</p>
          <button onClick={() => window.location.href='/setup'} aria-label="Botón: Activar mi licencia profesional ahora" style={btnMain}>ACTIVAR MI FERRARI ➜</button>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" style={sectionPadding} aria-label="Sección de dudas frecuentes">
        <div style={{maxWidth:'800px', margin:'0 auto', textAlign:'left'}}>
           <h2 style={{...sectionTitle, textAlign:'left'}}>Dudas de Ingeniería</h2>
           <div style={faqBlock}>
              <p><strong>¿Cómo recibo mis cobros?</strong> Tú eliges carril: Stripe automático o Bizum directo. Ana se adapta a tu banco.</p>
              <p><strong>¿Es legal el tratamiento de datos?</strong> Sí. Cifrado AES-256 en servidores de la Unión Europea bajo estricto cumplimiento RGPD.</p>
           </div>
        </div>
      </section>

      <footer style={footerStyle}>
        <div style={{opacity: 0.3, letterSpacing: '4px', fontWeight: 800}}>FISIOTOOL PRO EDITION 2026 — VERSIÓN INCLUSIVE</div>
      </footer>
    </div>
  );
}

// --- ESTILOS DE PRECISIÓN ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' };
const glowCyan: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.08) 0%, transparent 50%)' };
const glowMagenta: React.CSSProperties = { position: 'absolute', bottom: 0, right: 0, width: '100%', height: '600px', background: 'radial-gradient(circle at 90% 90%, rgba(255,0,150,0.05) 0%, transparent 50%)' };
const navbarStyle: React.CSSProperties = { padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(2,3,5,0.8)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, width: '100%', zSide: 1000, boxSizing: 'border-box' };
const logoWrapper: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px' };
const logoTextStyle: React.CSSProperties = { fontWeight: 900, fontSize: '18px', letterSpacing: '-1px' };
const loginBtn: React.CSSProperties = { background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' };
const heroSection: React.CSSProperties = { paddingTop: '220px', paddingBottom: '100px', px: '20px', textAlign: 'center' };
const badgeStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(56,189,248,0.05)', borderRadius: '100px', fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '40px', border: '1px solid rgba(56,189,248,0.1)' };
const mainTitle: React.CSSProperties = { fontSize: 'clamp(44px, 9vw, 110px)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: '0.85', marginBottom: '40px' };
const gradientText: React.CSSProperties = { color: '#0066ff' };
const heroDescription: React.CSSProperties = { fontSize: '20px', color: 'rgba(255,255,255,0.4)', maxWidth: '700px', margin: '0 auto 60px', lineHeight: '1.6' };
const btnMain: React.CSSProperties = { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' };
const videoBox: React.CSSProperties = { maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#05070a', borderRadius: '40px', border: '12px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 50px 100px rgba(0,0,0,0.5)' };
const sectionPadding: React.CSSProperties = { padding: '150px 6%' };
const gridDolores: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1300px', margin: '0 auto' };
const painCardStyle: React.CSSProperties = { padding: '60px 40px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' };
const cardTitle: React.CSSProperties = { fontSize: '24px', fontWeight: 800, margin: '20px 0' };
const cardText: React.CSSProperties = { fontSize: '16px', opacity: 0.5, lineHeight: '1.6' };
const roiSection: React.CSSProperties = { padding: '150px 20px', background: 'rgba(0,102,255,0.02)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(0,102,255,0.05)' };
const sectionTitle: React.CSSProperties = { fontSize: '40px', fontWeight: 900, textAlign: 'center', marginBottom: '60px' };
const roiNarrativeBox: React.CSSProperties = { padding: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' };
const pricingCard: React.CSSProperties = { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,102,255,0.2)', borderRadius: '50px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 60px 120px rgba(0,0,0,0.6)' };
const faqBlock: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '18px', opacity: 0.6 };
const footerStyle: React.CSSProperties = { padding: '100px 20px', textAlign: 'center', fontSize: '12px' };