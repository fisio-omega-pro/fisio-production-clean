// ... (resto de imports se mantienen igual)

export default function DashboardOmega() {
  const [activeTab, setActiveTab] = useState<TabId>('agenda');
  const [modalType, setModalType] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Hook de datos (extracción de dependencias necesarias)
  const clinicId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || 'demo-clinic-id';
    }
    return 'demo-clinic-id';
  }, []);

  const { pacientes, balance, equipo, isLoading, refreshData } = useDashboardData(clinicId);
  const { toggleRecording, isRecording, transcript } = useVoiceAssistant(voiceEnabled);

  /**
   * EFECTO PRINCIPAL: Gestión de Conexión, Autenticación y Limpieza de URL
   */
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🔍 Probando conexión con el motor...");
        const res = await fetch('/api/ping');
        
        if (!res.ok) throw new Error('Servidor no responde correctamente');
        
        const data = await res.json();
        console.log("✅ Motor Omega detectado:", data.message);
      } catch (err) {
        console.error("❌ ERROR CRÍTICO: El Dashboard no puede ver al servidor.", err);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    // 1. Persistencia de credenciales
    if (token) {
      localStorage.setItem('fisio_token', token);
      console.log("🔑 Token de sesión actualizado.");
      
      // 2. Limpieza de URL (Seguridad: evita que el token quede en el historial o logs de red)
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // 3. Ejecución de procesos iniciales
    testConnection();
    refreshData();

  }, [refreshData]); // Se asume que refreshData es estable (useCallback)

  // ... (renderContent y JSX se mantienen igual)
  
  const renderContent = () => {
    if (isLoading) return <div className="p-10 opacity-50 animate-pulse">Sintonizando datos...</div>;

    switch (activeTab) {
      case 'agenda': return <AgendaView onBlockSchedule={() => setModalType('bloqueo')} />;
      case 'pacientes': return <PacientesView pacientes={pacientes} onDictate={() => setModalType('voz')} />;
      case 'finanzas': return <FinanzasView balance={balance} />;
      case 'equipo': return <EquipoView equipo={equipo} onAddMember={() => setModalType('equipo')} />;
      case 'asistente': return <AsistenteView />;
      case 'sedes': return <SedesView />;
      case 'cobros': return <CobrosView />;
      case 'referidos': return <ReferidosView />;
      case 'ajustes': return <AjustesView voiceEnabled={voiceEnabled} onToggleVoice={() => setVoiceEnabled(!voiceEnabled)} />;
      default: return <div>Módulo no encontrado</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} navItems={NAV_ITEMS}>
      {renderContent()}
      {/* ... modales ... */}
    </DashboardLayout>
  );
}