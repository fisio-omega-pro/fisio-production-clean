'use client';
import React, { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, MessageCircle, AlertTriangle, Mail } from 'lucide-react';
import { ActionButton } from '../components/Atoms';
import { dashboardAPI } from '../services';

export const SugerenciasView = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ticketType, setTicketType] = useState<'consulta' | 'tecnico'>('consulta');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketDone, setTicketDone] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const submitFeedback = async () => {
    const t = text.trim();
    if (!t) return;
    setError(null);
    setLoading(true);
    try {
      await dashboardAPI.saveSuggestion(t);
      setDone(true);
      setText('');
      setTimeout(() => setDone(false), 3000);
    } catch (e: any) {
      setError(e?.message || 'No se pudo enviar.');
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async () => {
    const msg = ticketMessage.trim();
    if (!msg) return;
    setTicketError(null);
    setTicketLoading(true);
    try {
      await dashboardAPI.createTicket(ticketType, msg);
      setTicketDone(true);
      setTicketMessage('');
      setTimeout(() => setTicketDone(false), 4000);
    } catch (e: any) {
      setTicketError(e?.message || 'No se pudo enviar el ticket.');
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-3xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Feedback y soporte</h2>
        <p className="text-gray-500 text-sm mt-2">
          Tu opinión y tus problemas importan. Cada comentario nos ayuda a mejorar FisioTool; cada incidencia la revisamos para que puedas trabajar sin fricciones.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          <strong className="text-white">Ideas y sugerencias</strong> → las leemos y las usamos para la hoja de ruta. <strong className="text-white">Dudas o problemas</strong> → usa los tickets y te respondemos (o Ana te escribe por email si es una consulta rápida).
        </p>
      </div>

      {/* ——— FEEDBACK / IDEAS ——— */}
      <div className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-10">
        <div className="flex items-center gap-3 mb-4 text-blue-500">
          <Sparkles size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Ideas para mejorar la app</span>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          ¿Echas algo en falta? ¿Alguna funcionalidad que te haría el día a día más fácil? Cuéntanoslo. Revisamos todas las propuestas y priorizamos en función de vuestro uso.
        </p>
        {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">{error}</div>}
        {done && (
          <div className="mb-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-2">
            <CheckCircle2 size={16} /> Recibido. Gracias por ayudarnos a mejorar.
          </div>
        )}
        <textarea
          className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-blue-500 transition-all min-h-[160px] mb-6"
          placeholder="Ej: Sería útil poder exportar la agenda a PDF por semana..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <ActionButton onClick={submitFeedback} disabled={loading || !text.trim()} fullWidth style={{ height: '52px' }}>
          {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Enviar idea a la fundición'}
        </ActionButton>
      </div>

      {/* ——— TICKETS: consulta o problema técnico ——— */}
      <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10">
        <div className="flex items-center gap-3 mb-4 text-amber-500">
          <MessageCircle size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Abrir ticket de soporte</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Si tienes una <strong className="text-white">duda o consulta</strong>, Ana te responderá por email en breve. Si es un <strong className="text-white">fallo o problema técnico</strong>, lo marcamos como urgente y el equipo te atiende lo antes posible.
        </p>

        <div className="mb-4">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Tipo</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTicketType('consulta')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                ticketType === 'consulta'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Mail size={16} />
              Consulta o duda
            </button>
            <button
              type="button"
              onClick={() => setTicketType('tecnico')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                ticketType === 'tecnico'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <AlertTriangle size={16} />
              Problema técnico (urgente)
            </button>
          </div>
        </div>

        {ticketError && (
          <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">{ticketError}</div>
        )}
        {ticketDone && (
          <div className="mb-4 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-2">
            <CheckCircle2 size={16} />
            {ticketType === 'consulta'
              ? 'Ticket enviado. Revisa tu email: Ana te ha respondido.'
              : 'Ticket urgente recibido. El equipo te responderá lo antes posible.'}
          </div>
        )}

        <textarea
          className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-amber-500/50 transition-all min-h-[140px] mb-6"
          placeholder={
            ticketType === 'consulta'
              ? 'Ej: ¿Cómo cambio la hora de cierre los viernes?'
              : 'Ej: Al guardar una cita me sale error 500 y no se guarda.'
          }
          value={ticketMessage}
          onChange={(e) => setTicketMessage(e.target.value)}
        />
        <ActionButton
          onClick={submitTicket}
          disabled={ticketLoading || !ticketMessage.trim()}
          fullWidth
          style={{ height: '52px' }}
        >
          {ticketLoading ? <Loader2 className="animate-spin mx-auto" /> : ticketType === 'tecnico' ? 'Enviar ticket urgente' : 'Enviar consulta (Ana te responde por email)'}
        </ActionButton>
      </div>
    </div>
  );
};
