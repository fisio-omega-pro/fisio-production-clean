'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, TrendingUp, MessageSquare, LogOut, 
  Sparkles, PlusCircle, CreditCard, Gift, Mic, 
  ChevronRight, Copy, X, Save, Smartphone, 
  Volume2, VolumeX, ShieldCheck, PieChart, Ban, Info, Landmark, 
  CheckCircle, Briefcase, UserPlus, Bell, ArrowRight, ArrowLeft
} from 'lucide-react';

// --- CONFIGURACIÓN DE CONEXIÓN AL MOTOR V14 (index.js) ---
const API_BASE = "https://fisiotool-1050901900632.us-central1.run.app";

// --- INTERFACES PARA EL COMPILADOR (CALIBRACIÓN NASA) ---
interface Especialista { id: string; nombre: string; especialidad: string; activo: boolean; }
interface Paciente { id: string; nombre: string; telefono: string; email: string; ultima_visita?: any; }

export default function DashboardOmega() {
  // 1. ESTADOS DE NAVEGACIÓN
  const [activeTab, setActiveTab] = useState('agenda');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  // 2. ESTADOS DE DATOS (CONECTADOS AL MOTOR)
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [equipo, setEquipo] = useState<Especialista[]>([]);
  const [balance, setBalance] = useState({ real: 0, potencial: 0, roi: 0 });

  // 3. ESTADOS DE FUNCIONALIDAD SUPREME
  const [narratorActive, setNarratorActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [anaInput, setAnaInput] = useState("");
  const [anaChat, setAnaChat] = useState([{ role: 'ana', text: 'Hola, soy tu consultora estratégica. ¿Qué analizamos hoy?' }]);

  // --- 🔊 MOTOR DE NARRACIÓN (ACCESIBILIDAD) ---
  const narrar = (texto: string) => {
    if (narratorActive && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(texto);
      msg.lang = 'es-ES';
      window.speechSynthesis.speak(msg);
    }
  };

  // --- 🛰️ CARGA DE DATOS (SINCRO CON EL SERVIDOR) ---
  const loadData = async (id: string) => {
    const token = localStorage.getItem('fisio_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [resP, resB, resE] = await Promise.all([
        fetch(`${API_BASE}/api/dashboard/pacientes`, { headers }),
        fetch(`${API_BASE}/api/dashboard/balance`, { headers }),
        fetch(`${API_BASE}/api/dashboard/equipo?clinic_id=${id}`, { headers })
      ]);
      
      if (resP.ok) setPacientes(await resP.json());
      if (resB.ok) setBalance(await resB.json());
      if (resE.ok) setEquipo(await resE.json());
    } catch (e) { 
      console.error("❌ Fallo en la sintonía de datos."); 
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const tokenUrl = params.get('token');
    
    if (tokenUrl) localStorage.setItem('fisio_token', tokenUrl);
    if (id) {
      setClinicId(id);
      loadData(id);
    }
  }, []);

  // Aquí terminamos el Bloque 1 de infraestructura.