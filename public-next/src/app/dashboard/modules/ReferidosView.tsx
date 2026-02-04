'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Gift, Copy, Check, RefreshCw } from 'lucide-react';
import { dashboardAPI } from '../services';

export const ReferidosView = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{ code: string; count: number; referred: any[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const referralLink = useMemo(() => {
    const code = data?.code || '';
    if (!code) return '';
    return `https://www.fisiotool.com/setup?ref=${encodeURIComponent(code)}`;
  }, [data?.code]);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await dashboardAPI.getReferrals();
      setData(r);
    } catch (e: any) {
      setErr(e?.message || 'Error cargando referidos');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      alert('No se pudo copiar. Copia manualmente el texto.');
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-4xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Programa de Alianzas</h2>
        <p className="text-gray-500 text-sm">Invita a otras clínicas y haz crecer tu ecosistema.</p>
      </div>
      <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 p-6"><Gift size={80} /></div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Referidos</div>
            <h3 className="text-2xl font-black text-white mt-1">Tu código y tracking</h3>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-black flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {err && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-[12px] text-red-200">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Código</div>
            <div className="mt-2 text-xl font-black tracking-widest text-white">
              {data?.code || '—'}
            </div>
            <button
              onClick={() => data?.code && copy(data.code)}
              disabled={!data?.code}
              className="mt-3 px-4 py-2 rounded-2xl bg-white text-black text-[11px] font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-5 md:col-span-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Enlace de invitación</div>
            <div className="mt-2 text-[12px] text-gray-300 break-all">
              {referralLink || '—'}
            </div>
            <button
              onClick={() => referralLink && copy(referralLink)}
              disabled={!referralLink}
              className="mt-3 px-4 py-2 rounded-2xl bg-[#d4af37] text-black text-[11px] font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              Copiar enlace
            </button>
            <div className="mt-3 text-[11px] text-gray-500">
              Cuando una clínica se registra con tu enlace, aparecerá aquí en el tracking.
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Altas referidas</div>
              <div className="mt-1 text-3xl font-black text-white">{data?.count ?? 0}</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {(data?.referred || []).length === 0 ? (
              <div className="text-[12px] text-gray-500">Aún no hay altas registradas con tu código.</div>
            ) : (
              (data?.referred || []).map((r: any) => (
                <div key={r.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                  <div>
                    <div className="text-[12px] font-bold text-white">{r.nombre_clinica || 'Clínica'}</div>
                    <div className="text-[11px] text-gray-500">{r.email || ''}</div>
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-blue-400/80">
                    {String(r.plan || '').toUpperCase() || 'PLAN'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
