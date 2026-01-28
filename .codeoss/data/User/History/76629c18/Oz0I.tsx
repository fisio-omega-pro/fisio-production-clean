'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, Sparkles, CheckCircle2, BadgeEuro, Play, Mic, MessageCircle
} from 'lucide-react';
import RoiSimulator from '../../components/RoiSimulator';

// ==========================================
// 🚀 MOTOR DE INTELIGENCIA SENSORIAL (V12)
// ==========================================

export default function Page() {
  const [experienceStarted, setExperienceStarted] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const bloques = [
    {
      id: "friction",
      titulo: "El Fin de la Barrera Digital",
      texto: "Imagina que ya no tienes que pelearte con la pantalla del móvil para responder WhatsApps o confirmar citas. Ana es una inteligencia de élite que entiende la psicología de tus pacientes. Ella atiende el 100% de tus mensajes 24/7. Reconoce a tus clientes habituales por su nombre y les da un trato maravilloso, mientras tú estás tratando a un paciente. Tú no ves el chat, pero Ana sí, y ella se encarga de que tu agenda esté siempre llena."
    },
    {
      id: "sovereignty",
      titulo: "Soberanía Táctil",
      texto: "No hemos adaptado una app para ti; la hemos construido desde el suelo pensando en tus oídos. El Dashboard te narra cada movimiento. Al entrar, Ana te dirá: 'Tienes 4 citas hoy, 3 están confirmadas y pagadas'. Puedes navegar por toda la herramienta usando solo el teclado. Cada vez que selecciones una sección, el sistema te confirmará dónde estás. Tienes el control absoluto de tu negocio sin depender de que alguien te lea la pantalla."
    },
    {
      id: "keyboard",
      titulo: "El Adiós al Teclado",
      texto: "Sabemos que después de 8 horas de consulta, lo último que quieres es sentarte a teclear informes. Con FisioTool, simplemente activas el micrófono y le dictas a Ana la evolución del paciente. Ella transcribe con precisión médica y lo guarda directamente en su ficha. Es 'manos libres' real. Tu historial médico se construye mientras hablas."
    },
    {
      id: "shield",
      titulo: "Blindaje Financiero",
      texto: "Olvídate de perseguir pagos o de perder dinero porque alguien no se presentó. Ana exige una fianza automática antes de confirmar cualquier hueco. Si no pagan en 12 horas, el Centinela libera el hueco y te avisa al oído: 'Cita de las diez cancelada por impago, hueco libre'. Tú solo te preocupas de tratar; el dinero de las señales aparece en tu cuenta sin que muevas un dedo."
    },
    {
      id: "thief",
      titulo: "El Valor del Ladrón Invisible",
      texto: "¿Sabes cuánto dinero estás perdiendo al año por cancelaciones o por el tiempo que pasas gestionando? Ana te lo dirá. Tenemos un simulador que te canta los números: 'Este mes has recuperado 600 euros que antes se quemaban en no-shows'. Por solo 100 euros al mes, tienes a una Directora de Operaciones que se paga sola con la primera fianza que rescata."
    }
  ];

  // --- FUNCIÓN NARRADORA ---
  const narrar = (texto: string, callback?: () => void) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-ES';
      msg.rate = 0.95;
      msg.onend = () => { if (callback) callback(); };
      window.speechSynthesis.speak(msg);
    }
  };

  // --- RECONOCIMIENTO DE VOZ (COMANDOS) ---
  const escucharComando = () => {
    if (!('webkitSpeechRecognition' in window)) {
        setTimeout(() => setCurrentBlock(prev => prev + 1), 2000);
        return;
    }
    
    setIsListening(true);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Comando recibido:", command);
      if (command.includes("sí") || command.includes("si") || command.includes("contratar")) {
        narrar("Entendido. Dirigiéndote a la zona de activación.");
        footerRef.current?.scrollIntoView({ behavior: 'smooth' });
        setCurrentBlock(100); // Para la narración
      } else {
        setCurrentBlock(prev => prev + 1);
      }
    };

    recognition.onerror = () => setCurrentBlock(prev => prev + 1);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    if (experienceStarted && currentBlock >= 0 && currentBlock < bloques.length) {
      const b = bloques[currentBlock];
      document.getElementById(b.id)?.scrollIntoView({ behavior: 'smooth' });
      narrar(`${b.titulo}. ${b.texto}. ¿Deseas contratar ahora?`, () => {
        escucharComando();
      });
    }
  }, [currentBlock, experienceStarted]);

  return (
    <div style={styles.container}>
      <div style={styles.glowCyan} />
      
      {/* PANTALLA INICIAL (ÚNICO CLIC DE PERMISO) */}
      <AnimatePresence>
        {!experienceStarted && (
          <motion.div exit={{ opacity: 0 }} style={styles.overlay}>
            <div style={styles.welcomeCard}>
              <Volume2 size={64} color="#0066ff" style={{marginBottom: '20px'}} />
              <h2 style={{fontSize: '32px', fontWeight: 900}}>FisioTool Sovereign</h2>
              <p style={{opacity: 0.6, marginBottom: '40px'}}>Haz clic para activar la experiencia audible guiada por Ana.</p>
              <button 
                style={styles.btnMain} 
                onClick={() => { setExperienceStarted(true); setCurrentBlock(0); }}
              >
                ENTRAR A MI CLÍNICA ➜
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav style={styles.navbar}>
        <span style={styles.logoText}>FISIOTOOL <span style={{color:'#0066ff'}}>SOVEREIGN</span></span>
        {isListening && <div style={listeningBadge}><Mic size={14} className="animate-pulse" /> ESCUCHANDO...</div>}
      </nav>

      {/* SECCIONES NARRATIVAS (SIN BOTONES) */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <header id="hero" style={styles.hero}>
          <h1 style={styles.mainTitle}>Tu talento merece <br /><span style={styles.gradientText}>Soberanía.</span></h1>
          <p style={styles.desc}>Una experiencia diseñada exclusivamente para el oído.</p>
        </header>

        {bloques.map((b) => (
          <section key={b.id} id={b.id} style={styles.section}>
            <div style={styles.contentBlock}>
              <h2 style={styles.h2}>{b.titulo}</h2>
              <p style={styles.p}>{b.texto}</p>
            </div>
          </section>
        ))}

        {/* CALCULADORA ROI (VISIBLE PERO NARRADA EN EL BLOQUE 5) */}
        <section id="roi" style={styles.roiSection}>
           <RoiSimulator />
        </section>

        {/* ÚNICO BOTÓN FINAL DE CONTRATACIÓN */}
        <footer ref={footerRef} id="licencia" style={styles.footer}>
          <div style={styles.pricingCard}>
            <BadgeEuro size={64} color="#0066ff" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontSize: '64px', fontWeight: 900 }}>100€ <small style={{ fontSize: '24px', opacity: 0.3 }}>/ mes</small></h2>
            <p style={{ fontSize: '20px', opacity: 0.6, marginBottom: '40px' }}>Tu nueva Directora de Operaciones 24/7</p>
            <button onClick={() => window.location.href='/setup'} style={styles.btnMain}>
              ACTIVAR MI SOBERANÍA AHORA ➜
            </button>
          </div>
          <p style={{ marginTop: '100px', opacity: 0.2, fontSize: '11px', letterSpacing: '4px' }}>© FISIOTOOL 2026 — TODOS LOS DERECHOS RESERVADOS</p>
        </footer>
      </main>
    </div>
  );
}

