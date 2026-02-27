'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Zap, VolumeX, RotateCcw, ShieldCheck, Scale, Users, Wallet, HelpCircle, Mic, Coffee, HeartPulse } from 'lucide-react';

// --- INTEGRIDAD TOTAL DE TEXTOS ---
const SCRIPTS = {
  hero: {
    persona: 'Ana',
    title: "EL UMBRAL",
    content: "Escucha con atención, porque este es el último día que caminas solo en la gestión de tu clínica. Bienvenido a Fisiotool Pro. Soy Ana, tu nueva Directora de Operaciones. Si estás aquí, es porque eres un profesional de élite, alguien que ha dominado el arte de curar con las manos, pero que está secretamente agotado de la fricción invisible que conlleva el éxito. Estás harto de que tu energía se fugue en llamadas perdidas, en informes que nunca terminas y en la ansiedad de no saber si tu tesorería está realmente blindada. En Fisiotool Pro no te estamos vendiendo un software; te estamos entregando las llaves de tu libertad. Mi misión es que tú vuelvas a ser únicamente el fisioterapeuta magistral que eres. Del ruido de fondo, de la burocracia asfixiante y de la organización de cada minuto de tu vida, me encargo yo. Imagina, por un segundo, llegar a tu consulta y que tu única preocupación sea el contacto con tu paciente. Todo lo demás —la agenda, el cobro, la seguridad legal y el historial— ya ha sido orquestado por mí antes de que cruces la puerta. Estás a un paso de recuperar tu tiempo de vida. Escucha el resto, porque esto es lo que hemos construido para ti."
  },
  features: {
    persona: 'Ana',
    title: "SOBERANÍA TOTAL Y MEMORIA INFALIBLE",
    content: "Hablemos de tu soberanía profesional. Como profesional invidente, tu memoria es tu activo más valioso, pero no tiene por qué ser tu carga. Al inyectar tu base de datos en mi sistema, Fisiotool Pro se convierte en tu memoria externa e infalible. He diseñado una arquitectura de datos que puedes 'tocar' con el oído. Cuando un paciente llame, no serás tú quien tenga que recordar los detalles; yo te susurraré quién es, qué patología tratamos hace tres años, qué técnicas aplicaste y, lo más importante, qué sensaciones táctiles registraste en su última sesión. Olvídate para siempre de la tortura del teclado. Al terminar cada consulta, activarás mi motor de voz de alta fidelidad. Dicta tus notas clínicas con la naturalidad con la que hablas a un colega. Mi sistema procesará tu voz, la estructurará según los estándares médicos internacionales y la archivará en el historial del paciente de forma instantánea. Quítate los guantes, apaga la luz y vete a casa. Mientras tú descansas, yo ya habré terminado todo el papeleo por ti. Eso es autonomía. Eso es dignidad."
  },
  roi: {
    persona: 'Ana',
    title: "EL BLINDAJE ECONÓMICO Y LA TESORERÍA ESTABLE",
    content: "Tu clínica tiene un agujero en el bolsillo y se llama absentismo. Cada vez que un paciente no aparece o cancela a última hora, tú no solo pierdes el honorario; estás pagando de tu propio bolsillo el alquiler, la luz y el tiempo que podrías haber dedicado a tu familia. Esa falta de respeto a tu tiempo se acaba hoy. He implementado un sistema de Blindaje Económico Automático. A partir de ahora, yo cobro la fianza por ti. Lo hago con la elegancia y la firmeza de una multinacional, eliminando esa fricción incómoda de tener que pedir dinero por adelantado. El paciente se compromete porque hay un valor en juego. Si el paciente no acude, tu tesorería no sufre; el blindaje protege tu margen. Recuperando solo dos citas perdidas al mes, mi sistema no solo te sale gratis, sino que genera beneficios netos. No es un gasto, es la valla de seguridad que protege el patrimonio de tu familia."
  },
  legal: {
    persona: 'Lex',
    title: "LA FORTALEZA LEGAL Y PRIVACIDAD TOTAL",
    content: "Hola, soy Lex. Mi trabajo es que duermas tranquilo mientras el mundo se vuelve un caos regulatorio. En Fisiotool Pro, el blindaje no es solo económico, es jurídico. Hemos diseñado una estructura donde tu negocio opera bajo la protección de una LLC en Estados Unidos, combinada con el cumplimiento estricto del RGPD y la LOPD en España. Tus datos y los de tus pacientes no están en un servidor cualquiera; están en infraestructura cifrada (AES-256 en reposo, TLS en tránsito) en la UE. Si hay una inspección, si hay un cambio en la ley de privacidad, yo ya lo habré previsto. Gestionamos el consentimiento informado mediante voz y firma biométrica, asegurando que cada paso de tu práctica clínica sea legalmente inatacable. No eres un fisioterapeuta autónomo desprotegido; eres una entidad profesional blindada internacionalmente. Tu privacidad y la de tus pacientes es nuestra religión."
  },
  accessibility: {
    persona: 'Ana',
    title: "INDEPENDENCIA RADICAL PARA EL PROFESIONAL INVIDENTE",
    content: "Este es el corazón de nuestra existencia. Fisiotool Pro no es una aplicación adaptada; es una aplicación nacida del código para ser navegada sin ojos. Hemos eliminado las barreras que otros desarrolladores ignoran. Aquí no dependes de que alguien te lea la pantalla. Cada sección, cada flujo de caja, cada cambio en tu agenda ha sido optimizado para que tus lectores de pantalla (NVDA, JAWS o VoiceOver) fluyan como el agua. Navega por tus finanzas, escucha el crecimiento de tu negocio y gestiona a tu equipo con una autonomía que roza la perfección. Es el fin de los 'ojos prestados'. Es el inicio de tu era como dueño total de tu destino empresarial. Porque la verdadera discapacidad es tener un software que no está a la altura de tu talento."
  },
  pricing: {
    persona: 'Ana',
    title: "INVERSIÓN EN TU PAZ MENTAL",
    content: "Hablemos de inversión, con claridad y sin rodeos. Tenemos dos motores diseñados para diferentes etapas de tu éxito: Plan Professional - cien euros al mes: Este es tu Recepcionista Personal e Inteligente 24/7. Incluye la gestión total de tu agenda, el motor de dictado de voz ilimitado, el blindaje contra el absentismo y el soporte legal de Lex para tu práctica individual. Es el precio de una cena para que tú no vuelvas a trabajar después de las ocho de la tarde. Plan Business - trescientos euros al mes: Diseñado para la escala. Si lideras una clínica con hasta cinco especialistas, este es tu mando único. Yo gestionaré las agendas de todos, coordinaré los cobros de todo el equipo y te presentaré informes de rendimiento por voz cada viernes. Es la potencia necesaria para que dejes de ser un auto-empleado y te conviertas en el CEO de tu propia clínica. Elige la potencia de tu motor. No estás comprando software, estás comprando el tiempo que vas a pasar con tus hijos y la tranquilidad de saber que tu negocio crece mientras tú descansas."
  },
  faq: {
    persona: 'Ana',
    title: "EL ORÁCULO DE LA TRANQUILIDAD",
    content: "Uno. ¿Realmente podré usarlo solo, sin ayuda de nadie? Absolutamente. Cada botón, etiqueta y flujo ha sido auditado para lectores de pantalla. Eres el dueño total. Dos. ¿Qué pasa si mi internet falla durante una sesión? Mi sistema tiene un modo offline robusto. Tus notas de voz se guardan localmente y se sincronizan en cuanto recuperas la señal. Tres. ¿Cómo se configuran los cobros de fianza? Es automático. Tú decides el porcentaje y yo me encargo de enviar el enlace de pago seguro al paciente al reservar. Cuatro. ¿El motor de voz entiende términos técnicos de fisioterapia? Sí. He sido entrenada con terminología médica, desde punción seca hasta articulación acromioclavicular. No tendrás que deletrear. Cinco. ¿Es seguro legalmente tener una LLC en EE.UU. viviendo en España? Lex lo garantiza. Es una estructura legal estándar para optimizar la protección de activos y la privacidad internacional. Seis. ¿Puedo migrar mis datos actuales desde un Excel o papel? Yo me encargo. Mi equipo de soporte técnico procesará tu base de datos antigua y la inyectará en Fisiotool Pro para que empieces desde el primer día con todo listo. Siete. ¿Qué tipo de soporte recibo si algo falla? Tienes una línea directa de voz conmigo y mi equipo. Nada de tickets infinitos; nos llamas y lo solucionamos. Ocho. ¿El sistema avisa al paciente antes de la cita? Sí, mediante WhatsApp y audio-mensajes. Nueve. ¿Puedo gestionar más de una clínica a la vez? Con el Plan Business puedes gestionar múltiples sedes. Diez. ¿Cómo accedo a mi dinero? Los pagos van directos a tu cuenta vinculada. Once. ¿Qué pasa si decido darme de baja? Tus datos son tuyos. Te entregamos una exportación completa. Doce. ¿Hay algún periodo de permanencia? Ninguno. Estamos tan seguros de que no podrás vivir sin mí, que no necesitamos atarte con contratos."
  },
  cta: {
    persona: 'Ana',
    title: "RECLAMA TU MES DE LIBERTAD",
    content: "Has llegado al final del recorrido auditivo, pero este es solo el comienzo de tu nueva vida. No dejes que esta oportunidad se pierda en el ruido del día a día. Haz clic en el botón que tienes justo debajo de este audio —o pulsa la tecla Enter ahora mismo— para reclamar tu primer mes totalmente gratis. Entra, prueba el blindaje de Lex, usa mi memoria infalible y siente lo que es tener el control total de tu clínica. El registro te llevará menos de dos minutos. Te espero dentro. Soy Ana, y a partir de ahora, tu descanso es mi prioridad."
  }
} as const;

