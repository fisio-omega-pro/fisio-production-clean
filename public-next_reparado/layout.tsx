import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Sparkles, LucideIcon } from 'lucide-react';
import { THEME } from '../theme';
import { TabId } from '../types';

export interface NavItemConfig {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  items: Record<string, NavItemConfig[]>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, items }) => (
  <aside style={{
    ...THEME.effects.glassSidebar, width: THEME.layout.sidebarWidth,
    padding: '40px 24px', display: 'flex', flexDirection: 'column',
    zIndex: 100, height: '100vh', position: 'sticky', top: 0
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', paddingLeft: '8px' }}>
      <div style={{ width: '40px', height: '40px', background: THEME.colors.primary, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Sparkles size={20} color="#fff" />
      </div>
      <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>FISIOTOOL PRO</span>
    </div>

    <nav style={{ flex: 1, overflowY: 'auto' }}>
      {Object.entries(items).map(([group, navItems]) => (
        <div key={group} style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: THEME.colors.text.disabled, textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '12px' }}>{group}</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%', padding: '12px 15px', borderRadius: '12px', border: 'none',
                background: activeTab === item.id ? 'rgba(0,102,255,0.1)' : 'transparent',
                color: activeTab === item.id ? '#fff' : THEME.colors.text.muted,
                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                fontWeight: activeTab === item.id ? 700 : 500, textAlign: 'left', marginBottom: '4px'
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  </aside>
);

export const DashboardLayout: React.FC<{
  children: React.ReactNode;
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
  navItems: Record<string, NavItemConfig[]>;
}> = ({ children, activeTab, onTabChange, navItems }) => (
  <div style={{ background: THEME.colors.background, minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
    <Sidebar activeTab={activeTab} onTabChange={onTabChange} items={navItems} />
    <main style={{ flex: 1, padding: '40px', position: 'relative', overflowY: 'auto', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '-100px', left: '100px', width: '600px', height: '600px', background: `radial-gradient(circle, ${THEME.colors.primary}10 0%, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>{children}</div>
    </main>
  </div>
);