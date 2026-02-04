'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useDashboardState, useVoiceAssistant } from './hooks';
import { NAV_ITEMS } from './config/navigation';
import { DashboardLayout } from './components/Layout';
import { Modal } from './components/Modal';
import { ActionButton, InputField } from './components/Atoms';
import { dashboardAPI } from './services';
import { SetupWizard } from './components/SetupWizard'; // Importado

// Vistas y Modales
import { HomeView } from './modules/HomeView';
import { AgendaView } from './modules/AgendaView';
import { PacientesView } from './modules/PacientesView';
import { FinanzasView } from './modules/FinanzasView';
import { EquipoView } from './modules/EquipoView';
import { SedesView } from './modules/SedesView';
import { AsistenteView } from './modules/AsistenteView';
import { CobrosView } from './modules/CobrosView';
import { BonosView } from './modules/BonosView';
import { ReferidosView } from './modules/ReferidosView';
import { AjustesView } from './modules/AjustesView';
import { SugerenciasView } from './modules/SugerenciasView';
import { InstalacionView } from './modules/InstalacionView';
import { LegalView } from './modules/LegalView';
import { VoiceModal } from './components/modals/VoiceModal';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { BlockModal } from './components/modals/BlockModal';
import { ImportModal } from './components/modals/ImportModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { HistoryModal } from './components/HistoryModal';
import { Crown, Loader2, Zap, Ticket, User, Building2, MapPin, Info } from 'lucide-react';

