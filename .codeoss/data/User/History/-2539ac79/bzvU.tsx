'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Smartphone, Activity, 
  ShieldAlert, Lock, FileText, Server, AlertTriangle
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS SUPREME (V12)
// ==========================================
const S = {
  container: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.85)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 2000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px', flexShrink: 0 } as React.CSSProperties,
  logoText: { fontWeight: 900, fontSize: '18px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' } as React.CSSProperties,
  link: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 20px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  hero: { paddingTop: '220px', paddingBottom: '120px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badge: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDesc: { fontSize: '20px', color: 'rgba(255,255,255,0.4)', maxWidth: '750px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: 'linear-gradient(180deg, #0066ff 0%, #0044cc 100%)', color: '#fff', border: 'none', padding: '22px 55px', borderRadius: '20px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' } as React.CSSProperties,
  videoBox: { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoText: { position: 'absolute', bottom: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '12px', opacity: 0.3 } as React.CSSProperties,
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  painGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
  painCard: { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  iconBox: { width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' } as React.CSSProperties,
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '100px', alignItems: 'center', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
  pricingTextSide: { textAlign: 'left' } as React.CSSProperties,
  priceSideTitle: { fontSize: '56px', fontWeight: 900, lineHeight: '1.1', marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  priceSideDesc: { fontSize: '18px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  priceTag: { fontSize: '90px', fontWeight: 900, color: '#0066ff', marginBottom: '10px' } as React.CSSProperties,
  activationCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px', padding: '60px', textAlign: 'left', boxShadow: '0 80px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  faqAsymmetric: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' } as React.CSSProperties,
  technicalBox: { width: '100%', height: '450px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  faqCard: { background: 'rgba(255,255,255,0.015)', padding: '35px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' } as React.CSSProperties,
  footer: { padding: '120px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  footerGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', maxWidth: '1400px', margin: '0 auto 100px' } as React.CSSProperties,
};

// --- SUB-COMPONENTES ---
function PainCard({icon, title, text}: any) {
  return (
    <div style={S.painCard}>
      <div style={S.iconBox}>{icon}</div>
      <h4 style={{fontSize: '22px', fontWeight: 800, margin: '15px 0'}}>{title}</h4>
      <p style={{fontSize: '15px', opacity: 0.5, lineHeight: '1.6'}}>{text}</p>
    </div>
  );
}

function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'14px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

function FaqBlock({ q, a }: { q: string, a: string }) {
  return (
    <div style={S.faqCard}>
      <h5 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '15px', color: '#0066ff' }}>{q}</h5>
      <p style={{ fontSize: '15px', opacity: 0.4, lineHeight: '1.7', margin: 0 }}>{a}</p>
    </div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL (473 LÍNEAS)
// ==========================================
export default function Page() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={S.container}>
      {/* FONDO INTERACTIVO */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.12) 0%, transparent 40%)`, backgroundColor: '#020305' }} />

      {/* --- NAVBAR --- */}
      <nav style={S.navbar}>
        <div style={S.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={S.logoText}>FISIOTOOL <span style={{color: '#0066ff', fontWeight: 400}}>PRO</span></span>
        </div>
        <div style={S.navLinks}>
          <a href="#roi" style={S.link}>Impacto</a>
          <a href="#licencia" style={S.link}>Licencia</a>
          <a href="#ingenieria" style={S.link}>Ingeniería</a>
          <button onClick={() => window.location.href='/login'} style={S.loginBtn}>ACCESO ÉLITE</button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <motion.header style={{ ...S.hero, opacity: opacityHero }}>
        <div style={S.badge}><Sparkles size={14} /> SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={S.mainTitle}>Tu talento merece <br /><span style={S.gradientText}>un Ferrari.</span></h1>
        <p style={S.heroDesc}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={S.btnMain}>RECLAMAR MI MES GRATIS ➜</button>
        <div id="experiencia" style={S.videoBox}>
           <div style={S.videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={S.videoText}>TESTIMONIO REAL: DR. MURILLO</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="Clínica" />
        </div>
        <button style={{ ...S.link, marginTop: '40px', background: 'none', border: 'none', cursor: 'pointer' }}>VER MÁS TESTIMONIOS</button>
      </motion.header>

      {/* --- SEGURIDAD MÉDICA --- */}
      <section style={{ ...S.sectionPadding, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '40px', background: 'rgba(255,255,255,0.02)', padding: '25px 50px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 800, opacity: 0.5 }}><ShieldCheck color="#0066ff" size={16}/> AES-256 ENCRYPT</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 800, opacity: 0.5 }}><Lock color="#0066ff" size={16}/> DPA SALUD UE</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 800, opacity: 0.5 }}><Server color="#0066ff" size={16}/> REGIÓN BÉLGICA</div>
        </div>
      </section>

      {/* --- DOLORES --- */}
      <section style={S.sectionPadding}>
        <div style={S.painGrid}>
          <PainCard icon={<AlertCircle color="#ef4444" />} title="Dinero Quemado" text="Cada no-show es el alquiler pagándose con aire. Ana exige fianza automática para blindar tus ingresos." />
          <PainCard icon={<Mic color="#0066ff" />} title="Fin del Teclado" text="No teclees tras 8h de pie. Dicta la evolución y Ana redacta el informe clínico con precisión de especialista." />
          <PainCard icon={<TrendingUp color="#10b981" />} title="Fuga Silenciosa" text="Recupera a los pacientes que te olvidaron. Ana detecta la inactividad y los reactiva por WhatsApp." />
        </div>
      </section>

      {/* --- IMPACTO (ROI) --- */}
      <section id="roi" style={S.roiBg}>
        <h2 style={S.secTitle}>¿Cuánto dinero te está robando tu agenda?</h2>
        <RoiSimulator />
      </section>

      {/* --- LICENCIA (ASIMÉTRICA) --- */}
      <section id="licencia" style={S.sectionPadding}>
        <div style={S.asymmetricGrid}>
          <div style={S.pricingTextSide}>
            <small style={S.badge}>INVERSIÓN ESTRATÉGICA</small>
            <h2 style={S.priceSideTitle}>No es un gasto. Es tu nueva <span style={{color:'#0066ff'}}>Directora de Op.</span></h2>
            <p style={S.priceSideDesc}>Mientras otros queman miles de euros en gestión ineficiente, tú activas una mente suprema por el valor de una sola fianza recuperada.</p>
            <div style={S.priceTag}>100€<small style={{fontSize:'24px', opacity:0.3, color:'#fff'}}>/mes</small></div>
          </div>
          <div style={S.activationCard}>
             <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
               <Virtue text="IA Ana 2.5 Flash (Cerebro 24/7)" />
               <Virtue text="Escudo Anti No-Show Automático" />
               <Virtue text="Historial Médico por Voz" />
               <Virtue text="Gestión Multi-Sede y CRM" />
               <Virtue text="Inclusión 100% para Invidentes" />
               <Virtue text="Consultoría Estratégica Ana" />
             </div>
             <button onClick={() => window.location.href='/setup'} style={S.btnActivate}>ACTIVAR MI SOBERANÍA ➜</button>
          </div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 1: TÉCNICO (Texto Izquierda) --- */}
      <section id="ingenieria" style={S.sectionPadding}>
        <div style={S.faqAsymmetric}>
          <div style={S.faqTextSide}>
             <div style={S.dotsDecoration} />
             <small style={S.badge}>INGENIERÍA</small>
             <h2 style={{...S.h2, marginBottom: '40px'}}>Confianza <br />blindada.</h2>
             <FaqBlock q="¿Cómo funcionan las Banderas Rojas?" a="Ana realiza un triaje clínico inteligente. Casos de tráfico, suelo pélvico o bebés bloquean la cita automática y derivan a tu teléfono personal." />
             <FaqBlock q="¿Cómo recibo mis ingresos?" a="Soberanía total. Activa Stripe para automatización total, Bizum para trato directo o Efectivo en clínica. Tú eliges cómo cobrar." />
             <FaqBlock q="¿Tengo que cobrar fianza?" a="No es obligatorio. FisioTool te da el mando. Puedes blindar huecos con fianza o permitir reserva gratuita según el perfil del paciente." />
             <FaqBlock q="¿Qué es el historial por voz?" a="Ahorro de 1h/día. Dictas la evolución al terminar y Ana la transcribe y guarda en la ficha médica al instante. Adiós al teclado." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             <div style={S.technicalBox}>
                <Fingerprint size={80} color="#0066ff" opacity={0.4} />
                <div style={{width:'60%', height:'1px', background:'linear-gradient(90deg, #0066ff, transparent)', marginTop:'40px'}} />
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'20px'}}>SECURE_HEALTH_PROTOCOL_v2.5</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- FAQ BLOQUE 2: NEGOCIO (Texto Derecha) --- */}
      <section style={{...S.sectionPadding, background:'rgba(255,255,255,0.01)'}}>
        <div style={S.faqAsymmetric}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
             <div style={S.technicalBox}>
                <Database size={80} color="#10b981" opacity={0.4} />
                <div style={{width:'40%', height:'1px', background:'linear-gradient(90deg, #10b981, transparent)', marginTop:'40px'}} />
                <p style={{fontSize:'10px', opacity:0.3, fontWeight:800, marginTop:'20px'}}>GLOBAL_SYNC_ENGINE</p>
             </div>
          </div>
          <div style={S.faqTextSide}>
             <small style={{...S.badge, color:'#10b981'}}>CRECIMIENTO</small>
             <h2 style={{...S.h2, marginBottom: '40px'}}>Soberanía <br />de datos.</h2>
             <FaqBlock q="¿Puedo importar mis pacientes?" a="Motor CSV incluido. Ana reconocerá a tus pacientes habituales por su nombre desde el primer saludo, eliminando fricciones." />
             <FaqBlock q="¿Ana reactiva antiguos pacientes?" a="Exacto. Ana detecta la inactividad y lanza campañas de WhatsApp para recuperar el vínculo con tus clientes y llenar tu agenda." />
             <FaqBlock q="¿Soporta varias clínicas?" a="FisioTool es multi-sede. Gestiona todos tus centros, equipos y agendas desde un solo panel de mando centralizado." />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={S.footer}>
        <div style={S.footerGrid}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={S.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={S.logoText}>FISIOTOOL</span>
            </div>
            <p style={{fontSize:'14px', opacity:0.3, marginTop:'20px', lineHeight:'1.8', maxWidth: '350px'}}>El motor definitivo para el fisioterapeuta del siglo XXI. Diseñado para el talento, no para la vista.</p>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'25px'}}>SERVICIOS</p>
             <Link href="/devolucion" style={S.link}>Devolución</Link><br/><br/>
             <Link href="/garantia" style={S.link}>Garantía</Link><br/><br/>
             <Link href="/pagos" style={S.link}>Formas de Pago</Link>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'25px'}}>LEGAL</p>
             <Link href="/condiciones" style={S.link}>Condiciones</Link><br/><br/>
             <Link href="/privacidad" style={S.link}>Privacidad</Link><br/><br/>
             <Link href="/cookies" style={S.link}>Cookies</Link>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'25px'}}>CONTACTO</p>
             <p style={{fontSize:'14px'}}>ana@fisiotool.com</p>
             <p style={{color:'#25D366', fontWeight:800, fontSize:'14px', display:'flex', alignItems:'center', gap:'8px'}}><MessageCircle size={14}/> +34 615 200 612</p>
          </div>
        </div>
        <p style={S.copyrightText}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
}