'use client'
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react';

export default function LandingFerrari() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f172a] overflow-x-hidden">
      
      {/* NAV CRISTAL */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 px-8 py-4 rounded-3xl border border-white/40 bg-white/60 backdrop-blur-2xl shadow-2xl flex justify-between items-center">
        <div className="text-xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0066ff] rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          FISIOTOOL <span className="text-[#0066ff] font-medium">PRO</span>
        </div>
        <div className="flex gap-4 items-center">
          <button className="bg-[#0066ff] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
            Probar Gratis
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-[#0066ff] text-[10px] uppercase tracking-widest font-black mb-8 shadow-sm"
          >
            <Sparkles size={14} /> IA CONDUCTUAL 2.5 • GRADO MÉDICO
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-[90px] font-black tracking-tighter mb-10 leading-[0.85] text-slate-900"
          >
            La Inteligencia que <br />
            <span className="text-[#0066ff]">Blinda tu Agenda.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-14 font-medium"
          >
            Ana no es un bot. Es tu recepcionista de élite: reconoce a tus pacientes, cobra fianzas y te devuelve <span className="text-slate-900 font-bold">1 hora de vida cada día</span>.
          </motion.p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-24">
             <button className="bg-slate-900 text-white px-10 py-5 rounded-[22px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#0066ff] transition-all shadow-2xl">
                Activar mi IA ahora <ArrowRight size={22} />
             </button>
             <button className="bg-white border border-slate-200 text-slate-900 px-10 py-5 rounded-[22px] font-bold text-lg hover:bg-slate-50 transition-all">
                Ver simulador ROI
             </button>
          </div>

          {/* VÍDEO FERRARI */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="absolute -inset-10 bg-blue-500/10 blur-[100px] rounded-full opacity-50"></div>
            <div className="relative aspect-video bg-slate-900 rounded-[40px] overflow-hidden border-[12px] border-white shadow-2xl">
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                    <Play className="text-[#0066ff] fill-[#0066ff] ml-1" size={28} />
                  </div>
                  <p className="mt-6 text-white font-bold tracking-widest text-xs uppercase opacity-80">Testimonio: Clínica del Dr. Murillo</p>
               </div>
               <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070" className="w-full h-full object-cover opacity-50" alt="Clinica" />
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 text-center text-slate-400 font-bold text-sm tracking-widest uppercase">
        FisioTool Pro | 2025
      </footer>
    </main>
  );
}