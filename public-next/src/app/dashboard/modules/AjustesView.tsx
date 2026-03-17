'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { User, Shield, Loader2, CheckCircle2, Ticket, CreditCard, AlertCircle, Lock } from 'lucide-react';
import { InputField, ActionButton } from '../components/Atoms';
import { dashboardAPI } from '../services';
import { useRouter } from 'next/navigation';

const PLAN_LABELS: Record<string, string> = { solo: 'Pro (100€/mes)', team: 'Multi-Sede (300€/mes)', corporate: 'Corporate (500€/mes)' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_NOMBRE = 100;
const MAX_EMAIL = 120;

export const AjustesView = ({ clinicData, onUpdated }: { clinicData: any; onUpdated: () => void }) => {
  const router = useRouter();
  const isOwner = !!clinicData?.currentUser?.isOwner;
  const initialName = String(clinicData?.nombre_clinica || clinicData?.nombre || '').trim();
  const initialEmail = String(clinicData?.email || '').trim();

  const [nombre, setNombre] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [esMulticlinica, setEsMulticlinica] = useState(!!clinicData?.es_multiclinica);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bonosSaving, setBonosSaving] = useState(false);
  const [bonosError, setBonosError] = useState<string | null>(null);
  const bonosActive = !!clinicData?.config_ia?.acepta_bonos;

  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const hasSubscription = !!clinicData?.subscription_active;
  const cancelAtPeriodEnd = !!clinicData?.subscription_cancel_at_period_end;
  const cancelAtSeconds = typeof clinicData?.subscription_cancel_at === 'number' ? clinicData.subscription_cancel_at : null;
  const cancelAtDate = cancelAtSeconds ? new Date(cancelAtSeconds * 1000) : null;
  const planLabel = PLAN_LABELS[String(clinicData?.plan || 'solo').toLowerCase()] || 'Pro';

  useEffect(() => {
    setNombre(initialName);
    setEmail(initialEmail);
    setEsMulticlinica(!!clinicData?.es_multiclinica);
  }, [initialName, initialEmail, clinicData?.es_multiclinica]);

  const emailValid = EMAIL_REGEX.test(email.trim()) && email.trim().length <= MAX_EMAIL;
  const canSave = useMemo(() => {
    if (!nombre.trim() || nombre.trim().length > MAX_NOMBRE) return false;
    if (!emailValid) return false;
    if (saving) return false;
    return true;
  }, [nombre, emailValid, saving]);

  const save = async () => {
    if (!canSave) return;
    setError(null);
    setDone(false);
    setSaving(true);
    try {
      await dashboardAPI.updateSettings(nombre.trim(), email.trim(), esMulticlinica);
      await onUpdated();
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    setSubscriptionError(null);
    setCancelLoading(true);
    try {
      await dashboardAPI.cancelSubscription();
      await onUpdated();
      setCancelConfirm(false);
    } catch (e: any) {
      setSubscriptionError(e?.message || 'No se pudo programar la cancelación.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleToggleBonos = async () => {
    if (bonosSaving) return;
    setBonosError(null);
    setBonosSaving(true);
    try {
      if (bonosActive) await dashboardAPI.deactivateBonos();
      else await dashboardAPI.activateBonos();
      await onUpdated();
    } catch (e: any) {
      setBonosError(e?.message || 'No se pudo cambiar el estado de los bonos.');
    } finally {
      setBonosSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-4xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Configuración</h2>
        <p className="text-gray-500 text-sm">Gestiona tu identidad y seguridad en la plataforma.</p>
      </div>

      <div className="space-y-6">

        {/* ── PERFIL ── */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <User size={14} /> Perfil de Administrador
          </h3>
          {!isOwner && (
            <div className="flex items-center gap-2 mb-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
              <Lock size={12} /> Solo el propietario puede modificar estos datos.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <InputField
                label="Nombre (clínica)"
                placeholder="Ej: Clínica Avanza"
                value={nombre}
                onChange={(v) => { setNombre(v.slice(0, MAX_NOMBRE)); setError(null); setDone(false); }}
                disabled={!isOwner}
              />
              {nombre.length > MAX_NOMBRE * 0.85 && (
                <span className="text-[10px] text-gray-500">{nombre.length}/{MAX_NOMBRE}</span>
              )}
            </div>
            <div>
              <InputField
                label="Email de acceso"
                placeholder="admin@clinica.com"
                value={email}
                onChange={(v) => { setEmail(v.slice(0, MAX_EMAIL)); setError(null); setDone(false); }}
                disabled={!isOwner}
              />
              {email.length > 0 && !emailValid && (
                <span className="text-[10px] text-red-400">Email no válido</span>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <AlertCircle size={14} />{error}
            </div>
          )}
          {done && (
            <div className="mt-4 flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
              <CheckCircle2 size={14} /> Guardado correctamente.
            </div>
          )}

          {isOwner && (
            <>
              <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-white uppercase italic tracking-tighter">Modo Multiclínica</span>
                  <span className="text-[10px] text-gray-500 max-w-[280px]">
                    Permite citas simultáneas de diferentes especialistas. Si se desactiva, solo puede haber una cita por hora en todo el centro.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEsMulticlinica(!esMulticlinica)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${esMulticlinica ? 'bg-blue-600' : 'bg-gray-700'}`}
                  aria-checked={esMulticlinica}
                  role="switch"
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${esMulticlinica ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="mt-6">
                <ActionButton onClick={save} disabled={!canSave} fullWidth>
                  {saving ? <Loader2 className="animate-spin mx-auto" /> : 'GUARDAR CAMBIOS'}
                </ActionButton>
              </div>
            </>
          )}
        </section>

        {/* ── SUSCRIPCIÓN (solo owner) ── */}
        {isOwner && (
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <CreditCard size={14} /> Suscripción
            </h3>
            {!hasSubscription ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">No tienes suscripción activa. Puedes contratar FisioTool Pro desde Cobros.</p>
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
                  <AlertCircle size={16} /> Cancelación programada
                </div>
                <p className="text-sm text-gray-400">
                  Tu suscripción se cancelará al final del periodo. Tendrás acceso hasta el{' '}
                  <strong className="text-white">
                    {cancelAtDate ? cancelAtDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </strong>.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">
                  Plan actual: <strong className="text-white">{planLabel}</strong>. Renovación automática mensual.
                </p>

                {!cancelConfirm ? (
                  <button
                    type="button"
                    onClick={() => setCancelConfirm(true)}
                    className="w-fit px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 text-[11px] font-black uppercase tracking-widest"
                  >
                    Darse de baja
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                    <p className="text-sm text-red-300 font-medium">
                      ¿Confirmas la baja? Seguirás teniendo acceso hasta fin del periodo pagado y no se realizarán más cobros.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCancelSubscription}
                        disabled={cancelLoading}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                      >
                        {cancelLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                        Sí, darme de baja
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCancelConfirm(false); setSubscriptionError(null); }}
                        className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-gray-500">
                  Al darte de baja, la suscripción se cancela al final del mes en curso. No se te cobrará de nuevo.
                </p>
                {subscriptionError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <AlertCircle size={14} />{subscriptionError}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── SEGURIDAD ── */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Shield size={14} /> Seguridad
          </h3>
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
            Por seguridad, el cambio de contraseña se hace con enlace de verificación al email registrado.
          </div>
        </section>

        {/* ── BONOS (solo owner) ── */}
        {isOwner && (
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
            <h3 className="text-xs font-black text-green-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Ticket size={14} /> Bonos en tu protocolo
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Incluir venta de bonos (sesiones prepagadas). Puedes activarlo o desactivarlo cuando quieras.
            </p>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-white">
                {bonosActive ? 'Bonos activos' : 'Bonos desactivados'}
              </span>
              <button
                type="button"
                onClick={handleToggleBonos}
                disabled={bonosSaving}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${bonosActive ? 'bg-green-600' : 'bg-gray-700'} disabled:opacity-60`}
                aria-checked={bonosActive}
                role="switch"
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bonosActive ? 'left-7' : 'left-1'}`} />
                {bonosSaving && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white w-4 h-4" />
                  </span>
                )}
              </button>
            </div>
            {bonosError && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
                <AlertCircle size={12} />{bonosError}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
