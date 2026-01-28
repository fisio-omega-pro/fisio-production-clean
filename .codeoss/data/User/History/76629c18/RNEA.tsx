'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle
} from 'lucide-react';
import RoiSimulator from '../../components/RoiSimulator';

// ==========================================
// 🚀 MOTOR DE VOZ PROFESIONAL (SINCRO TOTAL)
// ==========================================
const useNarrador = () => {
  const speak = (texto: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Detiene cualquier voz previa
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
      console.log("🔊 Ana narrando:", texto);
    }
  };
  return { speak };
};

export default function AccessPage() {
  const [started, setStarted] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { speak } = useNarrador();

  // --- LÓGICA DE NARRACIÓN POR SCROLL ---
  useEffect(() => {
    if (!started) return;

    const guion: any = {
      "hero": "Sección principal. Tu talento merece un Ferrari. Blinda tu agenda hoy mismo.",
      "experiencia": "Sección de resultados. Testimonio real de la Clínica Doctor Murillo.",
      "ventajas": "Sección Ventajas. Ana elimina tus no-shows y gestiona tus informes por voz.",
      "roi": "Calculadora de Ahorro. Desliza para medir cuánto dinero recuperas con Ana.",
      "licencia": "Suscripción Profesional. Cien euros al mes. Tu nueva Directora de Operaciones.",
      "footer": "Final de página. Datos de contacto y legalidad."
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const id = entry.target.id;
          if (id !== activeSection && guion[id]) {
            setActiveSection(id);
            speak(guion[id]);
          }
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('section, header').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [started, activeSection]);

  // Botón de Acción Reutilizable (Voz al enfocarse)
  const ActionButton = ({ text, onClick, aria }: any) => (
    <button 
      onClick={onClick} 
      onFocus={() => speak(`Botón: ${aria || text}`)}
      onMouseEnter={() => speak(`Botón: ${aria || text}`)}
      style={styles.btnCta}
    >
      {text} ➜
    </button>
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.glowCyan} />
      
      {/* --- PANTALLA DE ACTIVACIÓN (GATILLO OBLIGATORIO) --- */}
      <AnimatePresence>
        {!started && (
          <motion.div exit={{ opacity: 0 }} style={styles.overlay}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={styles.welcomeCard}>
              <div style={styles.iconBadge}><Volume2 size={48} color="#0066ff" /></div>
              <h2 style={{fontSize: '32px', fontWeight: 900, margin: '20px 0'}}>FisioTool Inclusive</h2>
              <p style={{opacity: 0.6, marginBottom: '40px', fontSize: '18px'}}>Pulsa el botón central para activar la navegación guiada por la IA Ana.</p>
              <button 
                style={styles.btnMain} 
                onClick={() => { setStarted(true); speak("Experiencia activada. Bienvenido a FisioTool Pro. Soy Ana, tu guía hacia el éxito clínico. Haz scroll para empezar."); }}
                aria-label="Activar experiencia audible"
              >
                ENCENDER EL FERRARI 🏎️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- INTERFAZ --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff'}}>INCLUSIVE</span></span>
        </div>
        <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
      </nav>

      {/* SECCIÓN HERO */}
      <header id="hero" style={styles.heroSection}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> DISEÑADO PARA EL TALENTO</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>La IA conductual que blinda tu agenda. Diseñada para profesionales que ven con las manos.</p>
        <ActionButton text="RECLAMAR MI MES GRATIS" onClick={() => window.location.href='/setup'} />
      </header>

      {/* SECCIÓN VÍDEO */}
      <section id="experiencia" style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <Play size={100} color="#0066ff" style={{opacity:0.2}} />
           <p style={{marginTop:'30px', fontWeight:900, letterSpacing:'4px'}}>VÍDEO TESTIMONIO: CLÍNICA DR. MURILLO</p>
        </div>
        <div style={{marginTop:'50px'}}><ActionButton text="RECLAMAR MI MES GRATIS" onClick={() => window.location.href='/setup'} /></div>
      </section>

      {/* SECCIÓN VENTAJAS */}
      <section id="ventajas" style={styles.sectionPadding}>
        <div style={styles.gridDolores}>
          <div style={styles.painCard} onMouseEnter={() => speak("Cero No Shows. Ana cobra fianzas automáticamente.")}>
            <AlertCircle color="#ef4444" size={32} />
            <h4 style={{fontSize:'22px', margin:'15px 0'}}>Cero No-Shows</h4>
            <p style={{opacity:0.5}}>Ingresos garantizados. Ana cobra fianzas por ti.</p>
          </div>
          <div style={styles.painCard} onMouseEnter={() => speak("Notas por voz. Dicta el historial sin fatiga.")}>
            <Mic color="#0066ff" size={32} />
            <h4 style={{fontSize:'22px', margin:'15px 0'}}>Notas por Voz</h4>
            <p style={{opacity:0.5}}>Sin teclados. Ahorra 1 hora de papeleo al día.</p>
          </div>
        </div>
        <div style={{marginTop:'50px'}}><ActionButton text="RECLAMAR MI MES GRATIS" onClick={() => window.location.href='/setup'} /></div>
      </section>

      {/* SECCIÓN ROI */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>Calcula tu ahorro anual</h2>
        <RoiSimulator />
        <div style={{marginTop:'50px'}}><ActionButton text="EMPEZAR MI REVOLUCIÓN" onClick={() => window.location.href='/setup'} /></div>
      </section>

      {/* SECCIÓN PRECIO */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.pricingCard}>
          <BadgeEuro size={48} color="#10b981" />
          <h2 style={{fontSize:'48px', fontWeight:900, margin:'20px 0'}}>100€ / mes</h2>
          <p style={{opacity:0.6, fontSize:'18px', marginBottom:'40px'}}>Activa hoy tu Directora de Operaciones 24/7</p>
          <ActionButton text="ACTIVAR MI LICENCIA PRO" onClick={() => window.location.href='/setup'} />
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
  overlay: { position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(2,3,5,0.98)', backdropFilter: 'blur(25px)', display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties,
  welcomeCard: { maxWidth: '500px', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' } as React.CSSProperties,
  iconBadge: { display: 'inline-flex', padding: '20px', background: 'rgba(0,102,255,0.1)', borderRadius: '24px', marginBottom: '20px' } as React.CSSProperties,
  navbar: { padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px' } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' } as React.CSSProperties,
  loginBtn: { background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '150px', paddingBottom: '100px', textAlign: 'center', px: '20px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(44px, 10vw, 110px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '40px' } as React.CSSProperties,
  gradientText: { color: '#0066ff' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '700px', margin: '0 auto 60px' } as React.CSSProperties,
  btnMain: { background: '#0066ff', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' } as React.CSSProperties,
  btnCta: { background: 'linear-gradient(135deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '50px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,102,255,0.2)' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', textAlign: 'center' } as React.CSSProperties,
  videoBox: { maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#000', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  gridDolores: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
  painCard: { padding: '60px 40px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%' } as React.CSSProperties,
  secTitle: { fontSize: '42px', fontWeight: 900, marginBottom: '60px' } as React.CSSProperties,
  pricingCard: { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '60px', padding: '80px 40px' } as React.CSSProperties,
  footer: { padding: '100px 5% 40px', opacity: 0.2, fontSize: '11px', fontWeight: 800, letterSpacing: '4px' } as React.CSSProperties,
  glowCyan: { position: 'absolute', top: 0, left: 0, width: '100%', height: '800px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.15) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
  badgeStyle: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(0,102,255,0.1)', border: '1px solid rgba(0,102,255,0.2)', borderRadius: '100px', fontSize: '10px', fontWeight: 800, color: '#38bdf8', marginBottom: '40px', letterSpacing:'2px' } as React.CSSProperties,
};