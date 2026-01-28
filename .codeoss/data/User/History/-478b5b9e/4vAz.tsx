'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, PieChart, MessageSquare, Building2, CreditCard, Gift, Volume2 
} from 'lucide-react';

// Arquitectura
import { DashboardLayout, NavItemConfig } from './components/Layout';
import { Modal } from './components/Modal';
import { ActionButton, InputField } from './components/Atoms';
import { useDashboardData, useVoiceAssistant } from './hooks';
import { TabId } from './types';

// Vistas Principales y Satélite
import { AgendaView } from './modules/AgendaView';
import { PacientesView } from './modules/PacientesView';
import { FinanzasView } from './modules/FinanzasView';
import { EquipoView } from './modules/EquipoView';
import { AsistenteView } from './modules/AsistenteView';
import { SedesView } from './modules/SedesView';
import { CobrosView } from './modules/CobrosView';
import { ReferidosView } from './modules/ReferidosView';
import { AjustesView } from './modules/AjustesView';

const NAV_ITEMS: Record<string, NavItemConfig[]> = {
  operaciones: [
    { id: 'agenda', label: 'Agenda Soberana', icon: Calendar },
    { id: 'pacientes', label: 'CRM de Élite', icon: Users },
    { id: 'finanzas', label: 'Balance Real', icon: PieChart },
    { id: 'equipo', label: 'Mi Equipo Pro', icon: Users },
  ],
  ia: [
    { id: 'asistente', label: 'Consultoría Ana', icon: MessageSquare },
  ],
  negocio: [
    { id: 'sedes', label: 'Mis Clínicas', icon: Building2 },
    { id: 'cobros', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'referidos', label: 'Plan de Referidos', icon: Gift },
    { id: 'ajustes', label: 'Accesibilidad', icon: Volume2 },
  ]
};

export default function DashboardOmega() {
  const [activeTab, setActiveTab] = useState<TabId>('agenda');
  const [modalType, setModalType] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // 1. Obtención de Clinic ID (Prioriza URL, luego fallback)
  const clinicId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || 'demo-clinic-id';
    }
    return 'demo-clinic-id';
  }, []);

  // Inicialización de Hooks de Datos
  const { pacientes, balance, equipo, isLoading, refreshData } = useDashboardData(clinicId);
  const { toggleRecording, isRecording, transcript } = useVoiceAssistant(voiceEnabled);

  // 2. LÓGICA DE ARRANQUE Y DIAGNÓSTICO (OPERACIÓN SUIZA)
  useEffect(() => {
    const bootstrap = async () => {
      // A. Gestión de Identidad (Token)
      const params = new URLSearchParams(window.location.search);
      const tokenUrl = params.get('token');
      
      if (tokenUrl) {
        localStorage.setItem('fisio_token', tokenUrl);
        console.log("🔑 [DASHBOARD] Nueva llave JWT guardada correctamente.");
        
        // Limpiar URL sin recargar la página
        const newUrl = window.location.pathname + (params.has('id') ? `?id=${params.get('id')}` : '');
        window.history.replaceState({}, document.title, newUrl);
      }

      // B. Test de Conexión (El Escáner de Red)
      try {
        console.log("📡 [DASHBOARD] Iniciando test de conexión con Motor Omega...");
        const res = await fetch('/api/ping');
        const test = await res.json();
        if (test.success) {
          console.log("✅ [DASHBOARD] Conexión establecida. Motor respondiendo.");
        }
      } catch (err) {
        console.error("❌ [DASHBOARD] Error crítico: El backend no responde en /api/ping");
      }

      // C. Carga Inicial de Datos
      const tokenExists = localStorage.getItem('fisio_token');
      if (tokenExists) {
        refreshData();
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshData]);

  const renderContent = () => {
    if (isLoading) return (
      <div style={{ padding: 80, textAlign: 'center', opacity: 0.5 }}>
        <Loader2 className="animate-spin" style={{ margin: '0 auto 20px' }} size={32} />
        <p style={{ letterSpacing: '2px', fontWeight: 800 }}>SINTONIZANDO DATOS OMEGA...</p>
      </div>
    );

    switch (activeTab) {
      case 'agenda': return <AgendaView onBlockSchedule={() => setModalType('bloqueo')} />;
      case 'pacientes': return <PacientesView pacientes={pacientes} onDictate={() => setModalType('voz')} />;
      case 'finanzas': return <FinanzasView balance={balance} />;
      case 'equipo': return <EquipoView equipo={equipo} onAddMember={() => setModalType('equipo')} />;
      case 'asistente': return <AsistenteView />;
      case 'sedes': return <SedesView />;
      case 'cobros': return <CobrosView />;
      case 'referidos': return <ReferidosView />;
      case 'ajustes': return <AjustesView voiceEnabled={voiceEnabled} onToggleVoice={() => setVoiceEnabled(!voiceEnabled)} />;
      default: return <div>Módulo no encontrado</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} navItems={NAV_ITEMS}>
      
      {renderContent()}

      {/* --- MODALES --- */}
      <Modal isOpen={modalType === 'voz'} onClose={() => setModalType(null)} title="Dictado Clínico">
        <div style={{ textAlign: 'center', gap: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
             <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '10px' }}>
               {isRecording ? 'ANA TE ESCUCHA...' : 'PULSA PARA EMPEZAR A DICTAR'}
             </p>
             <p style={{ color: '#10b981', minHeight: '24px', fontWeight: 600 }}>{transcript || '...'}</p>
          </div>
          <ActionButton onClick={toggleRecording} variant={isRecording ? 'danger' : 'primary'} fullWidth>
            {isRecording ? 'FINALIZAR Y GUARDAR' : 'ACTIVAR MICRÓFONO'}
          </ActionButton>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'bloqueo'} onClose={() => setModalType(null)} title="Bloquear Agenda">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <InputField type="date" />
           <InputField placeholder="Motivo del bloqueo (Vacaciones, formación...)" />
           <ActionButton onClick={() => setModalType(null)} variant="danger" fullWidth>CONFIRMAR BLOQUEO</ActionButton>
         </div>
      </Modal>

      <Modal isOpen={modalType === 'equipo'} onClose={() => setModalType(null)} title="Nuevo Especialista">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <InputField placeholder="Nombre completo del profesional" />
           <InputField placeholder="Especialidad" />
           <ActionButton onClick={() => setModalType(null)} fullWidth>DAR DE ALTA EN EQUIPO</ActionButton>
         </div>
      </Modal>

    </DashboardLayout>
  );
}

// Icono de carga auxiliar
const Loader2 = ({ className, style, size }: any) => (
  <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);