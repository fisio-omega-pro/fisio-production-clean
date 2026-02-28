'use client';
import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, FileText, Save, Loader2 } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: any) => Promise<void>;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    edad: '',
    dolencia: '',
    fechaInicio: '',
    notas: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^[6-9]\d{8}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (formData.edad && (parseInt(formData.edad) < 0 || parseInt(formData.edad) > 150)) {
      newErrors.edad = 'Edad inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        edad: formData.edad ? parseInt(formData.edad) : null,
        status: 'ACTIVO',
        created_at: new Date().toISOString()
      });
      
      // Reset form
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        edad: '',
        dolencia: '',
        fechaInicio: '',
        notas: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0c] border border-white/10 rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Crear Nuevo Paciente</h3>
              <p className="text-gray-400 text-sm">Completa los datos del paciente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Datos Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <User size={16} className="text-blue-500" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 transition-all ${
                  errors.nombre 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/10 focus:border-blue-500'
                }`}
                placeholder="Ej: María García López"
              />
              {errors.nombre && (
                <p className="text-red-500 text-xs font-black">{errors.nombre}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <Phone size={16} className="text-blue-500" />
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 transition-all ${
                  errors.telefono 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/10 focus:border-blue-500'
                }`}
                placeholder="Ej: 600123456"
              />
              {errors.telefono && (
                <p className="text-red-500 text-xs font-black">{errors.telefono}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <Mail size={16} className="text-blue-500" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 transition-all ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/10 focus:border-blue-500'
                }`}
                placeholder="Ej: maria@ejemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-black">{errors.email}</p>
              )}
            </div>

            {/* Edad */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <Calendar size={16} className="text-blue-500" />
                Edad
              </label>
              <input
                type="number"
                value={formData.edad}
                onChange={(e) => handleChange('edad', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 transition-all ${
                  errors.edad 
                    ? 'border-red-500 focus:border-red-400' 
                    : 'border-white/10 focus:border-blue-500'
                }`}
                placeholder="Ej: 35"
                min="0"
                max="150"
              />
              {errors.edad && (
                <p className="text-red-500 text-xs font-black">{errors.edad}</p>
              )}
            </div>
          </div>

          {/* Información Clínica */}
          <div className="space-y-6">
            {/* Dolencia */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <FileText size={16} className="text-blue-500" />
                Dolencia / Motivo de consulta
              </label>
              <textarea
                value={formData.dolencia}
                onChange={(e) => handleChange('dolencia', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                rows={3}
                placeholder="Ej: Dolor lumbar crónico, hernia discal L4-L5..."
              />
            </div>

            {/* Fecha de inicio */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <Calendar size={16} className="text-blue-500" />
                Fecha de inicio del tratamiento
              </label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 transition-all"
              />
            </div>

            {/* Notas adicionales */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-white text-sm font-black">
                <FileText size={16} className="text-blue-500" />
                Notas adicionales
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleChange('notas', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 transition-all resize-none"
                rows={3}
                placeholder="Observaciones importantes sobre el paciente..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  GUARDANDO...
                </>
              ) : (
                <>
                  <Save size={16} />
                  GUARDAR PACIENTE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
