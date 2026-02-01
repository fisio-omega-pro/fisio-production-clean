'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, Target, Activity, Upload, Scale, Loader2, EyeOff, 
  Building2, Bell, ShieldCheck, Wallet, Trash2, Search, 
  ChevronLeft, ChevronRight, FileText, Euro, TrendingDown, Copy, Send, Scale as ScaleIcon 
} from 'lucide-react';
import { ActionButton, InputField } from '../dashboard/components/Atoms';

export default function FoundryPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pass, setPass] = useState("");
  const [view, setView] = useState('llc'); // Dejar en LLC para la prueba
  const [leadType, setLeadType] = useState('estandar');
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
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<string | null>(null);
  const [anaDiag, setAnaDiag] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const invoiceRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🚨 ESTADOS DEL CHAT LEGAL RESTAURADOS
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<{role:string, text:string}[]>([
    { role: 'ana', text: 'Bienvenido a la Sala de Juntas. Soy tu Directora Legal y CFO. ¿Hablamos de impuestos USA, estrategia fiscal o seguridad legal?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: "", date: "" });


  const handleLogin = async () => {
    const key = pass.trim();
    if (!key) return;
    const ok = await loadData(key);
    if (ok) setIsAuthorized(true);
    else alert("ACCESO DENEGADO");
  };
  const loadData = async (key?: string) => {
    try {
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const authKey = key || pass;
      const res = await fetch(`${apiBaseUrl}/api/admin/stats-globales`, {
        headers: { 'x-foundry-key': authKey }
      });
      if (res.ok) {
        setData(await res.json());
        return true;
      }
    } catch (e) { console.error("Error sync"); }
    return false;
  };
  
  // 🚨 HANDLER DE CHAT LEGAL RESTAURADO
  const sendLegalQuery = async () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg; setChatMsg("");
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);
    try {
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const res = await fetch(`${apiBaseUrl}/api/admin/chat-legal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-foundry-key': pass },
        body: JSON.stringify({ message: msg })
      });
      const json = await res.json();
      setChatHistory(prev => [...prev, { role: 'ana', text: json.reply }]);
    } catch (e) { setChatHistory(prev => [...prev, { role: 'ana', text: "Error de conexión con la base legal." }]); }
    setChatLoading(false);
  };

  const runAnaDiagnose = async () => {
    try {
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const res = await fetch(`${apiBaseUrl}/api/admin/ana-diagnose`, {
        headers: { 'x-foundry-key': pass }
      });
      const json = await res.json();
      setAnaDiag(json);
    } catch (e) {
      setAnaDiag({ ok: false, error: 'Error al diagnosticar' });
    }
  };

  const handleCreateAlert = async () => {
    try {
      if (!newAlert.title.trim() || !newAlert.date) return;
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const res = await fetch(`${apiBaseUrl}/api/admin/save-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-foundry-key': pass },
        body: JSON.stringify({ title: newAlert.title.trim(), target_date: newAlert.date, status: 'vigilando' })
      });
      if (res.ok) {
        setNewAlert({ title: "", date: "" });
        await loadData();
      }
    } catch (e) { console.error("Error alerta"); }
  };
  const handleDeleteAlert = async (id: string) => {
    try {
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const res = await fetch(`${apiBaseUrl}/api/admin/delete-alert/${id}`, {
        method: 'DELETE',
        headers: { 'x-foundry-key': pass }
      });
      if (res.ok) await loadData();
    } catch (e) { console.error("Error delete alerta"); }
  };
  const handleCSVUpload = async (e: any) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const form = new FormData();
      form.append('file', file);
      form.append('leadType', leadType);
      const res = await fetch(`${apiBaseUrl}/api/admin/import-leads`, {
        method: 'POST',
        headers: { 'x-foundry-key': pass },
        body: form
      });
      const json = await res.json();
      if (res.ok) {
        setImportResult(`Leads importados: ${json.imported || 0}`);
        await loadData();
      } else {
        setImportResult(json?.error || 'Error al importar');
      }
    } catch (e) {
      setImportResult('Error al importar');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const handleInvoiceUpload = async (e: any) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setInvoiceResult(null);
    try {
      if (!apiBaseUrl) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
      const form = new FormData();
      form.append('invoice', file);
      const res = await fetch(`${apiBaseUrl}/api/admin/scan-invoice`, {
        method: 'POST',
        headers: { 'x-foundry-key': pass },
        body: form
      });
      const json = await res.json();
      if (res.ok) {
        setInvoiceResult(`Detectado: ${json.importe || 0} ${json.moneda || ''}`);
        await loadData();
      } else {
        setInvoiceResult(json?.error || 'Error al escanear');
      }
    } catch (e) {
      setInvoiceResult('Error al escanear');
    } finally {
      if (invoiceRef.current) invoiceRef.current.value = '';
    }
  };

  // Lógica de Paginación y Búsqueda
  const filteredClinics = useMemo(() => {
    if (!data.clinicas) return [];
    return data.clinicas.filter((c: any) => 
      (c.nombre_clinica && c.nombre_clinica.toLowerCase().includes(search.toLowerCase())) || 
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [data.clinicas, search]);
  const paginatedClinics = useMemo(() => filteredClinics.slice((page - 1) * itemsPerPage, ((page - 1) * itemsPerPage) + itemsPerPage), [filteredClinics, page]);
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
        <div className="flex items-center gap-3"><Zap color="#d4af37"/><span className="font-black text-xl tracking-tighter">THE FOUNDRY</span></div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
           <button onClick={()=>setView('caza')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='caza'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO CAZA</button>
           <button onClick={()=>setView('llc')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='llc'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO LLC</button>
           <button onClick={()=>setView('dios')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='dios'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO DIOS</button>
        </div>
      </nav>

      <main className="mt-28 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* --- MODO CAZA --- */}
          {view === 'caza' && (
            <motion.div key="caza" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                  <h3 className="font-black text-xl mb-4 flex items-center gap-3"><Target size={18} /> Importar Leads</h3>
                  <p className="text-xs text-gray-500 mb-6">Sube un CSV simple con columnas como nombre, email, teléfono.</p>
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => setLeadType('estandar')} className={`px-3 py-2 rounded-lg text-[10px] font-black ${leadType === 'estandar' ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-400'}`}>ESTÁNDAR</button>
                    <button onClick={() => setLeadType('invidente')} className={`px-3 py-2 rounded-lg text-[10px] font-black ${leadType === 'invidente' ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-gray-400'}`}>INVIDENTE</button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" accept=".csv,text/csv" />
                  <ActionButton onClick={() => fileInputRef.current?.click()} fullWidth style={{background:'#d4af37', color:'#000'}}>
                    {importing ? 'IMPORTANDO...' : 'SUBIR CSV'}
                  </ActionButton>
                  {importResult && <div className="text-[11px] text-gray-400 mt-3">{importResult}</div>}
                </div>
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                  <h3 className="font-black text-xl mb-4 flex items-center gap-3"><Activity size={18} /> Estado de Leads</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatBox label="TOTAL" value={data.stats.leadsCount || 0} icon={<Users size={20}/>} />
                    <StatBox label="EN PROCESO" value={data.stats.enProceso || 0} icon={<TrendingDown size={20}/>} />
                    <StatBox label="INTERESADOS" value={data.stats.interesados || 0} icon={<Target size={20}/>} />
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
                    {invoiceResult && <div className="text-[11px] text-gray-400 mt-4">{invoiceResult}</div>}
                  </div>
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 flex items-center gap-2"><ShieldCheck size={14}/> Diagnóstico IA</h3>
                    <ActionButton onClick={runAnaDiagnose} fullWidth style={{background:'#d4af37', color:'#000'}}>PROBAR GEMINI</ActionButton>
                    {anaDiag && (
                      <div className="mt-4 text-[11px] text-gray-400 whitespace-pre-wrap">
                        {anaDiag.ok ? `OK | Model: ${anaDiag.model} | Key length: ${anaDiag.keyLength}` : `ERROR | ${JSON.stringify(anaDiag.error)}`}
                      </div>
                    )}
                  </div>
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 flex items-center gap-2"><Bell size={14}/> Radar de Obligaciones</h3>
                     <div className="flex gap-2 mb-6">
                        <InputField placeholder="Concepto" value={newAlert.title} onChange={(v)=>setNewAlert({...newAlert, title:v})} style={{marginBottom:0}} />
                        <InputField type="date" value={newAlert.date} onChange={(v)=>setNewAlert({...newAlert, date:v})} style={{marginBottom:0}} />
                        <button onClick={handleCreateAlert} className="bg-white text-black px-4 rounded-xl font-bold">+</button>
                     </div>
                    <div className="flex flex-col gap-3 max-h-40 overflow-y-auto">
                      {(data.alerts || []).map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl">
                          <div>
                            <div className="text-xs font-bold">{a.title}</div>
                            <div className="text-[10px] text-gray-500">{a.target_date}</div>
                          </div>
                          <button onClick={() => handleDeleteAlert(a.id)} className="text-red-400 text-xs font-bold">BORRAR</button>
                        </div>
                      ))}
                      {!data.alerts?.length && <div className="text-[10px] text-gray-500">Sin alertas activas.</div>}
                    </div>
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
               {/* ... Código Dios ... */}
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
