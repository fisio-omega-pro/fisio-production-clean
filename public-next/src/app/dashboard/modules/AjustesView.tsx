'use client';
import React from 'react';
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react';
import { InputField, ActionButton } from '../components/Atoms';

export const AjustesView = () => {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-4xl">
      <div className="border-b border-white/5 pb-8">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Configuración</h2>
        <p className="text-gray-500 text-sm">Gestiona tu identidad y seguridad en la plataforma.</p>
      </div>
      <div className="space-y-6">
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
           <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><User size={14}/> Perfil de Administrador</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombre Completo" placeholder="Dueño de la clínica" />
              <InputField label="Email de Acceso" placeholder="admin@clinica.com" />
           </div>
        </section>
        <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
           <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Shield size={14}/> Seguridad</h3>
           <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Cambiar contraseña de acceso</p>
              <button className="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest">Actualizar</button>
           </div>
        </section>
      </div>
    </div>
  );
};
