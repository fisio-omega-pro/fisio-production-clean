'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, PieChart, MessageSquare, Building2, CreditCard, Gift, Volume2 
} from 'lucide-react';

// Arquitectura
import { DashboardLayout, NavItemConfig } from './components/Layout';
import { Modal } from './components/Modal';
import { ActionButton, InputField } from './components/Atoms';
import { useDashboardData, useVoiceAssistant } from './hooks';
import { TabId } from './types';

// Vistas Principales
import { AgendaView } from './modules/AgendaView';
import { PacientesView } from './modules/PacientesView';
import { FinanzasView } from './modules/FinanzasView';
import { EquipoView } from './modules/EquipoView';
import { AsistenteView } from './modules/AsistenteView';

// Vistas Satélite (NUEVAS)
import { SedesView } from './modules/SedesView';
import { CobrosView } from './modules/CobrosView';
import { ReferidosView } from './modules/ReferidosView';
import { AjustesView } from './modules/AjustesView';

// Configuración del Menú
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
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Estado para el toggle visual
  
  const { pacientes, balance, equipo, isLoading, refreshData } = useDashboardData('demo-clinic-id');
  const { toggleRecording, isRecording, transcript } = useVoiceAssistant(voiceEnabled);

  useEffect(() => { refreshData(); }, [refreshData]);

  const renderContent = () => {
    if (isLoading) return <div style={{ padding: 40, opacity: 0.5 }}>Sintonizando datos...</div>;

    switch (activeTab) {
      // Bloque Principal
      case 'agenda': return <AgendaView onBlockSchedule={() => setModalType('bloqueo')} />;
      case 'pacientes': return <PacientesView pacientes={pacientes} onDictate={() => setModalType('voz')} />;
      case 'finanzas': return <FinanzasView balance={balance} />;
      case 'equipo': return <EquipoView equipo={equipo} onAddMember={() => setModalType('equipo')} />;
      case 'asistente': return <AsistenteView />;
      
      // Bloque Satélite
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
             <p>{isRecording ? 'Escuchando...' : 'Pulsa para hablar'}</p>
             <p style={{ color: '#10b981' }}>{transcript}</p>
          </div>
          <ActionButton onClick={toggleRecording} variant={isRecording ? 'danger' : 'primary'} fullWidth>
            {isRecording ? 'DETENER' : 'INICIAR GRABACIÓN'}
          </ActionButton>
        </div>
      </Modal>

      <Modal isOpen={modalType === 'bloqueo'} onClose={() => setModalType(null)} title="Bloquear Agenda">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <InputField type="date" />
           <InputField placeholder="Motivo" />
           <ActionButton onClick={() => setModalType(null)} variant="danger" fullWidth>BLOQUEAR</ActionButton>
         </div>
      </Modal>

      <Modal isOpen={modalType === 'equipo'} onClose={() => setModalType(null)} title="Nuevo Especialista">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <InputField placeholder="Nombre" />
           <InputField placeholder="Especialidad" />
           <ActionButton onClick={() => setModalType(null)} fullWidth>GUARDAR</ActionButton>
         </div>
      </Modal>

    </DashboardLayout>
  );
}