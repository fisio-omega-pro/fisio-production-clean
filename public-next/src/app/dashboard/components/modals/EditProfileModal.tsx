'use client'
import React, { useRef } from 'react';
import { Camera, Loader2, Save, Mail, Briefcase, Phone, User, Info } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton, InputField } from '../Atoms';
import { Especialista } from '../../types';

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  member: Especialista | null;
  setMember: (m: Especialista) => void;
  onSave: () => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

export const EditProfileModal = ({ isOpen, onClose, member, setMember, onSave, onUpload, uploading }: EditProfileProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ficha del Especialista">
      <div className="flex flex-col gap-6 p-2 font-sans">
        
        {/* AVATAR Y ESTADO */}
        <div className="flex items-center gap-6 bg-blue-600/5 p-6 rounded-[32px] border border-blue-500/10">
          <div className="relative w-20 h-20">
            {member?.avatarUrl ? (
              <img src={member.avatarUrl} className="w-full h-full rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-2xl font-black text-white">
                {member?.nombre?.charAt(0) || 'E'}
              </div>
            )}
            <button 
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-all"
            >
              <Camera size={14} />
            </button>
          </div>
          <div className="flex-1">
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Estado Operativo</p>
             <h4 className="text-white font-bold uppercase tracking-tighter">Disponible para Citas</h4>
             <p className="text-[10px] text-gray-500 mt-1">Este perfil es visible para Ana en la recepción inteligente.</p>
          </div>
          <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" className="hidden" />
        </div>

        {/* CAMPOS DE IDENTIDAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest text-left">Nombre Completo</p>
              <InputField icon={<User size={14}/>} placeholder="Ej: Dr. Marcos García" value={member?.nombre || ''} onChange={(v) => setMember({...member!, nombre: v})} />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest text-left">Especialidad Principal</p>
              <InputField icon={<Briefcase size={14}/>} placeholder="Ej: Suelo Pélvico" value={member?.especialidad || ''} onChange={(v) => setMember({...member!, especialidad: v})} />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest text-left">Email de Acceso</p>
              <InputField icon={<Mail size={14}/>} placeholder="marcos@clinica.com" value={(member as any)?.email || ''} onChange={(v) => setMember({...member!, email: v} as any)} />
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest text-left">Teléfono Directo</p>
              <InputField icon={<Phone size={14}/>} placeholder="+34 ..." value={(member as any)?.telefono || ''} onChange={(v) => setMember({...member!, telefono: v} as any)} />
           </div>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-3 items-center">
           <Info size={16} className="text-gray-500" />
           <p className="text-[10px] text-gray-400 leading-relaxed">
             Ana usará estos datos para coordinar las agendas. El especialista recibirá un email para configurar su contraseña personal.
           </p>
        </div>

        <ActionButton onClick={onSave} fullWidth style={{height: '55px'}}>
          {uploading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2"/> SINCRONIZAR ESPECIALISTA ➜</>}
        </ActionButton>
      </div>
    </Modal>
  );
};
