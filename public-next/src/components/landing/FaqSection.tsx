'use client';
import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Coins, Cpu, HelpCircle, Eye, LucideIcon, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  type: 'money' | 'security' | 'tech' | 'access' | 'general';
  q: string;
  a: string;
}

const TYPE_CONFIG: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  money: { color: '#facc15', icon: Coins, label: 'RENTABILIDAD' },
  security: { color: '#10b981', icon: ShieldCheck, label: 'CUMPLIMIENTO' },
  tech: { color: '#8b5cf6', icon: Cpu, label: 'INFRAESTRUCTURA' },
  access: { color: '#06b6d4', icon: Zap, label: 'ACCESIBILIDAD' },
  general: { color: '#3b82f6', icon: Briefcase, label: 'OPERATIVA' }
};

const FAQS: FaqItem[] = [
  { type: 'general', q: "¿Y si la IA se equivoca y cita a dos personas a la vez?", a: "El motor de Ana opera mediante un algoritmo de asignación determinista en milisegundos. Si un slot temporal está comprometido en la base de datos, el sistema bloquea cualquier intento de duplicidad, garantizando una agenda con errores cero." },
  { type: 'general', q: "¿Se enfadarán mis pacientes por pagar una fianza online?", a: "La psicología del compromiso demuestra que el paciente que abona una señal valora más el tiempo del profesional. Fisiotool actúa como mediador diplomático, eliminando la fricción del cobro manual y profesionalizando la relación desde el primer contacto." },
  { type: 'money', q: "¿Dónde va mi dinero y cuándo llega a mi cuenta?", a: "Utilizamos la arquitectura Stripe Connect Express. El flujo de fondos viaja directamente del paciente a su cuenta bancaria vinculada, sin custodia por nuestra parte. Usted mantiene el control total de su tesorería con liquidaciones automáticas." },
  { type: 'general', q: "Uso términos técnicos complejos. ¿La IA entenderá mis informes?", a: "Ana ha sido entrenada con modelos de lenguaje clínico avanzado. Reconoce terminología específica como trocanteritis, punción seca o protocolos post-quirúrgicos, garantizando transcripciones precisas y estructuradas profesionalmente." },
  { type: 'security', q: "¿Qué sucede con la confidencialidad de los historiales médicos?", a: "Cada expediente está blindado mediante cifrado asimétrico AES-256. Fisiotool cumple con los estándares DPA de salud de la UE, asegurando que los datos sensibles permanezcan bajo su exclusiva jurisdicción y responsabilidad técnica." },
  { type: 'security', q: "¿Puedo exportar mi base de datos si decido darme de baja?", a: "Soberanía total de datos. En cualquier momento puede generar un volcado completo de su información en formatos estándar (Excel/CSV). Su base de datos le pertenece a usted, no al software." },
  { type: 'tech', q: "¿Requiere este sistema un hardware potente o instalación?", a: "Fisiotool es un ecosistema SaaS basado en la nube. No requiere instalación ni mantenimiento local. Es accesible desde cualquier dispositivo con conexión a internet, optimizado para equipos antiguos y modernos." },
  { type: 'tech', q: "¿Puedo gestionar mi clínica si estoy fuera o a domicilio?", a: "Absolutamente. La tecnología PWA permite instalar el sistema como una aplicación nativa en dispositivos móviles, permitiendo el control de la agenda y el dictado de informes desde cualquier ubicación." },
  { type: 'access', q: "Soy invidente. ¿Es la accesibilidad una promesa o una realidad?", a: "Fisiotool ha sido desarrollada bajo arquitectura 'Audio-First'. No es una adaptación, es un diseño nativo compatible con lectores de pantalla y comandos de voz, garantizando una autonomía operativa del 100%." },
  { type: 'access', q: "¿Necesito soporte visual para la configuración inicial?", a: "No. El proceso de Onboarding incluye un asistente de voz integrado que guía al profesional en cada paso del registro y configuración del centro, permitiendo un despliegue totalmente independiente." },
  { type: 'money', q: "¿Es rentable pagar 100€ al mes comparado con el papel?", a: "El coste de un solo 'No-Show' suele superar los 50€. Con que Ana recupere dos citas perdidas al mes, la inversión queda amortizada. El resto es incremento de beneficio neto y tiempo de vida recuperado." },
  { type: 'tech', q: "¿Quién me asiste si surge una incidencia técnica?", a: "Dispone de una línea directa de soporte vía WhatsApp Business. No interactuará con tickets lentos, sino con técnicos de nivel senior que resolverán su consulta en tiempo real." }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section style={{ padding: '120px 5%', background: '#020305' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '80px', textAlign: 'center' }}>
           <small style={{color:'#0066ff', fontWeight:900, letterSpacing:'3px', textTransform:'uppercase'}}>Resolución de Dudas</small>
           <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', marginTop: '15px' }}>Consultas Frecuentes.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>
          {FAQS.map((item, i) => {
            const config = TYPE_CONFIG[item.type];
            const isOpen = openIndex === i;
            return (
              <div key={i} onClick={() => setOpenIndex(isOpen ? null : i)} style={{ borderRadius: '24px', border: `1px solid ${isOpen ? config.color : 'rgba(255,255,255,0.05)'}`, background: 'rgba(255,255,255,0.02)', cursor: 'pointer', padding: '30px', transition: '0.3s', boxShadow: isOpen ? `0 10px 30px -10px ${config.color}30` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: config.color, fontSize: '10px', fontWeight: 800, marginBottom: '15px', letterSpacing: '1px' }}>
                  <config.icon size={14} /> {config.label}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, alignItems: 'center', gap: '20px' }}>
                  <span style={{flex: 1, fontSize: '17px'}}>{item.q}</span>
                  <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s', opacity: 0.3 }} />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '20px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.7', fontSize: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
