'use client';
import React, { useState } from 'react';
import { Ticket, Loader2, CheckCircle2, Zap, Star } from 'lucide-react';
import { CreateBonoModal } from '../components/CreateBonoModal';

interface BonosProps {
  clinicData: any;
  bonos: any[];
  pacientes: any[];
  onActivate: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onCreateBono: (bono: any) => Promise<void>;
}

export const BonosView: React.FC<BonosProps> = ({ 
  clinicData, 
  bonos, 
  pacientes, 
  onActivate, 
  onDeactivate, 
  onCreateBono 
}) => {
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const isActivated = clinicData?.config_ia?.acepta_bonos;

  const handleActivate = async () => {
    setIsActivating(true);
    await onActivate();
    setIsActivating(false);
  };

  const handleDeactivate = async () => {
    if (!onDeactivate) return;
    if (!confirm('¿Desactivar el módulo de bonos? Los bonos ya emitidos seguirán visibles pero no podrás emitir nuevos hasta volver a activarlo.')) return;
    setIsDeactivating(true);
    await onDeactivate();
    setIsDeactivating(false);
  };

  const handleCreateBono = async (bono: any) => {
    setIsCreating(true);
    try {
      await onCreateBono(bono);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isActivated) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/[0.02] border border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-8">
            <Ticket size={40} />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Gestión de Bonos</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm">Activa el monedero virtual para sesiones prepagadas.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FeatureBox icon={<Zap size={16}/>} text="Venta de 5/10 sesiones" />
            <FeatureBox icon={<CheckCircle2 size={16}/>} text="Saldo automático" />
            <FeatureBox icon={<Star size={16}/>} text="Fidelización Pro" />
          </div>

          <button 
            onClick={handleActivate}
            disabled={isActivating}
            className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
          >
            {isActivating ? <Loader2 className="animate-spin mx-auto" /> : "ACTIVAR MÓDULO DE BONOS ➜"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Monedero Virtual</h2>
          <p className="text-gray-500 text-sm">Control de bonos activos.</p>
        </div>
        <div className="flex items-center gap-4">
          {onDeactivate && (
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest disabled:opacity-50"
            >
              {isDeactivating ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : null}
              Desactivar módulo
            </button>
          )}
          <button 
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs transition-all shadow-2xl disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : null}
            EMITIR NUEVO BONO
          </button>
        </div>
      </div>

      {/* Lista de Bonos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bonos.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-600 italic">
            No hay bonos emitidos. {pacientes.length > 0 ? 'Crea tu primer bono para comenzar.' : 'Primero registra pacientes para poder crear bonos.'}
          </div>
        ) : (
          bonos.map((bono) => (
            <div key={bono.id} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-white uppercase">{bono.paciente_nombre}</h3>
                  {bono.paciente_email && (
                    <p className="text-sm text-gray-400">{bono.paciente_email}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  bono.status === 'ACTIVO' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : bono.status === 'PENDIENTE_DE_PAGO'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {bono.status === 'ACTIVO' ? 'Activo' : 
                   bono.status === 'PENDIENTE_DE_PAGO' ? 'Pendiente de pago' : 
                   bono.status}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Sesiones</span>
                  <span className="text-2xl font-black text-blue-500">
                    {bono.sesiones_restantes} / {bono.sesiones_totales}
                  </span>
                </div>
                
                {bono.precio && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Precio</span>
                    <span className="text-white font-medium">€{bono.precio}</span>
                  </div>
                )}
                
                {bono.fecha_vencimiento && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Vence</span>
                    <span className="text-white text-sm">
                      {new Date(bono.fecha_vencimiento).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {bono.pago_url && bono.status === 'PENDIENTE_DE_PAGO' && (
                  <div className="pt-3">
                    <a
                      href={bono.pago_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Ver Enlace de Pago
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Creación */}
      <CreateBonoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        pacientes={pacientes}
        onCreateBono={handleCreateBono}
        clinicData={clinicData}
      />
    </div>
  );
};

const FeatureBox = ({ icon, text }: any) => (
  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
    <div className="text-blue-500">{icon}</div>
    <span className="text-[10px] font-bold text-gray-300 uppercase">{text}</span>
  </div>
);
