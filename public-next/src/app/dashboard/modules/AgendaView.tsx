'use client';

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Clock, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { Especialista } from '../types';

interface AgendaProps {
  equipo: Especialista[];
  agenda: any[]; // Las citas reales
  horario: { apertura?: string; cierre?: string };
  onBlockSchedule: () => void;
  onNewAppointment: (data: any) => void;
  onEventClick: (event: any) => void;
}

export const AgendaView: React.FC<AgendaProps> = ({ equipo, agenda, horario, onBlockSchedule, onNewAppointment, onEventClick }) => {
  const [viewMode, setViewMode] = useState<'dia' | 'mes'>('dia');
  const [selectedSpec, setSelectedSpec] = useState<string>('all');
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentDay = now.getDate();

  // 1. GENERACIÓN DE HORAS (Blindada de 08:00 a 21:00 por defecto)
  const hours = useMemo(() => {
    const start = parseInt(horario?.apertura?.split(':')[0] || '8');
    const end = parseInt(horario?.cierre?.split(':')[0] || '20');
    const hArray = [];
    for(let i = start; i <= end; i++) {
      hArray.push(`${String(i).padStart(2, '0')}:00`);
    }
    return hArray;
  }, [horario]);

  // 2. EQUIPO A MOSTRAR
  const displayTeam = useMemo(() => {
    if (!equipo || equipo.length === 0) {
      return [{ id: 'admin', nombre: 'Agenda Principal', especialidad: 'Clínica' }];
    }
    return equipo.filter(e => selectedSpec === 'all' || e.id === selectedSpec);
  }, [equipo, selectedSpec]);

  // 3. LÓGICA DE COLORES (Semáforo Financiero)
  const getApptStatus = (appt: any) => {
    if (appt.pagado) return 'success'; // Verde
    if (appt.estado === 'pendiente') return 'warning'; // Naranja
    return 'default';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-full font-sans">
      
      {/* --- TOOLBAR DE PRECISIÓN --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02] p-4 rounded-[32px] border border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setViewMode('dia')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'dia' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>DÍA</button>
          <button onClick={() => setViewMode('mes')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'mes' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>MES</button>
        </div>

        {/* SELECTOR DE ESPECIALISTAS */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-sm no-scrollbar px-2">
          <button onClick={() => setSelectedSpec('all')} className={`px-4 py-2 rounded-full border text-[9px] font-black transition-all ${selectedSpec === 'all' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>TODOS</button>
          {equipo.map(s => (
            <button key={s.id} onClick={() => setSelectedSpec(s.id)} className={`px-4 py-2 rounded-full border text-[9px] font-black whitespace-nowrap transition-all ${selectedSpec === s.id ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
              {s.nombre.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onBlockSchedule} className="px-5 py-2.5 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">BLOQUEAR</button>
          <button onClick={() => onNewAppointment({ date: todayStr, time: '09:00' })} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all">NUEVA CITA ➜</button>
        </div>
      </div>

      {/* --- ÁREA DE CALENDARIO (REPARADA) --- */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex-1 overflow-hidden flex flex-col">
        
        {viewMode === 'mes' ? (
          <div className="p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20"><CalendarIcon size={24}/></div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">Enero <span className="text-blue-600">2026</span></h3>
               </div>
               <div className="flex gap-3">
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><ChevronLeft size={20}/></button>
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><ChevronRight size={20}/></button>
               </div>
            </div>
            
            {/* GRID MENSUAL: Reparado para que no se corte */}
            <div className="grid grid-cols-7 gap-3 flex-1 min-h-[500px]">
              {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-gray-700 tracking-[0.3em] pb-4">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === currentDay;
                // Simulación de puntos del semáforo
                const hasPaid = i % 7 === 0; 
                const hasPending = i % 5 === 0;

                return (
                  <div 
                    key={i} 
                    onClick={() => onNewAppointment({ date: `2026-01-${String(dayNum).padStart(2,'0')}`, time: '09:00' })}
                    className={`min-h-[100px] border transition-all rounded-3xl p-4 flex flex-col justify-between group cursor-pointer ${isToday ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/[0.01] border-white/5 hover:border-blue-500/30'}`}
                  >
                    <span className={`text-lg font-black ${isToday ? 'text-blue-500' : 'text-gray-600 group-hover:text-white'}`}>{dayNum}</span>
                    
                    {/* Semáforo Visual Mes */}
                    <div className="flex gap-1.5">
                       {hasPaid && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                       {hasPending && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- MODO DÍA: SEMÁFORO HORARIO --- */
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20"><Clock size={20}/></div>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter">Agenda Diaria <span className="text-blue-500 text-sm ml-3 font-mono opacity-60">26 ENE 2026</span></h4>
               </div>
            </div>
            <div className="flex flex-1 overflow-x-auto custom-scrollbar">
              {/* EJE HORARIO */}
              <div className="w-20 border-r border-white/5 bg-black/40 flex-shrink-0">
                <div className="h-14 border-b border-white/5" />
                {hours.map(h => (
                  <div key={h} className="h-24 border-b border-white/5 flex items-center justify-center text-[10px] font-black text-gray-700 font-mono">{h}</div>
                ))}
              </div>
              {/* COLUMNAS POR FISIO */}
              <div className="flex flex-1">
                {displayTeam.map(spec => (
                  <div key={spec.id} className="flex-1 min-w-[260px] border-r border-white/5 last:border-0 flex flex-col">
                    <div className="h-14 bg-white/[0.03] border-b border-white/5 flex items-center px-6 gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white shadow-lg">{spec.nombre.charAt(0)}</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">{spec.nombre}</p>
                    </div>
                    {hours.map(h => {
                      // Simulación de cita para el Semáforo
                      const isBooked = h === '10:00' || h === '14:00';
                      const isPaid = h === '10:00';

                      return (
                        <div 
                          key={h} 
                          onClick={() => !isBooked && onNewAppointment({ date: todayStr, time: h, specialistId: spec.id })}
                          className={`h-24 border-b border-white/5 transition-all relative flex items-center justify-center group ${isBooked ? (isPaid ? 'bg-green-500/5 cursor-default' : 'bg-orange-500/5 cursor-default') : 'hover:bg-blue-600/[0.03] cursor-crosshair'}`}
                        >
                          {isBooked ? (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isPaid ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}`}>
                               {isPaid ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                               <span className="text-[9px] font-black uppercase tracking-tighter">{isPaid ? 'CONFIRMADA' : 'PAGANDO...'}</span>
                            </div>
                          ) : (
                            <div className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase shadow-lg transition-all transform scale-90 group-hover:scale-100">Agendar {h}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
