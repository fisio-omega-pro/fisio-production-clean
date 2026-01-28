'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ArrowLeft, Volume2, 
  Eye, EyeOff, Coffee, 
  Stethoscope, Baby, Car, Smartphone, 
  CreditCard, Banknote, CheckCircle2, MessageCircle, Copy, Loader2, AlertCircle
} from 'lucide-react';

// --- TIPADO ESTRICTO (Contract) ---
interface ClinicData {
  nombre_clinica: string;
  email: string;
  password: string;
  calle: string;
  numero: string;
  ciudad: string;
  provincia: string;
  cp: string;
  apertura: string;
  cierre: string;
  hace_descanso: boolean;
  descanso_inicio: string;
  descanso_fin: string;
  precio: number;
  fianza: number;
  flags: string[];
  metodos_pago: string[];
  aceptacion_legal: boolean;
  plan: string; // Añadido para capturar el plan desde la URL
}

const INITIAL_DATA: ClinicData = {
  nombre_clinica: '', email: '', password: '',
  calle: '', numero: '', ciudad: '', provincia: '', cp: '',
  apertura: '09:00', cierre: '20:00',
  hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
  precio: 50, fianza: 15,
  flags: [], metodos_pago: ['Stripe'], // Stripe activo por defecto
  aceptacion_legal: false,
  plan: 'solo'
};

