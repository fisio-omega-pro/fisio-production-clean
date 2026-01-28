'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle, Info,
  Fingerprint, Database, Cpu, Smartphone, Activity, 
  ShieldAlert, Lock, FileText, Server, AlertTriangle,
  Stethoscope, CalendarCheck, HeartPulse
} from 'lucide-react'

// Importaríamos tu componente real aquí
// import RoiSimulator from '../components/RoiSimulator';
const RoiSimulatorPlaceholder = () => (
  <div style={{ padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
    <p style={{ opacity: 0.5 }}>[Simulador de ROI - Integrado con éxito]</p>
  </div>
);

// ==========================================
// 💎 SISTEMA DE ESTILOS SUPREME (TAILWIND-READY CONCEPT)
// ==========================================
const styles = {
  pageContainer: { 
    backgroundColor: '#020305', 
    minHeight: '100vh', 
    color: '#fff', 
    fontFamily: '"Inter", sans-serif', 
    position: 'relative', 
    overflowX: 'hidden' 
  } as React.CSSProperties,

  glassCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '40px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  } as React.CSSProperties,

  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  } as React.CSSProperties,

  securitySeal: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(2, 3, 5, 1) 100%)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '30px',
    padding: '60px',
    textAlign: 'center',
    maxWidth: '900px',
    margin: '100px auto'
  } as React.CSSProperties,

  videoBox: { 
    maxWidth: '1100px', 
    margin: '40px auto 0', 
    aspectRatio: '16/9', 
    background: '#000', 
    borderRadius: '40px', 
    overflow: 'hidden', 
    position: 'relative', 
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9)'
  } as React.CSSProperties,
};

// ==========================================
// ✨ COMPONENTES DE ÉLITE
// ==========================================

