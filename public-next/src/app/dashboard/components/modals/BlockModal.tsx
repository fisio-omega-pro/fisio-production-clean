'use client'
import React from 'react';
import { Clock } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton, InputField } from '../Atoms';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { date: string; startTime: string; endTime: string; reason: string; allDay: boolean; };
  setData: (data: any) => void;
  onSubmit: () => void;
}

export const BlockModal = ({ isOpen, onClose, data, setData, onSubmit }: BlockModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bloqueo Quirúrgico">
      <div className="flex flex-col gap-4">
        <InputField 
          type="date" 
          label="Día del cierre" 
          value={data.date} 
          onChange={(v) => setData({...data, date: v})} 
        />
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
          <span className="text-sm font-bold text-white">Bloquear jornada completa</span>
          <input 
            type="checkbox" 
            checked={data.allDay} 
            onChange={(e) => setData({...data, allDay: e.target.checked})} 
            className="w-5 h-5 accent-blue-600" 
          />
        </div>
        {!data.allDay && (
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              type="time" 
              label="Desde las" 
              value={data.startTime} 
              onChange={(v) => setData({...data, startTime: v})} 
            />
            <InputField 
              type="time" 
              label="Hasta las" 
              value={data.endTime} 
              onChange={(v) => setData({...data, endTime: v})} 
            />
          </div>
        )}
        <InputField 
          label="Motivo interno" 
          placeholder="Formación, Asuntos Propios..." 
          value={data.reason} 
          onChange={(v) => setData({...data, reason: v})} 
        />
        <ActionButton variant="danger" onClick={onSubmit} fullWidth>
          ACTIVAR BLOQUEO
        </ActionButton>
      </div>
    </Modal>
  );
};
