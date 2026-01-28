'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Fingerprint, Database, Cpu, Smartphone, Activity, ShieldAlert,
  AlertTriangle, Lock, Server
} from 'lucide-react';
import RoiSimulator from '../components/RoiSimulator';

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS SUPREME (BLINDADOS)
// ==========================================
const styles = {
  pageContainer: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '15px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.9)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 } as React.CSSProperties,
  logoTextStyle: { fontWeight: 900, fontSize: '18px', letterSpacing: '-1px', whiteSpace: 'nowrap' } as React.CSSProperties,
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' } as React.CSSProperties,
  linkStyle: { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 25px', borderRadius: '100px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  heroSection: { paddingTop: '220px', paddingBottom: '80px', textAlign: 'center', px: '20px', position: 'relative', zIndex: 1 } as React.CSSProperties,
  badgeStyle: { fontSize: '10px', fontWeight: 900, color: '#0066ff', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '4px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 12vw, 130px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as React.CSSProperties,
  heroDescription: { fontSize: '20px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: '#0066ff', color: '#fff', border: 'none', padding: '22px 50px', borderRadius: '18px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)', transition: '0.3s' } as React.CSSProperties,
  
  // --- SEGURIDAD MÉDICA VISIBLE ---
  trustBar: { display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', opacity: 0.4, marginTop: '80px' } as React.CSSProperties,
  trustItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700 } as React.CSSProperties,

  videoBox: { maxWidth: '1100px', margin: '80px auto 0', aspectRatio: '16/9', background: '#000', borderRadius: '50px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 100px 150px -50px rgba(0,0,0,0.8)' } as React.CSSProperties,
  videoOverlay: { position: 'absolute', inset: 0, background: 'rgba(2,3,5,0.3)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  videoText: { marginTop: '30px', fontWeight: 900, letterSpacing: '4px', fontSize: '14px', opacity: 0.5 } as React.CSSProperties,
  btnGhost: { background: 'none', border: 'none', color: '#0066ff', fontWeight: 900, fontSize: '14px', marginTop: '40px', cursor: 'pointer', letterSpacing: '2px', textTransform: 'uppercase' } as React.CSSProperties,
  
  sectionPadding: { padding: '150px 6%', position: 'relative', zIndex: 1 } as React.CSSProperties,
  gridDolores: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1300px', margin: '0 auto' } as React.CSSProperties,
  painCard: { padding: '60px 50px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', textAlign: 'left' } as React.CSSProperties,
  iconBoxStyle: { width: '55px', height: '55px', background: 'rgba(255,255,255,0.03)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  roiBg: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  secTitle: { fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '80px', letterSpacing: '-2px' } as React.CSSProperties,
  
  // --- SUSCRIPCIÓN ASIMÉTRICA ---
  asymmetricGrid: { display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '100px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' } as React.CSSProperties,
  pricingTextSide: { textAlign: 'left' } as React.CSSProperties,
  pricingSideTitle: { fontSize: '56px', fontWeight: 900, lineHeight: '1', marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  pricingSideDesc: { fontSize: '19px', opacity: 0.4, lineHeight: '1.8', marginBottom: '40px' } as React.CSSProperties,
  activationCard: { background: 'rgba(0,102,255,0.02)', border: '1px solid #0066ff33', borderRadius: '48px', padding: '60px', textAlign: 'left', position: 'relative', boxShadow: '0 80px 150px -50px rgba(0,102,255,0.2)' } as React.CSSProperties,
  priceTag: { fontSize: '90px', fontWeight: 900, color: '#0066ff', marginBottom: '10px' } as React.CSSProperties,
  btnActivate: { background: '#0066ff', color: '#fff', border: 'none', padding: '22px 40px', borderRadius: '18px', fontWeight: 900, fontSize: '18px', cursor: 'pointer', width: '100%', marginTop: '30px', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' } as React.CSSProperties,

  // --- FAQ ESTILO LINEAR ---
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  faqCardFixed: { background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', textAlign: 'left' } as React.CSSProperties,
  faqQ: { fontSize: '20px', fontWeight: 800, marginBottom: '15px', color: '#fff' } as React.CSSProperties,
  faqA: { fontSize: '15px', opacity: 0.4, lineHeight: '1.7' } as React.CSSProperties,
  
  technicalVisual: { width: '100%', height: '100%', minHeight: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  dotsGrid: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,102,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' } as React.CSSProperties,

  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  copyrightText: { textAlign: 'center', fontSize: '11px', opacity: 0.1, fontWeight: 800, letterSpacing: '5px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '60px' } as React.CSSProperties,
};

// --- COMPONENTES AUXILIARES ---
function PainCard({icon, title, text}: any) {
  return (
    <motion.div whileHover={{ y: -10 }} style={styles.painCard}>
      <div style={styles.iconBoxStyle}>{icon}</div>
      <h4 style={{fontSize: '24px', fontWeight: 800, margin: '20px 0', letterSpacing: '-0.5px'}}>{title}</h4>
      <p style={{fontSize: '16px', opacity: 0.5, lineHeight: '1.7'}}>{text}</p>
    </motion.div>
  );
}

function Virtue({text}: any) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize:'15px', color:'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
      <CheckCircle2 size={16} color="#10b981" /> {text}
    </div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL (PURA INGENIERÍA)
// ==========================================
export default function Page() {
  const { scrollYProgress } = useScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div style={styles.pageContainer}>
      {/* 1. FONDO DINÁMICO REACCIONAL */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0, 102, 255, 0.08) 0%, transparent 70%)', backgroundColor: '#020305' }} />

      {/* --- NAVBAR --- */}
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

      {/* --- HERO SECTION --- */}
      <motion.header style={{ ...styles.heroSection, opacity: opacityHero }}>
        <div style={styles.badgeStyle}>SOBERANÍA CLÍNICA TOTAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>un Ferrari.</span></h1>
        <p style={styles.heroDescription}>Ana es la Inteligencia Conductual que blinda tu agenda, elimina tus No-Shows y recupera tu tiempo de vida.</p>
        <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI MES GRATIS ➜</button>

        {/* TRUST BAR: SEGURIDAD MÉDICA */}
        <div style={styles.trustBar}>
           <div style={styles.trustItem}><Lock size={14} color="#0066ff"/> Cifrado AES-256 Salud</div>
           <div style={styles.trustItem}><Server size={14} color="#0066ff"/> Servidores UE (Bélgica)</div>
           <div style={styles.trustItem}><ShieldCheck size={14} color="#0066ff"/> Protocolo DPA GDPR</div>
        </div>
      </motion.header>

      {/* --- VIDEO: AUTORIDAD --- */}
      <section id="experiencia" style={styles.sectionPadding}>
        <div style={styles.videoBox}>
           <div style={styles.videoOverlay}>
              <Play size={100} color="#fff" style={{ opacity: 0.15 }} />
              <div style={styles.videoText}>TESTIMONIO REAL: CÓMO RECUPERAR 5H A LA SEMANA</div>
           </div>
           <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070" style={{width:'100%', height:'100%', objectFit:'cover', opacity:0.4}} alt="Clínica" />
        </div>
        <div style={{textAlign:'center'}}><button style={styles.btnGhost}>VER MÁS TESTIMONIOS</button></div>
      </section>

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
        <h2 style={styles.secTitle}>Mide el ahorro de tu nueva oficina virtual</h2>
        <RoiSimulator />
      </section>

      {/* --- 💎 LICENCIA SUPREME (ASIMÉTRICA) --- */}
      <section id="licencia" style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
          <div style={styles.pricingTextSide}>
            <div style={{fontSize:'10px', fontWeight:900, color:'#0066ff', letterSpacing:'2px', marginBottom:'20px'}}>INVERSIÓN ESTRATÉGICA</div>
            <h2 style={styles.pricingSideTitle}>No es un gasto. Es tu <span style={{color: '#0066ff'}}>Directora de Operaciones.</span></h2>
            <p style={styles.pricingSideDesc}>Mientras otras clínicas queman miles de euros en administración ineficiente, tú activas una mente suprema por el coste de una sola fianza recuperada al mes.</p>
            <div style={styles.stampBadge}><ShieldCheck size={16} /> Certificado de Seguridad Grado Salud</div>
          </div>
          <div style={styles.activationCard}>
             <div style={styles.priceTag}>100€<small style={{fontSize:'22px', opacity:0.3}}>/mes</small></div>
             <div style={{marginTop:'40px'}}>
               <Virtue text="IA Ana 2.5 Flash (Voz y Chat)" />
               <Virtue text="Blindaje Total Anti No-Show" />
               <Virtue text="Historial Clínico por Voz" />
               <Virtue text="Inclusión 100% para Invidentes" />
             </div>
             <button onClick={() => window.location.href='/setup'} style={styles.btnActivate}>RECLAMAR MI SOBERANÍA ➜</button>
          </div>
        </div>
      </section>

      {/* --- ⚙️ FAQ BLOQUE 1: TEXTO IZQUIERDA (Técnico) --- */}
      <section style={styles.sectionPadding}>
        <div style={styles.asymmetricGrid}>
           <div style={{textAlign:'left'}}>
              <small style={{fontSize:'10px', fontWeight:900, color:'#0066ff', letterSpacing:'4px'}}>UNDER THE HOOD</small>
              <h2 style={{fontSize:'56px', fontWeight:900, margin:'30px 0', letterSpacing:'-3px'}}>Ingeniería de <br />confianza.</h2>
              <p style={{fontSize:'18px', opacity:0.4, lineHeight:'1.7'}}>FisioTool Pro no solo gestiona; blinda cada dato bajo estándares militares.</p>
           </div>
           <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
              <div style={styles.faqCardFixed}>
                 <h5 style={styles.faqQ}><ShieldAlert size={18} color="#0066ff" style={{marginRight:'10px'}}/> ¿Cómo funcionan las Banderas Rojas?</h5>
                 <p style={styles.faqA}>Ana realiza un triaje inteligente. Si detecta casos especiales como tráfico o bebés, bloquea la cita y deriva a tu teléfono personal para una valoración manual.</p>
              </div>
              <div style={styles.faqCardFixed}>
                 <h5 style={styles.faqQ}><Smartphone size={18} color="#0066ff" style={{marginRight:'10px'}}/> ¿Cómo recibo mis ingresos?</h5>
                 <p style={styles.faqA}>Tú eliges el carril: Stripe automático para cobros instantáneos o Bizum para trato directo. Ana adapta su discurso a tu configuración soberana.</p>
              </div>
           </div>
        </div>
      </section>

      {/* --- ⚙️ FAQ BLOQUE 2: TEXTO DERECHA (Negocio) --- */}
      <section style={{...styles.sectionPadding, background:'rgba(255,255,255,0.01)'}}>
        <div style={styles.asymmetricGrid}>
           <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
              <div style={styles.faqCardFixed}>
                 <h5 style={styles.faqQ}><Mic size={18} color="#10b981" style={{marginRight:'10px'}}/> ¿Qué es el historial por voz?</h5>
                 <p style={styles.faqA}>Dictas la evolución clínica al terminar y Ana la transcribe y guarda en la ficha al instante. Adiós al teclado tras 8 horas de pie.</p>
              </div>
              <div style={styles.faqCardFixed}>
                 <h5 style={styles.faqQ}><Zap size={18} color="#10b981" style={{marginRight:'10px'}}/> ¿Ana reactiva pacientes?</h5>
                 <p style={styles.faqA}>Ana analiza quién lleva meses sin venir y lanza campañas de WhatsApp automáticas para recuperar el vínculo con tus antiguos clientes.</p>
              </div>
           </div>
           <div style={{textAlign:'right'}}>
              <small style={{fontSize:'10px', fontWeight:900, color:'#10b981', letterSpacing:'4px'}}>GLOBAL ENGINE</small>
              <h2 style={{fontSize:'56px', fontWeight:900, margin:'30px 0', letterSpacing:'-3px'}}>Diseñado para <br />el crecimiento.</h2>
              <p style={{fontSize:'18px', opacity:0.4, lineHeight:'1.7'}}>Recupera tu tiempo de vida mientras tu clínica escala de forma fluida.</p>
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
            <p style={{fontSize:'14px', opacity:0.3, marginTop:'20px', lineHeight:'1.8'}}>El motor definitivo para tu éxito clínico. 2026 Reservados todos los derechos.</p>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>LEGAL</p>
             <a href="/rgpd" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none', marginBottom:'10px'}}>Privacidad RGPD</a>
             <a href="/terminos" style={{display:'block', color:'rgba(255,255,255,0.4)', textDecoration:'none'}}>Términos</a>
          </div>
          <div>
             <p style={{fontSize:'12px', fontWeight:900, color:'#0066ff', letterSpacing:'3px', marginBottom:'20px'}}>CONTACTO</p>
             <p style={{color:'#fff', fontSize:'14px', marginBottom:'10px'}}>ana@fisiotool.com</p>
             <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#25D366', fontWeight:800}}>
                <MessageCircle size={18}/> +34 615 200 612
             </div>
          </div>
        </div>
        <p style={styles.copyrightText}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
}