'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Users, MessageSquare, Mail, Target, 
  Upload, Play, Pause, BarChart3, Database, 
  Search, Filter, ChevronRight, Activity, Globe,
  ShieldCheck, ArrowUpRight, Copy, CheckCircle2
} from 'lucide-react';

export default function FoundryPage() {
  const [isCampaignActive, setIsCampaignActive] = useState(false);
  const [prospectos, setProspectos] = useState([]);
  const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

  // --- 🛰️ CARGA DE DATOS ESTRATÉGICOS ---
  const loadLeads = async () => {
    try {
      // Usaremos tu endpoint de administración para ver todos los prospectos
      const res = await fetch(`${API_BASE}/api/admin/prospectos`);
      if (res.ok) setProspectos(await res.json());
    } catch (e) { console.error("Error conectando con La Fundición"); }
  };

  useEffect(() => { loadLeads(); }, []);

  // --- 🚀 PROCESADOR DE CSV (MUNICIÓN) ---
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Ignorar cabecera
      const leads = lines.map(line => {
        const [nombre, clinica, telefono, email, ciudad] = line.split(',');
        return { nombre, clinica, telefono, email, ciudad };
      }).filter(l => l.telefono);

      const res = await fetch(`${API_BASE}/api/asg/importar-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads })
      });
      if (res.ok) {
        alert(`✅ ¡Munición cargada! ${leads.length} prospectos integrados.`);
        loadLeads();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={containerStyle}>
      {/* FONDO TÉCNICO */}
      <div style={gridStyle} />
      <div style={glowStyle} />

      {/* NAV DE ADMINISTRACIÓN */}
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={logoBadge}><Zap size={20} fill="#d4af37" color="#d4af37" /></div>
          <span style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '-1px' }}>THE FOUNDRY <span style={{ color: '#d4af37', fontWeight: 400 }}>| ASG</span></span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
           <div style={statusBadge(isCampaignActive)}>
              {isCampaignActive ? "CENTINELA EN CAZA" : "SISTEMA EN REPOSO"}
           </div>
           <div style={avatarStyle}>AD</div>
        </div>
      </nav>

      <main style={{ padding: '120px 60px', position: 'relative', zIndex: 1 }}>
        
        {/* TOP STATS: EL PULSO DEL NEGOCIO */}
        <div style={statsGrid}>
          <StatCard icon={<Users size={20} />} label="PROSPECTOS TOTALES" value={prospectos.length} color="#fff" />
          <StatCard icon={<MessageSquare size={20} />} label="WHATSAPP ENVIADOS" value="0" color="#25D366" />
          <StatCard icon={<Mail size={20} />} label="EMAILS EN COLA" value="0" color="#0066ff" />
          <StatCard icon={<Target size={20} />} label="INTERÉS DETECTADO" value="0" color="#d4af37" />
        </div>

        {/* ACCIONES MAESTRAS */}
        <div style={actionRow}>
          <div style={dropZone} onClick={() => document.getElementById('csvIn')?.click()}>
            <Upload size={24} style={{ marginBottom: '10px' }} />
            <div style={{ fontWeight: 800 }}>CARGAR MUNICIÓN (CSV)</div>
            <input id="csvIn" type="file" hidden accept=".csv" onChange={handleCSV} />
          </div>

          <button 
            onClick={() => setIsCampaignActive(!isCampaignActive)} 
            style={isCampaignActive ? btnStop : btnStart}
          >
            {isCampaignActive ? <Pause size={24} /> : <Play size={24} />}
            {isCampaignActive ? "DETENER ATAQUE" : "INICIAR CAMPAÑA DE CONQUISTA"}
          </button>
        </div>

        {/* TERMINAL DE DATOS (LISTADO) */}
        <section style={terminalSection}>
          <div style={terminalHeader}>
             <div style={{ display: 'flex', gap: '20px' }}>
                <span>DB_VERSION: OMEGA_2.5</span>
                <span>STATUS: SECURE_SYNC</span>
             </div>
             <Activity size={16} className="animate-pulse" />
          </div>
          
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>ESTADO</th>
                <th style={thStyle}>CLÍNICA</th>
                <th style={thStyle}>CONTACTO</th>
                <th style={thStyle}>CANAL</th>
                <th style={thStyle}>CIUDAD</th>
                <th style={thStyle}>ÚLTIMA ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {prospectos.map((p: any, i) => (
                <tr key={i} style={trStyle}>
                  <td style={tdStyle}><span style={statusTag(p.estado)}>{p.estado}</span></td>
                  <td style={{ ...tdStyle, color: '#fff', fontWeight: 800 }}>{p.nombre_clinica}</td>
                  <td style={tdStyle}>{p.nombre_contacto}</td>
                  <td style={tdStyle}>{p.canal_primario === 'whatsapp' ? '📱 WhatsApp' : '📧 Email'}</td>
                  <td style={tdStyle}>{p.ciudad}</td>
                  <td style={tdStyle}>{p.ultima_accion ? new Date(p.ultima_accion).toLocaleString() : 'NUNCA'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {prospectos.length === 0 && <div style={emptyState}>SIN DATOS EN LA FUNDICIÓN. CARGA UN CSV PARA EMPEZAR.</div>}
        </section>

      </main>
    </div>
  );
}

// --- SUB-COMPONENTES ---
function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={statCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ opacity: 0.3 }}>{icon}</div>
        <ArrowUpRight size={14} style={{ opacity: 0.2 }} />
      </div>
      <div style={{ fontSize: '32px', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.3, letterSpacing: '1px', marginTop: '5px' }}>{label}</div>
    </div>
  );
}

// --- ESTILOS DE "LA FUNDICIÓN" ---
const containerStyle: React.CSSProperties = { backgroundColor: '#05070a', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative' };
const gridStyle: React.CSSProperties = { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 };
const glowStyle: React.CSSProperties = { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)', zIndex: 0 };
const navStyle: React.CSSProperties = { position: 'fixed', top: 0, width: '100%', padding: '20px 40px', background: 'rgba(5,7,10,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxSizing: 'border-box' };
const logoBadge: React.CSSProperties = { width: '35px', height: '35px', background: 'rgba(212,175,55,0.1)', borderRadius: '10px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const avatarStyle: React.CSSProperties = { width: '35px', height: '35px', background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 };
const statusBadge = (active: boolean): React.CSSProperties => ({ padding: '6px 14px', borderRadius: '100px', fontSize: '10px', fontWeight: 900, background: active ? 'rgba(37,211,102,0.1)' : 'rgba(255,255,255,0.03)', color: active ? '#25D366' : 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.05)', letterSpacing: '1px' });
const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' };
const statCardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const actionRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: '0.6fr 1.4fr', gap: '20px', marginBottom: '40px' };
const dropZone: React.CSSProperties = { background: 'rgba(212,175,55,0.02)', border: '2px dashed rgba(212,175,55,0.2)', borderRadius: '24px', padding: '30px', textAlign: 'center', cursor: 'pointer', color: '#d4af37' };
const btnStart: React.CSSProperties = { background: '#fff', color: '#000', border: 'none', borderRadius: '24px', fontWeight: 900, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', cursor: 'pointer', boxShadow: '0 0 40px rgba(255,255,255,0.1)' };
const btnStop: React.CSSProperties = { ...btnStart, background: '#ef4444', color: '#fff', boxShadow: '0 0 40px rgba(239,68,68,0.2)' };
const terminalSection: React.CSSProperties = { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', overflow: 'hidden' };
const terminalHeader: React.CSSProperties = { padding: '15px 30px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const theadStyle: React.CSSProperties = { textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' };
const thStyle: React.CSSProperties = { padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const trStyle: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.03)' };
const tdStyle: React.CSSProperties = { padding: '20px 30px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' };
const emptyState: React.CSSProperties = { padding: '100px', textAlign: 'center', opacity: 0.2, fontWeight: 900, letterSpacing: '4px' };
const statusTag = (e: string): React.CSSProperties => ({ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 900, background: e === 'frio' ? 'rgba(56,189,248,0.1)' : 'rgba(37,211,102,0.1)', color: e === 'frio' ? '#38bdf8' : '#25D366', textTransform: 'uppercase' });