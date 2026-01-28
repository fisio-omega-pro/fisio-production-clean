'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Activity, Smartphone, Layout
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🎨 ESTILOS DE ÉLITE (DEFINIDOS AL INICIO)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '35px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '250px', paddingBottom: '150px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  faqAsymmetricGrid: { display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '100px', maxWidth: '1400px', margin: '150px auto' } as React.CSSProperties,
  faqAsymmetricGridReverse: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '100px', maxWidth: '1400px', margin: '150px auto' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'center', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  faqModuleCard: { background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'left' } as React.CSSProperties,
  footer: { padding: '120px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties
};

// --- COMPONENTE DE FONDO INTERACTIVO ---
function InteractiveBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%)`,
      backgroundColor: '#020305'
    }} />
  );
}

// --- SUB-COMPONENTES ---
function FaqModule({icon, q, a}: any) {
  return (
    <div style={styles.faqModuleCard}>
      <div style={{color:'#0066ff', marginBottom:'20px'}}>{icon}</div>
      <h4 style={{fontSize:'16px', fontWeight:800, marginBottom:'10px'}}>{q}</h4>
      <p style={{fontSize:'14px', opacity:0.4, lineHeight:'1.6'}}>{a}</p>
    </div>
  );
}

function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '12px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

function PainCard({icon, title, text}: any) {
  return (
    <div style={{ padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' }}>
      <div style={{ width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <h4 style={{fontSize: '24px', fontWeight: 800, margin: '20px 0'}}>{title}</h4>
      <p style={{fontSize: '16px', opacity: 0.5}}>{text}</p>
    </div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL
// ==========================================
export default function Page() {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div style={styles.pageContainer}>
      <InteractiveBackground />
      
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <a href="#experiencia" style={styles.linkStyle}>Experiencia</a>
          <a href="#roi" style={styles.linkStyle}>Impacto</a>
          <a href="#licencia" style={styles.linkStyle}>Licencia</a>
          <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO PROFESIONAL</button>
        </div>
      </nav>

      {/* HERO */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={{fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px'}}>SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>EMPEZAR MI REVOLUCIÓN GRATIS ➜</button>
        <div style={styles.videoBox}>
           <Play size={100} color="#fff" style={{ opacity: 0.1 }} />
           <div style={{position: 'absolute', bottom: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '12px', opacity: 0.3}}>TESTIMONIO REAL: DR. MURILLO</div>
        </div>
      </motion.header>

      {/* IMPACTO (ROI) */}
      <section id="roi" style={{ padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <h2 style={{ fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' }}>¿Cuánto dinero te está robando tu agenda?</h2>
          <RoiSimulator />
        </div>
      </section>

      {/* 💎 SUSCRIPCIÓN ASIMÉTRICA */}
      <section id="licencia" style={{ padding: '150px 6%' }}>
        <div style={styles.asymmetricGrid}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: '#0066ff', letterSpacing: '2px', marginBottom: '20px' }}>INVERSIÓN DE ÉLITE</div>
            <h2 style={{ fontSize: '48px', fontWeight: 900, lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-2px' }}>No contratas una App. <br/>Activas tu <span style={{color: '#0066ff'}}>Libertad.</span></h2>
            <p style={{ fontSize: '18px', opacity: 0.5, lineHeight: '1.8', marginBottom: '40px' }}>
              Mientras otras clínicas queman su alquiler en citas vacías, tú delegas en una mente suprema por el coste de una sola fianza recuperada. 
              <br /><br />
              <strong>Solo 100€ al mes para convertir tu clínica en un sistema de alta rentabilidad.</strong>
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', color: '#10b981', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(16,185,129,0.1)' }}>
              <ShieldCheck size={16} /> Verificado para Clínicas de Élite
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} style={styles.activationCard}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
               <BadgeEuro size={24} color="#0066ff" />
               <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '2px', opacity: 0.4 }}>FISIOTOOL PRO EDITION</span>
             </div>
             <div style={{ marginBottom: '40px' }}>
               <span style={{ fontSize: '80px', fontWeight: 900 }}>100€</span>
               <span style={{ fontSize: '20px', opacity: 0.3 }}>/mes</span>
             </div>
             <div style={{ textAlign: 'left', maxWidth: '300px', margin: '0 auto 40px' }}>
               <Virtue text="IA Ana 2.5 Flash 24/7" />
               <Virtue text="Escudo Anti No-Show" />
               <Virtue text="Historial Clínico por Voz" />
               <Virtue text="Soberanía de Agenda Total" />
               <Virtue text="Inclusión 100% para Invidentes" />
               <Virtue text="Campañas de Reactivación" />
             </div>
             <button onClick={() => window.location.href='/setup'} style={{ background: '#fff', color: '#000', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%' }}>ACTIVAR MI FERRARI ➜</button>
          </motion.div>
        </div>
      </section>

      {/* ⚙️ FAQ BLOQUE 1: Texto Izq / Grid Der */}
      <section style={{ padding: '150px 6%' }}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={{ textAlign: 'left' }}>
             <small style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '3px' }}>CORE ENGINE</small>
             <h2 style={{ fontSize: '64px', fontWeight: 900, lineHeight: '1', margin: '30px 0', letterSpacing: '-3px' }}>Ingeniería de <br/>Seguridad.</h2>
             <p style={{ fontSize: '18px', opacity: 0.4, lineHeight: '1.7' }}>FisioTool está blindado para proteger tu tiempo y la salud de tus pacientes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <FaqModule icon={<Fingerprint size={18} />} q="Banderas Rojas" a="Triaje inteligente: Ana detecta casos críticos y los deriva a tu teléfono personal." />
             <FaqModule icon={<Smartphone size={18} />} q="Cobros Múltiples" a="Tú eliges: Stripe automático, Bizum o Efectivo para trato directo." />
             <FaqModule icon={<Mic size={18} />} q="Voz a Texto" a="Nuestro motor transcribe informes al terminar la sesión. Adiós al teclado." />
             <FaqModule icon={<ShieldAlert size={18} />} q="Fianzas Soberanas" a="Configura si Ana debe cobrar fianza o permitir reservas gratuitas." />
          </div>
        </div>
      </section>

      {/* ⚙️ FAQ BLOQUE 2: Grid Izq / Texto Der */}
      <section style={{ padding: '150px 6%', background: 'rgba(255,255,255,0.01)' }}>
        <div style={styles.faqAsymmetricGridReverse}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <FaqModule icon={<Database size={18} />} q="Importación CRM" a="Migración instantánea vía CSV. Ana reconocerá a tus pacientes por su nombre." />
             <FaqModule icon={<Zap size={18} />} q="Reactivación" a="Ana analiza quién no ha vuelto y lanza campañas para recuperar pacientes." />
             <FaqModule icon={<Layout size={18} />} q="Multi-Sede" a="Gestiona todas tus clínicas desde un solo panel centralizado." />
          </div>
          <div style={{ textAlign: 'right' }}>
             <small style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '3px' }}>SCALABILITY</small>
             <h2 style={{ fontSize: '64px', fontWeight: 900, lineHeight: '1', margin: '30px 0', letterSpacing: '-3px' }}>Diseñado para <br/>Crecer.</h2>
             <p style={{ fontSize: '18px', opacity: 0.4, lineHeight: '1.7' }}>Ana escala tu negocio mientras tú te centras en el paciente.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto 100px' }}>
          <div style={{textAlign:'left'}}>
            <div style={{fontWeight:900, fontSize:'20px', marginBottom:'15px'}}>FISIOTOOL</div>
            <p style={{fontSize:'14px', opacity:0.4, lineHeight:'1.8'}}>Tecnología de Élite diseñada para el talento, no para la vista.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
             <p style={{ fontSize: '13px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px' }}>LEGAL</p>
             <a href="/rgpd" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px' }}>Privacidad</a>
             <a href="/terminos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px' }}>Términos</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
             <p style={{ fontSize: '13px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px' }}>SOPORTE</p>
             <a href="mailto:ana@fisiotool.com" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px' }}>ana@fisiotool.com</a>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '50px' }}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</div>
      </footer>
    </div>
  );
}