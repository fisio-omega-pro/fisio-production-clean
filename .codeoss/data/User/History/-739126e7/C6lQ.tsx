'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Building2, Clock, ShieldCheck, 
  CreditCard, ArrowRight, ArrowLeft, Volume2, 
  Mail, Lock, Euro, CheckCircle2, Eye, EyeOff, MapPin, Coffee, 
  Stethoscope, Baby, Car, ShieldAlert, Globe, AlertTriangle
} from 'lucide-react';

export default function OnboardingPro() {
  const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";
  
  const [step, setStep] = useState(0); 
  const [showPass, setShowPass] = useState(false);
  const [narratorActive, setNarratorActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_clinica: '', email: '', password: '',
    calle: '', numero: '', ciudad: '', provincia: '', cp: '',
    apertura: '09:00', cierre: '20:00',
    hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
    precio: 100, fianza: 15,
    flags: [] as string[]
  });

  const narrar = (t: string) => {
    if ((narratorActive || step === 0) && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const m = new SpeechSynthesisUtterance(t);
      m.lang = 'es-ES';
      window.speechSynthesis.speak(m);
    }
  };

  useEffect(() => {
    const scripts: any = {
      0: "Bienvenido a FisioTool. Selecciona si deseas asistencia por voz.",
      1: "Paso 1. Identidad Clínica. Introduce los datos de ubicación y acceso.",
      2: "Paso 2. Horarios comerciales y tiempos de descanso.",
      3: "Paso 3. Configuración de tarifas y protocolos de seguridad médica.",
      4: "Paso final. Confirmación de suscripción profesional."
    };
    narrar(scripts[step]);
  }, [step]);

  const toggleFlag = (flag: string) => {
    setFormData(prev => ({
      ...prev,
      flags: prev.flags.includes(flag) ? prev.flags.filter(f => f !== flag) : [...prev.flags, flag]
    }));
  };

  const isStep1Valid = () => {
    return formData.nombre_clinica && formData.email && formData.password && formData.calle && formData.numero && formData.ciudad && formData.cp && formData.provincia;
  };

  const finalizarRegistro = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.payment_url) window.location.href = result.payment_url;
      else if (result.success) window.location.href = result.dashboard_url;
    } catch (error) {
      console.log("Error de conexión (lo resolveremos al final)");
      alert("⚠️ El motor no responde. Como acordamos, seguiremos con la UI y conectaremos esto al final.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />

      <motion.div layout style={cardStyle}>
        <AnimatePresence mode="wait">
          
          {/* PASO 0: ACCESIBILIDAD */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{textAlign:'center'}}>
              <div style={iconBadgeStyle}><Volume2 color="#0066ff" /></div>
              <h2 style={{margin:'20px 0', fontSize: '28px', fontWeight: 900}}>Asistencia por Voz</h2>
              <p style={{opacity:0.6, marginBottom:'30px'}}>¿Eres un profesional invidente o deseas guía por voz?</p>
              <div style={{display:'flex', gap:'12px'}}>
                <button onClick={() => {setNarratorActive(true); setStep(1);}} style={btnMain}>SÍ, ACTIVAR</button>
                <button onClick={() => {setNarratorActive(false); setStep(1);}} style={btnSec}>NO, GRACIAS</button>
              </div>
            </motion.div>
          )}

          {/* PASO 1: IDENTIDAD Y DIRECCIÓN FERRARI */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Identidad Clínica</h3>
              
              <div style={inputGroup}>
                <label style={labelStyle}>Nombre de la Clínica *</label>
                <div style={inputWrapper}><Building2 size={16} style={inputIconStyle}/><input style={inputFieldWithIcon} value={formData.nombre_clinica} onChange={e => setFormData({...formData, nombre_clinica: e.target.value})} /></div>
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'3fr 1fr', gap:'10px', marginBottom:'15px'}}>
                <div style={inputGroup}><label style={labelStyle}>Calle / Avenida *</label><input style={inputFieldNormal} value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} /></div>
                <div style={inputGroup}><label style={labelStyle}>Nº *</label><input style={inputFieldNormal} value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} /></div>
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                <div style={inputGroup}><label style={labelStyle}>Ciudad *</label><input style={inputFieldNormal} value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} /></div>
                <div style={inputGroup}><label style={labelStyle}>Provincia *</label><input style={inputFieldNormal} value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} /></div>
                <div style={inputGroup}><label style={labelStyle}>C.P. *</label><input style={inputFieldNormal} value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} /></div>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'10px'}}>
                <div style={inputGroup}><label style={labelStyle}>Email *</label><input style={inputFieldNormal} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Contraseña *</label>
                  <div style={{position:'relative'}}>
                    <input style={inputFieldNormal} type={showPass ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    <div onClick={() => setShowPass(!showPass)} style={eyeIconStyle}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</div>
                  </div>
                </div>
              </div>
              
              <button disabled={!isStep1Valid()} onClick={() => setStep(2)} style={isStep1Valid() ? btnMain : btnDisabled}>CONFIGURAR HORARIOS <ArrowRight size={18}/></button>
            </motion.div>
          )}

          {/* PASO 2: HORARIOS */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Horarios de Operación</h3>
              <div style={timeGrid}>
                <div style={inputGroup}><label style={labelStyle}>Apertura</label><input type="time" style={inputFieldNormal} value={formData.apertura} onChange={e => setFormData({...formData, apertura: e.target.value})} /></div>
                <div style={inputGroup}><label style={labelStyle}>Cierre</label><input type="time" style={inputFieldNormal} value={formData.cierre} onChange={e => setFormData({...formData, cierre: e.target.value})} /></div>
              </div>
              
              <div onClick={() => setFormData({...formData, hace_descanso: !formData.hace_descanso})} style={toggleContainer(formData.hace_descanso)}>
                <Coffee size={18} color={formData.hace_descanso ? "#0066ff" : "#555"} />
                <span style={{fontSize:'14px', flex:1, fontWeight: 600}}>Cierre al mediodía</span>
                <div style={switchBase(formData.hace_descanso)}><div style={switchCircle(formData.hace_descanso)} /></div>
              </div>

              {formData.hace_descanso && (
                <div style={timeGrid}>
                  <div style={inputGroup}><label style={labelStyle}>Inicio Descanso</label><input type="time" style={inputFieldNormal} value={formData.descanso_inicio} onChange={e => setFormData({...formData, descanso_inicio: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Fin Descanso</label><input type="time" style={inputFieldNormal} value={formData.descanso_fin} onChange={e => setFormData({...formData, descanso_fin: e.target.value})} /></div>
                </div>
              )}

              <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <button onClick={() => setStep(1)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(3)} style={btnMain}>CONFIGURAR REGLAS</button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: REGLAS Y BANDERAS ROJAS (EFECTO ALERTA) */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Protocolos de Seguridad</h3>
              <div style={timeGrid}>
                <div style={inputGroup}><label style={labelStyle}>Precio Sesión (€)</label><div style={inputWrapper}><Euro size={14} style={inputIconStyle}/><input type="number" style={inputFieldWithIcon} value={formData.precio} onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})} /></div></div>
                <div style={inputGroup}><label style={labelStyle}>Fianza Señal (€)</label><div style={inputWrapper}><ShieldCheck size={14} style={inputIconStyle}/><input type="number" style={inputFieldWithIcon} value={formData.fianza} onChange={e => setFormData({...formData, fianza: parseInt(e.target.value) || 0})} /></div></div>
              </div>

              <label style={labelStyle}>Banderas Rojas (Alertas Críticas)</label>
              <p style={{fontSize:'11px', opacity:0.5, marginBottom:'15px'}}>Selecciona los casos que Ana derivará a llamada manual:</p>
              <div style={tagCloud}>
                {[
                  { id: 'Trafico', label: 'Acc. Tráfico', icon: Car, color: '#ef4444' },
                  { id: 'Pelvico', label: 'Suelo Pélvico', icon: Stethoscope, color: '#ec4899' },
                  { id: 'Bebes', label: 'Bebés / Pediatría', icon: Baby, color: '#3b82f6' },
                  { id: 'Seguros', label: 'Seguros / Mutuas', icon: ShieldAlert, color: '#f59e0b' }
                ].map(item => {
                  const isActive = formData.flags.includes(item.id);
                  return (
                    <div key={item.id} onClick={() => toggleFlag(item.id)} style={tagStyle(isActive, item.color)}>
                      <item.icon size={14} color={isActive ? "#fff" : item.color} />
                      {item.label}
                      {isActive && <AlertTriangle size={12} className="animate-pulse" />}
                    </div>
                  );
                })}
              </div>

              <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <button onClick={() => setStep(2)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(4)} style={btnMain}>REVISIÓN FINAL</button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: SUSCRIPCIÓN */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={pricingCard}>
                <h3 style={{margin:0, color:'#0066ff', fontSize:'13px', fontWeight:900, letterSpacing:'2px'}}>FISIOTOOL PRO EDITION</h3>
                <h2 style={{fontSize:'56px', margin:'15px 0', fontWeight:900}}>100€<small style={{fontSize:'18px', opacity:0.4}}>/mes</small></h2>
                    
<div style={benefitList}>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Ana 2.5 Flash:</strong> Recepción inteligente y persuasiva 24/7.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Escudo Anti No-Show:</strong> Cobro de fianzas automático.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Historial Clínico por Voz:</strong> Ahorro de 5 horas de papeleo semanal.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Gestion Agenda 24/7:</strong> Control total de huecos y bloqueos.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Multi-Sede Pro:</strong> Gestión unificada de todas tus clínicas.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Accesibilidad Invidentes:</strong> Diseñado para el talento invidente.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Balance Económico Real:</strong> Contabilidad y rentabilidad en tiempo real.</div>
  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Consultoría 24/7:</strong> Ana asesora estratégicamente tu negocio.</div>
</div>

  
              
              <button disabled={loading} onClick={finalizarRegistro} style={loading ? btnDisabled : btnPay}>
                {loading ? "PROCESANDO..." : "INICIAR SUSCRIPCIÓN SEGURA ➜"}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- ESTILOS SÓLIDOS ---
const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.1) 0%, transparent 70%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '550px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', padding: '40px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1, boxShadow: '0 50px 100px rgba(0,0,0,0.6)' };
const stepTitleStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 900, marginBottom: '25px', letterSpacing: '-1px' };
const inputGroup: React.CSSProperties = { marginBottom: '15px', width: '100%' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', marginBottom: '6px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' };
const inputIconStyle: React.CSSProperties = { position: 'absolute', left: '16px', opacity: 0.3 };
const inputFieldNormal: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '14px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const inputFieldWithIcon: React.CSSProperties = { ...inputFieldNormal, paddingLeft: '48px' };
const eyeIconStyle: React.CSSProperties = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4 };
const timeGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' };
const toggleContainer = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: active ? 'rgba(0,102,255,0.08)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: '15px', transition: '0.3s' });
const switchBase = (active: boolean): React.CSSProperties => ({ width: '40px', height: '22px', background: active ? '#0066ff' : '#334155', borderRadius: '20px', position: 'relative' });
const switchCircle = (active: boolean): React.CSSProperties => ({ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '21px' : '3px', transition: '0.2s' });
const tagCloud: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '25px' };
const tagStyle = (active: boolean, color: string): React.CSSProperties => ({ padding: '14px', borderRadius: '16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: active ? color : 'rgba(255,255,255,0.04)', color: active ? '#fff' : 'rgba(255,255,255,0.4)', border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', gap: '10px', transition: '0.2s', boxShadow: active ? `0 0 20px ${color}44` : 'none' });
const pricingCard: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', textAlign: 'center' };
const benefitList: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '10px', // Reducimos un pelín el hueco para que quepan las 8 virtudes perfectamente
  marginTop: '20px', 
  textAlign: 'left' 
};
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const btnPay: React.CSSProperties = { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 20px 40px rgba(16,185,129,0.2)' };
const btnSec: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', cursor: 'pointer' };
const btnDisabled: React.CSSProperties = { ...btnMain, opacity: 0.3, cursor: 'not-allowed' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', marginBottom: '10px' };