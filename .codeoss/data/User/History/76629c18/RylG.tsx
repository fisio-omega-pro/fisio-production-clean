'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, TrendingUp, Mic, ShieldCheck, BadgeEuro, Volume2 
} from 'lucide-react';
import RoiSimulator from '../../components/RoiSimulator';

// ==========================================
// 🚀 ARQUITECTURA DE ESTILOS (AUDITADA)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  heroSection: { 
    paddingTop: '220px', 
    paddingBottom: '100px', 
    paddingLeft: '20px',   // Corregido: px -> paddingLeft
    paddingRight: '20px',  // Corregido: px -> paddingRight
    textAlign: 'center' 
  } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(44px, 9vw, 110px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.85', marginBottom: '40px' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative', textAlign: 'center' } as React.CSSProperties,
  videoBox: { maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#05070a', borderRadius: '40px', border: '12px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 50px 100px rgba(0,0,0,0.5)' } as React.CSSProperties,
  painCard: { padding: '60px 40px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  roiSection: { padding: '150px 20px', background: 'rgba(0,102,255,0.02)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(0,102,255,0.05)' } as React.CSSProperties,
  pricingCard: { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,102,255,0.2)', borderRadius: '50px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 60px 120px rgba(0,0,0,0.6)' } as React.CSSProperties,
  voiceBadge: { position: 'fixed', bottom: '30px', right: '30px', background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 800, zIndex: 2000, boxShadow: '0 10px 30px rgba(16,185,129,0.4)' } as React.CSSProperties
};

export default function AccessPage() {
  const router = useRouter();
  const lastNarrated = useRef("");
  const [isListening, setIsListening] = useState(false);

  // --- 🔊 MOTOR DE NARRACIÓN SANEADO ---
  const narrar = (texto: string, sectionId: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (lastNarrated.current === sectionId) return;
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-ES';
      msg.rate = 0.92;
      msg.onstart = () => { lastNarrated.current = sectionId; };
      window.speechSynthesis.speak(msg);
    }
  };

  // --- 🎤 MOTOR DE COMANDOS DE VOZ ---
  useEffect(() => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    
    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (command.includes("registrar") || command.includes("activar")) {
        narrar("Entendido. Redirigiendo a la zona de activación segura.", "nav");
        setTimeout(() => router.push('/setup'), 1500);
      }
    };

    recognition.onstart = () => setIsListening(true);
    try { recognition.start(); } catch (e) { console.error(e); }

    return () => {
        recognition.stop();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [router]);

  // --- 👁️ OBSERVADOR DE SECCIONES ---
  useEffect(() => {
    const scripts: Record<string, string> = {
      "hero": "Bienvenido a la soberanía clínica de FisioTool Pro. Estás en la cabecera. Di la palabra REGISTRAR para activar tu cuenta.",
      "testimonio": "Sección de autoridad. Estás ante el testimonio real de un fisioterapeuta de élite.",
      "ventajas": "Análisis de beneficios. Ana exige fianza y redacta tus informes clínicos por voz.",
      "roi": "Impacto económico. Calcula tu ahorro con nuestro simulador interactivo.",
      "licencia": "Suscripción Profesional. Di ACTIVAR para empezar ahora mismo."
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const id = entry.target.id;
          if (scripts[id]) narrar(scripts[id], id);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('section, header').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={styles.pageContainer}>
      
      {/* INDICADOR DE VOZ ACTIVA (FIXED TAILWIND REPLACEMENT) */}
      <div style={styles.voiceBadge}>
        <motion.div 
          animate={{ scale: [1, 1.5, 1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} 
        />
        ANA TE ESCUCHA: DI "REGISTRAR"
      </div>

      <nav style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff'}}>INCLUSIVE</span></span>
        </div>
        <button onClick={() => router.push('/login')} style={{ background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '8px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
          ACCESO PROFESIONAL
        </button>
      </nav>

      <header id="hero" style={styles.heroSection}>
        <div style={{fontSize:'10px', fontWeight:900, color:'#38bdf8', letterSpacing:'4px', marginBottom:'20px'}}>SISTEMA DE MANDO POR VOZ ACTIVO</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={{color:'#0066ff'}}>soberanía total.</span></h1>
        <p style={{fontSize:'20px', opacity:0.4, maxWidth:'800px', margin:'0 auto 60px'}}>Diseñado para que los profesionales de élite lideren el sector mediante IA conductual y gestión manos libres.</p>
        <button onClick={() => router.push('/setup')} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
      </header>

      <section id="testimonio" style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <Play size={80} color="#0066ff" style={{opacity:0.4}} />
           <p style={{marginTop:'20px', fontWeight:800, letterSpacing:'2px'}}>TESTIMONIO AUDIBLE DE ÉXITO</p>
        </div>
        <button onClick={() => router.push('/setup')} style={{...styles.btnMain, marginTop:'60px', padding:'15px 40px', fontSize:'16px'}}>QUIERO ESTOS RESULTADOS ➜</button>
      </section>

      <section id="ventajas" style={styles.sectionPadding}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'30px', maxWidth:'1300px', margin:'0 auto'}}>
          <div style={styles.painCard}>
            <ShieldCheck color="#10b981" size={32} />
            <h4 style={{fontSize:'24px', fontWeight:800, margin:'20px 0'}}>Facturación Blindada</h4>
            <p style={{opacity:0.5}}>Ana exige fianza automática. Se acabaron los huecos vacíos que pagas de tu bolsillo.</p>
          </div>
          <div style={styles.painCard}>
            <Mic color="#0066ff" size={32} />
            <h4 style={{fontSize:'24px', fontWeight:800, margin:'20px 0'}}>Informes por Voz</h4>
            <p style={{opacity:0.5}}>Dicta tus notas clínicas. Ana las transcribe y organiza mientras descansas las manos.</p>
          </div>
          <div style={styles.painCard}>
            <TrendingUp color="#38bdf8" size={32} />
            <h4 style={{fontSize:'24px', fontWeight:800, margin:'20px 0'}}>Reactivación Activa</h4>
            <p style={{opacity:0.5}}>Ana detecta la inactividad de tus pacientes y los invita a volver para su tratamiento.</p>
          </div>
        </div>
      </section>

      {/* --- ROI NARRATIVO CON SIMULADOR --- */}
      <section id="roi" style={styles.roiSection}>
        <div style={{maxWidth:'800px', margin:'0 auto', textAlign:'center'}}>
          <h2 style={{fontSize:'40px', fontWeight:900, marginBottom:'40px'}}>El ROI de tu libertad</h2>
          
          {/* INTEGRACIÓN DEL SIMULADOR QUE FALTABA */}
          <div style={{marginBottom: '60px'}}>
            <RoiSimulator />
          </div>

          <div style={{padding:'40px', background:'rgba(255,255,255,0.02)', borderRadius:'32px', border:'1px solid rgba(255,255,255,0.05)'}}>
             <div style={{fontSize:'28px', fontWeight:800, color:'#10b981', marginBottom:'20px'}}>6.000€ recuperados al año</div>
             <p style={{fontSize:'18px', opacity:0.6, lineHeight:'1.8'}}>Un solo mes de uso de Ana paga toda la suscripción anual.</p>
             <button onClick={() => router.push('/setup')} style={{...styles.btnMain, marginTop:'30px', padding:'15px 30px', fontSize:'14px'}}>DEJAR DE PERDER DINERO ➜</button>
          </div>
        </div>
      </section>

      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.pricingCard}>
          <BadgeEuro size={48} color="#0066ff" style={{marginBottom:'20px'}} />
          <h2 style={{fontSize:'52px', fontWeight:900, color:'#0066ff'}}>100€ / mes</h2>
          <p style={{fontSize:'20px', fontWeight:600, opacity:0.5, marginBottom:'40px'}}>Tu Directora de Operaciones 24/7</p>
          <button onClick={() => router.push('/setup')} style={styles.btnMain}>ACTIVAR MI FERRARI AHORA ➜</button>
        </div>
      </section>

      <footer style={{padding:'100px 20px', textAlign:'center', opacity:0.3, fontSize:'12px', letterSpacing:'4px'}}>
        FISIOTOOL PRO EDITION 2026 — SOVEREIGN INCLUSIVE
      </footer>
    </div>
  );
}