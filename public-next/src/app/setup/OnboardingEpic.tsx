'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock,
  Clock, PauseCircle, AlertTriangle, Stethoscope, Baby, Car, ShieldAlert, Activity,
  Ticket, Euro, Check, CreditCard, Banknote, Smartphone, FileText, Loader2,
  Landmark, MapPin, X, Phone
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiBase';

interface ClinicData {
  nombre: string; email: string; password: string;
  referral_code?: string;
  timezone?: string;
  telefono: string; prefijo_telefono: string;
  calle: string; numero: string; ciudad: string; cp: string; provincia: string;
  apertura: string; cierre: string;
  hace_descanso: boolean; descanso_inicio: string; descanso_fin: string;
  flags: string[]; acepta_bonos: boolean; precio_bono_5: number;
  precio_sesion: number; fianza: number; metodos_pago: string[];
  aceptacion_legal: boolean; plan: string;
  is_blind: boolean;
}

const COUNTRY_CODES = [
  { code: '+34', country: 'ES', flag: '🇪🇸', label: 'España' },
  { code: '+1', country: 'US', flag: '🇺🇸', label: 'USA' },
  { code: '+44', country: 'GB', flag: '🇬🇧', label: 'UK' },
  { code: '+33', country: 'FR', flag: '🇫🇷', label: 'Francia' },
  { code: '+49', country: 'DE', flag: '🇩🇪', label: 'Alemania' },
  { code: '+39', country: 'IT', flag: '🇮🇹', label: 'Italia' },
  { code: '+351', country: 'PT', flag: '🇵🇹', label: 'Portugal' },
  { code: '+52', country: 'MX', flag: '🇲🇽', label: 'México' },
  { code: '+55', country: 'BR', flag: '🇧🇷', label: 'Brasil' },
  { code: '+54', country: 'AR', flag: '🇦🇷', label: 'Argentina' },
  { code: '+57', country: 'CO', flag: '🇨🇴', label: 'Colombia' },
  { code: '+56', country: 'CL', flag: '🇨🇱', label: 'Chile' },
];

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
  const hasAnnouncedStep = useRef<number | null>(null);

  const [formData, setFormData] = useState<ClinicData>({
    nombre: '', email: '', password: '', referral_code: '', timezone: '', telefono: '', prefijo_telefono: '+34', calle: '', numero: '', ciudad: '', cp: '', provincia: '',
    apertura: '09:00', cierre: '20:00', hace_descanso: false, descanso_inicio: '14:00', descanso_fin: '16:00',
    flags: [], acepta_bonos: false, precio_bono_5: 225, precio_sesion: 50, fianza: 15, metodos_pago: ['Stripe'],
    aceptacion_legal: false, plan: 'solo',
    is_blind: false
  });

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    if (!formData.is_blind) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text || '').trim());
      u.lang = 'es-ES';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {
      // best-effort
    }
  }, [formData.is_blind]);

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
    const refCode = params.get('ref') || params.get('referral') || params.get('codigo') || params.get('code');
    const tzParam = params.get('tz') || params.get('timezone');
    const isBlind =
      params.get('is_blind') === '1' ||
      params.get('blind') === '1' ||
      params.get('access') === '1';
    let detectedTz = '';
    try {
      detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      detectedTz = '';
    }
    setFormData(prev => ({
      ...prev,
      plan: p || prev.plan,
      is_blind: isBlind || prev.is_blind,
      referral_code: String(refCode || prev.referral_code || '').toUpperCase(),
      timezone: String(tzParam || prev.timezone || detectedTz || 'Europe/Brussels')
    }));
    if (isBlind && typeof window !== 'undefined') {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Modo audible activado. Vamos a configurar tu cuenta en tres pasos.');
        u.lang = 'es-ES';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {
        // best-effort
      }
    }
  }, []);

  useEffect(() => {
    if (!formData.is_blind) return;
    if (hasAnnouncedStep.current === step) return;
    hasAnnouncedStep.current = step;
    const scripts: Record<number, string> = {
      1: 'Paso 1 de 3. Identidad corporativa. Rellena nombre comercial, dirección fiscal, email y contraseña. Luego pulsa "Siguiente paso".',
      2: 'Paso 2 de 3. Operativa y reglas. Define tu horario, la pausa de mediodía y el triaje de seguridad. Luego pulsa "Siguiente".',
      3: 'Paso 3 de 3. Facturación y legal. Configura tarifa, fianza, métodos de cobro y acepta los términos para finalizar el alta.',
    };
    speak(scripts[step] || `Paso ${step}.`);
  }, [step, formData.is_blind, speak]);

  const update = (field: keyof ClinicData, val: any) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const toggleList = (list: 'flags' | 'metodos_pago', id: string) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].includes(id) ? prev[list].filter(f => f !== id) : [...prev[list], id]
    }));
  };

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
    if (formData.is_blind && Object.keys(newErrors).length) {
      const missing = Object.keys(newErrors).filter((k) => k !== 'legal');
      if (missing.length) speak(`Faltan campos obligatorios en este paso: ${missing.join(', ')}.`);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(prev => prev + 1);
  };

  const [registeredClinicId, setRegisteredClinicId] = useState<string | null>(null);
  const [paymentRetrying, setPaymentRetrying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const retryPayment = async () => {
    setPaymentRetrying(true);
    setPaymentError(null);
    try {
      const token = localStorage.getItem('fisio_token');
      if (!token) { window.location.href = '/login'; return; }
      const res = await fetch(`${API_BASE_URL}/api/dashboard/upgrade-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan: formData.plan || 'solo' })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPaymentError(data.error || 'No se pudo crear la sesión de pago. Inténtalo de nuevo o accede al dashboard.');
      }
    } catch (e: any) {
      setPaymentError(e?.message || 'Error de conexión');
    } finally {
      setPaymentRetrying(false);
    }
  };

  const finalize = async () => {
    if (!formData.aceptacion_legal) return setErrors({ legal: true });
    setLoading(true);
    setPaymentError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      let data: { success?: boolean; error?: string; token?: string; payment_url?: string; clinicId?: string; payment_error?: string } = {};
      try {
        data = await res.json();
      } catch (_) {
        const text = await res.text();
        alert(res.ok ? 'Error inesperado' : (text || `Error ${res.status}`));
        setLoading(false);
        return;
      }
      if (data.success) {
        localStorage.setItem('fisio_token', data.token!);
        if (formData.is_blind) localStorage.setItem('fisio_is_blind', '1');
        if (data.clinicId) setRegisteredClinicId(data.clinicId);

        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else if (!data.payment_error) {
          // 🎁 Trial gratuito: acceso directo al dashboard sin pedir tarjeta
          window.location.href = '/dashboard';
        } else {
          setPaymentError(data.payment_error);
          setStep(4);
        }
      } else {
        alert(data.error || 'Error en el registro');
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
        alert('Error de conexión. Comprueba que el backend esté en marcha y que tu contraseña cumpla: 8+ caracteres, mayúscula, minúscula, número y un símbolo (#@!$%&*…).');
      } else {
        alert(msg || 'Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const timeInputClass = "w-full bg-[#0a0b10] border border-white/10 rounded-xl text-white text-center text-lg font-bold py-3 focus:border-blue-500/50 focus:outline-none";
  const timeInputClassSmall = "w-full bg-[#0a0b10] border border-white/10 rounded-lg text-white text-center text-sm font-medium py-2 focus:border-blue-500/50 focus:outline-none";
  const anim = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.3 } };

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        layout
        className="w-full max-w-2xl bg-[#12131e] border border-white/5 rounded-3xl shadow-2xl shadow-black/50 relative z-10 overflow-hidden"
      >
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
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold mb-2">Identidad Corporativa</h1>
                <p className="text-gray-400 text-sm mb-8">Datos fiscales de la sede principal.</p>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="nombre">Nombre Comercial</Label>
                    <Input id="nombre" icon={<Building2 size={16} />} placeholder="Ej: Clínica Avanza" aria-label="Nombre comercial de la clínica" value={formData.nombre} onChange={(v: string) => update('nombre', v)} error={errors.nombre} />
                  </div>
                  <div>
                    <Label>Dirección Fiscal</Label>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="col-span-3">
                        <Input id="calle" placeholder="Calle / Avenida" aria-label="Calle o avenida" value={formData.calle} onChange={(v: string) => update('calle', v)} error={errors.calle} icon={<MapPin size={16} />} />
                      </div>
                      <div className="col-span-1">
                        <Input id="numero" placeholder="Nº" aria-label="Número de portal" value={formData.numero} onChange={(v: string) => update('numero', v)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input id="cp" placeholder="C.P." aria-label="Código postal" value={formData.cp} onChange={(v: string) => update('cp', v)} error={errors.cp} />
                      <Input id="ciudad" placeholder="Ciudad" aria-label="Ciudad" value={formData.ciudad} onChange={(v: string) => update('ciudad', v)} error={errors.ciudad} />
                      <div className="relative">
                        <select
                          id="provincia"
                          aria-label="Provincia"
                          aria-invalid={!!errors.provincia}
                          className={`w-full bg-[#0a0b10] border ${errors.provincia ? 'border-red-500' : 'border-white/10'} rounded-xl text-sm text-white px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          value={formData.provincia}
                          onChange={e => update('provincia', e.target.value)}
                        >
                          <option value="">Provincia</option>
                          {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500"><ArrowRight size={14} className="rotate-90" /></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-white/5 w-full my-6" />
                  <div>
                    <Label>Teléfono de Contacto</Label>
                    <div className="flex gap-2">
                      <div className="relative shrink-0" style={{ width: '110px' }}>
                        <select
                          aria-label="Prefijo telefónico del país"
                          className="w-full bg-[#0a0b10] border border-white/10 rounded-xl text-sm text-white px-3 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={formData.prefijo_telefono}
                          onChange={e => update('prefijo_telefono', e.target.value)}
                        >
                          {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                        </select>
                        <div className="absolute right-2 top-3.5 pointer-events-none text-gray-500"><ArrowRight size={12} className="rotate-90" /></div>
                      </div>
                      <div className="flex-1">
                        <Input id="telefono" type="tel" icon={<Phone size={16} />} placeholder="612 345 678" aria-label="Número de teléfono" value={formData.telefono} onChange={(v: string) => update('telefono', v)} error={errors.telefono} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <Label htmlFor="email">Email Administrador</Label>
                      <Input id="email" type="email" icon={<Mail size={16} />} aria-label="Email del administrador" value={formData.email} onChange={(v: string) => update('email', v)} error={errors.email} />
                    </div>
                    <div>
                      <Label htmlFor="password">Contraseña Maestra</Label>
                      <div className="relative mb-3">
                        <Input id="password" type={showPass ? 'text' : 'password'} icon={<Lock size={16} />} aria-label="Contraseña maestra" value={formData.password} onChange={(v: string) => update('password', v)} error={errors.password} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-500 hover:text-white" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                          {showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1 mb-2" role="group" aria-label={`Fuerza de contraseña: ${Object.values(passCriteria).filter(Boolean).length} de 4 criterios cumplidos`}>
                        <div className={`h-1 rounded-full transition-all ${passCriteria.length ? 'bg-green-500' : 'bg-gray-700'}`} role="presentation" />
                        <div className={`h-1 rounded-full transition-all ${passCriteria.upper ? 'bg-green-500' : 'bg-gray-700'}`} role="presentation" />
                        <div className={`h-1 rounded-full transition-all ${passCriteria.number ? 'bg-green-500' : 'bg-gray-700'}`} role="presentation" />
                        <div className={`h-1 rounded-full transition-all ${passCriteria.special ? 'bg-green-500' : 'bg-gray-700'}`} role="presentation" />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-500 font-medium" aria-hidden="true">
                        <span className={passCriteria.length ? 'text-green-500' : ''}>8+ Caracteres</span>
                        <span className={passCriteria.upper ? 'text-green-500' : ''}>ABC</span>
                        <span className={passCriteria.number ? 'text-green-500' : ''}>123</span>
                        <span className={passCriteria.special ? 'text-green-500' : ''}>#@!</span>
                      </div>
                      <div className="sr-only" aria-live="polite">
                        {passCriteria.length ? 'Longitud mínima cumplida.' : 'Necesitas al menos 8 caracteres.'}
                        {passCriteria.upper ? ' Mayúscula cumplida.' : ' Necesitas una mayúscula.'}
                        {passCriteria.number ? ' Número cumplido.' : ' Necesitas un número.'}
                        {passCriteria.special ? ' Carácter especial cumplido.' : ' Necesitas un carácter especial.'}
                      </div>
                    </div>
                  </div>
                  {formData.referral_code && (
                    <div className="mt-4 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-4">
                      <p className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wide">Invitado por un partner</p>
                      <p className="text-sm text-white mt-1">Has entrado con un enlace de referido. Al completar el registro, tú y quien te invitó tendréis <strong>50% de descuento el primer mes</strong>.</p>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button onClick={handleNext}>Siguiente Paso <ArrowRight size={18} /></Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" {...anim}>
                <h1 className="text-2xl font-bold mb-2">Operativa y Reglas</h1>
                <p className="text-gray-400 text-sm mb-8">Define tu horario y entrena a Ana para el triaje.</p>
                <div className="bg-[#18181b] border border-white/5 rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-blue-400 uppercase tracking-widest"><Clock size={14} /> Jornada Laboral</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="apertura">Apertura</Label><input id="apertura" aria-label="Hora de apertura" type="time" className={timeInputClass} value={formData.apertura} onChange={e => update('apertura', e.target.value)} /></div>
                    <div><Label htmlFor="cierre">Cierre</Label><input id="cierre" aria-label="Hora de cierre" type="time" className={timeInputClass} value={formData.cierre} onChange={e => update('cierre', e.target.value)} /></div>
                  </div>
                </div>
                <div
                  role="checkbox"
                  aria-checked={formData.hace_descanso}
                  aria-label="Pausa mediodía: ¿cierras para comer?"
                  tabIndex={0}
                  onClick={() => update('hace_descanso', !formData.hace_descanso)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); update('hace_descanso', !formData.hace_descanso); } }}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all mb-4 ${formData.hace_descanso ? 'bg-blue-900/10 border-blue-500/30' : 'bg-[#18181b] border-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${formData.hace_descanso ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'}`} aria-hidden="true"><PauseCircle size={18} /></div>
                    <div>
                      <div className={`text-sm font-bold ${formData.hace_descanso ? 'text-white' : 'text-gray-400'}`}>Pausa Mediodía</div>
                      <div className="text-[10px] text-gray-500">¿Cierras para comer?</div>
                    </div>
                  </div>
                  <Switch active={formData.hace_descanso} label="Pausa mediodía" />
                </div>
                <AnimatePresence>
                  {formData.hace_descanso && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden grid grid-cols-2 gap-4 mb-6 pl-2">
                      <div><Label htmlFor="descanso_inicio">Inicio</Label><input id="descanso_inicio" aria-label="Hora de inicio del descanso" type="time" className={timeInputClassSmall} value={formData.descanso_inicio} onChange={e => update('descanso_inicio', e.target.value)} /></div>
                      <div><Label htmlFor="descanso_fin">Fin</Label><input id="descanso_fin" aria-label="Hora de fin del descanso" type="time" className={timeInputClassSmall} value={formData.descanso_fin} onChange={e => update('descanso_fin', e.target.value)} /></div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="h-px bg-white/5 w-full my-6" />
                <Label>Triaje de Seguridad (Casos que NO atiendes)</Label>
                <p className="text-xs text-gray-500 mb-4">Ana rechazará educadamente estos casos y te enviará un aviso.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3" role="group" aria-label="Triaje de seguridad: casos que no atiendes">
                  {RED_FLAGS_OPTIONS.map(f => (
                    <div
                      key={f.id}
                      role="checkbox"
                      aria-checked={formData.flags.includes(f.id)}
                      aria-label={f.label}
                      tabIndex={0}
                      onClick={() => toggleList('flags', f.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleList('flags', f.id); } }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${formData.flags.includes(f.id) ? 'bg-red-500/10 border-red-500/40 text-white' : 'bg-[#18181b] border-white/5 text-gray-400 hover:border-white/20'}`}
                    >
                      <f.icon size={20} className={formData.flags.includes(f.id) ? 'text-red-400' : 'text-gray-500'} aria-hidden="true" />
                      <span className="text-[10px] font-bold uppercase">{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"><ArrowLeft size={16} /> Volver</button>
                  <Button onClick={() => setStep(3)}>Siguiente <ArrowRight size={18} /></Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" {...anim}>
                <h1 className="text-2xl font-bold mb-2">Facturación y Legal</h1>
                <p className="text-gray-400 text-sm mb-8">Configura tus precios y formaliza el alta.</p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div><Label htmlFor="precio_sesion">Tarifa Estándar (€)</Label><Input id="precio_sesion" type="number" aria-label="Tarifa estándar por sesión en euros" value={formData.precio_sesion} onChange={(v: string) => update('precio_sesion', v)} /></div>
                  <div><Label htmlFor="fianza">Fianza Reserva (€)</Label><Input id="fianza" type="number" aria-label="Fianza de reserva en euros" value={formData.fianza} onChange={(v: string) => update('fianza', v)} /><span className="text-[10px] text-blue-400 block mt-1">Recomendado: 15-20€</span></div>
                </div>
                <Label>Métodos de Cobro Aceptados</Label>
                <div className="grid grid-cols-3 gap-3 mb-8" role="group" aria-label="Métodos de cobro aceptados">
                  {[{ id: 'Stripe', label: 'Tarjeta', icon: CreditCard, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' }, { id: 'Bizum', label: 'Bizum', icon: Smartphone, color: 'text-pink-400', border: 'border-pink-500/40', bg: 'bg-pink-500/10' }, { id: 'Efectivo', label: 'Efectivo', icon: Banknote, color: 'text-green-400', border: 'border-green-500/40', bg: 'bg-green-500/10' }].map(m => {
                    const active = formData.metodos_pago.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        role="checkbox"
                        aria-checked={active}
                        aria-label={`Método de pago: ${m.label}`}
                        tabIndex={0}
                        onClick={() => toggleList('metodos_pago', m.id)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleList('metodos_pago', m.id); } }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 ${active ? `${m.bg} ${m.border} text-white` : 'bg-[#18181b] border-white/5 text-gray-500'}`}
                      >
                        <m.icon size={20} className={active ? m.color : 'text-gray-600'} aria-hidden="true" />
                        <span className="text-[11px] font-bold">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className={`border rounded-xl p-4 mb-8 transition-all ${formData.acepta_bonos ? 'border-green-500/30 bg-green-900/5' : 'border-white/5 bg-[#18181b]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3"><Ticket size={18} className={formData.acepta_bonos ? 'text-green-500' : 'text-gray-500'} /><span className="text-sm font-bold text-gray-200">Venta de Bonos</span></div>
                    <Switch active={formData.acepta_bonos} onClick={() => update('acepta_bonos', !formData.acepta_bonos)} color="bg-green-500" label="Activar venta de bonos" />
                  </div>
                  {formData.acepta_bonos && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4"><Label htmlFor="precio_bono_5">Precio Bono 5 Sesiones (€)</Label><Input id="precio_bono_5" type="number" aria-label="Precio del bono de 5 sesiones en euros" value={formData.precio_bono_5} onChange={(v: string) => update('precio_bono_5', v)} /></motion.div>)}
                </div>
                <div className={`p-4 rounded-xl border ${errors.legal ? 'border-red-500/50 bg-red-900/10' : 'border-white/5 bg-[#18181b]'} flex items-start gap-4 mb-8`}>
                  <FileText size={20} className="text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-3">Acepto el Contrato de Encargado de Tratamiento (RGPD), la Política de Privacidad y confirmo que soy un profesional colegiado.</p>
                    <div
                      role="checkbox"
                      aria-checked={formData.aceptacion_legal}
                      aria-label="Acepto el contrato de encargado de tratamiento, la política de privacidad y confirmo que soy profesional colegiado"
                      tabIndex={0}
                      onClick={() => update('aceptacion_legal', !formData.aceptacion_legal)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); update('aceptacion_legal', !formData.aceptacion_legal); } }}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.aceptacion_legal ? 'bg-blue-600 border-blue-600' : 'border-gray-600 group-hover:border-gray-400'}`} aria-hidden="true">{formData.aceptacion_legal && <Check size={14} className="text-white" />}</div>
                      <span className={`text-xs font-bold ${formData.aceptacion_legal ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>He leído y acepto los términos</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setStep(2)} className="text-gray-500 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"><ArrowLeft size={16} /> Volver</button>
                  <Button onClick={finalize} disabled={loading || !formData.aceptacion_legal} variant={loading ? 'disabled' : 'success'}>
                    {loading ? <Loader2 className="animate-spin" /> : 'FINALIZAR Y ENTRAR'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                    <CreditCard size={28} className="text-amber-500" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Cuenta creada correctamente</h1>
                  <p className="text-gray-400 text-sm mb-6">
                    Tu registro se ha completado, pero hubo un problema al conectar con la pasarela de pago.
                  </p>
                  {paymentError && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6 text-left">
                      <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-1">Detalle del error</p>
                      <p className="text-xs text-gray-300 break-all">{paymentError}</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={retryPayment}
                      disabled={paymentRetrying}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {paymentRetrying ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                      {paymentRetrying ? 'Conectando con Stripe...' : 'Reintentar pasarela de pago'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { window.location.href = '/dashboard'; }}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl text-sm border border-white/10 transition-all"
                    >
                      Ir al dashboard (configurar pago más tarde)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor} className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{children}</label>;

const Input = ({ type = 'text', placeholder, value, onChange, icon, error, id, 'aria-label': ariaLabel }: any) => (
  <div className={`relative flex items-center bg-[#0a0b10] border rounded-xl transition-all group focus-within:border-blue-500/50 ${error ? 'border-red-500/50' : 'border-white/10'}`}>
    {icon && <div className="absolute left-3 text-gray-500 group-focus-within:text-blue-400" aria-hidden="true">{icon}</div>}
    <input id={id} type={type} aria-label={ariaLabel || placeholder} aria-invalid={!!error} className={`w-full bg-transparent border-none text-sm text-white px-4 py-3 focus:outline-none placeholder:text-gray-700 ${icon ? 'pl-10' : ''}`} placeholder={placeholder} value={value == null ? '' : String(value)} onChange={e => onChange(e.target.value)} />
  </div>
);

const Button = ({ children, onClick, disabled, variant = 'primary' }: any) => {
  const base = "px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]";
  const styles: any = { primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20", success: "bg-green-600 hover:bg-green-500 text-white shadow-green-900/20", disabled: "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none hover:scale-100" };
  return <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>{children}</button>;
};

const Switch = ({ active, onClick, color = 'bg-blue-600', label }: any) => (
  <div
    role="switch"
    aria-checked={!!active}
    aria-label={label}
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${active ? color : 'bg-gray-700'}`}
  >
    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${active ? 'left-6' : 'left-1'}`} />
  </div>
);