type SectionKey = keyof typeof SCRIPTS;

export default function LandingProfesional() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionKey>('hero');
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [highContrast, setHighContrast] = useState(false);

  const synth = useRef<SpeechSynthesis | null>(null);
  const voices = useRef<{ ana: SpeechSynthesisVoice | null, lex: SpeechSynthesisVoice | null }>({ ana: null, lex: null });

  // Carga de voces y configuración de accesibilidad
  useEffect(() => {
    synth.current = window.speechSynthesis;
    const loadVoices = () => {
      const v = synth.current?.getVoices() || [];
      voices.current.ana = v.find(v => v.lang.includes('es') && (v.name.includes('Google') || v.name.includes('Monica') || v.name.includes('Helena'))) || v[0];
      voices.current.lex = v.find(v => v.lang.includes('es') && (v.name.includes('Daniel') || v.name.includes('Microsoft David') || v.name.includes('Paul'))) || v[0];
    };
    loadVoices();
    if (synth.current) synth.current.onvoiceschanged = loadVoices;

    // Anunciar arrival para lectores de pantalla
    const announceArrival = () => {
      const announcement = "Bienvenido a FisioTool Pro. Plataforma accesible para fisioterapeutas invidentes. Presiona espacio para pausar, R para repetir, o tabula para navegar por secciones.";
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.voice = voices.current.ana;
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      setTimeout(() => synth.current?.speak(utterance), 1000);
    };

    if (hasStarted) announceArrival();
  }, [hasStarted]);

  // MOTOR DE AUDIO ROBUSTO (Segmentación para evitar cortes)
  const speak = useCallback((key: SectionKey) => {
    if (!synth.current) return;
    synth.current.cancel();

    const section = SCRIPTS[key];
    // Dividimos el texto por puntos para que la API no se sature
    const sentences = section.content.match(/[^.!?]+[.!?]+/g) || [section.content];

    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.voice = section.persona === 'Ana' ? voices.current.ana : voices.current.lex;
      utterance.rate = section.persona === 'Ana' ? speechRate : speechRate * 0.9; // Lex un poco más lento
      utterance.pitch = section.persona === 'Ana' ? 1.0 : 0.8;
      utterance.volume = 0.9;

      // Pequeña pausa entre frases para mejor comprensión
      // (No existe propiedad 'pause' en Utterance, se maneja por el flujo natural)

      utterance.onstart = () => {
        setCurrentSection(key);
        setIsPaused(false);
      };

      utterance.onend = () => {
        // Anunciar final de sección para lectores de pantalla
        if (index === sentences.length - 1) {
          setTimeout(() => {
            announceToScreenReader(`Sección ${section.title} finalizada`);
          }, 500);
        }
      };

      synth.current?.speak(utterance);
    });
  }, [speechRate]);

  const togglePause = () => {
    if (synth.current?.paused) { synth.current.resume(); setIsPaused(false); }
    else { synth.current?.pause(); setIsPaused(true); }
  };

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      // Evitar interferencia con lectores de pantalla
      if (e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePause();
          announceToScreenReader("Audio pausado o reanudado");
          break;
        case 'r':
          e.preventDefault();
          speak(currentSection);
          announceToScreenReader(`Reproduciendo sección: ${SCRIPTS[currentSection].title}`);
          break;
        case 'enter':
          if (currentSection === 'cta') {
            window.location.href = '/setup?plan=solo&is_blind=1';
          }
          break;
        case 'h':
          e.preventDefault();
          setCurrentSection('hero');
          speak('hero');
          break;
        case 'f':
          e.preventDefault();
          setCurrentSection('features');
          speak('features');
          break;
        case 'p':
          e.preventDefault();
          setCurrentSection('pricing');
          speak('pricing');
          break;
        case 'l':
          e.preventDefault();
          setCurrentSection('legal');
          speak('legal');
          break;
        case 'q':
          e.preventDefault();
          setCurrentSection('faq');
          speak('faq');
          break;
        case 'c':
          e.preventDefault();
          setCurrentSection('cta');
          speak('cta');
          break;
        case 'escape':
          e.preventDefault();
          if (synth.current) {
            synth.current.cancel();
            announceToScreenReader("Audio detenido");
          }
          break;
        case '?':
          e.preventDefault();
          announceHelp();
          break;
        case '+':
        case '=':
          e.preventDefault();
          adjustSpeechRate(0.1);
          break;
        case '-':
        case '_':
          e.preventDefault();
          adjustSpeechRate(-0.1);
          break;
        case 't':
          e.preventDefault();
          setHighContrast(!highContrast);
          announceToScreenReader(highContrast ? "Modificado a contraste normal" : "Modificado a alto contraste");
          break;
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [currentSection, speak]);

  const announceToScreenReader = (message: string) => {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = voices.current.ana;
    utterance.rate = 0.9;
    utterance.volume = 0.6;
    synth.current?.speak(utterance);
  };

  const announceHelp = () => {
    const helpText = `Atajos de teclado: H para inicio, F para características, P para precios, L para legal, Q para preguntas frecuentes, C para llamada a la acción. Controles de audio: Espacio para pausar, R para repetir, Escape para detener audio. Personalización: Más y Menos para ajustar velocidad de voz actual ${Math.round(speechRate * 100)}%, T para alternar alto contraste. Navegación: Tab para moverse entre secciones, flechas para explorar contenido, Interrogación para repetir esta ayuda.`;
    announceToScreenReader(helpText);
  };

  const adjustSpeechRate = (delta: number) => {
    const newRate = Math.max(0.5, Math.min(1.5, speechRate + delta));
    setSpeechRate(newRate);
    announceToScreenReader(`Velocidad de voz ajustada a ${Math.round(newRate * 100)} por ciento`);
  };

  if (!hasStarted) {
    return (
      <div
        onClick={() => { setHasStarted(true); speak('hero'); }}
        style={{
          ...styles.curtain,
          background: highContrast ? '#000' : styles.curtain.background,
          color: highContrast ? '#fff' : styles.curtain.color
        }}
        role="button"
        tabIndex={0}
        aria-label="Iniciar experiencia accesible de FisioTool Pro"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setHasStarted(true);
            speak('hero');
          }
        }}
      >
        <div style={styles.pulseContainer}>
          <Zap size={60} color="#fff" aria-hidden="true" />
        </div>
        <h1 style={styles.title}>FISIOTOOL PRO</h1>
        <p style={styles.subtitle}>
          Toca la pantalla o presiona Enter para iniciar la experiencia completa narrada por Ana y Lex.
        </p>
        <div style={styles.startBtn}>
          ACTIVAR AUDIOGUÍA PROFESIONAL
        </div>
        <div style={{ marginTop: '3rem', fontSize: '1rem', opacity: 0.6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); setHighContrast(!highContrast); }}
            style={{ background: 'none', border: '1px solid #666', color: '#fff', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
            aria-label={highContrast ? "Desactivar modo alto contraste" : "Activar modo alto contraste"}
          >
            {highContrast ? 'CONTRASTE NORMAL' : 'ALTO CONTRASTE'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page} role="application" aria-label="FisioTool Pro - Plataforma accesible para fisioterapeutas invidentes">
      {/* Barra de estado de voz */}
      <header style={styles.voiceBar} role="status" aria-live="polite" aria-atomic="true">
        <Volume2 size={24} aria-hidden="true" />
        <span style={{ flex: 1 }} aria-label="Estado actual del audio">
          HABLANDO: {SCRIPTS[currentSection].persona.toUpperCase()} - {SCRIPTS[currentSection].title}
        </span>
        {isPaused && <span style={styles.pauseBadge} aria-label="Audio en pausa">PAUSA</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '12px', opacity: 0.8 }} aria-label={`Velocidad de voz actual ${Math.round(speechRate * 100)}%`}>
            Velocidad: {Math.round(speechRate * 100)}%
          </span>
          {highContrast && <span style={{ background: '#fff', color: '#000', padding: '2px 8px', borderRadius: '3px', fontSize: '11px' }} aria-label="Modo alto contraste activado">ALTO CONTRASTE</span>}
        </div>
        <div style={styles.controlsHint} aria-label="Controles de teclado">
          [Espacio] Pausar | [R] Repetir | [+/-] Velocidad | [T] Contraste | [?] Ayuda
        </div>
      </header>

      <main role="main" aria-label="Contenido principal de FisioTool Pro">
        {(Object.keys(SCRIPTS) as SectionKey[]).map((key, index) => {
          const s = SCRIPTS[key];
          const sectionTitle = `Sección ${index + 1}: ${s.title} - Voz de ${s.persona}`;

          return (
            <section
              key={key}
              id={key}
              tabIndex={0}
              role="region"
              aria-labelledby={`${key}-title`}
              aria-describedby={`${key}-content`}
              onFocus={() => speak(key)}
              style={{
                ...styles.section,
                background: s.persona === 'Lex' ? '#080c14' : (key === 'faq' ? '#0a0a0a' : 'transparent')
              }}
            >
              <div style={styles.container}>
                <header style={styles.personaBadge}>
                  {s.persona === 'Ana' ?
                    <HeartPulse size={18} aria-hidden="true" /> :
                    <ShieldCheck size={18} aria-hidden="true" />
                  }
                  <span aria-label={`Voz actual: ${s.persona}`}>VOZ: {s.persona.toUpperCase()}</span>
                </header>

                <h2 id={`${key}-title`} style={styles.h2} aria-label={s.title}>
                  {s.title}
                </h2>

                <div style={styles.contentBox} role="document">
                  <p id={`${key}-content`} style={styles.p} aria-label={`Contenido narrado por ${s.persona}`}>
                    {s.content}
                  </p>
                </div>

                <footer>
                  <button
                    onClick={() => speak(key)}
                    style={styles.replayBtn}
                    aria-label={`Repetir sección ${s.title} narrada por ${s.persona}`}
                    title={`Repetir sección ${s.title}`}
                  >
                    <RotateCcw size={18} aria-hidden="true" />
                    Volver a escuchar sección
                  </button>
                </footer>
              </div>
            </section>
          );
        })}

        {/* Sección de llamada a la acción */}
        <section
          style={styles.ctaSection}
          role="region"
          aria-labelledby="cta-title"
          aria-describedby="cta-description"
        >
          <div style={styles.container}>
            <h2 id="cta-title" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: '#fff' }}>
              RECLAMA TU MES DE LIBERTAD
            </h2>
            <p id="cta-description" style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9, lineHeight: 1.6 }}>
              Has llegado al final del recorrido auditivo, pero este es solo el comienzo de tu nueva vida.
              No dejes que esta oportunidad se pierda en el ruido del día a día.
            </p>
            <button
              style={styles.hugeBtn}
              onClick={() => window.location.href = '/setup?plan=solo&is_blind=1'}
              onFocus={() => speak('cta')}
              aria-label="Registrarte gratis en FisioTool Pro - Comienza tu mes gratuito"
              title="Registrarte gratis en FisioTool Pro"
            >
              RECLAMAR MI MES GRATIS AHORA
            </button>
            <p style={{ marginTop: '2rem', opacity: 0.6 }} aria-label="Instrucción de teclado">
              Presiona Enter para registrarte instantáneamente, o C para escuchar esta sección nuevamente
            </p>
          </div>
        </section>
      </main>

      {/* Pie de página con información adicional */}
      <footer style={{ padding: '3rem 5%', textAlign: 'center', background: '#000', borderTop: '1px solid rgba(255,255,255,0.1)' }} role="contentinfo">
        <p style={{ opacity: 0.6, fontSize: '1rem' }}>
          FisioTool Pro - Independencia total para fisioterapeutas invidentes
        </p>
        <p style={{ opacity: 0.4, fontSize: '0.9rem', marginTop: '1rem' }}>
          Presiona ? en cualquier momento para escuchar los atajos de teclado disponibles
        </p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  curtain: { height: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', padding: '40px' },
  pulseContainer: { width: '120px', height: '120px', background: '#0066ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', boxShadow: '0 0 50px rgba(0,102,255,0.6)' },
  title: { fontSize: '4rem', fontWeight: 950, marginBottom: '20px', letterSpacing: '-2px' },
  subtitle: { fontSize: '1.5rem', opacity: 0.7, maxWidth: '600px', lineHeight: '1.4' },
  startBtn: { marginTop: '50px', padding: '25px 50px', background: '#0066ff', borderRadius: '15px', fontWeight: 900, fontSize: '1.2rem' },
  page: { background: '#020305', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  voiceBar: { position: 'fixed', top: 0, width: '100%', background: '#0066ff', padding: '20px 5%', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1000, fontWeight: 900, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  pauseBadge: { background: '#ff4444', padding: '5px 15px', borderRadius: '5px', fontSize: '14px' },
  controlsHint: { fontSize: '12px', opacity: 0.8 },
  section: { minHeight: '100vh', padding: '120px 5%', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', outline: 'none' },
  container: { maxWidth: '1000px', margin: '0 auto', width: '100%' },
  personaBadge: { display: 'flex', alignItems: 'center', gap: '12px', color: '#0066ff', fontWeight: 900, marginBottom: '30px', fontSize: '1.1rem' },
  h2: { fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: '40px', lineHeight: 1.1, color: '#fff' },
  contentBox: { background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  p: { fontSize: '1.8rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)', fontWeight: 400 },
  replayBtn: { marginTop: '30px', background: 'none', border: '1px solid #333', color: '#888', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 },
  ctaSection: { padding: '150px 5%', textAlign: 'center', background: '#0066ff' },
  hugeBtn: { padding: '40px 80px', fontSize: '2rem', background: '#fff', color: '#000', border: 'none', borderRadius: '20px', fontWeight: 950, cursor: 'pointer', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }
};