export default function OnboardingPro() {
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState<ClinicData>(INITIAL_DATA);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ token: string, url: string } | null>(null);
  
  // --- CAPTURA DE PLAN DESDE URL ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan) setFormData(prev => ({ ...prev, plan }));
  }, []);

  // --- MOTOR DE VOZ (NARRADOR) ---
  const narrar = (text: string) => {
    if (step > 0 && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const m = new SpeechSynthesisUtterance(text);
      m.lang = 'es-ES';
      window.speechSynthesis.speak(m);
    }
  };

  useEffect(() => {
    if(step === 0) return; // No narrar en la selección de modo
    const SCRIPTS: Record<number, string> = {
      1: "Paso 1. Identidad Clínica. Introduce el nombre de tu centro y tu ubicación principal.",
      2: "Paso 2. Horarios. Define tu jornada laboral para que Ana gestione la agenda.",
      3: "Paso 3. Reglas de Negocio. Establece el precio de la sesión y la fianza para evitar ausencias.",
      4: "Paso Final. Revisa los datos y activa tu cuenta profesional."
    };
    narrar(SCRIPTS[step] || "");
  }, [step]);

  // --- HANDLERS ---
  const updateField = (field: keyof ClinicData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg(null); // Limpiar errores al escribir
  };

  const toggleList = (list: 'flags' | 'metodos_pago', value: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(value) 
        ? prev[list].filter(item => item !== value) 
        : [...prev[list], value]
    }));
  };

  // --- VALIDACIONES ---
  const validateStep1 = () => {
    if (!formData.nombre_clinica) return "El nombre de la clínica es obligatorio.";
    if (!formData.email.includes('@')) return "Introduce un email válido.";
    if (formData.password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (step === 1 && error) {
      setErrorMsg(error);
      return;
    }
    setStep(prev => prev + 1);
  };

  // --- ENVÍO AL BACKEND (CONEXIÓN BLINDADA) ---
  const finalizarRegistro = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Usamos ruta relativa '/api/register' que el servidor Next.js o Express resolverá
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Error en el servidor");

      // ÉXITO: Guardamos token y preparamos redirección
      if (result.success) {
        localStorage.setItem('fisio_token', result.token);
        
        // Si hay URL de pago (Stripe), redirigimos allí
        if (result.payment_url) {
          window.location.href = result.payment_url;
        } else {
          // Si es modo gratuito/manual, mostramos mensaje de bienvenida
          setSuccessData({ token: result.token, url: result.dashboard_url });
        }
      }

    } catch (err: any) {
      console.error("Registro fallido:", err);
      setErrorMsg(err.message || "Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO ---
  return (
    <div style={styles.container}>
      <div style={styles.aurora} />

      <motion.div layout style={styles.card}>
        <AnimatePresence mode="wait">
          
          {/* PASO 0: SELECCIÓN DE MODO (ACCESIBILIDAD) */}
          {step === 0 && (
            <motion.div key="s0" {...animProps} style={{textAlign:'center'}}>
              <div style={styles.iconBadge}><Volume2 color="#0066ff" size={32} /></div>
              <h2 style={styles.title}>Configuración Guiada</h2>
              <p style={styles.desc}>¿Deseas que Ana te narre los pasos?</p>
              <div style={styles.btnGroup}>
                <button onClick={() => setStep(1)} style={styles.btnMain}>SÍ, GUIARME</button>
                <button onClick={() => setStep(1)} style={styles.btnSec}>NO, MODO VISUAL</button>
              </div>
            </motion.div>
          )}

          {/* PASO 1: DATOS CLAVE */}
          {step === 1 && (
            <motion.div key="s1" {...animProps}>
              <h3 style={styles.stepTitle}>Identidad Clínica</h3>
              
              <InputGroup label="Nombre de la Clínica">
                <input style={styles.input} value={formData.nombre_clinica} onChange={e => updateField('nombre_clinica', e.target.value)} placeholder="Ej: Fisioterapia Avanza" />
              </InputGroup>

              <div style={styles.grid2}>
                <InputGroup label="Email Admin"><input type="email" style={styles.input} value={formData.email} onChange={e => updateField('email', e.target.value)} /></InputGroup>
                <InputGroup label="Contraseña">
                  <div style={{position:'relative'}}>
                    <input type={showPass ? "text" : "password"} style={styles.input} value={formData.password} onChange={e => updateField('password', e.target.value)} />
                    <div onClick={() => setShowPass(!showPass)} style={styles.eyeIcon}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</div>
                  </div>
                </InputGroup>
              </div>

              <div style={styles.grid2}>
                <InputGroup label="Calle"><input style={styles.input} value={formData.calle} onChange={e => updateField('calle', e.target.value)} /></InputGroup>
                <InputGroup label="Ciudad"><input style={styles.input} value={formData.ciudad} onChange={e => updateField('ciudad', e.target.value)} /></InputGroup>
              </div>

              {errorMsg && <div style={styles.errorBox}><AlertCircle size={16}/> {errorMsg}</div>}
              
              <button onClick={handleNext} style={styles.btnMain}>SIGUIENTE <ArrowRight size={18}/></button>
            </motion.div>
          )}

          {/* PASO 2: HORARIOS */}
          {step === 2 && (
            <motion.div key="s2" {...animProps}>
              <h3 style={styles.stepTitle}>Horarios de Atención</h3>
              <div style={styles.grid2}>
                <InputGroup label="Apertura"><input type="time" style={styles.input} value={formData.apertura} onChange={e => updateField('apertura', e.target.value)} /></InputGroup>
                <InputGroup label="Cierre"><input type="time" style={styles.input} value={formData.cierre} onChange={e => updateField('cierre', e.target.value)} /></InputGroup>
              </div>

              <div onClick={() => updateField('hace_descanso', !formData.hace_descanso)} style={styles.toggleRow}>
                <Coffee size={18} color={formData.hace_descanso ? "#0066ff" : "#666"} />
                <span style={{flex:1, fontWeight:600, fontSize:'14px'}}>Pausa para comer</span>
                <div style={styles.switchBase(formData.hace_descanso)}><div style={styles.switchKnob(formData.hace_descanso)} /></div>
              </div>

              {formData.hace_descanso && (
                <div style={styles.grid2}>
                  <InputGroup label="Inicio Pausa"><input type="time" style={styles.input} value={formData.descanso_inicio} onChange={e => updateField('descanso_inicio', e.target.value)} /></InputGroup>
                  <InputGroup label="Fin Pausa"><input type="time" style={styles.input} value={formData.descanso_fin} onChange={e => updateField('descanso_fin', e.target.value)} /></InputGroup>
                </div>
              )}

              <div style={styles.btnGroup}>
                <button onClick={() => setStep(1)} style={styles.btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(3)} style={styles.btnMain}>SIGUIENTE</button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: TARIFAS Y REGLAS */}
          {step === 3 && (
            <motion.div key="s3" {...animProps}>
              <h3 style={styles.stepTitle}>Tarifas y Reglas</h3>
              <div style={styles.grid2}>
                <InputGroup label="Precio Sesión (€)"><input type="number" style={styles.input} value={formData.precio} onChange={e => updateField('precio', Number(e.target.value))} /></InputGroup>
                <InputGroup label="Fianza Reserva (€)"><input type="number" style={styles.input} value={formData.fianza} onChange={e => updateField('fianza', Number(e.target.value))} /></InputGroup>
              </div>

              <label style={styles.miniLabel}>MÉTODOS DE COBRO</label>
              <div style={styles.tags}>
                {[
                  { id: 'Stripe', label: 'Tarjeta (Auto)', icon: CreditCard },
                  { id: 'Bizum', label: 'Bizum', icon: Smartphone },
                  { id: 'Efectivo', label: 'Efectivo', icon: Banknote }
                ].map(m => (
                  <Tag key={m.id} active={formData.metodos_pago.includes(m.id)} onClick={() => toggleList('metodos_pago', m.id)} icon={m.icon} label={m.label} color="#0066ff" />
                ))}
              </div>

              <label style={styles.miniLabel}>BANDERAS ROJAS (ANA BLOQUEARÁ LA CITA)</label>
              <div style={styles.tags}>
                {[
                  { id: 'Trafico', label: 'Accidente Tráfico', icon: Car },
                  { id: 'Pelvico', label: 'Suelo Pélvico', icon: Stethoscope },
                  { id: 'Bebes', label: 'Pediatría', icon: Baby }
                ].map(m => (
                  <Tag key={m.id} active={formData.flags.includes(m.id)} onClick={() => toggleList('flags', m.id)} icon={m.icon} label={m.label} color="#ef4444" />
                ))}
              </div>

              <div style={styles.btnGroup}>
                <button onClick={() => setStep(2)} style={styles.btnSec}><ArrowLeft size={18}/></button>
                <button onClick={() => setStep(4)} style={styles.btnMain}>REVISAR</button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: CONFIRMACIÓN */}
          {step === 4 && !successData && (
            <motion.div key="s4" {...animProps}>
              <div style={styles.summaryCard}>
                <h4 style={{margin:0, color:'#0066ff', fontSize:'12px', fontWeight:900}}>RESUMEN DE SUSCRIPCIÓN</h4>
                <div style={{fontSize:'48px', fontWeight:900, margin:'10px 0'}}>
                  {formData.plan === 'solo' ? '100€' : formData.plan === 'team' ? '300€' : '500€'}
                  <span style={{fontSize:'16px', opacity:0.5}}>/mes</span>
                </div>
                
                <div style={styles.checkList}>
                  <CheckItem text={`Plan Seleccionado: ${formData.plan.toUpperCase()}`} />
                  <CheckItem text="30 Días de Prueba Gratuita" />
                  <CheckItem text="Sin permanencia" />
                </div>

                <div style={styles.legalBox}>
                  <input 
                    type="checkbox" 
                    checked={formData.aceptacion_legal} 
                    onChange={e => updateField('aceptacion_legal', e.target.checked)} 
                    style={{width:'18px', height:'18px', cursor:'pointer'}}
                  />
                  <span style={{fontSize:'12px', opacity:0.7}}>Acepto las <a href="/condiciones" style={{color:'#fff'}}>Condiciones de Uso</a> y la política RGPD.</span>
                </div>
              </div>

              {errorMsg && <div style={styles.errorBox}><AlertCircle size={16}/> {errorMsg}</div>}

              <button 
                disabled={!formData.aceptacion_legal || loading} 
                onClick={finalizarRegistro} 
                style={formData.aceptacion_legal && !loading ? styles.btnSuccess : styles.btnDisabled}
              >
                {loading ? <span style={{display:'flex', gap:'10px'}}><Loader2 className="animate-spin"/> ACTIVANDO...</span> : "CONFIRMAR Y EMPEZAR ➜"}
              </button>
            </motion.div>
          )}

          {/* PANTALLA DE ÉXITO (POST-REGISTRO) */}
          {successData && (
            <motion.div key="success" {...animProps} style={{textAlign:'center'}}>
              <div style={{...styles.iconBadge, background:'rgba(16,185,129,0.1)'}}>
                <MessageCircle color="#10b981" size={32} />
              </div>
              <h2 style={styles.title}>¡Cuenta Activada!</h2>
              <p style={styles.desc}>Copia este mensaje para tu respuesta automática de WhatsApp:</p>
              
              <div style={styles.codeBlock}>
                <p style={{margin:0, fontSize:'13px', lineHeight:'1.6', textAlign:'left'}}>
                  👋 Hola! Te saluda Ana, asistente inteligente de {formData.nombre_clinica}.<br/><br/>
                  Para pedir cita o consultar disponibilidad, entra aquí:<br/>
                  👉 <strong>fisiotool.app/{formData.nombre_clinica.toLowerCase().replace(/ /g, '-')}</strong>
                </p>
                <button 
                  onClick={() => navigator.clipboard.writeText(`👋 Hola! Te saluda Ana, asistente inteligente de ${formData.nombre_clinica}.\n\nPara pedir cita o consultar disponibilidad, entra aquí:\n👉 fisiotool.app/${formData.nombre_clinica.toLowerCase().replace(/ /g, '-')}`)}
                  style={styles.copyBtn}
                >
                  <Copy size={14}/> COPIAR
                </button>
              </div>

              <button onClick={() => window.location.href = successData.url} style={styles.btnMain}>
                ENTRAR AL DASHBOARD ➜
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- COMPONENTES UI ---
const InputGroup = ({label, children}: {label: string, children: React.ReactNode}) => (
  <div style={{marginBottom:'15px', width:'100%'}}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const Tag = ({active, onClick, icon: Icon, label, color}: any) => (
  <div onClick={onClick} style={{...styles.tag, background: active ? color : 'rgba(255,255,255,0.05)', color: active ? '#fff' : 'rgba(255,255,255,0.5)', borderColor: active ? color : 'transparent'}}>
    <Icon size={14} /> {label}
  </div>
);

const CheckItem = ({text}: {text: string}) => (
  <div style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', opacity:0.8}}>
    <CheckCircle2 size={16} color="#10b981" /> {text}
  </div>
);

// --- ESTILOS ---
const styles: any = {
  container: { minHeight: '100vh', background: '#020305', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' },
  aurora: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,102,255,0.1) 0%, transparent 60%)' },
  card: { width: '100%', maxWidth: '500px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', position: 'relative', zIndex: 1, boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7)' },
  
  title: { fontSize: '28px', fontWeight: 900, marginBottom: '10px', color: '#fff' },
  stepTitle: { fontSize: '24px', fontWeight: 800, marginBottom: '25px', color: '#fff' },
  desc: { fontSize: '16px', opacity: 0.6, marginBottom: '30px', lineHeight: '1.5' },
  
  iconBadge: { width: '60px', height: '60px', borderRadius: '20px', background: 'rgba(0,102,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  
  input: { width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '15px', outline: 'none', transition: '0.3s' },
  label: { display: 'block', fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' },
  miniLabel: { display: 'block', fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', marginTop: '20px', marginBottom: '10px' },
  
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  btnGroup: { display: 'flex', gap: '15px', marginTop: '30px' },
  
  btnMain: { flex: 1, background: '#0066ff', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' },
  btnSuccess: { flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  btnSec: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer' },
  btnDisabled: { flex: 1, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: 800, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  eyeIcon: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, cursor: 'pointer' },
  toggleRow: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: '15px' },
  
  switchBase: (active: boolean) => ({ width: '40px', height: '22px', background: active ? '#0066ff' : '#334155', borderRadius: '20px', position: 'relative', transition: '0.3s' }),
  switchKnob: (active: boolean) => ({ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: active ? '21px' : '3px', transition: '0.3s' }),
  
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { padding: '10px 15px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s' },
  
  summaryCard: { background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px', textAlign: 'center', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' },
  checkList: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', alignItems: 'center' },
  legalBox: { marginTop: '25px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' },
  
  errorBox: { background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 },
  
  codeBlock: { background: '#000', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', position: 'relative' },
  copyBtn: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }
};

const animProps = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};