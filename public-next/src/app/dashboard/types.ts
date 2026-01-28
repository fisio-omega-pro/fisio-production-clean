import { LucideIcon } from 'lucide-react';
// 🚨 AMPLIACIÓN DE LA LEY: Añadido 'instalacion'
export type TabId = 'home' | 'agenda' | 'pacientes' | 'finanzas' | 'bonos' | 'equipo' | 'asistente' | 'legal' | 'sugerencias' | 'sedes' | 'cobros' | 'referidos' | 'ajustes' | 'instalacion';
export type ModalType = 'voz' | 'bloqueo' | 'equipo' | 'sede' | 'welcome' | 'cita' | 'importar' | 'reactivacion' | 'editar_perfil' | 'upgrade' | 'nuevo_bono' | null;
export interface NavItemConfig { id: TabId; label: string; icon: LucideIcon; accent?: boolean; }
export interface Bono { id: string; paciente_nombre: string; sesiones_totales: number; sesiones_restantes: number; fecha_vencimiento: string; status: 'activo' | 'agotado'; }
export interface Especialista { id: string; nombre: string; especialidad: string; activo: boolean; avatarUrl?: string; }
export interface Paciente { id: string; nombre: string; telefono: string; email: string; status: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE'; ultimaVisita?: string; }
export interface BalanceFinanciero { real: number; potencial: number; roi: number; tendenciaMensual: number; }
export interface ChatMessage { role: 'ana' | 'user' | 'lex'; text: string; timestamp: number; }
export interface BaseComponentProps { className?: string; style?: React.CSSProperties; }
