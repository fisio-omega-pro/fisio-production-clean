import { useState, useEffect, useCallback, useMemo } from 'react';
import { dashboardAPI } from './services';
import { Paciente, Especialista, BalanceFinanciero } from './types';

// --- HOOK 1: Gestión de Datos (Sincronización) ---
export const useDashboardData = (clinicId: string | null) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [equipo, setEquipo] = useState<Especialista[]>([]);
  const [balance, setBalance] = useState<BalanceFinanciero>({ real: 0, potencial: 0, roi: 0, tendenciaMensual: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!clinicId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Promise.allSettled es mejor que Promise.all para que un fallo no rompa todo
      const [resPacientes, resBalance, resEquipo] = await Promise.allSettled([
        dashboardAPI.getPacientes(),
        dashboardAPI.getBalance(),
        dashboardAPI.getEquipo(clinicId)
      ]);

      if (resPacientes.status === 'fulfilled') setPacientes(resPacientes.value);
      if (resBalance.status === 'fulfilled') setBalance(resBalance.value);
      if (resEquipo.status === 'fulfilled') setEquipo(resEquipo.value);
      
    } catch (err) {
      setError("Error de conexión con el servidor V14.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return { pacientes, equipo, balance, isLoading, error, refreshData };
};

// --- HOOK 2: Accesibilidad (Voz y Oído) ---
export const useVoiceAssistant = (enabled: boolean) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Narrador (Texto a Voz)
  const speak = useCallback((text: string) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel(); // Cancelar cola anterior
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  // Dictado (Voz a Texto)
  const toggleRecording = useCallback(() => {
    if (typeof window === 'undefined') return;

    // @ts-ignore - Definición laxa para soporte de navegadores antiguos
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      // La instancia se detendría automáticamente o via ref (simplificado aquí)
    } else {
      setIsRecording(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(prev => prev + " " + text);
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.start();
    }
  }, [isRecording]);

  return { speak, toggleRecording, isRecording, transcript, setTranscript };
};

// --- HOOK 3: Calendario ---
export const useCalendarLogic = () => {
  const [viewDate, setViewDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Primer día del mes
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    // Ajuste para que Lunes sea 0 o manejar offset (Lunes=1 en JS standard getDay() devuelve Dom=0)
    // Asumiremos Lunes como primer día de la semana visualmente
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthName = viewDate.toLocaleString('es-ES', { month: 'long' });

    return { year, month, daysInMonth, offset, monthName };
  }, [viewDate]);

  const moveMonth = (direction: -1 | 1) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return { viewDate, setViewDate, moveMonth, ...calendarData };
};