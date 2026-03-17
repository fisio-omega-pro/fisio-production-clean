'use client';
import React, { useEffect, useState } from 'react';
import { X, Clock, FileText, Calendar, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services';

export const HistoryModal = ({ event, onClose, onRefresh }: { event: any; onClose: () => void; onRefresh?: () => void }) => {
  const [data, setData] = useState<{paciente: any, historial: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'paid' | 'cancel' | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const title = String(event?.title || event?.nombre || 'Paciente');
  const initial = title.charAt(0).toUpperCase() || 'P';
  const isPaid = !!event?.pagado || event?.estado === 'pagada';
  const isCancelled = ['anulada', 'cancelada', 'no_show'].includes(String(event?.estado || '').toLowerCase());

  useEffect(() => {
    const phone = String(event?.telefono || event?.phone || '').trim();
    if (!phone) { setLoading(false); return; }
    dashboardAPI.getPatientHistory(phone)
      .then(res => setData(res))
      .catch(e => { console.error(e); setLoadError('No se pudo cargar el historial'); })
      .finally(() => setLoading(false));
  }, [event]);

  const handleMarkPaid = async () => {
    if (!event?.id || actionLoading) return;
    setActionLoading('paid');
    try {
      await dashboardAPI.updateAppointment(event.id, { pagado: true, estado: 'pagada' });
      setActionDone('✅ Cita marcada como pagada');
      onRefresh?.();
    } catch (e: any) {
      setActionDone(`❌ ${e.message || 'Error al actualizar'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!event?.id || actionLoading) return;
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return;
    setActionLoading('cancel');
    try {
      await dashboardAPI.updateAppointment(event.id, { estado: 'anulada' });
      setActionDone('✅ Cita anulada correctamente');
      onRefresh?.();
    } catch (e: any) {
      setActionDone(`❌ ${e.message || 'Error al cancelar'}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
        className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="bg-[#0a0a0c] p-6 border-b border-white/5 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/20">
              {initial}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Clock size={12} /> {event?.start || event?.hora || ''}
                <span className="w-1 h-1 bg-gray-600 rounded-full"/>
                <Calendar size={12} /> {event?.fecha || event?.type || ''}
                {isPaid && <span className="text-green-400 font-bold">· PAGADO</span>}
                {isCancelled && <span className="text-red-400 font-bold">· ANULADA</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={20}/></button>
        </div>

        <div className="p-6 max-h-[40vh] overflow-y-auto custom-scrollbar">
          <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={14} /> Historial Clínico Reciente
          </h4>
          {loading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse text-sm">Consultando historial...</div>
          ) : loadError ? (
            <div className="flex items-center gap-2 text-red-400 text-xs py-6 justify-center"><AlertCircle size={14}/>{loadError}</div>
          ) : !String(event?.telefono || event?.phone || '').trim() ? (
            <div className="text-center py-6 text-gray-500 text-xs">Sin teléfono registrado — historial no disponible.</div>
          ) : data?.historial && data.historial.length > 0 ? (
            <div className="space-y-6">
              {data.historial.map((note: any) => (
                <div key={note.id} className="relative pl-6 border-l border-white/10">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb]" />
                  <div className="text-[10px] text-gray-500 mb-1 font-mono">{new Date(note.fecha).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">{note.contenido}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 border-dashed">
              <p className="text-gray-400 text-sm">Sin notas previas.</p>
              <p className="text-[10px] text-gray-600 mt-1">Dicta el resumen al finalizar esta cita.</p>
            </div>
          )}
        </div>

        {actionDone && (
          <div className="px-6 pb-2 text-xs font-medium text-center text-gray-300">{actionDone}</div>
        )}

        <div className="p-4 bg-[#0a0a0c] border-t border-white/5 grid grid-cols-3 gap-2">
          <button onClick={onClose} className="py-3 rounded-xl bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition">
            CERRAR
          </button>
          {!isCancelled && !actionDone?.includes('✅') && (
            <>
              {!isPaid && (
                <button
                  onClick={handleMarkPaid}
                  disabled={!!actionLoading}
                  className="py-3 rounded-xl bg-green-600/80 text-white text-xs font-bold hover:bg-green-600 transition flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {actionLoading === 'paid' ? <Loader2 size={12} className="animate-spin"/> : <CheckCircle2 size={12}/>}
                  PAGADO
                </button>
              )}
              <button
                onClick={handleCancel}
                disabled={!!actionLoading}
                className="py-3 rounded-xl bg-red-600/20 text-red-400 text-xs font-bold hover:bg-red-600/40 transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {actionLoading === 'cancel' ? <Loader2 size={12} className="animate-spin"/> : <XCircle size={12}/>}
                ANULAR
              </button>
            </>
          )}
          {(isPaid || actionDone?.includes('✅')) && (
            <div className="col-span-2 py-3 rounded-xl bg-green-600/10 text-green-400 text-xs font-bold flex items-center justify-center gap-1">
              <CheckCircle2 size={12}/> {actionDone || 'PAGADA'}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
