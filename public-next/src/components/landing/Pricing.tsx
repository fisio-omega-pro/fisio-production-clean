'use client';

import React, { useMemo, useState } from 'react';
import { Check, Zap, Crown, Rocket, Shield, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/apiBase';

export default function Pricing() {
  const router = useRouter();
  const [corpOpen, setCorpOpen] = useState(false);
  const [corpLoading, setCorpLoading] = useState(false);
  const [corpDone, setCorpDone] = useState(false);
  const [corpError, setCorpError] = useState<string | null>(null);
  const [corpForm, setCorpForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    clinicsCount: '',
    practitionersCount: '',
    services: [] as string[],
    servicesOther: '',
    currentSoftware: '',
    monthlyPatients: '',
    locations: '',
    timeline: '0-30d',
    preferredContact: 'email',
    notes: '',
    consent: false,
    website: '', // honeypot anti-spam
  });

  const serviceOptions = useMemo(() => ([
    'Fisioterapia',
    'Osteopatía',
    'Podología',
    'Nutrición',
    'Psicología',
    'Dermatología',
    'Medicina estética',
    'Rehabilitación',
    'Traumatología',
    'Otro',
  ]), []);

  const toggleService = (s: string) => {
    setCorpForm((p) => ({
      ...p,
      services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s],
    }));
  };

  const resetCorp = () => {
    setCorpDone(false);
    setCorpError(null);
    setCorpLoading(false);
    setCorpForm({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      clinicsCount: '',
      practitionersCount: '',
      services: [],
      servicesOther: '',
      currentSoftware: '',
      monthlyPatients: '',
      locations: '',
      timeline: '0-30d',
      preferredContact: 'email',
      notes: '',
      consent: false,
      website: '',
    });
  };

  const submitCorporate = async () => {
    setCorpError(null);
    if (corpLoading) return;
    // Honeypot: si está relleno, silencio total
    if (corpForm.website) return setCorpDone(true);

    const companyName = corpForm.companyName.trim();
    const contactName = corpForm.contactName.trim();
    const email = corpForm.email.trim();
    const clinicsCount = corpForm.clinicsCount.trim();
    const practitionersCount = corpForm.practitionersCount.trim();
    if (!companyName || !contactName || !email) return setCorpError('Empresa, contacto y email son obligatorios.');
    if (!corpForm.consent) return setCorpError('Debes aceptar el tratamiento de datos para que podamos contactarte.');
    if (!clinicsCount || !practitionersCount) return setCorpError('Indica número de sedes y número de especialistas.');

    setCorpLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/corporate-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          contactName,
          email,
          phone: corpForm.phone.trim(),
          clinicsCount: Number(clinicsCount),
          practitionersCount: Number(practitionersCount),
          services: corpForm.services,
          servicesOther: corpForm.services.includes('Otro') ? corpForm.servicesOther.trim() : '',
          currentSoftware: corpForm.currentSoftware.trim(),
          monthlyPatients: corpForm.monthlyPatients ? Number(corpForm.monthlyPatients) : null,
          locations: corpForm.locations.trim(),
          timeline: corpForm.timeline,
          preferredContact: corpForm.preferredContact,
          notes: corpForm.notes.trim(),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'No se pudo enviar. Inténtalo de nuevo.');
      setCorpDone(true);
    } catch (e: any) {
      setCorpError(e?.message || 'Error de conexión.');
    } finally {
      setCorpLoading(false);
    }
  };

  return (
    <section id="precios" style={styles.section}>
      <div style={styles.header}>
        <small style={styles.label}>TU NUEVA VENTAJA COMPETITIVA</small>
        <h2 style={styles.title}>Selecciona la Transformación Digital Precisa para tu Clínica.</h2>
        <p style={styles.description}>
          No cobramos por "usar un software". Cobramos una fracción de lo que te generamos. 
          <br /><span style={{color: '#fff', fontWeight: 600}}>Cualquier plan se paga solo recuperando apenas 2 citas al mes.</span>
        </p>
      </div>

      <div style={styles.grid}>
        
        {/* NIVEL 1: PROFESSIONAL */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapper}><Rocket size={24} color="#3b82f6" /></div>
            <h3 style={styles.planName}>Professional</h3>
            <div style={styles.price}>100€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>
              Para el especialista que quiere dejar de ser <strong>esclavo del teléfono</strong> y dedicarse solo a curar.
            </p>
          </div>
          <div style={styles.separator} />
          <div style={styles.features}>
            <FeatureItem text="IA Ana: Tu Recepcionista 24/7" sub="Nunca duerme, nunca se queja." />
            <FeatureItem text="Agenda Atómica Anti-Conflictos" sub="Cálculo matemático de huecos." />
            <FeatureItem text="Cobro de Fianza Automática" sub="Elimina el 100% de No-Shows." />
            <FeatureItem text="Dictado Clínico por Voz" sub="Ahorra 1 hora de escritura al día." />
            <FeatureItem text="Soporte Técnico Dedicado" />
          </div>
          <button onClick={() => router.push('/setup?plan=solo')} style={styles.btnOutline}>
            COMENZAR PRUEBA GRATUITA
          </button>
        </div>

        {/* NIVEL 2: BUSINESS */}
        <div style={styles.cardFeatured}>
          <div style={styles.badge}>MÁS RENTABLE</div>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapperFeatured}><Crown size={24} color="#fff" /></div>
            <h3 style={styles.planName}>Business</h3>
            <div style={styles.price}>300€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>
              La infraestructura definitiva para <strong>clínicas en expansión</strong> que buscan duplicar su facturación.
            </p>
          </div>
          <div style={styles.separatorFeatured} />
          <div style={styles.features}>
            <FeatureItem text="Hasta 5 Especialistas" sub="Gestión de agendas cruzadas." />
            <FeatureItem text="Panel Financiero en Tiempo Real" sub="Control total de tu tesorería." />
            <FeatureItem text="Motor de Reactivación (ASG)" sub="Ana vende a tus antiguos pacientes." />
            <FeatureItem text="Multi-Departamento" sub="Fisio, Podo, Nutri... todo en uno." />
            <FeatureItem text="Prioridad en Soporte VIP" />
          </div>
          <button onClick={() => router.push('/setup?plan=team')} style={styles.btnSolid}>
            ACTIVAR LICENCIA BUSINESS <Zap size={18} fill="currentColor" />
          </button>
        </div>

        {/* NIVEL 3: CORPORATE */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapper}><Shield size={24} color="#3b82f6" /></div>
            <h3 style={styles.planName}>Corporate</h3>
            <div style={styles.price}>500€<span style={styles.period}>/mes</span></div>
            <p style={styles.planDesc}>
              Arquitectura de grado hospitalario para <strong>redes de clínicas</strong> y centros de alto volumen.
            </p>
          </div>
          <div style={styles.separator} />
          <div style={styles.features}>
            <FeatureItem text="Especialistas Ilimitados" sub="Escalabilidad infinita." />
            <FeatureItem text="Gestión Multi-Sede Global" sub="Controla 10 clínicas desde 1 pantalla." />
            <FeatureItem text="API de Integración Abierta" sub="Conecta con tu ERP actual." />
            <FeatureItem text="Consultor de Estrategia Propio" sub="Reuniones mensuales de optimización." />
            <FeatureItem text="Auditoría Legal RGPD Incluida" />
          </div>
          <button onClick={() => { resetCorp(); setCorpOpen(true); }} style={styles.btnOutline}>
            HABLAR CON VENTAS
          </button>
        </div>

      </div>

      {/* MODAL CORPORATE */}
      {corpOpen && (
        <div style={modalStyles.overlay} role="dialog" aria-modal="true" aria-label="Contacto Corporate">
          <div style={modalStyles.card}>
            <div style={modalStyles.headerRow}>
              <div>
                <div style={modalStyles.kicker}>Corporate · Ventas</div>
                <div style={modalStyles.title}>Cuéntanos tu caso y te damos respuesta concisa</div>
                <div style={modalStyles.subtitle}>Pensado para multiclinicas y equipos (&gt;5) con servicios mixtos.</div>
              </div>
              <button onClick={() => setCorpOpen(false)} style={modalStyles.closeBtn} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            {corpDone ? (
              <div style={modalStyles.doneBox}>
                <div style={modalStyles.doneTitle}>Recibido. Te contactaremos en breve.</div>
                <div style={modalStyles.doneText}>
                  Si es urgente, escribe a <span style={{ color: '#fff' }}>info@fisiotool.com</span>.
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button onClick={() => setCorpOpen(false)} style={modalStyles.primaryBtn}>Cerrar</button>
                  <button onClick={() => { setCorpOpen(false); router.push('/login'); }} style={modalStyles.secondaryBtn}>Acceso clientes</button>
                </div>
              </div>
            ) : (
              <>
                {corpError && <div style={modalStyles.errorBox}>{corpError}</div>}

                <div style={modalStyles.grid}>
                  <Field label="Empresa / Grupo" value={corpForm.companyName} onChange={(v) => setCorpForm(p => ({ ...p, companyName: v }))} placeholder="Ej: FisioSalud Group" />
                  <Field label="Persona de contacto" value={corpForm.contactName} onChange={(v) => setCorpForm(p => ({ ...p, contactName: v }))} placeholder="Nombre y cargo" />
                  <Field label="Email" type="email" value={corpForm.email} onChange={(v) => setCorpForm(p => ({ ...p, email: v }))} placeholder="tucorreo@empresa.com" />
                  <Field label="Teléfono" value={corpForm.phone} onChange={(v) => setCorpForm(p => ({ ...p, phone: v }))} placeholder="+34 ..." />

                  <Field label="Nº de sedes" type="number" value={corpForm.clinicsCount} onChange={(v) => setCorpForm(p => ({ ...p, clinicsCount: v }))} placeholder="Ej: 3" />
                  <Field label="Nº de especialistas" type="number" value={corpForm.practitionersCount} onChange={(v) => setCorpForm(p => ({ ...p, practitionersCount: v }))} placeholder="Ej: 12" />

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={modalStyles.fieldLabel}>Servicios / departamentos</div>
                    <div style={modalStyles.chips}>
                      {serviceOptions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          style={{
                            ...modalStyles.chip,
                            ...(corpForm.services.includes(s) ? modalStyles.chipOn : {}),
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {corpForm.services.includes('Otro') && (
                      <div style={{ marginTop: 10 }}>
                        <Field
                          label="¿Cuál?"
                          value={corpForm.servicesOther}
                          onChange={(v) => setCorpForm((p) => ({ ...p, servicesOther: v }))}
                          placeholder="Describe otros servicios"
                        />
                      </div>
                    )}
                  </div>

                  <Field label="Software actual (si aplica)" value={corpForm.currentSoftware} onChange={(v) => setCorpForm(p => ({ ...p, currentSoftware: v }))} placeholder="Ej: Doctoralia / ClinicCloud / Excel..." />
                  <Field label="Pacientes/mes (aprox.)" type="number" value={corpForm.monthlyPatients} onChange={(v) => setCorpForm(p => ({ ...p, monthlyPatients: v }))} placeholder="Ej: 900" />

                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Ubicaciones (ciudad/país)" value={corpForm.locations} onChange={(v) => setCorpForm(p => ({ ...p, locations: v }))} placeholder="Ej: Madrid, Valencia, Lisboa..." />
                  </div>

                  <div>
                    <div style={modalStyles.fieldLabel}>Plazo deseado</div>
                    <select value={corpForm.timeline} onChange={(e) => setCorpForm(p => ({ ...p, timeline: e.target.value }))} style={modalStyles.select}>
                      <option value="0-30d">0–30 días</option>
                      <option value="1-3m">1–3 meses</option>
                      <option value="3-6m">3–6 meses</option>
                      <option value="6m+">6+ meses</option>
                    </select>
                  </div>
                  <div>
                    <div style={modalStyles.fieldLabel}>Preferencia de contacto</div>
                    <select value={corpForm.preferredContact} onChange={(e) => setCorpForm(p => ({ ...p, preferredContact: e.target.value }))} style={modalStyles.select}>
                      <option value="email">Email</option>
                      <option value="phone">Teléfono</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={modalStyles.fieldLabel}>Contexto / preguntas (opcional)</div>
                    <textarea
                      value={corpForm.notes}
                      onChange={(e) => setCorpForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Ej: multiclinica con 2 marcas, queremos integración con ERP + reporting por sede..."
                      style={modalStyles.textarea}
                      rows={4}
                    />
                  </div>

                  {/* Honeypot */}
                  <input
                    value={corpForm.website}
                    onChange={(e) => setCorpForm(p => ({ ...p, website: e.target.value }))}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                </div>

                <label style={modalStyles.consentRow}>
                  <input
                    type="checkbox"
                    checked={corpForm.consent}
                    onChange={(e) => setCorpForm(p => ({ ...p, consent: e.target.checked }))}
                  />
                  <span style={modalStyles.consentText}>
                    Acepto el tratamiento de datos para que FisioTool me contacte por este asunto.
                  </span>
                </label>

                <div style={modalStyles.actions}>
                  <button onClick={() => setCorpOpen(false)} style={modalStyles.secondaryBtn} disabled={corpLoading}>Cancelar</button>
                  <button onClick={submitCorporate} style={modalStyles.primaryBtn} disabled={corpLoading}>
                    {corpLoading ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Enviar y hablar con ventas'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <div style={modalStyles.fieldLabel}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        style={modalStyles.input}
      />
    </div>
  );
}

function FeatureItem({ text, sub }: { text: string, sub?: string }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#fff', fontWeight: 600 }}>
        <div style={{background:'rgba(16,185,129,0.1)', borderRadius:'50%', padding:'2px'}}>
            <Check size={14} color="#10b981" strokeWidth={3} /> 
        </div>
        {text}
      </div>
      {sub && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', paddingLeft: '28px', margin: '4px 0 0 0', lineHeight: '1.4' }}>{sub}</p>}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  section: { padding: '120px 5%', background: '#020305' },
  header: { textAlign: 'center', marginBottom: '80px' },
  label: { color: '#0066ff', fontWeight: 900, fontSize: '13px', letterSpacing: '3px', marginBottom: '15px', display: 'block', textTransform: 'uppercase' },
  title: { fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 900, color: '#fff', marginBottom: '20px', lineHeight: '1.1' },
  description: { fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', display: 'flex', flexDirection: 'column', transition: '0.3s' },
  cardFeatured: { background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.2) 0%, rgba(2,3,5,0) 100%)', border: '2px solid #0066ff', borderRadius: '32px', padding: '50px 40px', position: 'relative', boxShadow: '0 0 60px -10px rgba(0,102,255,0.15)', display: 'flex', flexDirection: 'column', transform: 'scale(1.02)' },
  badge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#0066ff', color: '#fff', fontSize: '11px', fontWeight: 900, padding: '6px 16px', borderRadius: '100px', letterSpacing: '1px', boxShadow: '0 10px 20px rgba(0,102,255,0.4)' },
  cardHeader: { textAlign: 'center' },
  iconWrapper: { width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' },
  iconWrapperFeatured: { width: '60px', height: '60px', background: '#0066ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 30px rgba(0,102,255,0.3)' },
  planName: { fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '10px' },
  price: { fontSize: '56px', fontWeight: 900, color: '#fff', letterSpacing: '-2px' },
  period: { fontSize: '16px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginLeft: '5px' },
  planDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginTop: '15px', lineHeight: '1.6', minHeight: '50px' },
  separator: { height: '1px', background: 'rgba(255,255,255,0.05)', margin: '30px 0' },
  separatorFeatured: { height: '1px', background: 'rgba(0,102,255,0.2)', margin: '30px 0' },
  features: { marginBottom: '40px', flex: 1 },
  btnOutline: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '20px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', transition: '0.3s', width: '100%', fontSize: '14px', letterSpacing: '1px' },
  btnSolid: { background: '#0066ff', border: 'none', color: '#fff', padding: '20px', borderRadius: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,102,255,0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', letterSpacing: '0.5px' }
};

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: { width: 'min(920px, 96vw)', maxHeight: '90vh', overflow: 'auto', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: 22, boxShadow: '0 40px 120px rgba(0,0,0,0.6)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  kicker: { fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 900 },
  title: { fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 6 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.5 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 12 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontWeight: 900, marginBottom: 6 },
  input: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 12px', color: '#fff', outline: 'none', fontSize: 14 },
  select: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 12px', color: '#fff', outline: 'none', fontSize: 14 },
  textarea: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, color: '#fff', outline: 'none', fontSize: 14, resize: 'vertical' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.8)', padding: '8px 10px', fontSize: 12, cursor: 'pointer' },
  chipOn: { border: '1px solid rgba(0,102,255,0.6)', background: 'rgba(0,102,255,0.18)', color: '#fff' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  primaryBtn: { background: '#0066ff', border: 'none', color: '#fff', padding: '12px 14px', borderRadius: 14, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
  secondaryBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '12px 14px', borderRadius: 14, fontWeight: 900, cursor: 'pointer' },
  consentRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, userSelect: 'none' },
  consentText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 },
  errorBox: { marginTop: 12, padding: 12, borderRadius: 14, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, fontWeight: 700 },
  doneBox: { marginTop: 10, padding: 16, borderRadius: 16, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)' },
  doneTitle: { fontSize: 16, fontWeight: 900, color: '#fff' },
  doneText: { marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 },
};
