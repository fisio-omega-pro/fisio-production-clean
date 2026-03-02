'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bot, CheckCircle2, Loader2, Palette, MessageSquare, Camera, Sparkles, Layout } from 'lucide-react';
import { dashboardAPI } from '../services';

interface AnaConfigProps {
    clinicData: any;
    onUpdated: () => void;
}

const PRESET_COLORS = [
    { name: 'WhatsApp', hex: '#075E54', desc: 'Confianza y cercanía' },
    { name: 'Médico', hex: '#2196F3', desc: 'Seriedad y salud' },
    { name: 'Premium', hex: '#000000', desc: 'Exclusividad y lujo' },
    { name: 'Zen', hex: '#4CAF50', desc: 'Bienestar y calma' },
    { name: 'Vital', hex: '#FF5722', desc: 'Energía y acción' },
    { name: 'Belleza', hex: '#9C27B0', desc: 'Elegancia y estética' },
];

export const AnaConfigView = ({ clinicData, onUpdated }: AnaConfigProps) => {
    const [config, setConfig] = useState({
        name: clinicData?.ana_name || 'Ana',
        color: clinicData?.ana_color || '#075E54',
        welcome: clinicData?.ana_welcome || '¡Hola! Estoy aquí para ayudarte con tus citas y dudas. ¿En qué puedo apoyarte hoy?',
        photo: clinicData?.ana_photo || '',
        useClinicLogo: clinicData?.ana_use_clinic_logo || false,
        prospectionEmail: clinicData?.email_contacto || ''
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (clinicData) {
            setConfig({
                name: clinicData.ana_name || 'Ana',
                color: clinicData.ana_color || '#075E54',
                welcome: clinicData.ana_welcome || '¡Hola! Estoy aquí para ayudarte con tus citas y dudas. ¿En qué puedo apoyarte hoy?',
                photo: clinicData.ana_photo || '',
                useClinicLogo: !!clinicData.ana_use_clinic_logo,
                prospectionEmail: clinicData.email_contacto || ''
            });
        }
    }, [clinicData]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await dashboardAPI.updateAsistenteConfig(config);
            await onUpdated();
            setSaved(true);
            setTimeout(() => setSaved(false), 6000); // 6 segundos para que el usuario vea bien el mensaje
        } catch (e: any) {
            setError(e.message || 'Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (file: File) => {
        setUploadingPhoto(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'ana_photo');
            
            const response = await fetch('/api/dashboard/upload-ana-photo', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            if (result.success) {
                setConfig({ ...config, photo: result.url, useClinicLogo: false });
            } else {
                throw new Error(result.error || 'Error al subir la foto');
            }
        } catch (e: any) {
            setError(e.message || 'Error al subir la foto');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handlePhotoUpload(file);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                        <Sparkles className="text-blue-500" size={32} />
                        Personalidad de Ana
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Configura la identidad visual y el tono de tu asistente inteligente.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black px-8 py-3 rounded-2xl text-xs tracking-widest uppercase transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                    {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Identidad */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Bot size={14} /> Identidad Básica
                        </h3>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block font-bold transition-colors group-focus-within:text-blue-400">Nombre Público</label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                                    placeholder="Ej: Ana, Coach, Recepción..."
                                />
                            </div>

                            <div className="group">
                                <label className="text-[10px] text-orange-500 uppercase tracking-widest mb-2 block font-bold transition-colors group-focus-within:text-orange-400">
                                    📧 Email para Prospección de Pacientes <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={config.prospectionEmail}
                                    onChange={(e) => setConfig({ ...config, prospectionEmail: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition-all"
                                    placeholder="ana@tuclinica.com"
                                    required
                                />
                                <p className="text-[10px] text-gray-400 mt-2">
                                    ⚠️ Email obligatorio para enviar comunicaciones de recuperación y seguimiento a pacientes. 
                                    Los pacientes recibirán los mensajes desde esta dirección.
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block font-bold">Respuesta de Bienvenida</label>
                                <textarea
                                    value={config.welcome}
                                    onChange={(e) => setConfig({ ...config, welcome: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all resize-none min-h-[120px]"
                                    placeholder="Escribe el primer mensaje que verán tus pacientes..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Estilo Visual */}
                    <section className="bg-white/[0.02] border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
                        <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Palette size={14} /> Estilo y Marca
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 block font-bold">Color Corporativo</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c.hex}
                                            onClick={() => setConfig({ ...config, color: c.hex })}
                                            className={`flex flex-col p-4 rounded-2xl border-2 transition-all ${config.color === c.hex ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="w-full h-8 rounded-lg mb-3" style={{ backgroundColor: c.hex }} />
                                            <span className="text-xs font-bold text-white mb-1">{c.name}</span>
                                            <span className="text-[9px] text-gray-500">{c.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Foto del Asistente */}
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 block font-bold">Foto del Asistente</label>
                                    
                                    <div className="space-y-4">
                                        {/* Opción 1: Foto Personalizada */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                                                    {config.photo ? (
                                                        <img src={config.photo} alt="Asistente" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Camera className="text-purple-400" size={24} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-white">Foto Personalizada</h4>
                                                    <p className="text-[10px] text-gray-400">Sube una imagen para tu asistente</p>
                                                </div>
                                                <input
                                                    ref={photoInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoSelect}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => photoInputRef.current?.click()}
                                                    disabled={uploadingPhoto}
                                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                                                >
                                                    {uploadingPhoto ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                                                    {uploadingPhoto ? 'SUBIENDO...' : 'SUBIR FOTO'}
                                                </button>
                                            </div>
                                            
                                            {config.photo && (
                                                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                                    <span className="text-xs text-purple-300">✅ Foto personalizada activa</span>
                                                    <button
                                                        onClick={() => setConfig({ ...config, photo: '', useClinicLogo: false })}
                                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Opción 2: Logo de la Clínica */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                                                        <Camera size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white">Usar Logo de la Clínica</h4>
                                                        <p className="text-[10px] text-gray-400">Usa tu logo actual como foto del asistente</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setConfig({ ...config, useClinicLogo: !config.useClinicLogo, photo: '' })}
                                                    className={`relative w-12 h-6 rounded-full transition-all ${config.useClinicLogo ? 'bg-blue-600' : 'bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.useClinicLogo ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            
                                            {config.useClinicLogo && (
                                                <div className="mt-4 flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                    <span className="text-xs text-blue-300">✅ Logo de clínica activo</span>
                                                    {clinicData?.logo_url && (
                                                        <img src={clinicData.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-xs flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">!</div>
                            {error}
                        </div>
                    )}

                    {saved && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 text-green-300 text-sm flex items-center gap-4 animate-in fade-in zoom-in duration-300 shadow-lg shadow-green-500/10">
                            <CheckCircle2 size={24} className="flex-shrink-0" />
                            <div>
                                <div className="font-bold text-green-200">✅ ¡CONFIGURACIÓN GUARDADA CORRECTAMENTE!</div>
                                <div className="text-green-300/80 text-xs mt-1">
                                    • Nombre: {config.name}<br/>
                                    • Email de prospección: {config.prospectionEmail}<br/>
                                    • Sistema de recuperación activo
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview (Sticky) */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-8">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Layout size={14} /> Vista Previa (Móvil)
                        </h3>

                        <div className="relative mx-auto w-full max-w-[320px] aspect-[9/16] bg-[#0c0c0e] rounded-[48px] border-[8px] border-[#1a1a1c] shadow-2xl overflow-hidden">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1c] rounded-b-2xl z-20" />

                            {/* Chat Interface */}
                            <div className="h-full flex flex-col bg-[#E5DDD5] overflow-hidden">
                                {/* Header */}
                                <div
                                    className="pt-10 pb-4 px-6 flex items-center gap-3 shadow-md z-10"
                                    style={{ backgroundColor: config.color }}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden">
                                        {config.useClinicLogo && clinicData?.logo_url ? (
                                            <img src={clinicData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : config.photo ? (
                                            <img src={config.photo} alt="Asistente" className="w-full h-full object-cover" />
                                        ) : (
                                            <Bot className="text-white" size={20} />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white leading-tight">{config.name}</span>
                                        <span className="text-[10px] text-white/70 italic uppercase tracking-tighter">Asistente Virtual</span>
                                    </div>
                                </div>

                                {/* Messages Body */}
                                <div className="flex-1 p-4 space-y-4">
                                    {/* System Date */}
                                    <div className="flex justify-center">
                                        <span className="bg-black/10 text-[9px] text-black/50 px-3 py-1 rounded-full uppercase font-bold tracking-widest italic">Hoy</span>
                                    </div>

                                    {/* Ana Message */}
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm p-3 max-w-[85%] border-b border-black/5 relative">
                                            <p className="text-[11px] text-gray-800 leading-relaxed font-medium">
                                                {config.welcome}
                                            </p>
                                            <div className="flex justify-end mt-1">
                                                <span className="text-[8px] text-gray-400">12:30</span>
                                            </div>
                                            {/* tail dummy */}
                                            <div className="absolute -left-1.5 top-0 w-2 h-2 bg-white skew-x-[-45deg]" />
                                        </div>
                                    </div>

                                    {/* Typing Indicator dummy */}
                                    <div className="flex items-center gap-1 ml-1">
                                        <div className="w-1 h-1 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1 h-1 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1 h-1 bg-black/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>

                                {/* Input Dummy */}
                                <div className="p-4 bg-white/10 backdrop-blur-md">
                                    <div className="bg-white rounded-full px-4 py-3 flex justify-between items-center shadow-inner">
                                        <span className="text-[10px] text-gray-400">Escribir respuesta...</span>
                                        <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-500 mt-6 italic">
                            * Así es como tus pacientes verán e interactuarán con Ana.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
