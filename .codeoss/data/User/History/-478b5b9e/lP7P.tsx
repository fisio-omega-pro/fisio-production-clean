useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🔍 Probando conexión con el motor...");
        const res = await fetch('/api/ping');
        const data = await res.json();
        console.log("✅ Motor Omega detectado:", data.message);
      } catch (err) {
        console.error("❌ ERROR CRÍTICO: El Dashboard no puede ver al servidor.");
      }
    };

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const token = params.get('token');
    
    if (token) localStorage.setItem('fisio_token', token);
    
    testConnection();
    refreshData();
  }, [refreshData]);