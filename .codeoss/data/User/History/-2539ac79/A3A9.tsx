'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Smartphone, Activity, ShieldAlert
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// --- FONDO INTERACTIVO (SEDA DIGITAL) ---
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const faqs = [
    { q: "¿Cómo funcionan las Banderas Rojas?", a: "Ana realiza un triaje inteligente. Si detecta casos especiales (Tráfico, Suelo Pélvico, Bebés), bloquea la cita automática y deriva al paciente a tu teléfono personal para una valoración manual." },
    { q: "¿Cómo recibo mis ingresos?", a: "Tú eliges. Puedes activar Stripe para cobros automáticos, Bizum para trato directo o efectivo en clínica. Ana adaptará su discurso según tu preferencia." },
    { q: "¿Tengo que cobrar fianza obligatoriamente?", a: "No. FisioTool te da la soberanía total. Puedes activar la fianza para eliminar el No-Show o permitir reserva gratuita si confías en el paciente." },
    { q: "¿Qué es el historial por voz?", a: "Es el fin del teclado. Al terminar la sesión, dictas la evolución del paciente a la App y Ana la transcribe y guarda en el historial clínico al instante." },
    { q: "¿Puedo importar mis pacientes actuales?", a: "Sí. Dispones de un motor de importación masiva. Sube tu CSV y Ana reconocerá a todos tus clientes por su nombre en cuanto la saluden." },
    { q: "¿Ana reactiva pacientes antiguos?", a: "Exacto. Ana analiza quién no ha vuelto en meses y lanza campañas automáticas de reactivación por WhatsApp para recuperar esos ingresos." },
    { q: "¿Soporta varias clínicas?", a: "Diseñado para crecer. Puedes gestionar múltiples sedes desde un solo panel de mando, permitiendo que el paciente elija su centro preferido." }
  ];

  return (
    <div style={styles.pageContainer}>
      <InteractiveBackground />
      <div style={styles.glowMagenta} />

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '35px', filter: 'drop-shadow(0 0 10px rgba(0,102,255,0.5))' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <a href="#experiencia" style={styles.linkStyle}>Experiencia</a>
          <a href="#roi" style={styles.linkStyle}>Impacto</a>
          <a href="#licencia" style={styles.linkStyle}>Suscripción</a>
          <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero, scale: scaleHero }}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>EMPEZAR MI REVOLUCIÓN GRATIS ➜</button>
        
        {/* VIDEO BOX */}
        <div id="experiencia" style={styles.videoBox}>
           <div style={styles.videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={styles.videoText}>TESTIMONIO REAL: DR. MURILLO</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={styles.videoPlaceholderImg} alt="Clínica" />
        </div>
        <button style={styles.btnGhost}>VER MÁS TESTIMONIOS</button>
      </motion.header>

      {/* --- LOS 5 DOLORES --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.gridDolores}>
          <PainCard icon={<AlertCircle color="#ef4444" />} title="Fin de las pérdidas" text="Cada no-show es dinero quemado. Ana exige fianza automática para que tu tiempo sea respetado." />
          <PainCard icon={<Mic color="#0066ff" />} title="Manos libres" text="Dicta tus informes clínicos por voz. Elimina el agotamiento de teclear tras 8 horas de pie." />
          <PainCard icon={<TrendingUp color="#10b981" />} title="Recuperación activa" text="No dejes que tus pacientes te olviden. Ana contacta a antiguos clientes para reactivar su bienestar." />
        </div>
      </section>

      {/* --- IMPACTO ECONÓMICO (ROI) --- */}
      <section id="roi" style={styles.roiBg}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <h2 style={styles.secTitle}>Mide el ahorro de tu nueva oficina virtual</h2>
          <RoiSimulator />
        </div>
      </section>

      {/* --- SUSCRIPCIÓN ASIMÉTRICA --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.pricingTextSide}>
            <div style={styles.miniBadge}>ESTÁNDARES DE ÉLITE</div>
            <h2 style={styles.pricingSideTitle}>No es un gasto. Es tu nueva <span style={{color: '#0066ff'}}>Directora de Operaciones.</span></h2>
            <p style={styles.pricingSideDesc}>
              Mientras otras clínicas queman miles de euros en administración ineficiente, tú activas una mente suprema por el coste de una sola fianza recuperada al mes. 
              <br /><br />
              <strong>FisioTool Pro se amortiza solo.</strong>
            </p>
            <div style={styles.stampBadge}><ShieldCheck size={16} /> Certificado de Seguridad Grado Salud</div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} style={styles.activationCard}>
             <div style={styles.cardHeader}>
               <BadgeEuro size={24} color="#0066ff" />
               <span style={styles.cardLabel}>LICENSE PRO EDITION</span>
             </div>
             <div style={styles.priceContainer}>
               <span style={styles.priceValue}>100€</span>
               <span style={styles.pricePeriod}>/mes</span>
             </div>
             <div style={styles.virtueList}>
               <Virtue text="IA Ana 2.5 Flash (Voz y Chat)" />
               <Virtue text="Blindaje Total Anti No-Show" />
               <Virtue text="Historial Clínico por Voz" />
               <Virtue text="Multi-Sede y Gestión Global" />
               <Virtue text="Inclusión 100% para Invidentes" />
               <Virtue text="Campañas de Reactivación" />
             </div>
             <button onClick={() => window.location.href='/setup'} style={styles.btnActivate}>ACTIVAR MI FERRARI ➜</button>
          </motion.div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 1: TEXTO IZQUIERDA, VISUAL DERECHA --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqTextSide}>
             <div style={styles.dotsDecoration} />
             <small style={styles.underTheHood}>DUDAS TÉCNICAS</small>
             <h2 style={styles.faqMainTitle}>Ingeniería de <br />confianza.</h2>
             <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
               {faqs.slice(0, 4).map((f, i) => (
                 <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={styles.faqCardMini}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                     <span style={{fontWeight:700, fontSize: '15px'}}>{f.q}</span>
                     <ChevronDown size={16} style={{transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition:'0.3s'}} />
                   </div>
                   {openFaq === i && <p style={styles.faqAnswerMini}>{f.a}</p>}
                 </div>
               ))}
             </div>
          </div>
          <div style={styles.faqVisualSide}>
             <div style={styles.technicalBox}>
                <Fingerprint size={48} color="#0066ff" style={{marginBottom:'20px'}} />
                <div style={styles.lineDecoration} />
                <div style={styles.gridDotsOverlay} />
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'40px'}}>PROTOCOL_ENCRYPTION_v2.5</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 2: VISUAL IZQUIERDA, TEXTO DERECHA --- */}
      <section style={{...styles.sectionPadding, backgroundColor: 'rgba(255,255,255,0.01)'}}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqVisualSide}>
             <div style={styles.technicalBox}>
                <Database size={48} color="#10b981" />
                <div style={styles.lineDecorationShort} />
                <div style={styles.gridDotsOverlay} />
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'40px'}}>GLOBAL_SYNC_ENGINE</p>
             </div>
          </div>
          <div style={styles.faqTextSide}>
             <small style={{...styles.underTheHood, color: '#10b981'}}>NEGOCIO Y ESCALA</small>
             <h2 style={styles.faqMainTitle}>Diseñado para <br />el crecimiento.</h2>
             <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
               {faqs.slice(4).map((f, i) => {
                 const index = i + 4;
                 return (
                   <div key={index} onClick={() => setOpenFaq(openFaq === index ? null : index)} style={styles.faqCardMini}>
                     <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                       <span style={{fontWeight:700, fontSize: '15px'}}>{f.q}</span>
                       <ChevronDown size={16} style={{transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0)', transition:'0.3s'}} />
                     </div>
                     {openFaq === index && <p style={styles.faqAnswerMini}>{f.a}</p>}
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section style={styles.finalCtaSection}>
        <div style={styles.finalCtaCard}>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 900, marginBottom: '20px' }}>¿Listo para el cambio?</h2>
          <button onClick={() => window.location.href='/setup'} style={styles.btnMainExtra}>ACTIVAR MI MES GRATUITO ➜</button>
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
            <p style={{fontSize:'14px', opacity:0.4, marginTop: '20px', lineHeight: '1.8'}}>Tecnología de Grado Médico diseñada para el talento, no para la vista. El Ferrari de la gestión clínica.</p>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>LEGAL</p>
             <a href="/rgpd" style={styles.fLink}>Privacidad RGPD</a>
             <a href="/terminos" style={styles.fLink}>Términos de Servicio</a>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>CONTACTO</p>
             <a href="mailto:ana@fisiotool.com" style={styles.fLink}>ana@fisiotool.com</a>
             <p style={{ ...styles.fLink, color: '#25D366', fontWeight: 800 }}>+34 615 200 612</p>
          </div>
        </div>
        <div style={styles.copyrightText}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTES ---
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
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '12px'}}>
      <CheckCircle2 size={18} color="#10b981" /> {text}
    </div>
  );
}

