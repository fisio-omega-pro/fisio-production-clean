'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, CheckCircle2, Building, CreditCard, 
  ArrowRight, Loader2, Image as ImageIcon, AlertTriangle, Lock
} from 'lucide-react';
import { dashboardAPI } from '../services';

interface LockProps {
  configStatus: { hasLogo: boolean; hasStripe: boolean };
  clinicData: { nombre: string; logo?: string };
  onRefresh: () => void;
}

export const SetupLockView: React.FC<LockProps> = ({ configStatus, clinicData, onRefresh }) => {
  const [uploading, setUpload] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDACIÓN DE SEGURIDAD Y CALIDAD
    if (file.size > 2 * 1024 * 1024) {
      alert("⚠️ El archivo es demasiado pesado (Máx 2MB).");
      return;
    }
    
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert("⚠️ Formato no soportado. Usa PNG, JPG o WEBP.");
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if (img.width < 200 || img.height < 200) {
        alert("⚠️ Imagen muy pequeña. Mínimo 200x200 píxeles.");
        return;
      }
      setUpload(true);
      try { await dashboardAPI.uploadLogo(file); onRefresh(); } 
      catch (err) { alert("Error al subir."); } 
      finally { setUpload(false); }
    };
  };

  const handleStripe = async () => {
    setConnecting(true);
    try {
      const url = await dashboardAPI.connectStripe();
      window.location.href = url;
    } catch (err) { alert("Error conectando banco"); }
    setConnecting(false);
  };

  // El botón final solo se activa si ambos están OK
  const allReady = configStatus.hasLogo && configStatus.hasStripe;

  return (
    <div style={s.container}>
      <div style={s.content}>
        
        <div style={s.header}>
          <h1 style={s.title}>Activación Requerida</h1>
          <p style={s.subtitle}>
            Para garantizar el cobro de fianzas y la personalización de la App, 
            necesitamos completar estos dos pasos únicos.
          </p>
        </div>

        <div style={s.grid}>
          {/* TARJETA 1: IDENTIDAD */}
          <div style={configStatus.hasLogo ? s.cardDone : s.cardPending}>
            <div style={s.iconHeader}>
              <div style={configStatus.hasLogo ? s.iconDone : s.iconPending}>
                <ImageIcon size={24} />
              </div>
              {configStatus.hasLogo && <CheckCircle2 className="text-green-500" size={24} />}
            </div>
            
            <h3 style={s.cardTitle}>1. Logotipo Clínica</h3>
            <p style={s.cardDesc}>Se mostrará en la App del paciente y en las facturas.</p>
            
            {configStatus.hasLogo ? (
              <div style={s.successBox}>
                <img src={clinicData.logo} alt="Logo" style={s.previewImg} />
                <span>Imagen Cargada</span>
              </div>
            ) : (
              <>
                <div style={s.requirements}>
                  <p>• Mínimo 200x200 px</p>
                  <p>• Máximo 2 MB</p>
                  <p>• Formato PNG o JPG</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{display:'none'}} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={s.btnAction}>
                  {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={18} />}
                  {uploading ? "SUBIENDO..." : "SUBIR IMAGEN"}
                </button>
              </>
            )}
          </div>

          {/* TARJETA 2: TESORERÍA */}
          <div style={configStatus.hasStripe ? s.cardDone : s.cardPending}>
             <div style={s.iconHeader}>
              <div style={configStatus.hasStripe ? s.iconDone : s.iconPending}>
                <CreditCard size={24} />
              </div>
              {configStatus.hasStripe && <CheckCircle2 className="text-green-500" size={24} />}
            </div>
            
            <h3 style={s.cardTitle}>2. Conexión Bancaria</h3>
            <p style={s.cardDesc}>Conecta Stripe para recibir las fianzas automáticamente.</p>

            {configStatus.hasStripe ? (
              <div style={s.successBox}>
                <Building size={18} />
                <span>Banco Conectado</span>
              </div>
            ) : (
              <>
                <div style={s.requirements}>
                  <p>• Pagos seguros diarios</p>
                  <p>• Sin comisiones ocultas</p>
                  <p>• Verificación instantánea</p>
                </div>
                <button onClick={handleStripe} disabled={connecting} style={s.btnAction}>
                   {connecting ? <Loader2 className="animate-spin" /> : <ArrowRight size={18} />}
                   {connecting ? "CONECTANDO..." : "CONECTAR STRIPE"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* BOTÓN FINAL DE ACCESO */}
        <div style={s.footer}>
          {!allReady && (
            <div style={s.lockMsg}>
              <Lock size={14} /> El panel permanecerá bloqueado hasta completar la activación.
            </div>
          )}
          <button 
            onClick={allReady ? onRefresh : undefined} 
            disabled={!allReady} 
            style={allReady ? s.btnFinal : s.btnFinalDisabled}
          >
            ENTRAR AL DASHBOARD
          </button>
        </div>

      </div>
    </div>
  );
};

const s: any = {
  container: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  content: { maxWidth: '800px', width: '100%' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '10px' },
  subtitle: { fontSize: '16px', color: '#71717a' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  
  cardPending: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px', transition: '0.3s' },
  cardDone: { background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '24px', padding: '30px', transition: '0.3s' },
  
  iconHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  iconPending: { width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' },
  iconDone: { width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' },
  
  cardTitle: { fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '5px' },
  cardDesc: { fontSize: '13px', color: '#71717a', marginBottom: '20px', minHeight: '40px' },
  
  requirements: { fontSize: '11px', color: '#52525b', marginBottom: '20px', lineHeight: '1.6' },
  
  btnAction: { width: '100%', background: '#fff', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  
  successBox: { background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700 },
  previewImg: { width: '30px', height: '30px', borderRadius: '6px', objectFit: 'contain', background: '#fff' },

  footer: { marginTop: '50px', textAlign: 'center' },
  lockMsg: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ef4444', fontSize: '12px', marginBottom: '15px' },
  btnFinal: { background: '#0066ff', color: '#fff', border: 'none', padding: '16px 40px', borderRadius: '100px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,102,255,0.4)' },
  btnFinalDisabled: { background: '#27272a', color: '#52525b', border: 'none', padding: '16px 40px', borderRadius: '100px', fontSize: '16px', fontWeight: 800, cursor: 'not-allowed' }
};
