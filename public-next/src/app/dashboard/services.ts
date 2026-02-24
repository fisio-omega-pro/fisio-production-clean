import { Paciente, BalanceFinanciero, Especialista } from './types';
import { API_BASE_URL } from '@/lib/apiBase';

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

  public async runRecaptacion(maxPerRun = 5): Promise<{ sent: number }> {
    const res = await this.request<{ success: boolean; sent?: number; clinics?: number; error?: string }>(
      '/api/dashboard/run-recaptacion',
      { method: 'POST', body: JSON.stringify({ maxPerRun }) }
    );
    return { sent: Number((res as any).sent || 0) };
  }

  public async getReferrals(): Promise<{ code: string; count: number; referred: any[] }> {
    const res = await this.request<{ success: boolean; code: string; count: number; referred: any[] }>(
      '/api/dashboard/referrals'
    );
    return { code: res.code, count: Number(res.count || 0), referred: Array.isArray(res.referred) ? res.referred : [] };
  }

  public async getLegalStatus(): Promise<any> {
    return await this.request('/api/dashboard/legal-status');
  }

  public async activateBonos(): Promise<void> {
    await this.request('/api/dashboard/activate-bonos', { method: 'POST' });
  }

  public async deactivateBonos(): Promise<void> {
    await this.request('/api/dashboard/deactivate-bonos', { method: 'POST' });
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
  public async uploadLogo(file: File): Promise<void> {
    const fd = new FormData();
    fd.append('logo', file);
    const res = await this.request<{ success: boolean; logo_url?: string }>('/api/dashboard/upload-logo', { method: 'POST', body: fd as any });
    if (!res?.success) throw new Error('No se pudo subir el logo.');
  }
  public async useDefaultLogo(): Promise<void> { await this.request('/api/dashboard/save-logo', { method: 'POST', body: JSON.stringify({ publicUrl: 'https://via.placeholder.com/150' }) }); }
  public async connectStripe(): Promise<string> { const res = await this.request<{ url: string }>('/api/dashboard/stripe-connect', { method: 'POST' }); return res.url; }
  public async verifyStripe(): Promise<void> { await this.request('/api/dashboard/stripe-verify', { method: 'POST' }); }
  public async verifySubscription(sessionId?: string): Promise<void> {
    await this.request('/api/dashboard/payment-verify', {
      method: 'POST',
      body: JSON.stringify(sessionId ? { sessionId } : {})
    });
  }
  public async upgradePlan(plan?: string): Promise<string> {
    const res = await this.request<{ url: string }>('/api/dashboard/upgrade-plan', {
      method: 'POST',
      body: JSON.stringify(plan ? { plan } : {})
    });
    return res.url;
  }

  /** Cancela la suscripción al final del periodo de facturación. Devuelve la fecha (Unix segundos) hasta la que tendrá acceso. */
  public async cancelSubscription(): Promise<{ cancel_at: number | null }> {
    const res = await this.request<{ success: boolean; cancel_at: number | null }>(
      '/api/dashboard/cancel-subscription',
      { method: 'POST' }
    );
    return { cancel_at: res.cancel_at ?? null };
  }
  public async createAppointment(d: any): Promise<void> { await this.request('/api/dashboard/appointment', { method: 'POST', body: JSON.stringify(d) }); }
  public async getPatientHistory(phone: string): Promise<{ paciente: any; historial: any[] }> {
    const res = await this.request<{ success: boolean; paciente: any; historial: any[] }>(
      `/api/dashboard/patient-history?phone=${encodeURIComponent(phone)}`
    );
    return { paciente: res.paciente, historial: res.historial || [] };
  }
  public async savePatientNote(patientId: string, content: string): Promise<void> {
    await this.request('/api/dashboard/save-note', { method: 'POST', body: JSON.stringify({ patientId, content }) });
  }
  public async saveSuggestion(text: string): Promise<void> {
    await this.request('/api/dashboard/save-suggestion', { method: 'POST', body: JSON.stringify({ text }) });
  }

  /** Crear ticket: type 'consulta' (Ana responde por email) o 'tecnico' (urgente a equipo). */
  public async createTicket(type: 'consulta' | 'tecnico', message: string): Promise<{ ticketId: string }> {
    const res = await this.request<{ success: boolean; ticketId: string }>(
      '/api/dashboard/create-ticket',
      { method: 'POST', body: JSON.stringify({ type, message: message.trim() }) }
    );
    return { ticketId: res.ticketId || '' };
  }

  public async updateSettings(nombre: string, email: string): Promise<void> {
    await this.request('/api/dashboard/update-settings', { method: 'POST', body: JSON.stringify({ nombre, email }) });
  }

  public async uploadLogo(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('logo', file);
    await this.request('/api/dashboard/upload-logo', { 
      method: 'POST', 
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });
  }
}

export const dashboardAPI = DashboardService.getInstance();
