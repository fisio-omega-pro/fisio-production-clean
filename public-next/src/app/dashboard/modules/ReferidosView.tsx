'use client';
import React from 'react';
import { Gift, Info } from 'lucide-react';

export const ReferidosView = () => {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-4xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Programa de Alianzas</h2>
        <p className="text-gray-500 text-sm">Sistema de referidos y recompensas (próximamente).</p>
      </div>
      <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 p-6"><Gift size={80} /></div>
        <div className="flex items-center gap-3 text-blue-500 mb-4">
          <Info size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">Transparencia</span>
        </div>
        <h3 className="text-2xl font-black text-white mb-3">En implementación</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
          El programa de referidos todavía no está activo (para evitar promesas falsas). Cuando lo activemos,
          verás aquí tu código único, el tracking de altas y las recompensas aplicadas a tu suscripción.
        </p>
        <div className="mt-6 text-[11px] text-gray-500">
          Si quieres participar en la beta, escríbenos desde <strong>Sugerencias</strong> indicando “Beta referidos”.
        </div>
      </div>
    </div>
  );
};
