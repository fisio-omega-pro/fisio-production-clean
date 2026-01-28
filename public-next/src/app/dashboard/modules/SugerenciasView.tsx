'use client';
import React, { useState } from 'react';
import { Lightbulb, Send, Sparkles } from 'lucide-react';
import { ActionButton } from '../components/Atoms';

export const SugerenciasView = () => {
  const [text, setText] = useState("");
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-3xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Buzón de Innovación</h2>
        <p className="text-gray-500 text-sm">¿Cómo puede Ana ayudarte mejor? Tus ideas definen nuestra hoja de ruta.</p>
      </div>
      <div className="bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-10">
         <div className="flex items-center gap-3 mb-6 text-blue-500">
            <Sparkles size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Feedback Directo a Ana</span>
         </div>
         <textarea 
            className="w-full bg-black border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-blue-500 transition-all min-h-[200px] mb-6"
            placeholder="Describe una nueva funcionalidad o mejora..."
            value={text}
            onChange={(e)=>setText(e.target.value)}
         />
         <ActionButton onClick={()=>{ alert("Gracias. Ana analizará tu propuesta."); setText(""); }} fullWidth style={{height:'60px'}}>ENVIAR PROPUESTA A LA FUNDICIÓN ➜</ActionButton>
      </div>
    </div>
  );
};
