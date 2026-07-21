export type UserRole = 'admin' | 'technician';

export interface User {
  id: string;
  email: string;
  nom: string;
  role: UserRole;
  specialite?: string;
  telephone?: string;
  dateCreation: string;
  actif: boolean;
}

export type MachineStatus = 'OK' | 'Warning' | 'Critical' | 'Stopped';

export interface Machine {
  id: string;
  nom: string;
  emplacement: string;
  typeCapteur: string;
  enExecution: boolean;
  statut: MachineStatus;
  derniereMiseAJour: string;
}

export interface SensorReading {
  timestamp: string;
  machineId: string;
  machineNom: string;
  temperature: number; // °C
  pression: number;    // bar
  vibration: number;   // mm/s
  scoreAnomalie: number; // Isolation Forest Anomaly Score (-1 to 1)
  statut: MachineStatus; // OK, Warning, Critical
}

export interface SensorDataFile {
  lastUpdated: string;
  activeCount: number;
  readings: SensorReading[];
}

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  machineId: string;
  machineNom: string;
  statut: 'Warning' | 'Critical';
  temperature: number;
  pression: number;
  vibration: number;
  scoreAnomalie: number;
  description: string;
}

export interface PythonStatus {
  isRunning: boolean;
  pid?: number;
  startedAt?: string;
  lastExecutionTime?: string;
  sampleCount: number;
  algorithm: string; // "Isolation Forest (Scikit-Learn)"
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
