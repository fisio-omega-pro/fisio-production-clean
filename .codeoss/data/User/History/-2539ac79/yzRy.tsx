'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// --- COMPONENTE DE FONDO INTERACTIVO (SEDA DIGITAL) ---
function InteractiveBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
      background: `
        radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%),
        radial-gradient(circle at 10% 10%, rgba(255, 0, 255, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 90% 90%, rgba(0, 242, 255, 0.05) 0%, transparent 50%)
      `,
      backgroundColor: '#020305'
    }} />
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

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
    <div style={pageContainer}>
      <InteractiveBackground />

      {/* --- NAVBAR SUPREME --- */}
      <nav style={navbarStyle}>
        <div style={logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '35px', filter: 'drop-shadow(0 0 10px rgba(0,102,255,0.5))' }} />
          <span style={logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={navLinks}>
          <a href="#experiencia" style={linkStyle}>Experiencia</a>
          <a href="#roi" style={linkStyle}>Impacto</a>
          <a href="#precio" style={linkStyle}>Suscripción</a>
          <button onClick={() => window.location.href='/login'} style={loginBtn}>ACCESO PROFESIONAL</button>
        </div>
      </nav>

      {/* --- HERO CINEMATOGRÁFICO --- */}
      <motion.header style={{ ...heroSection, opacity, scale }}>
        <motion.div 
          initial={{ opacity: 0, letterSpacing: '10px' }} 
          animate={{ opacity: 1, letterSpacing: '4px' }} 
          transition={{ duration: 1.5 }}
          style={badgeStyle}
        >
          SOBERANÍA CLÍNICA TOTAL
        </motion.div>

        <h1 style={mainTitle}>
          Tu talento merece <br />
          <span style={gradientText}>un Ferrari.</span>
        </h1>
        
        <p style={heroDescription}>
          Ana es la Inteligencia Conductual que blinda tu agenda, <br />
          elimina tus No-Shows y recupera tu tiempo de vida.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
          <button onClick={() => window.location.href='/setup'} style={btnMain}>EMPEZAR MI REVOLUCIÓN GRATIS ➜</button>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ opacity: 0.3 }}
          >
            <ChevronDown size={32} />
          </motion.div>
        </div>
      </motion.header>

      {/* --- SECCIÓN VIDEO: LA PRUEBA DE AUTORIDAD --- */}
      <section id="experiencia" style={sectionPadding}>
        <div style={videoBox}>
           <div style={videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.2 }} />
              <div style={videoText}>TESTIMONIO REAL: CÓMO RECUPERAR 5H A LA SEMANA</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={videoPlaceholderImg} alt="Clínica" />
        </div>
      </section>

      {/* --- LOS 5 DOLORES (CONVERTIDOS EN VALOR) --- */}
      <section style={sectionPadding}>
        <div style={gridDolores}>
          <PainCard icon={<AlertCircle color="#ef4444" />} title="Fin de las pérdidas" text="Cada no-show es dinero quemado. Ana exige fianza automática para que tu tiempo sea respetado." />
          <PainCard icon={<Mic color="#0066ff" />} title="Manos libres" text="Dicta tus informes clínicos por voz. Elimina el agotamiento de teclear tras 8 horas de pie." />
          <PainCard icon={<TrendingUp color="#10b981" />} title="Recuperación activa" text="No dejes que tus pacientes te olviden. Ana contacta a antiguos clientes para reactivar su bienestar." />
        </div>
      </section>

      {/* --- IMPACTO ECONÓMICO (ROI) --- */}
      <section id="roi" style={roiBg}>
        <div style={{maxWidth: '1000px', margin: '0 auto'}}>
          <h2 style={secTitle}>Mide el ahorro de tu nueva oficina virtual</h2>
          <RoiSimulator />
        </div>
      </section>

      {/* --- PRECIO: LA INVERSIÓN LÓGICA --- */}
      <section id="precio" style={sectionPadding}>
        <div style={pricingCard}>
          <div style={iconBadge}><BadgeEuro size={40} color="#10b981" /></div>
          <h2 style={{fontSize:'36px', fontWeight:900, letterSpacing:'-1px'}}>Directora de Operaciones 24/7</h2>
          <div style={{fontSize:'90px', fontWeight:900, color:'#fff', margin:'30px 0'}}>100€<small style={{fontSize:'22px', opacity:0.3}}>/mes</small></div>
          <button onClick={() => window.location.href='/setup'} style={btnMainLarge}>ACTIVAR FISIOTOOL PRO ➜</button>
          
          <div style={virtueGrid}>
             <Virtue text="IA Ana 2.5 Flash (Voz y Chat)" />
             <Virtue text="Blindaje Total Anti No-Show" />
             <Virtue text="Historial Clínico por Voz" />
             <Virtue text="Multi-Sede y Gestión Global" />
             <Virtue text="Inclusión 100% para Invidentes" />
             <Virtue text="Campañas de Reactivación" />
          </div>
        </div>
      </section>

      {/* --- FAQ: EL CIERRE DE DUDAS --- */}
      <section style={{ ...sectionPadding, backgroundColor: 'rgba(255,255,255,0.01)' }}>
        <div style={{maxWidth:'850px', margin:'0 auto'}}>
          <h2 style={secTitle}>Preguntas Estratégicas</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            {faqs.map((f, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={faqCard}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer'}}>
                  <span style={{fontWeight:700, fontSize: '17px'}}>{f.q}</span>
                  <ChevronDown style={{transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition:'0.4s'}} />
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} style={faqAnswer}>
                      {f.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
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
            <p style={{fontSize:'14px', opacity:0.4, marginTop: '20px', lineHeight: '1.8'}}>Tecnología de Grado Médico diseñada para el talento, no para la vista. El Ferrari de la gestión clínica.</p>
          </div>
          <div style={footerLinksGroup}>
             <p style={footerTitle}>LEGAL</p>
             <a href="/rgpd" style={fLink}>Privacidad RGPD</a>
             <a href="/terminos" style={fLink}>Términos de Servicio</a>
          </div>
          <div style={footerLinksGroup}>
             <p style={footerTitle}>CONTACTO</p>
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
function PainCard({icon, title, text}: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} style={painCardStyle}>
      <div style={iconBoxStyle}>{icon}</div>
      <h4 style={{fontSize: '24px', fontWeight: 800, margin: '20px 0', letterSpacing: '-0.5px'}}>{title}</h4>
      <p style={{fontSize: '16px', opacity: 0.5, lineHeight: '1.7'}}>{text}</p>
    </motion.div>
  );
}

function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'15px', color:'rgba(255,255,255,0.7)'}}>
      <CheckCircle2 size={18} color="#10b981" /> {text}
    </div>
  );
}

