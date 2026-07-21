import {
  User,
  Machine,
  AnomalyRecord,
  SensorDataFile,
  PythonStatus,
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Erreur lors de la requête API.');
  }

  return data;
}

export const api = {
  // Login
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    return res;
  },

  // Machines
  async getMachines(): Promise<Machine[]> {
    const res = await request<{ success: boolean; machines: Machine[] }>('/api/machines');
    return res.machines;
  },

  async createMachine(data: { nom: string; emplacement: string; typeCapteur?: string }): Promise<Machine> {
    const res = await request<{ success: boolean; machine: Machine }>('/api/machines', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.machine;
  },

  async updateMachine(id: string, data: Partial<Machine>): Promise<Machine> {
    const res = await request<{ success: boolean; machine: Machine }>(`/api/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.machine;
  },

  async deleteMachine(id: string): Promise<void> {
    await request(`/api/machines/${id}`, { method: 'DELETE' });
  },

  async toggleMachine(id: string): Promise<Machine> {
    const res = await request<{ success: boolean; machine: Machine }>(
      `/api/machines/${id}/toggle`,
      { method: 'POST' }
    );
    return res.machine;
  },

  // Technicians
  async getTechnicians(): Promise<User[]> {
    const res = await request<{ success: boolean; technicians: User[] }>('/api/technicians');
    return res.technicians;
  },

  async createTechnician(data: {
    nom: string;
    email: string;
    password: string;
    specialite?: string;
    telephone?: string;
  }): Promise<User> {
    const res = await request<{ success: boolean; technician: User }>('/api/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.technician;
  },

  async updateTechnician(id: string, data: Partial<User & { password?: string }>): Promise<User> {
    const res = await request<{ success: boolean; technician: User }>(
      `/api/technicians/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.technician;
  },

  async deleteTechnician(id: string): Promise<void> {
    await request(`/api/technicians/${id}`, { method: 'DELETE' });
  },

  // History
  async getHistory(): Promise<AnomalyRecord[]> {
    const res = await request<{ success: boolean; history: AnomalyRecord[] }>('/api/history');
    return res.history;
  },

  async clearHistory(): Promise<void> {
    await request('/api/history', { method: 'DELETE' });
  },

  // Sensors JSON
  async getSensorData(): Promise<SensorDataFile> {
    const res = await request<{ success: boolean; sensorData: SensorDataFile }>('/api/sensors');
    return res.sensorData;
  },

  // Python Script
  async getPythonStatus(): Promise<PythonStatus> {
    const res = await request<{ success: boolean; status: PythonStatus }>('/api/python/status');
    return res.status;
  },

  async startPython(): Promise<{ success: boolean; message: string }> {
    return await request('/api/python/start', { method: 'POST' });
  },

  async stopPython(): Promise<{ success: boolean; message: string }> {
    return await request('/api/python/stop', { method: 'POST' });
  },

  // DB Schema & tables for phpMyAdmin viewer
  async getDbSchema(): Promise<{
    tables: { users: User[]; machines: Machine[]; history: AnomalyRecord[] };
    sqlSchema: string;
  }> {
    return await request('/api/database/schema');
  },
};
