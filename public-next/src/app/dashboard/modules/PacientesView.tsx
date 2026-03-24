'use client';
import React, { useState, useMemo } from 'react';
import { Search, Mic, Filter, UserPlus, Upload, Database, UserCheck, Activity, ChevronRight, Share2, Mail, Loader2, CheckCircle2, FileText, X } from 'lucide-react';
import { Paciente } from '../types';

export const PacientesView = ({ pacientes, onDictate, onImport, onNewPatient }: any) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [inviting, setInviting] = useState<string | null>(null); // 'all' or patientId
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  const handleInviteToApp = async (patientIds: string[] | 'all') => {
    setInviting(typeof patientIds === 'string' ? patientIds : 'all');
    setInviteStatus(null);
    try {
      // Validar que tengamos token de autenticación
      const token = localStorage.getItem('fisio_token');
      if (!token) {
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      // Validar que haya pacientes para invitar
      if (Array.isArray(patientIds) && patientIds.length === 0) {
        throw new Error('No hay pacientes seleccionados para invitar.');
      }

      const res = await fetch('/api/dashboard/send-pwa-invitation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientIds })
      });

      // Manejar diferentes tipos de respuestas de error
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setInviteStatus({
          type: 'success',
          message: `¡Invitación enviada! Se han enviado ${data.sent || 0} correos correctamente.`
        });
      } else {
        throw new Error(data.error || 'Error al enviar invitaciones');
      }
    } catch (err: any) {
      console.error('Error invitando pacientes:', err);
      setInviteStatus({ 
        type: 'error', 
        message: err.message || 'Error de conexión al enviar invitaciones. Inténtalo nuevamente.' 
      });
    } finally {
      setInviting(null);
      // Auto-limpiar el mensaje después de 8 segundos
      setTimeout(() => setInviteStatus(null), 8000);
    }
  };

  const filtered = useMemo(() => {
    try {
      // Validar que pacientes sea un array
      if (!Array.isArray(pacientes)) {
        console.warn('PacientesView: pacientes prop is not an array', pacientes);
        return [];
      }

      return pacientes.filter((p: Paciente) => {
        // Validar que el paciente tenga datos mínimos
        if (!p || typeof p !== 'object') return false;
        if (!p.nombre || typeof p.nombre !== 'string') return false;
        
        const match = p.nombre.toLowerCase().includes(search.toLowerCase()) || 
                     (p.telefono && typeof p.telefono === 'string' && p.telefono.includes(search));
        
        if (activeFilter === 'activos') {
          return match && p.status === 'ACTIVO';
        }
        return match;
      });
    } catch (error) {
      console.error('Error filtrando pacientes:', error);
      return [];
    }
  }, [pacientes, search, activeFilter]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto animate-in fade-in duration-700 h-full">

      {/* HEADER AMIGABLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-2 text-rose-500 mb-4">
            <Database size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Base de Conocimiento Clínico</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Expedientes</h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Gestiona la historia de tus pacientes. Ana organiza automáticamente los datos importados y procesa tus informes por voz.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {inviteStatus && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 duration-300 ${inviteStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {inviteStatus.type === 'success' ? <CheckCircle2 size={14} /> : <Activity size={14} />}
              {inviteStatus.message}
            </div>
          )}
          <button
            onClick={() => handleInviteToApp('all')}
            disabled={!!inviting}
            className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {inviting === 'all' ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Mail size={16} className="text-blue-500" />}
            INVITAR A TODOS A LA APP
          </button>
          <button
            onClick={onNewPatient}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
          >
            <UserPlus size={16} /> CREAR NUEVO PACIENTE
          </button>
          <button
            onClick={onImport}
            className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <Upload size={16} className="text-blue-500" /> IMPORTAR DATOS
          </button>
          <button
            onClick={onDictate}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-rose-900/20 transition-all"
          >
            <Mic size={16} /> GRABAR INFORME CLÍNICO
          </button>
        </div>
      </div>

      {/* BUSCADOR Y SEGMENTACIÓN */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/[0.02] p-4 rounded-[32px] border border-white/5">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o patología..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button onClick={() => setActiveFilter('todos')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeFilter === 'todos' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>TODOS</button>
          <button onClick={() => setActiveFilter('activos')} className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${activeFilter === 'activos' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>ACTIVOS</button>
        </div>
      </div>

      {/* LISTADO TIPO FICHA */}
      <div className="flex-1 bg-[#0a0a0c] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-8 border-b border-white/5 bg-white/[0.01] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
          <div className="col-span-6">Identidad y Diagnóstico</div>
          <div className="col-span-4">Contacto Directo</div>
          <div className="col-span-2 text-right">Estatus</div>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
              <UserPlus size={48} />
              <p className="font-black uppercase tracking-widest text-xs">No hay expedientes que coincidan</p>
            </div>
          ) : (
            filtered.map((p: any) => (
              <div key={p.id} className="grid grid-cols-12 gap-4 p-8 border-b border-white/5 hover:bg-white/[0.02] transition-all items-center group cursor-pointer"
                   onClick={() => {
                     try {
                       // Validar que el paciente tenga datos antes de abrir
                       if (!p || !p.id || !p.nombre) {
                         console.error('Paciente inválido:', p);
                         return;
                       }
                       setSelectedPatient(p);
                       setShowPatientDetails(true);
                     } catch (error) {
                       console.error('Error abriendo detalles del paciente:', error);
                     }
                   }}>
                <div className="col-span-6 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {p.nombre ? p.nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                      {p.nombre || 'Paciente sin nombre'}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                      <Activity size={12} className="text-rose-500" /> {p.dolencia || 'Valoración pendiente'}
                    </p>
                  </div>
                </div>
                <div className="col-span-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <UserCheck size={14} className="text-gray-600" /> {p.telefono || 'Sin teléfono'}
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono italic">{p.email || 'sin-email@clinica.com'}</p>
                </div>
                <div className="col-span-2 text-right flex justify-end items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!p || !p.id) {
                        console.error('Paciente inválido para invitación:', p);
                        return;
                      }
                      handleInviteToApp([p.id]);
                    }}
                    disabled={!!inviting}
                    title="Enviar invitación a la App"
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all disabled:opacity-50"
                  >
                    {inviting === p.id ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                  </button>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border ${
                    p.status === 'ACTIVO' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-gray-700/10 text-gray-400 border-gray-600/20'
                  }`}>
                    {p.status || 'ACTIVO'}
                  </span>
                  <ChevronRight size={18} className="text-gray-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE DETALLES DEL PACIENTE */}
      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => {
               try {
                 setShowPatientDetails(false);
                 setSelectedPatient(null);
               } catch (error) {
                 console.error('Error cerrando modal:', error);
                 setShowPatientDetails(false);
               }
             }}>
          <div className="bg-gradient-to-br from-[#0a0a0c] to-[#1a1a1c] rounded-[32px] border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-300"
               onClick={(e) => {
                 try {
                   e.stopPropagation();
                 } catch (error) {
                   console.error('Error en stopPropagation:', error);
                 }
               }}>
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border-2 border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-3xl">
                    {selectedPatient.nombre ? selectedPatient.nombre.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                      {selectedPatient.nombre || 'Paciente sin nombre'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">ID: {selectedPatient.id || 'No disponible'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    try {
                      setShowPatientDetails(false);
                      setSelectedPatient(null);
                    } catch (error) {
                      console.error('Error cerrando modal:', error);
                      setShowPatientDetails(false);
                    }
                  }}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Información Personal */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserCheck size={20} className="text-blue-500" />
                    Información Personal
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Nombre Completo</div>
                      <div className="text-white font-medium">
                        {selectedPatient.nombre || 'No especificado'}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Teléfono</div>
                      <div className="text-white font-medium">
                        {selectedPatient.telefono || 'No registrado'}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Email</div>
                      <div className="text-white font-medium">
                        {selectedPatient.email || 'No registrado'}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Estado</div>
                      <div className={`inline-block px-4 py-2 rounded-full text-[10px] font-black border ${
                        selectedPatient.status === 'ACTIVO' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-gray-700/10 text-gray-400 border-gray-600/20'
                      }`}>
                        {selectedPatient.status || 'ACTIVO'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Médica */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity size={20} className="text-rose-500" />
                    Información Médica
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Patología/Diagnóstico</div>
                      <div className="text-white font-medium">
                        {selectedPatient.dolencia || 'Valoración pendiente'}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Fecha de Registro</div>
                      <div className="text-white font-medium">
                        {selectedPatient.created_at ? 
                          (() => {
                            try {
                              return new Date(selectedPatient.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric'
                              });
                            } catch (error) {
                              console.error('Error formateando fecha:', error);
                              return 'Fecha inválida';
                            }
                          })() : 
                          'No disponible'
                        }
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Última Cita</div>
                      <div className="text-white font-medium">
                        {selectedPatient.ultima_cita || 'Sin registro'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas y Observaciones */}
              <div className="mt-8 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-green-500" />
                  Notas y Observaciones
                </h3>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Historial Clínico</div>
                  <div className="text-gray-300 text-sm leading-relaxed min-h-[100px]">
                    {selectedPatient.notas || 'Sin notas registradas. Puedes agregar notas clínicas usando el botón "GRABAR INFORME CLÍNICO" en el panel principal.'}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => {
                    try {
                      setShowPatientDetails(false);
                      setSelectedPatient(null);
                      // Llamar a onDictate de forma segura
                      if (typeof onDictate === 'function') {
                        onDictate();
                      } else {
                        console.warn('onDictate no es una función');
                      }
                    } catch (error) {
                      console.error('Error en acción de dictado:', error);
                      setShowPatientDetails(false);
                      setSelectedPatient(null);
                    }
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                >
                  <Mic size={16} />
                  GRABAR INFORME CLÍNICO
                </button>
                
                <button
                  onClick={() => {
                    try {
                      if (!selectedPatient || !selectedPatient.id) {
                        console.error('Paciente inválido para invitación:', selectedPatient);
                        return;
                      }
                      handleInviteToApp([selectedPatient.id]);
                    } catch (error) {
                      console.error('Error invitando paciente desde modal:', error);
                    }
                  }}
                  disabled={!!inviting}
                  className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
                >
                  {inviting === selectedPatient.id ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  INVITAR A LA APP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
