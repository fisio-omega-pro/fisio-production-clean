'use client';

import React, { useState, useEffect } from 'react';

// Importamos los componentes de Ingeniería (Bloques 1-4)
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import AnaDemo from '../components/landing/AnaDemo';
import RoiSection from '../components/landing/RoiSection';
import TestimonialsGallery from '../components/landing/TestimonialsGallery';
import Pricing from '../components/landing/Pricing';
import FaqSection from '../components/landing/FaqSection';
import TrustBar from '../components/landing/TrustBar';
import Footer from '../components/landing/Footer';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  // Efecto visual de fondo (Sutil y elegante)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) * 100, 
        y: (e.clientY / window.innerHeight) * 100 
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <main style={{ 
      backgroundColor: '#020305', 
      minHeight: '100vh', 
      color: '#fff', 
      fontFamily: '"Inter", sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* FONDO INTERACTIVO */}
      <div style={{ 
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', 
        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0, 102, 255, 0.08) 0%, transparent 40%)` 
      }} />

      {/* --- ESTRUCTURA MODULAR --- */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <Hero />
        <Features />
        <AnaDemo />
        <RoiSection />
        <TestimonialsGallery />
        <Pricing />
        <FaqSection />
        <TrustBar />
        <Footer />
      </div>

    </main>
  );
}
