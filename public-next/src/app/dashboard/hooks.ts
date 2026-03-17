import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardAPI } from './services';
import { Paciente, Especialista, BalanceFinanciero, TabId, ModalType } from './types';
import Papa from 'papaparse';

export const useDashboardState = () => {
  // 1. ESTADOS DE DATOS
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [bloqueos, setBloqueos] = useState<any[]>([]);
  const [bonos, setBonos] = useState<any[]>([]); // 🚨 RESTAURADO: Cajón para los bonos
  const [balance, setBalance] = useState<BalanceFinanciero>({ real: 0, potencial: 0, roi: 0, tendenciaMensual: 0 });
  const [clinicData, setClinicData] = useState<any>({ nombre: '', is_blind: false });
  const [configStatus, setConfigStatus] = useState({ hasLogo: false, hasSubscription: false, hasStripe: false });
  const [equipo, setEquipo] = useState<Especialista[]>([]);
  const [currentUser, setCurrentUser] = useState<{ specialistId: string | null; isOwner: boolean; email?: string }>({ specialistId: null, isOwner: true, email: '' });

  // 2. CONTROL DE UI
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [clinicId, setClinicId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // 3. ESTADOS DE INTERACCIÓN
  const [noteContent, setNoteContent] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [memberToEdit, setMemberToEdit] = useState<Especialista | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const hasGreeted = useRef(false);
  const isRefreshing = useRef(false);

  // 4. SINCRONIZACIÓN CON EL BACKEND
  const refreshData = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      const data = await dashboardAPI.getDashboardData();
      if (data) {
        setPacientes(data.pacientes || []);
        setAgenda(data.agenda || []);
        setBloqueos(data.bloqueos || []);
        setBonos(data.bonos || []); // 🚨 CAPTURA: Recibimos bonos del transportista
        setBalance(data.balance || { real: 0, potencial: 0, roi: 0, tendenciaMensual: 0 });
        setConfigStatus(data.configStatus);
        setClinicData(data.clinicData);
        setClinicId(data.clinicData?.id || ''); // 🚨 CRÍTICO: Establecer clinicId
        setEquipo(data.equipo || []);
        setCurrentUser(data.currentUser || { specialistId: null, isOwner: true });

        // Protocolo de voz para invidentes
        if (data.clinicData?.is_blind) {
          // Por defecto, siempre activo (el saludo solo una vez por sesión)
          setVoiceEnabled(true);
          if (!hasGreeted.current) {
            const welcome = new SpeechSynthesisUtterance(`Bienvenido, soy tu asistente personal. El sistema está sincronizado.`);
            welcome.lang = 'es-ES';
            window.speechSynthesis.speak(welcome);
            hasGreeted.current = true;
          }
        }
      }
    } catch (err) {
      console.error("❌ Fallo en sincronización:", err);
    } finally {
      setIsLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  const handleSaveNote = useCallback(async () => {
    if (!noteContent.trim() || !selectedPatientId) return;
    setLoading(true);
    try {
      await dashboardAPI.savePatientNote(selectedPatientId, noteContent.trim());
      setNoteContent("");
      setSelectedPatientId("");
      await refreshData();
    } catch (e) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [noteContent, selectedPatientId, refreshData]);

  // 5. MANEJADORES OPERATIVOS
  const handleImportFile = async (file: File) => {
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawData = results.data as any[];
          const mapped = rawData.map(row => {
            const findKey = (variations: string[]) => {
              const k = Object.keys(row).find(key => variations.includes(key.toLowerCase().trim()));
              return k ? row[k] : '';
            };
            return {
              nombre: findKey(['nombre', 'name', 'contacto', 'paciente', 'full name']),
              telefono: findKey(['telefono', 'phone', 'movil', 'móvil', 'whatsapp', 'tel']),
              email: findKey(['email', 'mail', 'correo', 'correo electrónico']),
              dolencia: findKey(['dolencia', 'patologia', 'notas', 'observaciones', 'motivo', 'síntomas']) || 'Consulta inicial'
            };
          });
          const count = await dashboardAPI.importPatients(mapped);
          setImportResult({ type: 'success', message: `${count} pacientes integrados correctamente.` });
          setModalType(null);
          refreshData();
        } catch (e: any) {
          setImportResult({ type: 'error', message: e?.message || 'Error en el procesado masivo.' });
        } finally {
          setImporting(false);
        }
      }
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setClinicId(id);
    refreshData();
  }, [refreshData]);

  // 6. RETORNO DE CONTRATO (Íntegro y sin omisiones)
  return {
    pacientes, agenda, bloqueos, bonos, balance, clinicData, configStatus, equipo, currentUser,
    isLoading, activeTab, setActiveTab, modalType, setModalType,
    clinicId, setClinicId, loading, setLoading, voiceEnabled, setVoiceEnabled,
    noteContent, setNoteContent, selectedPatientId, setSelectedPatientId,
    selectedEvent, setSelectedEvent, memberToEdit, setMemberToEdit, importing,
    importResult, setImportResult,
    refreshData, handleSaveNote, handleImportFile
  };
};

export const useVoiceAssistant = (enabled: boolean) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const toggleRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    const Speech = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Speech) return;
    if (isRecording) { setIsRecording(false); } else {
      setIsRecording(true);
      const rec = new Speech();
      rec.lang = 'es-ES';
      rec.onresult = (e: any) => {
        setTranscript(e.results[0][0].transcript);
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.start();
    }
  }, [isRecording]);
  return { isRecording, transcript, setTranscript, toggleRecording };
};