const BenefitCard = ({ icon: Icon, title, text, color = "#0066ff" }: any) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
    style={styles.glassCard}
  >
    <div style={{ width: '50px', height: '50px', background: `${color}20`, borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
      <Icon size={24} color={color} />
    </div>
    <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>{title}</h4>
    <p style={{ fontSize: '15px', opacity: 0.5, lineHeight: '1.6' }}>{text}</p>
  </motion.div>
);

const BentoFaqCard = ({ q, a, size = "small" }: any) => (
  <motion.div 
    whileHover={{ scale: 0.99 }}
    style={{
      ...styles.glassCard,
      gridColumn: size === "large" ? "span 2" : "span 1",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '200px'
    }}
  >
    <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0066ff' }}>{q}</h4>
    <p style={{ fontSize: '14px', opacity: 0.4, marginTop: '20px', lineHeight: '1.7' }}>{a}</p>
  </motion.div>
);

// ==========================================
// 🚀 PÁGINA PRINCIPAL
// ==========================================

export default function LandingPage() {
  const [anaInput, setAnaInput] = useState("");
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy Ana. Ponme a prueba con una duda sobre tu clínica o un síntoma.' }]);
  const [isTyping, setIsTyping] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const testDriveAna = async () => {
    if (!anaInput) return;
    const msg = anaInput;
    setAnaChat(prev => [...prev, { role: 'user', text: msg }]);
    setAnaInput("");
    setIsTyping(true);
    // Simulación de API (usar tu URL real aquí)
    setTimeout(() => {
      setAnaChat(prev => [...prev, { role: 'ana', text: "Entendido. Para un paciente con esa sintomatología, activaría el triaje de 'Bandera Roja' y te notificaría al instante, bloqueando la reserva automática para tu seguridad legal." }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div style={styles.pageContainer}>
      {/* --- BACKGROUND DINÁMICO --- */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0, 102, 255, 0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />

      {/* --- NAVBAR --- */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#0066ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={18} color="#fff" /></div>
          <span style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '-1px' }}>FISIOTOOL <span style={{ color: '#0066ff', fontWeight: 300 }}>PRO</span></span>
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <a href="#experiencia" style={{ fontSize: '11px', fontWeight: 700, opacity: 0.4, textDecoration: 'none', textTransform: 'uppercase' }}>Demo</a>
          <a href="#beneficios" style={{ fontSize: '11px', fontWeight: 700, opacity: 0.4, textDecoration: 'none', textTransform: 'uppercase' }}>Potencial</a>
          <button style={{ background: '#0066ff', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <motion.header style={{ opacity: heroOpacity, scale: heroScale, paddingTop: '180px', textAlign: 'center', paddingBottom: '50px' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, color: '#0066ff', letterSpacing: '4px', marginBottom: '20px' }}>TECNOLOGÍA DE SOBERANÍA CLÍNICA</div>
        <h1 style={{ fontSize: 'clamp(40px, 8vw, 100px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, marginBottom: '30px' }}>
          Tu talento merece <br /> <span style={{ background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0.3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>un Ferrari.</span>
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.4, maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          FisioTool es la Inteligencia Conductual que blinda tu agenda y recupera tu tiempo de vida. No gestiones, domina.
        </p>
        <button style={{ background: 'linear-gradient(180deg, #0066ff, #0044cc)', border: 'none', padding: '20px 50px', borderRadius: '15px', color: '#fff', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' }}>
          RECLAMAR MI MES GRATIS <ArrowRight size={18} style={{ marginLeft: '10px' }} />
        </button>
      </motion.header>

      {/* --- BLOQUE VIDEO (SIN DIFUMINADO POR SCROLL) --- */}
      <section id="experiencia" style={{ padding: '0 6% 100px' }}>
        <div style={styles.videoBox}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.4)', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={80} color="#fff" style={{ opacity: 0.2 }} />
            <p style={{ marginTop: '20px', fontWeight: 900, letterSpacing: '2px', opacity: 0.5 }}>DR. MURILLO: IMPACTO REAL EN CONSULTA</p>
          </div>
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} alt="Clinical Experience" />
        </div>
      </section>

      {/* --- ANA IA TEST DRIVE (MOVIDO AQUÍ) --- */}
      <section style={{ padding: '100px 6%', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px', maxWidth: '1400px', margin: '0 auto', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px' }}>TEST DRIVE</span>
            <h2 style={{ fontSize: '56px', fontWeight: 900, letterSpacing: '-2px', margin: '20px 0' }}>Habla con Ana.</h2>
            <p style={{ fontSize: '18px', opacity: 0.4, lineHeight: 1.8 }}>Ella no es un bot, es tu Directora de Operaciones. Ponla en un aprieto con un caso clínico complejo ahora mismo.</p>
          </div>
          <div style={{ ...styles.glassCard, height: '450px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px' }}>
              {anaChat.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'ana' ? 'flex-start' : 'flex-end', background: m.role === 'ana' ? 'rgba(255,255,255,0.05)' : '#0066ff', padding: '12px 18px', borderRadius: '15px', fontSize: '14px', maxWidth: '80%' }}>
                  {m.text}
                </div>
              ))}
              {isTyping && <div style={{ opacity: 0.3, fontSize: '12px' }}>Ana está analizando...</div>}
            </div>
            <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <input value={anaInput} onChange={e => setAnaInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && testDriveAna()} placeholder="Escribe un síntoma o duda..." style={{ flex: 1, background: 'none', border: 'none', color: '#fff', padding: '0 15px', outline: 'none' }} />
              <button onClick={testDriveAna} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0066ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight size={18} color="#fff" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROI SIMULATOR --- */}
      <section style={{ padding: '150px 6%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '48px', fontWeight: 900, marginBottom: '60px' }}>Calcula tu nueva rentabilidad</h2>
        <RoiSimulatorPlaceholder />
      </section>

      {/* --- VIRTUDES (GLASS CARDS - HORIZONTAL/RESPONSIVE) --- */}
      <section id="beneficios" style={{ padding: '100px 6% 150px' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '54px', fontWeight: 900, letterSpacing: '-2px' }}>Dominio Total 360º</h2>
          <p style={{ opacity: 0.4, fontSize: '18px', marginTop: '10px' }}>Haz clic para reclamar el control de tu clínica.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1400px', margin: '0 auto' }}>
          <BenefitCard icon={ShieldCheck} title="Cero No-Shows" text="Fianza automática obligatoria. Quien no se compromete, no ocupa tu tiempo." color="#ef4444" />
          <BenefitCard icon={Mic} title="Informes por Voz" text="Dicta la evolución al terminar y Ana la transcribe. Ahorra 1 hora de papeleo al día." color="#0066ff" />
          <BenefitCard icon={Users} title="Resucita Pacientes" text="Ana detecta inactividad y lanza campañas de WhatsApp personalizadas automáticamente." color="#10b981" />
          <BenefitCard icon={Clock} title="Agenda 24/7" text="Tu clínica nunca cierra. Ana reserva, triaja y cobra mientras tú descansas o tratas." color="#f59e0b" />
          <BenefitCard icon={Smartphone} title="Multi-Sede Global" text="Gestiona una o diez clínicas desde el mismo panel con soberanía total de datos." color="#8b5cf6" />
        </div>
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '20px 40px', borderRadius: '15px', fontWeight: 800, cursor: 'pointer' }}>CONOCE TODAS LAS FUNCIONES</button>
        </div>
      </section>

      {/* --- FAQ BENTO GRID (ÉPICO) --- */}
      <section style={{ padding: '100px 6%', background: 'rgba(0,102,255,0.02)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px' }}>
            <span style={{ color: '#0066ff', fontWeight: 900, fontSize: '10px', letterSpacing: '4px' }}>INGENIERÍA CLÍNICA</span>
            <h2 style={{ fontSize: '50px', fontWeight: 900, marginTop: '10px' }}>Preguntas <br /> Inevitables.</h2>
          </div>
          <div style={styles.bentoGrid}>
            <BentoFaqCard size="large" q="¿Cómo funcionan las Banderas Rojas?" a="Ana realiza un triaje clínico inteligente. Si detecta casos de tráfico, bebés o síntomas de urgencia, bloquea la cita y te notifica personalmente para que tú decidas." />
            <BentoFaqCard q="¿Cómo recibo mis ingresos?" a="Soberanía total. Stripe para cobros automáticos, Bizum o efectivo. Tú eliges el flujo y Ana adapta su discurso." />
            <BentoFaqCard q="¿Historial por voz?" a="Exacto. Al terminar la sesión, dictas la evolución a la App y Ana la transcribe y guarda en la ficha clínica al instante. Sin teclados." />
            <BentoFaqCard q="¿Puedo importar mis datos?" a="Sí. Motor masivo CSV incluido. Ana reconocerá a tus pacientes habituales por su nombre desde el minuto uno." />
            <BentoFaqCard size="large" q="¿Ana reactiva pacientes?" a="Es tu comercial incansable. Detecta inactividad y lanza campañas de WhatsApp para recuperar ingresos de pacientes que ya te conocen." />
          </div>
        </div>
      </section>

      {/* --- SELLO DE SEGURIDAD (PHRASE CONTUNDENTE) --- */}
      <section style={{ padding: '0 6%' }}>
        <div style={styles.securitySeal}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
            <Lock size={40} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '20px' }}>Inexpugnable.</h2>
          <p style={{ fontSize: '18px', opacity: 0.6, maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Tus datos médicos están blindados bajo cifrado **AES-256 de grado militar** y servidores en región UE. Cumplimos con la RGPD de salud más estricta: tu soberanía digital es nuestra ley.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', opacity: 0.3 }}>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>DPA SALUD UE</span>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>SSL SECURE</span>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>ISO 27001 COMPLIANT</span>
          </div>
        </div>
      </section>

      {/* --- FOOTER (CON ENLACES LEGALES) --- */}
      <footer style={{ padding: '100px 6% 60px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#010204' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', maxWidth: '1400px', margin: '0 auto' }}>
          <div>
            <span style={{ fontWeight: 900, fontSize: '18px' }}>FISIOTOOL PRO</span>
            <p style={{ opacity: 0.3, fontSize: '14px', marginTop: '10px' }}>El motor definitivo para el fisioterapeuta del siglo XXI.</p>
          </div>
          <div>
            <h5 style={{ color: '#0066ff', fontSize: '12px', marginBottom: '20px', letterSpacing: '2px' }}>LEGAL</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Devolución</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Garantía</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Formas de Pago</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Condiciones</a>
            </div>
          </div>
          <div>
            <h5 style={{ color: '#0066ff', fontSize: '12px', marginBottom: '20px', letterSpacing: '2px' }}>PRIVACIDAD</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Política de privacidad</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px' }}>Política de cookies</a>
            </div>
          </div>
          <div>
            <h5 style={{ color: '#0066ff', fontSize: '12px', marginBottom: '20px', letterSpacing: '2px' }}>SOPORTE</h5>
            <p style={{ fontSize: '14px' }}>ana@fisiotool.com</p>
            <p style={{ fontSize: '14px', color: '#25D366', fontWeight: 800 }}>+34 615 200 612</p>
          </div>
        </div>
      </footer>
    </div>
  )
}