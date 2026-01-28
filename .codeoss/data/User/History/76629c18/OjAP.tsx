'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle, X
} from 'lucide-react';
import RoiSimulator from '../../components/RoiSimulator';

// --- MOTOR DE VOZ SINCRO-OPE (SIN ATASCOS) ---
let narrandoActualmente = false;

const narrar = (texto: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel(); // Limpia cola
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    msg.rate = 0.9;
    msg.pitch = 1;
    msg.onstart = () => { narrandoActualmente = true; };
    msg.onend = () => { narrandoActualmente = false; };
    window.speechSynthesis.speak(msg);
  }
};

export default function AccessPage() {
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // --- OBSERVER DE INGENIERÍA ---
  useEffect(() => {
    if (!experienceStarted) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const id = entry.target.id;
          if (id !== activeSection) {
            setActiveSection(id);
            const guion: any = {
              "hero": "Bienvenido a la versión inclusive de FisioTool Pro. Estás en la cabecera. Aquí nace tu soberanía clínica.",
              "experiencia": "Sección Testimonio. Estás viendo los resultados reales de la Clínica Murillo. Ana recuperó sus ingresos.",
              "ventajas": "Sección Ventajas. Ana elimina tus no-shows y gestiona tus informes por voz.",
              "roi": "Calculadora de Impacto. Mide cuánto dinero te está robando tu agenda actual.",
              "licencia": "Suscripción de Élite. Cien euros al mes por una Directora de Operaciones virtual.",
              "footer": "Has llegado al final. Tienes los enlaces legales y de contacto disponibles."
            };
            if (guion[id]) narrar(guion[id]);
          }
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('section, header').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [experienceStarted, activeSection]);

  const CTA_PRINCIPAL = () => (
    <button 
      onClick={() => window.location.href='/setup'} 
      style={styles.btnCta}
      onFocus={() => narrar("Botón: Reclamar mi mes gratis ahora")}
    >
      RECLAMAR MI MES GRATIS ➜
    </button>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.glowCyan} />
      
      {/* --- PANTALLA DE INICIO (GATILLO DE VOZ) --- */}
      <AnimatePresence>
        {!experienceStarted && (
          <motion.div exit={{ opacity: 0 }} style={styles.overlay}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={styles.welcomeCard}>
              <Volume2 size={64} color="#0066ff" style={{marginBottom: '20px'}} />
              <h2 style={{fontSize: '32px', fontWeight: 900}}>Activar Experiencia</h2>
              <p style={{opacity: 0.6, marginBottom: '40px', fontSize: '18px'}}>Pulsa el botón para que Ana te guíe por voz a través de FisioTool Inclusive.</p>
              <button 
                style={styles.btnMain} 
                onClick={() => { setExperienceStarted(true); narrar("Experiencia activada. Haz scroll para navegar por las secciones."); }}
              >
                ENCENDER EL FERRARI 🏎️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff'}}>INCLUSIVE</span></span>
        </div>
        <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
      </nav>

      {/* --- HEADER --- */}
      <header id="hero" style={styles.heroSection}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> DISEÑADO PARA EL TALENTO</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Soberanía clínica total para profesionales que ven con las manos.</p>
        <CTA_PRINCIPAL />
      </header>

      {/* --- VIDEO --- */}
      <section id="experiencia" style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <Play size={100} color="#0066ff" style={{opacity:0.2}} />
           <p style={{marginTop:'30px', fontWeight:900, letterSpacing:'4px'}}>VÍDEO TESTIMONIO: DR. MURILLO</p>
        </div>
        <div style={{marginTop:'50px'}}><CTA_PRINCIPAL /></div>
      </section>

      {/* --- VENTAJAS --- */}
      <section id="ventajas" style={styles.sectionPadding}>
        <h2 style={styles.secTitle}>Ventajas Blindadas</h2>
        <div style={styles.gridDolores}>
          <div style={styles.painCard}>
            <AlertCircle color="#ef4444" size={32} />
            <h4 style={{fontSize:'22px', margin:'15px 0'}}>Cero No-Shows</h4>
            <p style={{opacity:0.5}}>Ana cobra fianzas automáticamente. Tu tiempo es sagrado.</p>
          </div>
          <div style={styles.painCard}>
            <Mic color="#0066ff" size={32} />
            <h4 style={{fontSize:'22px', margin:'15px 0'}}>Notas por Voz</h4>
            <p style={{opacity:0.5}}>Dicta el historial médico. Sin teclados, sin fatiga.</p>
          </div>
        </div>
        <div style={{marginTop:'50px'}}><CTA_PRINCIPAL /></div>
      </section>

      {/* --- ROI --- */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>Mide tu recuperación económica</h2>
        <RoiSimulator />
        <div style={{marginTop:'50px'}}><CTA_PRINCIPAL /></div>
      </section>

      {/* --- LICENCIA --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.pricingCard}>
          <BadgeEuro size={48} color="#10b981" />
          <h2 style={{fontSize:'48px', fontWeight:900, margin:'20px 0'}}>100€ / mes</h2>
          <p style={{opacity:0.6, fontSize:'18px', marginBottom:'40px'}}>Activa hoy tu Directora de Operaciones 24/7</p>
          <CTA_PRINCIPAL />
        </div>
      </section>

      <footer id="footer" style={styles.footer}>
        © FISIOTOOL 2026 — SOBERANÍA INCLUSIVA
      </footer>
    </div>
  );
}

// --- ESTILOS DE INGENIERÍA ---
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(2,3,5,0.98)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties,
  welcomeCard: { maxWidth: '500px', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  navbar: { padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px' } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' } as React.CSSProperties,
  loginBtn: { background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '150px', paddingBottom: '100px', textAlign: 'center', px: '20px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(44px, 10vw, 110px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '40px' } as React.CSSProperties,
  gradientText: { color: '#0066ff' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '700px', margin: '0 auto 60px' } as React.CSSProperties,
  btnMain: { background: '#0066ff', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' } as React.CSSProperties,
  btnCta: { background: 'linear-gradient(135deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '50px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,102,255,0.2)' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', textAlign: 'center' } as React.CSSProperties,
  videoBox: { maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#000', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  gridDolores: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  painCard: { padding: '50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%' } as React.CSSProperties,
  secTitle: { fontSize: '42px', fontWeight: 900, marginBottom: '60px' } as React.CSSProperties,
  pricingCard: { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '60px', padding: '80px 40px' } as React.CSSProperties,
  footer: { padding: '100px 5% 40px', opacity: 0.2, fontSize: '11px', fontWeight: 800, letterSpacing: '4px' } as React.CSSProperties,
  glowCyan: { position: 'absolute', top: 0, left: 0, width: '100%', height: '800px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.1) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
  badgeStyle: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', borderRadius: '100px', fontSize: '10px', fontWeight: 800, color: '#38bdf8', marginBottom: '40px', letterSpacing:'2px' } as React.CSSProperties,
};