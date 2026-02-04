'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { ActionButton } from '../components/Atoms';
import { dashboardAPI } from '../services';

export const SugerenciasView = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const t = text.trim();
    if (!t) return;
    setError(null);
    setLoading(true);
    try {
      await dashboardAPI.saveSuggestion(t);
      setDone(true);
      setText("");
      setTimeout(() => setDone(false), 2500);
    } catch (e: any) {
      setError(e?.message || 'No se pudo enviar.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-3xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Buzón de Innovación</h2>
        <p className="text-gray-500 text-sm">¿Cómo puede Ana ayudarte mejor? Tus ideas definen nuestra hoja de ruta.</p>
      </div>
      <div className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-10">
         <div className="flex items-center gap-3 mb-6 text-blue-500">
            <Sparkles size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Feedback Directo a Ana</span>
         </div>
         {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">{error}</div>}
         {done && <div className="mb-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-2"><CheckCircle2 size={16}/> Recibido. Gracias.</div>}
         <textarea 
            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-blue-500 transition-all min-h-[200px] mb-6"
            placeholder="Describe una nueva funcionalidad o mejora..."
            value={text}
            onChange={(e)=>setText(e.target.value)}
         />
         <ActionButton onClick={submit} disabled={loading || !text.trim()} fullWidth style={{height:'60px'}}>
           {loading ? <Loader2 className="animate-spin mx-auto" /> : 'ENVIAR PROPUESTA A LA FUNDICIÓN ➜'}
         </ActionButton>
      </div>
    </div>
  );
};
