'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Building2, Clock, ShieldCheck, 
  CreditCard, ArrowRight, ArrowLeft, Volume2, 
  Mail, Lock, Euro, CheckCircle2, Eye, EyeOff, MapPin, Coffee, 
  Stethoscope, Baby, Car, ShieldAlert, Globe, AlertTriangle, 
  Smartphone, Banknote, Copy, MessageCircle
} from 'lucide-react';

export default function OnboardingPro() {
  const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";
  
  const [step, setStep] = useState(0); 
  const [showPass, setShowPass] = useState(false);
  const [narratorActive, setNarratorActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWelcomeMsg, setShowWelcomeMsg] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_clinica: '', email: '', password: '',
    calle: '', numero: '', ciudad: '', provincia: '', cp: '',
    apertura: '09:00', cierre: '20:00',
    hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
    precio: 100, fianza: 15,
    flags: [] as string[],
    metodos_pago: [] as string[],
    aceptacion_legal: false
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
      0: "Bienvenido. Selecciona si deseas asistencia por voz.",
      1: "Paso 1. Identidad Clínica y ubicación. Recuerda que podrás añadir más sedes después.",
      2: "Paso 2. Configura tu horario de atención y tus pausas de descanso.",
      3: "Paso 3. Define tus tarifas, métodos de cobro aceptados y alertas médicas.",
      4: "Paso final. Confirmación de tu suscripción FisioTool Pro Edition."
    };
    narrar(scripts[step]);
  }, [step]);

  const toggleList = (list: 'flags' | 'metodos_pago', value: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(value) 
        ? prev[list].filter(item => item !== value) 
        : [...prev[list], value]
    }));
  };

  const isStep1Valid = () => {
    return !!(formData.nombre_clinica && formData.email && formData.password && formData.calle && formData.ciudad);
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
      if (result.success) {
        setShowWelcomeMsg(true); // Mostramos el mensaje para que lo copie antes de ir al dashboard
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("⚠️ Error de conexión. Reintentando...");
    } finally {
      setLoading(false);
    }
  };

  // Texto de bienvenida generado para que el fisio lo use en WhatsApp
  const welcomeText = `👋 ¡Hola! Te saluda Ana, la asistente inteligente de ${formData.nombre_clinica || 'la clínica'}.\n\nPara agendar tu cita, consultar disponibilidad o hablar conmigo, entra en nuestro despacho virtual aquí:\n\n👉 https://fisiotool.app/${formData.nombre_clinica.toLowerCase().replace(/ /g, '-')}`;

  return (
    <div style={containerStyle}>
      <div style={auroraStyle} />

      <motion.div layout style={cardStyle}>
        <AnimatePresence mode="wait">
          
          {/* PASO 0: VOZ */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{textAlign:'center'}}>
              <div style={iconBadgeStyle}><Volume2 color="#0066ff" /></div>
              <h2 style={{margin:'20px 0', fontSize: '28px', fontWeight: 900}}>Asistencia por Voz</h2>
              <p style={{opacity:0.6, marginBottom:'30px'}}>¿Deseas que Ana te guíe durante la configuración?</p>
              <div style={{display:'flex', gap:'12px'}}>
                <button onClick={() => {setNarratorActive(true); setStep(1);}} style={btnMain}>SÍ, ACTIVAR</button>
                <button onClick={() => {setNarratorActive(false); setStep(1);}} style={btnSec}>NO, GRACIAS</button>
              </div>
            </motion.div>
          )}

          {/* PASO 1: IDENTIDAD + AVISO MULTI-SEDE */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 style={stepTitleStyle}>Identidad Clínica</h3>
              
              <div style={inputGroup}>
                <label style={labelStyle}>Nombre de la Clínica *</label>
                <div style={inputWrapper}><Building2 size={16} style={inputIconStyle}/><input style={inputFieldWithIcon} value={formData.nombre_clinica} onChange={e => setFormData({...formData, nombre_clinica: e.target.value})} /></div>
              </div>

              <div style={infoBoxStyle}>
                <Building2 size={14} color="#0066ff" />
                <span>Si tienes más sedes, las añadirás desde el panel una vez finalizado.</span>
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'3fr 1fr', gap:'10px', marginBottom:'15px'}}>
                <div style={inputGroup}><label style={labelStyle}>Calle / Avenida *</label><input style={inputFieldNormal} value={formData.calle} onChange={e => setFormData({...formData, calle: e.target.value})} /></div>
                <div style={inputGroup}><label style={labelStyle}>Nº</label><input style={inputFieldNormal} value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} /></div>
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                <input placeholder="Ciudad" style={inputFieldNormal} value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                <input placeholder="Provincia" style={inputFieldNormal} value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value})} />
                <input placeholder="C.P." style={inputFieldNormal} value={formData.cp} onChange={e => setFormData({...formData, cp: e.target.value})} />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'10px'}}>
                <input placeholder="Email Admin" style={inputFieldNormal} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <div style={{position:'relative'}}>
                  <input placeholder="Contraseña" style={inputFieldNormal} type={showPass ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <div onClick={() => setShowPass(!showPass)} style={eyeIconStyle}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</div>
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
                <span style={{fontSize:'14px', flex:1, fontWeight: 600}}>Hago descanso al mediodía</span>
                <div style={switchBase(formData.hace_descanso)}><div style={switchCircle(formData.hace_descanso)} /></div>
              </div>

              {formData.hace_descanso && (
                <div style={timeGrid}>
                  <input type="time" style={inputFieldNormal} value={formData.descanso_inicio} onChange={e => setFormData({...formData, descanso_inicio: e.target.value})} />
                  <input type="time" style={inputFieldNormal} value={formData.descanso_fin} onChange={e => setFormData({...formData, descanso_fin: e.target.value})} />
                </div>
              )}

              <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <button onClick={() => setStep(1)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(3)} style={btnMain}>SIGUIENTE</button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: PAGOS + BANDERAS ROJAS */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Reglas y Pagos</h3>
              <div style={timeGrid}>
                <div style={inputGroup}><label style={labelStyle}>Precio (€)</label><input type="number" style={inputFieldNormal} value={formData.precio} onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})} /></div>
                <div style={inputGroup}><label style={labelStyle}>Fianza (€)</label><input type="number" style={inputFieldNormal} value={formData.fianza} onChange={e => setFormData({...formData, fianza: parseInt(e.target.value) || 0})} /></div>
              </div>

              <label style={labelStyle}>Cobros aceptados</label>
              <div style={tagCloud}>
                {[
                  { id: 'Stripe', label: 'Tarjeta', icon: CreditCard },
                  { id: 'Bizum', label: 'Bizum', icon: Smartphone },
                  { id: 'Efectivo', label: 'Efectivo', icon: Banknote }
                ].map(item => (
                  <div key={item.id} onClick={() => toggleList('metodos_pago', item.id)} style={tagStyle(formData.metodos_pago.includes(item.id), '#0066ff')}>
                    <item.icon size={12} /> {item.label}
                  </div>
                ))}
              </div>

              <label style={labelStyle}>Banderas Rojas (Triaje Ana)</label>
              <div style={tagCloud}>
                {[{ id: 'Trafico', label: 'Tráfico', icon: Car }, { id: 'Pelvico', label: 'Suelo Pélvico', icon: Stethoscope }, { id: 'Bebes', label: 'Pediatría', icon: Baby }].map(item => (
                  <div key={item.id} onClick={() => toggleList('flags', item.id)} style={tagStyle(formData.flags.includes(item.id), '#ef4444')}>
                    <item.icon size={12} /> {item.label}
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <button onClick={() => setStep(2)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(4)} style={btnMain}>RESUMEN FINAL</button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: SUSCRIPCIÓN O ÉXITO */}
          {step === 4 && !showWelcomeMsg && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={pricingCard}>
                <h3 style={{margin:0, color:'#0066ff', fontSize:'13px', fontWeight:900}}>PRO EDITION</h3>
                <h2 style={{fontSize:'56px', margin:'10px 0', fontWeight:900}}>100€<small style={{fontSize:'18px', opacity:0.4}}>/mes</small></h2>
                <div style={benefitList}>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> IA Conductual y Voz</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Cero No-Shows con fianza</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> Gestión Multi-Sede</div>
                </div>

                <div style={legalBlockStyle}>
                  <input type="checkbox" checked={formData.aceptacion_legal} onChange={e => setFormData({...formData, aceptacion_legal: e.target.checked})} style={{width:'20px', height:'20px'}} />
                  <label style={{fontSize:'11px', opacity:0.6}}>Acepto los términos de salud y RGPD.</label>
                </div>
              </div>
              <button disabled={!formData.aceptacion_legal || loading} onClick={finalizarRegistro} style={(!formData.aceptacion_legal || loading) ? btnDisabled : btnPay}>
                {loading ? "PROCESANDO..." : "ACTIVAR FISIOTOOL PRO ➜"}
              </button>
            </motion.div>
          )}

          {/* VENTANA POST-REGISTRO: COPIA TU MENSAJE */}
          {showWelcomeMsg && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{textAlign:'center'}}>
              <div style={iconBadgeStyle}><MessageCircle color="#10b981" /></div>
              <h2 style={{margin:'20px 0'}}>¡Bienvenido a la élite!</h2>
              <p style={{fontSize:'14px', opacity:0.7, marginBottom:'25px'}}>Copia este mensaje y pégalo como <strong>Respuesta Automática</strong> en tu WhatsApp Business:</p>
              
              <div style={welcomeTextContainer}>
                <p style={{fontSize:'13px', textAlign:'left', margin:0}}>{welcomeText}</p>
                <button onClick={() => {navigator.clipboard.writeText(welcomeText); alert("Copiado");}} style={btnCopy}><Copy size={16} /> COPIAR MENSAJE</button>
              </div>

              <button onClick={() => window.location.href='/dashboard'} style={btnMain}>ENTRAR AL DASHBOARD ➜</button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- ESTILOS DE ÉLITE ---
const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.08) 0%, transparent 70%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '520px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '40px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6)' };
const stepTitleStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 900, marginBottom: '25px', letterSpacing: '-1px' };
const inputGroup: React.CSSProperties = { marginBottom: '15px', width: '100%' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', marginBottom: '6px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' };
const inputIconStyle: React.CSSProperties = { position: 'absolute', left: '16px', opacity: 0.3 };
const inputFieldNormal: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '14px', borderRadius: '14px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const inputFieldWithIcon: React.CSSProperties = { ...inputFieldNormal, paddingLeft: '48px' };
const eyeIconStyle: React.CSSProperties = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4 };
const timeGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', marginBottom:'15px' };
const infoBoxStyle: React.CSSProperties = { display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,102,255,0.05)', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#38bdf8', marginBottom: '20px', border: '1px solid rgba(0,102,255,0.1)' };
const toggleContainer = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: active ? 'rgba(0,102,255,0.08)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', marginBottom: '15px' });
const switchBase = (active: boolean): React.CSSProperties => ({ width: '40px', height: '22px', background: active ? '#0066ff' : '#334155', borderRadius: '20px', position: 'relative' });
const switchCircle = (active: boolean): React.CSSProperties => ({ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '21px' : '3px', transition: '0.2s' });
const tagCloud: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px' };
const tagStyle = (active: boolean, color: string): React.CSSProperties => ({ padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', background: active ? color : 'rgba(255,255,255,0.04)', color: active ? '#fff' : 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' });
const pricingCard: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', textAlign: 'center' };
const benefitList: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px', textAlign: 'left' };
const benefitItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' };
const welcomeTextContainer: React.CSSProperties = { background: '#05070a', padding: '25px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '30px', position: 'relative' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
const btnPay: React.CSSProperties = { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px' };
const btnSec: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '18px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const btnCopy: React.CSSProperties = { marginTop: '15px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '8px 16px', borderRadius: '100px', cursor: 'pointer', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' };
const btnDisabled: React.CSSProperties = { ...btnMain, opacity: 0.3, cursor: 'not-allowed' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', marginBottom: '10px' };
const legalBlockStyle: React.CSSProperties = { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' };