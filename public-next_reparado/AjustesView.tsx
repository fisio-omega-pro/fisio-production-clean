import React from 'react';
import { Volume2 } from 'lucide-react';
import { THEME } from '../theme';

interface AjustesViewProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const AjustesView: React.FC<AjustesViewProps> = ({ voiceEnabled, onToggleVoice }) => {
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '50px', borderRadius: '32px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', border: `1px solid ${THEME.colors.border}` }}>
      <Volume2 size={48} color={THEME.colors.primary} style={{ marginBottom: '30px' }} />
      <h3>Modo Adaptabilidad</h3>
      <p style={{ marginTop: '10px', marginBottom: '40px', opacity: 0.5 }}>Activa la narración por voz para profesionales invidentes.</p>
      
      <div 
        onClick={onToggleVoice}
        style={{ 
          width: '50px', height: '26px', 
          background: voiceEnabled ? THEME.colors.primary : '#334155', 
          borderRadius: '20px', position: 'relative', cursor: 'pointer', margin: '0 auto',
          transition: 'background 0.3s'
        }}
      >
        <div style={{ 
          width: '20px', height: '20px', background: '#fff', borderRadius: '50%', 
          position: 'absolute', top: '3px', 
          left: voiceEnabled ? '27px' : '3px', transition: 'left 0.2s' 
        }} />
      </div>
      <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.3 }}>{voiceEnabled ? 'ACTIVADO' : 'DESACTIVADO'}</p>
    </div>
  );
};