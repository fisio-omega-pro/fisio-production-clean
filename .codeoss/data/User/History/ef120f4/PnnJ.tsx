import React from 'react';
import { TrendingUp, PieChart, Sparkles } from 'lucide-react';
import { BalanceFinanciero } from './types';      
import { GlassCard } from './Atoms';              
import { THEME } from './theme';                  
export const FinanzasView: React.FC<{ balance: BalanceFinanciero }> = ({ balance }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Rendimiento</h2>
        <p style={{ color: THEME.colors.text.muted }}>Análisis financiero en tiempo real</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <GlassCard hoverEffect style={{ borderBottom: `4px solid ${THEME.colors.success}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ color: THEME.colors.success, background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '8px' }}><PieChart size={20} /></div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: THEME.colors.success }}>+{balance.tendenciaMensual}%</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900 }}>{balance.real}€</div>
          <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, letterSpacing: '1px' }}>INGRESOS REALES</div>
        </GlassCard>

        <GlassCard hoverEffect style={{ borderBottom: `4px solid ${THEME.colors.warning}` }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ width: 'fit-content', color: THEME.colors.warning, background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '8px' }}><TrendingUp size={20} /></div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900 }}>{balance.potencial}€</div>
          <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, letterSpacing: '1px' }}>POTENCIAL (PENDIENTE)</div>
        </GlassCard>

        <GlassCard hoverEffect style={{ borderBottom: `4px solid ${THEME.colors.primary}` }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ width: 'fit-content', color: THEME.colors.primary, background: 'rgba(0,102,255,0.1)', padding: '8px', borderRadius: '8px' }}><Sparkles size={20} /></div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 900 }}>{balance.roi}%</div>
          <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, letterSpacing: '1px' }}>RETORNO ROI</div>
        </GlassCard>
      </div>
    </div>
  );
};