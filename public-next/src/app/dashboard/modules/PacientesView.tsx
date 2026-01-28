'use client';
import React, { useState, useMemo } from 'react';
import { Search, Mic, Filter, UserPlus, Upload, Database, UserCheck, Activity, ChevronRight } from 'lucide-react';
import { Paciente } from '../types';

export const PacientesView = ({ pacientes, onDictate, onImport }: any) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');

  const filtered = useMemo(() => {
    return pacientes.filter((p: Paciente) => {
      const match = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.telefono.includes(search);
      if (activeFilter === 'activos') return match && p.status === 'ACTIVO';
      return match;
    });
  }, [pacientes, search, activeFilter]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-in fade-in duration-700 h-full">
      
      {/* HEADER AMIGABLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-2 text-rose-500 mb-4">
            <Database size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Base de Conocimiento Clínico</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Expedientes</h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Gestiona la historia de tus pacientes. Ana organiza automáticamente los datos importados y procesa tus informes por voz.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onImport}
            className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Upload size={16} className="text-blue-500" /> IMPORTAR DATOS
          </button>
          <button 
            onClick={onDictate}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-rose-900/20 transition-all"
          >
            <Mic size={16} /> GRABAR INFORME CLÍNICO
          </button>
        </div>
      </div>

      {/* BUSCADOR Y SEGMENTACIÓN */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/[0.02] p-4 rounded-[32px] border border-white/5">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono o patología..." 
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button onClick={()=>setActiveFilter('todos')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeFilter === 'todos' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>TODOS</button>
          <button onClick={()=>setActiveFilter('activos')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeFilter === 'activos' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>ACTIVOS</button>
        </div>
      </div>

      {/* LISTADO TIPO FICHA */}
      <div className="flex-1 bg-[#0a0a0c] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-8 border-b border-white/5 bg-white/[0.01] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
          <div className="col-span-6">Identidad y Diagnóstico</div>
          <div className="col-span-4">Contacto Directo</div>
          <div className="col-span-2 text-right">Estatus</div>
        </div>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
              <UserPlus size={48} />
              <p className="font-black uppercase tracking-widest text-xs">No hay expedientes que coincidan</p>
            </div>
          ) : (
            filtered.map((p: any) => (
              <div key={p.id} className="grid grid-cols-12 gap-4 p-8 border-b border-white/5 hover:bg-white/[0.02] transition-all items-center group cursor-pointer">
                <div className="col-span-6 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {p.nombre.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{p.nombre}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                       <Activity size={12} className="text-rose-500" /> {p.dolencia || 'Valoración pendiente'}
                    </p>
                  </div>
                </div>
                <div className="col-span-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <UserCheck size={14} className="text-gray-600" /> {p.telefono}
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono italic">{p.email || 'sin-email@clinica.com'}</p>
                </div>
                <div className="col-span-2 text-right flex justify-end items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border ${p.status === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-700/10 text-gray-400 border-gray-600/20'}`}>
                    {p.status || 'ACTIVO'}
                  </span>
                  <ChevronRight size={18} className="text-gray-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
