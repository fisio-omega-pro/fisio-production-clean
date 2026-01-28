'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, 
  Clock, PauseCircle, AlertTriangle, Stethoscope, Baby, Car, ShieldAlert, Activity,
  Ticket, Euro, Check, CreditCard, Banknote, Smartphone, FileText, Loader2
} from 'lucide-react';

// --- 1. DEFINICIÓN DE TIPOS (EL CONTRATO SUIZO) ---
interface ClinicData {
  nombre: string; email: string; password: string;
  calle: string; numero: string; ciudad: string; cp: string; provincia: string;
  apertura: string; cierre: string;
  hace_descanso: boolean; descanso_inicio: string; descanso_fin: string;
  flags: string[]; acepta_bonos: boolean; precio_bono_5: number;
  precio_sesion: number; fianza: number; metodos_pago: string[];
  aceptacion_legal: boolean; plan: string;
}

interface InputProps {
  label: string; value: string | number; onChange: (val: string) => void;
  placeholder?: string; type?: string; width?: string; error?: boolean;
  icon?: React.ReactNode; rightIcon?: React.ReactNode;
}

interface SelectProps {
  label: string; value: string; onChange: (val: string) => void;
  options: string[]; error?: boolean;
}

// --- CONSTANTES ---
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
  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planURL = params.get('plan');
    if (planURL) setFormData(prev => ({...prev, plan: planURL}));
  }, []);

  const update = (field: keyof ClinicData, val: any) => {
    setFormData(prev => ({...prev, [field]: val}));
    if (errors[field]) setErrors(prev => ({...prev, [field]: false}));
    if (field === 'password') {
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        setPassStrength(score);
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {};
    if (currentStep === 1) {
      if (!formData.nombre) newErrors.nombre = true;
      if (!formData.email.includes('@')) newErrors.email = true;
      if (passStrength < 2) newErrors.password = true;
      if (!formData.calle) newErrors.calle = true;
      if (!formData.ciudad) newErrors.ciudad = true;
      if (!formData.provincia) newErrors.provincia = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const finalizarRegistro = async () => {
    if (!formData.aceptacion_legal) { setErrors({ legal: true }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) window.location.href = data.payment_url || '/dashboard';
      else alert(data.error);
    } catch (e) { alert("Error de conexión"); }
    setLoading(false);
  };

  return (
    <div style={s.container}>
      <div style={s.aurora} />
      <motion.div layout style={s.card}>
        
        <div style={s.headerBar}>
          <div style={s.brandLogo}>FISIOTOOL <span style={{color:'#fff'}}>PRO</span></div>
          <div style={s.stepIndicator}>PASO {step} DE 3</div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...anim}>
              <h1 style={s.pageTitle}>Identidad Clínica</h1>
              <p style={s.pageSub}>Sede principal. Podrás añadir más en el dashboard.</p>
              <div style={s.formGrid}>
                <Input label="NOMBRE COMERCIAL" placeholder="Ej: Clínica Avanza" value={formData.nombre} onChange={(v: string) => update('nombre', v)} error={errors.nombre} icon={<Building2 size={16}/>} />
                <div style={s.row2}>
                  <Input label="CALLE / AVENIDA" value={formData.calle} onChange={(v: string) => update('calle', v)} error={errors.calle} />
                  <Input label="Nº" value={formData.numero} onChange={(v: string) => update('numero', v)} width="80px" />
                </div>
                <div style={s.row3}>
                  <Input label="C.P." value={formData.cp} onChange={(v: string) => update('cp', v)} />
                  <Input label="CIUDAD" value={formData.ciudad} onChange={(v: string) => update('ciudad', v)} error={errors.ciudad} />
                  <Select label="PROVINCIA" value={formData.provincia} onChange={(v: string) => update('provincia', v)} options={PROVINCIAS} error={errors.provincia} />
                </div>
                <div style={s.divider} />
                <Input label="EMAIL ADMINISTRADOR" type="email" value={formData.email} onChange={(v: string) => update('email', v)} error={errors.email} icon={<Mail size={16}/>} />
                <div style={s.passWrapper}>
                  <Input 
                    label="CONTRASEÑA" type={showPass ? "text" : "password"} value={formData.password} onChange={(v: string) => update('password', v)} error={errors.password} icon={<Lock size={16}/>}
                    rightIcon={<div onClick={() => setShowPass(!showPass)} style={s.eyeBtn}>{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</div>}
                  />
                  <div style={s.strengthBar}>
                    <div style={{...s.strengthFill, width: '33%', background: passStrength > 0 ? (passStrength > 1 ? '#10b981' : '#f59e0b') : '#334155'}} />
                    <div style={{...s.strengthFill, width: '33%', background: passStrength > 1 ? '#10b981' : '#334155'}} />
                    <div style={{...s.strengthFill, width: '33%', background: passStrength > 2 ? '#10b981' : '#334155'}} />
                  </div>
                </div>
              </div>
              <FooterBtn text="CONFIGURAR HORARIOS" onClick={handleNext} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...anim}>
              <h1 style={s.pageTitle}>Horarios y Reglas</h1>
              <div style={s.timeBox}>
                <div style={s.timeHeader}><Clock size={16} color="#3b82f6"/> JORNADA LABORAL</div>
                <div style={s.row2}>
                  <Input label="APERTURA" type="time" value={formData.apertura} onChange={(v: string) => update('apertura', v)} />
                  <Input label="CIERRE" type="time" value={formData.cierre} onChange={(v: string) => update('cierre', v)} />
                </div>
              </div>
              <div onClick={() => update('hace_descanso', !formData.hace_descanso)} style={s.toggleRow}>
                <div style={s.iconCircle}><PauseCircle size={18} color="#fff"/></div>
                <span style={s.toggleLabel}>Pausa Mediodía</span>
                <Switch active={formData.hace_descanso} />
              </div>
              {formData.hace_descanso && (
                <div style={s.subRow}>
                  <Input label="INICIO PAUSA" type="time" value={formData.descanso_inicio} onChange={(v: string) => update('descanso_inicio', v)} />
                  <Input label="FIN PAUSA" type="time" value={formData.descanso_fin} onChange={(v: string) => update('descanso_fin', v)} />
                </div>
              )}
              <label style={s.sectionLabel}>BANDERAS ROJAS (SEGURIDAD)</label>
              <div style={s.flagsGrid}>
                {[
                  {id:'trafico', label:'Tráfico', icon: Car}, {id:'oncologico', label:'Onco', icon: Activity},
                  {id:'postquirurgico', label:'Post-Qx', icon: AlertTriangle}, {id:'pediatria', label:'Pediatría', icon: Baby}
                ].map(f => (
                  <FlagItem key={f.id} {...f} active={formData.flags.includes(f.id)} onClick={() => {
                    const nf = formData.flags.includes(f.id) ? formData.flags.filter(x=>x!==f.id) : [...formData.flags, f.id];
                    update('flags', nf);
                  }} />
                ))}
              </div>
              <div style={s.btnRow}><BackBtn onClick={() => setStep(1)} /><FooterBtn text="FACTURACIÓN" onClick={handleNext} /></div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...anim}>
              <h1 style={s.pageTitle}>Facturación</h1>
              <div style={s.row2}>
                <Input label="SESIÓN (€)" type="number" value={formData.precio_sesion} onChange={(v: string) => update('precio_sesion', Number(v))} />
                <Input label="FIANZA (€)" type="number" value={formData.fianza} onChange={(v: string) => update('fianza', Number(v))} />
              </div>
              <div onClick={() => update('acepta_bonos', !formData.acepta_bonos)} style={s.toggleRow}>
                <div style={{...s.iconCircle, background:'rgba(16,185,129,0.2)'}}><Ticket size={18} color="#10b981"/></div>
                <span style={s.toggleLabel}>Venta de Bonos</span>
                <Switch active={formData.acepta_bonos} color="#10b981" />
              </div>
              <div style={errors.legal ? {...s.legalBox, borderColor:'#ef4444'} : s.legalBox}>
                <FileText size={24} color="#64748b" />
                <div>
                  <p style={s.legalText}>Aceptas el contrato de Encargado de Tratamiento según RGPD UE 2016/679.</p>
                  <div onClick={() => update('aceptacion_legal', !formData.aceptacion_legal)} style={s.checkboxRow}>
                    <div style={{...s.checkbox, background: formData.aceptacion_legal ? '#0066ff' : 'transparent'}}>
                      {formData.aceptacion_legal && <Check size={12} color="#fff"/>}
                    </div>
                    <span style={s.checkLabel}>Acepto los términos legales.</span>
                  </div>
                </div>
              </div>
              <div style={s.btnRow}><BackBtn onClick={() => setStep(2)} /><FooterBtn text={loading ? "..." : "ACTIVAR CUENTA"} onClick={finalizarRegistro} disabled={loading} /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES TIPADOS ---
const Input = ({label, value, onChange, placeholder, type="text", width, error, icon, rightIcon}: InputProps) => (
  <div style={{width: width || '100%', marginBottom: '15px'}}>
    <label style={{...s.label, color: error ? '#ef4444' : '#64748b'}}>{label}</label>
    <div style={{...s.inputWrapper, borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.1)'}}>
      {icon && <div style={s.leftIcon}>{icon}</div>}
      <input style={{...s.input, paddingLeft: icon ? '45px' : '12px'}} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      {rightIcon}
    </div>
  </div>
);

const Select = ({label, value, onChange, options, error}: SelectProps) => (
  <div style={{width: '100%', marginBottom: '15px'}}>
    <label style={{...s.label, color: error ? '#ef4444' : '#64748b'}}>{label}</label>
    <div style={{...s.inputWrapper, borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.1)'}}>
      <select style={s.select} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Provincia...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </div>
);

const Switch = ({active, color='#0066ff'}: {active:boolean, color?:string}) => (
  <div style={{...s.switchTrack, background: active ? color : '#334155'}}><div style={{...s.switchKnob, transform: active ? 'translateX(18px)' : 'translateX(0)'}} /></div>
);

const FlagItem = ({label, icon: Icon, active, onClick}: any) => (
  <div onClick={onClick} style={{...s.flagCard, borderColor: active ? '#ef4444' : 'rgba(255,255,255,0.1)', background: active ? 'rgba(239,68,68,0.1)' : 'transparent'}}>
    <Icon size={18} color={active ? '#ef4444' : '#64748b'} />
    <span style={{...s.flagLabel, color: active ? '#fff' : '#64748b'}}>{label}</span>
  </div>
);

const FooterBtn = ({text, onClick, disabled}: any) => (
  <button onClick={onClick} disabled={disabled} style={s.btnPrimary}>{text} {disabled && <Loader2 className="animate-spin" size={16}/>}</button>
);

const BackBtn = ({onClick}: any) => (<button onClick={onClick} style={s.btnSecondary}><ArrowLeft size={20}/></button>);

// --- ESTILOS ---
const s: any = {
  container: { minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' },
  aurora: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 70%)' },
  card: { width: '100%', maxWidth: '500px', background: '#18181b', border: '1px solid #27272a', borderRadius: '24px', padding: '35px', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  headerBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #27272a', paddingBottom: '15px' },
  brandLogo: { fontSize: '12px', fontWeight: 900, color: '#3b82f6', letterSpacing: '1px' },
  stepIndicator: { fontSize: '9px', fontWeight: 700, color: '#a1a1aa', background: '#27272a', padding: '4px 10px', borderRadius: '100px' },
  pageTitle: { fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 5px 0' },
  pageSub: { fontSize: '13px', color: '#71717a', marginBottom: '25px' },
  label: { display: 'block', fontSize: '9px', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid', borderRadius: '10px', background: '#09090b' },
  input: { width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' },
  select: { width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none' },
  leftIcon: { position: 'absolute', left: '15px', color: '#3f3f46' },
  eyeBtn: { position: 'absolute', right: '12px', color: '#3f3f46', cursor: 'pointer' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  row3: { display: 'grid', gridTemplateColumns: '0.7fr 1.3fr 1fr', gap: '12px' },
  divider: { height: '1px', background: '#27272a', margin: '20px 0' },
  passWrapper: { marginBottom: '10px' },
  strengthBar: { display: 'flex', gap: '3px', height: '3px', marginTop: '8px' },
  strengthFill: { height: '100%', borderRadius: '2px', transition: '0.3s' },
  timeBox: { background: '#09090b', padding: '15px', borderRadius: '12px', border: '1px solid #27272a', marginBottom: '15px' },
  timeHeader: { fontSize: '10px', fontWeight: 800, color: '#a1a1aa', marginBottom: '12px', display:'flex', gap:'6px' },
  toggleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#27272a', borderRadius: '12px', marginBottom: '8px', cursor: 'pointer' },
  toggleLabel: { flex: 1, fontSize: '13px', fontWeight: 600, color: '#fff', marginLeft: '12px' },
  iconCircle: { width: '28px', height: '28px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  switchTrack: { width: '36px', height: '18px', borderRadius: '20px', position: 'relative', transition: '0.3s' },
  switchKnob: { width: '14px', height: '14px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px', transition: '0.3s' },
  subRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '10px' },
  sectionLabel: { fontSize: '9px', fontWeight: 800, color: '#f43f5e', marginBottom: '12px', display: 'block', marginTop: '20px' },
  flagsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' },
  flagCard: { padding: '12px', borderRadius: '10px', border: '1px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  flagLabel: { fontSize: '10px', fontWeight: 700 },
  legalBox: { background: '#09090b', padding: '15px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid #27272a', marginTop: '20px' },
  legalText: { fontSize: '11px', color: '#71717a', lineHeight: '1.4', margin: 0 },
  checkboxRow: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '12px', cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkLabel: { fontSize: '12px', fontWeight: 600, color: '#fff' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '30px' },
  btnPrimary: { flex: 1, background: '#3b82f6', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  btnSecondary: { width: '45px', background: '#27272a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

const anim = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.2 } };