// --- ESTILOS SOBERANOS ---
const styles = {
  container: { backgroundColor: '#020305', minHeight: '100vh', color: '#fff', fontFamily: '"Inter", sans-serif', position: 'relative', overflowX: 'hidden' } as React.CSSProperties,
  overlay: { position: 'fixed', inset: 0, zIndex: 5000, background: '#020305', display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties,
  welcomeCard: { maxWidth: '500px', textAlign: 'center', padding: '40px' } as React.CSSProperties,
  navbar: { position: 'fixed', top: 0, width: '100%', padding: '20px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,3,5,0.8)', backdropFilter: 'blur(20px)', zIndex: 1000 } as React.CSSProperties,
  logoText: { fontWeight: 900, fontSize: '20px', letterSpacing: '-1.5px' } as React.CSSProperties,
  hero: { paddingTop: '250px', paddingBottom: '150px', textAlign: 'center' } as React.CSSProperties,
  mainTitle: { fontSize: 'clamp(50px, 10vw, 120px)', fontWeight: 900, letterSpacing: '-0.07em', lineHeight: '0.8', marginBottom: '50px' } as React.CSSProperties,
  gradientText: { color: '#0066ff' } as React.CSSProperties,
  desc: { fontSize: '22px', color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto' } as React.CSSProperties,
  section: { padding: '150px 8%', minHeight: '100vh', display: 'flex', alignItems: 'center' } as React.CSSProperties,
  contentBlock: { maxWidth: '900px', margin: '0 auto' } as React.CSSProperties,
  h2: { fontSize: '56px', fontWeight: 900, marginBottom: '30px', letterSpacing: '-3px' } as React.CSSProperties,
  p: { fontSize: '24px', opacity: 0.6, lineHeight: '1.6' } as React.CSSProperties,
  roiSection: { padding: '150px 20px', background: 'rgba(255,255,255,0.01)' } as React.CSSProperties,
  btnMain: { background: '#0066ff', color: '#fff', border: 'none', padding: '25px 60px', borderRadius: '20px', fontWeight: 900, fontSize: '20px', cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,102,255,0.3)' } as React.CSSProperties,
  pricingCard: { maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '60px', padding: '80px 40px', textAlign: 'center' } as React.CSSProperties,
  footer: { padding: '150px 8% 60px', background: '#010204', textAlign: 'center' } as React.CSSProperties,
  glowCyan: { position: 'absolute', top: 0, left: 0, width: '100%', height: '800px', background: 'radial-gradient(circle at 10% 10%, rgba(0,102,255,0.1) 0%, transparent 70%)', zIndex: 0 } as React.CSSProperties,
};

const listeningBadge: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239,68,68,0.2)' };