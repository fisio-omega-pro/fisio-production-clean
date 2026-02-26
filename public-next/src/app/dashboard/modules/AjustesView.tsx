'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { User, Shield, Loader2, CheckCircle2, Ticket, CreditCard, AlertCircle, Bot } from 'lucide-react';
import { InputField, ActionButton } from '../components/Atoms';
import { dashboardAPI } from '../services';
import { useRouter } from 'next/navigation';

const PLAN_LABELS: Record<string, string> = { solo: 'Pro (100€/mes)', team: 'Multi-Sede (300€/mes)', corporate: 'Corporate (500€/mes)' };

export const AjustesView = ({ clinicData, onUpdated }: { clinicData: any; onUpdated: () => void }) => {
  const router = useRouter();
  const initialName = String(clinicData?.nombre_clinica || clinicData?.nombre || '').trim();
  const initialEmail = String(clinicData?.email || '').trim();
  const [nombre, setNombre] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bonosSaving, setBonosSaving] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const bonosActive = !!clinicData?.config_ia?.acepta_bonos;
  const hasSubscription = !!clinicData?.subscription_active;
  const cancelAtPeriodEnd = !!clinicData?.subscription_cancel_at_period_end;
  const cancelAtSeconds = typeof clinicData?.subscription_cancel_at === 'number' ? clinicData.subscription_cancel_at : null;
  const cancelAtDate = cancelAtSeconds ? new Date(cancelAtSeconds * 1000) : null;
  const planLabel = PLAN_LABELS[String(clinicData?.plan || 'solo').toLowerCase()] || 'Pro';

  // 🤖 Estado para configuración de Ana
  const [anaConfig, setAnaConfig] = useState({
    name: clinicData?.ana_name || 'Ana',
    color: clinicData?.ana_color || '#075E54',
    welcome: clinicData?.ana_welcome || '',
    photo: clinicData?.ana_photo || '',
    useClinicLogo: clinicData?.ana_use_clinic_logo || false
  });
  const [anaSaving, setAnaSaving] = useState(false);
  const [anaSaved, setAnaSaved] = useState(false);

  // 🎨 Sugerencias de marca basadas en tipo de clínica
  const getSuggestions = () => {
    const clinicType = clinicData?.tipo_clinica || clinicData?.especialidad || '';
    const suggestions = [];

    if (clinicType.toLowerCase().includes('deportiva')) {
      suggestions.push({
        name: 'Coach',
        color: '#FF5722',
        welcome: '¡Hola! Soy Coach, tu especialista en recuperación deportiva. Estoy aquí para ayudarte a volver al 100%.',
        reason: 'Energía y motivación para deportistas'
      });
    }

    if (clinicType.toLowerCase().includes('pediatrica')) {
      suggestions.push({
        name: 'Luna',
        color: '#4CAF50',
        welcome: '¡Hola! Soy Luna, tu asistente amigable para los más pequeños. Estoy aquí para hacer la terapia divertida.',
        reason: 'Color suave y amigable para niños'
      });
    }

    if (clinicType.toLowerCase().includes('geriatrica')) {
      suggestions.push({
        name: 'Elena',
        color: '#2196F3',
        welcome: '¡Hola! Soy Elena, tu asistente especializada en cuidados para mayores. Estoy aquí para ayudarte con paciencia.',
        reason: 'Confianza y seriedad para adultos mayores'
      });
    }

    if (clinicType.toLowerCase().includes('estética')) {
      suggestions.push({
        name: 'Sofía',
        color: '#9C27B0',
        welcome: '¡Hola! Soy Sofía, tu asistente de belleza y bienestar. Estoy aquí para ayudarte a sentirte mejor.',
        reason: 'Elegancia y sofisticación para estética'
      });
    }

    // Sugerencia general si no coincide
    if (suggestions.length === 0) {
      suggestions.push({
        name: 'Ana',
        color: '#075E54',
        welcome: '¡Hola! Soy Ana, tu asistente de fisioterapia. Estoy aquí para ayudarte con tus citas y seguimiento.',
        reason: 'Profesional y confiable para fisioterapia general'
      });
    }

    return suggestions;
  };

  useEffect(() => {
    // Mantener sincronía si llega clinicData después
    setNombre(initialName);
    setEmail(initialEmail);
  }, [initialName, initialEmail]);

  useEffect(() => {
    // Sincronizar configuración de Ana
    setAnaConfig({
      name: clinicData?.ana_name || 'Ana',
      color: clinicData?.ana_color || '#075E54',
      welcome: clinicData?.ana_welcome || '',
      photo: clinicData?.ana_photo || '',
      useClinicLogo: clinicData?.ana_use_clinic_logo || false
    });
  }, [clinicData]);

  const canSave = useMemo(() => {
    if (!nombre.trim()) return false;
    if (!email.trim() || !email.includes('@')) return false;
    if (saving) return false;
    return true;
  }, [nombre, email, saving]);

  const save = async () => {
    setError(null);
    setDone(false);
    setSaving(true);
    try {
      await dashboardAPI.updateSettings(nombre.trim(), email.trim());
      await onUpdated();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  // 🤖 Función para guardar configuración de Ana
  const saveAnaConfig = async () => {
    setAnaSaving(true);
    setAnaSaved(false);
    try {
      // TODO: Implementar API call para guardar configuración de Ana
      // await dashboardAPI.updateAnaConfig(anaConfig);
      
      // Simulación por ahora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await onUpdated();
      setAnaSaved(true);
      setTimeout(() => setAnaSaved(false), 2000);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar la configuración de Ana.');
    } finally {
      setAnaSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-4xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Configuración</h2>
        <p className="text-gray-500 text-sm">Gestiona tu identidad y seguridad en la plataforma.</p>
      </div>
      <div className="space-y-6">
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
           <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><User size={14}/> Perfil de Administrador</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombre (clínica)" placeholder="Ej: Clínica Avanza" value={nombre} onChange={setNombre} />
              <InputField label="Email de acceso" placeholder="admin@clinica.com" value={email} onChange={setEmail} />
           </div>
            {error && <div className="mt-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">{error}</div>}
            {done && <div className="mt-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-2"><CheckCircle2 size={16}/> Guardado.</div>}
            <div className="mt-6">
              <ActionButton onClick={save} disabled={!canSave} fullWidth>
                {saving ? <Loader2 className="animate-spin mx-auto" /> : 'GUARDAR CAMBIOS'}
              </ActionButton>
            </div>
        </section>

        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><CreditCard size={14}/> Suscripción</h3>
          {!hasSubscription ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-400">No tienes suscripción activa. Puedes contratar FisioTool Pro desde Cobros o completando el pago tras el registro.</p>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-fit px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest"
              >
                Ir a Cobros
              </button>
            </div>
          ) : cancelAtPeriodEnd ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                <AlertCircle size={16}/>
                Cancelación programada
              </div>
              <p className="text-sm text-gray-400">
                Tu suscripción se cancelará al final del periodo de facturación. Tendrás acceso hasta el{' '}
                <strong className="text-white">
                  {cancelAtDate ? cancelAtDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                </strong>.
                A partir de esa fecha no se realizarán más cobros.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-400">
                Plan actual: <strong className="text-white">{planLabel}</strong>. Renovación automática cada mes.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('¿Quieres darte de baja? Tendrás acceso hasta el final del periodo que ya has pagado y no se te volverá a cobrar.')) return;
                    setSubscriptionError(null);
                    setCancelLoading(true);
                    try {
                      await dashboardAPI.cancelSubscription();
                      await onUpdated();
                    } catch (e: any) {
                      setSubscriptionError(e?.message || 'No se pudo programar la cancelación.');
                    } finally {
                      setCancelLoading(false);
                    }
                  }}
                  disabled={cancelLoading}
                  className="px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 text-[11px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                >
                  {cancelLoading ? <Loader2 className="animate-spin" size={14}/> : null}
                  Darse de baja
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Al pulsar &quot;Darse de baja&quot;, tu suscripción se cancelará al final del mes en curso. No se te cobrará de nuevo y podrás seguir usando FisioTool hasta esa fecha.
              </p>
              {subscriptionError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">{subscriptionError}</div>
              )}
            </div>
          )}
        </section>

        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
           <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Shield size={14}/> Seguridad</h3>
           <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Cambiar contraseña de acceso</p>
              <button
                onClick={() => router.push(`/recuperar-contraseña?email=${encodeURIComponent(email.trim())}`)}
                className="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest"
              >
                RECUPERAR
              </button>
           </div>
            <div className="text-[11px] text-gray-500 mt-3">
              Por seguridad, el cambio de contraseña se hace con enlace de verificación.
            </div>
        </section>
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
           <h3 className="text-xs font-black text-green-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Ticket size={14}/> Bonos en tu protocolo</h3>
           <p className="text-sm text-gray-400 mb-4">
             Incluir venta de bonos (sesiones prepagadas). Puedes activarlo o desactivarlo cuando quieras.
           </p>
           <div className="flex items-center justify-between gap-4">
             <span className="text-sm font-medium text-white">
               {bonosActive ? 'Bonos activos' : 'Bonos desactivados'}
             </span>
             <button
               type="button"
               onClick={async () => {
                 if (bonosSaving) return;
                 setBonosSaving(true);
                 try {
                   if (bonosActive) await dashboardAPI.deactivateBonos();
                   else await dashboardAPI.activateBonos();
                   await onUpdated();
                 } catch (e: any) {
                   setError(e?.message || 'No se pudo cambiar.');
                 } finally {
                   setBonosSaving(false);
                 }
               }}
               disabled={bonosSaving}
               className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${bonosActive ? 'bg-green-600' : 'bg-gray-700'}`}
               aria-checked={bonosActive}
               role="switch"
             >
               <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bonosActive ? 'left-7' : 'left-1'}`} />
               {bonosSaving && <span className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-white w-4 h-4" /></span>}
             </button>
           </div>
        </section>

        {/* 🤖 CONFIGURACIÓN DE ANA */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Bot size={14} /> Asistente Ana
          </h3>
          
          <div className="space-y-6">
            {/* Nombre de Ana */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Nombre del asistente</label>
              <input
                type="text"
                value={anaConfig.name}
                onChange={(e) => setAnaConfig(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                placeholder="Nombre del asistente"
              />
            </div>

            {/* Color del tema */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Color del tema</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'WhatsApp Verde', hex: '#075E54', description: 'Verde profesional, confianza' },
                  { name: 'Naranja Vibrante', hex: '#FF5722', description: 'Energía, creatividad' },
                  { name: 'Azul Corporativo', hex: '#2196F3', description: 'Profesional, seriedad' },
                  { name: 'Verde Naturaleza', hex: '#4CAF50', description: 'Salud, bienestar' },
                  { name: 'Morado Elegante', hex: '#9C27B0', description: 'Lujo, sofisticación' },
                  { name: 'Rojo Pasión', hex: '#F44336', description: 'Intensidad, vitalidad' }
                ].map((colorOption) => (
                  <button
                    key={colorOption.hex}
                    onClick={() => setAnaConfig(prev => ({ ...prev, color: colorOption.hex }))}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      anaConfig.color === colorOption.hex 
                        ? 'border-white bg-white/10' 
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: colorOption.hex }}
                    />
                    <div className="text-xs text-white font-medium">{colorOption.name}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{colorOption.description}</div>
                    {anaConfig.color === colorOption.hex && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color personalizado para avanzados */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Color personalizado (opcional)</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={anaConfig.color}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validar que sea un color hex válido
                      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        setAnaConfig(prev => ({ ...prev, color: value }));
                      }
                    }}
                    placeholder="#FF5722"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50"
                    maxLength={7}
                  />
                </div>
                <div 
                  className="w-12 h-12 rounded-xl border-2 border-white/20 flex items-center justify-center"
                  style={{ backgroundColor: anaConfig.color }}
                >
                  {anaConfig.color === '#FFFFFF' && (
                    <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Formato: #RRGGBB (ej: #FF5722)
              </div>
            </div>

            {/* Mensaje de bienvenida */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Mensaje de bienvenida personalizado</label>
              <textarea
                value={anaConfig.welcome}
                onChange={(e) => setAnaConfig(prev => ({ ...prev, welcome: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                rows={3}
                placeholder="Mensaje personalizado de bienvenida..."
              />
            </div>

            {/* Foto de perfil */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Foto de perfil</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                  {clinicData?.ana_photo ? (
                    <img src={clinicData.ana_photo} alt="Ana" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Bot size={24} />
                    </div>
                  )}
                </div>
                <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-xs hover:bg-blue-500/30 transition-colors">
                  Cambiar foto
                </button>
              </div>
            </div>

            {/* 📱 Previsualización en vivo del chat */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">📱 Previsualización en vivo</label>
              <div className="bg-[#E5DDD5] rounded-2xl p-4 border border-white/20">
                {/* Header del chat */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/30">
                  <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
                    {clinicData?.ana_photo ? (
                      <img src={clinicData.ana_photo} alt="Ana" className="w-full h-full object-cover" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{anaConfig.name}</div>
                    <div className="text-xs text-gray-600">Asistente de {clinicData?.nombre_clinica || 'la clínica'}</div>
                  </div>
                </div>
                
                {/* Mensaje de ejemplo */}
                <div className="mt-3">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm max-w-[80%]">
                    <p className="text-sm text-gray-800">
                      ¡Hola! Soy {anaConfig.name} 🎉
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {anaConfig.welcome || 'Estoy aquí para ayudarte con tus citas y seguimiento.'}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de color */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: anaConfig.color }}></div>
                  <span className="text-xs text-gray-600">Color del tema: {anaConfig.color}</span>
                </div>
              </div>
            </div>

            {/* 🎯 Sugerencias inteligentes de marca */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">🎯 Sugerencias para tu clínica</label>
              <div className="space-y-2">
                {getSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setAnaConfig({
                      name: suggestion.name,
                      color: suggestion.color,
                      welcome: suggestion.welcome,
                      photo: anaConfig.photo,
                      useClinicLogo: anaConfig.useClinicLogo
                    })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white/30"
                          style={{ backgroundColor: suggestion.color }}
                        />
                        <div className="text-left">
                          <div className="text-sm font-medium text-white">{suggestion.name}</div>
                          <div className="text-xs text-gray-400">{suggestion.reason}</div>
                        </div>
                      </div>
                      <div className="text-xs text-blue-400">Aplicar</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 italic">
                      "{suggestion.welcome.substring(0, 60)}..."
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-xs text-gray-500">
                {anaSaved && (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Configuración guardada
                  </span>
                )}
              </div>
              <button
                onClick={saveAnaConfig}
                disabled={anaSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {anaSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Guardar configuración
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
