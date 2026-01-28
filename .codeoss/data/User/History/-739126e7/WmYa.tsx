'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Building2, Clock, ShieldCheck, 
  CreditCard, ArrowRight, ArrowLeft, Volume2, 
  Mail, Lock, Euro, CheckCircle2 
} from 'lucide-react';

export default function OnboardingFerrari() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_clinica: '', email: '', password: '',
    apertura: '09:00', cierre: '20:00',
    precio: 50, fianza: 15
  });

  // --- 🔊 NARRADOR DE BIENVENIDA E INCLUSIÓN ---
  const narrar = (t: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const m = new SpeechSynthesisUtterance(t);
      m.lang = 'es-ES';
      window.speechSynthesis.speak(m);
    }
  };

  useEffect(() => {
    const scripts: any = {
      1: "Paso 1: Identidad. Introduce el nombre de tu clínica y tus datos de acceso administrador.",
      2: "Paso 2: Horarios Soberanos. Define cuándo abre y cierra tu centro.",
      3: "Paso 3: Blindaje Económico. Configura el precio por sesión y la fianza anti-no-show.",
      4: "Paso final: Activación de Licencia Pro. Estás a un paso de liberar tu tiempo."
    };
    if (step === 1) narrar("Bienvenido a la configuración de élite de FisioTool. Este proceso es totalmente accesible para lectores de pantalla.");
    setTimeout(() => narrar(scripts[step]), 1000);
  }, [step]);

  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => s - 1);

  return (
    <div style={containerStyle}>
      {/* AURORA BACKGROUND */}
      <div style={auroraStyle} />

      <motion.div 
        layout
        style={cardStyle}
      >
        {/* INDICADOR DE PROGRESO */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={iconBadgeStyle}>
            <Sparkles color="#0066ff" size={24} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-1px', margin: '15px 0 0 0' }}>Configuración Pro</h2>
          <div style={progressBarContainer}>
            {[1,2,3,4].map(i => (
              <div key={i} style={progressLine(i <= step)} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={inputGroup}>
                <label style={labelStyle}>NOMBRE COMERCIAL</label>
                <div style={inputWrapper}><Building2 size={18} style={inputIcon} /><input style={inputField} placeholder="Ej: Clínica Murillo" /></div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>EMAIL DE ACCESO</label>
                <div style={inputWrapper}><Mail size={18} style={inputIcon} /><input style={inputField} type="email" placeholder="doctor@clinica.com" /></div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>CONTRASEÑA MAESTRA</label>
                <div style={inputWrapper}><Lock size={18} style={inputIcon} /><input style={inputField} type="password" placeholder="••••••••" /></div>
              </div>
              <button onClick={next} style={btnMain}>CONTINUAR CONFIGURACIÓN <ArrowRight size={18} /></button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                <div style={inputGroup}>
                  <label style={labelStyle}>APERTURA</label>
                  <input style={inputField} type="time" defaultValue="09:00" />
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>CIERRE</label>
                  <input style={inputField} type="time" defaultValue="20:00" />
                </div>
              </div>
              <div style={infoBox}>
                <Clock size={16} color="#0066ff" />
                <span>Ana no dará citas fuera de este rango.</span>
              </div>
              <div style={btnActions}>
                <button onClick={prev} style={btnSec}><ArrowLeft size={18} /></button>
                <button onClick={next} style={btnMain}>DEFINIR HORARIOS</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={inputGroup}>
                <label style={labelStyle}>PRECIO ESTÁNDAR SESIÓN</label>
                <div style={inputWrapper}><Euro size={18} style={inputIcon} /><input style={inputField} type="number" defaultValue="50" /></div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>FIANZA ANTI NO-SHOW</label>
                <div style={inputWrapper}><ShieldCheck size={18} style={inputIcon} /><input style={inputField} type="number" defaultValue="15" /></div>
              </div>
              <p style={{fontSize:'12px', opacity:0.5, textAlign:'center'}}>Ana cobrará esta señal automáticamente para blindar tu agenda.</p>
              <div style={btnActions}>
                <button onClick={prev} style={btnSec}><ArrowLeft size={18} /></button>
                <button onClick={next} style={btnMain}>VALIDAR REGLAS</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={pricingCard}>
                <CheckCircle2 color="#10b981" size={32} style={{marginBottom:'15px'}} />
                <h3 style={{margin:0, color:'#10b981'}}>Plan FisioTool Global</h3>
                <h2 style={{fontSize:'48px', margin:'10px 0'}}>49€<small style={{fontSize:'16px', opacity:0.4}}>/mes</small></h2>
                <div style={featureList}>
                  <div>• IA Ana 2.5 Flash 24/7</div>
                  <div>• Agenda Soberana Blindada</div>
                  <div>• Adaptabilidad Invidentes Pro</div>
                </div>
              </div>
              <button onClick={() => window.location.href='/dashboard'} style={btnMain}>SUSCRIBIRSE Y ACTIVAR FERRARI 💳</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={footerNote}>
          <ShieldCheck size={12} />
          <span>Infraestructura cifrada en Google Cloud Bélgica</span>
        </div>
      </motion.div>
    </div>
  );
}

// --- ESTILOS DE MICROCHIPS (INLINE PARA PRECISIÓN) ---
const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.06) 0%, transparent 60%)', zIndex: 0 };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '480px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '48px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '12px', background: 'rgba(0,102,255,0.1)', borderRadius: '16px', border: '1px solid rgba(0,102,255,0.2)' };
const progressBarContainer: React.CSSProperties = { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' };
const progressLine = (active: boolean): React.CSSProperties => ({ width: '40px', height: '4px', background: active ? '#0066ff' : 'rgba(255,255,255,0.1)', borderRadius: '10px', transition: '0.4s' });
const inputGroup: React.CSSProperties = { marginBottom: '24px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon: React.CSSProperties = { position: 'absolute', left: '16px', opacity: 0.3 };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 16px 16px 48px', borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' };
const btnSec: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const btnActions: React.CSSProperties = { display: 'flex', gap: '12px', marginTop: '30px' };
const infoBox: React.CSSProperties = { background: 'rgba(0,102,255,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(0,102,255,0.1)', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: '#38bdf8' };
const pricingCard: React.CSSProperties = { background: 'rgba(16,185,129,0.03)', padding: '40px 20px', borderRadius: '32px', border: '1px solid rgba(16,185,129,0.1)', marginBottom: '40px', textAlign: 'center' };
const featureList: React.CSSProperties = { textAlign: 'left', fontSize: '13px', opacity: 0.6, display: 'inline-block', marginTop: '10px', lineHeight: '2' };
const footerNote: React.CSSProperties = { textAlign: 'center', fontSize: '10px', opacity: 0.3, marginTop: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' };