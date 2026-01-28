'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Smartphone, Activity, 
  ShieldAlert, Lock, FileText, Server, AlertTriangle
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS SUPREME (V13)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 2000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '18px', letterSpacing: '-1px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '25px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,102,255,0.3)', color: '#0066ff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '220px', paddingBottom: '100px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badgeStyle: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(44px, 9vw, 110px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '18px', color: 'rgba(255,255,255,0.4)', maxWidth: '750px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoOverlay: { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoText: { marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 } as React.CSSProperties,
  videoPlaceholderImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 } as React.CSSProperties,
  btnGhost: { background: 'none', border: 'none', color: '#0066ff', fontWeight: 900, fontSize: '14px', marginTop: '40px', cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  gridDolores: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
  painCard: { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  iconBoxStyle: { width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '100px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  pricingTextSide: { textAlign: 'left' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '56px', fontWeight: 900, lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '18px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  priceTag: { fontSize: '80px', fontWeight: 900, color: '#0066ff' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'left', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  btnActivate: { background: '#0066ff', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '30px', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' } as React.CSSProperties,
  faqAsymmetricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' } as React.CSSProperties,
  faqTextSide: { textAlign: 'left', position: 'relative' } as React.CSSProperties,
  faqVisualSide: { display: 'flex', justifyContent: 'center' } as React.CSSProperties,
  technicalBox: { width: '100%', height: '450px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  underTheHood: { fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '20px', display: 'block' } as React.CSSProperties,
  faqMainTitle: { fontSize: '56px', fontWeight: 900, lineHeight: '1', marginBottom: '40px', letterSpacing: '-2px' } as React.CSSProperties,
  faqCardFixed: { background: 'rgba(255,255,255,0.015)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' } as React.CSSProperties,
  dotsDecoration: { position: 'absolute', top: '-40px', left: '-40px', width: '80px', height: '80px', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' } as React.CSSProperties,
  finalCtaSection: { padding: '150px 20px', textAlign: 'center' } as React.CSSProperties,
  finalCtaCard: { maxWidth: '1000px', margin: '0 auto', padding: '100px 50px', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,102,255,0.02) 100%)', borderRadius: '80px', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '100px', maxWidth: '1400px', margin: '0 auto 100px' } as React.CSSProperties,
  footerLinksGroup: { display: 'flex', flexDirection: 'column', gap: '18px' } as React.CSSProperties,
  footerTitle: { fontSize: '13px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '25px' } as React.CSSProperties,
  fLink: { color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px', transition: '0.3s' } as React.CSSProperties,
  copyrightText: { textAlign: 'center', fontSize: '12px', opacity: 0.2, fontWeight: 800, letterSpacing: '5px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '60px', textTransform: 'uppercase' } as React.CSSProperties,
  glowMagenta: { position: 'absolute', bottom: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,0,150,0.08) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
  lineDecoration: { width: '60%', height: '1px', background: 'linear-gradient(90deg, #0066ff, transparent)', marginTop: '40px' } as React.CSSProperties,
  lineDecorationShort: { width: '40%', height: '1px', background: 'linear-gradient(90deg, #10b981, transparent)', marginTop: '40px' } as React.CSSProperties,
};

// --- COMPONENTES AUXILIARES ---
function PainCard({icon, title, text}: any) {
  return (
    <div style={styles.painCard}>
      <div style={styles.iconBoxStyle}>{icon}</div>
      <h4 style={{fontSize: '22px', fontWeight: 800, margin: '15px 0'}}>{title}</h4>
      <p style={{fontSize: '15px', opacity: 0.5, lineHeight: '1.6'}}>{text}</p>
    </div>
  );
}

function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={18} color="#10b981" /> {text}
    </div>
  );
}

function FaqBlock({ q, a }: { q: string, a: string }) {
  return (
    <div style={styles.faqCardFixed}>
      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '15px', color: '#fff' }}>{q}</h4>
      <p style={{ fontSize: '15px', opacity: 0.4, lineHeight: '1.7' }}>{a}</p>
    </div>
  );
}

// --- FONDO INTERACTIVO ---
function InteractiveBackground() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%)`, backgroundColor: '#020305' }} />
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL (EXPORT DEFAULT)
// ==========================================
export default function Page() {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div style={styles.pageContainer}>
      <InteractiveBackground />
      <div style={styles.glowMagenta} />

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <a href="#experiencia" style={styles.linkStyle}>Resultados</a>
          <a href="#roi" style={styles.linkStyle}>Impacto</a>
          <a href="#licencia" style={styles.linkStyle}>Licencia</a>
          <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
        
        {/* VIDEO BOX CENTRAL */}
        <div id="experiencia" style={styles.videoBox}>
           <div style={styles.videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={styles.videoText}>TESTIMONIO REAL: DR. MURILLO</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={styles.videoPlaceholderImg} alt="Clínica" />
        </div>
        <button style={styles.btnGhost}>VER MÁS TESTIMONIOS</button>
      </motion.header>

      {/* --- SEGURIDAD MÉDICA --- */}
      <section style={{...styles.sectionPadding, textAlign:'center'}}>
        <div style={{display:'inline-flex', gap:'40px', background:'rgba(255,255,255,0.02)', padding:'25px 50px', borderRadius:'100px', border:'1px solid rgba(255,255,255,0.05)'}}>
           <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', fontWeight:700, opacity:0.6}}><ShieldCheck color="#0066ff" size={18}/> CIFRADO AES-256</div>
           <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', fontWeight:700, opacity:0.6}}><Lock color="#0066ff" size={18}/> DPA SALUD UE</div>
           <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', fontWeight:700, opacity:0.6}}><Server color="#0066ff" size={18}/> REGIÓN BÉLGICA</div>
        </div>
      </section>

      {/* --- DOLORES --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.gridDolores}>
          <PainCard icon={<AlertCircle color="#ef4444" />} title="Fin de las pérdidas" text="Cada no-show es dinero quemado. Ana exige fianza automática para blindar tu agenda." />
          <PainCard icon={<Mic color="#0066ff" />} title="Manos libres" text="Dicta tus informes por voz tras la sesión. Elimina el agotamiento de teclear tras 8 horas." />
          <PainCard icon={<TrendingUp color="#10b981" />} title="Recuperación activa" text="Ana contacta a pacientes antiguos para reactivar su bienestar de forma automática." />
        </div>
      </section>

      {/* --- ROI --- */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>¿Cuánto dinero te está robando tu agenda?</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA ASIMÉTRICA --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.pricingTextSide}>
            <small style={styles.underTheHood}>INVERSIÓN ESTRATÉGICA</small>
            <h2 style={styles.pricingSideTitle}>No es un gasto. <br />Es tu nueva <span style={{color:'#0066ff'}}>Directora de Op.</span></h2>
            <p style={styles.pricingSideDesc}>Mientras otros queman miles de euros en gestión ineficiente, tú activas una mente suprema por el valor de una sola fianza recuperada.</p>
            <div style={styles.priceTag}>100€<small style={{fontSize:'24px', opacity:0.3, color:'#fff'}}>/mes</small></div>
          </div>
          <div style={styles.activationCard}>
             <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
               <Virtue text="IA Ana 2.5 Flash 24/7" />
               <Virtue text="Blindaje Total Anti No-Show" />
               <Virtue text="Historial Clínico por Voz" />
               <Virtue text="Multi-Sede y Gestión Global" />
               <Virtue text="Inclusión 100% para Invidentes" />
               <Virtue text="Campañas de Reactivación" />
             </div>
             <button onClick={() => window.location.href='/setup'} style={styles.btnActivate}>ACTIVAR MI LICENCIA PRO ➜</button>
          </div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 1: TEXTO IZQUIERDA --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqTextSide}>
             <div style={styles.dotsDecoration} />
             <small style={styles.underTheHood}>INGENIERÍA</small>
             <h2 style={styles.faqMainTitle}>Confianza <br />blindada.</h2>
             <FaqBlock q="¿Cómo funcionan las Banderas Rojas?" a="Ana realiza un triaje clínico inteligente. Casos de tráfico, suelo pélvico o bebés bloquean la cita automática y derivan a tu teléfono personal." />
             <FaqBlock q="¿Cómo recibo mis ingresos?" a="Soberanía total: Stripe para automatización, Bizum o Efectivo. Tú eliges cómo y cuándo cobrar." />
             <FaqBlock q="¿Tengo que cobrar fianza?" a="FisioTool te da libertad absoluta. Puedes activar el blindaje anti no-show o permitir la reserva gratuita." />
             <FaqBlock q="¿Qué es el historial por voz?" a="Ahorro de 1h/día. Dictas la evolución al terminar y Ana la transcribe y guarda en la ficha médica al instante." />
          </div>
          <div style={styles.faqVisualSide}>
             <div style={styles.technicalBox}>
                <Fingerprint size={80} color="#0066ff" opacity={0.4} />
                <div style={styles.lineDecoration} />
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'20px'}}>SECURE_HEALTH_PROTOCOL_v2.5</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 2: TEXTO DERECHA --- */}
      <section style={{...styles.sectionPadding, background:'rgba(255,255,255,0.01)'}}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqVisualSide}>
             <div style={styles.technicalBox}>
                <Database size={80} color="#10b981" opacity={0.4} />
                <div style={styles.lineDecorationShort} />
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'20px'}}>GLOBAL_SYNC_ENGINE</p>
             </div>
          </div>
          <div style={styles.faqTextSide}>
             <small style={{...styles.underTheHood, color:'#10b981'}}>CRECIMIENTO</small>
             <h2 style={styles.faqMainTitle}>Soberanía <br />de datos.</h2>
             <FaqBlock q="¿Puedo importar mis pacientes?" a="Motor masivo CSV incluido. Ana reconocerá a tus pacientes habituales por su nombre desde el primer saludo." />
             <FaqBlock q="¿Ana reactiva antiguos pacientes?" a="Comercial incansable. Ana detecta la inactividad y lanza campañas de WhatsApp para recuperar tus ingresos." />
             <FaqBlock q="¿Soporta varias clínicas?" a="Sistema multi-sede nativo. Gestiona todos tus centros y equipos desde un solo panel centralizado." />
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section style={styles.finalCtaSection}>
        <div style={styles.finalCtaCard}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, marginBottom: '20px' }}>¿Listo para el cambio?</h2>
          <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>ACTIVAR MI MES GRATUITO ➜</button>
          <p style={{fontSize:'12px', fontWeight:700, color:'#10b981', marginTop:'25px'}}>SIN PERMANENCIA • CONFIGURACIÓN EN 4 MINUTOS</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={{textAlign:'left'}}>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={{fontSize:'14px', opacity:0.3, marginTop:'20px', lineHeight:'1.8'}}>El motor definitivo para el fisioterapeuta del siglo XXI. Diseñado para el talento, no para la vista.</p>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>SERVICIOS</p>
             <Link href="/devolucion" style={styles.fLink}>Devolución</Link>
             <Link href="/garantia" style={styles.fLink}>Garantía</Link>
             <Link href="/pagos" style={styles.fLink}>Formas de Pago</Link>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>LEGAL</p>
             <Link href="/rgpd" style={styles.fLink}>Privacidad RGPD</Link>
             <Link href="/terminos" style={styles.fLink}>Términos de Servicio</Link>
             <Link href="/cookies" style={styles.fLink}>Política de Cookies</Link>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>CONTACTO</p>
             <p style={{fontSize:'14px'}}>ana@fisiotool.com</p>
             <p style={{color:'#25D366', fontWeight:800, fontSize:'14px', display:'flex', alignItems:'center', gap:'8px'}}><MessageCircle size={14}/> +34 615 200 612</p>
          </div>
        </div>
        <p style={styles.copyrightText}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
}