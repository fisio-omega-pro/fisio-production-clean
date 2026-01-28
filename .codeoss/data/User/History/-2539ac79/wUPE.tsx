'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle, Info,
  Fingerprint, Database, Cpu, Activity, Smartphone
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// --- FONDO INTERACTIVO SEDA DIGITAL ---
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

// --- COMPONENTE PRINCIPAL ---
export default function Page() {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div style={pageContainer}>
      <InteractiveBackground />
      <div style={glowMagenta} />

      {/* --- NAVBAR SUPREME --- */}
      <nav style={navbarStyle}>
        <div style={logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px', filter: 'drop-shadow(0 0 10px rgba(0,102,255,0.5))' }} />
          <span style={logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={navLinks}>
          <a href="#roi" style={linkStyle}>Impacto</a>
          <a href="#licencia" style={linkStyle}>Licencia</a>
          <a href="#ingenieria" style={linkStyle}>Ingeniería</a>
          <button onClick={() => window.location.href='/login'} style={loginBtn}>ACCESO PROFESIONAL</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.header style={{ ...heroSection, opacity: opacityHero }}>
        <div style={badgeStyle}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={mainTitle}>Tu talento merece <br /><span style={gradientText}>un Ferrari.</span></h1>
        <p style={heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={btnMain}>EMPEZAR MI REVOLUCIÓN GRATIS ➜</button>
        <div style={videoBox}>
           <Play size={100} color="#fff" style={{ opacity: 0.1 }} />
           <div style={videoText}>TESTIMONIO REAL: DR. MURILLO</div>
        </div>
      </motion.header>

      {/* --- IMPACTO ECONÓMICO (ROI) --- */}
      <section id="roi" style={roiBg}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <h2 style={secTitle}>¿Cuánto dinero te está robando tu agenda?</h2>
          <RoiSimulator />
        </div>
      </section>

      {/* --- 💎 SECCIÓN SUSCRIPCIÓN SUPREME (ESTILO ASIMÉTRICO) --- */}
      <section id="licencia" style={sectionPadding}>
        <div style={asymmetricGrid}>
          {/* Lado Izquierdo: El Texto Manipulador */}
          <div style={pricingTextSide}>
            <div style={miniBadge}>ESTÁNDARES DE ÉLITE</div>
            <h2 style={pricingSideTitle}>No es un gasto. Es tu nueva <span style={{color: '#0066ff'}}>Directora de Operaciones.</span></h2>
            <p style={pricingSideDesc}>
              Mientras otras clínicas queman miles de euros en administración ineficiente y huecos vacíos, tú activas una mente suprema por el coste de una sola fianza recuperada al mes. 
              <br /><br />
              <strong>FisioTool Pro no se paga; se amortiza solo.</strong>
            </p>
            <div style={stampBadge}><ShieldCheck size={16} /> Certificado de Seguridad Grado Salud</div>
          </div>

          {/* Lado Derecho: La Tarjeta de Activación */}
          <motion.div whileHover={{ scale: 1.02 }} style={activationCard}>
             <div style={cardHeader}>
               <BadgeEuro size={24} color="#0066ff" />
               <span style={cardLabel}>LICENSE PRO EDITION</span>
             </div>
             <div style={priceContainer}>
               <span style={priceValue}>100€</span>
               <span style={pricePeriod}>/mes</span>
             </div>
             <div style={virtueList}>
               <Virtue text="IA Ana 2.5 Flash (Voz y Chat)" />
               <Virtue text="Blindaje Total Anti No-Show" />
               <Virtue text="Historial Clínico por Voz" />
               <Virtue text="Multi-Sede y Gestión Global" />
               <Virtue text="Inclusión 100% para Invidentes" />
               <Virtue text="Campañas de Reactivación" />
             </div>
             <button onClick={() => window.location.href='/setup'} style={btnActivate}>ACTIVAR MI FERRARI ➜</button>
             <p style={cardFooter}>Sin permanencia. Sin letra pequeña.</p>
          </motion.div>
        </div>
      </section>

      {/* --- ⚙️ SECCIÓN FAQ: INGENIERÍA DE DUDAS (ESTILO LINEAR) --- */}
      <section id="ingenieria" style={faqSection}>
        <div style={faqAsymmetricGrid}>
          {/* Lado A: Titular masivo */}
          <div style={faqHeaderSide}>
             <div style={dotsGrid} />
             <small style={underTheHood}>UNDER THE HOOD</small>
             <h2 style={faqMainTitle}>Construido sobre <br />fundamentos <br />sólidos.</h2>
             <p style={faqMainDesc}>FisioTool es tan simple de usar que es fácil pasar por alto la complejidad técnica que mantiene tu clínica blindada, segura y veloz.</p>
          </div>

          {/* Lado B: Bento Grid de Respuestas */}
          <div style={faqBentoGrid}>
             <FaqModule 
                icon={<Fingerprint size={18} />} 
                q="Triaje de Alerta (Red Flags)" 
                a="Ana analiza cada síntoma. Si detecta casos críticos como tráfico o pediatría, detiene el bot y deriva a tu teléfono personal." 
             />
             <FaqModule 
                icon={<Smartphone size={18} />} 
                q="Soberanía de Cobro" 
                a="Tú eliges el carril: Stripe automático para el 100% de eficiencia o Bizum/Efectivo para trato directo." 
             />
             <FaqModule 
                icon={<Mic size={18} />} 
                q="Engine: Voz a Texto" 
                a="Nuestro motor transcribe tus informes al terminar la sesión. Adiós al teclado tras 8 horas de pie." 
             />
             <FaqModule 
                icon={<Database size={18} />} 
                q="Importación Masiva" 
                a="Migración instantánea de tus pacientes antiguos vía CSV. Ana los reconocerá por su nombre al instante." 
             />
             <FaqModule 
                icon={<Zap size={18} />} 
                q="Reactivación Activa" 
                a="Ana analiza quién no ha vuelto y lanza campañas de WhatsApp para recuperar el vínculo con tus antiguos clientes." 
             />
             <FaqModule 
                icon={<Cpu size={18} />} 
                q="Inteligencia Conductual" 
                a="Diseñada para detectar sesgos y miedos del paciente, optimizando la tasa de conversión en cada reserva." 
             />
          </div>
        </div>
      </section>

      {/* --- FOOTER MONUMENTAL 2026 --- */}
      <footer style={footerStyle}>
        <div style={footerGrid}>
          <div style={{textAlign:'left'}}>
            <div style={logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={footerDesc}>Tecnología de Élite diseñada para el talento, no para la vista. El motor definitivo para tu éxito clínico.</p>
          </div>
          <div style={footerLinksGroup}>
             <p style={footerTitle}>LEGAL</p>
             <a href="/rgpd" style={fLink}>Privacidad RGPD</a>
             <a href="/terminos" style={fLink}>Términos de Servicio</a>
          </div>
          <div style={footerLinksGroup}>
             <p style={footerTitle}>SOPORTE</p>
             <a href="mailto:ana@fisiotool.com" style={fLink}>ana@fisiotool.com</a>
             <p style={{ ...fLink, color: '#25D366', fontWeight: 800 }}>+34 615 200 612</p>
          </div>
        </div>
        <div style={copyrightText}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</div>
      </footer>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---
function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '12px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

function FaqModule({icon, q, a}: any) {
  return (
    <div style={faqModuleCard}>
      <div style={faqModuleIcon}>{icon}</div>
      <h4 style={faqModuleQ}>{q}</h4>
      <p style={faqModuleA}>{a}</p>
    </div>
  );
}

// --- ESTILOS DE INGENIERÍA (SUPREME) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' };
const navbarStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' };
const logoWrapper: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px' };
const logoTextStyle: React.CSSProperties = { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' };
const navLinks: React.CSSProperties = { display: 'flex', gap: '35px', alignItems: 'center' };
const linkStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' };
const loginBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' };
const heroSection: React.CSSProperties = { paddingTop: '250px', paddingBottom: '150px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 };
const badgeStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' };
const mainTitle: React.CSSProperties = { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' };
const gradientText: React.CSSProperties = { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroDescription: React.CSSProperties = { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' };
const btnMain: React.CSSProperties = { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' };
const videoBox: React.CSSProperties = { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const videoText: React.CSSProperties = { position: 'absolute', bottom: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '12px', opacity: 0.3 };
const sectionPadding: React.CSSProperties = { padding: '150px 6%' };
const secTitle: React.CSSProperties = { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' };
const roiBg: React.CSSProperties = { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' };

// --- ESTILOS ASIMÉTRICOS (LINEAR STYLE) ---
const asymmetricGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' };
const pricingTextSide: React.CSSProperties = { textAlign: 'left' };
const miniBadge: React.CSSProperties = { fontSize: '10px', fontWeight: 900, color: '#0066ff', letterSpacing: '2px', marginBottom: '20px' };
const pricingSideTitle: React.CSSProperties = { fontSize: '48px', fontWeight: 900, lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-2px' };
const pricingSideDesc: React.CSSProperties = { fontSize: '18px', opacity: 0.5, lineHeight: '1.8', marginBottom: '40px' };
const stampBadge: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', color: '#10b981', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(16,185,129,0.1)' };

const activationCard: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'center', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' };
const cardHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' };
const cardLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 900, letterSpacing: '2px', opacity: 0.4 };
const priceContainer: React.CSSProperties = { marginBottom: '40px' };
const priceValue: React.CSSProperties = { fontSize: '80px', fontWeight: 900, color: '#fff' };
const pricePeriod: React.CSSProperties = { fontSize: '20px', opacity: 0.3, marginLeft: '5px' };
const virtueList: React.CSSProperties = { textAlign: 'left', maxWidth: '300px', margin: '0 auto 40px' };
const btnActivate: React.CSSProperties = { background: '#fff', color: '#000', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' };
const cardFooter: React.CSSProperties = { fontSize: '12px', opacity: 0.3, marginTop: '20px', fontWeight: 600 };

// --- ESTILOS FAQ (BENTO LINEAR) ---
const faqSection: React.CSSProperties = { padding: '150px 6%', background: 'linear-gradient(to bottom, #020305, #010204)' };
const faqAsymmetricGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '100px', maxWidth: '1400px', margin: '0 auto' };
const faqHeaderSide: React.CSSProperties = { textAlign: 'left', position: 'relative' };
const underTheHood: React.CSSProperties = { fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '3px' };
const faqMainTitle: React.CSSProperties = { fontSize: '64px', fontWeight: 900, lineHeight: '1', margin: '30px 0', letterSpacing: '-3px' };
const faqMainDesc: React.CSSProperties = { fontSize: '18px', opacity: 0.4, lineHeight: '1.7' };
const dotsGrid: React.CSSProperties = { position: 'absolute', top: -40, left: -40, width: '100px', height: '100px', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px', opacity: 0.5 };

const faqBentoGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const faqModuleCard: React.CSSProperties = { background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'left' };
const faqModuleIcon: React.CSSProperties = { color: '#0066ff', marginBottom: '20px' };
const faqModuleQ: React.CSSProperties = { fontSize: '16px', fontWeight: 800, marginBottom: '10px', color: '#fff' };
const faqModuleA: React.CSSProperties = { fontSize: '14px', opacity: 0.4, lineHeight: '1.6' };

// --- FOOTER ---
const footerStyle: React.CSSProperties = { padding: '120px 8% 60px', background: '#000', borderTop: '1px solid rgba(255,255,255,0.05)' };
const footerGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto 100px' };
const footerDesc: React.CSSProperties = { fontSize: '14px', opacity: 0.3, marginTop: '20px', lineHeight: '1.8', maxWidth: '300px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '18px' };
const footerTitle: React.CSSProperties = { fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '20px' };
const fLink: React.CSSProperties = { color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' };
const copyrightText: React.CSSProperties = { textAlign: 'center', fontSize: '11px', opacity: 0.1, fontWeight: 800, letterSpacing: '5px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '60px' };
const glowMagenta: React.CSSProperties = { position: 'absolute', bottom: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,0,255,0.03) 0%, transparent 70%)', zIndex: 0 };