// --- MAPA DE ESTILOS (BLINDADO) ---
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  glowMagenta: { position: 'absolute', bottom: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,0,150,0.06) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
  navbarStyle: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '35px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '250px', paddingBottom: '150px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badgeStyle: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoOverlay: { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoText: { marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 } as React.CSSProperties,
  videoPlaceholderImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 } as React.CSSProperties,
  btnGhost: { background: 'none', border: 'none', color: '#0066ff', fontWeight: 900, fontSize: '14px', marginTop: '40px', cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%' } as React.CSSProperties,
  gridDolores: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
  painCard: { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  iconBoxStyle: { width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingCard: { maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '60px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 80px 150px rgba(0,0,0,0.6)' } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  pricingTextSide: { textAlign: 'left' } as React.CSSProperties,
  miniBadge: { fontSize: '10px', fontWeight: 900, color: '#0066ff', letterSpacing: '2px', marginBottom: '20px' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '48px', fontWeight: 900, lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '18px', opacity: 0.5, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  stampBadge: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', color: '#10b981', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(16,185,129,0.1)' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'center', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '40px' } as React.CSSProperties,
  cardLabel: { fontSize: '11px', fontWeight: 900, letterSpacing: '2px', opacity: 0.4 } as React.CSSProperties,
  priceContainer: { marginBottom: '40px' } as React.CSSProperties,
  priceValue: { fontSize: '80px', fontWeight: 900, color: '#fff' } as React.CSSProperties,
  pricePeriod: { fontSize: '20px', opacity: 0.3, marginLeft: '5px' } as React.CSSProperties,
  virtueList: { textAlign: 'left', maxWidth: '300px', margin: '0 auto 40px' } as React.CSSProperties,
  btnActivate: { background: '#fff', color: '#000', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' } as React.CSSProperties,
  faqAsymmetricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto', alignItems: 'center' } as React.CSSProperties,
  faqTextSide: { textAlign: 'left', position: 'relative' } as React.CSSProperties,
  faqVisualSide: { display: 'flex', justifyContent: 'center' } as React.CSSProperties,
  technicalBox: { width: '100%', maxWidth: '500px', height: '400px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  underTheHood: { fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '20px', display: 'block' } as React.CSSProperties,
  faqMainTitle: { fontSize: '56px', fontWeight: 900, lineHeight: '1', marginBottom: '40px', letterSpacing: '-2px' } as React.CSSProperties,
  faqCardMini: { background: 'rgba(255,255,255,0.015)', padding: '20px 25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' } as React.CSSProperties,
  faqAnswerMini: { marginTop: '15px', fontSize: '14px', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px', lineHeight: '1.6' } as React.CSSProperties,
  dotsDecoration: { position: 'absolute', top: '-40px', left: '-40px', width: '80px', height: '80px', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' } as React.CSSProperties,
  lineDecoration: { width: '60%', height: '1px', background: 'linear-gradient(90deg, #0066ff, transparent)', margin: '10px 0' } as React.CSSProperties,
  lineDecorationShort: { width: '40%', height: '1px', background: 'linear-gradient(90deg, #10b981, transparent)', margin: '10px 0' } as React.CSSProperties,
  gridDotsOverlay: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.3 } as React.CSSProperties,
  finalCtaSection: { padding: '150px 20px', textAlign: 'center' } as React.CSSProperties,
  finalCtaCard: { maxWidth: '1000px', margin: '0 auto', padding: '100px 50px', background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,102,255,0.02) 100%)', borderRadius: '80px', border: '1px solid rgba(255,255,255,0.08)' } as React.CSSProperties,
  btnMainExtra: { background: 'linear-gradient(135deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 80px', borderRadius: '20px', fontWeight: 900, fontSize: '22px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '100px', maxWidth: '1400px', margin: '0 auto 100px' } as React.CSSProperties,
  footerLinksGroup: { display: 'flex', flexDirection: 'column', gap: '18px' } as React.CSSProperties,
  footerTitle: { fontSize: '13px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '25px' } as React.CSSProperties,
  fLink: { color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px', transition: '0.3s' } as React.CSSProperties,
  copyrightText: { textAlign: 'center', fontSize: '12px', opacity: 0.2, fontWeight: 800, letterSpacing: '5px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '60px', textTransform: 'uppercase' } as React.CSSProperties,
};