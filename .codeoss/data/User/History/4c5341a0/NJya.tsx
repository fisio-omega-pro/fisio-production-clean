import React from 'react';
import { Building2, Copy, Smartphone, PlusCircle } from 'lucide-react';
import { ActionButton, StatusBadge } from '../components/Atoms';
import { THEME } from '../theme';
import { motion } from 'framer-motion';

export const SedesView: React.FC = () => {
  const clinicLink = "fisiotool.app/clinic-demo";

  const copyLink = () => {
    navigator.clipboard.writeText(clinicLink);
    alert("✅ Enlace copiado al portapapeles");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
           <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Infraestructura</h2>
           <p style={{ color: THEME.colors.text.muted }}>Gestión de clínicas y puntos de acceso</p>
        </div>
        <ActionButton icon={<PlusCircle size={18} />}>Nueva Sede</ActionButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        <motion.div 
          whileHover={{ y: -5 }}
          style={{ 
            padding: '40px', background: 'rgba(255,255,255,0.02)', 
            borderRadius: '32px', border: `1px solid ${THEME.colors.border}` 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <h3 style={{ margin: 0, fontSize: '20px' }}>Sede Principal</h3>
             <StatusBadge status="ACTIVA" />
          </div>
          
          {/* ENLACE WHATSAPP */}
          <div style={{ marginTop: '30px', padding: '20px', background: '#05070a', borderRadius: '20px', border: `1px solid ${THEME.colors.primary}40` }}>
            <label style={{ fontSize: '10px', color: THEME.colors.primary, fontWeight: 800, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Smartphone size={12} /> ENLACE PARA TU WHATSAPP BUSINESS
            </label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <code style={{ background: 'transparent', color: '#fff', fontSize: '13px', flex: 1, fontFamily: 'monospace' }}>
                {clinicLink}
              </code>
              <button onClick={copyLink} style={{ background: 'none', border: 'none', color: THEME.colors.accent, cursor: 'pointer' }}>
                <Copy size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};