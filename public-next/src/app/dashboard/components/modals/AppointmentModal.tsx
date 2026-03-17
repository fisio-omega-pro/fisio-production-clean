'use client'
import React from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton, InputField } from '../Atoms';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { nombre: string; telefono: string; email: string; fecha: string; hora: string; };
  setData: (data: any) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const AppointmentModal = ({ isOpen, onClose, data, setData, onSubmit, isSubmitting = false, submitError = null }: AppointmentModalProps) => {
  const isValid = data.nombre.trim().length >= 2 && !!data.fecha && !!data.hora;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Cita en el Palacio">
      <div className="flex flex-col gap-5">
        <InputField 
          label="Nombre del Paciente *" 
          value={data.nombre} 
          onChange={(v) => setData({...data, nombre: v})} 
          placeholder="Nombre completo" 
          disabled={isSubmitting}
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="Teléfono" 
            value={data.telefono} 
            onChange={(v) => setData({...data, telefono: v})} 
            placeholder="600 000 000" 
            disabled={isSubmitting}
          />
          <InputField 
            label="Email" 
            value={data.email} 
            onChange={(v) => setData({...data, email: v})} 
            placeholder="paciente@mail.com" 
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField 
            type="date" 
            label="Fecha *" 
            value={data.fecha} 
            onChange={(v) => setData({...data, fecha: v})} 
            disabled={isSubmitting}
          />
          <InputField 
            type="time" 
            label="Hora *" 
            value={data.hora} 
            onChange={(v) => setData({...data, hora: v})} 
            disabled={isSubmitting}
          />
        </div>
        {!isValid && (data.nombre || data.fecha || data.hora) && (
          <p className="text-[10px] text-gray-500">* Nombre (mín. 2 caracteres), fecha y hora son obligatorios.</p>
        )}
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-400 text-xs font-medium flex items-center gap-2">
            ⚠️ {submitError}
          </div>
        )}
        <ActionButton onClick={isSubmitting || !isValid ? undefined : onSubmit} fullWidth style={{ opacity: isSubmitting || !isValid ? 0.5 : 1, cursor: isSubmitting || !isValid ? 'not-allowed' : 'pointer' }}>
          {isSubmitting ? <><Loader2 size={18} className="animate-spin mr-2"/>AGENDANDO...</> : <><UserPlus size={18} className="mr-2"/> CONFIRMAR CITA</>}
        </ActionButton>
      </div>
    </Modal>
  );
};
