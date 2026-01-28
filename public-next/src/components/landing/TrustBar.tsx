'use client';
import React from 'react';
import { ShieldCheck, Lock, Scale, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrustBar() {
  const router = useRouter();
  return (
    <section style={{ padding: '140px 5%', background: 'linear-gradient(180deg, #020305 0%, #050a14 100%)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <small style={{color:'#0066ff', fontWeight:900, letterSpacing:'4px'}}>CERTIFICACIÓN DE SEGURIDAD</small>
        <h2 style={{ fontSize: '48px', fontWeight: 900, color: '#fff', marginBottom: '80px', marginTop: '20px' }}>Infraestructura Inquebrantable.</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '100px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '50px 40px', borderRadius: '40px', textAlign: 'left' }}>
            <div style={{width:'50px', height:'50px', background:'rgba(0,102,255,0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'30px'}}>
              <Lock size={24} color="#0066ff" />
            </div>
            <h4 style={{color:'#fff', marginBottom:'15px', fontWeight: 800, fontSize: '20px'}}>Cifrado Grado Militar</h4>
            <p style={{fontSize:'15px', color:'rgba(255,255,255,0.5)', lineHeight: '1.8'}}>Implementamos protocolos AES-256 de extremo a extremo. Los historiales clínicos permanecen cifrados en reposo y en tránsito, garantizando que solo el profesional autorizado posea la clave de lectura.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '50px 40px', borderRadius: '40px', textAlign: 'left' }}>
            <div style={{width:'50px', height:'50px', background:'rgba(16,185,129,0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'30px'}}>
              <ShieldCheck size={24} color="#10b981" />
            </div>
            <h4 style={{color:'#fff', marginBottom:'15px', fontWeight: 800, fontSize: '20px'}}>Blindaje Jurídico RGPD</h4>
            <p style={{fontSize:'15px', color:'rgba(255,255,255,0.5)', lineHeight: '1.8'}}>Cumplimiento exhaustivo del Reglamento General de Protección de Datos y directivas DPA Salud de la UE. Actuamos como Encargados de Tratamiento certificados, blindando su responsabilidad legal ante auditorías.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '50px 40px', borderRadius: '40px', textAlign: 'left' }}>
            <div style={{width:'50px', height:'50px', background:'rgba(56,189,248,0.1)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'30px'}}>
              <Scale size={24} color="#38bdf8" />
            </div>
            <h4 style={{color:'#fff', marginBottom:'15px', fontWeight: 800, fontSize: '20px'}}>Soberanía de Datos UE</h4>
            <p style={{fontSize:'15px', color:'rgba(255,255,255,0.5)', lineHeight: '1.8'}}>Garantizamos que el 100% de su información clínica se aloja en centros de datos de alta disponibilidad dentro de territorio europeo, prohibiendo transferencias internacionales de datos no autorizadas.</p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,0,0,0) 100%)', padding: '80px 40px', borderRadius: '50px', border: '1px solid rgba(0,102,255,0.3)', boxShadow: '0 30px 60px -20px rgba(0,0,0,0.5)' }}>
          <h3 style={{color:'#fff', fontSize:'36px', marginBottom:'25px', fontWeight: 900}}>Comience hoy su transformación digital.</h3>
          <p style={{color:'rgba(255,255,255,0.5)', fontSize:'18px', marginBottom:'40px'}}>Active su licencia Profesional y descubra el impacto de la Inteligencia Conductual.</p>
          <button onClick={() => router.push('/setup')} style={{ background: '#0066ff', color: '#fff', border: 'none', padding: '22px 60px', borderRadius: '100px', fontWeight: 900, cursor: 'pointer', fontSize: '18px', display:'inline-flex', alignItems:'center', gap:'12px', boxShadow:'0 20px 40px -10px rgba(0,102,255,0.4)' }}>
            EMPEZAR PRUEBA GRATUITA <ArrowRight size={20}/>
          </button>
        </div>
      </div>
    </section>
  );
}
