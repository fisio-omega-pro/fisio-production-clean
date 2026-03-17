'use client';
import React from 'react';
import { TrendingUp, PieChart, Sparkles, Zap, Rocket, AlertCircle, Users } from 'lucide-react';

export const FinanzasView = ({ balance, pacientes = [], onActivateCampaign, onStopCampaign, clinicData, onGoToImport }: any) => {
  const isHunting = clinicData?.config_ia?.modo_caza_activo;
  const hasPatients = Array.isArray(pacientes) && pacientes.length > 0;
  const canActivateCampaign = hasPatients && !isHunting;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Rendimiento</h2>
        <p className="text-gray-500 text-sm mt-1">Análisis de rentabilidad y proyección inteligente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="BALANCE REAL" value={`${balance.real}€`} icon={<PieChart color="#10b981"/>} trend="+12%" color="border-emerald-500" />
        <StatCard label="PROYECCIÓN MES" value={`${balance.potencial}€`} icon={<TrendingUp color="#f59e0b"/>} trend="PENDIENTE" color="border-amber-500" />
        <StatCard label="EFICIENCIA IA" value={`${balance.roi}%`} icon={<Sparkles color="#3b82f6"/>} trend="STABLE" color="border-blue-500" />
      </div>

      {/* Recuperar pacientes inactivos */}
      <div className={`bg-white/[0.02] border rounded-3xl p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-all ${
        isHunting ? 'border-green-500/30 bg-green-500/[0.03]' : 'border-white/10'
      }`}>
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white">Recuperar pacientes inactivos</h3>
            {isHunting && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Activa
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Ana envía emails a los pacientes que no han venido en los últimos 30 días y les ofrece volver. Tú controlas cuándo está activa.
          </p>
          {isHunting && (
            <p className="text-green-400/80 text-xs mt-2">
              ✓ Ana está enviando emails de recaptación automáticamente cada día a las 10:00h.
            </p>
          )}
          {!hasPatients && !isHunting && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 text-sm font-medium">Necesitas tener pacientes en el sistema</p>
                <p className="text-amber-200/80 text-xs mt-1">Importa tu base de pacientes primero para que Ana tenga a quién contactar.</p>
                {onGoToImport && (
                  <button
                    type="button"
                    onClick={onGoToImport}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm font-bold transition-colors"
                  >
                    <Users size={16} /> Ir a Pacientes e importar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle ON / OFF */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <button
            onClick={isHunting ? onStopCampaign : (canActivateCampaign ? onActivateCampaign : undefined)}
            disabled={!isHunting && !canActivateCampaign}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-sm transition-all ${
              isHunting
                ? 'bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 group'
                : hasPatients
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            {isHunting ? (
              <>
                <Zap size={18} className="animate-pulse group-hover:hidden" />
                <span className="group-hover:hidden">Campaña activa</span>
                <span className="hidden group-hover:inline text-xs">⏹ Detener campaña</span>
              </>
            ) : (
              <>
                <Rocket size={18} />
                {hasPatients ? 'Activar campaña' : 'Primero importa pacientes'}
              </>
            )}
          </button>
          {isHunting && (
            <p className="text-[10px] text-gray-500 text-center">Pasa el cursor para detener</p>
          )}
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
