'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Clock, Filter, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react';
import { Especialista } from '../types';

interface AgendaProps {
  currentUser?: { specialistId: string | null; isOwner: boolean };
  equipo: Especialista[];
  agenda: any[];
  bloqueos: any[];
  initialSpecId?: string;
  horario: { apertura?: string; cierre?: string; reapertura?: string; cierre_final?: string };
  onBlockSchedule: () => void;
  onNewAppointment: (data: any) => void;
  onEventClick: (event: any) => void;
  clinicData: { es_multiclinica?: boolean }; // Added clinicData
}

export const AgendaView: React.FC<AgendaProps> = ({ currentUser, equipo, agenda, bloqueos, horario, onBlockSchedule, onNewAppointment, onEventClick, clinicData, initialSpecId }) => {
  const isStaff = !!(currentUser?.specialistId);
  const staffSpecId = currentUser?.specialistId || '';
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [selectedSpec, setSelectedSpec] = useState<string>('all');
  const isMultiClinic = !!clinicData?.es_multiclinica;
  useEffect(() => {
    if (isStaff && staffSpecId) setSelectedSpec(staffSpecId);
    else if (initialSpecId) setSelectedSpec(initialSpecId);
  }, [isStaff, staffSpecId, initialSpecId]);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Función para obtener nombre del día de la semana
  const getDayName = (dateString: string) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const date = new Date(dateString);
    return days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Ajustar: Lunes=0, Domingo=6
  };

  // Función para verificar si es domingo
  const isSunday = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDay() === 0; // Domingo = 0 en JavaScript
  };

  // Función para navegar días
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  // Función para generar días de la semana (Lunes a Domingo)
  const getWeekDays = () => {
    const selectedDateObj = new Date(selectedDate);
    const day = selectedDateObj.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const diff = selectedDateObj.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que Lunes sea el primer día
    const monday = new Date(selectedDateObj);
    monday.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      weekDays.push(currentDate.toISOString().split('T')[0]);
    }
    return weekDays;
  };

  const now = new Date();
  const currentDay = now.getDate();

  // 1. GENERACIÓN DE HORAS (Manejo de cierre de 14h a 16h)
  const hours = useMemo(() => {
    const apertura = parseInt(horario?.apertura?.split(':')[0] || '8');
    const cierre = parseInt(horario?.cierre?.split(':')[0] || '14');
    const reapertura = parseInt(horario?.reapertura?.split(':')[0] || '16');
    const cierreFinal = parseInt(horario?.cierre_final?.split(':')[0] || '21');

    const hArray = [];

    // 🚫 PRECISIÓN DE RELOJERO: Mañana hasta cierre - 1 hora
    for (let i = apertura; i < cierre; i++) {
      hArray.push(`${String(i).padStart(2, '0')}:00`);
    }

    // 🚫 PRECISIÓN DE RELOJERO: Tarde hasta cierre final - 1 hora
    for (let i = reapertura; i < cierreFinal; i++) {
      hArray.push(`${String(i).padStart(2, '0')}:00`);
    }

    return hArray;
  }, [horario]);

  const effectiveSpec = isStaff ? staffSpecId : selectedSpec;
  // 2. EQUIPO A MOSTRAR (si es staff solo ve su columna)
  const displayTeam = useMemo(() => {
    // Si NO es multiclínica, solo mostramos una columna (la agenda global)
    if (!isMultiClinic) {
      if (!equipo || equipo.length === 0) {
        return [{ id: 'admin', nombre: 'Agenda Principal', especialidad: 'SaaS' }];
      }
      // En modo básico, usamos el primer especialista como "la agenda"
      return [equipo[0]];
    }

    // Modo Multiclínica: lógica estándar de filtrado
    if (!equipo || equipo.length === 0) {
      return [{ id: 'admin', nombre: 'Agenda Principal', especialidad: 'Dirección' }];
    }
    return equipo.filter(e => effectiveSpec === 'all' || e.id === effectiveSpec);
  }, [equipo, effectiveSpec, isMultiClinic]);

  // 3. LÓGICA DE COLORES (Semáforo Financiero)
  const getApptStatus = (appt: any) => {
    if (appt.pagado) return 'success'; // Verde
    if (appt.estado === 'pendiente') return 'warning'; // Naranja
    return 'default';
  };

  const monthLabel = useMemo(() => {
    try {
      return monthCursor.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    } catch {
      return 'Mes';
    }
  }, [monthCursor]);

  const agendaForDate = useMemo(() => {
    const day = selectedDate;
    const list = Array.isArray(agenda) ? agenda : [];
    return list.filter((a) => String(a.fecha || '') === day);
  }, [agenda, selectedDate]);

  const bloqueosForDate = useMemo(() => {
    const day = selectedDate;
    const list = Array.isArray(bloqueos) ? bloqueos : [];
    return list.filter((b) => String(b.date || '') === day);
  }, [bloqueos, selectedDate]);

  const agendaForMonth = useMemo(() => {
    const list = Array.isArray(agenda) ? agenda : [];
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, '0')}-`;
    return list.filter((a) => String(a.fecha || '').startsWith(prefix));
  }, [agenda, monthCursor]);

  const bloqueosForMonth = useMemo(() => {
    const list = Array.isArray(bloqueos) ? bloqueos : [];
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth() + 1;
    const prefix = `${y}-${String(m).padStart(2, '0')}-`;
    return list.filter((b) => String(b.date || '').startsWith(prefix));
  }, [bloqueos, monthCursor]);

  const daysInMonth = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    return new Date(y, m + 1, 0).getDate();
  }, [monthCursor]);

  // Calcular el primer día del mes (0=Lunes, 6=Domingo)
  const firstDayOfMonth = useMemo(() => {
    const firstDate = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const day = firstDate.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    return day === 0 ? 6 : day - 1; // Convertir a 0=Lunes, 6=Domingo
  }, [monthCursor]);

  const dayDots = useMemo(() => {
    const map: Record<string, { paid: boolean; pending: boolean; blocked: boolean }> = {};

    // Procesar citas
    agendaForMonth.forEach((a) => {
      const f = String(a.fecha || '');
      if (!f) return;
      if (!map[f]) map[f] = { paid: false, pending: false, blocked: false };
      if (a.pagado) map[f].paid = true;
      if (String(a.estado || '') === 'pendiente') map[f].pending = true;
    });

    // Procesar bloqueos
    bloqueosForMonth.forEach((b) => {
      const f = String(b.date || '');
      if (!f) return;
      if (!map[f]) map[f] = { paid: false, pending: false, blocked: false };
      map[f].blocked = true;
    });

    return map;
  }, [agendaForMonth, bloqueosForMonth]);

  const findApptForSlot = (specId: string, hour: string) => {
    // 🔍 PRECISIÓN: Buscar cita para la hora Y el especialista específico
    return agendaForDate.find((a) => {
      const appointmentHour = String(a.hora || '').split(':')[0];
      const targetHour = String(hour || '').split(':')[0];

      if (appointmentHour !== targetHour) return false;

      // Si NO es multiclínica, cualquier cita a esta hora bloquea el slot para todos
      if (!isMultiClinic) return true;

      const apptSpecId = String(a.specialist_id || '').trim();
      const targetSpecId = String(specId || '').trim();

      return apptSpecId === targetSpecId;
    }) || null;
  };

  const isPastSlot = (dateStr: string, hourStr: string) => {
    const now = new Date();
    const slotDate = new Date(`${dateStr}T${hourStr}:00`);
    // Margen de 5 minutos
    return slotDate.getTime() < (now.getTime() - 5 * 60 * 1000);
  };

  const isHourBlocked = (hour: string) => {
    const hourNum = Number(String(hour || '').split(':')[0] || '0');
    return bloqueosForDate.some((b) => {
      const startHour = Number(String(b.startTime || '').split(':')[0] || '0');
      const endHour = Number(String(b.endTime || '').split(':')[0] || '0');

      if (b.allDay) return true; // Todo el día bloqueado
      return hourNum >= startHour && hourNum < endHour;
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-full font-sans">

      {/* --- TOOLBAR DE PRECISIÓN --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02] p-4 rounded-[32px] border border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setViewMode('dia')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'dia' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>DÍA</button>
          <button onClick={() => setViewMode('semana')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'semana' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>SEMANA</button>
          <button onClick={() => setViewMode('mes')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${viewMode === 'mes' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>MES</button>
        </div>

        {/* NAVEGACIÓN DE DÍAS (solo para vista día) */}
        {viewMode === 'dia' && (
          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/10">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
              aria-label="Día anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 bg-blue-600/20 rounded-xl">
              <span className={`text-[10px] font-black uppercase tracking-wider ${isSunday(selectedDate) ? 'text-red-400' : 'text-blue-400'}`}>
                {getDayName(selectedDate).slice(0, 3)}
              </span>
              <span className="ml-2 text-[11px] font-bold text-white">
                {new Date(selectedDate).getDate()}
              </span>
            </div>
            <button
              onClick={() => navigateDay('next')}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
              aria-label="Día siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* SELECTOR DE ESPECIALISTAS (solo en modo MULTICLÍNICA) */}
        {isMultiClinic && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-sm no-scrollbar px-2">
            {!isStaff && (
              <>
                <button onClick={() => setSelectedSpec('all')} className={`px-4 py-2 rounded-full border text-[9px] font-black transition-all ${selectedSpec === 'all' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>TODOS</button>
                {equipo.map(s => (
                  <button key={s.id} onClick={() => setSelectedSpec(s.id)} className={`px-4 py-2 rounded-full border text-[9px] font-black whitespace-nowrap transition-all ${selectedSpec === s.id ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                    {s.nombre.toUpperCase()}
                  </button>
                ))}
              </>
            )}
            {isStaff && equipo.length > 0 && (
              <span className="px-4 py-2 rounded-full border border-blue-500/30 bg-blue-600/10 text-[9px] font-black text-blue-400 uppercase">
                {equipo[0]?.nombre || 'Mi agenda'}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onBlockSchedule} className="px-5 py-2.5 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">BLOQUEAR</button>
          <button onClick={() => onNewAppointment({ date: selectedDate, time: '09:00' })} className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all">NUEVA CITA ➜</button>
        </div>
      </div>

      {/* --- ÁREA DE CALENDARIO (REPARADA) --- */}
      <div className="bg-[#0a0a0c] border border-white/5 rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex-1 overflow-hidden flex flex-col">

        {viewMode === 'mes' ? (
          <div className="p-10 flex flex-col h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20"><CalendarIcon size={24} /></div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                  {monthLabel.split(' ')[0]} <span className="text-blue-600">{monthLabel.split(' ').slice(1).join(' ')}</span>
                </h3>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* GRID MENSUAL: Alineado Lunes-Domingo */}
            <div className="grid grid-cols-7 gap-3 flex-1 min-h-[500px]">
              {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map((d, index) => (
                <div key={d} className={`text-center text-[10px] font-black tracking-[0.3em] pb-4 ${index === 6 ? 'text-red-500' : 'text-gray-700'}`}>{d}</div>
              ))}

              {/* Celdas vacías antes del primer día del mes */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px]" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === currentDay;
                const dateStr = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dots = dayDots[dateStr] || { paid: false, pending: false, blocked: false };
                const isSundayDay = isSunday(dateStr);

                return (
                  <div
                    key={dayNum}
                    onClick={() => { setSelectedDate(dateStr); setViewMode('dia'); }}
                    className={`min-h-[100px] border transition-all rounded-3xl p-4 flex flex-col justify-between group cursor-pointer ${isToday
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                      : isSundayDay
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                        : 'bg-white/[0.01] border-white/5 hover:border-blue-500/30'
                      }`}
                  >
                    <span className={`text-lg font-black ${isToday
                      ? 'text-blue-500'
                      : isSundayDay
                        ? 'text-red-400 group-hover:text-red-300'
                        : 'text-gray-600 group-hover:text-white'
                      }`}>{dayNum}</span>

                    {/* Nombre del día de la semana */}
                    <span className={`text-[8px] font-medium ${isSundayDay
                      ? 'text-red-500/70'
                      : 'text-gray-500/70'
                      }`}>
                      {getDayName(dateStr).slice(0, 3)}
                    </span>

                    {/* Semáforo Visual Mes */}
                    <div className="flex gap-1.5">
                      {dots.paid && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                      {dots.pending && <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />}
                      {dots.blocked && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === 'semana' ? (
          /* --- MODO SEMANA: VISTA DE 7 DÍAS --- */
          <div className="flex flex-col h-full">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20"><CalendarDays size={20} /></div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter">
                  Agenda Semanal
                </h4>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((dayDate, index) => {
                  const dayName = getDayName(dayDate);
                  const dayNum = new Date(dayDate).getDate();
                  const isCurrentDay = dayDate === selectedDate;
                  const isSundayDay = isSunday(dayDate);

                  return (
                    <div
                      key={dayDate}
                      onClick={() => setSelectedDate(dayDate)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${isCurrentDay
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : isSundayDay
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-white/[0.02] border-white/10 hover:border-blue-500/30'
                        }`}
                    >
                      <div className={`text-[9px] font-black uppercase tracking-wider mb-1 ${isSundayDay ? 'text-red-400' : 'text-gray-400'
                        }`}>
                        {dayName.slice(0, 3)}
                      </div>
                      <div className={`text-lg font-bold ${isCurrentDay
                        ? 'text-blue-400'
                        : isSundayDay
                          ? 'text-red-400'
                          : 'text-white'
                        }`}>
                        {dayNum}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vista compacta de la semana */}
            <div className="flex-1 overflow-x-auto custom-scrollbar p-4">
              <div className="grid grid-cols-7 gap-2 min-w-[800px]">
                {getWeekDays().map(dayDate => {
                  const dayCitas = agenda.filter(a => a.fecha === dayDate);
                  const dayBloqueos = bloqueos.filter(b => b.date === dayDate);
                  const isCurrentDay = dayDate === selectedDate;
                  const isSundayDay = isSunday(dayDate);

                  return (
                    <div
                      key={dayDate}
                      onClick={() => {
                        setSelectedDate(dayDate);
                        setViewMode('dia');
                      }}
                      className={`border rounded-xl p-2 cursor-pointer transition-all ${isCurrentDay
                        ? 'bg-blue-600/10 border-blue-500/50'
                        : isSundayDay
                          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                          : 'bg-white/[0.01] border-white/5 hover:border-blue-500/30'
                        }`}
                    >
                      <div className="text-[8px] text-gray-500 mb-2">
                        {dayCitas.length} cita{dayCitas.length !== 1 ? 's' : ''}
                        {dayBloqueos.length > 0 && ` • ${dayBloqueos.length} bloqueo${dayBloqueos.length !== 1 ? 's' : ''}`}
                      </div>

                      {/* Citas del día - CLICABLES */}
                      {dayCitas.slice(0, 3).map(cita => (
                        <div
                          key={cita.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick({
                              id: cita.id,
                              title: cita.nombre || 'Paciente',
                              start: cita.hora,
                              type: cita.estado || 'Consulta',
                              phone: cita.telefono || '',
                              telefono: cita.telefono || '',
                              email: cita.email || '',
                            });
                          }}
                          className={`text-[7px] p-1 rounded mb-1 cursor-pointer transition-all ${cita.pagado
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                            }`}
                        >
                          {cita.hora} • {cita.nombre.slice(0, 8)}
                        </div>
                      ))}

                      {dayCitas.length > 3 && (
                        <div className="text-[7px] text-gray-500">
                          +{dayCitas.length - 3} más
                        </div>
                      )}

                      {/* Bloqueos del día */}
                      {dayBloqueos.map(bloqueo => (
                        <div key={bloqueo.id} className="text-[7px] p-1 rounded mb-1 bg-red-500/20 text-red-500">
                          🚫 {bloqueo.reason || 'Bloqueado'}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* --- MODO DÍA: SEMÁFORO HORARIO --- */
          <div className="flex flex-col h-full overflow-hidden">
            {/* ENCABEZADO DIARIO */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateDay('prev')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  aria-label="Día anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-black text-white">
                    {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedDate).getDate()}
                  </span>
                </div>
                <button
                  onClick={() => navigateDay('next')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                  aria-label="Día siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* SELECTOR DE ESPECIALISTAS - SOLO EN MULTICLÍNICA */}
            {isMultiClinic && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-sm no-scrollbar p-6 border-b border-white/5 flex-shrink-0">
                {!isStaff && (
                  <>
                    <button onClick={() => setSelectedSpec('all')} className={`px-4 py-2 rounded-full border text-[9px] font-black transition-all ${selectedSpec === 'all' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>TODOS</button>
                    {equipo.map(s => (
                      <button key={s.id} onClick={() => setSelectedSpec(s.id)} className={`px-4 py-2 rounded-full border text-[9px] font-black whitespace-nowrap transition-all ${selectedSpec === s.id ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        {s.nombre}
                      </button>
                    ))}
                  </>
                )}
                {isStaff && equipo.length > 0 && (
                  <span className="px-4 py-2 rounded-full border border-blue-500/30 bg-blue-600/10 text-[9px] font-black text-blue-400 uppercase">
                    {equipo[0]?.nombre || 'Mi agenda'}
                  </span>
                )}
              </div>
            )}

            {/* GRID DIARIO - CON ALTURA FIJA Y SCROLL */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="flex min-h-full">
                {/* COLUMNA DE HORAS */}
                <div className="w-20 flex-shrink-0">
                  <div className="h-14 border-b border-white/5 flex-shrink-0" />
                  {hours.map(h => (
                    <div key={h} className="h-24 border-b border-white/5 flex items-center justify-center text-[10px] font-black text-gray-700 font-mono flex-shrink-0">{h}</div>
                  ))}
                </div>

                {/* COLUMNAS POR ESPECIALISTA */}
                <div className="flex flex-1">
                  {displayTeam.map(spec => (
                    <div key={spec.id} className="flex-1 min-w-[260px] border-r border-white/5 last:border-0 flex flex-col">
                      <div className="h-14 bg-white/[0.03] border-b border-white/5 flex items-center px-6 gap-3 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white shadow-lg">{spec.nombre.charAt(0)}</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 truncate">{spec.nombre}</p>
                      </div>
                      {hours.map(h => {
                        const appt = findApptForSlot(spec.id, h);
                        const isBooked = !!appt;
                        const isPaid = !!appt?.pagado;
                        const isBlocked = isHourBlocked(h);

                        const isPast = isPastSlot(selectedDate, h);

                        return (
                          <div
                            key={h}
                            onClick={() => {
                              if (isBooked && appt) {
                                onEventClick({
                                  id: appt.id,
                                  title: appt.nombre || 'Paciente',
                                  start: `${appt.hora || h}`,
                                  type: appt.estado || 'Consulta',
                                  phone: appt.telefono || '',
                                  telefono: appt.telefono || '',
                                  email: appt.email || '',
                                });
                              } else if (!isBlocked && !isPast) {
                                onNewAppointment({ date: selectedDate, time: h, specialistId: spec.id });
                              }
                            }}
                            className={`h-24 border-b border-white/5 transition-all relative flex items-center justify-center group flex-shrink-0 ${isBlocked
                              ? 'bg-red-500/10 cursor-not-allowed border-red-500/20'
                              : isBooked
                                ? (isPaid ? 'bg-green-500/5 cursor-default' : 'bg-orange-500/5 cursor-default')
                                : isPast
                                  ? 'bg-black/40 cursor-not-allowed opacity-40'
                                  : 'hover:bg-blue-600/[0.03] cursor-crosshair'
                              }`}
                          >
                            {isBlocked ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500">
                                <AlertCircle size={12} />
                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                  BLOQUEADO
                                </span>
                              </div>
                            ) : isBooked ? (
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${isPaid ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-orange-500/10 border-orange-500/30 text-orange-500'}`}>
                                {isPaid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                  {(appt?.nombre || 'CITA').toString().slice(0, 12)} · {appt?.hora || h}
                                </span>
                              </div>
                            ) : isPast ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/5 bg-white/5 text-gray-500">
                                <Clock size={12} className="opacity-50" />
                                <span className="text-[9px] font-black uppercase tracking-tighter italic">
                                  CONCLUIDO
                                </span>
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
          </div>
        )}
      </div>
    </div>
  );
};
