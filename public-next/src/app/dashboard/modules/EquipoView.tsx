'use client';

import React from 'react';
import { Users, Plus, Crown, ShieldCheck, Settings, Calendar, ArrowUpRight, UserCheck, Building2 } from 'lucide-react';
import { Especialista } from '../types';
import { getSubscriptionStatus } from '@/lib/subscriptionStatus';

interface EquipoProps {
  currentUser?: { specialistId: string | null; isOwner: boolean; email?: string };
  equipo: Especialista[];
  onAddMember: () => void;
  currentPlan: string;
  onViewCalendar: (id: string) => void;
  onEditMember: (member: Especialista) => void;
  onUpgrade: () => void;
  clinicData?: any;
  upgradeLoading?: boolean;
}

export const EquipoView: React.FC<EquipoProps> = ({ 
  currentUser, 
  equipo, 
  onAddMember, 
  currentPlan, 
  onViewCalendar, 
  onEditMember, 
  onUpgrade,
  clinicData,
  upgradeLoading
}) => {
  // Aplicar la misma lógica que SedesView
  const subscriptionStatus = getSubscriptionStatus(clinicData);
  
  const isSolo = currentPlan === 'solo';
  const isStaff = !!(currentUser?.specialistId);
  const membersToShow = isStaff ? equipo.filter((m) => m.id === currentUser!.specialistId) : equipo;

  // 🎯 CONTADOR DE FISIOS Y LÍMITE
  const equipoCount = equipo.length;
  const limiteFisios = 5;
  const puedeAgregarMas = equipoCount < limiteFisios;

  // DEBUG: Log para ver qué está pasando
  console.log('🔍 DEBUG EquipoView:', {
    currentUser,
    equipo,
    isStaff,
    isSolo,
    subscriptionStatus,
    specialistId: currentUser?.specialistId,
    equipoCount,
    puedeAgregarMas
  });

  // Si no tiene permisos de plan, mostrar upgrade para añadir más fisios
  // PERO permitir ver y editar su propio perfil (tanto staff como owner)
  if (!subscriptionStatus.canAccessMultiSede || subscriptionStatus.needsToPay) {
    // Si es staff (fisio) o owner (admin), mostrar su perfil o formulario para crearlo
    const userId = currentUser?.specialistId || (currentUser?.isOwner ? 'owner' : null);
    
    if (userId) {
      const miPerfil = currentUser?.specialistId 
        ? equipo.find(m => m.id === currentUser.specialistId)
        : equipo.find(m => m.login_email === currentUser?.email) || equipo[0]; // Buscar por email o primer perfil si es owner
      
      console.log('👤 Usuario (staff/owner), perfil encontrado:', miPerfil, 'userId:', userId);
      
      // Si tiene perfil, mostrarlo
      if (miPerfil) {
        return (
          <div className="flex flex-col gap-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-blue-500 mb-4">
                  <UserCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mi perfil</span>
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-4 uppercase italic">Mi ficha</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Tu ficha en la clínica. Solo el administrador puede ver y gestionar el resto del equipo.
                </p>
              </div>
            </div>

            {/* TARJETA DE PERFIL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative bg-white/[0.02] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="w-full h-full rounded-full bg-blue-600/20 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                        {miPerfil.avatarUrl ? (
                          <img src={miPerfil.avatarUrl} className="w-full h-full object-cover" alt={miPerfil.nombre} />
                        ) : (
                          <span className="text-2xl font-black text-blue-500">{miPerfil.nombre.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#05070a] rounded-full" />
                    </div>

                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-1">{miPerfil.nombre}</h3>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 px-3 py-1 bg-blue-400/5 rounded-full border border-blue-400/10">
                      {miPerfil.especialidad}
                    </p>

                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button onClick={() => onViewCalendar(miPerfil.id)} className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-bold text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                        <Calendar size={12} /> AGENDA
                      </button>
                      <button onClick={() => onEditMember(miPerfil)} className="flex items-center justify-center gap-2 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-[10px] hover:text-white transition-all">
                        <Settings size={12} /> EDITAR
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: UPGRADE */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[40px] p-8 text-black relative overflow-hidden shadow-2xl">
                  <Crown className="absolute -right-4 -top-4 w-32 h-32 opacity-20 rotate-12" />
                  <h3 className="text-xl font-black mb-2 uppercase italic leading-tight">Plan Solo Activo</h3>
                  <p className="text-black/70 text-xs font-bold leading-relaxed mb-8">
                    Actualmente gestionas tu clínica de forma individual. Actualiza para añadir hasta 5 especialistas y desbloquear el cálculo de comisiones automático de Ana.
                  </p>
                  <button
                    onClick={onUpgrade}
                    className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  >
                    DESBLOQUEAR EQUIPO <ArrowUpRight size={14} />
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-blue-500" /> Seguridad de Datos
                  </h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Cada miembro del equipo recibirá sus propias credenciales. Ana registra cada acceso a las fichas clínicas para garantizar el cumplimiento de la ley de protección de datos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      // Si NO tiene perfil, mostrar formulario para crearlo
      console.log('📝 Usuario (staff/owner) pero no tiene perfil, mostrando formulario');
      return (
        <div className="flex flex-col gap-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-blue-500 mb-4">
                <UserCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mi perfil</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-4 uppercase italic">Completa tu ficha</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Aún no tienes tu perfil de fisioterapeuta. Completa tus datos para que aparezcas en el sistema de la clínica.
              </p>
            </div>
          </div>

          {/* TARJETA DE CREACIÓN DE PERFIL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600/20 border-2 border-white/10 flex items-center justify-center">
                    <span className="text-3xl font-black text-blue-500">?</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Crea tu perfil de fisioterapeuta</h3>
                  <p className="text-gray-400 text-sm">
                    Registra tus datos profesionales para poder gestionar tus citas y pacientes.
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={onAddMember}
                    className="px-8 py-4 bg-white text-black rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-2xl"
                  >
                    <Plus size={18} className="inline mr-2" />
                    CREAR MI PERFIL
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: INFO */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[40px] p-8 text-black relative overflow-hidden shadow-2xl">
                <Crown className="absolute -right-4 -top-4 w-32 h-32 opacity-20 rotate-12" />
                <h3 className="text-xl font-black mb-2 uppercase italic leading-tight">Plan Solo Activo</h3>
                <p className="text-black/70 text-xs font-bold leading-relaxed mb-8">
                  Actualmente gestionas tu clínica de forma individual. Actualiza para añadir hasta 5 especialistas y desbloquear el cálculo de comisiones automático de Ana.
                </p>
                <button
                  onClick={onUpgrade}
                  className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  DESBLOQUEAR EQUIPO <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-500" /> Seguridad de Datos
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Tu perfil profesional estará protegido y solo será visible para el administrador de la clínica y para ti mismo.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Si no es staff, mostrar upgrade tradicional
    console.log('🚫 No es staff, mostrando upgrade tradicional');
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 max-w-md">
        <Building2 size={32} className="text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Equipo</h2>
        <p className="text-gray-400 text-sm mb-6">Para añadir y gestionar varios fisioterapeutas en tu equipo necesitas el plan Multi-Sede (300€/mes). Al subir de plan, solo pagas la parte proporcional hasta tu próxima factura.</p>
        <button 
          onClick={onUpgrade} 
          disabled={upgradeLoading}
          style={{ background: '#0066ff', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
        >
          {upgradeLoading ? 'Procesando...' : 'Subir a plan Multi-Sede (300€/mes)'}
        </button>
      </div>
    );
  }

  // Si necesita pagar, mostrar solo el botón de pago
  if (subscriptionStatus.needsToPay) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 max-w-md">
        <Building2 size={32} className="text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Equipo</h2>
        <p className="text-gray-400 text-sm mb-6">Para añadir y gestionar varios fisioterapeutas en tu equipo necesitas activar tu suscripción al plan Multi-Sede (300€/mes).</p>
        <button 
          onClick={onUpgrade} 
          disabled={upgradeLoading}
          style={{ background: '#0066ff', color: '#fff', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
        >
          {upgradeLoading ? 'Procesando...' : 'Activar Suscripción (300€/mes)'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* HEADER DINÁMICO (solo jefe ve botón añadir / upgrade) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-blue-500 mb-4">
            <UserCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isStaff ? 'Mi perfil' : 'Gestión de Especialistas'}</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4 uppercase italic">{isStaff ? 'Mi ficha' : 'Estructura Clínica'}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {isStaff ? 'Tu ficha en la clínica. Solo el administrador puede ver y gestionar el resto del equipo.' : 'Organiza a tu equipo médico, supervisa sus agendas y define su impacto en la clínica. Un equipo bien gestionado multiplica por 3 la retención de pacientes.'}
          </p>
        </div>

        {!isStaff && (
          <button
            onClick={isSolo ? onUpgrade : onAddMember}
            className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 ${isSolo ? 'bg-amber-500 text-black shadow-xl shadow-amber-500/10' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}
          >
            {isSolo ? <Crown size={16} /> : <Plus size={18} />}
            {isSolo ? 'MEJORAR A PLAN TEAM' : 'REGISTRAR ESPECIALISTA'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* COLUMNA IZQUIERDA: TARJETAS (staff solo ve la suya) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {membersToShow.map((member) => (
            <div key={member.id} className="group relative bg-white/[0.02] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-24 h-24 mb-6">
                  <div className="w-full h-full rounded-full bg-blue-600/20 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} className="w-full h-full object-cover" alt={member.nombre} />
                    ) : (
                      <span className="text-2xl font-black text-blue-500">{member.nombre.charAt(0)}</span>
                    )}
                  </div>
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-[#05070a] rounded-full" />
                </div>

                <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-1">{member.nombre}</h3>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 px-3 py-1 bg-blue-400/5 rounded-full border border-blue-400/10">
                  {member.especialidad}
                </p>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <button onClick={() => onViewCalendar(member.id)} className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-bold text-[10px] hover:bg-blue-600 hover:text-white transition-all">
                    <Calendar size={12} /> AGENDA
                  </button>
                  {/* 🚨 BOTÓN DE EDICIÓN CONECTADO */}
                  <button onClick={() => onEditMember(member)} className="flex items-center justify-center gap-2 py-3 bg-white/5 text-gray-400 rounded-xl font-bold text-[10px] hover:text-white transition-all">
                    <Settings size={12} /> EDITAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: ANALÍTICA Y UPGRADE (solo jefe) */}
        <div className="space-y-6">
          {!isStaff && isSolo && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[40px] p-8 text-black relative overflow-hidden shadow-2xl">
              <Crown className="absolute -right-4 -top-4 w-32 h-32 opacity-20 rotate-12" />
              <h3 className="text-xl font-black mb-2 uppercase italic leading-tight">Plan Solo Activo</h3>
              <p className="text-black/70 text-xs font-bold leading-relaxed mb-8">
                Actualmente gestionas tu clínica de forma individual. Actualiza para añadir hasta 5 especialistas y desbloquear el cálculo de comisiones automático de Ana.
              </p>
              <button
                onClick={onUpgrade}
                className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                DESBLOQUEAR EQUIPO <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-500" /> Seguridad de Datos
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Cada miembro del equipo recibirá sus propias credenciales. Ana registra cada acceso a las fichas clínicas para garantizar el cumplimiento de la ley de protección de datos.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
