'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Building2, Clock, ShieldCheck, 
  CreditCard, ArrowRight, ArrowLeft, Volume2, 
  Mail, Lock, Euro, CheckCircle2, Eye, EyeOff, MapPin, Coffee, AlertCircle
} from 'lucide-react';

export default function OnboardingPro() {
  const [step, setStep] = useState(0); // Empezamos en el paso 0 (Elección de voz)
  const [showPass, setShowPass] = useState(false);
  const [narratorActive, setNarratorActive] = useState(false);
  const [formData, setFormData] = useState({
    nombre_clinica: '', email: '', password: '',
    calle: '', ciudad: '', cp: '',
    apertura: '09:00', cierre: '20:00',
    hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
    precio: 100, fianza: 15,
    flags: [] as string[]
  });
// --- DIRECCIÓN DEL MOTOR CENTRAL ---
  const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

  // --- FUNCIÓN DE ALTA DEFINITIVA ---
  const finalizarRegistro = async () => {
    narrar("Procesando tu alta en FisioTool Pro. Bienvenido a la élite.");
    
    const payload = {
      nombre_clinica: formData.nombre_clinica,
      email: formData.email,
      password: formData.password,
      calle: formData.calle,
      hora_apertura: formData.apertura,
      hora_cierre: formData.cierre,
      descanso_mediodia: formData.hace_descanso ? 'si' : 'no',
      descanso_inicio: formData.descanso_inicio,
      descanso_fin: formData.descanso_fin,
      precio: formData.precio,
      fianza: formData.fianza,
      banderas_rojas: formData.flags.join(',')
    };

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (result.success) {
        // Redirigimos al Dashboard con su ID real para que empiece a funcionar
        window.location.href = result.dashboard_url;
      } else {
        alert("Error en el motor: " + result.error);
      }
    } catch (error) {
      alert("Error de conexión con el servidor central de Google Cloud.");
    }
  };
  function narrar(t: string) {
        if (narratorActive && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const m = new SpeechSynthesisUtterance(t);
            m.lang = 'es-ES';
            window.speechSynthesis.speak(m);
        }
    }

  useEffect(() => {
    const scripts: any = {
      0: "Bienvenido. Selecciona si deseas activar el modo de asistencia por voz.",
      1: "Paso 1. Introduce el nombre, la dirección de tu clínica y tus credenciales.",
      2: "Paso 2. Configura tu horario comercial y tu tiempo de descanso.",
      3: "Paso 3. Define tus reglas económicas y las banderas rojas de seguridad.",
      4: "Paso final. Confirmación de tu suscripción de élite."
    };
    narrar(scripts[step]);
  }, [step]);

  const toggleFlag = (flag: string) => {
    setFormData(prev => ({
      ...prev,
      flags: prev.flags.includes(flag) ? prev.flags.filter(f => f !== flag) : [...prev.flags, flag]
    }));
  };

  const isStepValid = () => {
    if (step === 1) return formData.nombre_clinica && formData.email && formData.password && formData.calle;
    return true;
  };

  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />

      <motion.div layout style={cardStyle}>
        
        {/* STEP 0: ELECCIÓN DE ACCESIBILIDAD */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{textAlign:'center'}}>
              <div style={iconBadgeStyle}><Volume2 color="#0066ff" /></div>
              <h2 style={{margin:'20px 0'}}>Asistencia por Voz</h2>
              <p style={{opacity:0.6, marginBottom:'30px'}}>¿Deseas que Ana te guíe durante el proceso de configuración?</p>
              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => {setNarratorActive(true); setStep(1);}} style={btnMain}>SÍ, ACTIVAR</button>
                <button onClick={() => {setNarratorActive(false); setStep(1);}} style={btnSec}>NO, GRACIAS</button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: IDENTIDAD Y DIRECCIÓN */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Identidad Clínica</h3>
              <div style={inputGroup}>
                <label style={labelStyle}>Nombre de la Clínica *</label>
                <div style={inputWrapper}><Building2 size={16} style={inputIcon}/><input required style={inputField} value={formData.nombre_clinica} onChange={e => setFormData({...formData, nombre_clinica: e.target.value})} /></div>
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Dirección completa *</label>
                <div style={inputWrapper}><MapPin size={16} style={inputIcon}/><input required style={inputField} placeholder="Calle, número, ciudad..." onChange={e => setFormData({...formData, calle: e.target.value})} /></div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                <div style={inputGroup}><label style={labelStyle}>Email *</label><input style={inputFieldShort} type="email" onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Contraseña *</label>
                  <div style={{position:'relative'}}>
                    <input style={inputFieldShort} type={showPass ? "text" : "password"} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <div onClick={() => setShowPass(!showPass)} style={eyeIconStyle}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</div>
                  </div>
                </div>
              </div>
              <button disabled={!isStepValid()} onClick={() => setStep(2)} style={isStepValid() ? btnMain : btnDisabled}>SIGUIENTE PASO <ArrowRight size={18}/></button>
            </motion.div>
          )}

          {/* STEP 2: HORARIOS Y DESCANSO */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Horarios de Operación</h3>
              <div style={timeGrid}>
                <div style={inputGroup}><label style={labelStyle}>Apertura</label><input type="time" style={inputFieldShort} value={formData.apertura} onChange={e => setFormData({...formData, apertura: e.target.value})} /></div>
                <div style={inputGroup}><label style={labelStyle}>Cierre</label><input type="time" style={inputFieldShort} value={formData.cierre} onChange={e => setFormData({...formData, cierre: e.target.value})} /></div>
              </div>
              
              <div onClick={() => setFormData({...formData, hace_descanso: !formData.hace_descanso})} style={toggleContainer(formData.hace_descanso)}>
                <Coffee size={18} color={formData.hace_descanso ? "#0066ff" : "#555"} />
                <span style={{fontSize:'14px', flex:1}}>Hago descanso al mediodía</span>
                <div style={switchBase(formData.hace_descanso)}><div style={switchCircle(formData.hace_descanso)} /></div>
              </div>

              {formData.hace_descanso && (
                <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} style={timeGrid}>
                  <div style={inputGroup}><label style={labelStyle}>Cierre Comida</label><input type="time" style={inputFieldShort} value={formData.descanso_inicio} onChange={e => setFormData({...formData, descanso_inicio: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Reapertura</label><input type="time" style={inputFieldShort} value={formData.descanso_fin} onChange={e => setFormData({...formData, descanso_fin: e.target.value})} /></div>
                </motion.div>
              )}

              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button onClick={() => setStep(1)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(3)} style={btnMain}>CONFIGURAR REGLAS</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ECONOMÍA Y BANDERAS ROJAS */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Reglas de Negocio</h3>
              <div style={timeGrid}>
                {/* SUSTITUYE LAS LÍNEAS 135 Y 136 POR ESTAS */}
<div style={inputGroup}>
  <label style={labelStyle}>Precio Sesión (€)</label>
  <div style={inputWrapper}>
    <Euro size={14} style={inputIcon}/>
    <input 
      type="number" 
      style={inputFieldShortPad} 
      value={formData.precio} 
      onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})} 
    />
  </div>
