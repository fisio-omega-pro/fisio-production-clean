import { CSSProperties } from 'react';

export const THEME = {
  colors: {
    background: '#030507',
    surface: '#0f172a',
    primary: '#0066ff',
    primaryGlow: 'rgba(0,102,255,0.4)',
    accent: '#38bdf8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: {
      main: '#ffffff',
      muted: 'rgba(255,255,255,0.5)',
      disabled: 'rgba(255,255,255,0.3)',
    },
    border: 'rgba(255,255,255,0.05)',
  },
  effects: {
    glass: {
      background: 'rgba(255,255,255,0.015)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.05)',
    },
    glassSidebar: {
      background: 'rgba(255,255,255,0.01)',
      backdropFilter: 'blur(40px)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    },
    glow: (color: string) => ({
      boxShadow: `0 0 20px ${color}40`, // 40 es opacidad hex
    }),
  },
  layout: {
    sidebarWidth: '300px',
    radius: {
      card: '24px',
      button: '12px',
    }
  }
};

// Utilidad para mixins de estilos comunes
export const commonStyles = {
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as CSSProperties,
  fullScreen: { width: '100vw', height: '100vh', overflow: 'hidden' } as CSSProperties,
};
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
import React from 'react';
import { motion } from 'framer-motion';
import { THEME, commonStyles } from '../theme';
import { BaseComponentProps } from '../types';

// --- 1. TARJETAS (GLASSMORPHISM) ---
interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<CardProps> = ({ children, style, hoverEffect, className }) => (
  <motion.div
    whileHover={hoverEffect ? { y: -5 } : undefined}
    style={{
      ...THEME.effects.glass,
      borderRadius: THEME.layout.radius.card,
      padding: '30px',
      color: THEME.colors.text.main,
      ...style
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- 2. BOTONES DE ACCIÓN ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', fullWidth, icon, style, ...props 
}) => {
  const getBg = () => {
    switch(variant) {
      case 'danger': return THEME.colors.danger;
      case 'success': return THEME.colors.success;
      case 'ghost': return 'rgba(255,255,255,0.05)';
      default: return THEME.colors.primary;
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      style={{
        ...commonStyles.flexCenter,
        background: getBg(),
        width: fullWidth ? '100%' : 'auto',
        padding: '12px 20px',
        borderRadius: THEME.layout.radius.button,
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        gap: '10px',
        ...style
      }}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
};

// --- 3. INPUTS ESTILIZADOS ---
export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    style={{
      width: '100%',
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${THEME.colors.border}`,
      padding: '15px',
      borderRadius: THEME.layout.radius.button,
      color: '#fff',
      outline: 'none',
      marginBottom: '10px',
      ...props.style
    }}
    {...props}
  />
);

// --- 4. BADGES (ETIQUETAS) ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status === 'ACTIVO' || status === 'Activo';
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '10px',
      fontWeight: 800,
      background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
      color: isActive ? THEME.colors.success : THEME.colors.text.muted,
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
};
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { THEME } from '../theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = '600px' }) => {
  // Manejador para cerrar con tecla ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)'
        }}>
          {/* Capa para cerrar al hacer clic fuera */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              position: 'relative',
              width: width,
              maxWidth: '90vw',
              background: THEME.colors.surface,
              borderRadius: '32px',
              border: `1px solid ${THEME.colors.border}`,
              padding: '40px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff' }}>{title}</h3>
              <button 
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
                aria-label="Cerrar modal"
              >
                <X />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};