'use client'
import React from 'react';
import { Mic, Loader2, Save, Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import { ActionButton } from '../Atoms';
import { Paciente } from '../../types';

const MAX_NOTE_LEN = 5000;

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
  saveError?: string | null;
  saveDone?: boolean;
}

export const VoiceModal = (props: VoiceModalProps) => {
  const trimmed = props.noteContent.trim();
  const isOverLimit = props.noteContent.length > MAX_NOTE_LEN;
  const isNearLimit = props.noteContent.length > MAX_NOTE_LEN * 0.9;
  const canSave = !props.loading && !!trimmed && !!props.selectedPatientId && !isOverLimit;

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

        <div className="relative">
          <textarea 
            value={props.noteContent}
            onChange={(e) => props.setNoteContent(e.target.value.slice(0, MAX_NOTE_LEN))}
            maxLength={MAX_NOTE_LEN}
            className={`w-full h-40 bg-black/40 border rounded-2xl p-4 text-gray-300 text-sm outline-none transition-all ${
              isOverLimit ? 'border-red-500/50 focus:border-red-500' :
              isNearLimit ? 'border-amber-500/50 focus:border-amber-500' :
              'border-white/10 focus:border-blue-500/50'
            }`}
          />
          <span className={`absolute bottom-3 right-4 text-[9px] tabular-nums font-mono ${
            isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-gray-600'
          }`}>{props.noteContent.length}/{MAX_NOTE_LEN}</span>
        </div>

        <select 
          value={props.selectedPatientId}
          onChange={(e) => props.setSelectedPatientId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
        >
          <option value="">Vincular a paciente...</option>
          {props.pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>

        {props.saveError && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-2">
            ⚠️ {props.saveError}
          </div>
        )}
        {props.saveDone && (
          <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-2xl p-3">
            ✅ Informe guardado correctamente en el expediente del paciente.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button onClick={props.onClose} className="py-3 rounded-xl bg-white/5 text-gray-500 font-bold text-xs">DESCARTAR</button>
          <ActionButton onClick={canSave ? props.onSave : undefined} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
            {props.loading ? <Loader2 className="animate-spin mx-auto"/> : 'GUARDAR INFORME'}
          </ActionButton>
        </div>
      </div>
    </Modal>
  );
};
