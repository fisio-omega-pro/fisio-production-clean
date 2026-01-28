'use client';
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sparkles, User, Bell, ChevronRight, Menu, X } from 'lucide-react';
import { THEME } from '../theme';
import { TabId, NavItemConfig } from '../types';

const NavButton = React.memo(({ item, isActive, onClick }: { item: NavItemConfig; isActive: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.04)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      width: '100%', padding: '10px 12px', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '13px', position: 'relative', transition: 'all 0.2s', textAlign: 'left',
      color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
      background: isActive ? 'rgba(0,102,255,0.1)' : 'transparent',
    }}
  >
    <item.icon size={18} style={{ color: isActive ? '#0066ff' : 'inherit', filter: isActive ? 'drop-shadow(0 0 8px #0066ff80)' : 'none' }} />
    <span style={{ flex: 1, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
    <AnimatePresence>{isActive && <motion.div layoutId="sidebar-active-pill" style={{ position: 'absolute', left: '-12px', width: '3px', height: '16px', background: '#0066ff', borderRadius: '0 4px 4px 0', boxShadow: '0 0 10px #0066ff' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}</AnimatePresence>
  </motion.button>
));

export const DashboardLayout = ({ children, activeTab, onTabChange, navItems }: any) => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const date = useMemo(() => new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), []);
  return (
    <div className="flex h-screen w-screen bg-[#030507] text-white overflow-hidden font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-white/5 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20"><Sparkles size={18}/></div>
          <span className="font-black tracking-tighter text-lg uppercase">Fisiotool <span className="text-blue-500 font-light">Pro</span></span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          {Object.entries(navItems).map(([group, items]: any) => (
            <div key={group}>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 px-2">{group}</p>
              <div className="space-y-1">
                {items.map((item: NavItemConfig) => (
                  <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => { onTabChange(item.id); setIsMobileOpen(false); }} />
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><User size={14} color="#fff"/></div>
             <div className="flex-1"><div className="text-xs font-bold">Mi Clínica</div><div className="text-[9px] text-gray-500 uppercase">Premium Plan</div></div>
             <button onClick={() => window.location.href = '/login'} className="p-1 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#030507]">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md">
          <button className="lg:hidden" onClick={() => setIsMobileOpen(!isMobileOpen)}><Menu /></button>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dashboard / <span className="text-white">{activeTab}</span></div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600"><span>{date}</span><Bell size={16} /></div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">{children}</main>
      </div>
    </div>
  );
};
