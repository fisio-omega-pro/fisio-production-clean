'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, PieChart, MessageSquare, Building2, CreditCard, Gift, Volume2 
} from 'lucide-react';

// Importamos nuestra arquitectura modular
import { DashboardLayout, NavItemConfig } from './components/Layout';
import { Modal } from './components/Modal';
import { ActionButton, InputField } from './components/Atoms';
import { useDashboardData, useVoiceAssistant } from './hooks';
import { TabId } from './types';

// Importamos las vistas
import { AgendaView } from './modules/AgendaView';
import { PacientesView } from './modules/PacientesView';
import { FinanzasView } from './modules/FinanzasView';

// Configuración del Menú
const NAV_ITEMS: Record<string, NavItemConfig[]> = {
  operaciones: [
    { id: 'agenda', label: 'Agenda Soberana', icon: Calendar },
    { id: 'pacientes', label: 'CRM de Élite', icon: Users },
    { id: 'finanzas', label: 'Balance Real', icon: PieChart },
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
  // 1. Estados Globales
  const [activeTab, setActiveTab] = useState<TabId>('agenda');
  const [modalType, setModalType] = useState<string | null>(null);
  
  // 2. Hooks de Lógica (Hooks limpios)
  // Nota: Pasamos null como ID inicial, luego debería venir de login/url
  const { pacientes, balance, isLoading, refreshData } = useDashboardData('demo-clinic-id');
  const { speak, toggleRecording, isRecording, transcript } = useVoiceAssistant(true);

  // 3. Efectos
  useEffect(() => {
    // Simular carga de ID desde URL para mantener compatibilidad con tu lógica anterior
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) refreshData();
  }, [refreshData]);

  // 4. Renderizado Condicional de Módulos
  const renderContent = () => {
    if (isLoading) {
      return <div style={{ padding: 40, opacity: 0.5 }}>Cargando sistema V14...</div>;
    }

    switch (activeTab) {
      case 'agenda':
        return <AgendaView onBlockSchedule={() => setModalType('bloqueo')} />;
      case 'pacientes':
        return <PacientesView pacientes={pacientes} onDictate={() => setModalType('voz')} />;
      case 'finanzas':
        return <FinanzasView balance={balance} />;
      
      // Placeholder para módulos futuros (evita errores si haces click)
      default:
        return (
          <div style={{ padding: '50px', textAlign: 'center', opacity: 0.5 }}>
            <h2>Módulo {activeTab} en construcción</h2>
            <p>Implementación modular pendiente.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} navItems={NAV_ITEMS}>
      
      {/* CONTENIDO PRINCIPAL */}
      {renderContent()}

      {/* MODALES GLOBALES */}
      
      {/* Modal de Voz */}
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

      {/* Modal de Bloqueo */}
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

    </DashboardLayout>
  );
}