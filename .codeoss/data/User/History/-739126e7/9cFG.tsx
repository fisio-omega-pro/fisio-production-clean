'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, Info,
  Clock, PauseCircle, AlertTriangle, Stethoscope, Baby, Car, ShieldAlert, Activity,
  Ticket, Euro, Check, CreditCard, Banknote, Smartphone, FileText, Loader2
} from 'lucide-react';

// --- TIPOS ---
interface ClinicData {
  nombre: string; email: string; password: string;
  calle: string; numero: string; ciudad: string; cp: string; provincia: string;
  apertura: string; cierre: string;
  hace_descanso: boolean; descanso_inicio: string; descanso_fin: string;
  flags: string[]; acepta_bonos: boolean; precio_bono_5: number;
  precio_sesion: number; fianza: number; metodos_pago: string[];
  aceptacion_legal: boolean; plan: string;
}

const PROVINCIAS = ["Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Jaén", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza", "Ceuta", "Melilla"];

const INITIAL_DATA: ClinicData = {
  nombre: '', email: '', password: '',
  calle: '', numero: '', ciudad: '', cp: '', provincia: '',
  apertura: '09:00', cierre: '20:00',
  hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
  flags: [], acepta_bonos: false, precio_bono_5: 200,
  precio_sesion: 50, fianza: 15, metodos_pago: ['Stripe'],
  aceptacion_legal: false, plan: 'solo'
};

export default function OnboardingSwiss() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ClinicData>(INITIAL_DATA);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [passStrength, setPassStrength] = useState(0); // 0-3

  // --- LOGICA ---
  const update = (field: keyof ClinicData, val: any) => {
    setFormData(prev => ({...prev, [field]: val}));
    if (errors[field]) setErrors(prev => ({...prev, [field]: false})); // Limpiar error al escribir
    
    if (field === 'password') checkPassStrength(val);
  };

  const checkPassStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9!@#$%^&*]/.test(pass)) score++;
    setPassStrength(score);
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.nombre) newErrors.nombre = true;
      if (!formData.calle) newErrors.calle = true;
      if (!formData.ciudad) newErrors.ciudad = true;
      if (!formData.provincia) newErrors.provincia = true;
      if (!formData.email.includes('@')) newErrors.email = true;
      if (passStrength < 2) newErrors.password = true; // Mínimo fuerza media
    }
    
    if (currentStep === 3) {
      if (formData.metodos_pago.length === 0) newErrors.metodos = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(prev => prev + 1);
  };

  const finalizarRegistro = async () => {
    if (!formData.aceptacion_legal) {
      setErrors({ legal: true });
      return;
    }
    setLoading(true);
    // Simulación de envío (Aquí iría el fetch real)
    try {
        const res = await fetch('/api/register', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if(data.success) {
            window.location.href = data.payment_url || '/dashboard';
        } else {
            alert(data.error);
        }
    } catch(e) { alert("Error de conexión"); }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <div style={s.aurora} />
      
      <motion.div layout style={s.card}>
        
        {/* HEADER LIMPIO */}
        <div style={s.headerBar}>
          <div style={s.brandLogo}>FISIOTOOL <span style={{color:'#fff'}}>PRO</span></div>
          <div style={s.stepIndicator}>PASO {step} DE 3</div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* --- PASO 1: IDENTIDAD --- */}
          {step === 1 && (
            <motion.div key="s1" {...anim}>
              <h1 style={s.pageTitle}>Identidad Clínica</h1>
              <p style={s.pageSub}>Configura la sede principal. Podrás añadir más después.</p>

              <div style={s.formGrid}>
                <Input 
                  label="NOMBRE COMERCIAL" placeholder="Ej: Clínica Avanza" 
                  value={formData.nombre} onChange={v => update('nombre', v)} error={errors.nombre}
                  icon={<Building2 size={16}/>}
                />
                
                <div style={s.row2}>
                  <Input label="CALLE / AVENIDA" value={formData.calle} onChange={v => update('calle', v)} error={errors.calle} />
                  <Input label="Nº" value={formData.numero} onChange={v => update('numero', v)} width="80px" />
                </div>

                <div style={s.row3}>
                  <Input label="C.P." value={formData.cp} onChange={v => update('cp', v)} />
                  <Input label="CIUDAD" value={formData.ciudad} onChange={v => update('ciudad', v)} error={errors.ciudad} />
                  <Select 
                    label="PROVINCIA" value={formData.provincia} onChange={v => update('provincia', v)} 
                    options={PROVINCIAS} error={errors.provincia}
                  />
                </div>

                <div style={s.divider} />

                <Input 
                  label="EMAIL ADMINISTRADOR" type="email" placeholder="admin@clinica.com"
                  value={formData.email} onChange={v => update('email', v)} error={errors.email}
                  icon={<Mail size={16}/>}
                />

                <div style={s.passWrapper}>
                  <Input 
                    label="CONTRASEÑA MAESTRA" type={showPass ? "text" : "password"}
                    value={formData.password} onChange={v => update('password', v)} error={errors.password}
                    icon={<Lock size={16}/>}
                    rightIcon={
                      <div onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </div>
                    }
                  />
                  {/* BARRA DE FUERZA */}
                  <div style={s.strengthBar}>
                    <div style={{...s.strengthFill, width: '33%', background: passStrength > 0 ? (passStrength > 1 ? '#10b981' : '#f59e0b') : '#334155'}} />
                    <div style={{...s.strengthFill, width: '33%', background: passStrength > 1 ? '#10b981' : '#334155'}} />
                    <div style={{...s.strengthFill, width: '33%', background: passStrength > 2 ? '#10b981' : '#334155'}} />
                  </div>
                  <p style={s.hint}>Mínimo 8 caracteres, mayúscula y número.</p>
                </div>
              </div>

              <FooterBtn text="CONFIGURAR HORARIOS" onClick={handleNext} />
            </motion.div>
          )}

          {/* --- PASO 2: OPERATIVA --- */}
          {step === 2 && (
            <motion.div key="s2" {...anim}>
              <h1 style={s.pageTitle}>Horarios y Reglas</h1>
              <p style={s.pageSub}>Define tu jornada laboral y filtros de seguridad.</p>

              <div style={s.timeBox}>
                <div style={s.timeHeader}><Clock size={16} color="#3b82f6"/> HORARIO DE ATENCIÓN</div>
                <div style={s.row2}>
                  <Input label="APERTURA" type="time" value={formData.apertura} onChange={v => update('apertura', v)} />
                  <Input label="CIERRE" type="time" value={formData.cierre} onChange={v => update('cierre', v)} />
                </div>
              </div>

              {/* PAUSA OPERATIVA (ANTES CAFÉ) */}
              <div onClick={() => update('hace_descanso', !formData.hace_descanso)} style={s.toggleRow}>
                <div style={s.iconCircle}><PauseCircle size={18} color="#fff"/></div>
                <span style={s.toggleLabel}>Pausa Operativa (Mediodía)</span>
                <Switch active={formData.hace_descanso} />
              </div>

              <AnimatePresence>
                {formData.hace_descanso && (
                  <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} style={{overflow:'hidden'}}>
                    <div style={s.subRow}>
                      <Input label="INICIO PAUSA" type="time" value={formData.descanso_inicio} onChange={v => update('descanso_inicio', v)} />
                      <Input label="FIN PAUSA" type="time" value={formData.descanso_fin} onChange={v => update('descanso_fin', v)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BANDERAS ROJAS */}
              <label style={s.sectionLabel}>TRIAJE CLÍNICO (BANDERAS ROJAS)</label>
              <div style={s.flagsGrid}>
                {[
                  {id:'trafico', label:'Tráfico', icon: Car},
                  {id:'oncologico', label:'Oncológico', icon: Activity},
                  {id:'postquirurgico', label:'Post-Qx', icon: AlertTriangle},
                  {id:'pediatria', label:'Pediatría', icon: Baby}
                ].map(f => (
                  <FlagItem key={f.id} {...f} active={formData.flags.includes(f.id)} onClick={() => {
                    const newFlags = formData.flags.includes(f.id) ? formData.flags.filter(x=>x!==f.id) : [...formData.flags, f.id];
                    update('flags', newFlags);
                  }} />
                ))}
              </div>

              <div style={s.btnRow}>
                <BackBtn onClick={() => setStep(1)} />
                <FooterBtn text="TARIFAS Y LEGAL" onClick={handleNext} />
              </div>
            </motion.div>
          )}

          {/* --- PASO 3: TARIFAS Y CONTRATO --- */}
          {step === 3 && (
            <motion.div key="s3" {...anim}>
              <h1 style={s.pageTitle}>Facturación</h1>
              <p style={s.pageSub}>Configura tus tarifas y métodos de cobro.</p>

              <div style={s.row2}>
                <Input label="PRECIO SESIÓN (€)" type="number" value={formData.precio_sesion} onChange={v => update('precio_sesion', v)} />
                <Input label="FIANZA RESERVA (€)" type="number" value={formData.fianza} onChange={v => update('fianza', v)} />
              </div>

              {/* BONOS TOGGLE */}
              <div onClick={() => update('acepta_bonos', !formData.acepta_bonos)} style={s.toggleRow}>
                <div style={{...s.iconCircle, background:'rgba(16,185,129,0.2)'}}><Ticket size={18} color="#10b981"/></div>
                <span style={s.toggleLabel}>Venta de Bonos</span>
                <Switch active={formData.acepta_bonos} color="#10b981" />
              </div>
              
              {formData.acepta_bonos && (
                <div style={{marginTop:'15px', marginBottom:'25px'}}>
                  <Input label="PRECIO BONO 5 (€)" type="number" value={formData.precio_bono_5} onChange={v => update('precio_bono_5', v)} />
                </div>
              )}

              {/* LEGAL BOX */}
              <div style={errors.legal ? {...s.legalBox, borderColor:'#ef4444'} : s.legalBox}>
                <FileText size={24} color="#64748b" />
                <div>
                  <p style={s.legalText}>
                    Al activar, aceptas el <strong>Contrato de Encargado de Tratamiento</strong> (RGPD UE 2016/679) y confirmas que eres un profesional sanitario colegiado.
                  </p>
                  <div onClick={() => update('aceptacion_legal', !formData.aceptacion_legal)} style={s.checkboxRow}>
                    <div style={{...s.checkbox, background: formData.aceptacion_legal ? '#0066ff' : 'transparent'}}>
                      {formData.aceptacion_legal && <Check size={12} color="#fff"/>}
                    </div>
                    <span style={s.checkLabel}>He leído y acepto los términos.</span>
                  </div>
                </div>
              </div>

              <div style={s.btnRow}>
                <BackBtn onClick={() => setStep(2)} />
                <FooterBtn text={loading ? "ACTIVANDO..." : "CONFIRMAR CUENTA"} onClick={finalizarRegistro} disabled={loading} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- COMPONENTES ATÓMICOS DE DISEÑO SUIZO ---

const Input = ({label, value, onChange, placeholder, type="text", width, error, icon, rightIcon}: any) => (
  <div style={{width: width || '100%', marginBottom: '20px'}}>
    <label style={{...s.label, color: error ? '#ef4444' : '#64748b'}}>{label}</label>
    <div style={{...s.inputWrapper, borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.1)'}}>
      {icon && <div style={s.leftIcon}>{icon}</div>}
      <input 
        style={{...s.input, paddingLeft: icon ? '45px' : '15px'}} 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder}
      />
      {rightIcon && rightIcon}
    </div>
  </div>
);

const Select = ({label, value, onChange, options, error}: any) => (
  <div style={{width: '100%', marginBottom: '20px'}}>
    <label style={{...s.label, color: error ? '#ef4444' : '#64748b'}}>{label}</label>
    <div style={{...s.inputWrapper, borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.1)'}}>
      <select style={s.select} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Seleccionar...</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
);

const Switch = ({active, color='#0066ff'}: any) => (
  <div style={{...s.switchTrack, background: active ? color : '#334155'}}>
    <div style={{...s.switchKnob, transform: active ? 'translateX(18px)' : 'translateX(0)'}} />
  </div>
);

const FlagItem = ({label, icon: Icon, active, onClick}: any) => (
  <div onClick={onClick} style={{...s.flagCard, borderColor: active ? '#ef4444' : 'rgba(255,255,255,0.1)', background: active ? 'rgba(239,68,68,0.1)' : 'transparent'}}>
    <Icon size={20} color={active ? '#ef4444' : '#64748b'} />
    <span style={{...s.flagLabel, color: active ? '#fff' : '#64748b'}}>{label}</span>
  </div>
);

const FooterBtn = ({text, onClick, disabled}: any) => (
  <button onClick={onClick} disabled={disabled} style={{...s.btnPrimary, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer'}}>
    {text} {disabled && <Loader2 className="animate-spin" size={18}/>}
  </button>
);

const BackBtn = ({onClick}: any) => (
  <button onClick={onClick} style={s.btnSecondary}><ArrowLeft size={20}/></button>
);

const anim = { initial: {opacity:0, y:10}, animate: {opacity:1, y:0}, exit: {opacity:0, y:-10}, transition: {duration:0.3} };

// --- ESTILOS DE INGENIERÍA VISUAL ---
const s: any = {
  container: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif', padding: '20px' },
  aurora: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 70%)', zIndex: 0 },
  card: { width: '100%', maxWidth: '550px', background: '#18181b', border: '1px solid #27272a', borderRadius: '24px', padding: '40px', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #27272a', paddingBottom: '20px' },
  brandLogo: { fontSize: '14px', fontWeight: 900, color: '#3b82f6', letterSpacing: '1px' },
  stepIndicator: { fontSize: '10px', fontWeight: 700, color: '#52525b', background: '#27272a', padding: '4px 10px', borderRadius: '100px' },

  pageTitle: { fontSize: '24px', fontWeight: 700, color: '#fff', margin: '0 0 10px 0' },
  pageSub: { fontSize: '14px', color: '#a1a1aa', marginBottom: '30px' },

  label: { display: 'block', fontSize: '10px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid', borderRadius: '8px', transition: '0.2s', background: '#09090b' },
  input: { width: '100%', background: 'transparent', border: 'none', padding: '12px 15px', color: '#fff', fontSize: '14px', outline: 'none' },
  select: { width: '100%', background: 'transparent', border: 'none', padding: '12px 15px', color: '#fff', fontSize: '14px', outline: 'none' },
  
  leftIcon: { position: 'absolute', left: '15px', color: '#52525b' },
  eyeBtn: { position: 'absolute', right: '15px', color: '#52525b', cursor: 'pointer' },

  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  row3: { display: 'grid', gridTemplateColumns: '0.8fr 1.2fr 1fr', gap: '15px' },
  
  divider: { height: '1px', background: '#27272a', margin: '30px 0' },
  
  passWrapper: { marginBottom: '20px' },
  strengthBar: { display: 'flex', gap: '4px', height: '4px', marginTop: '8px', borderRadius: '2px', overflow: 'hidden' },
  strengthFill: { height: '100%', transition: '0.3s' },
  hint: { fontSize: '11px', color: '#52525b', marginTop: '6px' },

  // Time & Toggles
  timeBox: { background: '#27272a', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  timeHeader: { fontSize: '11px', fontWeight: 800, color: '#fff', marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' },
  toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: '#27272a', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', border: '1px solid transparent', transition: '0.2s' },
  toggleLabel: { flex: 1, fontSize: '14px', fontWeight: 600, color: '#fff', marginLeft: '12px' },
  iconCircle: { width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  switchTrack: { width: '40px', height: '22px', borderRadius: '20px', position: 'relative', transition: '0.3s' },
  switchKnob: { width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  subRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', padding: '10px 0 20px 0' },

  // Flags
  sectionLabel: { fontSize: '11px', fontWeight: 800, color: '#ef4444', marginBottom: '15px', display: 'block', marginTop: '30px' },
  flagsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' },
  flagCard: { padding: '15px', borderRadius: '12px', border: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.2s' },
  flagLabel: { fontSize: '11px', fontWeight: 700, textAlign: 'center' },

  // Legal
  legalBox: { background: '#27272a', padding: '20px', borderRadius: '12px', display: 'flex', gap: '15px', border: '1px solid transparent', transition: '0.3s' },
  legalText: { fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5', margin: 0 },
  checkboxRow: { display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px', cursor: 'pointer' },
  checkbox: { width: '20px', height: '20px', borderRadius: '6px', border: '2px solid #52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  checkLabel: { fontSize: '13px', fontWeight: 700, color: '#fff' },

  // Buttons
  btnRow: { display: 'flex', gap: '15px', marginTop: '40px' },
  btnPrimary: { flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' },
  btnSecondary: { width: '50px', background: '#27272a', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};