'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, 
  Clock, PauseCircle, AlertTriangle, Stethoscope, Baby, Car, ShieldAlert, Activity,
  Ticket, Euro, Check, CreditCard, Banknote, Smartphone, FileText, Loader2
} from 'lucide-react';

// --- 1. CONTRATO DE DATOS (INTERFACES) ---
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
  // --- ESTADOS ---
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ClinicData>(INITIAL_DATA);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Añadido para soportar la nueva función
  const [passStrength, setPassStrength] = useState(0);

  // --- EFECTOS ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planURL = params.get('plan');
    if (planURL) setFormData(prev => ({...prev, plan: planURL}));
  }, []);

  // --- LÓGICA DE CONTROL ---
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

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  // --- FUNCIÓN ACTUALIZADA SEGÚN SOLICITUD ---
  const finalizarRegistro = async () => {
    if (!formData.aceptacion_legal) { 
        setErrors({ legal: true }); 
        return; 
    }
    
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Error desconocido en el registro");
      }

      // ÉXITO: Guardamos token para persistir sesión
      localStorage.setItem('fisio_token', result.token);
      
      // 🛑 CAMBIO NINJA: Selección manual de destino
      const irAlPago = confirm("✅ CUENTA CREADA.\n\n¿Quieres ir a la Pasarela de Pago (Stripe) ahora?\n\n[ACEPTAR] = Ir a Pagar\n[CANCELAR] = Entrar al Dashboard (Modo Prueba)");
      
      if (irAlPago && result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        window.location.href = '/dashboard';
      }

    } catch (e: any) {
      console.error("Registration Error:", e);
      setErrorMsg(e.message);
      alert(e.message); // Feedback inmediato al usuario
    } finally {
      setLoading(false);
    }
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
              <p style={s.pageSub}>Introduce los datos de tu sede principal.</p>
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
              <button onClick={handleNext} style={s.btnPrimaryFull}>CONFIGURAR HORARIOS <ArrowRight size={18}/></button>
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
              <div style={s.btnRow}><button onClick={() => setStep(1)} style={s.btnSecondary}><ArrowLeft size={20}/></button><button onClick={handleNext} style={s.btnPrimary}>FACTURACIÓN <ArrowRight size={18}/></button></div>
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
              <div style={s.btnRow}>
                <button onClick={() => setStep(2)} style={s.btnSecondary}><ArrowLeft size={20}/></button>
                <button 
                    onClick={finalizarRegistro} 
                    disabled={loading} 
                    style={s.btnPrimary}
                >
                    {loading ? <Loader2 className="animate-spin" size={18}/> : "ACTIVAR CUENTA"}
                </button>
              </div>
              {errorMsg && <p style={{color: '#ef4444', fontSize: '12px', marginTop: '10px', textAlign: 'center'}}>{errorMsg}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES (Sin cambios requeridos) ---
const Input = ({label, value, onChange, placeholder, type="text", width, error, icon, rightIcon}: InputProps) => (
  <div style={{width: width || '100%', marginBottom: '15px'}}>
    <label style={{...s.label, color: error ? '#ef4444' : '#64748b'}}>{label}</label>
    <div style={{...s.inputWrapper, borderColor: error ? '#ef4444' : 'rgba(255,255,255,0.1)'}}>
      {icon && <div style={s.leftIcon}>{icon}</div>}
      <input style={{...s.input, paddingLeft: icon ? '45px' : '12px'}} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={p