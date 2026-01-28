'use client';
import React from 'react';
import { TrendingUp, PieChart, Sparkles, Zap, Rocket, ChevronRight, AlertCircle } from 'lucide-react';

export const FinanzasView = ({ balance, onActivateCampaign, clinicData }: any) => {
  const isHunting = clinicData?.config_ia?.modo_caza_activo;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Rendimiento</h2>
          <p className="text-gray-500 text-sm">Análisis de rentabilidad y proyección inteligente.</p>
        </div>
        
        {/* 🚀 BOTÓN DE IGNICIÓN (Punto 9) */}
        <div className="flex flex-col items-end gap-2">
           <button 
            onClick={onActivateCampaign}
            disabled={isHunting}
            className={`flex items-center gap-4 px-10 py-5 rounded-[20px] font-black text-xs transition-all duration-500 ${isHunting ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'}`}
          >
            {isHunting ? <Zap size={18} className="animate-pulse" /> : <Rocket size={18} />}
            {isHunting ? 'ANA EN MODO PROSPECCIÓN' : 'DESPLEGAR CAMPAÑA DE RECAPTACIÓN'}
            {!isHunting && <ChevronRight size={14} />}
          </button>
          {!isHunting && <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest animate-pulse mr-2">Ana lista para vender</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="BALANCE REAL" value={`${balance.real}€`} icon={<PieChart color="#10b981"/>} trend="+12%" color="border-emerald-500" />
        <StatCard label="PROYECCIÓN MES" value={`${balance.potencial}€`} icon={<TrendingUp color="#f59e0b"/>} trend="PENDIENTE" color="border-amber-500" />
        <StatCard label="EFICIENCIA IA" value={`${balance.roi}%`} icon={<Sparkles color="#3b82f6"/>} trend="STABLE" color="border-blue-500" />
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><Zap size={120}/></div>
         <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <AlertCircle size={32} />
         </div>
         <div className="flex-1">
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter">Estrategia de Caza Activa</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              Al activar esta campaña, Ana contactará a los pacientes importados que no han agendado en los últimos 30 días para ofrecerles bonos exclusivos. Recibirás notificaciones en tiempo real cuando un paciente responda.
            </p>
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, color }: any) => (
  <div className={`bg-white/[0.02] border-l-4 ${color} rounded-[32px] p-8 hover:bg-white/[0.04] transition-all group`}>
    <div className="flex justify-between mb-6">
       <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
       <span className="text-[10px] font-black text-gray-600 tracking-widest uppercase">{trend}</span>
    </div>
    <div className="text-4xl font-black text-white mb-1 tracking-tighter">{value}</div>
    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</div>
  </div>
);
