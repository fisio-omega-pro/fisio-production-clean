'use client'
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Bell, ShieldCheck, FileText, Send, Scale as ScaleIcon,
  Users, Target, Upload, Trash2, Search, ChevronLeft, ChevronRight, Activity, TrendingUp,
  Mail, Inbox, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react';
import { ActionButton, InputField } from '../dashboard/components/Atoms';

const API_BASE_URL = 'https://fisio-backend-omega-740657183492.europe-west1.run.app';

export default function FoundryPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pass, setPass] = useState("");
  const [anaDiag, setAnaDiag] = useState<any | null>(null);
  const [view, setView] = useState('llc'); // Dejar en LLC para la prueba
  const [data, setData] = useState({ 
    stats: { 
      mrr: '0€', totalClinicas: 0, beneficioNeto: '0.00€', totalExpenses: '0.00€',
      leadsCount: 0, enProceso: 0, interesados: 0, pendingSuggestions: 0
    }, 
    clinicas: [], 
    alerts: [],
    historial: [],
    sugerencias: []
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [leadType, setLeadType] = useState('estandar');
  const [csvStatus, setCsvStatus] = useState("");
  const itemsPerPage = 10;
  const invoiceRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  // 🚨 ESTADOS DEL CHAT LEGAL RESTAURADOS
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<{role:string, text:string}[]>([
    { role: 'ana', text: 'Bienvenido a la Sala de Juntas. Soy tu Directora Legal y CFO. ¿Hablamos de impuestos USA, estrategia fiscal o seguridad legal?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: "", date: "" });
  const [anaInbox, setAnaInbox] = useState<any[]>([]);
  const [prospectEmail, setProspectEmail] = useState({ to: "", nombre: "", clinica: "" });
  const [emailStatus, setEmailStatus] = useState("");


  const getFoundryKey = (override?: string) => {
    if (override) return override;
    if (pass) return pass;
    return localStorage.getItem('foundryKey') || '';
  };

  const handleLogin = async () => {
    const key = pass.trim();
    if (!key) return alert("Introduce la clave de Foundry");
    try {
      const res = await fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/admin/stats-globales', {
        headers: { 'x-foundry-key': key }
      });
      if (!res.ok) return alert("ACCESO DENEGADO");
      localStorage.setItem('foundryKey', key);
      setIsAuthorized(true);
      loadData(key);
    } catch (e) { alert("Error de conexión"); }
  };
  const loadData = async (keyOverride?: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats-globales`, {
        headers: { 'x-foundry-key': getFoundryKey(keyOverride) }
      });
      if (res.status === 401) { setIsAuthorized(false); return; }
      if (res.ok) setData(await res.json());
    } catch (e) { console.error("Error sync"); }
  };

  const loadAnaInbox = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ana-inbox`, {
        headers: { 'x-foundry-key': getFoundryKey() }
      });
      if (res.ok) {
        const json = await res.json();
        setAnaInbox(json.emails || []);
      }
    } catch (e) { console.error("Error cargando inbox"); }
  };

  const sendProspectEmail = async () => {
    if (!prospectEmail.to) return alert("Introduce un email de destino");
    setEmailStatus("Enviando...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/send-prospect-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-foundry-key': getFoundryKey()
        },
        body: JSON.stringify({
          to: prospectEmail.to,
          leadInfo: {
            nombre: prospectEmail.nombre,
            clinica: prospectEmail.clinica,
            contexto: 'Prospección desde Foundry'
          }
        })
      });
      const json = await res.json();
      if (res.ok) {
        setEmailStatus("✅ Email enviado correctamente");
        setProspectEmail({ to: "", nombre: "", clinica: "" });
        setTimeout(() => setEmailStatus(""), 3000);
      } else {
        setEmailStatus("❌ Error al enviar");
      }
    } catch (e) { setEmailStatus("❌ Error de conexión"); }
  };

  const triggerEmailCheck = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/trigger-email-check`, {
        method: 'POST',
        headers: { 'x-foundry-key': getFoundryKey() }
      });
      if (res.ok) {
        alert("✅ Revisión de emails iniciada");
        setTimeout(() => loadAnaInbox(), 2000);
      }
    } catch (e) { alert("Error al revisar emails"); }
  };
  
  // 🚨 HANDLER DE CHAT LEGAL RESTAURADO
  const sendLegalQuery = async () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg; setChatMsg("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/chat-legal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-foundry-key': getFoundryKey()
        },
        body: JSON.stringify({ message: msg })
      });
      const json = await res.json();
      setChatHistory(prev => [...prev, { role: 'ana', text: json.reply }]);
    } catch (e) { setChatHistory(prev => [...prev, { role: 'ana', text: "Error de conexión con la base legal." }]); }
    setChatLoading(false);
  };

  const runAnaDiagnose = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ana-diagnose`, {
        headers: { 'x-foundry-key': getFoundryKey() }
      });
      const json = await res.json();
      setAnaDiag(json);
    } catch (e) { setAnaDiag({ ok: false, error: 'No se pudo conectar' }); }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.date) return alert("Completa todos los campos");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/save-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-foundry-key': getFoundryKey() },
        body: JSON.stringify(newAlert)
      });
      if (res.ok) { setNewAlert({ title: "", date: "" }); loadData(); }
    } catch (e) { alert("Error al crear alerta"); }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete-alert/${id}`, {
        method: 'DELETE',
        headers: { 'x-foundry-key': getFoundryKey() }
      });
      if (res.ok) loadData();
    } catch (e) { alert("Error al borrar"); }
  };

  const handleInvoiceUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('invoice', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/scan-invoice`, {
        method: 'POST',
        headers: { 'x-foundry-key': getFoundryKey() },
        body: formData
      });
      if (res.ok) { alert("Factura escaneada"); loadData(); }
    } catch (e) { alert("Error al escanear"); }
  };

  const handleCSVUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvStatus("Importando...");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadType', leadType);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/import-leads`, {
        method: 'POST',
        headers: { 'x-foundry-key': getFoundryKey() },
        body: formData
      });
      const json = await res.json();
      setCsvStatus(json.success ? `✅ ${json.imported || 0} leads importados` : "Error en importación");
      if (res.ok) loadData();
    } catch (e) { setCsvStatus("Error de conexión"); }
  };

  // Lógica de paginación y búsqueda para MODO DIOS
  const filteredClinics = useMemo(() => {
    if (!data.clinicas) return [];
    return data.clinicas.filter((c: any) => 
      (c.nombre_clinica && c.nombre_clinica.toLowerCase().includes(search.toLowerCase())) || 
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data.clinicas, search]);

  const paginatedClinics = useMemo(() => 
    filteredClinics.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredClinics, page]
  );

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage) || 1;

  if (!isAuthorized) { 
    return (
      <div className="h-screen bg-[#030507] flex flex-col items-center justify-center gap-8 font-sans text-white">
        <Zap size={60} color="#d4af37" className="animate-pulse" />
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1 className="text-center font-black text-xl tracking-widest text-[#d4af37]">THE FOUNDRY ACCESS</h1>
          <InputField type="password" placeholder="CLAVE MAESTRA" value={pass} onChange={(v) => setPass(v)} />
          <ActionButton onClick={handleLogin} fullWidth style={{ background: '#d4af37', color: '#000' }}>ENTRAR</ActionButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-white p-10 font-sans">
      <nav className="fixed top-0 left-0 w-full p-6 border-b border-white/5 bg-[#05070a]/90 backdrop-blur-md z-50 flex justify-between items-center px-12">
        <div className="flex items-center gap-3">
          <Zap color="#d4af37"/>
          <span className="font-black text-xl tracking-tighter">THE FOUNDRY</span>
          <span className="text-[10px] text-gray-500">Clínicas: {data.stats.totalClinicas}</span>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
           <button onClick={()=>setView('caza')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='caza'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO CAZA</button>
           <button onClick={()=>setView('email')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='email'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO EMAIL</button>
           <button onClick={()=>setView('llc')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='llc'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO LLC</button>
           <button onClick={()=>setView('dios')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='dios'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO DIOS</button>
        </div>
      </nav>

      <main className="mt-28 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* --- MODO CAZA --- */}
          {view === 'caza' && (
            <motion.div key="caza" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <StatBox label="LEADS TOTALES" value={data.stats.leadsCount} icon={<Target size={40} color="#d4af37"/>} />
                <StatBox label="EN PROCESO" value={data.stats.enProceso} icon={<Activity size={40} color="#d4af37"/>} />
                <StatBox label="INTERESADOS" value={data.stats.interesados} icon={<TrendingUp size={40} color="#d4af37"/>} />
              </div>

              <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <Upload size={24} color="#d4af37"/> Importar Leads CSV
                </h2>
                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => setLeadType('estandar')} 
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${leadType === 'estandar' ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-400'}`}
                  >
                    Estándar
                  </button>
                  <button 
                    onClick={() => setLeadType('premium')} 
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${leadType === 'premium' ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-400'}`}
                  >
                    Premium
                  </button>
                  <button 
                    onClick={() => setLeadType('corporativo')} 
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${leadType === 'corporativo' ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-400'}`}
                  >
                    Corporativo
                  </button>
                </div>
                <input type="file" ref={csvInputRef} onChange={handleCSVUpload} accept=".csv" className="hidden" />
                <ActionButton onClick={() => csvInputRef.current?.click()} fullWidth style={{background:'#d4af37', color:'#000'}}>
                  SELECCIONAR CSV
                </ActionButton>
                {csvStatus && <p className="mt-4 text-sm text-gray-400">{csvStatus}</p>}
              </div>
            </motion.div>
          )}

          {/* --- MODO EMAIL --- */}
          {view === 'email' && (
            <motion.div key="email" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Enviar Email de Prospección */}
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                  <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Send size={24} color="#d4af37"/> Enviar Email de Prospección
                  </h2>
                  <div className="space-y-4">
                    <InputField 
                      placeholder="Email de destino" 
                      value={prospectEmail.to} 
                      onChange={(v) => setProspectEmail({...prospectEmail, to: v})} 
                    />
                    <InputField 
                      placeholder="Nombre del contacto (opcional)" 
                      value={prospectEmail.nombre} 
                      onChange={(v) => setProspectEmail({...prospectEmail, nombre: v})} 
                    />
                    <InputField 
                      placeholder="Clínica (opcional)" 
                      value={prospectEmail.clinica} 
                      onChange={(v) => setProspectEmail({...prospectEmail, clinica: v})} 
                    />
                    <ActionButton onClick={sendProspectEmail} fullWidth style={{background:'#d4af37', color:'#000'}}>
                      ENVIAR PROSPECCIÓN CON ANA
                    </ActionButton>
                    {emailStatus && (
                      <p className="text-sm text-center mt-4 text-gray-400">{emailStatus}</p>
                    )}
                  </div>
                  <div className="mt-8 p-6 bg-black/30 rounded-2xl border border-white/5">
                    <p className="text-xs text-gray-500 mb-2">💡 Ana generará automáticamente un email profesional y persuasivo adaptado al contexto.</p>
                  </div>
                </div>

                {/* Columna Derecha: Inbox de Ana */}
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <Inbox size={24} color="#d4af37"/> Inbox de Ana
                    </h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={loadAnaInbox}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                        title="Cargar inbox"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={triggerEmailCheck}
                        className="p-2 rounded-lg bg-[#d4af37] text-black hover:opacity-80 transition-all"
                        title="Revisar ahora"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {anaInbox.length === 0 ? (
                      <div className="text-center py-12 text-gray-600">
                        <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm">No hay emails procesados</p>
                        <button 
                          onClick={loadAnaInbox}
                          className="mt-4 text-[#d4af37] text-xs hover:underline"
                        >
                          Cargar inbox
                        </button>
                      </div>
                    ) : (
                      anaInbox.map((email, idx) => (
                        <div key={idx} className="bg-black/30 p-4 rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">{email.subject}</p>
                              <p className="text-[10px] text-gray-500">{email.from}</p>
                            </div>
                            <div className="flex gap-2">
                              {email.respondido ? (
                                <CheckCircle size={14} className="text-green-400" title="Respondido" />
                              ) : (
                                <AlertCircle size={14} className="text-gray-500" title="Sin responder" />
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <span className={`text-[9px] px-2 py-1 rounded-full ${
                              email.clasificacion === 'URGENTE' ? 'bg-red-500/20 text-red-400' :
                              email.clasificacion === 'IMPORTANTE' ? 'bg-orange-500/20 text-orange-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {email.clasificacion}
                            </span>
                            <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                              {email.tipo}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-2">{email.resumen}</p>
                          <p className="text-[9px] text-gray-600 mt-2">{new Date(email.fecha).toLocaleString('es-ES')}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- MODO LLC (CON SALA DE JUNTAS RESTAURADA) --- */}
          {view === 'llc' && (
            <motion.div key="llc" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[70vh]">
               {/* Columna Izquierda: Escáner y Alertas */}
               <div className="flex flex-col gap-6 overflow-hidden">
                  <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 text-center">
                    <FileText size={48} className="mx-auto mb-6 text-[#d4af37] opacity-20" />
                    <h3 className="font-black text-xl mb-2">Escáner de Gastos LLC</h3>
                    <input type="file" ref={invoiceRef} onChange={handleInvoiceUpload} className="hidden" accept="image/*" />
                    <ActionButton onClick={()=>invoiceRef.current?.click()} fullWidth style={{background:'#d4af37', color:'#000'}}>SUBIR FACTURA</ActionButton>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 flex items-center gap-2"><Bell size={14}/> Radar de Obligaciones</h3>
                     <div className="flex gap-2 mb-6">
                        <InputField placeholder="Concepto" value={newAlert.title} onChange={(v)=>setNewAlert({...newAlert, title:v})} style={{marginBottom:0}} />
                        <InputField type="date" value={newAlert.date} onChange={(v)=>setNewAlert({...newAlert, date:v})} style={{marginBottom:0}} />
                        <button onClick={handleCreateAlert} className="bg-white text-black px-4 rounded-xl font-bold">+</button>
                     </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {data.alerts && data.alerts.length > 0 ? (
                        data.alerts.map((alert: any) => (
                          <div key={alert.id} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">{alert.title}</p>
                              <p className="text-[10px] text-gray-500">{alert.date}</p>
                            </div>
                            <button 
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-600 text-center py-4">Sin alertas pendientes</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 flex items-center gap-2"><ShieldCheck size={14}/> Diagnóstico IA</h3>
                    <ActionButton onClick={runAnaDiagnose} fullWidth style={{background:'#d4af37', color:'#000'}}>PROBAR GEMINI</ActionButton>
                    {anaDiag && (
                      <div className="mt-4 text-[11px] text-gray-400 whitespace-pre-wrap">
                        {anaDiag.ok ? `OK | Model: ${anaDiag.model} | Key length: ${anaDiag.keyLength}` : `ERROR | ${JSON.stringify(anaDiag.error || anaDiag)}`}
                      </div>
                    )}
                  </div>
               </div>

               {/* 🚨 COLUMNA DERECHA: SALA DE JUNTAS RESTAURADA */}
               <div className="bg-[#0a0a0c] border border-white/10 rounded-[32px] flex flex-col overflow-hidden shadow-2xl relative">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center"><ScaleIcon size={16} className="text-black"/></div>
                        <div><p className="text-xs font-black text-white">SALA DE JUNTAS</p><p className="text-[9px] text-[#d4af37]">Ana Legal & CFO</p></div>
                     </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                     {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'ana' ? 'justify-start' : 'justify-end'}`}>
                           <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'ana' ? 'bg-[#1a1d21] text-gray-300 border border-white/5' : 'bg-[#d4af37] text-black font-bold'}`}>
                              {msg.text}
                           </div>
                        </div>
                     ))}
                     {chatLoading && <div className="text-[10px] text-gray-500 animate-pulse ml-4">Ana consultando jurisprudencia...</div>}
                  </div>
                  <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                     <div className="flex gap-2">
                        <input 
                           className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                           placeholder="Pregunta sobre LLC, IVA, Modelos..."
                           value={chatMsg}
                           onChange={(e)=>setChatMsg(e.target.value)}
                           onKeyPress={(e)=>e.key==='Enter' && sendLegalQuery()}
                        />
                        <button onClick={sendLegalQuery} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"><Send size={16}/></button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* --- MODO DIOS --- */}
          {view === 'dios' && (
            <motion.div key="dios" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
                <StatBox label="MRR TOTAL" value={data.stats.mrr} icon={<TrendingUp size={40} color="#d4af37"/>} />
                <StatBox label="CLÍNICAS" value={data.stats.totalClinicas} icon={<Users size={40} color="#d4af37"/>} />
                <StatBox label="BENEFICIO NETO" value={data.stats.beneficioNeto} icon={<Activity size={40} color="#d4af37"/>} />
                <StatBox label="GASTOS" value={data.stats.totalExpenses} icon={<FileText size={40} color="#d4af37"/>} />
              </div>

              <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Users size={24} color="#d4af37"/> Clínicas Activas
                  </h2>
                  <div className="flex items-center gap-3">
                    <Search size={16} className="text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Buscar clínica..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500 text-xs uppercase">
                        <th className="text-left py-4 px-4">Clínica</th>
                        <th className="text-left py-4 px-4">Email</th>
                        <th className="text-left py-4 px-4">Plan</th>
                        <th className="text-left py-4 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClinics.map((clinic: any, idx: number) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 font-bold">{clinic.nombre_clinica || 'Sin nombre'}</td>
                          <td className="py-4 px-4 text-gray-400">{clinic.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${clinic.plan === 'pro' ? 'bg-[#d4af37] text-black' : 'bg-white/10 text-white'}`}>
                              {clinic.plan?.toUpperCase() || 'BASE'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${clinic.status === 'activo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {clinic.status || 'activo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-8">
                  <p className="text-xs text-gray-500">{filteredClinics.length} clínicas encontradas</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page === 1}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-4 py-2 text-xs font-bold">Página {page} de {totalPages}</span>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                      disabled={page === totalPages}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatBox({ label, value, icon }: any) {
  // ... StatBox Component ...
  return (
    <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 shadow-2xl">
      <div className="mb-6 opacity-30">{icon}</div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">{label}</p>
      <p className="text-4xl font-black mt-3 tracking-tighter italic">{value}</p>
    </div>
  );
}
