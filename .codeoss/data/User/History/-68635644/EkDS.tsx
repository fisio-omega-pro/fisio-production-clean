import React from 'react';
import { motion } from 'framer-motion';
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
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'ghost';
  fullWidth?: boolean;
  icon?: React.ReactNode;
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

// --- 3. INPUTS ESTILIZADOS ---
export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    style={{
      width: '100%',
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${THEME.colors.border}`,
      padding: '15px',
      borderRadius: THEME.layout.radius.button,
      color: '#fff',
      outline: 'none',
      marginBottom: '10px',
      ...props.style
    }}
    {...props}
  />
);

// --- 4. BADGES (ETIQUETAS) ---
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status === 'ACTIVO' || status === 'Activo';
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '100px',
      fontSize: '10px',
      fontWeight: 800,
      background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
      color: isActive ? THEME.colors.success : THEME.colors.text.muted,
      textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
};