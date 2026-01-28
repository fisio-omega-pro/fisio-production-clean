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
              /* ========================================== */
              /* 📅 MÓDULO 1: AGENDA SOBERANA (CALIBRADA)   */
              /* ========================================== */
              {activeTab === 'agenda' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* CABECERA DEL CALENDARIO */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
                        {nombreMes} {añoActual}
                      </h2>
                      <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
                        Sincronización horaria: Madrid, España
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={paginationGroupStyle}>
                        <button onClick={() => cambiarMes(-1)} style={miniBtnStyle} aria-label="Mes anterior"><ArrowLeft size={16} /></button>
                        <button onClick={() => setViewDate(new Date())} style={miniBtnStyle}>Hoy</button>
                        <button onClick={() => cambiarMes(1)} style={miniBtnStyle} aria-label="Mes siguiente"><ArrowRight size={16} /></button>
                      </div>
                      <button 
                        onClick={() => setShowModal('bloqueo')} 
                        style={actionBtnStyle('#ef4444')}
                        onFocus={() => narratorActive && narrar("Botón: Bloquear agenda o vacaciones")}
                      >
                        <Ban size={18} /> Bloquear Agenda
                      </button>
                    </div>
                  </div>

                  {/* GRID DEL CALENDARIO (MICROCHIPS VISUALES) */}
                  <div style={calendarGridStyle}>
                    {/* Cabecera de días */}
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                      <div key={d} style={dayHeaderStyle}>{d}</div>
                    ))}
                    
                    {/* Huecos de compensación (Offset) */}
                    {Array.from({ length: offset }).map((_, i) => (
                      <div key={`empty-${i}`} style={emptySlotStyle} />
                    ))}

                    {/* Días reales del mes */}
                    {Array.from({ length: diasEnMes }).map((_, i) => {
                      const dia = i + 1;
                      const esHoy = dia === new Date().getDate() && 
                                    mesActual === new Date().getMonth() && 
                                    añoActual === new Date().getFullYear();
                      
                      return (
                        <div 
                          key={dia} 
                          style={daySlotStyle(esHoy)}
                          onClick={() => {
                            if(narratorActive) narrar(`Día ${dia} de ${nombreMes}`);
                            // Aquí lanzaremos la vista de citas del día en el futuro
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: esHoy ? 900 : 500, color: esHoy ? '#0066ff' : '#fff' }}>
                              {dia}
                            </span>
                            {esHoy && <Sparkles size={12} color="#0066ff" />}
                          </div>
                          
                          {/* Indicadores de carga de trabajo (Mockup hasta Fase 5) */}
                          <div style={{ marginTop: 'auto', display: 'flex', gap: '4px' }}>
                             <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              /* ========================================== */
              /* 👥 MÓDULO 2: CRM DE ÉLITE (CLIENTES)       */
              /* ========================================== */
              {activeTab === 'pacientes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* CABECERA CRM */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Gestión de Pacientes</h2>
                      <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '5px' }}>
                        Base de datos soberana. Sincronización automática con Ana.
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        onClick={() => alert("Función: Subir CSV de Pacientes")} 
                        style={actionBtnStyle('rgba(255,255,255,0.05)')}
                        onFocus={() => narratorActive && narrar("Botón: Importar base de datos")}
                      >
                        <Upload size={18} /> Importar CSV
                      </button>
                      <button 
                        onClick={() => setShowModal('voz')} 
                        style={actionBtnStyle('#0066ff')}
                        onFocus={() => narratorActive && narrar("Botón: Iniciar dictado clínico por voz")}
                      >
                        <Mic size={18} /> Dictar Nota
                      </button>
                    </div>
                  </div>

                  {/* TABLA DE PACIENTES (ESTILO LINEAR) */}
                  <div style={tableContainerStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={theadStyle}>
                        <tr>
                          <th style={thStyle}>PACIENTE</th>
                          <th style={thStyle}>TELÉFONO</th>
                          <th style={thStyle}>ESTADO</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pacientes.length > 0 ? pacientes.map((p: any) => (
                          <tr key={p.id} style={trStyle}>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={avatarCircle}>{p.nombre.charAt(0)}</div>
                                <span style={{ fontWeight: 700, color: '#fff' }}>{p.nombre}</span>
                              </div>
                            </td>
                            <td style={tdStyle}>{p.telefono}</td>
                            <td style={tdStyle}>
                              <span style={statusBadgeStyle(p.status || 'Activo')}>
                                {p.status || 'ACTIVO'}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <button 
                                onClick={() => narrar("Abriendo ficha de " + p.nombre)}
                                style={{ background: 'none', border: 'none', color: '#0066ff', cursor: 'pointer' }}
                              >
                                <ChevronRight size={20} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} style={{ padding: '100px', textAlign: 'center', opacity: 0.3 }}>
                              <Users size={48} style={{ marginBottom: '20px' }} />
                              <p style={{ fontWeight: 800, fontSize: '18px' }}>SIN PACIENTES REGISTRADOS</p>
                              <p style={{ fontSize: '14px' }}>Importa un CSV para que Ana los reconozca al instante.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              /* ========================================== */
              /* 📈 MÓDULO 3: BALANCE REAL (FINANZAS)       */
              /* ========================================== */
              {activeTab === 'finanzas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Rendimiento Económico</h2>
                    <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '5px' }}>Análisis de ingresos recuperados por Ana.</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <div style={statCardStyle('#10b981')}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={statIconBox('#10b981')}><PieChart size={20} /></div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>+12% vs mes ant.</span>
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 900 }}>{balance.real}€</div>
                      <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px', marginTop: '5px' }}>INGRESOS REALES (PAGADOS)</div>
                    </div>

                    <div style={statCardStyle('#f59e0b')}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={statIconBox('#f59e0b')}><TrendingUp size={20} /></div>
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 900 }}>{balance.potencial}€</div>
                      <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px', marginTop: '5px' }}>POTENCIAL (CITAS AMARILLAS)</div>
                    </div>

                    <div style={statCardStyle('#0066ff')}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={statIconBox('#0066ff')}><Sparkles size={20} /></div>
                      </div>
                      <div style={{ fontSize: '36px', fontWeight: 900 }}>{balance.roi}%</div>
                      <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px', marginTop: '5px' }}>RETORNO ROI FISIOTOOL</div>
                    </div>
                  </div>
                </div>
              )}

              /* ========================================== */
              /* 💼 MÓDULO 4: MI EQUIPO PRO (ESPECIALISTAS) */
              /* ========================================== */
              {activeTab === 'equipo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Especialistas</h2>
                      <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '5px' }}>Gestiona los terapeutas que Ana coordinará.</p>
                    </div>
                    <button 
                      onClick={() => setShowModal('equipo')} 
                      style={actionBtnStyle('#0066ff')}
                      onFocus={() => narratorActive && narrar("Botón: Añadir un nuevo profesional al equipo")}
                    >
                      <UserPlus size={18} /> Añadir Profesional
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {equipo.length > 0 ? equipo.map((esp: any) => (
                      <motion.div whileHover={{ y: -5 }} key={esp.id} style={espCardStyle}>
                        <div style={espAvatarStyle}>{esp.nombre.charAt(0)}</div>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '15px 0 5px 0' }}>{esp.nombre}</h4>
                        <p style={{ fontSize: '12px', color: '#0066ff', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>{esp.especialidad}</p>
                        <div style={espStatusBadge}>ACTIVO</div>
                      </motion.div>
                    )) : (
                      <div style={{ gridColumn: '1/-1', padding: '80px', textAlign: 'center', opacity: 0.2, border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '32px' }}>
                        <Briefcase size={48} style={{ marginBottom: '20px' }} />
                        <p style={{ fontWeight: 800, fontSize: '18px' }}>SIN EQUIPO REGISTRADO</p>
                        <p style={{ fontSize: '14px' }}>Añade compañeros para habilitar la gestión multi-agenda.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              