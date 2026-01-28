'use client';
import React, { useState } from 'react';
import { Ticket, Loader2, CheckCircle2, Zap, Star } from 'lucide-react';

interface BonosProps {
  clinicData: any;
  bonos: any[];
  onActivate: () => Promise<void>; // Cambiado a Promise para manejar el loading
  onNewBono: () => void;
}

export const BonosView: React.FC<BonosProps> = ({ clinicData, bonos, onActivate, onNewBono }) => {
  const [isActivating, setIsActivating] = useState(false);
  const isActivated = clinicData?.config_ia?.acepta_bonos;

  const handleActivate = async () => {
    setIsActivating(true);
    await onActivate();
    setIsActivating(false);
  };

  if (!isActivated) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-8">
            <Ticket size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Gestión de Bonos</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm">Activa el monedero virtual para sesiones prepagadas.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FeatureBox icon={<Zap size={16}/>} text="Venta de 5/10 sesiones" />
            <FeatureBox icon={<CheckCircle2 size={16}/>} text="Saldo automático" />
            <FeatureBox icon={<Star size={16}/>} text="Fidelización Pro" />
          </div>

          <button 
            onClick={handleActivate}
            disabled={isActivating}
            className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
          >
            {isActivating ? <Loader2 className="animate-spin mx-auto" /> : "ACTIVAR MÓDULO DE BONOS ➜"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Monedero Virtual</h2>
          <p className="text-gray-500 text-sm">Control de bonos activos.</p>
        </div>
        <button onClick={onNewBono} className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs transition-all shadow-2xl">
           EMITIR NUEVO BONO
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bonos.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-600 italic">No hay bonos emitidos.</div>
        ) : (
          bonos.map((bono) => (
            <div key={bono.id} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
              <h3 className="text-xl font-black text-white uppercase">{bono.paciente_nombre}</h3>
              <p className="text-2xl font-black text-blue-500 mt-4">{bono.sesiones_restantes} / {bono.sesiones_totales}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FeatureBox = ({ icon, text }: any) => (
  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
    <div className="text-blue-500">{icon}</div>
    <span className="text-[10px] font-bold text-gray-300 uppercase">{text}</span>
  </div>
);
