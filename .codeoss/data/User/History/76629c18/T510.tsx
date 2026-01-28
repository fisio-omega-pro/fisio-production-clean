'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Mic, 
  CheckCircle2, BadgeEuro, MessageCircle, ShieldAlert,
  ChevronDown, Headset
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS (SINCRO TOTAL)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  heroSection: { paddingTop: '220px', paddingBottom: '100px', px: '20px', textAlign: 'center' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(44px, 9vw, 110px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.85', marginBottom: '40px' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative' } as React.CSSProperties,
  videoBox: { maxWidth: '1000px', margin: '0 auto', aspectRatio: '16/9', background: '#05070a', borderRadius: '40px', border: '12px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 50px 100px rgba(0,0,0,0.5)' } as React.CSSProperties,
  painCard: { padding: '60px 40px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  roiSection: { padding: '150px 20px', background: 'rgba(0,102,255,0.02)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(0,102,255,0.05)' } as React.CSSProperties,
  pricingCard: { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,102,255,0.2)', borderRadius: '50px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 60px 120px rgba(0,0,0,0.6)' } as React.CSSProperties,
  voiceBadge: { position: 'fixed', bottom: '30px', right: '30px', background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 800, zIndex: 2000, boxShadow: '0 10px 30px rgba(16,185,129,0.4)' } as React.CSSProperties
};

// ==========================================
// 🚀 PÁGINA PRINCIPAL
// ==========================================
export default function AccessPage() {
  const [activeSection, setActiveSection] = useState("");
  const lastNarrated = useRef("");
  const [isListening, setIsListening] = useState(false);

  // --- 🔊 MOTOR DE NARRACIÓN (ANTI-TARTAMUDEO) ---
  const narrar = (texto: string, sectionId: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (lastNarrated.current === sectionId) return; // BLOQUEO DE SEGURIDAD
      
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-ES';
      msg.rate = 0.92;
      msg.onstart = () => { lastNarrated.current = sectionId; };
      window.speechSynthesis.speak(msg);
    }
  };

  // --- 🎤 MOTOR DE COMANDOS DE VOZ (CLIC POR VOZ) ---
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("🎤 Comando detectado:", command);
      
      if (command.includes("registrar") || command.includes("activar") || command.includes("mes gratis")) {
        narrar("Entendido. Redirigiendo a la zona de activación segura.", "nav");
        setTimeout(() => window.location.href = '/setup', 1500);
      }
    };

    recognition.onstart = () => setIsListening(true);
    recognition.start();

    return () => recognition.stop();
  }, []);

  // --- 👁️ OBSERVADOR DE SECCIONES ---
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const id = entry.target.id;
          const scripts: any = {
            "hero": "Bienvenido a la soberanía clínica de FisioTool Pro. Estás en la cabecera. Di la palabra REGISTRAR en cualquier momento para activar tu cuenta.",
            "testimonio": "Sección de autoridad. Estás ante el testimonio real de un fisioterapeuta de élite que ha recuperado su libertad gracias a Ana.",
            "ventajas": "Análisis de beneficios. Ana elimina tus no-shows exigiendo fianza y redacta tus informes clínicos por voz. Tú tratas, Ana gestiona.",
            "roi": "Impacto económico. Un fisio promedio pierde seis mil euros al año por cancelaciones. Con Ana, ese dinero se queda en tu bolsillo desde el primer mes.",
            "licencia": "Suscripción Profesional. Por cien euros al mes, activas a tu nueva Directora de Operaciones 24/7. Di ACTIVAR para empezar ahora mismo."
          };
          if (scripts[id]) narrar(scripts[id], id);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('section, header').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={styles.pageContainer}>
      {/* INDICADOR DE VOZ ACTIVA */}
      <div style={styles.voiceBadge}>
        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
        ANA TE ESCUCHA: DI "REGISTRAR"
      </div>

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff'}}>INCLUSIVE</span></span>
        </div>
        <button onClick={() => window.location.href='/login'} style={{ background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '8px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: 800 }}>ACCESO PROFESIONAL</button>
      </nav>

      {/* --- HERO --- */}
      <header id="hero" style={styles.heroSection}>
        <div style={{fontSize:'10px', fontWeight:900, color:'#38bdf8', letterSpacing:'4px', marginBottom:'20px'}}>SISTEMA DE MANDO POR VOZ ACTIVO</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={{color:'#0066ff'}}>soberanía total.</span></h1>
        <p style={{fontSize:'20px', opacity:0.4, maxWidth:'800px', margin:'0 auto 60px'}}>Diseñado para que los profesionales invidentes lideren el sector mediante IA conductual y gestión manos libres.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
      </header>

      {/* --- TESTIMONIO --- */}
      <section id="testimonio" style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <Play size={80} color="#0066ff" style={{opacity:0.4}} />
           <p style={{marginTop:'20px', fontWeight:800, letterSpacing:'2px'}}>TESTIMONIO AUDIBLE DE ÉXITO</p>
        </div>
        <button onClick={() => window.location.href='/setup'} style={{...styles.btnMain, marginTop:'60px', padding:'15px 40px', fontSize:'16px'}}>QUIERO ESTOS RESULTADOS ➜</button>
      </section>

      {/* --- VENTAJAS --- */}
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
        <button onClick={() => window.location.href='/setup'} style={{...styles.btnMain, marginTop:'60px', background:'#fff', color:'#000'}}>ACTIVAR MI MANDO POR VOZ ➜</button>
      </section>

      {/* --- ROI NARRATIVO --- */}
      <section id="roi" style={styles.roiSection}>
        <div style={{maxWidth:'800px', margin:'0 auto', textAlign:'center'}}>
          <h2 style={{fontSize:'40px', fontWeight:900, marginBottom:'40px'}}>El ROI de tu libertad</h2>
          <div style={{padding:'40px', background:'rgba(255,255,255,0.02)', borderRadius:'32px', border:'1px solid rgba(255,255,255,0.05)'}}>
             <div style={{fontSize:'28px', fontWeight:800, color:'#10b981', marginBottom:'20px'}}>6.000€ recuperados al año</div>
             <p style={{fontSize:'18px', opacity:0.6, lineHeight:'1.8'}}>Un solo mes de uso de Ana paga toda la suscripción anual. <br/>Estás ante la herramienta de gestión más rentable de tu carrera.</p>
             <button onClick={() => window.location.href='/setup'} style={{...styles.btnMain, marginTop:'30px', padding:'15px 30px', fontSize:'14px'}}>DEJAR DE PERDER DINERO ➜</button>
          </div>
        </div>
      </section>

      {/* --- LICENCIA --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.pricingCard}>
          <BadgeEuro size={48} color="#0066ff" style={{marginBottom:'20px'}} />
          <h2 style={{fontSize:'52px', fontWeight:900, color:'#0066ff'}}>100€ / mes</h2>
          <p style={{fontSize:'20px', fontWeight:600, opacity:0.5, marginBottom:'40px'}}>Tu Directora de Operaciones 24/7</p>
          <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>ACTIVAR MI FERRARI AHORA ➜</button>
        </div>
      </section>

      <footer style={{padding:'100px 20px', textAlign:'center', opacity:0.3, fontSize:'12px', letterSpacing:'4px'}}>
        FISIOTOOL PRO EDITION 2026 — SOVEREIGN INCLUSIVE
      </footer>
    </div>
  );
}