'use client';
import React from 'react';
import { Smartphone, Download, Zap, ChevronRight } from 'lucide-react';
import { ActionButton } from '../components/Atoms';

export const InstalacionView = () => {

  const handleInstallClick = () => {
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
      (window as any).deferredPrompt.prompt();
    } else {
      alert("Por favor, usa el menú de tu navegador (los 3 puntos) y busca la opción 'Instalar aplicación' para añadir FisioTool a tu escritorio.");
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-4xl mx-auto py-12">
      <div className="border-b border-white/5 pb-8 text-center">
        <Smartphone size={48} className="mx-auto text-blue-500 mb-4" />
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Acceso Móvil Instantáneo</h2>
        <p className="text-gray-500 text-sm mt-2">Convierte el Dashboard en una App para tu teléfono o tablet.</p>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-12 text-center shadow-2xl">
         <h3 className="text-2xl font-black text-white mb-4">FisioTool Pro: Una App en tu Bolsillo</h3>
         <p className="text-gray-400 text-sm mb-8 max-w-xl mx-auto">
            Gracias a la tecnología PWA, puedes instalar el Dashboard directamente en tu pantalla de inicio. Funciona sin internet y se abre al instante.
         </p>

         <div className="flex justify-center gap-6">
            <button 
              onClick={handleInstallClick}
              className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Download size={18} /> INSTALAR AHORA
            </button>
            <button className="flex items-center gap-3 px-8 py-4 bg-white/5 text-white rounded-2xl font-black text-sm border border-white/10">
              <Zap size={18}/> ¿CÓMO FUNCIONA?
            </button>
         </div>
         
         <div className="mt-10 pt-8 border-t border-white/5 text-gray-500 text-xs">
            <p>Si el botón no aparece, busca la opción "Instalar aplicación" en el menú de 3 puntos de tu navegador (Chrome/Edge).</p>
         </div>
      </div>
    </div>
  );
};
