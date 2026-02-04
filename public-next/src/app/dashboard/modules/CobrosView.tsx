import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle2, AlertCircle, ChevronRight, Loader2, Save } from 'lucide-react';
import { InputField } from '../components/Atoms';
import { dashboardAPI } from '../services';
import { API_BASE_URL } from '@/lib/apiBase';

interface CobrosProps {
  hasStripe: boolean;
  clinicData: any;
}

export const CobrosView: React.FC<CobrosProps> = ({ hasStripe, clinicData }) => {
  const [loading, setLoading] = useState(false);
  const [bizum, setBizum] = useState(clinicData?.config_pagos?.bizum || "");
  const [savingBizum, setSavingBizum] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleConnectStripe = async () => {
    setLoading(true);
    setStripeError(null);
    try {
      const url = await dashboardAPI.connectStripe();
      window.location.href = url;
    } catch (e) { 
      const msg = (e as any)?.message || 'No se pudo conectar Stripe.';
      setStripeError(msg);
      setLoading(false); // 🚨 Corregido: false en lugar de null
    }
  };

  const saveBizum = async () => {
    setSavingBizum(true);
    try {
      const token = localStorage.getItem('fisio_token');
      const res = await fetch(`${API_BASE_URL}/api/dashboard/save-cobros`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ bizumNumber: bizum })
      });
      if (res.ok) alert("✅ Bizum configurado correctamente.");
      else throw new Error();
    } catch (e) { 
      alert("Error al guardar"); 
    } finally {
      setSavingBizum(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 animate-fade-in">
      <div>
         <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Pasarela de Pagos</h2>
         <p className="text-sm text-gray-400">Configura cómo cobrarás a tus pacientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* STRIPE */}
        <div className={`p-8 rounded-[32px] border-t-4 transition-all ${hasStripe ? 'bg-green-500/5 border-green-500' : 'bg-white/5 border-blue-600'}`}>
          <div className={`mb-6 p-4 rounded-2xl w-fit ${hasStripe ? 'bg-green-500/10 text-green-500' : 'bg-blue-600/10 text-blue-500'}`}>
             <CreditCard size={28} />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Stripe Express</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-8">Pago automático con tarjeta. Ana verifica la transacción al instante.</p>
          
          {hasStripe ? (
            <div className="flex items-center gap-3 text-green-500 font-black text-xs bg-green-500/10 p-5 rounded-2xl border border-green-500/20 uppercase tracking-widest">
              <CheckCircle2 size={18}/> Conexión Activa
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {stripeError && (
                <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  {stripeError.includes('sk_') ? 'Stripe pendiente o mal configurado en este entorno. Mientras tanto, puedes usar Bizum.' : stripeError}
                </div>
              )}
              <button 
                onClick={handleConnectStripe} 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <>Vincular Banco <ChevronRight size={14}/></>}
              </button>
            </div>
          )}
        </div>

        {/* BIZUM */}
        <div className="bg-white/5 p-8 rounded-[32px] border-t-4 border-emerald-500">
          <div className="mb-6 p-4 bg-emerald-500/10 rounded-2xl w-fit text-emerald-500">
             <Smartphone size={28} />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Bizum Directo</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-8">Pago manual. El paciente envía el dinero a tu móvil y tú confirmas.</p>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <InputField 
                placeholder="Nº de Teléfono para Bizum" 
                value={bizum} 
                onChange={(v) => setBizum(v)}
                style={{ marginBottom: 0 }}
              />
            </div>
            <button 
              onClick={saveBizum}
              disabled={savingBizum}
              className="bg-white text-black px-6 rounded-2xl font-bold text-xs hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
            >
              {savingBizum ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
