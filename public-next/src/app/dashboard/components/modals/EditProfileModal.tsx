'use client'
import React, { useRef, useState } from 'react';
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
  /** Solo el jefe puede asignar email de acceso; los fisios no ven este campo */
  canEditLoginEmail?: boolean;
}

export const EditProfileModal = ({ isOpen, onClose, member, setMember, onSave, onUpload, uploading, canEditLoginEmail = true }: EditProfileProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Resetear preview cuando cambia el miembro
  React.useEffect(() => {
    setPreviewUrl(member?.avatarUrl || '');
  }, [member]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 📸 Preview instantáneo
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Subir al servidor
    await onUpload(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ficha del Especialista">
      <div className="flex flex-col gap-6 p-2 font-sans">
        
        {/* AVATAR Y ESTADO */}
        <div className="flex items-center gap-6 bg-blue-600/5 p-6 rounded-[32px] border border-blue-500/10">
          <div className="relative w-20 h-20">
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full rounded-full object-cover border-2 border-white/20" alt="Avatar" />
            ) : (
              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-2xl font-black text-white">
                {member?.nombre?.charAt(0) || 'E'}
              </div>
            )}
            <button 
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 hover:text-white transition-all"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={16} />
              </div>
            )}
          </div>
          <div className="flex-1">
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Estado Operativo</p>
             <h4 className="text-white font-bold uppercase tracking-tighter">Disponible para Citas</h4>
             <p className="text-[10px] text-gray-500 mt-1">Este perfil es visible para tu asistente en la recepción inteligente.</p>
             {previewUrl && (
               <p className="text-[10px] text-green-400 mt-2">✅ Foto cargada correctamente</p>
             )}
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
           {canEditLoginEmail && (
             <div>
               <p className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest text-left">Email de acceso (solo su agenda)</p>
               <InputField icon={<Mail size={14}/>} placeholder="fisio@clinica.com" value={member?.login_email || ''} onChange={(v) => setMember({...member!, login_email: v})} />
             </div>
           )}
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest text-left">Teléfono directo</p>
              <InputField icon={<Phone size={14}/>} placeholder="+34 ..." value={(member as any)?.telefono || ''} onChange={(v) => setMember({...member!, telefono: v} as any)} />
           </div>
        </div>

        {canEditLoginEmail && (
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-3 items-center">
             <Info size={16} className="text-gray-500" />
             <p className="text-[10px] text-gray-400 leading-relaxed">
               Si asignas un email de acceso, ese fisio recibirá un email para configurar su contraseña. Podrá entrar con ese email y su contraseña (o la de la clínica hasta que la configure) y ver solo su agenda. El jefe sigue entrando con el email de la clínica y ve todas las agendas.
             </p>
          </div>
        )}

        <ActionButton onClick={onSave} fullWidth style={{height: '55px'}}>
          {uploading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2"/> SINCRONIZAR ESPECIALISTA ➜</>}
        </ActionButton>
      </div>
    </Modal>
  );
};
