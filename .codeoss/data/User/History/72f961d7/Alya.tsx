'use client'
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Heart, ArrowRight, Play } from 'lucide-react';

export default function LandingFerrari() {
  return (
    <main className="min-h-screen">
      {/* HEADER SOBERANO */}
      <nav className="fixed top-0 w-full z-50 glass-effect py-4 px-8 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter text-blue-600">
          FISIOTOOL <span className="text-slate-900 font-light">PRO</span>
        </div>
        <div className="flex gap-6 items-center">
          <button className="text-sm font-bold text-slate-600 hover:text-blue-600 transition">Entrar</button>
          <button className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold btn-glow">
            Probar Gratis
          </button>
        </div>
      </nav>

      {/* HERO SECTION - El impacto inicial */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-6"
          >
            IA CONDUCTUAL 2.5 • GRADO MÉDICO
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
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

          {/* ÁREA DE VIDEO - DISEÑO FERRARI */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-4xl mx-auto group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-video bg-black rounded-[32px] overflow-hidden border border-white/20 shadow-2xl">
              {/* Aquí iría el iframe de YouTube que pondremos después */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 group-hover:bg-transparent transition duration-500 cursor-pointer">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                  <Play className="text-blue-600 fill-blue-600" />
                </div>
              </div>
            </div>
          </motion.h1>
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer className="py-10 text-center text-slate-400 text-sm">
        FisioTool Pro © 2025 • Diseñado para el Talento.
      </footer>
    </main>
  );
}