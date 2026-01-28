'use client'
import React from 'react';
import { Mic, Loader2, Save, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton } from '../Atoms';
import { Paciente } from '../../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  noteContent: string;
  setNoteContent: (val: string) => void;
  pacientes: Paciente[];
  selectedPatientId: string;
  setSelectedPatientId: (val: string) => void;
  onSave: () => void;
  loading: boolean;
}

export const VoiceModal = (props: VoiceModalProps) => {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title="Dictado Clínico Inteligente">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${props.isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600'}`}>
              <Mic size={20} color="#fff" />
            </div>
            <span className="text-sm font-bold text-white">{props.isRecording ? 'ESCUCHANDO...' : 'MICRO LISTO'}</span>
          </div>
          <button onClick={props.toggleRecording} className={`px-5 py-2 rounded-xl text-[10px] font-black ${props.isRecording ? 'bg-white text-black' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
            {props.isRecording ? 'PARAR' : 'GRABAR'}
          </button>
        </div>

        <textarea 
          value={props.noteContent}
          onChange={(e) => props.setNoteContent(e.target.value)}
          className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 text-gray-300 text-sm outline-none focus:border-blue-500/50 transition-all"
        />

        <select 
          value={props.selectedPatientId}
          onChange={(e) => props.setSelectedPatientId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
        >
          <option value="">Vincular a paciente...</option>
          {props.pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={props.onClose} className="py-3 rounded-xl bg-white/5 text-gray-500 font-bold text-xs">DESCARTAR</button>
          <ActionButton onClick={props.onSave} disabled={props.loading || !props.noteContent || !props.selectedPatientId}>
            {props.loading ? <Loader2 className="animate-spin mx-auto"/> : 'GUARDAR INFORME'}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};
