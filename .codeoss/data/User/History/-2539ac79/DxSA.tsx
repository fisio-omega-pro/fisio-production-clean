'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Menu, X
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// --- COMPONENTE: FONDO INTERACTIVO ---
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
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sensor de tamaño de pantalla
  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const faqs = [
    { q: "¿Cómo funcionan las Banderas Rojas?", a: "Ana realiza un triaje inteligente. Si detecta casos especiales (Tráfico, Suelo Pélvico, Bebés), bloquea la cita automática y deriva al paciente a tu teléfono personal." },
    { q: "¿Cómo recibo mis ingresos?", a: "Tú eliges. Puedes activar Stripe para cobros automáticos, Bizum para trato directo o efectivo en clínica." },
    { q: "¿Tengo que cobrar fianza obligatoriamente?", a: "No. FisioTool te da la soberanía total. Puedes activar la fianza o permitir reserva gratuita." },
    { q: "¿Qué es el historial por voz?", a: "Dictas la evolución del paciente al terminar y Ana la transcribe y guarda en el historial clínico al instante." },
    { q: "¿Puedo importar mis pacientes?", a: "Sí. Dispones de un motor de importación masiva CSV para que Ana los reconozca por su nombre." },
    { q: "¿Ana reactiva pacientes antiguos?", a: "Exacto. Ana analiza quién no ha vuelto y lanza campañas de WhatsApp para recuperar ingresos." }
  ];

  return (
    <div style={styles.pageContainer}>
      <InteractiveBackground />
      <div style={styles.glowMagenta} />

      {/* --- NAVBAR RESPONSIVA --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: isMobile ? '25px' : '35px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>

        {/* Menú Desktop */}
        {!isMobile && (
          <div style={styles.navLinks}>
            <a href="#roi" style={styles.linkStyle}>Impacto</a>
            <a href="#licencia" style={styles.linkStyle}>Suscripción</a>
            <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
          </div>
        )}

        {/* Botón Hamburguesa Móvil */}
        {isMobile && (
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff' }}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}
      </nav>

      {/* --- MENÚ MÓVIL OVERLAY --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} style={styles.mobileMenuOverlay}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', paddingTop: '100px' }}>
              <a href="#roi" onClick={() => setIsMenuOpen(false)} style={styles.mobileLink}>Impacto Económico</a>
              <a href="#licencia" onClick={() => setIsMenuOpen(false)} style={styles.mobileLink}>Suscripción Pro</a>
              <button onClick={() => window.location.href='/login'} style={styles.btnMain}>ACCESO ÉLITE</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero, paddingTop: isMobile ? '160px' : '250px' }}>
        <div style={styles.badgeStyle}>SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={{ ...styles.mainTitle, fontSize: isMobile ? '48px' : 'clamp(50px, 12vw, 130px)' }}>
          Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span>
        </h1>
        <p style={{ ...styles.heroDescription, fontSize: isMobile ? '16px' : '22px' }}>Ana blinda tu agenda, elimina tus No-Shows <br /> y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={isMobile ? styles.btnMainMobile : styles.btnMain}>MES GRATIS AHORA ➜</button>
        
        <div id="experiencia" style={{ ...styles.videoBox, height: isMobile ? '200px' : 'auto' }}>
           <Play size={isMobile ? 40 : 80} color="#fff" style={{ opacity: 0.2 }} />
           <div style={styles.videoText}>TESTIMONIO REAL: DR. MURILLO</div>
        </div>
      </motion.header>

      {/* --- IMPACTO ECONÓMICO --- */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={{ ...styles.secTitle, fontSize: isMobile ? '28px' : '48px' }}>Mide tu ahorro anual</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA ASIMÉTRICA (ADAPTADA) --- */}
      <section id="licencia" style={{ ...styles.sectionPadding, padding: isMobile ? '80px 20px' : '150px 6%' }}>
        <div style={{ ...styles.asymmetricGrid, gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', textAlign: isMobile ? 'center' : 'left' }}>
          <div>
            <h2 style={styles.pricingSideTitle}>No es un gasto. <br />Es tu Directora de Op.</h2>
            <p style={styles.pricingSideDesc}>Ana se amortiza con la primera fianza recuperada.</p>
            <div style={{ ...styles.priceTag, fontSize: isMobile ? '60px' : '80px' }}>100€<small style={{fontSize: '20px', opacity: 0.3}}>/mes</small></div>
          </div>
          <div style={{ ...styles.activationCard, marginTop: isMobile ? '40px' : '0' }}>
             <Virtue text="IA Ana 2.5 Flash" />
             <Virtue text="Escudo Anti No-Show" />
             <Virtue text="Historial por Voz" />
             <Virtue text="Acceso Invidentes" />
             <button onClick={() => window.location.href='/setup'} style={styles.btnActivate}>ACTIVAR MI SOBERANÍA ➜</button>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section style={styles.sectionPadding}>
        <div style={{maxWidth:'850px', margin:'0 auto'}}>
          <h2 style={{ ...styles.secTitle, fontSize: isMobile ? '28px' : '48px' }}>Dudas Estratégicas</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            {faqs.map((f, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={styles.faqCardMini}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                  <span style={{fontWeight:700, fontSize: isMobile ? '14px' : '17px', textAlign: 'left'}}>{f.q}</span>
                  <ChevronDown size={16} />
                </div>
                {openFaq === i && <p style={styles.faqAnswerMini}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={{ ...styles.footerGrid, gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr' }}>
          <div style={{textAlign: isMobile ? 'center' : 'left'}}>
            <span style={styles.logoTextStyle}>FISIOTOOL</span>
            <p style={{fontSize:'14px', opacity:0.4, marginTop:'20px'}}>Diseñado para el talento, no para la vista. 2026.</p>
          </div>
          {!isMobile && (
            <>
              <div style={styles.footerLinksGroup}>
                <p style={styles.footerTitle}>LEGAL</p>
                <a href="/rgpd" style={styles.fLink}>Privacidad</a>
                <a href="/terminos" style={styles.fLink}>Términos</a>
              </div>
              <div style={styles.footerLinksGroup}>
                <p style={styles.footerTitle}>SOPORTE</p>
                <p style={{ ...styles.fLink, color: '#25D366', fontWeight: 800 }}>+34 615 200 612</p>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

// --- AUXILIARES ---
function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

// --- ESTILOS ---
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 3000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px' } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '18px', letterSpacing: '-1.5px' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  mobileMenuOverlay: { position: 'fixed', inset: 0, background: '#020305', zIndex: 2500, padding: '40px' } as React.CSSProperties,
  mobileLink: { fontSize: '24px', fontWeight: 900, color: '#fff', textDecoration: 'none' } as React.CSSProperties,
  heroSection: { paddingBottom: '100px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badgeStyle: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '20px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  btnMainMobile: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: 900, fontSize: '16px', width: '100%' } as React.CSSProperties,
  videoBox: { maxWidth: '1000px', margin: '60px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '30px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoText: { position: 'absolute', bottom: '20px', fontWeight: 900, letterSpacing: '2px', fontSize: '10px', opacity: 0.3 } as React.CSSProperties,
  roiBg: { padding: '100px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '60px', margin: '0 4%' } as React.CSSProperties,
  secTitle: { fontWeight: 900, textAlign: 'center', marginBottom: '60px' } as React.CSSProperties,
  sectionPadding: { padding: '100px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gap: '60px', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '48px', fontWeight: 900, lineHeight: '1.1', marginBottom: '30px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '18px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  priceTag: { fontWeight: 900, color: '#0066ff' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '40px', textAlign: 'left' } as React.CSSProperties,
  btnActivate: { background: '#fff', color: '#000', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '20px' } as React.CSSProperties,
  faqCardMini: { background: 'rgba(255,255,255,0.015)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  faqAnswerMini: { marginTop: '15px', fontSize: '14px', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' } as React.CSSProperties,
  footer: { padding: '80px 8% 40px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  footerGrid: { display: 'grid', gap: '60px', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  footerLinksGroup: { display: 'flex', flexDirection: 'column', gap: '15px' } as React.CSSProperties,
  footerTitle: { fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px' } as React.CSSProperties,
  fLink: { color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' } as React.CSSProperties,
  glowMagenta: { position: 'absolute', bottom: '20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,0,150,0.05) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
};