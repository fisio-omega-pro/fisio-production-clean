export type TabId = 'agenda' | 'pacientes' | 'finanzas' | 'equipo' | 'asistente' | 'sedes' | 'cobros' | 'referidos' | 'ajustes';

export interface Especialista {
  id: string;
  nombre: string;
  especialidad: string;
  activo: boolean;
  avatarUrl?: string; // Añadido para futuro
}

export type EstadoPaciente = 'ACTIVO' | 'INACTIVO' | 'PENDIENTE';

export interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  status: EstadoPaciente;
  ultimaVisita?: string; // ISO Date string preferible a 'any'
}

export interface BalanceFinanciero {
  real: number;
  potencial: number;
  roi: number;
  tendenciaMensual: number; // Porcentaje de crecimiento
}

export interface ChatMessage {
  role: 'ana' | 'user';
  text: string;
  timestamp: number;
}

// Props para componentes visuales
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}