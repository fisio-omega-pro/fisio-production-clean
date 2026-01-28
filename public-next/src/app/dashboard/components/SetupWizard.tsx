import React, { useState, useRef } from 'react';
import { Upload, CreditCard, CheckCircle2, Building2, ChevronRight, Loader2, Crown, Image } from 'lucide-react';
import { dashboardAPI } from '../services';

interface SetupProps {
  status: { hasLogo: boolean; hasSubscription: boolean; hasStripe: boolean; };
  onRefresh: () => void;
}

export const SetupWizard: React.FC<SetupProps> = ({ status, onRefresh }) => {
  const [loading, setLoading] = useState<string | null>(null); // Trackeamos qué botón carga
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Subir Logo Real
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return; 
    setLoading('upload');
    try { await dashboardAPI.uploadLogo(file); await onRefresh(); } 
    catch(e){ alert("Error subida. Prueba la opción provisional."); } 
    setLoading(null);
  };

  // 2. Usar Logo Provisional (FIXED)
  const handleSkipLogo = async () => {
    setLoading('skip');
    try { 
      console.log("Activando logo provisional...");
      await dashboardAPI.useDefaultLogo(); 
      await onRefresh(); 
    } catch(e) { 
      alert("Error de conexión. Revisa tu internet."); 
    }
    setLoading(null);
  };
  
  // 3. Pagar
  const handleSubscribe = async () => {
    setLoading('pay');
    try { const url = await dashboardAPI.upgradePlan(); window.location.href = url; } catch(e){ alert("Error pago"); } setLoading(null);
  };

  // 4. Banco
  const handleConnectStripe = async () => {
    setLoading('bank');
    try { const url = await dashboardAPI.connectStripe(); window.location.href = url; } catch(e){ alert("Error banco"); } setLoading(null);
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
                {/* BOTÓN GRANDE Y CLARO */}
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
