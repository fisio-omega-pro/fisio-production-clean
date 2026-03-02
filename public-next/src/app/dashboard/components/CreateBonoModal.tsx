'use client';
import React, { useState, useEffect } from 'react';
import { X, Search, User, Mail, Phone, Calendar, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CreateBonoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacientes: any[];
  onCreateBono: (bono: any) => Promise<void>;
  onCreatePaciente: (paciente: any) => Promise<{success: boolean, id?: string, error?: string}>;
  clinicData: any;
}

export const CreateBonoModal: React.FC<CreateBonoModalProps> = ({ 
  isOpen, 
  onClose, 
  pacientes, 
  onCreateBono,
  onCreatePaciente,
  clinicData 
}) => {
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);
  const [sesiones, setSesiones] = useState(5);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [generarPago, setGenerarPago] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showCreatePaciente, setShowCreatePaciente] = useState(false);
  const [newPaciente, setNewPaciente] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [isCreatingPaciente, setIsCreatingPaciente] = useState(false);

  // Filtrar pacientes
  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono?.includes(searchTerm)
  );

  // Calcular precio
  const precioBase = clinicData?.config_ia?.precio_bono_5 || 225;
  const precioTotal = (sesiones / 5) * precioBase;

  const handleCreatePaciente = async () => {
    if (!newPaciente.nombre || !newPaciente.email || !newPaciente.telefono) {
      setError('Todos los campos del paciente son requeridos');
      return;
    }

    setIsCreatingPaciente(true);
    setError('');

    try {
      const result = await onCreatePaciente({
        nombre: newPaciente.nombre,
        email: newPaciente.email,
        telefono: newPaciente.telefono
      });
      
      if (result.success) {
        // Crear objeto de paciente temporal
        const pacienteCreado = {
          id: result.id || Date.now().toString(),
          nombre: newPaciente.nombre,
          email: newPaciente.email,
          telefono: newPaciente.telefono
        };
        
        // Seleccionar el paciente creado
        setSelectedPaciente(pacienteCreado);
        
        // Resetear formulario
        setNewPaciente({ nombre: '', email: '', telefono: '' });
        setShowCreatePaciente(false);
        
        // Añadir a la lista de pacientes (temporal, hasta que se recargue)
        pacientes.push(pacienteCreado);
      } else {
        setError(result.error || 'Error al crear el paciente');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el paciente');
    } finally {
      setIsCreatingPaciente(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedPaciente) {
      setError('Debes seleccionar un paciente');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const bono = {
        paciente_id: selectedPaciente.id,
        sesiones_totales: sesiones,
        fecha_vencimiento: fechaVencimiento || null,
        generar_pago: generarPago
      };

      await onCreateBono(bono);
      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedPaciente(null);
        setSesiones(5);
        setFechaVencimiento('');
        setGenerarPago(true);
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Error al crear el bono');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Emitir Nuevo Bono</h2>
            <p className="text-gray-400">Crea un bono de sesiones prepagadas para un paciente</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">¡Bono Creado!</h3>
            <p className="text-gray-400">
              {generarPago ? 'Se ha generado el enlace de pago para el paciente.' : 'El bono ha sido activado inmediatamente.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Selección de Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                <User className="inline w-4 h-4 mr-2" />
                Seleccionar Paciente
              </label>
              
              {/* Buscador */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Lista de Pacientes */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {pacientesFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      {searchTerm ? 'No se encontraron pacientes con esa búsqueda' : 'No hay pacientes registrados'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreatePaciente(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      + Crear Nuevo Paciente
                    </button>
                  </div>
                ) : (
                  <>
                    {pacientesFiltrados.map((paciente) => (
                      <div
                        key={paciente.id}
                        onClick={() => setSelectedPaciente(paciente)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPaciente?.id === paciente.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{paciente.nombre}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {paciente.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {paciente.telefono}
                              </span>
                            </div>
                          </div>
                          {selectedPaciente?.id === paciente.id && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Opción para crear nuevo paciente */}
                    <div className="pt-2 border-t border-gray-700">
                      <button
                        type="button"
                        onClick={() => setShowCreatePaciente(true)}
                        className="w-full p-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        + Crear Nuevo Paciente
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Formulario para Crear Nuevo Paciente */}
            {showCreatePaciente && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Crear Nuevo Paciente</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={newPaciente.nombre}
                      onChange={(e) => setNewPaciente({...newPaciente, nombre: e.target.value})}
                      placeholder="Nombre del paciente"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newPaciente.email}
                      onChange={(e) => setNewPaciente({...newPaciente, email: e.target.value})}
                      placeholder="email@ejemplo.com"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={newPaciente.telefono}
                      onChange={(e) => setNewPaciente({...newPaciente, telefono: e.target.value})}
                      placeholder="600000000"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreatePaciente(false);
                      setNewPaciente({ nombre: '', email: '', telefono: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePaciente}
                    disabled={isCreatingPaciente || !newPaciente.nombre || !newPaciente.email || !newPaciente.telefono}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreatingPaciente ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Paciente'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Configuración del Bono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Número de Sesiones
                </label>
                <select
                  value={sesiones}
                  onChange={(e) => setSesiones(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 sesiones</option>
                  <option value={10}>10 sesiones</option>
                  <option value={15}>15 sesiones</option>
                  <option value={20}>20 sesiones</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Vencimiento (opcional)
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Opción de Pago */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generarPago}
                  onChange={(e) => setGenerarPago(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Generar enlace de pago
                  </div>
                  <div className="text-sm text-gray-400">
                    El paciente recibirá un enlace para pagar el bono. Se activará cuando se complete el pago.
                  </div>
                </div>
              </label>
            </div>

            {/* Resumen */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="font-medium text-white mb-4">Resumen del Bono</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Paciente:</span>
                  <span className="text-white">{selectedPaciente?.nombre || 'No seleccionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sesiones:</span>
                  <span className="text-white">{sesiones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio:</span>
                  <span className="text-white font-medium">€{precioTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado inicial:</span>
                  <span className="text-white">
                    {generarPago ? 'Pendiente de pago' : 'Activo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-400">{error}</span>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedPaciente || isCreating}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Bono'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
