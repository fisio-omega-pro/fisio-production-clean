import React, { useEffect, useState, useRef } from 'react';
import { Upload, CreditCard, CheckCircle2, Building2, ChevronRight, Loader2, Crown, Image } from 'lucide-react';
import { dashboardAPI } from '../services';

interface SetupProps {
  status: { hasLogo: boolean; hasSubscription: boolean; hasStripe: boolean; };
  onRefresh: () => void;
  isBlind?: boolean;
}

export const SetupWizard: React.FC<SetupProps> = ({ status, onRefresh, isBlind }) => {
  const [loading, setLoading] = useState<string | null>(null); // Trackeamos qué botón carga
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isBlind) return;
    try {
      window.speechSynthesis.cancel();
      const getStatusText = () => {
        const steps = [];
        if (status.hasLogo) steps.push('logo completado');
        if (status.hasSubscription) steps.push('suscripción activa');
        if (status.hasStripe) steps.push('Stripe conectado');
        
        const remaining = [];
        if (!status.hasLogo) remaining.push('subir logo');
        if (!status.hasSubscription) remaining.push('activar suscripción');
        if (!status.hasStripe) remaining.push('conectar Stripe');
        
        return `Configuración inicial. Completados: ${steps.length > 0 ? steps.join(', ') : 'ninguno'}. Pendientes: ${remaining.join(', ')}.`;
      };
      
      const u = new SpeechSynthesisUtterance(getStatusText());
      u.lang = 'es-ES';
      u.rate = 0.95;
      u.volume = 0.9;
      window.speechSynthesis.speak(u);
    } catch {
      // best-effort
    }
  }, [isBlind, status]);

  // 1. Subir Logo Real
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setLoading('upload');
    
    if (isBlind) {
      try {
        const u = new SpeechSynthesisUtterance('Subiendo logo. Por favor, espera...');
        u.lang = 'es-ES';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {}
    }
    
    try { 
      await dashboardAPI.uploadLogo(file); 
      await onRefresh();
      
      if (isBlind) {
        try {
          const u = new SpeechSynthesisUtterance('Logo subido correctamente. Paso uno completado.');
          u.lang = 'es-ES';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    }
    catch(e: any){ 
      alert(e?.message || "Error subida. Prueba la opción provisional.");
      
      if (isBlind) {
        try {
          const u = new SpeechSynthesisUtterance('Error al subir logo. Por favor, intenta la opción provisional.');
          u.lang = 'es-ES';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    }
    setLoading(null);
  };

  // 2. Usar Logo Provisional (FIXED)
  const handleSkipLogo = async () => {
    setLoading('skip');
    
    if (isBlind) {
      try {
        const u = new SpeechSynthesisUtterance('Usando logo provisional. Por favor, espera...');
        u.lang = 'es-ES';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {}
    }
    
    try { 
      console.log("Activando logo provisional...");
      await dashboardAPI.useDefaultLogo(); 
      await onRefresh(); 
      
      if (isBlind) {
        try {
          const u = new SpeechSynthesisUtterance('Logo provisional activado. Paso uno completado.');
          u.lang = 'es-ES';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    }
    catch(e: any){ 
      alert(e?.message || "Error al usar logo provisional.");
      
      if (isBlind) {
        try {
          const u = new SpeechSynthesisUtterance('Error al activar logo provisional.');
          u.lang = 'es-ES';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    }
    setLoading(null);
  };
  
  // 3. Pagar
  const handleSubscribe = async () => {
    setLoading('pay');
    
    if (isBlind) {
      try {
        const u = new SpeechSynthesisUtterance('Redirigiendo a la pasarela de pago. Por favor, completa el formulario para activar tu suscripción.');
        u.lang = 'es-ES';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {}
    }
    
    try { 
      const url = await dashboardAPI.upgradePlan(); 
      window.location.href = url; 
    } catch(e){ 
      alert("Error pago");
      
      if (isBlind) {
        try {
          const u = new SpeechSynthesisUtterance('Error al procesar el pago. Por favor, intenta nuevamente.');
          u.lang = 'es-ES';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    } 
    setLoading(null);
  };

  // 4. Conectar Stripe
  const handleConnectStripe = async () => {
    setLoading('stripe');
    
    if (isBlind) {
      try {
        const u = new SpeechSynthesisUtterance('Redirigiendo a Stripe para conectar tu cuenta bancaria. Por favor, sigue los pasos para configurar el pago.');
        u.lang = 'es-ES';
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      } catch {}
    }
    
    try { 
      const url = await dashboardAPI.connectStripe(); 
      window.location.href = url; 
    } catch(e){ 
      alert("Error Stripe");
      
      if (isBlind) {
        try {
          const u = new SpeechSynthesisUtterance('Error al conectar Stripe. Por favor, intenta nuevamente.');
          u.lang = 'es-ES';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    } 
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#020305] flex items-center justify-center p-6 font-sans text-white">
      <div className="max-w-2xl w-full bg-[#0a0a0c] border border-white/10 rounded-[32px] p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-[#d4af37] to-blue-600" />
        <div className="text-center mb-10">
          <Building2 size={48} className="mx-auto text-blue-500 mb-4" />
          <h1 className="text-2xl font-black">Configuración Inicial</h1>
          <p className="text-gray-500 text-sm">Sigue los 3 pasos para activar tu clínica.</p>
        </div>

        <div className="space-y-4">
          
          {/* PASO 1: LOGO */}
          <StepBox completed={status.hasLogo} number="1" title="Identidad Visual" desc="Logo para tus facturas." active={true}>
            {!status.hasLogo && (
              <div className="flex gap-2 mt-2">
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} disabled={!!loading} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  {loading === 'upload' ? <Loader2 className="animate-spin" size={14}/> : <><Upload size={14}/> SUBIR PROPIO</>}
                </button>
                <button onClick={handleSkipLogo} disabled={!!loading} className="px-4 py-2 border border-white/20 text-gray-300 text-xs font-bold rounded-lg hover:bg-white/10 flex items-center gap-2">
                  {loading === 'skip' ? <Loader2 className="animate-spin" size={14}/> : <><Image size={14}/> USAR GENÉRICO</>}
                </button>
              </div>
            )}
          </StepBox>

          {/* PASO 2: SUSCRIPCIÓN */}
          <StepBox completed={status.hasSubscription} number="2" title="Licencia FisioTool" desc="Suscripción Pro (50€/mes)." active={status.hasLogo}>
            {!status.hasSubscription && (
              <button onClick={handleSubscribe} disabled={!!loading} className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold rounded-lg hover:bg-yellow-500 flex items-center gap-2">
                {loading === 'pay' ? <Loader2 className="animate-spin" size={14}/> : <><Crown size={14}/> PAGAR AHORA</>}
              </button>
            )}
          </StepBox>

          {/* PASO 3: BANCO */}
          <StepBox completed={status.hasStripe} number="3" title="Tu Banco" desc="Conecta Stripe para cobrar." active={status.hasLogo && status.hasSubscription}>
            {!status.hasStripe && (
              <button onClick={handleConnectStripe} disabled={!!loading} className="px-4 py-2 bg-[#0066ff] text-white text-xs font-bold rounded-lg hover:bg-blue-500 flex items-center gap-2">
                {loading === 'bank' ? <Loader2 className="animate-spin" size={14}/> : <>CONECTAR <ChevronRight size={14}/></>}
              </button>
            )}
          </StepBox>

        </div>

        <div className="mt-8 text-center text-[10px] text-gray-500">
          Nota: Si Stripe está en revisión, puedes seguir operando el dashboard en modo limitado.
        </div>
      </div>
    </div>
  );
};

const StepBox = ({ completed, number, title, desc, children, active }: any) => (
  <div className={`p-5 rounded-2xl border transition-all ${active ? (completed ? 'bg-green-900/10 border-green-500/20' : 'bg-white/5 border-white/10') : 'opacity-30 border-white/5 pointer-events-none'}`}>
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${completed ? 'bg-green-500 text-black' : (active ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500')}`}>
          {completed ? <CheckCircle2 size={16} /> : number}
        </div>
        <div><h3 className="font-bold text-sm">{title}</h3><p className="text-[10px] text-gray-400">{desc}</p></div>
      </div>
      {active && !completed && children}
    </div>
  </div>
);