// --- ESTILOS DE LUJO (INLINE PARA EVITAR FALLOS) ---
const pageContainer: React.CSSProperties = { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' };
const navbarStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.8)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' };
const logoWrapper: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px' };
const logoTextStyle: React.CSSProperties = { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' };
const navLinks: React.CSSProperties = { display: 'flex', gap: '35px', alignItems: 'center' };
const linkStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' };
const loginBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' };
const heroSection: React.CSSProperties = { paddingTop: '250px', paddingBottom: '150px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 };
const badgeStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase' };
const mainTitle: React.CSSProperties = { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' };
const gradientText: React.CSSProperties = { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
const heroDescription: React.CSSProperties = { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6', fontWeight: 400 };
const btnMain: React.CSSProperties = { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)', transition: '0.3s' };
const videoBox: React.CSSProperties = { maxWidth: '1100px', margin: '0 auto', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' };
const videoOverlay: React.CSSProperties = { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const videoText: React.CSSProperties = { marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 };
const videoPlaceholderImg: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 };
const btnGhost: React.CSSProperties = { background: 'none', border: 'none', color: '#0066ff', fontWeight: 900, fontSize: '14px', marginTop: '40px', cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase' };
const sectionPadding: React.CSSProperties = { padding: '150px 20px' };
const gridDolores: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' };
const painCardStyle: React.CSSProperties = { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' };
const iconBoxStyle: React.CSSProperties = { width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const roiBg: React.CSSProperties = { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' };
const secTitle: React.CSSProperties = { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' };
const pricingCard: React.CSSProperties = { maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '60px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 80px 150px rgba(0,0,0,0.6)' };
const iconBadge: React.CSSProperties = { display: 'inline-flex', padding: '25px', background: 'rgba(16,185,129,0.1)', borderRadius: '30px', marginBottom: '30px' };
const btnMainLarge: React.CSSProperties = { ...btnMain, width: '100%', maxWidth: '450px', marginBottom: '50px' };
const virtueGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', textAlign: 'left', maxWidth: '700px', margin: '0 auto' };
const faqCard: React.CSSProperties = { background: 'rgba(255,255,255,0.015)', padding: '35px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' };
const faqAnswer: React.CSSProperties = { marginTop: '25px', fontSize: '16px', opacity: 0.5, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '25px', lineHeight: '1.8' };
const footerStyle: React.CSSProperties = { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' };
const footerGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto 100px' };
const footerLinksGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '18px' };
const footerTitle: React.CSSProperties = { fontSize: '13px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '25px' };
const fLink: React.CSSProperties = { color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px', transition: '0.3s' };
const copyrightText: React.CSSProperties = { textAlign: 'center', fontSize: '12px', opacity: 0.2, fontWeight: 800, letterSpacing: '5px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '60px', textTransform: 'uppercase' };
const glowCyan: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '800px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.15) 0%, transparent 70%)', zIndex: 0 };
const glowMagenta: React.CSSProperties = { position: 'absolute', bottom: 0, right: 0, width: '100%', height: '800px', background: 'radial-gradient(circle at 90% 90%, rgba(255,0,150,0.08) 0%, transparent 70%)', zIndex: 0 };