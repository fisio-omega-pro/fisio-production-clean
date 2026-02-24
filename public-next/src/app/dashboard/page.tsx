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
import { VoiceModal } from './components/modals/VoiceModal';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { BlockModal } from './components/modals/BlockModal';
import { ImportModal } from './components/modals/ImportModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { HistoryModal } from './components/HistoryModal';
import { LogoModal } from './components/modals/LogoModal';
import { StripeModal } from './components/modals/StripeModal';
import { Crown, Loader2, Zap, Ticket, User, Building2, MapPin, Info } from 'lucide-react';

// Planes que incluyen multi-sede (300€): al subir de nivel se activa automáticamente en el dashboard
const PLANS_MULTI_CLINIC = ['team', 'business', 'clinic', 'corporate'];

export default function DashboardOmega() {
  const state = useDashboardState();
  const plan = String(state.clinicData?.plan || 'solo').toLowerCase();
  const hasMultiClinicPlan = PLANS_MULTI_CLINIC.includes(plan);
  // Mis Clínicas visible para todos: plan 100€ ve solo CTA "Añadir más clínicas"; plan 300€ ve la gestión completa.
  const navItemsFiltered = React.useMemo(() => NAV_ITEMS, []);
  const { isRecording, transcript, toggleRecording, setTranscript } = useVoiceAssistant(state.voiceEnabled);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSpokenTab = useRef<string>('');
  
  // DATOS DE FORMULARIOS
  const [apptData, setApptData] = useState({ nombre: '', telefono: '', email: '', fecha: '', hora: '', docId: '' });
  const [blockData, setBlockData] = useState({ date: '', startTime: '09:00', endTime: '20:00', reason: '', allDay: false });
  const [sedeData, setSedeData] = useState({ nombre: '', calle: '', numero: '', cp: '', ciudad: '', provincia: '' });
  const [bonoData, setBonoData] = useState({ paciente_nombre: '', sesiones_totales: 10, fecha_vencimiento: '' });
  const [upgradePlan, setUpgradePlan] = useState<'team' | 'corporate'>('team');
  
  // Refs para modales
  const logoInputRef = useRef<HTMLInputElement>(null);
  const stripeInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingStripe, setIsUploadingStripe] = useState(false);

  useEffect(() => { if (transcript) state.setNoteContent(transcript); }, [transcript]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) state.setClinicId(params.get('id')!);
    // Stripe: si volvemos de checkout con session_id, sincronizar (best-effort) y limpiar la URL
    const sid = params.get('session_id');
    if (sid) {
      dashboardAPI.verifySubscription(String(sid)).then(() => state.refreshData()).catch(() => {});
      try {
        params.delete('session_id');
        const qs = params.toString();
        const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
      } catch {
        // best-effort
      }
    }
    // refreshData ya se llama en hooks.ts al montar; aquí solo re-sincronizamos tras verificar Stripe
  }, []);

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

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      await dashboardAPI.uploadLogo(file);
      alert("✅ Logo subido correctamente.");
      state.setModalType(null);
      state.refreshData();
    } catch (e) {
      alert("Error al subir logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const needsSubscription = !state.configStatus?.hasSubscription;
  const needsStripe = !state.configStatus?.hasStripe;
  const needsLogo = !state.clinicData?.logo_url;
  const needsSetup = !state.isLoading && (needsStripe || needsLogo);
  const isBlocked = needsSetup; // Bloqueo real del dashboard

  const renderContent = () => {
    if (state.isLoading) return <div className="p-20 text-center text-blue-500 animate-pulse font-black text-xs uppercase tracking-widest">Sincronizando...</div>;
    
    switch (state.activeTab) {
      case 'home': return <HomeView clinicId={state.clinicId} configStatus={state.configStatus} clinicData={state.clinicData} onRefresh={state.refreshData} onGoToAsistente={() => state.setActiveTab('asistente')} />;
      case 'agenda': return <AgendaView currentUser={state.currentUser} equipo={state.equipo} agenda={state.agenda} horario={state.clinicData.horario || {apertura:'09:00', cierre:'20:00'}} onBlockSchedule={() => state.setModalType('bloqueo')} onNewAppointment={(d:any)=> { setApptData({...apptData, fecha: d.date, hora: d.time}); state.setModalType('cita'); }} onEventClick={state.setSelectedEvent} />;
      case 'pacientes': return <PacientesView pacientes={state.pacientes} onDictate={() => state.setModalType('voz')} onImport={() => state.setModalType('importar')} />;
      case 'finanzas': return <FinanzasView balance={state.balance} pacientes={state.pacientes} onActivateCampaign={async()=>{ await dashboardAPI.launchCampaign(); state.refreshData(); }} clinicData={state.clinicData} onGoToImport={() => { state.setActiveTab('pacientes'); state.setModalType('importar'); }} />;
      case 'bonos': return <BonosView clinicData={state.clinicData} bonos={state.bonos} onActivate={async () => { await dashboardAPI.activateBonos(); state.refreshData(); }} onDeactivate={async () => { await dashboardAPI.deactivateBonos(); state.refreshData(); }} onNewBono={() => state.setModalType('nuevo_bono')} />;
      case 'equipo': return <EquipoView currentUser={state.currentUser} equipo={state.equipo} onAddMember={() => state.setModalType('editar_perfil')} currentPlan={state.clinicData.plan} onViewCalendar={()=>state.setActiveTab('agenda')} onEditMember={(m)=> { state.setMemberToEdit(m); state.setModalType('editar_perfil'); }} />;
      case 'sedes':
        if (!hasMultiClinicPlan) {
          return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 max-w-md">
              <Building2 size={32} className="text-blue-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Mis Clínicas</h2>
              <p className="text-gray-400 text-sm mb-6">Para añadir y gestionar varias clínicas desde un solo panel necesitas el plan Multi-Sede (300€/mes). Al subir de plan, solo pagas la parte proporcional hasta tu próxima factura.</p>
              <ActionButton onClick={async () => { const url = await dashboardAPI.upgradePlan('team'); if (url) window.location.href = url; }} style={{ background: '#0066ff', color: '#fff' }}>
                Subir a plan Multi-Sede (300€/mes)
              </ActionButton>
            </div>
          );
        }
        return <SedesView clinicData={state.clinicData} onAddSede={() => state.setModalType('sede')} />;
      case 'cobros': return <CobrosView hasStripe={state.configStatus.hasStripe} clinicData={state.clinicData} />;
      case 'asistente': return <AsistenteView />;
      case 'referidos': return <ReferidosView />;
      case 'ajustes': return <AjustesView clinicData={state.clinicData} onUpdated={state.refreshData} />;
      case 'sugerencias': return <SugerenciasView />;
      default: return <div className="p-20 text-center text-gray-500">Módulo en construcción</div>;
    }
  };

  return (
    <DashboardLayout activeTab={state.activeTab} onTabChange={state.setActiveTab} navItems={navItemsFiltered}>
      {/* BLOQUEO COMPLETO DEL DASHBOARD - PASOS OBLIGATORIOS */}
      {isBlocked ? (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-[#0a0b10] to-black rounded-3xl border border-red-500/30 p-8 max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown size={40} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Configuración Obligatoria</h1>
              <p className="text-gray-400">Completa estos pasos IMPRESCINDIBLES para operar</p>
            </div>

            {/* PASO 1: STRIPE - IMPRESCINDIBLE */}
            <div className={`mb-6 p-4 rounded-2xl border ${needsStripe ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsStripe ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Conectar Stripe</h3>
                    <p className="text-gray-400 text-sm">Para generar pagos y bonos a clientes</p>
                  </div>
                </div>
                {needsStripe ? (
                  <button
                    onClick={() => state.setModalType('stripe_connect')}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition"
                  >
                    Conectar Ahora
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* PASO 2: LOGO - IMPRESCINDIBLE */}
            <div className={`mb-6 p-4 rounded-2xl border ${needsLogo ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsLogo ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Subir Logo de Clínica</h3>
                    <p className="text-gray-400 text-sm">Para branding y app personalizada</p>
                  </div>
                </div>
                {needsLogo ? (
                  <button
                    onClick={() => state.setModalType('logo_upload')}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition"
                  >
                    Subir Logo
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* PASO 3: PACIENTES - RECOMENDADO */}
            <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Importar Pacientes</h3>
                    <p className="text-gray-400 text-sm">Para que Ana pueda prospectar</p>
                  </div>
                </div>
                <button
                  onClick={() => state.setModalType('importar')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-black hover:bg-blue-600 transition"
                >
                  Importar
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-red-400 text-sm font-semibold mb-2">
                {needsStripe && needsLogo ? "⚠️ Debes completar los pasos 1 y 2 para continuar" :
                 needsStripe ? "⚠️ Debes conectar Stripe para continuar" :
                 "⚠️ Debes subir tu logo para continuar"}
              </p>
              <p className="text-gray-500 text-xs">
                Estos pasos son obligatorios para garantizar el funcionamiento correcto de Ana y los pagos
              </p>
            </div>
          </div>
        </div>
      ) : (
        renderContent()
      )}

      {/* --- REGISTRO INTEGRAL DE MODALES --- */}
      <AppointmentModal isOpen={state.modalType === 'cita'} onClose={() => state.setModalType(null)} data={apptData} setData={setApptData} onSubmit={handleCreateAppt} />
      <BlockModal isOpen={state.modalType === 'bloqueo'} onClose={() => state.setModalType(null)} data={blockData} setData={setBlockData} onSubmit={() => state.setModalType(null)} />
      <EditProfileModal
        isOpen={state.modalType === 'editar_perfil'}
        onClose={() => state.setModalType(null)}
        member={state.memberToEdit}
        setMember={state.setMemberToEdit}
        canEditLoginEmail={state.currentUser?.isOwner}
        onSave={async () => {
          if (!state.memberToEdit) return;
          try {
            await dashboardAPI.saveSpecialist({ ...state.memberToEdit, login_email: state.memberToEdit.login_email ?? '' });
            state.setModalType(null);
            state.refreshData();
          } catch (e: any) {
            alert(e?.message || 'Error al guardar el especialista.');
          }
        }}
        onUpload={async()=>{}}
        uploading={state.loading}
      />
      <ImportModal isOpen={state.modalType === 'importar'} onClose={() => state.setModalType(null)} fileInputRef={fileInputRef} onFileSelect={(e) => e.target.files && state.handleImportFile(e.target.files[0])} isImporting={state.importing} />
      <LogoModal
        isOpen={state.modalType === 'logo_upload'}
        onClose={() => state.setModalType(null)}
        fileInputRef={logoInputRef}
        onFileSelect={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
        }}
        isUploading={isUploadingLogo}
      />
      <StripeModal
        isOpen={state.modalType === 'stripe_connect'}
        onClose={() => state.setModalType(null)}
        clinicId={state.clinicId}
        configStatus={state.configStatus}
      />
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

      <Modal isOpen={state.modalType === 'sede' && hasMultiClinicPlan} onClose={() => state.setModalType(null)} title="Nueva Sede">
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
