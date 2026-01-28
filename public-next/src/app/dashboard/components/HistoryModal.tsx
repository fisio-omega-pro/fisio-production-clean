'use client';
import React, { useEffect, useState } from 'react';
import { X, User, Clock, FileText, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../services';

export const HistoryModal = ({ event, onClose }: { event: any, onClose: () => void }) => {
  const [data, setData] = useState<{paciente: any, historial: any[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const phone = event.phone || '000000000'; 
      try {
        const res = await dashboardAPI.getPatientHistory(phone);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [event]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
        className="w-full max-w-lg bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* CABECERA PACIENTE */}
        <div className="bg-[#0a0a0c] p-6 border-b border-white/5 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/20">
              {event.title.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{event.title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Clock size={12} /> {event.start}
                <span className="w-1 h-1 bg-gray-600 rounded-full"/>
                <Calendar size={12} /> {event.type || 'Consulta General'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X size={20}/></button>
        </div>

        {/* CUERPO DEL HISTORIAL */}
        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
          <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={14} /> Historial Clínico Reciente
          </h4>

          {loading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse text-sm">Consultando memoria de Ana...</div>
          ) : data?.historial && data.historial.length > 0 ? (
            <div className="space-y-6">
              {data.historial.map((note: any) => (
                <div key={note.id} className="relative pl-6 border-l border-white/10">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_10px_#2563eb]" />
                  <div className="text-[10px] text-gray-500 mb-1 font-mono">
                    {new Date(note.fecha).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                    {note.contenido}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <p className="text-gray-400 text-sm">No hay notas previas.</p>
                <p className="text-[10px] text-gray-600 mt-1">Dicta el resumen al finalizar esta cita.</p>
             </div>
          )}
        </div>

        {/* ACCIONES RÁPIDAS (CORREGIDO) */}
        <div className="p-4 bg-[#0a0a0c] border-t border-white/5 grid grid-cols-2 gap-3">
           <button onClick={onClose} className="py-3 rounded-xl bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition">
             CERRAR
           </button>
           {/* BOTÓN CORREGIDO: VER FICHA */}
           <button className="py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition">
             VER FICHA COMPLETA <ArrowRight size={14} />
           </button>
        </div>

      </motion.div>
    </div>
  );
};
