import React from 'react';
import { Gift, Copy } from 'lucide-react';
import { THEME } from '../theme';

export const ReferidosView: React.FC = () => {
  const code = "FISIOTOOL.APP/INVITE/DEMO";

  return (
     <div style={{ textAlign: 'center', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
       <Gift size={64} color="#d4af37" style={{ marginBottom: '30px' }} />
       <h2 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>Premio por Recomendación</h2>
       <p style={{ opacity: 0.5, maxWidth: '500px', margin: '0 auto' }}>
         Comparte tu éxito. 50% de descuento este mes para ti y tu amigo al usar tu enlace personal.
       </p>
       
       <div style={{ 
         background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '20px', 
         display: 'inline-flex', gap: '20px', alignItems: 'center', marginTop: '40px', 
         border: '1px solid rgba(212,175,55,0.3)' 
       }}>
         <code style={{ color: '#d4af37', fontWeight: 800, fontSize: '16px' }}>{code}</code>
         <Copy 
            size={20} 
            style={{ cursor: 'pointer', color: THEME.colors.text.muted }} 
            onClick={() => alert("✅ Código copiado")} 
         />
       </div>
     </div>
  );
};