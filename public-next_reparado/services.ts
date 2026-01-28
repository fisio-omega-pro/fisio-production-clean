import { Paciente, BalanceFinanciero, Especialista } from './types';

// 🛡️ REPARACIÓN QUIRÚRGICA: 
// Al dejar esto vacío, el frontend usará la URL actual de Cloud Shell.
// Esto elimina los errores de CORS y asegura que hable con tu backend local.
const API_BASE_URL = ""; 

class DashboardService {
  private static instance: DashboardService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  public setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fisio_token', token);
    }
  }

  public getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fisio_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    
    // Si no hay token, no podemos seguir (Esto previene el 401 antes de llamar)
    if (!token) {
        console.warn("⚠️ [DashboardService] Intentando llamar sin Token.");
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      // 🚨 Usamos la ruta relativa /api/...
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ [DashboardService] Fallo en ${endpoint}:`, error);
      throw error;
    }
  }

  public async getPacientes(): Promise<Paciente[]> {
    return this.request<Paciente[]>('/api/dashboard/pacientes');
  }

  public async getBalance(): Promise<BalanceFinanciero> {
    return this.request<BalanceFinanciero>('/api/dashboard/balance');
  }

  public async getEquipo(clinicId: string): Promise<Especialista[]> {
    // Nota: El backend ya saca el clinicId del Token, pero mantenemos el parámetro por compatibilidad
    return this.request<Especialista[]>('/api/dashboard/equipo');
  }
}

export const dashboardAPI = DashboardService.getInstance();