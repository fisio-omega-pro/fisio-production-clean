'use client';

import React from 'react';
import { Plus, Home, Navigation, Building2, ShieldCheck, Zap, Layers, Crown } from 'lucide-react';
import { getSubscriptionStatus } from '@/lib/subscriptionStatus';

interface SedesViewProps {
  clinicData: any;
  onAddSede: () => void;
  isUpgradeRequired?: boolean;
  onUpgrade?: () => void;
  upgradeLoading?: boolean;
}

export const SedesView: React.FC<SedesViewProps> = ({
  clinicData,
  onAddSede,
  isUpgradeRequired,
  onUpgrade,
  upgradeLoading
}) => {
  // Aplicar la Solución Maestra
  const subscriptionStatus = getSubscriptionStatus(clinicData);
  
  const sedes = clinicData?.direcciones || [];
  const clinicName = clinicData?.nombre_clinica || 'tu centro';

  // Si no tiene permisos de plan, mostrar upgrade tradicional
  if (!subscriptionStatus.canAccessMultiSede) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 max-w-md">
        <Building2 size={32} className="text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Mis Clínicas</h2>
        <p className="text-gray-400 text-sm mb-6">Para añadir y gestionar varias clínicas desde un solo panel necesitas el plan Multi-Sede (300€/mes). Al subir de plan, solo pagas la parte proporcional hasta tu próxima factura.</p>
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

  // Si necesita pagar, mostrar solo el botón de pago (sin acceso a multi-clínicas)
  if (subscriptionStatus.needsToPay) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 max-w-md">
        <Building2 size={32} className="text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Mis Clínicas</h2>
        <p className="text-gray-400 text-sm mb-6">Para añadir y gestionar varias clínicas desde un solo panel necesitas activar tu suscripción al plan Multi-Sede (300€/mes).</p>
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

  // Si todo está pagado y funcional, mostrar vista completa de multi-clínicas
  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SECCIÓN 1: CABECERA ESTRATÉGICA (CORREGIDA) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/5 pb-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-blue-500 mb-4">
            <Building2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Crecimiento e Infraestructura</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-4 uppercase italic">
            Red Operativa
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Gestiona de forma centralizada todos los puntos de atención de <span className="text-white font-bold">{clinicName}</span>.
            Ana utiliza estos datos para geolocalizar la demanda y optimizar la agenda de tus especialistas según su disponibilidad física.
          </p>
        </div>
        <button
          onClick={isUpgradeRequired ? onUpgrade : onAddSede}
          disabled={upgradeLoading}
          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs transition-all duration-300 shadow-2xl shadow-white/5 ${isUpgradeRequired ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}
        >
          {isUpgradeRequired ? <Zap size={18} /> : <Plus size={18} className="group-hover:rotate-90 transition-transform" />}
          {isUpgradeRequired ? (upgradeLoading ? 'PROCESANDO...' : 'SUBIR A PLAN MULTI-SEDE') : 'REGISTRAR NUEVA SEDE'}
        </button>
      </div>

      {isUpgradeRequired && (
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Crown size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic">Potencia tu red de clínicas</h3>
              <p className="text-gray-400 text-xs">Para añadir más sedes y gestionarlas desde este panel necesitas el plan Multi-Sede (300€/mes).</p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            disabled={upgradeLoading}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap"
          >
            {upgradeLoading ? 'Cargando pasarela...' : 'MEJORAR AHORA ➜'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* COLUMNA IZQUIERDA: LISTADO DE SEDES (LÓGICA ACTUALIZADA) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sedes.map((s: any, i: number) => (
              <div key={i} className="group relative bg-white/[0.02] border border-white/5 rounded-[32px] p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${s.principal ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-gray-400'}`}>
                    {s.principal ? <Home size={24} /> : <Building2 size={24} />}
                  </div>
                  {s.principal && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-[9px] font-black rounded-full border border-green-500/20 uppercase tracking-tighter">
                      <ShieldCheck size={10} /> Centro de Control
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors">
                    {s.nombre || 'Sede Principal'}
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300 font-medium">{s.calle}, {s.numero}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                      {s.cp} • {s.ciudad} <span className="text-gray-700">|</span> {s.provincia}
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center">
                  <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Gestionar Datos</button>
                  <div className="flex items-center gap-2 text-blue-500 text-[10px] font-bold">
                    <Navigation size={12} /> Ubicar
                  </div>
                </div>
              </div>
            ))}

            {/* TARJETA DE "INVITACIÓN" EN LUGAR DE EMPTY STATE */}
            <div
              onClick={isUpgradeRequired ? onUpgrade : onAddSede}
              className="group border-2 border-dashed border-white/5 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-500/30 hover:bg-blue-500/[0.01] cursor-pointer transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600 group-hover:scale-110 group-hover:text-blue-500 transition-all">
                {isUpgradeRequired ? <Crown size={24} /> : <Plus size={24} />}
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-600 group-hover:text-gray-400 uppercase tracking-widest">{isUpgradeRequired ? '¿Necesitas más sedes?' : '¿Tienes más centros?'}</p>
                <p className="text-[9px] text-gray-700 mt-1">{isUpgradeRequired ? 'Mejora tu plan para expandir tu red' : 'Regístralos para una gestión unificada'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SOPORTE Y LOGÍSTICA (TONO AMIGABLE) */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-600/10">
            <Zap className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
            <h3 className="text-lg font-black mb-4 uppercase italic leading-tight">Logística Inteligente</h3>
            <p className="text-blue-100 text-xs leading-relaxed mb-6">
              Al tener tus sedes configuradas, Ana puede derivar a los pacientes al centro más cercano y coordinar los turnos del equipo sin solapamientos físicos.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                <CheckCircleIcon /> DISPONIBILIDAD GEOLOCALIZADA
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                <CheckCircleIcon /> COORDINACIÓN MULTICENTRO
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Layers size={16} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Expedientes y facturas por sede</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Cada sede puede tener sus expedientes y facturas asociados. Así generas reportes y documentación por centro (útil para seguros, inspecciones o gestión interna) sin mezclar datos entre clínicas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-blue-600">
    <ShieldCheck size={10} />
  </div>
);
