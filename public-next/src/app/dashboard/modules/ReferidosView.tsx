'use client';
import React from 'react';
import { Gift, Share2, Users, Trophy, Copy } from 'lucide-react';
import { ActionButton } from '../components/Atoms';

export const ReferidosView = () => {
  const code = "FISIO-AMIGO-2026";
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Programa de Alianzas</h2>
        <p className="text-gray-500 text-sm">Invita a otros profesionales y reduce tu cuota mensual.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
          <Gift className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
          <h3 className="text-2xl font-black mb-4 uppercase italic">Regala un mes, gana un mes</h3>
          <p className="text-blue-100 text-sm mb-8 leading-relaxed">Por cada clínica que se registre con tu código, ambos recibiréis 30 días gratuitos de suscripción Pro. Sin límites.</p>
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/10">
            <code className="font-mono font-bold text-xl tracking-widest">{code}</code>
            <button onClick={() => { navigator.clipboard.writeText(code); alert("Copiado"); }} className="p-3 bg-white text-blue-600 rounded-xl hover:scale-105 transition-transform"><Copy size={18}/></button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <StatMini icon={<Users size={16}/>} label="REFERIDOS TOTALES" value="0" />
          <StatMini icon={<Trophy size={16}/>} label="MESES GANADOS" value="0" />
        </div>
      </div>
    </div>
  );
};
const StatMini = ({icon, label, value}: any) => (
  <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
    <div className="flex items-center gap-4"><div className="p-3 bg-white/5 rounded-xl text-blue-500">{icon}</div><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span></div>
    <span className="text-2xl font-black text-white">{value}</span>
  </div>
);
