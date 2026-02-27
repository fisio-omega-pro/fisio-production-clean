'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy, Smartphone, CheckCircle2, ExternalLink,
  Monitor, Database, Activity, MessageSquare, Bot, Settings
} from 'lucide-react';

interface HomeProps {
  clinicId: string;
  configStatus: { hasLogo: boolean; hasStripe: boolean };
  clinicData: { nombre: string; logo?: string };
  onRefresh: () => void;
  onGoToAsistente?: () => void;
}

export const HomeView: React.FC<HomeProps> = ({ clinicId, configStatus, clinicData, onGoToAsistente }) => {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', handleResize);

      // PWA install prompt
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setCanInstall(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setCanInstall(false);
    }

    setDeferredPrompt(null);
  };

  const currentOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const publicLink = currentOrigin ? `${currentOrigin}/ana?ref=${clinicId}` : `/ana?ref=${clinicId}`;

  // OPCIÓN A (Humanizada):
  const whatsappScript = `Hola 👋 Soy tu asistente personal, del equipo de recepción de ${clinicData.nombre || 'la clínica'}. Para ver los huecos libres ahora mismo y reservar sin esperas, entra en mi agenda personal: 👉 ${publicLink}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsappScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto pb-20">

      {/* 1. CABECERA HERO */}
      <div className="relative mb-10 md:mb-14">
        <div className="absolute -top-10 -left-10 w-40 h-40 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-[80px] -z-10"></div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
          Centro de Mando <span className="text-blue-500">Activo.</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-lg max-w-2xl leading-relaxed">
          Tu sistema operativo está listo. Usa tu <strong>Portal del Paciente</strong> para automatizar tu agenda y profesionalizar la atención.
        </p>
        {onGoToAsistente && (
          <button
            type="button"
            onClick={onGoToAsistente}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest"
          >
            <MessageSquare size={14} />
            Deja que tu asistente te capacite: pregúntale cómo sacar partido al panel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

        {/* --- COLUMNA IZQUIERDA (ACCESO) --- */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {/* TARJETA: PORTAL DEL PACIENTE */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 border border-white/5 rounded-3xl group-hover:border-blue-500/20 transition-colors duration-500 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(0,102,255,0.2)]">
                <ExternalLink size={24} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Portal del Paciente</h3>
                <p className="text-xs md:text-sm text-gray-400">Enlace oficial para reservas y consultas 24/7.</p>
              </div>
            </div>

            <div className="bg-black rounded-xl border border-white/10 p-5 mb-6 relative group/code">
              <pre className="text-blue-400 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                {whatsappScript}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${copied
                    ? 'bg-green-500 text-white shadow-green-500/20'
                    : 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                  }`}
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copied ? '¡TEXTO COPIADO!' : 'COPIAR MENSAJE PARA WHATSAPP'}
              </button>

              <button
                onClick={() => window.open(publicLink, '_blank')}
                className="py-4 px-6 rounded-xl font-bold text-sm text-gray-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                title="Ver la página que reciben tus pacientes al hacer clic en el enlace"
              >
                <ExternalLink size={18} /> <span className="hidden sm:inline">VISTA PREVIA ENLACE PACIENTE</span><span className="sm:hidden">VISTA PREVIA</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">Ese enlace es el que reciben tus pacientes al hacer clic; úsalo para comprobar qué ven antes de enviarlo por WhatsApp.</p>
          </div>

          {/* TARJETA: CONFIGURA TU ASISTENTE PERSONAL */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 border border-white/5 rounded-3xl group-hover:border-purple-500/20 transition-colors duration-500 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                <Bot size={24} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Configura tu Asistente Personal</h3>
                <p className="text-xs md:text-sm text-gray-400">Personaliza la IA que atenderá a tus pacientes 24/7.</p>
              </div>
            </div>

            <div className="bg-black rounded-xl border border-white/10 p-5 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                Define el nombre, personalidad y conocimientos de tu asistente para que atienda a tus pacientes como si fuera parte de tu equipo.
              </p>
            </div>

            <button
              onClick={onGoToAsistente}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-purple-500 text-white hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              CONFIGURAR ASISTENTE PERSONAL
            </button>
          </div>
        </div>

        {/* --- COLUMNA DERECHA (INSTALACIÓN) --- */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">

          <div className="bg-gradient-to-b from-[#111113] to-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center border border-purple-600/20">
                <Smartphone size={20} className="text-purple-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">FisioTool Pro en tu móvil</h3>
                <p className="text-xs text-gray-500">Escanea el QR para abrir el panel en el teléfono.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="bg-white p-2 rounded-xl shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(origin + '/dashboard')}&bgcolor=000&color=fff&margin=10`}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-lg filter invert"
                  alt="QR Acceso al dashboard"
                />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5"><span className="text-blue-400 font-bold">1.</span> <strong>Escanear:</strong> abre FisioTool Pro en el navegador del móvil.</p>
                <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5"><span className="text-blue-400 font-bold">2.</span> <strong>Compartir:</strong> envía el enlace a otro dispositivo por WhatsApp o email.</p>
                <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5"><span className="text-blue-400 font-bold">3.</span> <strong>Añadir al inicio:</strong> instala FisioTool Pro como app (icono en la pantalla de inicio).</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Monitor size={18} className="text-blue-400" />
                <h4 className="text-sm font-bold text-white">FisioTool Pro en el ordenador</h4>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {canInstall
                  ? 'Instala FisioTool Pro como aplicación en tu ordenador.'
                  : 'Abre el panel en el PC o instálalo manualmente: en Chrome o Edge, menú ⋮ → «Instalar FisioTool Pro».'
                }
              </p>
              {canInstall ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <Monitor size={18} /> Añadir FisioTool Pro al ordenador
                </button>
              ) : (
                <button
                  onClick={() => window.open(`${origin}/dashboard`, '_blank')}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Monitor size={18} /> Abrir FisioTool Pro en PC
                </button>
              )}
            </div>
          </div>

          {/* STATUS HUD */}
          <div className="bg-[#050505] border border-white/5 rounded-2xl p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity size={14} className="text-green-500" />
                  <span className="text-xs text-gray-300">Inteligencia Asistente</span>
                </div>
                <span className="text-[10px] font-bold text-green-500">CONECTADA</span>
              </div>
              <div className="h-px bg-white/5 w-full"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-300">Base Datos Segura</span>
                </div>
                <span className="text-[10px] font-bold text-blue-500">CIFRADO AES</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
