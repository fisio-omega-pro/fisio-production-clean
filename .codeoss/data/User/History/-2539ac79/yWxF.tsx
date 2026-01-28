'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, VolumeX, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Smartphone, Activity, ShieldAlert
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// --- CONFIGURACIÓN DE MOTOR ---
const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

// --- COMPONENTE: FONDO LÍQUIDO INTERACTIVO ---
function InteractiveBackground({ x, y }: { x: number, y: number }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: `radial-gradient(circle at ${x}% ${y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%)`,
      backgroundColor: '#020305'
    }} />
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function Page() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [narratorActive, setNarratorActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Estados para la Demo de Ana
  const [anaInput, setAnaInput] = useState("");
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy Ana. Escribe cualquier síntoma o duda y te demostraré cómo gestiono tu clínica.' }]);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll Animations
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // --- MOTOR DE VOZ Y NARRACIÓN AMBIENTE ---
  const narrar = (t: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(t);
      msg.lang = 'es-ES';
      msg.rate = 0.9; // Voz pausada y elegante
      window.speechSynthesis.speak(msg);
    }
  };

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // --- LÓGICA DEMO INTERACTIVA ---
  const testDriveAna = async () => {
    if (!anaInput) return;
    const msg = anaInput;
    setAnaChat(prev => [...prev, { role: 'user', text: msg }]);
    setAnaInput("");
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/5MQYJxwAXUn879OahUfc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, patient_tlf: "600000000" })
      });
      const data = await res.json();
      setAnaChat(prev => [...prev, { role: 'ana', text: data.reply }]);
      if (narratorActive) narrar(data.reply);
    } catch (e) { 
      setAnaChat(prev => [...prev, { role: 'ana', text: 'He tenido un pequeño lapso, ¿podrías repetirlo?' }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div style={styles.pageContainer}>
      <InteractiveBackground x={mousePos.x} y={mousePos.y} />
      <div style={styles.glowMagenta} />

      {/* --- EL UMBRAL: BIENVENIDA AUDIBLE --- */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div exit={{ opacity: 0, y: -20 }} style={styles.welcomeOverlay}>
            <div style={styles.welcomeCard}>
              <Volume2 size={48} color="#0066ff" style={{marginBottom: '20px'}} />
              <h2 style={{fontSize: '24px', fontWeight: 900}}>¿Deseas una experiencia audible?</h2>
              <p style={{opacity: 0.5, marginBottom: '30px'}}>Ana narrará los hitos de tu viaje hacia la soberanía clínica.</p>
              <div style={{display: 'flex', gap: '15px'}}>
                <button onClick={() => { setNarratorActive(true); setShowWelcome(false); narrar("Bienvenido a FisioTool Pro. Estás a punto de conocer el futuro de tu clínica."); }} style={styles.btnMainSmall}>SÍ, ACTIVAR</button>
                <button onClick={() => setShowWelcome(false)} style={styles.btnSecSmall}>SÓLO VISUAL</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <a href="#demo" style={styles.linkStyle}>Test Drive</a>
          <a href="#roi" style={styles.linkStyle}>Impacto</a>
          <a href="#licencia" style={styles.linkStyle}>Licencia</a>
          <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO CINEMATOGRÁFICO --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={styles.badgeStyle}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>FisioTool es la Inteligencia Conductual que blinda tu agenda, <br />elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
      </motion.header>

      {/* --- SECCIÓN 1: EL TEST DRIVE (ANA INTERACTIVA) --- */}
      <section id="demo" style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.demoTextSide}>
             <small style={styles.underTheHood}>INTERACCIÓN REAL</small>
             <h2 style={styles.secTitleLeft}>No me creas a mí. <br /><span style={{color: '#0066ff'}}>Habla con Ana.</span></h2>
             <p style={styles.pricingSideDesc}>Experimenta ahora mismo la Disertación Conductual. Ana no solo agenda; entiende la urgencia y la psicología del paciente.</p>
             <div style={styles.stampBadge}><Activity size={16} /> Motor Gemini 2.5 Flash Activo</div>
          </div>
          <div style={styles.demoChatSide}>
             <div style={styles.chatContainer}>
                <div style={styles.chatHeader}>ANA DISCOVERY ENGINE</div>
                <div style={styles.chatBox}>
                   {anaChat.map((m, i) => (
                     <div key={i} style={{ alignSelf: m.role === 'ana' ? 'flex-start' : 'flex-end', background: m.role === 'ana' ? 'rgba(255,255,255,0.03)' : 'rgba(0,102,255,0.1)', padding: '15px', borderRadius: '15px', fontSize: '14px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <strong>{m.role === 'ana' ? 'Ana: ' : 'Tú: '}</strong>{m.text}
                     </div>
                   ))}
                   {isTyping && <div style={{opacity: 0.3, fontSize: '12px'}}>Ana está analizando tu conducta...</div>}
                </div>
                <div style={styles.chatInputWrapper}>
                   <input value={anaInput} onChange={(e) => setAnaInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && testDriveAna()} placeholder="Escribe un síntoma o pregunta..." style={styles.chatInput} />
                   <button onClick={testDriveAna} style={styles.chatSendBtn}><ArrowRight size={18}/></button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- VIDEO: LA PRUEBA DE AUTORIDAD --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <div style={styles.videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={styles.videoText}>TESTIMONIO REAL: DR. MURILLO</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={styles.videoPlaceholderImg} alt="Clínica" />
        </div>
      </section>

      {/* --- IMPACTO ECONÓMICO --- */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>Identifica al Ladrón Invisible</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA SUPREME --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.pricingTextSide}>
            <small style={styles.underTheHood}>INVERSIÓN ESTRATÉGICA</small>
            <h2 style={styles.pricingSideTitle}>Activa tu nueva <br />Directora de Operaciones.</h2>
            <p style={styles.pricingSideDesc}>FisioTool Pro se amortiza con la primera fianza recuperada. Es el fin de los huecos vacíos y el inicio de tu libertad.</p>
            <div style={styles.priceTag}>100€<small>/mes</small></div>
          </div>
          <div style={styles.activationCard}>
             <Virtue text="IA Ana 2.5 Flash (Voz y Chat)" />
             <Virtue text="Blindaje Total Anti No-Show" />
             <Virtue text="Historial Clínico por Voz" />
             <Virtue text="Inclusión 100% para Invidentes" />
             <button onClick={() => window.location.href='/setup'} style={styles.btnActivate}>RECLAMAR MI SOBERANÍA ➜</button>
          </div>
        </div>
      </section>

      {/* --- FAQ ASIMÉTRICA: INGENIERÍA DE DUDAS --- */}
      <section id="ingenieria" style={styles.sectionPadding}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqTextSide}>
             <div style={styles.dotsDecoration} />
             <small style={styles.underTheHood}>UNDER THE HOOD</small>
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
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'40px'}}>SECURE_HEALTH_DATA_ENCRYPTION</p>
             </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={footerGrid}>
          <div style={{textAlign:'left'}}>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={styles.footerDesc}>Diseñado para el talento, no para la vista. 2026 Todos los derechos reservados.</p>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>LEGAL</p>
             <a href="/rgpd" style={styles.fLink}>Privacidad RGPD</a>
             <a href="/terminos" style={styles.fLink}>Términos</a>
          </div>
          <div style={styles.footerLinksGroup}>
             <p style={styles.footerTitle}>CONTACTO</p>
             <p style={{ ...styles.fLink, color: '#25D366', fontWeight: 800 }}>+34 615 200 612</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---
function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

// --- MAPA DE ESTILOS SUPREME (BLINDADO) ---
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
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
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  demoTextSide: { textAlign: 'left' } as React.CSSProperties,
  secTitleLeft: { fontSize: '64px', fontWeight: 900, lineHeight: '1', marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  underTheHood: { fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '20px', display: 'block' } as React.CSSProperties,
  stampBadge: { display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 20px', background: 'rgba(0,102,255,0.05)', borderRadius: '12px', color: '#0066ff', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(0,102,255,0.1)' } as React.CSSProperties,
  demoChatSide: { perspective: '1000px' } as React.CSSProperties,
  chatContainer: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '30px', height: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' } as React.CSSProperties,
  chatHeader: { fontSize: '10px', fontWeight: 900, letterSpacing: '2px', opacity: 0.3, marginBottom: '20px', textAlign: 'center' } as React.CSSProperties,
  chatBox: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px', marginBottom: '20px' } as React.CSSProperties,
  chatInputWrapper: { display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  chatInput: { flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0 20px', outline: 'none', fontSize: '14px' } as React.CSSProperties,
  chatSendBtn: { background: '#0066ff', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '0 auto', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoOverlay: { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoText: { marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 } as React.CSSProperties,
  videoPlaceholderImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 } as React.CSSProperties,
  btnGhost: { background: 'none', border: 'none', color: '#0066ff', fontWeight: 900, fontSize: '14px', marginTop: '40px', cursor: 'pointer', letterSpacing: '2px' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingTextSide: { textAlign: 'left' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '56px', fontWeight: 900, lineHeight: '1', marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '18px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  priceTag: { fontSize: '80px', fontWeight: 900, color: '#fff' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'left', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  btnActivate: { background: '#fff', color: '#000', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '30px' } as React.CSSProperties,
  faqAsymmetricGrid: { display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '100px', maxWidth: '1400px', margin: '0 auto', alignItems: 'center' } as React.CSSProperties,
  faqHeaderSide: { textAlign: 'left', position: 'relative' } as React.CSSProperties,
  faqMainTitle: { fontSize: '64px', fontWeight: 900, lineHeight: '1', margin: '30px 0', letterSpacing: '-3px' } as React.CSSProperties,
  faqBentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' } as React.CSSProperties,
  faqCardMini: { background: 'rgba(255,255,255,0.015)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  faqAnswerMini: { marginTop: '20px', fontSize: '15px', opacity: 0.4, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' } as React.CSSProperties,
  technicalBox: { width: '100%', height: '400px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  lineDecoration: { width: '60%', height: '1px', background: 'linear-gradient(90deg, #0066ff, transparent)', margin: '10px 0' } as React.CSSProperties,
  dotsDecoration: { position: 'absolute', top: '-40px', left: '-40px', width: '80px', height: '80px', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' } as React.CSSProperties,
  welcomeOverlay: { position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(2,3,5,0.9)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  welcomeCard: { maxWidth: '450px', padding: '50px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', textAlign: 'center' } as React.CSSProperties,
  btnMainSmall: { background: '#0066ff', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '100px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  btnSecSmall: { background: 'none', color: 'rgba(255,255,255,0.3)', border: 'none', padding: '12px 25px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  footerDesc: { fontSize: '14px', opacity: 0.3, marginTop: '20px', lineHeight: '1.8', maxWidth: '300px' } as React.CSSProperties,
  footerGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto 100px' } as React.CSSProperties,
  footerLinksGroup: { display: 'flex', flexDirection: 'column', gap: '18px' } as React.CSSProperties,
  footerTitle: { fontSize: '13px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px', marginBottom: '25px' } as React.CSSProperties,
  fLink: { color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '15px' } as React.CSSProperties,
  copyrightText: { textAlign: 'center', fontSize: '12px', opacity: 0.1, fontWeight: 800, letterSpacing: '5px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '60px' } as React.CSSProperties,
  glowMagenta: { position: 'absolute', bottom: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,0,150,0.08) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
};