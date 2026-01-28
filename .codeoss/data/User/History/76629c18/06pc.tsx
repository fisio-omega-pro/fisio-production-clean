'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Play, Sparkles, ShieldCheck, 
  Clock, TrendingUp, Users, Volume2, Zap, 
  AlertCircle, CheckCircle2, BadgeEuro, 
  ChevronDown, Mic, Mail, Globe, MessageCircle,
  Smartphone, MousePointer2, Heart, Gift, Copy
} from 'lucide-react';
import RoiSimulator from '../../components/RoiSimulator';

// ==========================================
// 🎨 ARQUITECTURA DE ESTILOS "SOVEREIGN"
// ==========================================
const styles = {
  container: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.8)', backdropFilter: 'blur(25px)', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 1000, boxSizing: 'border-box' } as React.CSSProperties,
  logoWrapper: { display: 'flex', alignItems: 'center', gap: '15px' } as React.CSSProperties,
  logoText: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px', whiteSpace: 'nowrap' } as React.CSSProperties,
  loginBtn: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,102,255,0.3)', color: '#0066ff', padding: '10px 25px', borderRadius: '100px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(2,3,5,0.98)', backdropFilter: 'blur(30px)', display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties,
  welcomeCard: { maxWidth: '500px', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' } as React.CSSProperties,
  section: { padding: '150px 8%', position: 'relative', zIndex: 1, textAlign: 'left' } as React.CSSProperties,
  hero: { paddingTop: '250px', paddingBottom: '150px', textAlign: 'center', px: '20px' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(40px, 10vw, 110px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { color: '#0066ff' } as React.CSSProperties,
  desc: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto 60px', lineHeight: '1.6' } as React.CSSProperties,
  btnMain: { background: '#0066ff', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' } as React.CSSProperties,
  contentBlock: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' } as React.CSSProperties,
  textSide: { display: 'flex', flexDirection: 'column', gap: '30px' } as React.CSSProperties,
  h2: { fontSize: '56px', fontWeight: 900, lineHeight: '1', letterSpacing: '-3px' } as React.CSSProperties,
  p: { fontSize: '20px', opacity: 0.5, lineHeight: '1.7' } as React.CSSProperties,
  visualSide: { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '50px', height: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' } as React.CSSProperties,
  roiSection: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '100px', margin: '0 4%', border: '1px solid rgba(255,255,255,0.03)' } as React.CSSProperties,
  pricingCard: { maxWidth: '850px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,102,255,0.2)', borderRadius: '60px', padding: '80px 60px', textAlign: 'center', boxShadow: '0 80px 150px rgba(0,0,0,0.6)' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', borderTop: '1px solid rgba(255,255,255,0.05)' } as React.CSSProperties,
  glowCyan: { position: 'absolute', top: 0, left: 0, width: '100%', height: '800px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.1) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
};

// --- COMPONENTES AUXILIARES ---
function SectionTitle({ badge, title }: { badge: string, title: string }) {
  return (
    <div style={{ marginBottom: '30px' }}>
      <small style={{ color: '#0066ff', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>{badge}</small>
      <h2 style={styles.h2}>{title}</h2>
    </div>
  );
}

function CTA({ text, aria }: { text: string, aria: string }) {
  return (
    <button 
      onClick={() => window.location.href='/setup'} 
      onFocus={() => narrar(`Botón: ${aria}`)}
      style={{ ...styles.btnMain, fontSize: '16px', padding: '18px 40px', marginTop: '20px' }}
    >
      {text} ➜
    </button>
  );
}

const narrar = (texto: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'es-ES';
    msg.rate = 0.92;
    window.speechSynthesis.speak(msg);
  }
};

// ==========================================
// 🚀 COMPONENTE PRINCIPAL (468 LÍNEAS)
// ==========================================
export default function AccessPage() {
  const [started, setStarted] = useState(false);
  const [activeBlock, setActiveBlock] = useState("");

  const bloquesNarrativos: any = {
    "friction": "Bloque 1: El Fin de la Barrera Digital. Imagina que ya no tienes que pelearte con la pantalla del móvil para responder WhatsApps o confirmar citas. Ana es una inteligencia de élite que entiende la psicología de tus pacientes. Ella atiende el 100% de tus mensajes 24/7. Reconoce a tus clientes habituales por su nombre y les da un trato maravilloso, mientras tú estás tratando a un paciente. Tú no ves el chat, pero Ana sí, y ella se encarga de que tu agenda esté siempre llena.",
    "sovereignty": "Bloque 2: Soberanía Táctil. No hemos adaptado una app para ti; la hemos construido desde el suelo pensando en tus oídos. El Dashboard te narra cada movimiento. Al entrar, Ana te dirá: 'Tienes 4 citas hoy, 3 están confirmadas y pagadas'. Puedes navegar por toda la herramienta usando solo el teclado. Cada vez que selecciones una sección, el sistema te confirmará dónde estás. Tienes el control absoluto de tu negocio sin depender de que alguien te lea la pantalla.",
    "keyboard": "Bloque 3: El Adiós al Teclado. Sabemos que después de 8 horas de consulta, lo último que quieres es sentarte a teclear informes. Con FisioTool, simplemente activas el micrófono y le dictas a Ana la evolución del paciente. Ella transcribe con precisión médica y lo guarda directamente en su ficha. Es 'manos libres' real. Tu historial médico se construye mientras hablas.",
    "shield": "Bloque 4: Blindaje Financiero. Olvídate de perseguir pagos o de perder dinero porque alguien no se presentó. Ana exige una fianza automática antes de confirmar cualquier hueco. Si no pagan en 12 horas, el Centinela libera el hueco y te avisa al oído: 'Cita de las diez cancelada por impago, hueco libre'. Tú solo te preocupas de tratar; el dinero de las señales aparece en tu cuenta sin que muevas un dedo.",
    "thief": "Bloque 5: El Valor del Ladrón Invisible. ¿Sabes cuánto dinero estás perdiendo al año por cancelaciones o por el tiempo que pasas gestionando? Ana te lo dirá. Tenemos un simulador que te canta los números: 'Este mes has recuperado 600 euros que antes se quemaban en no-shows'. Por solo 100 euros al mes, tienes a una Directora de Operaciones que se paga sola con la primera fianza que rescata."
  };

  useEffect(() => {
    if (!started) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const id = entry.target.id;
          if (id !== activeBlock && bloquesNarrativos[id]) {
            setActiveBlock(id);
            narrar(bloquesNarrativos[id]);
          }
        }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('section').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [started, activeBlock]);

  return (
    <div style={styles.container}>
      <div style={styles.glowCyan} />
      
      {/* GATILLO DE ACTIVACIÓN */}
      <AnimatePresence>
        {!started && (
          <motion.div exit={{ opacity: 0 }} style={styles.overlay}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={styles.welcomeCard}>
              <Volume2 size={64} color="#0066ff" style={{marginBottom: '20px'}} />
              <h2 style={{fontSize: '32px', fontWeight: 900}}>FisioTool Sovereign</h2>
              <p style={{opacity: 0.6, marginBottom: '40px', fontSize: '18px'}}>La primera plataforma diseñada para el talento, no para la vista. Pulsa el botón para activar la narración de Ana.</p>
              <button 
                style={styles.btnMain} 
                onClick={() => { setStarted(true); narrar("Experiencia activada. Bienvenido profesional de élite. Soy Ana, tu nueva secretaria inteligente. Haz scroll para conocer tu nueva libertad."); }}
              >
                ACTIVAR MI SOBERANÍA 🏎️
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logoWrapper}>
          <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '32px' }} />
          <span style={styles.logoText}>FISIOTOOL <span style={{color: '#0066ff'}}>SOVEREIGN</span></span>
        </div>
        <button onClick={() => window.location.href='/login'} style={styles.loginBtn}>MI CLÍNICA</button>
      </nav>

      {/* HERO */}
      <header id="hero" style={styles.hero}>
        <div style={{ fontSize: '10px', fontWeight: 900, color: '#0066ff', letterSpacing: '5px', marginBottom: '30px' }}>INCLUSIÓN RADICAL</div>
        <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>Soberanía.</span></h1>
        <p style={styles.desc}>Una herramienta de ingeniería superior para fisioterapeutas que ven con las manos.</p>
        <CTA text="RECLAMAR INVITACIÓN" aria="Reclamar invitación y mes gratuito" />
      </header>

      {/* BLOQUE 1: BARRERA DIGITAL */}
      <section id="friction" style={styles.section}>
        <div style={styles.contentBlock}>
          <div style={styles.textSide}>
            <SectionTitle badge="Secretaría Inteligente" title="Ana: Tu cerebro 24/7" />
            <p style={styles.p}>Imagina que ya no tienes que pelearte con la pantalla del móvil para responder WhatsApps o confirmar citas. Ana atiende el 100% de tus mensajes reconociendo a tus clientes por su nombre.</p>
            <CTA text="PROBAR A ANA" aria="Probar inteligencia conductual de Ana" />
          </div>
          <div style={styles.visualSide}>
            <MessageCircle size={100} color="#0066ff" opacity={0.2} />
            <div style={{ position: 'absolute', bottom: '40px', fontWeight: 800, opacity: 0.3 }}>AI_COMMUNICATION_PROTOCOL</div>
          </div>
        </div>
      </section>

      {/* BLOQUE 2: SOBERANÍA TÁCTIL */}
      <section id="sovereignty" style={{ ...styles.section, background: 'rgba(255,255,255,0.01)' }}>
        <div style={styles.contentBlock}>
          <div style={styles.visualSide}>
            <MousePointer2 size={100} color="#ff00ff" opacity={0.2} />
            <div style={{ position: 'absolute', bottom: '40px', fontWeight: 800, opacity: 0.3 }}>TACTILE_INTERFACE_v1.1</div>
          </div>
          <div style={styles.textSide}>
            <SectionTitle badge="Accesibilidad" title="Tu Dashboard se escucha" />
            <p style={styles.p}>No hemos adaptado una app; la hemos construido para tus oídos. Navega por toda la herramienta usando solo el teclado con confirmación por voz en cada paso.</p>
            <CTA text="VER INTERFAZ" aria="Ver interfaz accesible" />
          </div>
        </div>
      </section>

      {/* BLOQUE 3: ADIÓS AL TECLADO */}
      <section id="keyboard" style={styles.section}>
        <div style={styles.contentBlock}>
          <div style={styles.textSide}>
            <SectionTitle badge="Productividad" title="Manos para curar, voz para escribir" />
            <p style={styles.p}>Activa el micrófono y dicta a Ana la evolución del paciente. Ella transcribe con precisión médica y lo guarda al instante. Es manos libres real.</p>
            <CTA text="DICTAR INFORME" aria="Probar motor de voz a texto" />
          </div>
          <div style={styles.visualSide}>
            <Mic size={100} color="#00f2ff" opacity={0.2} />
            <div style={{ position: 'absolute', bottom: '40px', fontWeight: 800, opacity: 0.3 }}>VOICE_TO_HISTORY_ENGINE</div>
          </div>
        </div>
      </section>

      {/* BLOQUE 4: BLINDAJE FINANCIERO */}
      <section id="shield" style={{ ...styles.section, background: 'rgba(255,255,255,0.01)' }}>
        <div style={styles.contentBlock}>
          <div style={styles.visualSide}>
            <ShieldCheck size={100} color="#10b981" opacity={0.2} />
            <div style={{ position: 'absolute', bottom: '40px', fontWeight: 800, opacity: 0.3 }}>ANTI_NOSHOW_SHIELD</div>
          </div>
          <div style={styles.textSide}>
            <SectionTitle badge="Finanzas" title="Dinero que llega solo" />
            <p style={styles.p}>Olvídate de perseguir pagos. Ana exige fianza automática. Si no pagan en 12 horas, el hueco se libera y el sistema te avisa al oído.</p>
            <CTA text="ACTIVAR COBROS" aria="Configurar pasarela de pagos" />
          </div>
        </div>
      </section>

      {/* BLOQUE 5: LADRÓN INVISIBLE (ROI) */}
      <section id="thief" style={styles.roiSection}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <SectionTitle badge="Rentabilidad" title="Tu rentabilidad en voz alta" />
          <p style={{ ...styles.p, marginBottom: '60px' }}>Usa nuestro simulador y escucha cómo Ana recupera tu dinero.</p>
          <RoiSimulator />
          <div style={{ marginTop: '60px' }}><CTA text="MES GRATIS AHORA" aria="Activar mes gratuito promocional" /></div>
        </div>
      </section>

      {/* LICENCIA FINAL */}
      <section id="licencia" style={styles.section}>
        <div style={styles.pricingCard}>
          <BadgeEuro size={64} color="#0066ff" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '64px', fontWeight: 900 }}>100€ <small style={{ fontSize: '24px', opacity: 0.3 }}>/ mes</small></h2>
          <p style={{ fontSize: '20px', opacity: 0.6, marginBottom: '40px' }}>Tu nueva Directora de Operaciones virtual</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', maxWidth: '600px', margin: '0 auto 40px' }}>
            <div style={{ fontSize: '14px', opacity: 0.7 }}><CheckCircle2 size={14} color="#10b981" /> IA 2.5 Flash 24/7</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}><CheckCircle2 size={14} color="#10b981" /> Accesibilidad Triple A</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}><CheckCircle2 size={14} color="#10b981" /> Escudo Anti No-Show</div>
            <div style={{ fontSize: '14px', opacity: 0.7 }}><CheckCircle2 size={14} color="#10b981" /> Historial por Voz</div>
          </div>
          <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>RECLAMAR MI SOBERANÍA ➜</button>
        </div>
      </section>

      {/* REFERIDOS */}
      <section style={{ padding: '100px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Gift size={40} color="#d4af37" style={{ marginBottom: '20px' }} />
        <h3>Plan Amigo</h3>
        <p style={{ opacity: 0.5 }}>Recomienda FisioTool y ambos recibiréis un 50% de descuento este mes.</p>
      </section>

      <footer id="footer" style={styles.footer}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '80px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={styles.logoWrapper}>
              <img src="/logo_fisiotool.png" alt="Logo" style={{ height: '30px' }} />
              <span style={styles.logoText}>FISIOTOOL</span>
            </div>
            <p style={{ fontSize: '14px', opacity: 0.3, marginTop: '20px', lineHeight: '1.8' }}>El motor definitivo para el fisioterapeuta del siglo 21. Diseñado para el talento.</p>
          </div>
          <div style={styles.textSide}>
            <p style={{ fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px' }}>LEGAL</p>
            <a href="/rgpd" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacidad</a>
            <a href="/terminos" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Términos</a>
          </div>
          <div style={styles.textSide}>
            <p style={{ fontSize: '12px', fontWeight: 900, color: '#0066ff', letterSpacing: '3px' }}>CONTACTO</p>
            <p style={{ color: '#25D366', fontWeight: 800 }}>+34 615 200 612</p>
            <p style={{ opacity: 0.4 }}>ana@fisiotool.com</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', opacity: 0.1, fontWeight: 800, letterSpacing: '5px', marginTop: '80px' }}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
      </footer>
    </div>
  );
}