</div>

<div style={inputGroup}>
  <label style={labelStyle}>Fianza (€)</label>
  <div style={inputWrapper}>
    <ShieldCheck size={14} style={inputIcon}/>
    <input 
      type="number" 
      style={inputFieldShortPad} 
      value={formData.fianza} 
      onChange={e => setFormData({...formData, fianza: parseInt(e.target.value) || 0})} 
    />
  </div>
</div>
              </div>

              <label style={labelStyle}>Banderas Rojas (Ana no dará cita automática)</label>
              <div style={tagCloud}>
                {['Accidente Tráfico', 'Suelo Pélvico', 'Bebés', 'Cirugía Reciente', 'Seguros'].map(tag => (
                  <div key={tag} onClick={() => toggleFlag(tag)} style={tagStyle(formData.flags.includes(tag))}>{tag}</div>
                ))}
              </div>

              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button onClick={() => setStep(2)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(4)} style={btnMain}>RESUMEN FINAL</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUSCRIPCIÓN */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={pricingCard}>
                <h3 style={{margin:0, color:'#0066ff', fontSize:'14px', letterSpacing:'1px'}}>FISIOTOOL PRO EDITION</h3>
                <h2 style={{fontSize:'56px', margin:'10px 0', fontWeight:900}}>100€<small style={{fontSize:'18px', opacity:0.4}}>/mes</small></h2>
                <div style={benefitList}>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> IA Conductual 2.5 Flash 24/7</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Blindaje total contra No-Shows</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Historial Clínico por Voz</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Gestión Multi-Sede Ilimitada</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Adaptabilidad para Invidentes</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Balance Económico en tiempo real</div>
                </div>
              </div>
              <button onClick={finalizarRegistro} style={btnPay}>
                <CreditCard size={20} /> ACTIVAR MI CLÍNICA PRO ➜
              </button>
              <button onClick={() => setStep(3)} style={{background:'none', border:'none', color:'rgba(255,255,255,0.3)', width:'100%', marginTop:'15px', cursor:'pointer'}}>Revisar datos</button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}// --- ESTILOS DE MICROCHIPS (Sólidos e Indestructibles) ---
const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.08) 0%, transparent 60%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '48px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)' };
const stepTitleStyle: React.CSSProperties = { fontSize: '22px', fontWeight: 800, marginBottom: '30px', letterSpacing: '-0.5px' };
const inputGroup: React.CSSProperties = { marginBottom: '20px' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon: React.CSSProperties = { position: 'absolute', left: '15px', opacity: 0.4 };
const inputField: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 16px 16px 45px', borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const inputFieldShort: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const inputFieldShortPad: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 16px 16px 40px', borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const eyeIconStyle: React.CSSProperties = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4 };
const timeGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' };
const toggleContainer = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', borderRadius: '16px', background: active ? 'rgba(0,102,255,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: '20px' });
const switchBase = (active: boolean): React.CSSProperties => ({ width: '40px', height: '22px', background: active ? '#0066ff' : '#334155', borderRadius: '20px', position: 'relative' });
const switchCircle = (active: boolean): React.CSSProperties => ({ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '21px' : '3px', transition: '0.2s' });
const tagCloud: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '30px' };
const tagStyle = (active: boolean): React.CSSProperties => ({ padding: '8px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: active ? '#0066ff' : 'rgba(255,255,255,0.05)', color: active ? '#fff' : 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' });
const pricingCard: React.CSSProperties = { background: 'linear-gradient(135deg, rgba(0,102,255,0.05) 0%, rgba(0,0,0,0.5) 100%)', padding: '40px 30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', textAlign: 'center' };
const benefitList: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', textAlign: 'left' };
const benefitItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const btnPay: React.CSSProperties = { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '22px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 20px 40px rgba(16,185,129,0.2)' };
const btnSec: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', cursor: 'pointer' };
const btnDisabled: React.CSSProperties = { ...btnMain, opacity: 0.3, cursor: 'not-allowed' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px' };