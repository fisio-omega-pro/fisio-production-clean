import React from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import { ActionButton, InputField } from '../components/Atoms';
import { THEME } from '../theme';

export const CobrosView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
         <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Pasarela de Pagos</h2>
         <p style={{ color: THEME.colors.text.muted }}>Configura cómo reciben dinero tus clínicas</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* STRIPE EXPRESS */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', borderLeft: `6px solid ${THEME.colors.primary}` }}>
          <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0,102,255,0.1)', borderRadius: '16px', display: 'inline-flex', color: THEME.colors.primary }}>
             <CreditCard size={24} />
          </div>
          <h4 style={{ margin: '10px 0', fontSize: '18px' }}>Stripe Express (Automático)</h4>
          <p style={{ opacity: 0.5, fontSize: '13px', lineHeight: '1.6', marginBottom: '30px' }}>
            La opción recomendada. Ana cobra la fianza, confirma la cita y transfiere el dinero a tu banco automáticamente.
          </p>
          <ActionButton fullWidth>CONECTAR EN 3 PASOS ➜</ActionButton>
        </div>

        {/* BIZUM DIRECTO */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', borderLeft: `6px solid ${THEME.colors.success}` }}>
          <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(16,185,129,0.1)', borderRadius: '16px', display: 'inline-flex', color: THEME.colors.success }}>
             <Smartphone size={24} />
          </div>
          <h4 style={{ margin: '10px 0', fontSize: '18px' }}>Bizum Directo (Manual)</h4>
          <p style={{ opacity: 0.5, fontSize: '13px', lineHeight: '1.6', marginBottom: '30px' }}>
            Ana pedirá al paciente que envíe un Bizum. Tú tendrás que validar el pago manualmente.
          </p>
          <InputField placeholder="Tu número para Bizum" />
        </div>
      </div>
    </div>
  );
};