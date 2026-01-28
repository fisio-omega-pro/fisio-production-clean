'use client'
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, ArrowRight, Play, Star } from 'lucide-react';

export default function LandingFerrari() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER GLASSMORPHISM */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-bottom border-slate-200 py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-blue-600">
          FISIOTOOL <span className="text-slate-900 font-light">PRO</span>
        </div>
        <div className="flex gap-6 items-center">
          <button className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">Entrar</button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:scale-105 transition-transform">
            Probar Gratis
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6"
          >
            <Star size={12} fill="currentColor" /> IA CONDUCTUAL 2.5 • GRADO MÉDICO
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-slate-900"
          >
            La Inteligencia que <br />
            <span className="text-blue-600">Blinda tu Agenda.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-12"
          >
            Ana no es un bot. Es tu nueva recepcionista de élite que reconoce pacientes, cobra fianzas y te devuelve 1 hora de vida al día.
          </motion.p>

          <div className="flex justify-center gap-4 mb-20">
             <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition">
                Activar mi IA ahora <ArrowRight size={20} />
             </button>
             <button className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition">
                Ver simulador ROI
             </button>
          </div>

          {/* ÁREA DE VIDEO CORREGIDA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute -inset-4 bg-blue-600/5 blur-3xl rounded-[40px]"></div>
            <div className="relative aspect-video bg-slate-900 rounded-[32px] overflow-hidden border border-slate-200 shadow-2xl flex items-center justify-center">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                  <Play className="text-blue-600 fill-blue-600 ml-1" />
               </div>
               <p className="absolute bottom-6 text-white/40 text-sm font-medium">Testimonio: Clínica del Dr. Murillo</p>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-10 text-center text-slate-400 text-sm border-t border-slate-100">
        FisioTool Pro © 2025 • Diseñado para el Talento.
      </footer>
    </main>
  );
}