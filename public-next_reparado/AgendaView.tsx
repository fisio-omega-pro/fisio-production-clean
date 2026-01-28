'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import { ActionButton } from '../components/Atoms';

// --- INTERFACES ---
interface AgendaItem {
  id?: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  docId?: string;
}

interface Doctor {
  id: string;
  nombre: string;
}

interface AgendaProps {
  equipo: Doctor[];
  agenda: AgendaItem[];
  horario?: { apertura: string; cierre: string };
  onBlockSchedule: () => void;
  onNewAppointment: (data: { date: string; time: string; docId?: string }) => void;
  onEventClick: (event: AgendaItem) => void;
}

// --- HELPERS FUERA DEL COMPONENTE ---
const formatLocal = (date: Date) => {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD sin desfase UTC
};

export const AgendaView: React.FC<AgendaProps> = ({ 
  equipo = [], 
  agenda = [], 
  horario = { apertura: '08:00', cierre: '20:00' }, 
  onBlockSchedule, 
  onNewAppointment, 
  onEventClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  // --- LÓGICA DE TIEMPO Y DATOS ---
  const startH = parseInt(horario.apertura.split(':')[0]) || 8;
  const endH = parseInt(horario.cierre.split(':')[0]) || 20;
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => i + startH);

  // Indexación para búsqueda O(1)
  const appointmentsMap = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    if (!Array.isArray(agenda)) return map;
    
    agenda.forEach(item => {
      const key = `${item.fecha}-${item.hora}-${item.docId || 'general'}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    });
    return map;
  }, [agenda]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { daysInMonth, offset, year, monthName: currentDate.toLocaleString('es-ES', { month: 'long' }).toUpperCase() };
  }, [currentDate]);

  // --- NAVEGACIÓN ---
  const navigate = (amount: number) => {
    const next = new Date(currentDate);
    viewMode === 'day' ? next.setDate(next.getDate() + amount) : next.setMonth(next.getMonth() + amount);
    setCurrentDate(next);
  };

  const doctorsList = equipo.length > 0 ? equipo : [{ id: 'general', nombre: 'General' }];

  return (
    <div className="flex flex-col h-full gap-6 text-white bg-transparent">
      
      {/* 1. CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#0a0a0c] p-4 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex bg-[#18181b] p-1 rounded-xl border border-white/5">
            <button onClick={() => setViewMode('day')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-blue-600' : 'text-gray-500'}`}>DÍA</button>
            <button onClick={() => setViewMode('month')} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-blue-600' : 'text-gray-500'}`}>MES</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft size={20}/></button>
            <h3 className="text-sm font-black tracking-widest min-w-[160px] text-center">
              {viewMode === 'day' ? currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase() : `${monthData.monthName} ${monthData.year}`}
            </h3>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="flex gap-3">
          <ActionButton onClick={onBlockSchedule} variant="danger" icon={<Lock size={14} />}>BLOQUEAR</ActionButton>
          <ActionButton onClick={() => onNewAppointment({ date: formatLocal(currentDate), time: `${String(startH).padStart(2, '0')}:00` })} icon={<Plus size={14} />}>NUEVA CITA</ActionButton>
        </div>
      </div>

      {/* 2. AREA DE CONTENIDO */}
      <div className="flex-1 bg-[#050505] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
        
        {viewMode === 'day' ? (
          <div className="flex h-full overflow-y-auto custom-scrollbar">
            {/* Eje de tiempo */}
            <div className="w-20 bg-[#080808] border-r border-white/10 pt-14 sticky left-0 z-20">
              {hours.map(h => (
                <div key={h} className="h-24 border-b border-white/5 flex justify-center pt-2 text-xs font-bold text-gray-500">{h}:00</div>
              ))}
            </div>

            {/* Grid de Doctores */}
            <div className="flex-1 flex overflow-x-auto">
              {doctorsList.map(doc => (
                <div key={doc.id} className="flex-1 min-w-[200px] border-r border-white/10">
                  <div className="h-14 sticky top-0 bg-[#0a0a0c]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-center gap-2 z-10">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">{doc.nombre?.charAt(0) || 'D'}</div>
                    <span className="text-xs font-bold text-gray-300 truncate px-2">{doc.nombre}</span>
                  </div>

                  {hours.map(h => {
                    const timeKey = `${String(h).padStart(2, '0')}:00`;
                    const dateKey = formatLocal(currentDate);
                    const cellApps = appointmentsMap.get(`${dateKey}-${timeKey}-${doc.id}`) || [];
                    
                    return (
                      <div key={h} className="h-24 border-b border-white/5 relative group hover:bg-white/[0.01]">
                        {cellApps.map((appt, idx) => (
                          <div key={idx} onClick={() => onEventClick(appt)} className="absolute inset-1 bg-blue-600/20 border-l-4 border-blue-500 rounded-r-lg p-2 cursor-pointer hover:bg-blue-600/40 z-10">
                            <p className="text-[10px] font-bold truncate">{appt.nombre}</p>
                            <p className="text-[9px] text-blue-300 truncate">{appt.telefono}</p>
                          </div>
                        ))}
                        {cellApps.length === 0 && (
                          <button onClick={() => onNewAppointment({ date: dateKey, time: timeKey, docId: doc.id })} className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Plus size={20} className="text-blue-500/40" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Vista Mes */
          <div className="h-full overflow-y-auto p-6">
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-black text-gray-500">
              {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 auto-rows-[120px]">
              {Array.from({ length: monthData.offset }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatLocal(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                const isToday = dateStr === formatLocal(new Date());
                const hasAppts = agenda?.some(a => a.fecha === dateStr);

                return (
                  <button 
                    key={day} 
                    onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)); setViewMode('day'); }}
                    className={`p-3 rounded-2xl border transition-all flex flex-col justify-between text-left ${isToday ? 'bg-blue-600/10 border-blue-500' : 'bg-[#121215] border-white/5 hover:border-white/20'}`}
                  >
                    <span className={`text-lg font-bold ${isToday ? 'text-blue-400' : 'text-gray-500'}`}>{day}</span>
                    {hasAppts && <div className="w-full h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};