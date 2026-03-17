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
  isSubmitting?: boolean;
  submitError?: string | null;
}

export const BlockModal = ({ isOpen, onClose, data, setData, onSubmit, isSubmitting, submitError = null }: BlockModalProps) => {
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
          disabled={isSubmitting}
        />
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-400 text-xs font-medium flex items-center gap-2">
            ⚠️ {submitError}
          </div>
        )}
        <ActionButton variant="danger" onClick={isSubmitting ? undefined : onSubmit} fullWidth disabled={isSubmitting}>
          {isSubmitting ? <><Clock size={14} className="animate-spin mr-2" />Guardando...</> : 'ACTIVAR BLOQUEO'}
        </ActionButton>
      </div>
    </Modal>
  );
};
