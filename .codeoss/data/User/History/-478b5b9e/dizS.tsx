'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, TrendingUp, MessageSquare, LogOut, 
  Sparkles, PlusCircle, CreditCard, Gift, Mic, 
  ChevronRight, Copy, X, Save, Smartphone, 
  Volume2, VolumeX, ShieldCheck, PieChart, Ban, Info, Landmark, 
  CheckCircle, Briefcase, UserPlus, Bell, ArrowRight, ArrowLeft
} from 'lucide-react';

// --- CONFIGURACIÓN DE CONEXIÓN AL MOTOR V14 (index.js) ---
const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

// --- INTERFACES PARA EL COMPILADOR (CALIBRACIÓN NASA) ---
interface Especialista { id: string; nombre: string; especialidad: string; activo: boolean; }
interface Paciente { id: string; nombre: string; telefono: string; email: string; ultima_visita?: any; }

export default function DashboardOmega() {
  // 1. ESTADOS DE NAVEGACIÓN
  const [activeTab, setActiveTab] = useState('agenda');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  // 2. ESTADOS DE DATOS (CONECTADOS AL MOTOR)
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [equipo, setEquipo] = useState<Especialista[]>([]);
  const [balance, setBalance] = useState({ real: 0, potencial: 0, roi: 0 });

  // 3. ESTADOS DE FUNCIONALIDAD SUPREME
  const [narratorActive, setNarratorActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [anaInput, setAnaInput] = useState("");
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy tu consultora estratégica. ¿Qué analizamos hoy?' }]);

  // --- 🔊 MOTOR DE NARRACIÓN (ACCESIBILIDAD) ---
  const narrar = (texto: string) => {
    if (narratorActive && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-ES';
      window.speechSynthesis.speak(msg);
    }
  };

  // --- 🛰️ CARGA DE DATOS (SINCRO CON EL SERVIDOR) ---
  const loadData = async (id: string) => {
    const token = localStorage.getItem('fisio_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resP, resB, resE] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/pacientes`, { headers }),
        fetch(`${API_BASE}/api/dashboard/balance`, { headers }),
        fetch(`${API_BASE}/api/dashboard/equipo?clinic_id=${id}`, { headers })
      ]);
      
      if (resP.ok) setPacientes(await resP.json());
      if (resB.ok) setBalance(await resB.json());
      if (resE.ok) setEquipo(await resE.json());
    } catch (e) { 
      console.error("❌ Fallo en la sintonía de datos."); 
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const tokenUrl = params.get('token');
    
    if (tokenUrl) localStorage.setItem('fisio_token', tokenUrl);
    if (id) {
      setClinicId(id);
      loadData(id);
    }
  }, []);

  // Aquí terminamos el Bloque 1 de infraestructura.
  // --- 4. DEFINICIÓN DE NAVEGACIÓN (JERARQUÍA SUPREME) ---
  const navItems: Record<string, NavItem[]> = {
    operaciones: [
      { id: 'agenda', label: 'Agenda Soberana', icon: Calendar },
      { id: 'pacientes', label: 'CRM de Élite', icon: Users },
      { id: 'finanzas', label: 'Balance Real', icon: PieChart },
    ],
    ia: [
      { id: 'asistente', label: 'Consultoría Ana 24/7', icon: MessageSquare, accent: true },
    ],
    negocio: [
      { id: 'sedes', label: 'Mis Clínicas', icon: Building2 },
      { id: 'cobros', label: 'Métodos de Pago', icon: CreditCard },
      { id: 'referidos', label: 'Plan de Referidos', icon: Gift },
      { id: 'ajustes', label: 'Adaptabilidad Invidentes', icon: Volume2 },
    ]
  };

  // --- 5. RENDERIZADO DEL SIDEBAR ---
  return (
    <div style={{ backgroundColor: '#030507', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* ⚡ SIDEBAR DE CRISTAL ESMERILADO */}
      <aside role="navigation" aria-label="Navegación principal" style={{ width: '300px', borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(40px)', padding: '40px 24px', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        
        {/* LOGO SOBERANO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', paddingLeft: '8px' }}>
          <div style={{ width: '40px', height: '40px', background: '#0066ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(0,102,255,0.4)' }}>
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-1px' }}>FISIOTOOL <span style={{color: '#0066ff'}}>PRO</span></span>
        </div>

        {/* MENÚ POR GRUPOS */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(navItems).map(([group, items]) => (
            <div key={group} role="group" aria-label={`Menú de ${group}`}>
              <p style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '12px' }}>{group}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)} 
                    style={navBtnStyle(activeTab === item.id, item.accent)}
                    onFocus={() => narratorActive && narrar(`Ir a ${item.label}`)}
                  >
                    <item.icon size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="navActiveGlow" 
                        style={{ position: 'absolute', left: 0, width: '4px', height: '18px', background: '#0066ff', borderRadius: '0 4px 4px 0' }} 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ACCIONES DE SALIDA */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => window.location.href='/login'} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontWeight: 700, fontSize: '13px', width: '100%', textAlign: 'left' }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTINUARÁ EN LA FASE 3 CON EL MAIN CONTENT... */}
      {/* 🖼️ ÁREA DE TRABAJO DINÁMICA */}
      <main role="main" style={{ flex: 1, padding: '60px', overflowY: 'auto', position: 'relative' }}>
        
        {/* LUZ DE FONDO (AURORA SOBERANA) */}
        <div style={{ position: 'absolute', top: '-100px', left: '100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,102,255,0.05) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

        {/* CABECERA TÉCNICA */}
        <header style={{ marginBottom: '48px', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-2px', margin: 0, textTransform: 'uppercase' }}>
              {activeTab.replace('-', ' ')}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
               <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 12px #10b981' }} />
               <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.4 }}>Motor V14 Conectado: {clinicId || 'Cargando...'}</span>
            </div>
          </div>

          {/* ACCESO RÁPIDO A AYUDA Y ALERTAS */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => { setNarratorActive(!narratorActive); narrar(narratorActive ? "Voz desactivada" : "Modo lectura activado"); }}
              style={iconBtnStyle(narratorActive)}
              aria-label="Alternar narrador de voz"
            >
              {narratorActive ? <Volume2 size={20} color="#0066ff" /> : <VolumeX size={20} opacity={0.3} />}
            </button>
            <div style={iconBtnStyle(false)}><Bell size={20} opacity={0.3} /></div>
          </div>
        </header>

        {/* CONTENEDOR DE CRISTAL LÍQUIDO (Donde se cargan los módulos) */}
        <section style={{ position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                minHeight: '65vh', 
                background: 'rgba(255,255,255,0.015)', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '40px', 
                padding: '48px', 
                backdropFilter: 'blur(24px)', 
                boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)'
              }}
            >
              {/* --- CONTINUARÁ EN LA FASE 4 CON LA LÓGICA DE CADA PESTAÑA --- */}