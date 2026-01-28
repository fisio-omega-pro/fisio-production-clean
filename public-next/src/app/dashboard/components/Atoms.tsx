import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { THEME, commonStyles } from '../theme';
import { BaseComponentProps } from '../types';

// --- 1. TARJETAS (GLASSMORPHISM) ---
interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<CardProps> = ({ children, style, hoverEffect, className }) => (
  <motion.div
    whileHover={hoverEffect ? { y: -5 } : undefined}
    style={{
      ...THEME.effects.glass,
      borderRadius: THEME.layout.radius.card,
      padding: '30px',
      color: THEME.colors.text.main,
      ...style
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- 2. BOTONES DE ACCIÓN ---
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', fullWidth, icon, style, ...props 
}) => {
  const getBg = () => {
    switch(variant) {
      case 'danger': return THEME.colors.danger;
      case 'success': return THEME.colors.success;
      case 'ghost': return 'rgba(255,255,255,0.05)';
      default: return THEME.colors.primary;
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      style={{
        ...commonStyles.flexCenter,
        background: getBg(),
        width: fullWidth ? '100%' : 'auto',
        padding: '12px 20px',
        borderRadius: THEME.layout.radius.button,
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        gap: '10px',
        ...style
      }}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
};

// --- 3. INPUTS ESTILIZADOS (AUDITADO Y CORREGIDO) ---
// Definimos exactamente qué aceptamos para evitar errores de TypeScript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  icon?: React.ReactNode;
  onChange?: (value: string) => void; // Forzamos a que devuelva un string, no un evento
}

export const InputField: React.FC<InputProps> = ({ label, icon, onChange, style, ...props }) => (
  <div style={{ marginBottom: '15px', width: '100%' }}>
    {/* 1. Renderizado del Label */}
    {label && (
      <label style={{ 
        display: 'block', 
        fontSize: '11px', 
        fontWeight: 700, 
        color: '#9ca3af', 
        marginBottom: '6px', 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px' 
      }}>
        {label}
      </label>
    )}
    
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* 2. Renderizado del Icono */}
      {icon && (
        <div style={{ position: 'absolute', left: '12px', color: '#9ca3af', pointerEvents: 'none', display: 'flex' }}>
          {icon}
        </div>
      )}
      
      <input
        {...props}
        // 3. Interceptamos el evento para devolver solo el valor (Solución al error lógico)
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.07)', // Fondo visible
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px 16px',
          paddingLeft: icon ? '40px' : '16px', // Espacio para el icono si existe
          borderRadius: '10px',
          color: '#fff',
          outline: 'none',
          fontSize: '14px',
          colorScheme: 'dark', // 4. Solución al calendario invisible
          ...style
        }}
        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
      />
    </div>
  </div>
);

// --- 4. BADGES (ETIQUETAS) ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status ? status.toString().toUpperCase() : 'N/A';
  const isActive = s === 'ACTIVO' || s === 'CONFIRMADA' || s === 'PAGADA';
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '10px',
      fontWeight: 800,
      background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
      color: isActive ? '#34d399' : '#9ca3af',
      textTransform: 'uppercase',
      border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.1)'
    }}>
      {s}
    </span>
  );
};
