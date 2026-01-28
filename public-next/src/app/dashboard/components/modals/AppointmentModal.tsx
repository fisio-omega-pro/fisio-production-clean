'use client'
import React from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton, InputField } from '../Atoms';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { nombre: string; telefono: string; email: string; fecha: string; hora: string; };
  setData: (data: any) => void;
  onSubmit: () => void;
}

export const AppointmentModal = ({ isOpen, onClose, data, setData, onSubmit }: AppointmentModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Cita en el Palacio">
      <div className="flex flex-col gap-5">
        <InputField 
          label="Nombre del Paciente" 
          value={data.nombre} 
          onChange={(v) => setData({...data, nombre: v})} 
          placeholder="Nombre completo" 
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField 
            label="Teléfono" 
            value={data.telefono} 
            onChange={(v) => setData({...data, telefono: v})} 
            placeholder="600 000 000" 
          />
          <InputField 
            label="Email" 
            value={data.email} 
            onChange={(v) => setData({...data, email: v})} 
            placeholder="paciente@mail.com" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField 
            type="date" 
            label="Fecha" 
            value={data.fecha} 
            onChange={(v) => setData({...data, fecha: v})} 
          />
          <InputField 
            type="time" 
            label="Hora" 
            value={data.hora} 
            onChange={(v) => setData({...data, hora: v})} 
          />
        </div>
        <ActionButton onClick={onSubmit} fullWidth>
          <UserPlus size={18} className="mr-2"/> CONFIRMAR CITA
        </ActionButton>
      </div>
    </Modal>
  );
};
