'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
// 🎨 ARQUITECTURA DE ESTILOS SUPREME
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '35px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '250px', paddingBottom: '100px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badgeStyle: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '100px', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  demoTextSide: { textAlign: 'left' } as React.CSSProperties,
  secTitleLeft: { fontSize: '64px', fontWeight: 900, lineHeight: '1', marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  underTheHood: { fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '4px', marginBottom: '20px', display: 'block' } as React.CSSProperties,
  chatContainer: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '30px', height: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' } as React.CSSProperties,
  chatBox: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px' } as React.CSSProperties,
  chatInputWrapper: { display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' } as React.CSSProperties,
  chatInput: { flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0 20px', outline: 'none', fontSize: '14px' } as React.CSSProperties,
  chatSendBtn: { background: '#0066ff', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoOverlay: { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoText: { marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 } as React.CSSProperties,
  videoPlaceholderImg: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '48px', fontWeight: 900, lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '18px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  priceTag: { fontSize: '80px', fontWeight: 900, color: '#0066ff' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'left', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  btnActivate: { background: '#0066ff', color: '#fff', border: 'none', padding: '20px 40px', borderRadius: '16px', fontWeight: 900, fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '30px', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' } as React.CSSProperties,
  faqAsymmetricGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' } as React.CSSProperties,
  faqTextSide: { textAlign: 'left', position: 'relative' } as React.CSSProperties,
  faqVisualSide: { display: 'flex', justifyContent: 'center' } as React.CSSProperties,
  technicalBox: { width: '100%', height: '450px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  faqCardFixed: { background: 'rgba(255,255,255,0.015)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  glowMagenta: { position: 'absolute', bottom: '20%', right: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255,0,150,0.08) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
  painCard: { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  iconBoxStyle: { width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  dotsDecoration: { position: 'absolute', top: '-40px', left: '-40px', width: '80px', height: '80px', backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' } as React.CSSProperties,
};

// --- SUB-COMPONENTES ---
function PainCard({icon, title, text}: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} style={styles.painCard}>
      <div style={styles.iconBoxStyle}>{icon}</div>
      <h4 style={{fontSize: '22px', fontWeight: 800, margin: '15px 0'}}>{title}</h4>
      <p style={{fontSize: '15px', opacity: 0.5, lineHeight: '1.6'}}>{text}</p>
    </motion.div>
  );
}

function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

function FaqCard({ q, a }: { q: string, a: string }) {
  return (
    <div style={styles.faqCardFixed}>
      <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '15px', color: '#fff' }}>{q}</h4>
      <p style={{ fontSize: '15px', opacity: 0.4, lineHeight: '1.7' }}>{a}</p>
    </div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL (EXPORT DEFAULT)
// ==========================================
export default function Page() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [anaInput, setAnaInput] = useState("");
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy Ana. Demuéstrame un síntoma o hazme una duda sobre tu clínica.' }]);
  const [isTyping, setIsTyping] = useState(false);

  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const faqs = [
    { q: "¿Cómo funcionan las Banderas Rojas?", a: "Ana realiza un triaje inteligente. Si detecta casos especiales, bloquea la cita y deriva a tu teléfono personal." },
    { q: "¿Cómo recibo mis ingresos?", a: "Tú eliges: Stripe para cobros automáticos, Bizum o efectivo. Ana adapta su discurso según tu configuración." },
    { q: "¿Tengo que cobrar fianza obligatoriamente?", a: "No. Tienes soberanía total. Puedes activar la fianza anti-no-show o permitir reserva gratuita." },
    { q: "¿Qué es el historial por voz?", a: "Dictas la evolución al terminar y Ana la transcribe y guarda en la ficha clínica al instante." },
    { q: "¿Puedo importar mis pacientes?", a: "Sí. Motor masivo CSV incluido. Ana reconocerá a tus pacientes habituales por su nombre." },
    { q: "¿Ana reactiva pacientes antiguos?", a: "Exacto. Ana detecta inactividad y lanza campañas de WhatsApp para recuperar ingresos." },
    { q: "¿Soporta varias clínicas?", a: "FisioTool es multi-sede. Gestiona múltiples centros desde un solo panel centralizado." }
  ];

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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      <div style={styles.glowMagenta} />

      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
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
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
        
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

      {/* --- ANA TEST DRIVE --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.demoTextSide}>
             <small style={styles.underTheHood}>DEMO EN VIVO</small>
             <h2 style={styles.secTitleLeft}>Habla con <br /><span style={{color: '#0066ff'}}>Ana ahora.</span></h2>
             <p style={{fontSize:'18px', opacity:0.5, lineHeight:'1.8'}}>Experimenta la Disertación Conductual. Ponla a prueba con un caso clínico complejo.</p>
          </div>
          <div style={styles.chatContainer}>
             <div style={styles.chatBox}>
                {anaChat.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role === 'ana' ? 'flex-start' : 'flex-end', background: m.role === 'ana' ? 'rgba(255,255,255,0.03)' : 'rgba(0,102,255,0.15)', padding: '15px', borderRadius: '15px', fontSize: '14px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.05)' }}>
                     {m.text}
                  </div>
                ))}
             </div>
             <div style={styles.chatInputWrapper}>
                <input value={anaInput} onChange={(e) => setAnaInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && testDriveAna()} placeholder="Prueba la IA..." style={styles.chatInput} />
                <button onClick={testDriveAna} style={styles.chatSendBtn}><ArrowRight size={18}/></button>
             </div>
          </div>
        </div>
      </section>

      {/* --- ROI --- */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>Calcula tu nueva rentabilidad</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA ASIMÉTRICA --- */}
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

      {/* --- FAQ BLOQUE 1 (TEXTO IZQUIERDA) --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqTextSide}>
             <div style={styles.dotsDecoration} />
             <small style={styles.underTheHood}>INGENIERÍA</small>
             <h2 style={styles.faqMainTitle}>Confianza <br />blindada.</h2>
             <FaqCard q="¿Cómo funcionan las Banderas Rojas?" a="Ana realiza un triaje clínico. Casos de tráfico o bebés bloquean la cita automática y derivan a tu teléfono." />
             <FaqCard q="¿Cómo recibo mis ingresos?" a="Soberanía total: Stripe para automatización, Bizum o Efectivo. Tú eliges cómo cobrar." />
             <FaqCard q="¿Qué es el historial por voz?" a="Ahorro de 1h/día. Dictas la evolución al terminar y Ana la transcribe al instante." />
             <FaqCard q="¿Soporta varias clínicas?" a="Sistema multi-sede nativo. Gestiona todos tus centros desde un solo panel." />
          </div>
          <div style={styles.faqVisualSide}>
             <div style={styles.technicalBox}>
                <div style={{width:'80%', height:'2px', background:'linear-gradient(90deg, transparent, #0066ff, transparent)', marginBottom:'40px'}} />
                <Fingerprint size={80} color="#0066ff" opacity={0.4} />
             </div>
          </div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 2 (TEXTO DERECHA) --- */}
      <section style={{...styles.sectionPadding, background:'rgba(255,255,255,0.01)'}}>
        <div style={styles.faqAsymmetricGrid}>
          <div style={styles.faqVisualSide}>
             <div style={styles.technicalBox}>
                <Database size={80} color="#10b981" opacity={0.4} />
             </div>
          </div>
          <div style={styles.faqTextSide}>
             <small style={{...styles.underTheHood, color:'#10b981'}}>CRECIMIENTO</small>
             <h2 style={styles.faqMainTitle}>Soberanía <br />de datos.</h2>
             <FaqCard q="¿Puedo importar mis pacientes?" a="Motor CSV incluido. Ana reconocerá a tus pacientes por su nombre." />
             <FaqCard q="¿Ana reactiva antiguos pacientes?" a="Comercial incansable. Ana detecta la inactividad y lanza campañas de WhatsApp." />
             <FaqCard q="¿Tengo canal de sugerencias?" a="Buzón de Innovación Pro. Tus ideas alimentan la evolución de la herramienta." />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={styles.footer}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '80px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{textAlign:'left'}}>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={{fontSize:'14px', opacity:0.3, marginTop:'20px', lineHeight:'1.8'}}>El motor definitivo para el fisioterapeuta del siglo XXI.</p>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>LEGAL</p>
             <a href="/rgpd" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:'10px'}}>Privacidad</a>
             <a href="/terminos" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none'}}>Términos</a>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>CONTACTO</p>
             <p style={{color:'#fff', fontSize:'14px'}}>ana@fisiotool.com</p>
             <p style={{color:'#25D366', fontWeight:800, fontSize:'14px', display:'flex', alignItems:'center', gap:'8px'}}><MessageCircle size={14}/> +34 615 200 612</p>
          </div>
        </div>
      </footer>
    </div>
  );
}