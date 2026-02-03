'use client';

import React from 'react';
import { UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleNav = (path: string) => {
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
            <button onClick={() => handleNav('/login')} style={styles.loginBtn}>
              <UserCircle size={16} /> ACCESO CLIENTES
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  navContainer: { position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'rgba(2,3,5,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  navContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', maxWidth: '1400px', margin: '0 auto' },
  logoBox: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  brandName: { fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' },
  desktopLinks: { display: 'flex', gap: '30px', alignItems: 'center' }, 
  loginBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800 },
};
