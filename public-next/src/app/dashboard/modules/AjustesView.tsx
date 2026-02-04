'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { User, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { InputField, ActionButton } from '../components/Atoms';
import { dashboardAPI } from '../services';
import { useRouter } from 'next/navigation';

export const AjustesView = ({ clinicData, onUpdated }: { clinicData: any; onUpdated: () => void }) => {
  const router = useRouter();
  const initialName = String(clinicData?.nombre_clinica || clinicData?.nombre || '').trim();
  const initialEmail = String(clinicData?.email || '').trim();
  const [nombre, setNombre] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      </div>
    </div>
  );
};
