'use client'
import React from 'react';
import { FileSpreadsheet, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Modal } from '../Modal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
}

export const ImportModal = ({ isOpen, onClose, fileInputRef, onFileSelect, isImporting }: ImportModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importación Inteligente de Pacientes">
      <div className="flex flex-col gap-6 py-4 font-sans">
        
        <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20 flex gap-4 items-center">
           <Sparkles size={24} className="text-blue-500 flex-shrink-0" />
           <p className="text-[11px] text-gray-400 leading-relaxed">
             No te preocupes por el formato. Sube tu Excel o CSV y <strong>Ana se encargará de identificar</strong> los nombres, teléfonos y correos para organizar tu base de datos automáticamente.
           </p>
        </div>

        <div 
          onClick={() => !isImporting && fileInputRef.current?.click()} 
          className={`w-full border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center transition-all ${isImporting ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/[0.02] cursor-pointer'}`}
        >
          {isImporting ? (
            <div className="flex flex-col items-center gap-4">
               <Loader2 size={48} className="text-blue-500 animate-spin" />
               <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Ana está mapeando los datos...</p>
            </div>
          ) : (
            <>
              <FileSpreadsheet size={48} className="text-gray-600 mb-6 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-white mb-2 uppercase tracking-tighter">Suelte su archivo aquí</p>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">o haga clic para explorar (.CSV / .XLSX)</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            accept=".csv, .xlsx" 
            className="hidden" 
          />
        </div>

        <div className="flex items-center gap-2 justify-center text-gray-600">
           <AlertCircle size={12} />
           <p className="text-[9px] font-bold uppercase tracking-tighter">Cumplimiento GDPR garantizado durante el procesado</p>
        </div>
      </div>
    </Modal>
  );
};
