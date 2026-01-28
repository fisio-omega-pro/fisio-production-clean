import { Paciente, BalanceFinanciero, Especialista } from './types';

const API_BASE_URL = ""; 

class DashboardService {
  private static instance: DashboardService;
  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) DashboardService.instance = new DashboardService();
    return DashboardService.instance;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('fisio_token');
    const headers: any = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };
    if (options.body instanceof FormData) delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  }

  public async getDashboardData(): Promise<any> {
    const res = await this.request<{ success: boolean, data: any }>('/api/dashboard/data');
    return res.data;
  }

  // 🚀 MUNICIÓN OPERATIVA (NUEVO)
  public async launchCampaign(): Promise<void> {
    await this.request('/api/dashboard/launch-campaign', { method: 'POST' });
  }

  public async activateBonos(): Promise<void> {
    await this.request('/api/dashboard/activate-bonos', { method: 'POST' });
  }

  public async createBono(bono: any): Promise<void> {
    await this.request('/api/dashboard/create-bono', { 
      method: 'POST', 
      body: JSON.stringify({ bono }) 
    });
  }

  // --- RESTO DE FUNCIONES (Integridad Total) ---
  public async importPatients(patients: any[]): Promise<number> {
    const res = await this.request<{ success: boolean, count: number }>('/api/dashboard/import-patients', { method: 'POST', body: JSON.stringify({ patients }) });
    return res.count;
  }
  public async addSede(sede: any): Promise<void> { await this.request('/api/dashboard/add-sede', { method: 'POST', body: JSON.stringify({ sede }) }); }
  public async saveSpecialist(specialist: any): Promise<void> { await this.request('/api/dashboard/save-specialist', { method: 'POST', body: JSON.stringify({ specialist }) }); }
  public async uploadLogo(file: File): Promise<void> { await this.request('/api/dashboard/save-logo', { method: 'POST', body: JSON.stringify({ publicUrl: 'https://via.placeholder.com/150' }) }); }
  public async useDefaultLogo(): Promise<void> { await this.request('/api/dashboard/save-logo', { method: 'POST', body: JSON.stringify({ publicUrl: 'https://via.placeholder.com/150' }) }); }
  public async connectStripe(): Promise<string> { const res = await this.request<{ url: string }>('/api/dashboard/stripe-connect', { method: 'POST' }); return res.url; }
  public async verifyStripe(): Promise<void> { await this.request('/api/dashboard/stripe-verify', { method: 'POST' }); }
  public async verifySubscription(): Promise<void> { await this.request('/api/dashboard/payment-verify', { method: 'POST' }); }
  public async upgradePlan(): Promise<string> { const res = await this.request<{url:string}>('/api/dashboard/upgrade-plan', {method:'POST'}); return res.url; }
  public async createAppointment(d: any): Promise<void> { await this.request('/api/dashboard/appointment', { method: 'POST', body: JSON.stringify(d) }); }
  public async getPatientHistory(phone: string): Promise<any> { return { paciente: { nombre: 'Demo', telefono: phone }, historial: [] }; }
  public async savePatientNote(p: string, c: string): Promise<void> { await this.request('/api/dashboard/save-note', { method: 'POST', body: JSON.stringify({ p, c }) }); }
}

export const dashboardAPI = DashboardService.getInstance();
