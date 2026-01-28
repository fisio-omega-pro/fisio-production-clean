import { Paciente, BalanceFinanciero, Especialista } from './types';

// En producción, esto debe ir en .env.local
const API_BASE_URL = "https://fisiotool-1050901900632.us-central1.run.app";

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error API: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[DashboardService] Fallo en ${endpoint}:`, error);
      throw error;
    }
  }

  // --- Endpoints ---

  public async getPacientes(): Promise<Paciente[]> {
    // Si falla, devuelve array vacío para no romper la UI
    try {
        return await this.request<Paciente[]>('/api/dashboard/pacientes');
    } catch { return []; }
  }

  public async getBalance(): Promise<BalanceFinanciero> {
    try {
        return await this.request<BalanceFinanciero>('/api/dashboard/balance');
    } catch { return { real: 0, potencial: 0, roi: 0, tendenciaMensual: 0 }; }
  }

  public async getEquipo(clinicId: string): Promise<Especialista[]> {
    try {
        return await this.request<Especialista[]>(`/api/dashboard/equipo?clinic_id=${clinicId}`);
    } catch { return []; }
  }
}

export const dashboardAPI = DashboardService.getInstance();