'use client';

import React, { useState, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const DEMO_SCRIPT = [
  { role: 'ana', text: 'Hola, soy Ana de Fisiotool. ¿En qué puedo ayudarte hoy?', delay: 500 },
  { role: 'user', text: 'Hola, quería saber el precio de una sesión.', delay: 2000 },
  { role: 'ana', text: 'Nuestra sesión de valoración y tratamiento manual (50 min) son 60€. ¿Te duele algo en concreto ahora mismo?', delay: 3500 },
  { role: 'user', text: 'Sí, me duele mucho la espalda baja.', delay: 5000 },
  { role: 'ana', text: 'Entiendo, el dolor lumbar es muy limitante. Tengo un hueco libre mañana a las 10:00 con el Dr. Murillo. ¿Te lo reservo para que empieces a mejorar ya?', delay: 7000 },
];

export default function AnaDemo() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startDemo = () => {
    setMessages([]);
    setCompleted(false);
    let totalDelay = 0;

    DEMO_SCRIPT.forEach((msg, index) => {
      totalDelay += msg.delay;
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, msg]);
          if (index === DEMO_SCRIPT.length - 1) setCompleted(true);
        }, 800); // Tiempo de "escribiendo..."
      }, totalDelay);
    });
  };

  useEffect(() => {
    startDemo(); // Inicia automático al cargar
  }, []);

  return (
    <section id="demo" style={styles.section} aria-label="Demostración Interactiva">
      <div style={styles.container}>
        {/* LADO TEXTO */}
        <div style={styles.textSide}>
          <h2 style={styles.title}>Pon a Ana a prueba.</h2>
          <p style={styles.description}>
            Observa cómo Ana gestiona una conversación real. Detecta el dolor, empatiza con el paciente y dirige la conversación hacia el cierre de la cita (Venta).
          </p>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <strong style={styles.statVal}>24/7</strong>
              <span style={styles.statLabel}>Disponibilidad</span>
            </div>
            <div style={styles.statItem}>
              <strong style={styles.statVal}>&lt;2s</strong>
              <span style={styles.statLabel}>Tiempo Respuesta</span>
            </div>
            <div style={styles.statItem}>
              <strong style={styles.statVal}>+30%</strong>
              <span style={styles.statLabel}>Conversión</span>
            </div>
          </div>
          <button onClick={startDemo} style={styles.restartBtn}>
            <RefreshCw size={18} /> REINICIAR DEMOSTRACIÓN
          </button>
        </div>

        {/* LADO CHAT VISUAL */}
        <div style={styles.chatWrapper}>
          <div style={styles.chatHeader}>
            <div style={styles.avatarAna}><Bot size={20} color="#fff" /></div>
            <div>
              <div style={{fontWeight: 700, fontSize: '14px'}}>Ana (Fisiotool)</div>
              <div style={{fontSize: '11px', color: '#10b981', display:'flex', alignItems:'center', gap:'4px'}}>
                <span style={{width:'6px', height:'6px', background:'#10b981', borderRadius:'50%'}}/> En línea
              </div>
            </div>
          </div>
          
          <div style={styles.chatBody}>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  ...styles.bubble,
                  alignSelf: m.role === 'ana' ? 'flex-start' : 'flex-end',
                  background: m.role === 'ana' ? '#1e293b' : '#0066ff',
                  color: '#fff',
                  borderBottomLeftRadius: m.role === 'ana' ? '4px' : '20px',
                  borderBottomRightRadius: m.role === 'ana' ? '20px' : '4px',
                }}
              >
                {m.text}
              </motion.div>
            ))}
            {isTyping && (
              <div style={{...styles.bubble, alignSelf: 'flex-start', background: '#1e293b', color:'#fff', fontStyle:'italic', opacity:0.6}}>
                Ana está escribiendo...
              </div>
            )}
          </div>
          
          <div style={styles.chatInputMock}>
            <div style={{opacity: 0.4}}>Escribe un mensaje...</div>
            <div style={{padding:'8px', background:'#0066ff', borderRadius:'50%'}}><Send size={16} color="#fff"/></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '100px 5%', background: 'linear-gradient(180deg, #020305 0%, #050a14 100%)' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center' },
  textSide: { textAlign: 'left' },
  title: { fontSize: '48px', fontWeight: 900, color: '#fff', marginBottom: '20px', lineHeight: '1.1' },
  description: { fontSize: '18px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '40px' },
  stats: { display: 'flex', gap: '40px', marginBottom: '40px' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statVal: { fontSize: '32px', color: '#0066ff', fontWeight: 900 },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' },
  restartBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '14px' },
  
  // Chat Styles
  chatWrapper: { background: '#0f172a', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)', maxWidth: '450px', width: '100%', margin: '0 auto' },
  chatHeader: { padding: '20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '15px' },
  avatarAna: { width: '40px', height: '40px', background: '#0066ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  chatBody: { height: '400px', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' },
  bubble: { padding: '15px 20px', borderRadius: '20px', maxWidth: '85%', fontSize: '14px', lineHeight: '1.5' },
  chatInputMock: { padding: '15px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }
};