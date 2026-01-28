'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Smartphone, Activity, 
  ShieldAlert, Lock, FileText, Server, AlertTriangle, 
  Scale, Building2, Layout, MessageSquare 
} from 'lucide-react';

// --- CONFIGURACIÓN DE MOTOR ---
const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS SUPREME (BLINDADOS)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.9)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px' } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '220px', paddingBottom: '50px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 30px 60px rgba(0,102,255,0.3)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '60px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  chatContainer: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '40px', height: '600px', display: 'flex', flexDirection: 'column', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  pricingCard: { maxWidth: '900px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '60px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 80px 150px rgba(0,0,0,0.6)' } as React.CSSProperties,
  faqBentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  faqCardFixed: { background: 'rgba(255,255,255,0.015)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' } as React.CSSProperties,
  securityBanner: { display: 'inline-flex', gap: '40px', background: 'rgba(255,255,255,0.02)', padding: '30px 60px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '100px' } as React.CSSProperties,
  footer: { padding: '120px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  footerGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '60px', maxWidth: '1500px', margin: '0 auto 100px' } as React.CSSProperties,
  virtueGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
};

// --- SUB-COMPONENTES ---
function FaqModule({ q, a }: { q: string, a: string }) {
  return (
    <div style={styles.faqCardFixed}>
      <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', color: '#0066ff' }}>{q}</h4>
      <p style={{ fontSize: '15px', opacity: 0.4, lineHeight: '1.8' }}>{a}</p>
    </div>
  );
}

function VirtueCard({ icon, title, text }: any) {
  return (
    <div style={{ padding: '40px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', textAlign: 'left' }}>
      <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>{icon}</div>
      <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>{title}</h4>
      <p style={{ fontSize: '14px', opacity: 0.4, lineHeight: '1.6' }}>{text}</p>
    </div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL
// ==========================================
export default function Page() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy Ana. Escribe cualquier duda y te demostraré cómo gestiono tu clínica.' }]);
  const [anaInput, setAnaInput] = useState("");

  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const sendToAna = async () => {
    if (!anaInput) return;
    const msg = anaInput;
    setAnaChat(prev => [...prev, { role: 'user', text: msg }]);
    setAnaInput("");
    try {
      const res = await fetch(`${API_BASE}/api/chat/5MQYJxwAXUn879OahUfc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, patient_tlf: "600000000" })
      });
      const data = await res.json();
      setAnaChat(prev => [...prev, { role: 'ana', text: data.reply }]);
    } catch (e) { setAnaChat(prev => [...prev, { role: 'ana', text: 'Error de conexión con el cerebro.' }]); }
  };

  return (
    <div style={styles.pageContainer}>
      {/* FONDO LÍQUIDO */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.1) 0%, transparent 40%)`, backgroundColor: '#020305' }} />

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoTextStyle}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={styles.navLinks}>
          <a href="#experiencia" style={styles.linkStyle}>Test Drive</a>
          <a href="#roi" style={styles.linkStyle}>Impacto</a>
          <a href="#licencia" style={styles.linkStyle}>Licencia</a>
          <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* HERO */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={{fontSize:'10px', fontWeight:900, color:'#0066ff', letterSpacing:'4px', marginBottom:'30px'}}>SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>EMPEZAR MI REVOLUCIÓN GRATIS ➜</button>
      </motion.header>

      {/* VIDEO Y ANA (INMEDIATO) */}
      <section id="experiencia" style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Play size={100} color="#fff" style={{ opacity: 0.2 }} />
              <div style={{marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5}}>TESTIMONIO REAL: CÓMO RECUPERAR 5H A LA SEMANA</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070" style={{width:'100%', height:'100%', objectFit:'cover', opacity:0.4}} alt="Fisioterapia" />
        </div>

        <div style={{ ...styles.asymmetricGrid, marginTop: '150px' }}>
          <div style={{ textAlign: 'left' }}>
             <small style={{ color: '#0066ff', fontWeight: 900, letterSpacing: '2px' }}>INTERACCIÓN REAL</small>
             <h2 style={{ fontSize: '56px', fontWeight: 900, margin: '20px 0' }}>Habla con Ana. <br />Siente la diferencia.</h2>
             <p style={{ fontSize: '18px', opacity: 0.4, lineHeight: '1.8' }}>Experimenta la Disertación Conductual. Ana no solo agenda; entiende la psicología y la urgencia del paciente antes de reservar.</p>
          </div>
          <div style={styles.chatContainer}>
             <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {anaChat.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role === 'ana' ? 'flex-start' : 'flex-end', background: m.role === 'ana' ? 'rgba(255,255,255,0.03)' : 'rgba(0,102,255,0.15)', padding: '15px', borderRadius: '15px', fontSize: '14px', maxWidth: '85%' }}>{m.text}</div>
                ))}
             </div>
             <div style={{ display: 'flex', gap: '10px', marginTop: '20px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '100px' }}>
                <input value={anaInput} onChange={(e) => setAnaInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendToAna()} placeholder="Escribe aquí..." style={{ flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', paddingLeft: '15px' }} />
                <button onClick={sendToAna} style={{ background: '#0066ff', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}><ArrowRight size={18}/></button>
             </div>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section id="roi" style={styles.roiBg}>
        <h2 style={styles.secTitle}>Mide el impacto en tu bolsillo</h2>
        <RoiSimulator />
      </section>

      {/* VIRTUDES (BAJO EL ROI) */}
      <section style={styles.sectionPadding}>
        <div style={{textAlign:'center', marginBottom:'80px'}}>
           <h2 style={{fontSize:'48px', fontWeight:900}}>Tu nueva realidad operativa.</h2>
           <button onClick={() => window.location.href='/setup'} style={{...styles.btnMain, marginTop:'30px'}}>ACTIVAR FISIOTOOL AHORA ➜</button>
        </div>
        <div style={styles.virtueGrid}>
          <VirtueCard icon={<Smartphone color="#0066ff" />} title="Ana 2.5 Flash" text="IA disponible 24/7 en tu web o WhatsApp para agendar y resolver dudas." />
          <VirtueCard icon={<ShieldCheck color="#10b981" />} title="Escudo Anti No-Show" text="Cobra fianzas automáticas para que cada hueco en tu agenda sea ingreso real." />
          <VirtueCard icon={<Mic color="#0066ff" />} title="Historial por Voz" text="Dicta la evolución clínica al terminar y olvida el teclado para siempre." />
          <VirtueCard icon={<Layout color="#10b981" />} title="Agenda Soberana" text="Control total de huecos, pausas de mediodía y bloqueos de vacaciones." />
          <VirtueCard icon={<Building2 color="#0066ff" />} title="Multi-Sede Pro" text="Gestiona todas tus clínicas desde un único panel centralizado." />
          <VirtueCard icon={<Users color="#10b981" />} title="Inclusión Élite" text="Única herramienta diseñada para el talento invidente con narración nativa." />
          <VirtueCard icon={<TrendingUp color="#0066ff" />} title="Balance en Vivo" text="Contabilidad automática: cuánto ganas y cuánto tienes pendiente hoy." />
          <VirtueCard icon={<Activity color="#10b981" />} title="Reactivación Activa" text="Ana contacta a pacientes antiguos para que vuelvan a tu camilla solo si tú quieres." />
        </div>
      </section>

      {/* PRECIO (ASIMÉTRICO) */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '56px', fontWeight: 900, lineHeight: 1.1 }}>No es un gasto. <br />Es tu Directora de <br /><span style={{color:'#0066ff'}}>Operaciones.</span></h2>
            <p style={{ fontSize: '18px', opacity: 0.4, marginTop: '30px' }}>Mientras otros queman miles de euros en gestión ineficiente, tú activas el Ferrari por el coste de una sola fianza recuperada.</p>
          </div>
          <div style={styles.pricingCard}>
            <div style={{fontSize:'80px', fontWeight:900, color:'#0066ff', marginBottom:'20px'}}>100€<small style={{fontSize:'24px', opacity:0.3}}>/mes</small></div>
            <button onClick={() => window.location.href='/setup'} style={{...styles.btnMain, width:'100%', marginBottom:'30px'}}>ACTIVAR MI LICENCIA PRO ➜</button>
            <p style={{fontSize:'12px', opacity:0.3, fontWeight:700}}>SIN PERMANENCIA • SIN COMISIONES OCULTAS</p>
          </div>
        </div>
      </section>

      {/* FAQ BENTO (DISEÑO TÉCNICO) */}
      <section style={styles.sectionPadding}>
        <h2 style={styles.secTitle}>Resolución de Dudas de Ingeniería</h2>
        <div style={styles.faqBentoGrid}>
          <FaqModule q="¿Cómo funcionan las Banderas Rojas?" a="Ana realiza un triaje clínico automático. Si detecta casos de tráfico o pediatría, bloquea la cita y te avisa para valoración manual." />
          <FaqModule q="¿Tengo soberanía de cobro?" a="Tú eliges: Stripe para cobros automáticos 100%, Bizum o Efectivo. Ana adapta su discurso a lo que tú configures." />
          <FaqModule q="¿Es accesible para invidentes?" a="FisioTool es la primera plataforma médica con Accesibilidad Triple A, diseñada para el talento, no para la vista." />
          <FaqModule q="¿Ana reactiva pacientes?" a="Sí. Es una comercial incansable. Analiza tu base de datos y lanza campañas para recuperar a antiguos clientes." />
        </div>
      </section>

      {/* SEGURIDAD AL FINAL */}
      <section style={{...styles.sectionPadding, textAlign:'center'}}>
        <h2 style={{fontSize:'24px', fontWeight:800, marginBottom:'40px'}}>Seguridad Asistencial de Grado Militar.</h2>
        <div style={styles.securityBanner}>
           <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', fontWeight:900, opacity:0.4}}><ShieldCheck color="#0066ff" size={20}/> CIFRADO AES-256</div>
           <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', fontWeight:900, opacity:0.4}}><Lock color="#0066ff" size={20}/> DPA SALUD UE</div>
           <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px', fontWeight:900, opacity:0.4}}><Server color="#0066ff" size={20}/> INFRAESTRUCTURA BLINDADA</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={{textAlign:'left'}}>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoTextStyle}>FISIOTOOL</span>
            </div>
            <p style={{fontSize:'13px', opacity:0.4, marginTop:'20px', lineHeight:1.8}}>La primera plataforma de gestión médica inclusiva diseñada para el éxito del fisioterapeuta del siglo XXI.</p>
          </div>
          <div><p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>LEGAL</p>
            <a href="/rgpd" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:'10px'}}>Política Privacidad</a>
            <a href="/terminos" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:'10px'}}>Condiciones</a>
            <a href="/cookies" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none'}}>Cookies</a>
          </div>
          <div><p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>POLÍTICAS</p>
            <a href="/devolucion" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:'10px'}}>Devolución</a>
            <a href="/garantia" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:'10px'}}>Garantía</a>
            <a href="/pagos" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none'}}>Formas de Pago</a>
          </div>
          <div><p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>CONTACTO</p>
            <p style={{color:'#fff', fontSize:'14px'}}>ana@fisiotool.com</p>
            <p style={{color:'#25D366', fontWeight:800, fontSize:'16px', display:'flex', alignItems:'center', gap:'8px'}}><MessageCircle size={18}/> +34 615 200 612</p>
          </div>
        </div>
        <p style={{textAlign:'center', fontSize:'11px', opacity:0.1, fontWeight:800, letterSpacing:'5px', marginTop:'80px'}}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
}

// Iconos que faltaban
import { Building2 } from 'lucide-react';