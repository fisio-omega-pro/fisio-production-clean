'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { User, Shield, Loader2, CheckCircle2, Ticket, CreditCard, AlertCircle } from 'lucide-react';
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

  useEffect(() => {
    // Mantener sincronía si llega clinicData después
    setNombre(initialName);
    setEmail(initialEmail);
  }, [initialName, initialEmail]);

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
      </div>
    </div>
  );
};
