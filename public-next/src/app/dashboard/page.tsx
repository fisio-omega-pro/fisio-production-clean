'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useDashboardState, useVoiceAssistant } from './hooks';
import { NAV_ITEMS } from './config/navigation';
import { DashboardLayout } from './components/Layout';
import { Modal } from './components/Modal';
import { ActionButton, InputField } from './components/Atoms';
import { getSubscriptionStatus } from '@/lib/subscriptionStatus';
import { API_BASE_URL } from '@/lib/apiBase';
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
import { AnaConfigView } from './modules/AnaConfigView';
import { SoporteView } from './modules/SoporteView';
import { VoiceModal } from './components/modals/VoiceModal';
import { AppointmentModal } from './components/modals/AppointmentModal';
import { BlockModal } from './components/modals/BlockModal';
import { ImportModal } from './components/modals/ImportModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { HistoryModal } from './components/HistoryModal';
import { LogoModal } from './components/modals/LogoModal';
import { StripeModal } from './components/modals/StripeModal';
import { NewPatientModal } from './components/modals/NewPatientModal';
import { Crown, Loader2, Zap, Ticket, User, Building2, MapPin, Info } from 'lucide-react';

const PLANS_MULTI_CLINIC = ['team', 'business', 'corporate'];
const STAFF_ALLOWED_TABS = ['agenda', 'equipo'];