export default function DashboardOmega() {
  const state = useDashboardState();
  const { isRecording, transcript, toggleRecording, setTranscript } = useVoiceAssistant(state.voiceEnabled);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSpokenTab = useRef<string>('');
  
  // DATOS DE FORMULARIOS
  const [apptData, setApptData] = useState({ nombre: '', telefono: '', email: '', fecha: '', hora: '', docId: '' });
  const [blockData, setBlockData] = useState({ date: '', startTime: '09:00', endTime: '20:00', reason: '', allDay: false });
  const [sedeData, setSedeData] = useState({ nombre: '', calle: '', numero: '', cp: '', ciudad: '', provincia: '' });
  const [bonoData, setBonoData] = useState({ paciente_nombre: '', sesiones_totales: 10, fecha_vencimiento: '' });
  const [upgradePlan, setUpgradePlan] = useState<'team' | 'corporate'>('team');

  useEffect(() => { if (transcript) state.setNoteContent(transcript); }, [transcript]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) state.setClinicId(params.get('id')!);
    // Stripe: si volvemos de checkout con session_id, sincronizar (best-effort) y limpiar la URL
    const sid = params.get('session_id');
    if (sid) {
      dashboardAPI.verifySubscription(String(sid)).catch(() => {});
      try {
        params.delete('session_id');
        const qs = params.toString();
        const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
      } catch {
        // best-effort
      }
    }
    state.refreshData();
  }, [state.refreshData]);

  // Narración ligera de navegación para invidentes
  useEffect(() => {
    if (!state.clinicData?.is_blind) return;
    const tabId = String(state.activeTab || '');
    if (!tabId || tabId === lastSpokenTab.current) return;
    lastSpokenTab.current = tabId;
    try {
      const allItems = Object.values(NAV_ITEMS).flat();
      const label = allItems.find((x: any) => x.id === tabId)?.label || tabId;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`Sección: ${label}.`);
      u.lang = 'es-ES';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {
      // best-effort
    }
  }, [state.activeTab, state.clinicData?.is_blind]);

  const handleCreateAppt = async () => {
    try {
      await dashboardAPI.createAppointment(apptData);
      alert("✅ Cita registrada.");
      state.setModalType(null);
      state.refreshData();
    } catch (e) { alert("Error al guardar cita."); }
  };
  
  const handleAddSede = async () => {
    state.setLoading(true);
    try { 
      await dashboardAPI.addSede(sedeData); 
      alert("✅ Infraestructura actualizada."); 
      state.setModalType(null); 
      state.refreshData(); 
    } catch (e) { alert("Error al guardar sede."); } 
    finally { state.setLoading(false); }
  };

  const handleCreateBono = async () => {
    try { 
      await dashboardAPI.createBono(bonoData); 
      alert("✅ Bono emitido correctamente."); 
      state.setModalType(null); 
      state.refreshData(); 
    } catch (e) { alert("Error al emitir bono."); }
  };

  const needsSubscription = !state.configStatus?.hasSubscription;
  const needsStripe = !state.configStatus?.hasStripe;
  const needsSetup = !state.isLoading && (needsSubscription || needsStripe);

  const renderContent = () => {
    if (state.isLoading) return <div className="p-20 text-center text-blue-500 animate-pulse font-black text-xs uppercase tracking-widest">Sincronizando...</div>;
    
    switch (state.activeTab) {
      case 'home': return <HomeView clinicId={state.clinicId} configStatus={state.configStatus} clinicData={state.clinicData} onRefresh={state.refreshData} />;
      case 'agenda': return <AgendaView equipo={state.equipo} agenda={state.agenda} horario={state.clinicData.horario || {apertura:'09:00', cierre:'20:00'}} onBlockSchedule={() => state.setModalType('bloqueo')} onNewAppointment={(d:any)=> { setApptData({...apptData, fecha: d.date, hora: d.time}); state.setModalType('cita'); }} onEventClick={state.setSelectedEvent} />;
      case 'pacientes': return <PacientesView pacientes={state.pacientes} onDictate={() => state.setModalType('voz')} onImport={() => state.setModalType('importar')} />;
      case 'finanzas': return <FinanzasView balance={state.balance} onActivateCampaign={async()=>{ await dashboardAPI.launchCampaign(); state.refreshData(); }} clinicData={state.clinicData} />;
      case 'bonos': return <BonosView clinicData={state.clinicData} bonos={state.bonos} onActivate={async () => { await dashboardAPI.activateBonos(); state.refreshData(); }} onNewBono={() => state.setModalType('nuevo_bono')} />;
      case 'equipo': return <EquipoView equipo={state.equipo} onAddMember={() => state.setModalType('editar_perfil')} currentPlan={state.clinicData.plan} onViewCalendar={()=>state.setActiveTab('agenda')} onEditMember={(m)=> { state.setMemberToEdit(m); state.setModalType('editar_perfil'); }} />;
      case 'sedes': return <SedesView clinicData={state.clinicData} onAddSede={() => state.setModalType('sede')} />;
      case 'cobros': return <CobrosView hasStripe={state.configStatus.hasStripe} clinicData={state.clinicData} />;
      case 'asistente': return <AsistenteView />;
      case 'referidos': return <ReferidosView />;
      case 'legal': return <LegalView />;
      case 'ajustes': return <AjustesView clinicData={state.clinicData} onUpdated={state.refreshData} />;
      case 'sugerencias': return <SugerenciasView />;
      case 'instalacion': return <InstalacionView />;
      default: return <div className="p-20 text-center text-gray-500">Módulo en construcción</div>;
    }
  };

  return (
    <DashboardLayout activeTab={state.activeTab} onTabChange={state.setActiveTab} navItems={NAV_ITEMS}>
      {needsSetup && (
        <div className="mb-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">Modo limitado</div>
              <div className="text-sm font-bold text-white mt-1">
                Cobros y/o licencia pendientes. Puedes usar Agenda, Pacientes, Equipo y Sedes sin problema.
              </div>
              <div className="text-[11px] text-amber-200/70 mt-1">
                {needsSubscription ? 'Licencia: pendiente. ' : ''}{needsStripe ? 'Stripe: pendiente o no disponible. ' : ''}Completa Pagos cuando esté listo.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => state.setActiveTab('cobros')}
                className="px-4 py-3 rounded-2xl bg-white text-black text-[11px] font-black hover:bg-gray-200 transition"
              >
                Ir a Pagos
              </button>
              <button
                onClick={() => state.setModalType('upgrade')}
                className="px-4 py-3 rounded-2xl bg-[#d4af37] text-black text-[11px] font-black hover:bg-yellow-500 transition"
                title={needsStripe ? 'Stripe no está listo aún: se abrirá en modo offline.' : undefined}
              >
                Gestionar licencia
              </button>
            </div>
          </div>
        </div>
      )}
      {renderContent()}

      {/* --- REGISTRO INTEGRAL DE MODALES --- */}
      <AppointmentModal isOpen={state.modalType === 'cita'} onClose={() => state.setModalType(null)} data={apptData} setData={setApptData} onSubmit={handleCreateAppt} />
      <BlockModal isOpen={state.modalType === 'bloqueo'} onClose={() => state.setModalType(null)} data={blockData} setData={setBlockData} onSubmit={() => state.setModalType(null)} />
      <EditProfileModal isOpen={state.modalType === 'editar_perfil'} onClose={() => state.setModalType(null)} member={state.memberToEdit} setMember={state.setMemberToEdit} onSave={() => { state.setModalType(null); state.refreshData(); }} onUpload={async()=>{}} uploading={state.loading} />
      <ImportModal isOpen={state.modalType === 'importar'} onClose={() => state.setModalType(null)} fileInputRef={fileInputRef} onFileSelect={(e) => e.target.files && state.handleImportFile(e.target.files[0])} isImporting={state.importing} />
      <VoiceModal
        isOpen={state.modalType === 'voz'}
        onClose={() => { state.setModalType(null); setTranscript(""); }}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        noteContent={state.noteContent}
        setNoteContent={state.setNoteContent}
        pacientes={state.pacientes}
        selectedPatientId={state.selectedPatientId}
        setSelectedPatientId={state.setSelectedPatientId}
        onSave={async () => {
          try {
            await state.handleSaveNote();
            state.setModalType(null);
            setTranscript("");
            alert("✅ Informe guardado.");
          } catch {
            alert("Error al guardar informe.");
          }
        }}
        loading={state.loading}
      />
      
      <Modal isOpen={state.modalType === 'nuevo_bono'} onClose={() => state.setModalType(null)} title="Emitir Bono de Sesiones">
         <div className="flex flex-col gap-6 p-2">
            <InputField label="Nombre del Paciente" value={bonoData.paciente_nombre} onChange={(v)=>setBonoData({...bonoData, paciente_nombre:v})} />
            <InputField label="Sesiones" type="number" value={bonoData.sesiones_totales.toString()} onChange={(v)=>setBonoData({...bonoData, sesiones_totales:parseInt(v)})} />
            <InputField label="Vencimiento" type="date" value={bonoData.fecha_vencimiento} onChange={(v)=>setBonoData({...bonoData, fecha_vencimiento:v})} />
            <ActionButton onClick={handleCreateBono} fullWidth>ACTIVAR MONEDERO ➜</ActionButton>
         </div>
      </Modal>

      <Modal isOpen={state.modalType === 'sede'} onClose={() => state.setModalType(null)} title="Nueva Sede">
         <div className="flex flex-col gap-6 p-2">
            <InputField label="Nombre" value={sedeData.nombre} onChange={(v)=>setSedeData({...sedeData, nombre:v})} />
            <InputField label="Calle" value={sedeData.calle} onChange={(v)=>setSedeData({...sedeData, calle:v})} />
            <ActionButton onClick={handleAddSede} fullWidth>REGISTRAR INFRAESTRUCTURA ➜</ActionButton>
         </div>
      </Modal>
      
      <Modal isOpen={state.modalType === 'reactivacion'} onClose={() => state.setModalType(null)} title="Motor ASG"><div className="text-center p-4"><Zap size={48} className="text-yellow-500 mx-auto mb-4" /><ActionButton onClick={() => state.setModalType(null)} fullWidth style={{background:'#facc15', color:'#000'}}>LANZAR CAMPAÑA</ActionButton></div></Modal>
      <Modal isOpen={state.modalType === 'upgrade'} onClose={() => state.setModalType(null)} title="Mejorar Plan">
         <div className="text-center p-4">
           <Crown size={48} className="text-yellow-500 mx-auto mb-4" />
           <div className="mb-4 text-left">
             <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Selecciona plan</div>
             <select
               value={upgradePlan}
               onChange={(e) => setUpgradePlan(e.target.value as any)}
               className="w-full bg-[#0a0b10] border border-white/10 rounded-xl text-sm text-white px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500"
             >
               <option value="team">Team (multifisio)</option>
               <option value="corporate">Corporate</option>
             </select>
           </div>
           <ActionButton
             onClick={async()=>{ const url=await dashboardAPI.upgradePlan(upgradePlan); window.location.href=url; }}
             fullWidth
             style={{background:'#fbbf24', color:'#000'}}
           >
             IR A PASARELA DE PAGO
           </ActionButton>
           {(needsStripe || needsSubscription) && (
             <div className="text-[11px] text-gray-400 mt-3">
               Si Stripe está en revisión, la pasarela puede abrirse en modo offline temporalmente.
             </div>
           )}
         </div>
      </Modal>

      {state.selectedEvent && <HistoryModal event={state.selectedEvent} onClose={() => state.setSelectedEvent(null)} />}
    </DashboardLayout>
  );
}
