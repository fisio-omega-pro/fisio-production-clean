'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, 
  Clock, PauseCircle, AlertTriangle, Stethoscope, Baby, Car, ShieldAlert, Activity,
  Ticket, Euro, Check, CreditCard, Banknote, Smartphone, FileText, Loader2, Info,
  Landmark, MapPin, X
} from 'lucide-react';
import { dashboardAPI } from '../dashboard/services';

// --- TIPOS DE DATOS ---
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

const RED_FLAGS_OPTIONS = [
  { id: 'trafico', label: 'Accidentes Tráfico', icon: Car },
  { id: 'pelvico', label: 'Suelo Pélvico', icon: Stethoscope },
  { id: 'pediatria', label: 'Pediatría / Bebés', icon: Baby },
  { id: 'oncologico', label: 'Oncológico', icon: Activity },
  { id: 'seguros', label: 'Cía. Seguros', icon: Landmark },
  { id: 'fiebre', label: 'Infeccioso / Fiebre', icon: ShieldAlert },
  { id: 'postquirurgico', label: 'Post-Cirugía', icon: AlertTriangle }
];

export default function OnboardingEpic() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState<ClinicData>({
    nombre: '', email: '', password: '', calle: '', numero: '', ciudad: '', cp: '', provincia: '',
    apertura: '09:00', cierre: '20:00', hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
    flags: [], acepta_bonos: false, precio_bono_5: 225, precio_sesion: 50, fianza: 15, metodos_pago: ['Stripe'],
    aceptacion_legal: false, plan: 'solo'
  });

  // --- LÓGICA DE CONTRASEÑA ---
  const passCriteria = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  };
  const isPassValid = Object.values(passCriteria).every(Boolean);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('plan');
    if (p) setFormData(prev => ({...prev, plan: p}));
  }, []);

  const update = (field: keyof ClinicData, val: any) => {
    setFormData(prev => ({...prev, [field]: val}));
    if (errors[field]) setErrors(prev => ({...prev, [field]: false}));
  };

  const toggleList = (list: 'flags' | 'metodos_pago', id: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(id) ? prev[list].filter(f => f !== id) : [...prev[list], id]
    }));
  };

  // Validaciones por paso
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, boolean> = {};
    if (currentStep === 1) {
      if (!formData.nombre) newErrors.nombre = true;
      if (!formData.calle) newErrors.calle = true;
      if (!formData.ciudad) newErrors.ciudad = true;
      if (!formData.cp) newErrors.cp = true;
      if (!formData.provincia) newErrors.provincia = true;
      if (!formData.email.includes('@')) newErrors.email = true;
      if (!isPassValid) newErrors.password = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(prev => prev + 1);
  };

  const finalize = async () => {
    if (!formData.aceptacion_legal) return setErrors({legal: true});
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('fisio_token', data.token);
        // Pregunta sibilina para evitar fricción
        const irPago = confirm("✅ CUENTA CREADA.\n\n¿Deseas configurar la pasarela de pago ahora?\n[ACEPTAR] = Sí, configurar cobros\n[CANCELAR] = Entrar al Dashboard primero");
        window.location.href = irPago && data.payment_url ? data.payment_url : '/dashboard';
      } else { 
        alert(data.error || "Error en el registro"); 
      }
    } catch (e) { alert("Error de conexión"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* FONDO AMBIENTAL */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        layout 
        className="w-full max-w-2xl bg-[#12131e] border border-white/5 rounded-3xl shadow-2xl shadow-black/50 relative z-10 overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 pt-8 pb-4 border-b border-white/5 flex justify-between items-center bg-[#12131e]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Building2 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white">FISIOTOOL <span className="text-blue-500 font-light">PRO</span></h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Configuración de Élite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-blue-500' : 'w-2 bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            
            {/* --- PASO 1: IDENTIDAD --- */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold mb-2">Identidad Corporativa</h1>
                <p className="text-gray-400 text-sm mb-8">Datos fiscales de la sede principal.</p>

                <div className="space-y-6">
                  {/* NOMBRE */}
                  <div>
                    <Label>Nombre Comercial</Label>
                    <Input 
                      icon={<Building2 size={16} />} 
                      placeholder="Ej: Clínica Avanza" 
                      value={formData.nombre} 
                      onChange={(v:string) => update('nombre', v)} 
                      error={errors.nombre} 
                    />
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-blue-400/80 bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                      <Info size={12} />
                      <span>Nota: Si tienes más clínicas, podrás añadirlas después en el Dashboard.</span>
                    </div>
                  </div>

                  {/* DIRECCIÓN GRID */}
                  <div>
                    <Label>Dirección Fiscal</Label>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="col-span-3">
                        <Input placeholder="Calle / Avenida" value={formData.calle} onChange={(v:string) => update('calle', v)} error={errors.calle} icon={<MapPin size={16}/>} />
                      </div>
                      <div className="col-span-1">
                        <Input placeholder="Nº" value={formData.numero} onChange={(v:string) => update('numero', v)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input placeholder="C.P." value={formData.cp} onChange={(v:string) => update('cp', v)} error={errors.cp} />
                      <Input placeholder="Ciudad" value={formData.ciudad} onChange={(v:string) => update('ciudad', v)} error={errors.ciudad} />
                      <div className="relative">
                        <select 
                          className={`w-full bg-[#0a0b10] border ${errors.provincia ? 'border-red-500' : 'border-white/10'} rounded-xl text-sm text-white px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          value={formData.provincia}
                          onChange={e => update('provincia', e.target.value)}
                        >
                          <option value="">Provincia</option>
                          {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500"><ArrowRight size={14} className="rotate-90"/></div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full my-6" />

                  {/* CREDENCIALES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Email Administrador</Label>
                      <Input type="email" icon={<Mail size={16}/>} value={formData.email} onChange={(v:string) => update('email', v)} error={errors.email} />
                    </div>
                    <div>
                      <Label>Contraseña Maestra</Label>
                      <div className="relative mb-3">
                        <Input 
                          type={showPass ? 'text' : 'password'} 
                          icon={<Lock size={16}/>} 
                          value={formData.password} 
                          onChange={(v:string) => update('password', v)} 
                          error={errors.password} 
                        />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      
                      {/* BARRA DE ENERGÍA DE CONTRASEÑA */}
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        <div className={`h-1 rounded-full transition-all ${passCriteria.length ? 'bg-green-500' : 'bg-gray-700'}`} />
                        <div className={`h-1 rounded-full transition-all ${passCriteria.upper ? 'bg-green-500' : 'bg-gray-700'}`} />
                        <div className={`h-1 rounded-full transition-all ${passCriteria.number ? 'bg-green-500' : 'bg-gray-700'}`} />
                        <div className={`h-1 rounded-full transition-all ${passCriteria.special ? 'bg-green-500' : 'bg-gray-700'}`} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                        <span className={passCriteria.length ? 'text-green-500' : ''}>8+ Caracteres</span>
                        <span className={passCriteria.upper ? 'text-green-500' : ''}>ABC</span>
                        <span className={passCriteria.number ? 'text-green-500' : ''}>123</span>
                        <span className={passCriteria.special ? 'text-green-500' : ''}>#@!</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={handleNext}>
                    Siguiente Paso <ArrowRight size={18} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* --- PASO 2: OPERATIVA --- */}
            {step === 2 && (
              <motion.div key="s2" {...anim}>
                <h1 className="text-2xl font-bold mb-2">Operativa y Reglas</h1>
                <p className="text-gray-400 text-sm mb-8">Define tu horario y entrena a Ana para el triaje.</p>

                {/* HORARIO */}
                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-blue-400 uppercase tracking-widest">
                    <Clock size={14} /> Jornada Laboral
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Apertura</Label>
                      <input type="time" className={timeInputClass} value={formData.apertura} onChange={e => update('apertura', e.target.value)} />
                    </div>
                    <div>
                      <Label>Cierre</Label>
                      <input type="time" className={timeInputClass} value={formData.cierre} onChange={e => update('cierre', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* PAUSA */}
                <div 
                  onClick={() => update('hace_descanso', !formData.hace_descanso)} 
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all mb-4 ${formData.hace_descanso ? 'bg-blue-900/10 border-blue-500/30' : 'bg-[#18181b] border-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.hace_descanso ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                      <PauseCircle size={18} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${formData.hace_descanso ? 'text-white' : 'text-gray-400'}`}>Pausa Mediodía</div>
                      <div className="text-[10px] text-gray-500">¿Cierras para comer?</div>
                    </div>
                  </div>
                  <Switch active={formData.hace_descanso} />
                </div>

                <AnimatePresence>
                  {formData.hace_descanso && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="overflow-hidden grid grid-cols-2 gap-4 mb-6 pl-2">
                       <div><Label>Inicio</Label><input type="time" className={timeInputClassSmall} value={formData.descanso_inicio} onChange={e => update('descanso_inicio', e.target.value)} /></div>
                       <div><Label>Fin</Label><input type="time" className={timeInputClassSmall} value={formData.descanso_fin} onChange={e => update('descanso_fin', e.target.value)} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-px bg-white/5 w-full my-6" />

                {/* BANDERAS ROJAS */}
                <Label>Triaje de Seguridad (Casos que NO atiendes)</Label>
                <p className="text-xs text-gray-500 mb-4">Ana rechazará educadamente estos casos y te enviará un aviso.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {RED_FLAGS_OPTIONS.map(f => (
                    <div 
                      key={f.id} 
                      onClick={() => toggleList('flags', f.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${
                        formData.flags.includes(f.id) 
                        ? 'bg-red-500/10 border-red-500/40 text-white' 
                        : 'bg-[#18181b] border-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <f.icon size={20} className={formData.flags.includes(f.id) ? 'text-red-400' : 'text-gray-500'} />
                      <span className="text-[10px] font-bold uppercase">{f.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"><ArrowLeft size={16}/> Volver</button>
                  <Button onClick={() => setStep(3)}>Siguiente <ArrowRight size={18}/></Button>
                </div>
              </motion.div>
            )}

            {/* --- PASO 3: TARIFAS Y FINAL --- */}
            {step === 3 && (
              <motion.div key="s3" {...anim}>
                <h1 className="text-2xl font-bold mb-2">Facturación y Legal</h1>
                <p className="text-gray-400 text-sm mb-8">Configura tus precios y formaliza el alta.</p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <Label>Tarifa Estándar (€)</Label>
                    <Input type="number" value={formData.precio_sesion} onChange={(v:string) => update('precio_sesion', v)} />
                  </div>
                  <div>
                    <Label>Fianza Reserva (€)</Label>
                    <Input type="number" value={formData.fianza} onChange={(v:string) => update('fianza', v)} />
                    <span className="text-[10px] text-blue-400 block mt-1">Recomendado: 15-20€</span>
                  </div>
                </div>

                {/* MÉTODOS DE PAGO */}
                <Label>Métodos de Cobro Aceptados</Label>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    {id:'Stripe', label:'Tarjeta', icon: CreditCard, color:'text-blue-400', border:'border-blue-500/40', bg:'bg-blue-500/10'},
                    {id:'Bizum', label:'Bizum', icon: Smartphone, color:'text-pink-400', border:'border-pink-500/40', bg:'bg-pink-500/10'},
                    {id:'Efectivo', label:'Efectivo', icon: Banknote, color:'text-green-400', border:'border-green-500/40', bg:'bg-green-500/10'}
                  ].map(m => {
                    const active = formData.metodos_pago.includes(m.id);
                    return (
                      <div 
                        key={m.id} 
                        onClick={() => toggleList('metodos_pago', m.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${
                          active ? `${m.bg} ${m.border} text-white` : 'bg-[#18181b] border-white/5 text-gray-500'
                        }`}
                      >
                        <m.icon size={20} className={active ? m.color : 'text-gray-600'} />
                        <span className="text-[11px] font-bold">{m.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* BONOS */}
                <div className={`border rounded-xl p-4 mb-8 transition-all ${formData.acepta_bonos ? 'border-green-500/30 bg-green-900/5' : 'border-white/5 bg-[#18181b]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Ticket size={18} className={formData.acepta_bonos ? 'text-green-500' : 'text-gray-500'} />
                      <span className="text-sm font-bold text-gray-200">Venta de Bonos</span>
                    </div>
                    <Switch active={formData.acepta_bonos} onClick={() => update('acepta_bonos', !formData.acepta_bonos)} color="bg-green-500" />
                  </div>
                  {formData.acepta_bonos && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4">
                      <Label>Precio Bono 5 Sesiones (€)</Label>
                      <Input type="number" value={formData.precio_bono_5} onChange={(v:string) => update('precio_bono_5', v)} />
                    </motion.div>
                  )}
                </div>

                {/* LEGAL CHECK */}
                <div className={`p-4 rounded-xl border ${errors.legal ? 'border-red-500/50 bg-red-900/10' : 'border-white/5 bg-[#18181b]'} flex items-start gap-4 mb-8`}>
                  <FileText size={20} className="text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                      Acepto el Contrato de Encargado de Tratamiento (RGPD), la Política de Privacidad y confirmo que soy un profesional colegiado.
                    </p>
                    <div 
                      onClick={() => update('aceptacion_legal', !formData.aceptacion_legal)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.aceptacion_legal ? 'bg-blue-600 border-blue-600' : 'border-gray-600 group-hover:border-gray-400'}`}>
                        {formData.aceptacion_legal && <Check size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-bold ${formData.aceptacion_legal ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>He leído y acepto los términos</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"><ArrowLeft size={16}/> Volver</button>
                  <Button onClick={finalize} disabled={loading || !formData.aceptacion_legal} variant={loading ? 'disabled' : 'success'}>
                    {loading ? <Loader2 className="animate-spin" /> : "FINALIZAR Y ENTRAR"}
                  </Button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// --- UI KIT (TAILWIND) ---
const Label = ({children}: {children:React.ReactNode}) => <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{children}</span>;

const Input = ({type="text", placeholder, value, onChange, icon, error}: any) => (
  <div className={`relative flex items-center bg-[#0a0b10] border rounded-xl transition-all group focus-within:border-blue-500/50 ${error ? 'border-red-500/50' : 'border-white/10'}`}>
    {icon && <div className="absolute left-3 text-gray-500 group-focus-within:text-blue-400">{icon}</div>}
    <input 
      type={type} 
      className={`w-full bg-transparent border-none text-sm text-white px-4 py-3 focus:outline-none placeholder:text-gray-700 ${icon ? 'pl-10' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const Button = ({children, onClick, disabled, variant='primary'}: any) => {
  const base = "px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]";
  const styles: any = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-green-900/20",
    disabled: "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none hover:scale-100"
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>{children}</button>;
};

const Switch = ({active, onClick, color="bg-blue-600"}: any) => (
  <div onClick={onClick} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${active ? color : 'bg-gray-700'}`}>
    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${active ? 'left-6' : 'left-1'}`} />
  </div>
);

const timeInputClass = "w-full bg-[#0a0b10] border border-white/10 rounded-xl text-white text-center text-lg font-bold py-3 focus:border-blue-500/50 focus:outline-none";
const timeInputClassSmall = "w-full bg-[#0a0b10] border border-white/10 rounded-lg text-white text-center text-sm font-medium py-2 focus:border-blue-500/50 focus:outline-none";
const anim = { initial: {opacity:0, x:20}, animate: {opacity:1, x:0}, exit: {opacity:0, x:-20}, transition: {duration:0.3} };
