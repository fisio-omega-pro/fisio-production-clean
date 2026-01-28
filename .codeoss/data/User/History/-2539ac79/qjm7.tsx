'use client'

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importación vital
import { 
  Play, Sparkles, ShieldCheck, 
  TrendingUp, Zap, 
  AlertCircle, CheckCircle2, Mic, 
  Fingerprint, Database, Lock, Server, MessageCircle
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS SUPREME (CORREGIDA)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 2000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '35px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,102,255,0.3)', color: '#0066ff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { 
    paddingTop: '220px', 
    paddingBottom: '100px', 
    textAlign: 'center', 
    paddingLeft: '20px', // Corregido px
    paddingRight: '20px', // Corregido px
    position: 'relative', 
    zIndex: 1 
  } as React.CSSProperties,
  badgeStyle: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 120px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  btnGhost: { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: 'none', marginTop: '40px', fontWeight: 800, fontSize: '12px', cursor: 'pointer', letterSpacing: '2px' } as React.CSSProperties, // Añadido btnGhost
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '100px', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'left', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '60px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  painCard: { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  faqAsymmetricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' } as React.CSSProperties,
  technicalBox: { width: '100%', height: '450px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
};

// --- COMPONENTES AUXILIARES CON INTERFACES ---
interface CardProps { icon: React.ReactNode; title: string; text: string; }
function PainCard({icon, title, text}: CardProps) {
  return (
    <div style={styles.painCard}>
      <div style={{ width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <h4 style={{fontSize: '22px', fontWeight: 800, margin: '15px 0'}}>{title}</h4>
      <p style={{fontSize: '15px', opacity: 0.5, lineHeight: '1.6'}}>{text}</p>
    </div>
  );
}

function Virtue({text}: {text: string}) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={18} color="#10b981" /> {text}
    </div>
  );
}

function FaqCard({ q, a }: { q: string, a: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.015)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '15px', color: '#0066ff' }}>{q}</h4>
      <p style={{ fontSize: '15px', opacity: 0.4, lineHeight: '1.7' }}>{a}</p>
    </div>
  );
}

export default function Page() {
  const router = useRouter(); // Hook para navegación pro
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%)`, backgroundColor: '#020305' }} />

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <Link href="#experiencia" style={styles.linkStyle}>Resultados</Link>
          <Link href="#roi" style={styles.linkStyle}>Impacto</Link>
          <Link href="#licencia" style={styles.linkStyle}>Licencia</Link>
          <button onClick={() => router.push('/login')} style={styles.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => router.push('/setup')} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
        
        <div id="experiencia" style={styles.videoBox}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={{ marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 }}>TESTIMONIO REAL: DR. MURILLO</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="Clínica" />
        </div>
        <button style={styles.btnGhost} onClick={() => window.scrollTo({top: 1500, behavior: 'smooth'})}>DESCRUBRE EL MOTOR INTERNO ↓</button>
      </motion.header>

      {/* --- LOS 3 DOLORES --- */}
      <section id="ventajas" style={styles.sectionPadding}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' }}>
          <PainCard icon={<AlertCircle color="#ef4444" />} title="Fin de las pérdidas" text="Cada no-show es dinero quemado. Ana exige fianza automática para blindar tu agenda." />
          <PainCard icon={<Mic color="#0066ff" />} title="Manos libres" text="Dicta tus informes por voz tras la sesión. Elimina el agotamiento de teclear tras 8 horas." />
          <PainCard icon={<TrendingUp color="#10b981" />} title="Recuperación activa" text="Ana contacta a pacientes antiguos para reactivar su bienestar de forma automática." />
        </div>
      </section>

      {/* --- IMPACTO ECONÓMICO --- */}
      <section id="roi" style={{ padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' }}>¿Cuánto dinero te está robando tu agenda?</h2>
        <RoiSimulator />
      </section>

      {/* --- CTA FINAL --- */}
      <section style={{ padding: '150px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 50px', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,102,255,0.02) 100%)', borderRadius: '80px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, marginBottom: '40px' }}>¿Listo para el cambio?</h2>
          <button onClick={() => router.push('/setup')} style={{ ...styles.btnMain, padding: '25px 80px', fontSize: '22px' }}>ACTIVAR MI MES GRATUITO ➜</button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '80px', maxWidth: '1400px', margin: '0 auto' }}>
          <div>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={{fontSize:'14px', opacity:0.3, marginTop:'20px', lineHeight:'1.8'}}>El motor definitivo para el fisioterapeuta del siglo XXI. Diseñado para el talento.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'10px'}}>LEGAL</p>
             <Link href="/condiciones" style={{color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:'14px'}}>Condiciones</Link>
             <Link href="/privacidad" style={{color:'rgba(255,255,255,0.4)', textDecoration:'none', fontSize:'14px'}}>Privacidad</Link>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '12px', opacity: 0.2, fontWeight: 800, letterSpacing: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '50px', marginTop: '50px' }}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
}