export default function DashboardOmega() {
  const state = useDashboardState();
  const plan = String(state.clinicData?.plan || 'solo').toLowerCase();
  const hasMultiClinicPlan = PLANS_MULTI_CLINIC.includes(plan);
  const navItemsFiltered = React.useMemo(() => {
    if (!state.currentUser?.isOwner) {
      const filtered: typeof NAV_ITEMS = {};
      for (const section of Object.keys(NAV_ITEMS)) {
        const items = NAV_ITEMS[section].filter(item => STAFF_ALLOWED_TABS.includes(item.id));
        if (items.length > 0) filtered[section] = items;
      }
      return filtered;
    }
    return NAV_ITEMS;
  }, [state.currentUser?.isOwner]);
  const { isRecording, transcript, toggleRecording, setTranscript } = useVoiceAssistant(state.voiceEnabled);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSpokenTab = useRef<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!state.isLoading && !state.currentUser?.isOwner && !STAFF_ALLOWED_TABS.includes(state.activeTab)) {
      state.setActiveTab('agenda');
    }
  }, [state.currentUser?.isOwner, state.isLoading, state.activeTab]);

  // DATOS DE FORMULARIOS
  const [apptData, setApptData] = useState({ nombre: '', telefono: '', email: '', fecha: '', hora: '', docId: '' });
  const [blockData, setBlockData] = useState({ date: '', startTime: '09:00', endTime: '20:00', reason: '', allDay: false });
  const [sedeData, setSedeData] = useState({ nombre: '', calle: '', cp: '', ciudad: '', provincia: '' });
  const [bonoData, setBonoData] = useState({ paciente_nombre: '', sesiones_totales: 10, fecha_vencimiento: '' });
  const [agendaSpecId, setAgendaSpecId] = useState<string | undefined>(undefined);
  const [upgradePlan, setUpgradePlan] = useState<'team' | 'corporate'>('team');
  const [isSavingSpecialist, setIsSavingSpecialist] = useState(false);
  const [saveSpecialistError, setSaveSpecialistError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCreatingAppt, setIsCreatingAppt] = useState(false);
  const [apptError, setApptError] = useState<string | null>(null);
  const [isBlockingSchedule, setIsBlockingSchedule] = useState(false);

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
      dashboardAPI.verifySubscription(String(sid)).then(() => state.refreshData()).catch(() => { });
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
    if (isCreatingAppt) return;
    setIsCreatingAppt(true);
    setApptError(null);
    try {
      const response = await dashboardAPI.createAppointment(apptData);
      if (response.success) {
        state.setModalType(null);
        setApptData({ nombre: '', telefono: '', email: '', fecha: '', hora: '', docId: '' });
        setApptError(null);
        state.refreshData();
      } else if (response.conflict) {
        setApptError('Ya existe una cita activa para esta fecha y hora. Selecciona otro horario.');
      } else {
        setApptError(response.error || 'Error al crear la cita.');
      }
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      const msg = error.message || 'Error al crear la cita';
      if (msg.includes('409') || msg.includes('conflict') || msg.includes('existe')) {
        setApptError('Horario ocupado. Selecciona otra fecha u hora.');
      } else {
        setApptError(msg);
      }
    } finally {
      setIsCreatingAppt(false);
    }
  };

  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgradeToMultiSede = async () => {
    setUpgradeLoading(true);
    try {
      const url = await dashboardAPI.upgradePlan('business');
      if (url) {
        window.location.href = url;
      } else {
        alert('❌ Error: No se pudo generar la URL de pago');
      }
    } catch (error: any) {
      console.error('Error upgrading plan:', error);
      alert(`❌ Error: ${error.message || 'Error al procesar el upgrade'}`);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: any) => {
    try {
      const response = await dashboardAPI.createPatient(patientData);

      if (response.success) {
        state.setModalType(null);
        state.refreshData();
        alert('✅ Paciente creado exitosamente');
      } else {
        alert(`❌ Error: ${response.error || 'Error al crear paciente'}`);
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);

      // Extraer mensaje de error específico
      let errorMessage = 'Error al crear paciente';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleBlockSchedule = async () => {
    if (isBlockingSchedule) return;
    setIsBlockingSchedule(true);
    try {
      await dashboardAPI.createBlock(blockData);
      state.setModalType(null);
      setBlockData({ date: '', startTime: '09:00', endTime: '20:00', reason: '', allDay: false });
      state.refreshData();
    } catch (error: any) {
      console.error('Error creating block:', error);
      alert(`❌ Error al bloquear horario: ${error.message || 'Inténtalo de nuevo'}`);
    } finally {
      setIsBlockingSchedule(false);
    }
  };

  const handleAddSede = async () => {
    // Validar campos obligatorios
    if (!sedeData.nombre.trim() || !sedeData.calle.trim() || !sedeData.cp.trim() || !sedeData.ciudad.trim() || !sedeData.provincia.trim()) {
      alert("❌ Todos los campos son obligatorios");
      return;
    }

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

  const needsLogo = !state.clinicData?.logo_url || state.clinicData?.logo_url.includes('placeholder');
  const needsSubscription = !state.clinicData?.subscription_active;
  const needsStripe = !state.clinicData?.stripe_account_id;
  const needsPatients = state.pacientes.length === 0; // Añadir esta variable
  const needsSetup = needsLogo || needsSubscription || needsStripe; // Activar onboarding si falta algo
  const isBlocked = needsSetup; // Bloqueo real del dashboard

  const renderContent = () => {
    if (state.isLoading) return <div className="p-20 text-center text-blue-500 animate-pulse font-black text-xs uppercase tracking-widest">Sincronizando...</div>;

    switch (state.activeTab) {
      case 'home': return <HomeView clinicId={state.clinicId} configStatus={state.configStatus} clinicData={state.clinicData} onRefresh={state.refreshData} onGoToAsistente={() => state.setActiveTab('config_ana')} />;
      case 'agenda': return <AgendaView clinicData={state.clinicData} currentUser={state.currentUser} equipo={state.equipo} agenda={state.agenda} bloqueos={state.bloqueos} horario={state.clinicData.horario || { apertura: '08:00', cierre: '14:00', reapertura: '16:00', cierre_final: '21:00' }} onBlockSchedule={() => state.setModalType('bloqueo')} onNewAppointment={(d: any) => { setApptData({ ...apptData, fecha: d.date, hora: d.time, docId: d.specialistId || '' }); state.setModalType('cita'); }} onEventClick={state.setSelectedEvent} onDeleteBlock={async (id) => { if (!confirm('¿Eliminar este bloqueo?')) return; try { await dashboardAPI.deleteBlock(id); state.refreshData(); } catch (e: any) { alert(`❌ ${e.message}`); } }} initialSpecId={agendaSpecId} />;
      case 'pacientes': return <PacientesView pacientes={state.pacientes} onDictate={() => state.setModalType('voz')} onImport={() => state.setModalType('importar')} onNewPatient={() => state.setModalType('nuevo_paciente')} />;
      case 'finanzas': return <FinanzasView balance={state.balance} pacientes={state.pacientes} onActivateCampaign={async () => { await dashboardAPI.launchCampaign(); state.refreshData(); }} onStopCampaign={async () => { await dashboardAPI.stopCampaign(); state.refreshData(); }} clinicData={state.clinicData} onGoToImport={() => { state.setActiveTab('pacientes'); state.setModalType('importar'); }} />;
      case 'bonos': return <BonosView
        clinicData={state.clinicData}
        bonos={state.bonos}
        pacientes={state.pacientes}
        onActivate={async () => { await dashboardAPI.activateBonos(); state.refreshData(); }}
        onDeactivate={async () => { await dashboardAPI.deactivateBonos(); state.refreshData(); }}
        onCreateBono={async (bono) => {
          await dashboardAPI.createBono(bono);
          // Pequeño delay para asegurar que el backend procese
          await new Promise(resolve => setTimeout(resolve, 1000));
          state.refreshData();
        }}
        onCreatePaciente={async (paciente) => {
          const result = await dashboardAPI.savePaciente(paciente);
          state.refreshData();
          return result;
        }}
        onGoToAna={() => state.setActiveTab('config_ana')}
      />;
      case 'equipo': return <EquipoView currentUser={state.currentUser} equipo={state.equipo} onAddMember={() => state.setModalType('editar_perfil')} currentPlan={state.clinicData.plan} onViewCalendar={(id: string) => { setAgendaSpecId(id); state.setActiveTab('agenda'); }} onEditMember={(m) => { state.setMemberToEdit(m); state.setModalType('editar_perfil'); }} onDeleteMember={async (m) => { if (!confirm(`¿Eliminar a ${m.nombre} del equipo? Esta acción no se puede deshacer.`)) return; try { await dashboardAPI.deleteSpecialist(m.id); state.refreshData(); } catch (e: any) { alert(`❌ ${e.message}`); } }} onUpgrade={async () => { const url = await dashboardAPI.upgradePlan('team'); if (url) window.location.href = url; }} clinicData={state.clinicData} upgradeLoading={upgradeLoading} />;
      case 'sedes':
        return (
          <SedesView
            clinicData={state.clinicData}
            onAddSede={() => state.setModalType('sede')}
            isUpgradeRequired={!hasMultiClinicPlan}
            onUpgrade={handleUpgradeToMultiSede}
            upgradeLoading={upgradeLoading}
          />
        );
      case 'cobros': return <CobrosView hasStripe={state.configStatus.hasStripe} clinicData={state.clinicData} />;
      case 'asistente': return <AsistenteView />;
      case 'config_ana': return <AnaConfigView clinicData={state.clinicData} onUpdated={state.refreshData} />;
      case 'referidos': return <ReferidosView />;
      case 'ajustes': return <AjustesView clinicData={state.clinicData} onUpdated={state.refreshData} />;
      case 'sugerencias': return <SoporteView />;
      default: return <div className="p-20 text-center text-gray-500">Módulo en construcción</div>;
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout activeTab={state.activeTab} onTabChange={state.setActiveTab} navItems={navItemsFiltered}>
      {/* BLOQUEO COMPLETO DEL DASHBOARD - PASOS OBLIGATORIOS */}
      {isBlocked ? (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6" role="dialog" aria-modal="true" aria-labelledby="setup-title">
          <div className="bg-gradient-to-br from-[#0a0b10] to-black rounded-3xl border border-red-500/30 p-8 max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 id="setup-title" className="text-3xl font-black text-white mb-2">🚀 CONFIGURACIÓN OMEGA (v2.2)</h1>
              <p className="text-gray-400">Completa estos pasos IMPRESCINDIBLES para operar</p>
              {state.clinicData?.is_blind && (
                <p className="text-blue-400 text-sm mt-2">
                  Usa Tab para navegar entre pasos y Enter para activar cada acción.
                </p>
              )}
            </div>

            {/* PASO 1: LOGO - IMPRESCINDIBLE */}
            <div className={`mb-6 p-4 rounded-2xl border ${needsLogo ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsLogo ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="text-white font-bold">1</span>
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
                    aria-label="Subir logo de la clínica - Paso 1 obligatorio"
                    title="Subir logo de la clínica"
                  >
                    Subir Logo
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center" aria-label="Logo completado">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* PASO 2: PACIENTES - IMPRESCINDIBLE */}
            <div className={`mb-6 p-4 rounded-2xl border ${needsPatients ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsPatients ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Importar Pacientes</h3>
                    <p className="text-gray-400 text-sm">Para comenzar a usar la agenda y facturación</p>
                  </div>
                </div>
                {needsPatients ? (
                  <button
                    onClick={() => state.setModalType('importar')}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition"
                    aria-label="Importar pacientes - Paso 2 obligatorio para activar el dashboard"
                    title="Importar pacientes desde archivo CSV"
                  >
                    Importar Pacientes
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center" aria-label="Pacientes importados correctamente">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* PASO 3: IBAN / STRIPE CONNECT - IMPRESCINDIBLE */}
            <div className={`mb-6 p-4 rounded-2xl border ${needsStripe ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsStripe ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Vincular Banco (IBAN)</h3>
                    <p className="text-gray-400 text-sm">Para recibir los pagos de tus pacientes</p>
                  </div>
                </div>
                {needsStripe ? (
                  <button
                    onClick={() => state.setModalType('stripe_connect')}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition"
                  >
                    Configurar Cobros
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* PASO 4: SUSCRIPCIÓN - IMPRESCINDIBLE */}
            <div className={`mb-6 p-4 rounded-2xl border ${needsSubscription ? 'border-red-500/30 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${needsSubscription ? 'bg-red-500' : 'bg-green-500'}`}>
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Activar Suscripción</h3>
                    <p className="text-gray-400 text-sm">Suscripción Fisiotool Pro</p>
                  </div>
                </div>
                {needsSubscription ? (
                  <button
                    onClick={() => state.setModalType('upgrade')}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-black hover:bg-red-600 transition"
                  >
                    Activar Plan
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-red-400 text-sm font-semibold mb-2">
                {needsLogo || needsPatients || needsStripe || needsSubscription ? "⚠️ Completa todos los pasos para activar el dashboard" : "✅ ¡Todo listo!"}
              </p>
              <p className="text-gray-500 text-xs">
                Estos pasos son obligatorios para garantizar el funcionamiento correcto del dashboard
              </p>
            </div>
          </div>
        </div>
      ) : (
        renderContent()
      )}

      {/* --- REGISTRO INTEGRAL DE MODALES --- */}
      <AppointmentModal isOpen={state.modalType === 'cita'} onClose={() => { state.setModalType(null); setApptError(null); }} data={apptData} setData={setApptData} onSubmit={handleCreateAppt} isSubmitting={isCreatingAppt} submitError={apptError} />
      <BlockModal isOpen={state.modalType === 'bloqueo'} onClose={() => state.setModalType(null)} data={blockData} setData={setBlockData} onSubmit={handleBlockSchedule} />
      <EditProfileModal
        isOpen={state.modalType === 'editar_perfil'}
        onClose={() => { state.setModalType(null); setSaveSpecialistError(null); }}
        member={state.memberToEdit}
        setMember={state.setMemberToEdit}
        canEditLoginEmail={state.currentUser?.isOwner}
        onSave={async () => {
          if (!state.memberToEdit || isSavingSpecialist) return;
          setIsSavingSpecialist(true);
          setSaveSpecialistError(null);
          try {
            await dashboardAPI.saveSpecialist({ ...state.memberToEdit, login_email: state.memberToEdit.login_email ?? '' });
            const isNew = !state.memberToEdit.id;
            state.setModalType(null);
            state.refreshData();
            if (isNew) {
              alert('✅ Fisioterapeuta creado. En breve aparece en la sección Equipo.');
            } else {
              alert('✅ Fisioterapeuta actualizado correctamente.');
            }
          } catch (e: any) {
            console.error('Error saving specialist:', e);
            if (e.message && (e.message.includes('LÍMITE_ALCANZADO') || e.message.includes('Corporate'))) {
              if (confirm('Límite alcanzado (5 fisios). ¿Actualizar al plan Corporate (500€/mes)?')) {
                const url = await dashboardAPI.upgradePlan('corporate');
                if (url) window.location.href = url;
              }
            } else if (e.message && (e.message.includes('plan Team') || e.message.includes('300€'))) {
              if (confirm('Necesitas el plan Team para añadir más especialistas. ¿Actualizar ahora?')) {
                const url = await dashboardAPI.upgradePlan('team');
                if (url) window.location.href = url;
              }
            } else {
              setSaveSpecialistError(e.message || 'Error al guardar el fisioterapeuta');
            }
          } finally {
            setIsSavingSpecialist(false);
          }
        }}
        onUpload={async (file: File) => {
          if (!state.memberToEdit?.id) {
            const localUrl = URL.createObjectURL(file);
            state.setMemberToEdit({ ...state.memberToEdit!, avatarUrl: localUrl });
            return;
          }
          setIsUploadingAvatar(true);
          try {
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('specialistId', state.memberToEdit.id);
            const token = localStorage.getItem('fisio_token');
            const res = await fetch(`${API_BASE_URL}/api/dashboard/upload-avatar`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token || ''}` },
              body: formData,
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Error al subir la foto');
            state.setMemberToEdit({ ...state.memberToEdit, avatarUrl: data.avatarUrl });
          } catch (error: any) {
            console.error('Error uploading avatar:', error);
            setSaveSpecialistError(`Error foto: ${error.message}`);
          } finally {
            setIsUploadingAvatar(false);
          }
        }}
        uploading={isUploadingAvatar}
        saving={isSavingSpecialist}
        saveError={saveSpecialistError}
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

      {/* SetupWizard para todos los usuarios cuando el dashboard está bloqueado */}
      {isBlocked && (
        <SetupWizard
          status={state.configStatus}
          onRefresh={state.refreshData}
          isBlind={state.clinicData?.is_blind || false}
        />
      )}
      <StripeModal
        isOpen={state.modalType === 'stripe_connect'}
        onClose={() => state.setModalType(null)}
        clinicId={state.clinicId}
        configStatus={state.configStatus}
        userEmail={state.currentUser?.email}
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
          <InputField label="Nombre del Paciente" value={bonoData.paciente_nombre} onChange={(v) => setBonoData({ ...bonoData, paciente_nombre: v })} />
          <InputField label="Sesiones" type="number" value={bonoData.sesiones_totales.toString()} onChange={(v) => setBonoData({ ...bonoData, sesiones_totales: parseInt(v) })} />
          <InputField label="Vencimiento" type="date" value={bonoData.fecha_vencimiento} onChange={(v) => setBonoData({ ...bonoData, fecha_vencimiento: v })} />
          <ActionButton onClick={handleCreateBono} fullWidth>ACTIVAR MONEDERO ➜</ActionButton>
        </div>
      </Modal>

      <Modal isOpen={state.modalType === 'sede' && hasMultiClinicPlan} onClose={() => state.setModalType(null)} title="Nueva Sede">
        <div className="flex flex-col gap-6 p-2">
          <InputField label="Nombre de la Clínica *" value={sedeData.nombre} onChange={(v) => setSedeData({ ...sedeData, nombre: v })} />
          <InputField label="Calle *" value={sedeData.calle} onChange={(v) => setSedeData({ ...sedeData, calle: v })} />
          <InputField label="Código Postal *" value={sedeData.cp} onChange={(v) => setSedeData({ ...sedeData, cp: v })} />
          <InputField label="Ciudad *" value={sedeData.ciudad} onChange={(v) => setSedeData({ ...sedeData, ciudad: v })} />
          <InputField label="Provincia *" value={sedeData.provincia} onChange={(v) => setSedeData({ ...sedeData, provincia: v })} />
          <ActionButton onClick={handleAddSede} fullWidth>REGISTRAR INFRAESTRUCTURA ➜</ActionButton>
        </div>
      </Modal>

      <Modal isOpen={state.modalType === 'reactivacion'} onClose={() => state.setModalType(null)} title="Motor ASG"><div className="text-center p-4"><Zap size={48} className="text-yellow-500 mx-auto mb-4" /><ActionButton onClick={() => state.setModalType(null)} fullWidth style={{ background: '#facc15', color: '#000' }}>LANZAR CAMPAÑA</ActionButton></div></Modal>

      <NewPatientModal
        isOpen={state.modalType === 'nuevo_paciente'}
        onClose={() => state.setModalType(null)}
        onSave={handleCreatePatient}
      />
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
            onClick={async () => { const url = await dashboardAPI.upgradePlan(upgradePlan); window.location.href = url; }}
            fullWidth
            style={{ background: '#fbbf24', color: '#000' }}
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

      {state.selectedEvent && <HistoryModal event={state.selectedEvent} onClose={() => state.setSelectedEvent(null)} onRefresh={state.refreshData} />}

      {/* 🚀 LOADING GLOBAL PARA FEEDBACK INMEDIATO */}
      <div
        id="global-loading"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}
      >
        <div style={{
          background: '#1a1a1a',
          padding: '24px 32px',
          borderRadius: '16px',
          border: '1px solid #333',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>
            Procesando...
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
            Por favor, espera un momento
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
