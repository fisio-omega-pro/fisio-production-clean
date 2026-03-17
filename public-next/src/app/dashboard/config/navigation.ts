import { Users, Calendar, PieChart, MessageSquare, Building2, CreditCard, Gift, Home, Headphones, MapPin, Ticket, Settings, Bot } from 'lucide-react';
import { NavItemConfig } from '../types';

export const NAV_ITEMS: Record<string, NavItemConfig[]> = {
  principal: [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'sedes', label: 'Mis Clínicas', icon: MapPin },
  ],
  gestion: [
    { id: 'finanzas', label: 'Balance', icon: PieChart },
    { id: 'bonos', label: 'Bonos de Sesiones', icon: Ticket },
    { id: 'equipo', label: 'Equipo', icon: Users },
  ],
  inteligencia: [
    { id: 'asistente', label: 'Consultoría Asistente', icon: MessageSquare },
    { id: 'config_ana', label: 'Configurar Asistente', icon: Bot, accent: true },
  ],
  configuracion: [
    { id: 'cobros', label: 'Pagos', icon: CreditCard },
    { id: 'referidos', label: 'Referidos', icon: Gift },
    { id: 'ajustes', label: 'Ajustes', icon: Settings },
    { id: 'sugerencias', label: 'Soporte Técnico', icon: Headphones },
  ]
};
