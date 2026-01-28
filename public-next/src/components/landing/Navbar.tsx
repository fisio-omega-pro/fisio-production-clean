'use client';

import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNav = (path: string) => {
    setIsOpen(false); 
    router.push(path);
  };

  return (
    <>
      <nav style={styles.navContainer}>
        <div style={styles.navContent}>
          
          <div style={styles.logoBox} onClick={() => router.push('/')}>
            <img src="/logo_fisiotool.png" alt="Logotipo Fisiotool Pro" style={{ height: '36px', width: 'auto' }} />
            <span style={styles.brandName}>FISIOTOOL <span style={{ color: '#0066ff' }}>PRO</span></span>
          </div>

          <div style={styles.desktopLinks}>
            <a href="#ventajas" style={styles.link}>Soluciones</a>
            <a href="#demo" style={styles.link}>Demo IA</a>
            <a href="#precios" style={styles.link}>Planes</a>
            <button onClick={() => handleNav('/login')} style={styles.loginBtn}>
              <UserCircle size={16} /> ACCESO CLIENTES
            </button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} style={styles.mobileToggle}>
            {isOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div style={styles.mobileMenu}>
          <a onClick={() => handleNav('#ventajas')} style={styles.mobileLink}>Soluciones</a>
          <a onClick={() => handleNav('#demo')} style={styles.mobileLink}>Demo Interactiva</a>
          <a onClick={() => handleNav('#precios')} style={styles.mobileLink}>Precios y Planes</a>
          <div style={styles.mobileDivider} />
          <button onClick={() => handleNav('/login')} style={styles.mobileBtnFull}>
            ACCEDER AL DASHBOARD
          </button>
          <button onClick={() => handleNav('/setup')} style={styles.mobileBtnAccent}>
            CREAR CUENTA GRATIS
          </button>
        </div>
      )}
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  navContainer: { position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'rgba(2,3,5,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  navContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', maxWidth: '1400px', margin: '0 auto' },
  logoBox: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  brandName: { fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
  desktopLinks: { display: 'flex', gap: '30px', alignItems: 'center' }, 
  link: { color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: '0.2s', textTransform: 'uppercase' },
  loginBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800 },
  mobileToggle: { background: 'none', border: 'none', cursor: 'pointer', display: 'none' }, 
  mobileMenu: { position: 'fixed', top: '70px', left: 0, width: '100%', height: 'calc(100vh - 70px)', background: '#020305', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 999 },
  mobileLink: { fontSize: '24px', fontWeight: 800, color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' },
  mobileDivider: { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0' },
  mobileBtnFull: { width: '100%', padding: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: 800, fontSize: '16px' },
  mobileBtnAccent: { width: '100%', padding: '15px', background: '#0066ff', border: 'none', color: '#fff', borderRadius: '12px', fontWeight: 800, fontSize: '16px' }
};
