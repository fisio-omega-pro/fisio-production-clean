'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Building2, Clock, ShieldCheck, 
  CreditCard, ArrowRight, ArrowLeft, Volume2, 
  Mail, Lock, Euro, CheckCircle2, Eye, EyeOff, MapPin, Coffee, 
  Stethoscope, Baby, Car, ShieldAlert, Globe
} from 'lucide-react';

export default function OnboardingPro() {
  // --- 1. CONFIGURACIÓN ---
  const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";
  
  // --- 2. ESTADOS SINCRO ---
  const [step, setStep] = useState(0); 
  const [showPass, setShowPass] = useState(false);
  const [narratorActive, setNarratorActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_clinica: '', email: '', password: '',
    calle: '', ciudad: '', provincia: '', cp: '',
    apertura: '09:00', cierre: '20:00',
    hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
    precio: 100, fianza: 15,
    flags: [] as string[]
  });

  // --- 3. MOTOR DE VOZ ---
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

  // --- 4. LÓGICA DE NEGOCIO ---
  const toggleFlag = (flag: string) => {
    setFormData(prev => ({
      ...prev,
      flags: prev.flags.includes(flag) ? prev.flags.filter(f => f !== flag) : [...prev.flags, flag]
    }));
  };

  const isStep1Valid = () => {
    return formData.nombre_clinica && formData.email && formData.password && formData.calle && formData.ciudad && formData.cp;
  };

  const finalizarRegistro = async () => {
    setLoading(true);
    narrar("Conectando con la pasarela de Stripe. Por favor, no cierres la ventana.");
    
    const payload = {
      nombre_clinica: formData.nombre_clinica,
      email: formData.email,
      password: formData.password,
      calle: formData.calle,
      ciudad: formData.ciudad,
      provincia: formData.provincia,
      cp: formData.cp,
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
      
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else if (result.success) {
        window.location.href = result.dashboard_url;
      } else {
        alert("Error en el alta: " + (result.error || "Desconocido"));
      }
    } catch (error: any) {
      console.error("Fallo de red:", error);
      alert("Error de conexión financiera: " + error.message + ". Verifica que el motor en la nube esté activo.");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. COMPONENTES DE ESTILO ---
  const renderInput = (label: string, field: string, icon?: any, placeholder?: string, type = "text") => (
    <div style={inputGroup}>
      <label style={labelStyle}>{label}</label>
      <div style={inputWrapper}>
        {icon && React.createElement(icon, { size: 16, style: inputIconStyle })}
        <input 
          type={type}
          style={icon ? inputFieldWithIcon : inputFieldNormal} 
          placeholder={placeholder}
          value={(formData as any)[field]}
          onChange={e => setFormData({...formData, [field]: e.target.value})}
        />
      </div>
    </div>
  );

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
              <p style={{opacity:0.6, marginBottom:'30px'}}>¿Eres un profesional invidente o deseas que Ana te guíe por voz?</p>
              <div style={{display:'flex', gap:'12px'}}>
                <button onClick={() => {setNarratorActive(true); setStep(1);}} style={btnMain}>SÍ, ACTIVAR</button>
                <button onClick={() => {setNarratorActive(false); setStep(1);}} style={btnSec}>NO, GRACIAS</button>
              </div>
            </motion.div>
          )}

          {/* PASO 1: IDENTIDAD Y DIRECCIÓN COMPLETA */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Identidad Clínica</h3>
              {renderInput("Nombre de la Clínica *", "nombre_clinica", Building2, "Ej: Clínica Murillo")}
              
              <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'15px'}}>
                {renderInput("Calle y Número *", "calle", MapPin, "Calle Falsa 123")}
                {renderInput("C. Postal *", "cp", null, "18001")}
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                {renderInput("Ciudad *", "ciudad", null, "Granada")}
                {renderInput("Provincia *", "provincia", null, "Granada")}
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'15px'}}>
                {renderInput("Email *", "email", Mail, "admin@clinica.com", "email")}
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

          {/* PASO 2: HORARIOS Y DESCANSO (CORREGIDO) */}
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
                  <div style={inputGroup}><label style={labelStyle}>Inicio Descanso</label><input type="time" style={inputFieldNormal} value={formData.descanso_inicio} onChange={e => setFormData({...formData, descanso_inicio: e.target.value})} /></div>
                  <div style={inputGroup}><label style={labelStyle}>Fin Descanso</label><input type="time" style={inputFieldNormal} value={formData.descanso_fin} onChange={e => setFormData({...formData, descanso_fin: e.target.value})} /></div>
                </div>
              )}

              <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <button onClick={() => setStep(1)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(3)} style={btnMain}>SIGUIENTE</button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: REGLAS Y BANDERAS ROJAS (VISUAL ÉLITE) */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 style={stepTitleStyle}>Reglas de Negocio</h3>
              <div style={timeGrid}>
                <div style={inputGroup}><label style={labelStyle}>Precio Sesión (€)</label><div style={inputWrapper}><Euro size={14} style={inputIconStyle}/><input type="number" style={inputFieldWithIcon} value={formData.precio} onChange={e => setFormData({...formData, precio: parseInt(e.target.value) || 0})} /></div></div>
                <div style={inputGroup}><label style={labelStyle}>Fianza Señal (€)</label><div style={inputWrapper}><ShieldCheck size={14} style={inputIconStyle}/><input type="number" style={inputFieldWithIcon} value={formData.fianza} onChange={e => setFormData({...formData, fianza: parseInt(e.target.value) || 0})} /></div></div>
              </div>

              <label style={labelStyle}>Banderas Rojas (Triaje Automático Ana)</label>
              <p style={{fontSize:'11px', opacity:0.5, marginBottom:'15px'}}>Selecciona qué casos requieren llamada manual:</p>
              <div style={tagCloud}>
                {[
                  { id: 'Trafico', label: 'Acc. Tráfico', icon: Car },
                  { id: 'Pelvico', label: 'Suelo Pélvico', icon: Stethoscope },
                  { id: 'Bebes', label: 'Bebés/Pedia', icon: Baby },
                  { id: 'Seguros', label: 'Seguros/Mutuas', icon: ShieldAlert }
                ].map(item => (
                  <div key={item.id} onClick={() => toggleFlag(item.id)} style={tagStyle(formData.flags.includes(item.id))}>
                    <item.icon size={12} /> {item.label}
                  </div>
                ))}
              </div>

              <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                <button onClick={() => setStep(2)} style={btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(4)} style={btnMain}>FINALIZAR</button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: SUSCRIPCIÓN PROFESIONAL */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={pricingCard}>
                <h3 style={{margin:0, color:'#0066ff', fontSize:'13px', fontWeight:900, letterSpacing:'2px'}}>FISIOTOOL PRO EDITION</h3>
                <h2 style={{fontSize:'56px', margin:'15px 0', fontWeight:900}}>100€<small style={{fontSize:'18px', opacity:0.4}}>/mes</small></h2>
                <div style={benefitList}>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Ana 2.5 Flash:</strong> IA Conductual 24/7</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Blindaje:</strong> Cero No-Shows con fianza</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Voz:</strong> Historial Clínico manos libres</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Soberanía:</strong> Multi-Sede Ilimitada</div>
                  <div style={benefitItem}><CheckCircle2 size={16} color="#10b981" /> <strong>Inclusión:</strong> Adaptado a Invidentes</div>
                </div>
              </div>
              
              <button disabled={loading} onClick={finalizarRegistro} style={loading ? btnDisabled : btnPay}>
                {loading ? "CONECTANDO CON STRIPE..." : "INICIAR SUSCRIPCIÓN SEGURA ➜"}
              </button>
              
              <div style={{textAlign:'center', marginTop:'20px', opacity:0.4, fontSize:'11px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                <Globe size={12} /> Pago procesado en servidores seguros SSL
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- 6. ESTILOS DE INGENIERÍA (LIMPIOS Y FIJOS) ---
const containerStyle: React.CSSProperties = { backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', position: 'relative', overflow: 'hidden' };
const auroraStyle: React.CSSProperties = { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.1) 0%, transparent 70%)' };
const cardStyle: React.CSSProperties = { width: '100%', maxWidth: '520px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '40px', padding: '48px', backdropFilter: 'blur(30px)', position: 'relative', zIndex: 1, boxShadow: '0 50px 100px -20px rgba(0,0,0,0.6)' };
const stepTitleStyle: React.CSSProperties = { fontSize: '24px', fontWeight: 900, marginBottom: '30px', letterSpacing: '-1px', color: '#fff' };
const inputGroup: React.CSSProperties = { marginBottom: '20px', width: '100%' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', marginBottom: '8px', textTransform: 'uppercase' };
const inputWrapper: React.CSSProperties = { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' };
const inputIconStyle: React.CSSProperties = { position: 'absolute', left: '16px', opacity: 0.3 };
const inputFieldNormal: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const inputFieldWithIcon: React.CSSProperties = { ...inputFieldNormal, paddingLeft: '48px' };
const eyeIconStyle: React.CSSProperties = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4 };
const timeGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%' };
const toggleContainer = (active: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px', borderRadius: '20px', background: active ? 'rgba(0,102,255,0.08)' : 'rgba(255,255,255,0.02)', border: active ? '1px solid rgba(0,102,255,0.2)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: '20px', transition: '0.3s' });
const switchBase = (active: boolean): React.CSSProperties => ({ width: '44px', height: '24px', background: active ? '#0066ff' : '#334155', borderRadius: '20px', position: 'relative' });
const switchCircle = (active: boolean): React.CSSProperties => ({ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '23px' : '3px', transition: '0.2s' });
const tagCloud: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' };
const tagStyle = (active: boolean): React.CSSProperties => ({ padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: active ? '#0066ff' : 'rgba(255,255,255,0.04)', color: active ? '#fff' : 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' });
const pricingCard: React.CSSProperties = { background: 'linear-gradient(135deg, rgba(0,102,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', padding: '40px 30px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '30px', textAlign: 'center' };
const benefitList: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '25px', textAlign: 'left' };
const benefitItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' };
const btnMain: React.CSSProperties = { width: '100%', background: '#0066ff', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,102,255,0.2)' };
const btnPay: React.CSSProperties = { width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '22px', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '16px', boxShadow: '0 20px 40px rgba(16,185,129,0.3)', transition: '0.3s' };
const btnSec: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '20px', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const btnDisabled: React.CSSProperties = { ...btnMain, opacity: 0.3, cursor: 'not-allowed' };
const iconBadgeStyle: React.CSSProperties = { display: 'inline-flex', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '20px', marginBottom: '10px' };