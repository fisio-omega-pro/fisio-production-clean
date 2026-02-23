'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, Target, Activity, Upload, Bell, ShieldCheck, FileText, Send, 
  Scale as ScaleIcon, Trash2, Search, ChevronLeft, ChevronRight, TrendingUp,
  Building2, Wallet, Euro, TrendingDown, Eye, EyeOff, Mail, CheckCircle2,
  Clock, AlertCircle, XCircle, ArrowUpRight, BarChart3, Calendar, Filter, Copy,
  FileDown, FileImage, File, Phone
} from 'lucide-react';
import { ActionButton, InputField } from '../dashboard/components/Atoms';
import { API_BASE_URL } from '@/lib/apiBase';

export default function FoundryPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pass, setPass] = useState("");
  const [view, setView] = useState('caza');
  
  // Estados generales
  const [data, setData] = useState({ 
    stats: { 
      mrr: '0€', totalClinicas: 0, beneficioNeto: '0.00€', totalExpenses: '0.00€',
      leadsCount: 0, enProceso: 0, interesados: 0, convertidos: 0, pendingSuggestions: 0
    }, 
    clinicas: [], 
    leads: [],
    alerts: [],
    facturas: [],
    contratos: [],
    sugerencias: []
  });

  // MODO CAZA
  const [leadType, setLeadType] = useState<'videntes' | 'invidentes'>('videntes');
  const [csvStatus, setCsvStatus] = useState("");
  const [campaignActive, setCampaignActive] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadPreview, setLeadPreview] = useState<string>('');
  const csvVidentesRef = useRef<HTMLInputElement>(null);
  const csvInvidentesRef = useRef<HTMLInputElement>(null);

  // MODO LLC
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState<{role:string, text:string}[]>([
    { role: 'ana', text: 'Bienvenido a la Asesoría Jurídica y Fiscal. Soy Lex. Superviso tu estructura LLC y el cumplimiento del RGPD. ¿Qué te preocupa hoy?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: "", date: "", tipo: "fiscal" });
  const invoiceRef = useRef<HTMLInputElement>(null);
  const contratoRef = useRef<HTMLInputElement>(null);
  const [selectedContrato, setSelectedContrato] = useState<any>(null);
  const [contratoText, setContratoText] = useState<string>('');
  const [contratoLoading, setContratoLoading] = useState(false);

  // MODO DIOS
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const itemsPerPage = 10;

  // Utilidades
  const getFoundryKey = (override?: string) => {
    if (override) return override;
    if (pass) return pass;
    // Preferimos sessionStorage para reducir persistencia accidental.
    return sessionStorage.getItem('foundryKey') || localStorage.getItem('foundryKey') || '';
  };

  // --- AUTENTICACIÓN ---
  const handleLogin = async () => {
    const key = pass.trim();
    if (!key) return alert("Introduce la clave de Foundry");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats-globales`, {
        headers: { 'x-foundry-key': key }
      });
      if (!res.ok) return alert("ACCESO DENEGADO");
      try { sessionStorage.setItem('foundryKey', key); } catch {}
      // Compatibilidad: si ya existía guardado en localStorage de antes, lo dejamos.
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
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Sincronizar estado persistente de campaña (backend)
        if (typeof json?.stats?.campaignActive === 'boolean') {
          setCampaignActive(!!json.stats.campaignActive);
        }
      }
    } catch (e) { console.error("Error sync"); }
  };

  // --- MODO CAZA: IMPORTAR LEADS ---
  const handleCSVUpload = async (tipo: 'videntes' | 'invidentes', e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvStatus(`Importando ${tipo}...`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadType', tipo);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/import-leads`, {
        method: 'POST',
        headers: { 'x-foundry-key': getFoundryKey() },
        body: formData
      });
      const json = await res.json();
      setCsvStatus(json.success ? `✅ ${json.imported || 0} leads ${tipo} importados` : "Error en importación");
      if (res.ok) {
        loadData();
        setTimeout(() => setCsvStatus(""), 3000);
      }
    } catch (e) { setCsvStatus("Error de conexión"); }
  };

  const toggleCampaign = async () => {
    try {
      const next = !campaignActive;
      const res = await fetch(`${API_BASE_URL}/api/admin/campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-foundry-key': getFoundryKey()
        },
        body: JSON.stringify({ active: next })
      });
      if (res.status === 404) {
        // Backend no actualizado (revisión antigua en Cloud Run)
        alert('Backend CAZA no está desplegado todavía (endpoint /admin/campaign no existe). Redeploy Cloud Run.');
        return;
      }
      const json = await res.json();
      if (res.ok && typeof json?.active === 'boolean') {
        setCampaignActive(!!json.active);
        loadData();
      } else {
        alert(json?.error || 'No se pudo actualizar la campaña');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const updateLeadStatus = async (lead: any, estado: string) => {
    if (!lead?.id) return;
    setLeadBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/leads/${lead.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-foundry-key': getFoundryKey() },
        body: JSON.stringify({ estado, ultima_accion: `Estado → ${estado}` })
      });
      if (res.status === 404) {
        alert('Backend CAZA no está desplegado todavía (endpoint de estado de lead no existe). Redeploy Cloud Run.');
        return;
      }
      const json = await res.json();
      if (!res.ok) return alert(json?.error || 'No se pudo actualizar el lead');
      await loadData();
      setSelectedLead((prev: any) => prev ? { ...prev, estado: json.estado } : prev);
    } catch {
      alert('Error de conexión');
    } finally {
      setLeadBusy(false);
    }
  };

  const sendLeadEmail = async (lead: any) => {
    const to = String(lead?.email || '').trim();
    if (!to) return alert('Este lead no tiene email.');
    setLeadBusy(true);
    setLeadPreview('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/send-prospect-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-foundry-key': getFoundryKey() },
        body: JSON.stringify({ to, leadInfo: lead, leadId: lead.id })
      });
      if (res.status === 404) {
        alert('Backend email no está desplegado (endpoint /admin/send-prospect-email no existe). Redeploy Cloud Run.');
        return;
      }
      const json = await res.json();
      if (!res.ok) return alert(json?.error || 'No se pudo enviar el email');
      setLeadPreview(String(json.preview || '').trim());
      await loadData();
    } catch {
      alert('Error de conexión');
    } finally {
      setLeadBusy(false);
    }
  };

  // --- MODO LLC: GESTIÓN LEGAL ---
  const sendLegalQuery = async () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg; 
    setChatMsg("");
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
    } catch (e) { 
      setChatHistory(prev => [...prev, { role: 'ana', text: "Error de conexión con la base legal." }]); 
    }
    setChatLoading(false);
  };

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.date) return alert("Completa todos los campos");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/save-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-foundry-key': getFoundryKey() },
        body: JSON.stringify(newAlert)
      });
      if (res.ok) { 
        setNewAlert({ title: "", date: "", tipo: "fiscal" }); 
        loadData(); 
      }
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
      if (res.ok) { 
        alert("Factura escaneada y archivada"); 
        loadData(); 
      }
    } catch (e) { alert("Error al escanear"); }
  };

  const handleContratoUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('contrato', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/upload-contrato`, {
        method: 'POST',
        headers: { 'x-foundry-key': getFoundryKey() },
        body: formData
      });
      if (res.ok) { 
        alert("Contrato archivado"); 
        loadData(); 
      }
    } catch (e) { alert("Error al subir contrato"); }
  };

  const formatFecha = (f: any) => {
    try {
      if (!f) return '-';
      // Firestore Timestamp shape
      if (f._seconds) return new Date(f._seconds * 1000).toLocaleDateString('es-ES');
      // ISO string
      if (typeof f === 'string') return new Date(f).toLocaleDateString('es-ES');
      return String(f);
    } catch {
      return '-';
    }
  };

  const money = (importe: any, moneda?: any) => {
    try {
      const n = Number(importe);
      if (!Number.isFinite(n)) return '-';
      const cur = String(moneda || 'EUR').toUpperCase();
      return new Intl.NumberFormat('es-ES', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n);
    } catch {
      return `${importe ?? ''}${moneda ? ` ${moneda}` : ''}`.trim() || '-';
    }
  };

  const openFactura = async (f: any) => {
    try {
      if (!f?.id) return;
      const res = await fetch(`${API_BASE_URL}/api/admin/expense-file/${f.id}`, {
        headers: { 'x-foundry-key': getFoundryKey() }
      });
      if (!res.ok) {
        let msg = 'No se pudo abrir la factura';
        try { const j = await res.json(); msg = j?.error || msg; } catch {}
        alert(msg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const mime = String(f?.file_mime || blob.type || '').toLowerCase();
      const name = String(f?.file_name || `factura-${f.id}`).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 160) || `factura-${f.id}`;

      // Intentar abrir en pestaña nueva (PDF/imagenes). Si el navegador bloquea popups, descargar.
      let opened: Window | null = null;
      try {
        opened = window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        opened = null;
      }
      if (!opened) {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // Si abre, en algunos navegadores conviene sugerir nombre al descargar desde el visor
        // (no podemos forzar filename en inline con blob).
      }

      // best-effort: revocar más tarde
      setTimeout(() => URL.revokeObjectURL(url), 90_000);
    } catch {
      alert('Error de conexión');
    }
  };

  const facturaKind = (f: any) => {
    const mime = String(f?.file_mime || '').toLowerCase();
    if (mime.includes('pdf')) return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('text/')) return 'text';
    return mime ? 'file' : 'none';
  };

  const facturaActionLabel = (f: any) => {
    const k = facturaKind(f);
    return k === 'pdf' || k === 'image' ? 'VER' : 'DESCARGAR';
  };

  const FacturaIcon = ({ f }: { f: any }) => {
    const k = facturaKind(f);
    if (k === 'pdf') return <FileText size={14} className="text-[#d4af37]" />;
    if (k === 'image') return <FileImage size={14} className="text-blue-400" />;
    if (k === 'text') return <File size={14} className="text-gray-300" />;
    if (k === 'file') return <FileDown size={14} className="text-gray-300" />;
    return <FileDown size={14} className="text-gray-600" />;
  };

  const openContrato = async (contrato: any) => {
    setSelectedContrato(contrato);
    setContratoText('');
    setContratoLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/contratos/${contrato.id}`, {
        headers: { 'x-foundry-key': getFoundryKey() }
      });
      const json = await res.json();
      if (res.ok && json?.contrato?.text != null) setContratoText(String(json.contrato.text));
      else setContratoText('No se pudo cargar el contrato.');
    } catch {
      setContratoText('Error de conexión.');
    }
    setContratoLoading(false);
  };

  const downloadContrato = () => {
    if (!selectedContrato) return;
    const content = contratoText || '';
    const filename = `${selectedContrato.contractNumber || 'contrato'}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- MODO DIOS: PAGINACIÓN Y FILTROS ---
  const filteredClinics = useMemo(() => {
    if (!data.clinicas) return [];
    let filtered = data.clinicas;
    
    // Filtro de búsqueda
    if (search) {
      filtered = filtered.filter((c: any) => 
        (c.nombre_clinica && c.nombre_clinica.toLowerCase().includes(search.toLowerCase())) || 
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Filtro de mes
    if (filterMonth) {
      filtered = filtered.filter((c: any) => 
        c.fecha_registro && c.fecha_registro.includes(filterMonth)
      );
    }
    
    // Filtro de tipo
    if (filterTipo) {
      filtered = filtered.filter((c: any) => c.tipo === filterTipo);
    }
    
    return filtered;
  }, [data.clinicas, search, filterMonth, filterTipo]);

  const paginatedClinics = useMemo(() => 
    filteredClinics.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredClinics, page]
  );

  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage) || 1;

  // --- PANTALLA DE LOGIN ---
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
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full p-6 border-b border-white/5 bg-[#05070a]/90 backdrop-blur-md z-50 flex justify-between items-center px-12">
        <div className="flex items-center gap-3">
          <Zap color="#d4af37"/>
          <span className="font-black text-xl tracking-tighter">THE FOUNDRY</span>
          <span className="text-[10px] text-gray-500">Clínicas: {data.stats.totalClinicas}</span>
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
           <button onClick={()=>setView('caza')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='caza'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO CAZA</button>
           <button onClick={()=>setView('llc')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='llc'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO LLC</button>
           <button onClick={()=>setView('dios')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${view==='dios'?'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20':'text-gray-500 hover:text-white'}`}>MODO DIOS</button>
        </div>
      </nav>

      <main className="mt-28 max-w-7xl mx-auto px-10 pb-10">
        <AnimatePresence mode="wait">
          
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MODO CAZA - PROSPECCIÓN INTELIGENTE CON ANA                        */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {view === 'caza' && (
            <motion.div key="caza" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              
              {/* ESTADÍSTICAS DE PROSPECCIÓN */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                <StatBox label="LEADS TOTALES" value={data.stats.leadsCount} icon={<Target size={32} color="#d4af37"/>} />
                <StatBox label="EN PROCESO" value={data.stats.enProceso} icon={<Activity size={32} color="#38bdf8"/>} />
                <StatBox label="INTERESADOS" value={data.stats.interesados} icon={<TrendingUp size={32} color="#10b981"/>} />
                <StatBox label="CONVERTIDOS" value={data.stats.convertidos} icon={<CheckCircle2 size={32} color="#d4af37"/>} />
              </div>

              {/* IMPORTACIÓN DE LEADS: VIDENTES VS INVIDENTES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                
                {/* PANEL VIDENTES */}
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye size={24} color="#38bdf8"/>
                    <h2 className="text-2xl font-black">Leads Videntes</h2>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">Ana prospectará con landing estándar</p>
                  <input 
                    type="file" 
                    ref={csvVidentesRef} 
                    onChange={(e) => handleCSVUpload('videntes', e)} 
                    accept=".csv" 
                    className="hidden" 
                  />
                  <ActionButton 
                    onClick={() => csvVidentesRef.current?.click()} 
                    fullWidth 
                    style={{background:'#38bdf8', color:'#000'}}
                  >
                    <Upload size={16} className="mr-2"/> IMPORTAR CSV VIDENTES
                  </ActionButton>
                  {csvStatus.includes('videntes') && (
                    <p className="mt-4 text-sm text-center text-gray-400">{csvStatus}</p>
                  )}
                </div>

                {/* PANEL INVIDENTES */}
                <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <EyeOff size={24} color="#d4af37"/>
                    <h2 className="text-2xl font-black">Leads Invidentes</h2>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">Ana prospectará con /access (accesible)</p>
                  <input 
                    type="file" 
                    ref={csvInvidentesRef} 
                    onChange={(e) => handleCSVUpload('invidentes', e)} 
                    accept=".csv" 
                    className="hidden" 
                  />
                  <ActionButton 
                    onClick={() => csvInvidentesRef.current?.click()} 
                    fullWidth 
                    style={{background:'#d4af37', color:'#000'}}
                  >
                    <Upload size={16} className="mr-2"/> IMPORTAR CSV INVIDENTES
                  </ActionButton>
                  {csvStatus.includes('invidentes') && (
                    <p className="mt-4 text-sm text-center text-gray-400">{csvStatus}</p>
                  )}
                </div>
              </div>

              {/* CONTROL DE CAMPAÑA */}
              <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 mb-10 text-center">
                <h3 className="text-sm font-black text-gray-400 uppercase mb-6 flex items-center justify-center gap-2">
                  <Activity size={16}/> Estado de la Campaña de Prospección
                </h3>
                <div className={`text-xs font-bold mb-6 px-4 py-2 rounded-full inline-block ${campaignActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {campaignActive ? '🟢 CAMPAÑA ACTIVA - Ana prospectando por email' : '⚪ CAMPAÑA EN PAUSA'}
                </div>
                <ActionButton 
                  onClick={toggleCampaign} 
                  fullWidth 
                  style={{background: campaignActive ? '#ef4444' : '#10b981', color:'#fff'}}
                >
                  {campaignActive ? '⏸ PAUSAR CAMPAÑA' : '▶ INICIAR CAMPAÑA (EMAIL)'}
                </ActionButton>
              </div>

              {/* LISTA DE LEADS EN PROSPECCIÓN */}
              <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Target size={24} color="#d4af37"/> Leads en Prospección
                  </h2>
                  <div className="flex items-center gap-3">
                    <Search size={16} className="text-gray-500" />
                    <input 
                      type="text"
                      placeholder="Buscar lead..."
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
                        <th className="text-left py-4 px-4">Estado</th>
                        <th className="text-left py-4 px-4">Nombre</th>
                        <th className="text-left py-4 px-4">Contacto</th>
                        <th className="text-left py-4 px-4">Tipo</th>
                        <th className="text-left py-4 px-4">Canal</th>
                        <th className="text-left py-4 px-4">Última acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.leads && data.leads.length > 0 ? (
                        data.leads.map((lead: any, idx: number) => (
                          <tr key={lead?.id || idx} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                (lead.estado || lead.status) === 'convertido' ? 'bg-green-500/20 text-green-400' :
                                (lead.estado || lead.status) === 'interesado' ? 'bg-blue-500/20 text-blue-400' :
                                (lead.estado || lead.status) === 'en_proceso' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {lead.estado || lead.status || 'pendiente'}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold">{lead.nombre || 'Sin nombre'}</td>
                            <td className="py-4 px-4 text-gray-400">{lead.email || lead.telefono}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs ${(lead.tipo || lead.lead_type) === 'invidentes' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-blue-500/20 text-blue-400'}`}>
                                {(lead.tipo || lead.lead_type) === 'invidentes' ? <EyeOff size={12} className="inline mr-1"/> : <Eye size={12} className="inline mr-1"/>}
                                {lead.tipo || lead.lead_type || 'videntes'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Mail size={14} className="inline text-blue-400"/>
                              <span className="ml-2 text-xs">email</span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-500">{lead.ultima_accion || lead.last_action || 'Sin contacto'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-600">
                            <Target size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm">No hay leads cargados. Importa un CSV para empezar.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MODAL DE OPERACIÓN DEL LEAD (mínimo pero real) */}
              <AnimatePresence>
                {selectedLead && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={() => { setSelectedLead(null); setLeadPreview(''); }}
                  >
                    <motion.div
                      initial={{ scale: 0.98, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.98, y: 10 }}
                      className="w-full max-w-2xl bg-[#0b0d12] border border-white/10 rounded-3xl p-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <div className="text-xs text-gray-500 font-black uppercase tracking-widest">Lead</div>
                          <div className="text-2xl font-black mt-1">{selectedLead.nombre || 'Sin nombre'}</div>
                          <div className="text-sm text-gray-400 mt-2">
                            {selectedLead.email ? (
                              <span className="inline-flex items-center gap-2"><Mail size={14}/> {selectedLead.email}</span>
                            ) : (
                              <span className="inline-flex items-center gap-2"><Phone size={14}/> {selectedLead.telefono || 'Sin contacto'}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Estado actual: <span className="text-white font-bold">{selectedLead.estado || selectedLead.status || 'pendiente'}</span>
                          </div>
                        </div>
                        <button
                          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white"
                          onClick={() => { setSelectedLead(null); setLeadPreview(''); }}
                          aria-label="Cerrar"
                        >
                          <XCircle />
                        </button>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <ActionButton onClick={() => updateLeadStatus(selectedLead, 'pendiente')} fullWidth style={{ background: '#111827', color: '#fff' }}>
                          Pendiente
                        </ActionButton>
                        <ActionButton onClick={() => updateLeadStatus(selectedLead, 'en_proceso')} fullWidth style={{ background: '#f59e0b', color: '#000' }}>
                          En proceso
                        </ActionButton>
                        <ActionButton onClick={() => updateLeadStatus(selectedLead, 'interesado')} fullWidth style={{ background: '#3b82f6', color: '#fff' }}>
                          Interesado
                        </ActionButton>
                        <ActionButton onClick={() => updateLeadStatus(selectedLead, 'convertido')} fullWidth style={{ background: '#10b981', color: '#000' }}>
                          Convertido
                        </ActionButton>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <ActionButton
                          onClick={() => sendLeadEmail(selectedLead)}
                          fullWidth
                          style={{ background: '#d4af37', color: '#000' }}
                        >
                          <Send size={16} className="mr-2" /> Enviar email de prospección
                        </ActionButton>
                        <ActionButton
                          onClick={() => { navigator.clipboard?.writeText?.(String(selectedLead.email || selectedLead.telefono || '')); }}
                          fullWidth
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                        >
                          <Copy size={16} className="mr-2" /> Copiar contacto
                        </ActionButton>
                      </div>

                      {leadBusy && (
                        <div className="mt-4 text-xs text-gray-400">Procesando...</div>
                      )}

                      {leadPreview && (
                        <div className="mt-6">
                          <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Preview email (texto)</div>
                          <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 whitespace-pre-wrap max-h-64 overflow-auto">
                            {leadPreview}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* INBOX DE RESPUESTAS DE LEADS */}
              <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 mt-8">
                <h2 className="text-2xl font-black flex items-center gap-3 mb-6">
                  <Mail size={24} color="#d4af37"/> Inbox de Ana - Respuestas de Leads
                </h2>
                <p className="text-xs text-gray-500 mb-4">Ana lee automáticamente las respuestas por email y continúa las conversaciones</p>
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                  <p className="text-sm text-gray-400">📧 Ana revisa su inbox cada 5 minutos automáticamente</p>
                  <p className="text-xs text-gray-600 mt-2">Cuando un lead responde, Ana clasifica la respuesta y continúa la conversación por email.</p>
                </div>
              </div>

            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MODO LLC - LEGAL & FINANZAS                                        */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {view === 'llc' && (
            <motion.div key="llc" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMNA IZQUIERDA: GESTIÓN DOCUMENTAL Y ALERTAS */}
                <div className="space-y-8">
                  
                  {/* ESCÁNER DE GASTOS LLC */}
                  <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                    <FileText size={48} className="mx-auto mb-6 text-[#d4af37] opacity-20" />
                    <h3 className="font-black text-xl mb-2 text-center">Escáner de Gastos LLC</h3>
                    <p className="text-xs text-gray-500 text-center mb-6">Ana extrae datos y archiva automáticamente</p>
                    <input type="file" ref={invoiceRef} onChange={handleInvoiceUpload} className="hidden" accept="image/*,application/pdf" />
                    <ActionButton onClick={()=>invoiceRef.current?.click()} fullWidth style={{background:'#d4af37', color:'#000'}}>
                      SUBIR FACTURA
                    </ActionButton>
                    {data.facturas && data.facturas.length > 0 ? (
                      <div className="mt-6">
                        <div className="text-xs text-gray-500 text-center">
                          📄 {data.facturas.length} facturas/gastos (últimas)
                        </div>
                        <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
                          {data.facturas.slice(0, 10).map((f: any) => (
                            <div key={f.id} className="bg-black/30 p-3 rounded-xl border border-white/5">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-xs font-black text-white">
                                  <FacturaIcon f={f} />
                                  <span>{money(f.importe, f.moneda)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-[10px] text-gray-500">{formatFecha(f.fecha)}</div>
                                  {f.file_path ? (
                                    <button
                                      onClick={() => openFactura(f)}
                                      className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                                    >
                                      {facturaActionLabel(f)}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-2">
                                {f.file_path ? (
                                  <span className="font-semibold">{String(f.file_name || 'factura').slice(0, 80)}</span>
                                ) : (
                                  <span className="text-gray-600">Sin archivo (solo OCR)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-2 line-clamp-2">
                                {String(f.texto || '').slice(0, 160) || '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 text-[10px] text-gray-600 text-center">
                        Aún no hay facturas archivadas.
                      </div>
                    )}
                  </div>

                  {/* RADAR DE OBLIGACIONES */}
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 flex items-center gap-2">
                      <Bell size={14}/> Radar de Obligaciones
                    </h3>
                    <div className="flex gap-2 mb-6">
                      <InputField placeholder="Concepto" value={newAlert.title} onChange={(v)=>setNewAlert({...newAlert, title:v})} style={{marginBottom:0, fontSize:'12px'}} />
                      <InputField type="date" value={newAlert.date} onChange={(v)=>setNewAlert({...newAlert, date:v})} style={{marginBottom:0}} />
                      <button onClick={handleCreateAlert} className="bg-white text-black px-4 rounded-xl font-bold hover:bg-[#d4af37] transition-all">+</button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {data.alerts && data.alerts.length > 0 ? (
                        data.alerts.map((alert: any) => {
                          const daysLeft = Math.ceil((new Date(alert.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return (
                            <div key={alert.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                              daysLeft <= 3 ? 'bg-red-500/10 border-red-500/30' :
                              daysLeft <= 7 ? 'bg-yellow-500/10 border-yellow-500/30' :
                              'bg-black/30 border-white/5'
                            }`}>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-white">{alert.title}</p>
                                <p className="text-[10px] text-gray-500">Vence: {alert.date}</p>
                                <p className={`text-[10px] font-bold mt-1 ${
                                  daysLeft <= 3 ? 'text-red-400' :
                                  daysLeft <= 7 ? 'text-yellow-400' :
                                  'text-gray-400'
                                }`}>
                                  {daysLeft > 0 ? `⏰ ${daysLeft} días restantes` : '🚨 VENCIDA'}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-gray-600 text-center py-4">Sin alertas pendientes</p>
                      )}
                    </div>
                  </div>

                  {/* REPOSITORIO LEGAL */}
                  <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 flex items-center gap-2">
                      <ShieldCheck size={14}/> Repositorio Legal
                    </h3>
                    <input type="file" ref={contratoRef} onChange={handleContratoUpload} className="hidden" accept="application/pdf" />
                    <ActionButton onClick={()=>contratoRef.current?.click()} fullWidth style={{background:'#10b981', color:'#000', fontSize:'12px'}}>
                      ARCHIVAR CONTRATO
                    </ActionButton>
                    {data.contratos && data.contratos.length > 0 && (
                      <div className="mt-6 space-y-2">
                        {data.contratos.slice(0, 8).map((contrato: any, idx: number) => (
                          <div key={idx} className="bg-black/30 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">{contrato.contractNumber || 'Contrato'} · {contrato.nombre || 'Clínica'}</p>
                              <p className="text-[10px] text-gray-500">{contrato.email} · {formatFecha(contrato.fecha)}</p>
                            </div>
                            <button onClick={() => openContrato(contrato)} className="text-[10px] font-black px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                              VER
                            </button>
                          </div>
                        ))}
                        {data.contratos.length > 8 && (
                          <p className="text-[10px] text-gray-600 text-center pt-2">+ {data.contratos.length - 8} contratos más</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMNA DERECHA: LEX LEGAL (solo Foundry / dueño) */}
                <div className="bg-[#0a0a0c] border border-white/10 rounded-[32px] flex flex-col overflow-hidden shadow-2xl h-[800px]">
                  <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                        <ScaleIcon size={16} className="text-black"/>
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">LEX LEGAL</p>
                        <p className="text-[9px] text-[#d4af37]">Asesoría jurídica y fiscal (LLC, IVA, RGPD)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'ana' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.role === 'ana' ? 'bg-[#1a1d21] text-gray-300 border border-white/5' : 'bg-[#d4af37] text-black font-bold'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && <div className="text-[10px] text-gray-500 animate-pulse ml-4">Lex consultando jurisprudencia...</div>}
                  </div>
                  <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                        placeholder="Ej: ¿Tengo que cobrar IVA a un cliente de Alemania?"
                        value={chatMsg}
                        onChange={(e)=>setChatMsg(e.target.value)}
                        onKeyPress={(e)=>e.key==='Enter' && sendLegalQuery()}
                      />
                      <button onClick={sendLegalQuery} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors">
                        <Send size={16}/>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* MODO DIOS - CONTABILIDAD & CONTROL GLOBAL                          */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {view === 'dios' && (
            <motion.div key="dios" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              
              {/* ESTADÍSTICAS FINANCIERAS */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
                <StatBox label="MRR TOTAL" value={data.stats.mrr} icon={<TrendingUp size={40} color="#d4af37"/>} />
                <StatBox label="CLÍNICAS" value={data.stats.totalClinicas} icon={<Users size={40} color="#38bdf8"/>} />
                <StatBox label="BENEFICIO NETO" value={data.stats.beneficioNeto} icon={<Activity size={40} color="#10b981"/>} />
                <StatBox label="GASTOS" value={data.stats.totalExpenses} icon={<FileText size={40} color="#ef4444"/>} />
              </div>

              {/* FILTROS AVANZADOS */}
              <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 mb-8">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500"/>
                    <span className="text-xs font-bold text-gray-400">FILTROS:</span>
                  </div>
                  <input 
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#d4af37]"
                  />
                  <select 
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#d4af37]"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="solo">Solo</option>
                    <option value="multi">Multi</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="Buscar clínica..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#d4af37]"
                  />
                  {(search || filterMonth || filterTipo) && (
                    <button 
                      onClick={() => {setSearch(""); setFilterMonth(""); setFilterTipo(""); setPage(1);}}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* TABLA DE CLÍNICAS */}
              <div className="bg-white/5 p-10 rounded-[40px] border border-white/10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Users size={24} color="#d4af37"/> Clínicas Activas
                  </h2>
                  <p className="text-xs text-gray-500">{filteredClinics.length} clínicas encontradas</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-500 text-xs uppercase">
                        <th className="text-left py-4 px-4">Estado</th>
                        <th className="text-left py-4 px-4">Clínica</th>
                        <th className="text-left py-4 px-4">Email</th>
                        <th className="text-left py-4 px-4">Tipo</th>
                        <th className="text-left py-4 px-4">Plan</th>
                        <th className="text-left py-4 px-4">Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClinics.length > 0 ? (
                        paginatedClinics.map((clinic: any, idx: number) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <span className={`w-3 h-3 rounded-full inline-block ${
                                clinic.status === 'activo' ? 'bg-green-400' : 'bg-gray-500'
                              }`}></span>
                            </td>
                            <td className="py-4 px-4 font-bold">{clinic.nombre_clinica || 'Sin nombre'}</td>
                            <td className="py-4 px-4 text-gray-400">{clinic.email}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                clinic.tipo === 'multi' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {clinic.tipo === 'multi' ? 'MULTI-FISIO' : 'SOLO'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                clinic.plan === 'corporate' ? 'bg-[#d4af37] text-black'
                                : clinic.plan === 'team' ? 'bg-blue-600/20 text-blue-300'
                                : 'bg-white/10 text-white'
                              }`}>
                                {clinic.plan?.toUpperCase() || 'BASE'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-500">
                              {clinic.fecha_registro ? new Date(clinic.fecha_registro).toLocaleDateString('es-ES') : '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-gray-600">
                            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-sm">No hay clínicas con los filtros seleccionados</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINACIÓN */}
                <div className="flex justify-between items-center mt-8">
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

              {/* EVOLUCIÓN MRR (OPTIMIZACIÓN) */}
              <div className="bg-white/5 p-10 rounded-[32px] border border-white/10 mt-8">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                  <BarChart3 size={24} color="#d4af37"/> Evolución de Ingresos (MRR)
                </h3>
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-center">
                  <p className="text-sm text-gray-400">📊 Gráfica de evolución mensual</p>
                  <p className="text-xs text-gray-600 mt-2">Próximamente: Ana generará predicciones de MRR basadas en tendencias</p>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* MODAL CONTRATO */}
      {selectedContrato && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-3xl bg-[#0b0c15] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <div>
                <div className="text-sm font-black text-white">{selectedContrato.contractNumber || 'Contrato'}</div>
                <div className="text-[11px] text-gray-400">{selectedContrato.nombre} · {selectedContrato.email}</div>
              </div>
              <button onClick={() => { setSelectedContrato(null); setContratoText(''); }} className="text-gray-400 hover:text-white">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(contratoText || ''); }}
                  className="text-xs font-black px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
                  disabled={contratoLoading}
                >
                  <Copy size={14} /> COPIAR
                </button>
                <button
                  onClick={downloadContrato}
                  className="text-xs font-black px-4 py-2 rounded-xl bg-[#d4af37] text-black hover:bg-[#e6c45c] transition-all"
                  disabled={contratoLoading}
                >
                  DESCARGAR TXT
                </button>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 max-h-[55vh] overflow-y-auto">
                {contratoLoading ? (
                  <div className="text-xs text-gray-400 animate-pulse">Cargando contrato...</div>
                ) : (
                  <pre className="whitespace-pre-wrap text-[12px] text-gray-200 leading-relaxed">{contratoText || '—'}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE AUXILIAR: STATBOX ---
function StatBox({ label, value, icon }: any) {
  return (
    <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 shadow-2xl hover:border-[#d4af37]/30 transition-all">
      <div className="mb-6 opacity-30">{icon}</div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[3px]">{label}</p>
      <p className="text-4xl font-black mt-3 tracking-tighter italic">{value}</p>
    </div>
  );
}
