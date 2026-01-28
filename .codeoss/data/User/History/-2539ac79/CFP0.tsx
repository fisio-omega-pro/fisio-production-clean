'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle, Info,
  Fingerprint, Database, Cpu, Smartphone, Activity, 
  ShieldAlert, Lock, FileText, Server, AlertTriangle
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🏛️ ARQUITECTURA DE ESTILOS SUPREME
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '35px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '250px', paddingBottom: '100px', textAlign: 'center', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badgeStyle: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '100px', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  underTheHood: { fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '20px', display: 'block' } as React.CSSProperties,
  chatContainer: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '30px', height: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '0 auto', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoOverlay: { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  // --- Estilos de Licencia ---
  pricingTextSide: { textAlign: 'left' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '48px', fontWeight: 900, lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '18px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  priceTag: { fontSize: '80px', fontWeight: 900, color: '#0066ff' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'left', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  btnActivate: { background: '#0066ff', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '30px', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' } as React.CSSProperties,
  // --- Otros ---
  crystalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  crystalCard: { background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '40px', textAlign: 'left' } as React.CSSProperties,
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  faqCard: { background: 'rgba(255,255,255,0.015)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' } as React.CSSProperties,
  securityBlock: { textAlign: 'center', padding: '120px 6%', background: 'radial-gradient(circle at center, rgba(0,102,255,0.05) 0%, transparent 70%)' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
};

// ==========================================
// 🧩 SUB-COMPONENTES
// ==========================================
function Virtue({ icon: Icon, title, text }: any) {
  // Versión para lista de Licencia (solo texto)
  if (!Icon && !title) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '15px' }}>
        <CheckCircle2 size={16} color="#10b981" /> {text}
      </div>
    );
  }
  // Versión para Crystal Grid
  return (
    <motion.div whileHover={{ y: -10, background: 'rgba(255,255,255,0.04)' }} style={styles.crystalCard}>
      <div style={{ width: '50px', height: '50px', background: 'rgba(0,102,255,0.1)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
        <Icon color="#0066ff" size={24} />
      </div>
      <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>{title}</h4>
      <p style={{ fontSize: '15px', opacity: 0.5, lineHeight: '1.6' }}>{text}</p>
    </motion.div>
  );
}

function FaqCard({ q, a }: any) {
  return (
    <div style={styles.faqCard}>
      <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0066ff', marginBottom: '15px' }}>{q}</h4>
      <p style={{ fontSize: '15px', opacity: 0.4, lineHeight: '1.7' }}>{a}</p>
    </div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL
// ==========================================
export default function Page() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [anaInput, setAnaInput] = useState("");
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy Ana. Demuéstrame un síntoma o hazme una duda sobre tu clínica.' }]);
  const [isTyping, setIsTyping] = useState(false);

  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const testDriveAna = async () => {
    if (!anaInput) return;
    const msg = anaInput;
    setAnaChat(prev => [...prev, { role: 'user', text: msg }]);
    setAnaInput("");
    setIsTyping(true);
    try {
      const res = await fetch("https://fisiotool-1050901900632.us-central1.run.app/api/chat/5MQYJxwAXUn879OahUfc", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, patient_tlf: "600000000" })
      });
      const data = await res.json();
      setAnaChat(prev => [...prev, { role: 'ana', text: data.reply }]);
    } catch (e) { 
      setAnaChat(prev => [...prev, { role: 'ana', text: 'Error de conexión.' }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%)`, backgroundColor: '#020305' }} />

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{ color: '#0066ff', fontWeight: 400 }}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <a href="#experiencia" style={styles.linkStyle}>Experiencia</a>
          <a href="#roi" style={styles.linkStyle}>Impacto</a>
          <a href="#licencia" style={styles.linkStyle}>Suscripción</a>
          <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>FisioTool es la Inteligencia Conductual que blinda tu agenda y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➔</button>
      </motion.header>

      {/* --- BLOQUE VIDEO --- */}
      <section id="experiencia" style={{ paddingBottom: '100px' }}>
        <div style={styles.videoBox}>
           <div style={styles.videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={{ ...styles.logoTextStyle, marginTop: '30px', opacity: 0.5 }}>TESTIMONIO REAL: DR. MURILLO</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="Clínica" />
        </div>
      </section>

      {/* --- ANA IA --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={{ textAlign: 'left' }}>
             <small style={styles.underTheHood}>DEMO EN VIVO</small>
             <h2 style={{ fontSize: '64px', fontWeight: 900, lineHeight: '1', marginBottom: '30px', letterSpacing: '-3px' }}>Habla con <br /><span style={{ color: '#0066ff' }}>Ana ahora.</span></h2>
             <p style={{ fontSize: '18px', opacity: 0.5, lineHeight: '1.8' }}>Experimenta la Disertación Conductual. Ponla a prueba con un caso clínico complejo.</p>
          </div>
          <div style={styles.chatContainer}>
             <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {anaChat.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role === 'ana' ? 'flex-start' : 'flex-end', background: m.role === 'ana' ? 'rgba(255,255,255,0.03)' : 'rgba(0,102,255,0.15)', padding: '15px', borderRadius: '15px', fontSize: '14px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.05)' }}>
                     {m.text}
                  </div>
                ))}
             </div>
             <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>
                <input value={anaInput} onChange={(e) => setAnaInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && testDriveAna()} placeholder="Prueba la IA..." style={{ flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0 20px', outline: 'none' }} />
                <button onClick={testDriveAna} style={{ background: '#0066ff', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={18} /></button>
             </div>
          </div>
        </div>
      </section>

      {/* --- ROI SECTION --- */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>Calcula tu nueva rentabilidad</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA ASIMÉTRICA (BLOQUE AÑADIDO) --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.pricingTextSide}>
            <small style={styles.underTheHood}>INVERSIÓN ESTRATÉGICA</small>
            <h2 style={styles.pricingSideTitle}>No es un gasto. <br />Es tu nueva <span style={{color:'#0066ff'}}>Directora de Op.</span></h2>
            <p style={styles.pricingSideDesc}>Mientras otros queman miles de euros en gestión ineficiente, tú activas una mente suprema por el valor de una sola fianza recuperada.</p>
            <div style={styles.priceTag}>100€<small style={{fontSize:'24px', opacity:0.3}}>/mes</small></div>
          </div>
          <div style={styles.activationCard}>
             <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
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

      {/* --- VIRTUDES (GLASS GRID) --- */}
      <section style={styles.sectionPadding}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '50px', fontWeight: 900, marginBottom: '20px' }}>Tu clínica, bajo control absoluto.</h2>
          <button onClick={() => window.location.href='/setup'} style={{ background: 'none', border: '1px solid #0066ff', color: '#0066ff', padding: '15px 30px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>EMPIEZA TU TRANSFORMACIÓN AHORA</button>
        </div>
        <div style={styles.crystalGrid}>
          <Virtue icon={AlertCircle} title="Fin de Pérdidas" text="Blindamos tu agenda con fianza automática. El no-show ya no es tu problema, es su compromiso." />
          <Virtue icon={Mic} title="Manos Libres" text="Dicta tus evoluciones por voz. Ana transcribe y archiva mientras tú te preparas para el siguiente paciente." />
          <Virtue icon={TrendingUp} title="Recuperación Activa" text="Ana identifica pacientes olvidados y lanza campañas de reactivación vía WhatsApp de forma autónoma." />
          <Virtue icon={Clock} title="Agenda 24/7" text="Tu recepción no duerme. Ana gestiona citas, triajes y dudas técnicas las 24 horas del día." />
          <Virtue icon={Zap} title="Tiempo Recuperado" text="Delegar la gestión administrativa a la IA te devuelve 2 horas de vida al día. Garantizado." />
        </div>
      </section>

      {/* --- FAQ SUPREME --- */}
      <section style={{ ...styles.sectionPadding, background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '80px' }}>
           <small style={styles.underTheHood}>CONSULTAS FRECUENTES</small>
           <h2 style={{ fontSize: '60px', fontWeight: 900, letterSpacing: '-3px' }}>Ingeniería de <br /><span style={{ color: '#0066ff' }}>Confianza.</span></h2>
        </div>
        <div style={styles.faqGrid}>
          <FaqCard q="¿Cómo funcionan las Banderas Rojas?" a="Ana realiza un triaje inteligente. Si detecta síntomas de urgencia o casos especiales, bloquea la reserva y te deriva el contacto al instante." />
          <FaqCard q="¿Cómo recibo mis ingresos?" a="Soberanía total. Stripe para automatización de fianzas, o Bizum/Efectivo si prefieres gestión manual." />
          <FaqCard q="¿Puedo importar mis pacientes?" a="Sin fricción. Nuestro motor masivo CSV reconoce a tus pacientes actuales por su nombre desde el primer día." />
          <FaqCard q="¿Soporta varias clínicas?" a="Sistema multi-sede nativo. Gestiona todos tus centros y equipos desde un único panel centralizado." />
        </div>
      </section>

      {/* --- BLOQUE SEGURIDAD --- */}
      <section style={styles.securityBlock}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', padding: '15px 30px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '40px' }}>
          <ShieldCheck color="#10b981" size={24} />
          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '13px', letterSpacing: '2px' }}>ESTÁNDAR DE SEGURIDAD MÉDICA UE</span>
        </div>
        <h2 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '30px' }}>Tu clínica es inexpugnable.</h2>
        <p style={{ fontSize: '18px', opacity: 0.5, maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}>
          Implementamos cifrado de grado militar **AES-256** para cada dato clínico. Cumplimos con la **RGPD de salud europea** más estricta, asegurando que tu soberanía y la de tus pacientes sea absoluta.
        </p>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '80px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={{ fontSize: '14px', opacity: 0.3, marginTop: '20px', lineHeight: '1.8' }}>El motor definitivo para el fisioterapeuta del siglo XXI.</p>
          </div>
         <div style={{ flex: 1 }}>
             <p style={{ fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '20px' }}>SERVICIOS</p>
             <Link href="/devolucion" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>Devolución</Link>
             <Link href="/garantia" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>Garantía</Link>
             <Link href="/pagos" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>Formas de Pago</Link>
          </div>
          <div style={{ flex: 1 }}>
             <p style={{ fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '20px' }}>LEGAL</p>
             <Link href="/condiciones" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>Condiciones</Link>
             <Link href="/privacidad" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>Política de privacidad</Link>
             <Link href="/cookies" style={{ display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', marginBottom: '10px', fontSize: '14px' }}>Política de cookies</Link>
          </div>
          <div>
             <p style={{ fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '20px' }}>CONTACTO</p>
             <p style={{ fontSize: '14px' }}>ana@fisiotool.com</p>
             <p style={{ color: '#25D366', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={14} /> +34 615 200 612</p>
          </div>
        </div>
      </footer>
    </div>
  );
}