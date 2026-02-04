import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardAPI } from './services';
import { Paciente, Especialista, BalanceFinanciero, TabId, ModalType } from './types';
import Papa from 'papaparse';

export const useDashboardState = () => {
  // 1. ESTADOS DE DATOS
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]); 
  const [bonos, setBonos] = useState<any[]>([]); // 🚨 RESTAURADO: Cajón para los bonos
  const [balance, setBalance] = useState<BalanceFinanciero>({ real: 0, potencial: 0, roi: 0, tendenciaMensual: 0 });
  const [clinicData, setClinicData] = useState<any>({ nombre: '', is_blind: false });
  const [configStatus, setConfigStatus] = useState({ hasLogo: false, hasSubscription: false, hasStripe: false });
  const [equipo, setEquipo] = useState<Especialista[]>([]);
  
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
  const hasGreeted = useRef(false);

  // 4. SINCRONIZACIÓN CON EL BACKEND
  const refreshData = useCallback(async () => {
    try {
      const data = await dashboardAPI.getDashboardData();
      if (data) {
        setPacientes(data.pacientes || []);
        setAgenda(data.agenda || []);
        setBonos(data.bonos || []); // 🚨 CAPTURA: Recibimos bonos del transportista
        setBalance(data.balance || { real: 0, potencial: 0, roi: 0, tendenciaMensual: 0 });
        setConfigStatus(data.configStatus);
        setClinicData(data.clinicData);
        setEquipo(data.equipo || []);
        
        // Protocolo de voz para invidentes
        if (data.clinicData?.is_blind) {
          // Por defecto, siempre activo (el saludo solo una vez por sesión)
          setVoiceEnabled(true);
          if (!hasGreeted.current) {
            const welcome = new SpeechSynthesisUtterance(`Bienvenido, soy Ana. El sistema está sincronizado.`);
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
          const mapped = rawData.map(row => ({
            nombre: row.nombre || row.Name || row.Paciente || '',
            telefono: row.telefono || row.Phone || '',
            email: row.email || row.Mail || '',
            dolencia: row.dolencia || row.patologia || 'Consulta inicial'
          }));
          const count = await dashboardAPI.importPatients(mapped);
          alert(`✅ Éxito: ${count} pacientes integrados.`);
          setModalType(null);
          refreshData();
        } catch (e) { 
          alert("Error en procesado masivo."); 
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
    pacientes, agenda, bonos, balance, clinicData, configStatus, equipo,
    isLoading, activeTab, setActiveTab, modalType, setModalType, 
    clinicId, setClinicId, loading, setLoading, voiceEnabled, setVoiceEnabled,
    noteContent, setNoteContent, selectedPatientId, setSelectedPatientId,
    selectedEvent, setSelectedEvent, memberToEdit, setMemberToEdit, importing,
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
