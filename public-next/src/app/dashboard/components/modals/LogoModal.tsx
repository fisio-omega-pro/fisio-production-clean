'use client'
import React, { useRef } from 'react';
import { Image, Loader2, Sparkles, AlertCircle, Building2 } from 'lucide-react';
import { Modal } from '../Modal';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const LogoModal = ({ isOpen, onClose, fileInputRef, onFileSelect, isUploading }: LogoModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Logo de Clínica">
      <div className="flex flex-col gap-6 py-4 font-sans">

        <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20 flex gap-4 items-center">
          <Building2 size={24} className="text-blue-500 flex-shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Sube el logo de tu clínica. <strong>Se usará en:</strong><br />
            • App personalizada que descarguen tus pacientes<br />
            • Comunicaciones de Ana<br />
            • Branding de tu plataforma
          </p>
        </div>

        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center transition-all ${isUploading ? 'border-blue-500/50 bg-blue-500/5 cursor-wait' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/[0.02] cursor-pointer'}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={48} className="text-blue-500 animate-spin" />
              <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Subiendo logo...</p>
            </div>
          ) : (
            <>
              <Image size={48} className="text-gray-600 mb-6 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-bold text-white mb-2 uppercase tracking-tighter">Suelte su logo aquí</p>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">o haga clic para explorar (.JPG / .PNG)</p>
              <p className="text-[9px] text-gray-600 mt-4 text-center">
                Formato recomendado: 512x512px o cuadrado<br />
                Máximo 2MB
              </p>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept=".jpg, .jpeg, .png"
            className="hidden"
          />
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex gap-3 items-start">
          <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-300 leading-relaxed">
            <strong>Importante:</strong> Un logo profesional aumenta la confianza de tus pacientes y mejora la experiencia en la app.
          </p>
        </div>

      </div>
    </Modal>
  );
};
