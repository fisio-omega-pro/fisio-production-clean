import { LucideIcon } from 'lucide-react';
export type TabId = 'home' | 'agenda' | 'pacientes' | 'finanzas' | 'bonos' | 'equipo' | 'asistente' | 'config_ana' | 'sugerencias' | 'sedes' | 'cobros' | 'referidos' | 'ajustes';
export type ModalType = 'voz' | 'bloqueo' | 'equipo' | 'sede' | 'welcome' | 'cita' | 'importar' | 'reactivacion' | 'editar_perfil' | 'upgrade' | 'nuevo_bono' | 'logo_upload' | 'stripe_connect' | 'nuevo_paciente' | null;
export interface NavItemConfig { id: TabId; label: string; icon: LucideIcon; accent?: boolean; }
export interface Bono { id: string; paciente_nombre: string; sesiones_totales: number; sesiones_restantes: number; fecha_vencimiento: string; status: 'activo' | 'agotado'; }
export interface Especialista { id: string; nombre: string; especialidad: string; activo?: boolean; avatarUrl?: string; login_email?: string; isOwner?: boolean; }
export interface AgendaProps {
  currentUser: { specialistId: string | null; isOwner: boolean; email?: string };
  equipo: Especialista[];
  agenda: any[];
  bloqueos: any[];
  horario: { apertura?: string; cierre?: string; reapertura?: string; cierre_final?: string };
  onBlockSchedule: () => void;
  onNewAppointment: (data: any) => void;
  onEventClick: (event: any) => void;
}
export interface Paciente { id: string; nombre: string; telefono: string; email: string; status: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE'; ultimaVisita?: string; }
export interface BalanceFinanciero { real: number; potencial: number; roi: number; tendenciaMensual: number; }
export interface ChatMessage { role: 'ana' | 'user' | 'lex'; text: string; timestamp: number; }
export interface BaseComponentProps { className?: string; style?: React.CSSProperties; }
