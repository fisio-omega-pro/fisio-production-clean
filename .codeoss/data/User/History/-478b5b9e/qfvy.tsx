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

// Vistas
import { AgendaView } from './modules/AgendaView';
import { PacientesView } from './modules/PacientesView';
import { FinanzasView } from './modules/FinanzasView';
import { EquipoView } from './modules/EquipoView';    // <--- NUEVO
import { AsistenteView } from './modules/AsistenteView'; // <--- NUEVO

// Configuración del Menú
const NAV_ITEMS: Record<string, NavItemConfig[]> = {
  operaciones: [
    { id: 'agenda', label: 'Agenda Soberana', icon: Calendar },
    { id: 'pacientes', label: 'CRM de Élite', icon: Users },
    { id: 'finanzas', label: 'Balance Real', icon: PieChart },
    { id: 'equipo', label: 'Mi Equipo Pro', icon: Users }, // <--- Movidio aquí para visibilidad
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
  
  // En producción, el ID vendría del auth context
  const { pacientes, balance, equipo, isLoading, refreshData } = useDashboardData('demo-clinic-id');
  const { toggleRecording, isRecording, transcript } = useVoiceAssistant(true);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const renderContent = () => {
    if (isLoading) return <div style={{ padding: 40, opacity: 0.5 }}>Sintonizando datos...</div>;

    switch (activeTab) {
      case 'agenda':
        return <AgendaView onBlockSchedule={() => setModalType('bloqueo')} />;
      case 'pacientes':
        return <PacientesView pacientes={pacientes} onDictate={() => setModalType('voz')} />;
      case 'finanzas':
        return <FinanzasView balance={balance} />;
      case 'equipo': // <--- NUEVO CASO
        return <EquipoView equipo={equipo} onAddMember={() => setModalType('equipo')} />;
      case 'asistente': // <--- NUEVO CASO
        return <AsistenteView />;
      
      // Los módulos sencillos (Sedes, Cobros) los podemos dejar como placeholders o hacerlos más tarde
      default:
        return (
          <div style={{ padding: '50px', textAlign: 'center', opacity: 0.5 }}>
            <h2>Módulo {activeTab}</h2>
            <p>Funcionalidad en desarrollo para la Fase 3.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} navItems={NAV_ITEMS}>
      
      {renderContent()}

      {/* --- SISTEMA DE MODALES --- */}

      {/* 1. Modal de Voz */}
      <Modal isOpen={modalType === 'voz'} onClose={() => setModalType(null)} title="Dictado Clínico">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
             <p>{isRecording ? 'Escuchando...' : 'Pulsa para hablar'}</p>
             <p style={{ color: '#10b981' }}>{transcript}</p>
          </div>
          <ActionButton onClick={toggleRecording} variant={isRecording ? 'danger' : 'primary'} fullWidth>
            {isRecording ? 'DETENER' : 'INICIAR GRABACIÓN'}
          </ActionButton>
        </div>
      </Modal>

      {/* 2. Modal de Bloqueo */}
      <Modal isOpen={modalType === 'bloqueo'} onClose={() => setModalType(null)} title="Bloquear Agenda">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <InputField type="date" placeholder="Fecha Inicio" />
           <InputField type="date" placeholder="Fecha Fin" />
           <InputField placeholder="Motivo (Vacaciones, Formación...)" />
           <ActionButton onClick={() => { alert('Bloqueado'); setModalType(null); }} variant="danger" fullWidth>
             CONFIRMAR BLOQUEO
           </ActionButton>
         </div>
      </Modal>

      {/* 3. Modal de Equipo (NUEVO) */}
      <Modal isOpen={modalType === 'equipo'} onClose={() => setModalType(null)} title="Nuevo Especialista">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <InputField placeholder="Nombre completo" />
           <InputField placeholder="Especialidad (ej: Fisioterapia)" />
           <ActionButton onClick={() => { alert('Añadido'); setModalType(null); }} fullWidth>
             GUARDAR FICHA
           </ActionButton>
         </div>
      </Modal>

    </DashboardLayout>
  );
}