import React from 'react';
import { Users, Search, Mic, ChevronRight } from 'lucide-react';
import { Paciente } from '../types';
import { ActionButton, StatusBadge, InputField } from '../components/Atoms';
import { THEME } from '../theme';

interface PacientesViewProps {
  pacientes: Paciente[];
  onDictate: () => void;
}

export const PacientesView: React.FC<PacientesViewProps> = ({ pacientes, onDictate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Base de Pacientes</h2>
          <p style={{ color: THEME.colors.text.muted }}>{pacientes.length} expedientes activos</p>
        </div>
        <ActionButton onClick={onDictate} icon={<Mic size={18} />}>Dictar Nota</ActionButton>
      </div>

      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '15px', top: '15px', color: THEME.colors.text.disabled }} size={20} />
        <InputField placeholder="Buscar por nombre o DNI..." style={{ paddingLeft: '45px' }} />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: `1px solid ${THEME.colors.border}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.03)', fontSize: '11px', textTransform: 'uppercase', color: THEME.colors.text.muted }}>
            <tr>
              <th style={{ padding: '20px', textAlign: 'left' }}>Paciente</th>
              <th style={{ padding: '20px', textAlign: 'left' }}>Contacto</th>
              <th style={{ padding: '20px', textAlign: 'left' }}>Estado</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length > 0 ? pacientes.map((p) => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${THEME.colors.border}` }}>
                <td style={{ padding: '20px', fontWeight: 700 }}>{p.nombre}</td>
                <td style={{ padding: '20px', color: THEME.colors.text.muted }}>{p.telefono}</td>
                <td style={{ padding: '20px' }}><StatusBadge status={p.status} /></td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: THEME.colors.primary, cursor: 'pointer' }}>
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '80px', textAlign: 'center', opacity: 0.5 }}>
                  <Users size={48} style={{ marginBottom: '15px' }} />
                  <p>No hay pacientes registrados aún.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};