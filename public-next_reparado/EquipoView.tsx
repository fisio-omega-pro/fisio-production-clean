import React from 'react';
import { Briefcase, UserPlus } from 'lucide-react';
import { Especialista } from '../types';
import { ActionButton, StatusBadge } from '../components/Atoms';
import { motion } from 'framer-motion';
import { THEME } from '../theme';

interface EquipoViewProps {
  equipo: Especialista[];
  onAddMember: () => void;
}

export const EquipoView: React.FC<EquipoViewProps> = ({ equipo, onAddMember }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Especialistas</h2>
          <p style={{ color: THEME.colors.text.muted }}>Gestiona los terapeutas y sus permisos</p>
        </div>
        <ActionButton onClick={onAddMember} icon={<UserPlus size={18} />}>
          Añadir Profesional
        </ActionButton>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {equipo.length > 0 ? equipo.map((esp) => (
          <motion.div 
            key={esp.id} 
            whileHover={{ y: -5 }}
            style={{ 
              background: 'rgba(255,255,255,0.02)', padding: '30px', 
              borderRadius: '32px', border: `1px solid ${THEME.colors.border}`, 
              textAlign: 'center' 
            }}
          >
            <div style={{ 
              width: '60px', height: '60px', 
              background: `linear-gradient(45deg, ${THEME.colors.primary}, ${THEME.colors.accent})`, 
              borderRadius: '50%', margin: '0 auto', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', 
              fontSize: '24px', fontWeight: 900 
            }}>
              {esp.nombre.charAt(0)}
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '15px 0 5px 0' }}>{esp.nombre}</h4>
            <p style={{ fontSize: '12px', color: THEME.colors.primary, fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
              {esp.especialidad}
            </p>
            <div style={{ marginTop: '15px' }}>
              <StatusBadge status={esp.activo ? 'ACTIVO' : 'INACTIVO'} />
            </div>
          </motion.div>
        )) : (
          <div style={{ gridColumn: '1/-1', padding: '80px', textAlign: 'center', opacity: 0.2, border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '32px' }}>
            <Briefcase size={48} style={{ marginBottom: '20px' }} />
            <p style={{ fontWeight: 800, fontSize: '18px' }}>SIN EQUIPO REGISTRADO</p>
            <p style={{ fontSize: '14px' }}>Añade compañeros para habilitar la gestión multi-agenda.</p>
          </div>
        )}
      </div>
    </div>
  );
};