import React from 'react';
import { ArrowLeft, ArrowRight, Ban, Sparkles } from 'lucide-react';
import { useCalendarLogic } from '../hooks';
import { ActionButton } from '../components/Atoms';
import { THEME } from '../theme';

interface AgendaViewProps {
  onBlockSchedule: () => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ onBlockSchedule }) => {
  const { viewDate, setViewDate, moveMonth, year, month, daysInMonth, offset, monthName } = useCalendarLogic();

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* CABECERA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
            {monthName} {year}
          </h2>
          <p style={{ color: THEME.colors.text.muted, marginTop: '4px' }}>Gestión de citas y bloqueos</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            <button onClick={() => moveMonth(-1)} style={navBtnStyle}><ArrowLeft size={16} /></button>
            <button onClick={() => setViewDate(new Date())} style={navBtnStyle}>Hoy</button>
            <button onClick={() => moveMonth(1)} style={navBtnStyle}><ArrowRight size={16} /></button>
          </div>
          <ActionButton onClick={onBlockSchedule} variant="danger" icon={<Ban size={18} />}>
            Bloquear
          </ActionButton>
        </div>
      </div>

      {/* GRID CALENDARIO */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', 
        background: 'rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', border: `1px solid ${THEME.colors.border}` 
      }}>
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => (
          <div key={day} style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', fontSize: '11px', fontWeight: 800, color: THEME.colors.primary }}>
            {day}
          </div>
        ))}

        {/* Celdas vacías (Offset) */}
        {Array.from({ length: offset }).map((_, i) => <div key={`empty-${i}`} style={{ height: '120px', background: THEME.colors.surface }} />)}

        {/* Días */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const today = isToday(day);
          return (
            <div 
              key={day} 
              style={{ 
                height: '120px', padding: '15px', 
                background: today ? 'rgba(0,102,255,0.05)' : 'transparent', 
                position: 'relative', cursor: 'pointer', transition: '0.2s',
                borderTop: `1px solid ${THEME.colors.border}`
              }}
              className="calendar-cell-hover" // Asumiendo CSS global o styled-component para hover
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: today ? 900 : 500, color: today ? THEME.colors.primary : '#fff' }}>{day}</span>
                {today && <Sparkles size={12} color={THEME.colors.primary} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const navBtnStyle = { background: 'transparent', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' };