import fs from 'fs';
import path from 'path';
import { User, Machine, AnomalyRecord } from '../../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MACHINES_FILE = path.join(DATA_DIR, 'machines.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Data Initialization with MySQL Schema structure
function initDatabase() {
  ensureDataDir();

  // Initial Users
  if (!fs.existsSync(USERS_FILE)) {
    const initialUsers: (User & { passwordHash: string })[] = [
      {
        id: 'usr_admin',
        email: 'admin@redatlas.fr',
        passwordHash: 'admin123', // In prod, hashed with bcrypt
        nom: 'Administrateur RedAtlas',
        role: 'admin',
        specialite: 'Gestion Système IoT',
        telephone: '+33 6 12 34 56 78',
        dateCreation: '2026-01-15 09:00:00',
        actif: true,
      },
      {
        id: 'usr_tech1',
        email: 'tech@redatlas.fr',
        passwordHash: 'tech123',
        nom: 'Jean Dupont',
        role: 'technician',
        specialite: 'Maintenance Capteurs Vibratoires',
        telephone: '+33 6 98 76 54 32',
        dateCreation: '2026-02-01 10:30:00',
        actif: true,
      },
      {
        id: 'usr_tech2',
        email: 'martin@redatlas.fr',
        passwordHash: 'tech123',
        nom: 'Claire Martin',
        role: 'technician',
        specialite: 'Analyse Thermique & Pression',
        telephone: '+33 6 55 44 33 22',
        dateCreation: '2026-03-10 14:15:00',
        actif: true,
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
  }

  // Initial Machines (Max 10)
  if (!fs.existsSync(MACHINES_FILE)) {
    const initialMachines: Machine[] = [
      {
        id: 'M001',
        nom: 'Presse Hydraulique A1',
        emplacement: 'Atelier Métallurgie - Zone A',
        typeCapteur: 'Pression & Vibration',
        enExecution: true,
        statut: 'OK',
        derniereMiseAJour: new Date().toISOString(),
      },
      {
        id: 'M002',
        nom: 'Compresseur Principal C2',
        emplacement: 'Local Technique Est',
        typeCapteur: 'Température & Pression',
        enExecution: true,
        statut: 'OK',
        derniereMiseAJour: new Date().toISOString(),
      },
      {
        id: 'M003',
        nom: 'Turbine de Refroidissement T3',
        emplacement: 'Unité Thermique Sud',
        typeCapteur: 'Vibration & Vitesse',
        enExecution: true,
        statut: 'Warning',
        derniereMiseAJour: new Date().toISOString(),
      },
      {
        id: 'M004',
        nom: 'Motoréducteur M-40',
        emplacement: 'Ligne d\'Assemblage 2',
        typeCapteur: 'Température & Courant',
        enExecution: true,
        statut: 'OK',
        derniereMiseAJour: new Date().toISOString(),
      },
      {
        id: 'M005',
        nom: 'Pompe d\'Extraction P5',
        emplacement: 'Station de Filtration',
        typeCapteur: 'Débit & Vibration',
        enExecution: false,
        statut: 'Stopped',
        derniereMiseAJour: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(MACHINES_FILE, JSON.stringify(initialMachines, null, 2), 'utf-8');
  }

  // Initial History (Warning & Critical events only)
  if (!fs.existsSync(HISTORY_FILE)) {
    const initialHistory: AnomalyRecord[] = [
      {
        id: 'hist_101',
        timestamp: '2026-07-21 11:20:14',
        machineId: 'M003',
        machineNom: 'Turbine de Refroidissement T3',
        statut: 'Warning',
        temperature: 72.4,
        pression: 4.8,
        vibration: 3.1,
        scoreAnomalie: 0.12,
        description: 'Vibration anormale détectée par Isolation Forest (Seuil Warning dépassé : 3.1 mm/s)',
      },
      {
        id: 'hist_102',
        timestamp: '2026-07-21 10:05:42',
        machineId: 'M001',
        machineNom: 'Presse Hydraulique A1',
        statut: 'Critical',
        temperature: 88.2,
        pression: 6.7,
        vibration: 4.9,
        scoreAnomalie: -0.48,
        description: 'Surchauffe sévère et surpression critique (Temp > 80°C, Pression > 6.0 bar)',
      },
      {
        id: 'hist_103',
        timestamp: '2026-07-20 16:45:10',
        machineId: 'M002',
        machineNom: 'Compresseur Principal C2',
        statut: 'Warning',
        temperature: 69.1,
        pression: 4.9,
        vibration: 2.3,
        scoreAnomalie: 0.18,
        description: 'Température de carter au-dessus du seuil nominal',
      },
    ];
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(initialHistory, null, 2), 'utf-8');
  }
}

// Execute initialization
initDatabase();

// --- Database Operations ---

export function getUsers(): (User & { passwordHash?: string })[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveUsers(users: (User & { passwordHash?: string })[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export function getMachines(): Machine[] {
  try {
    const data = fs.readFileSync(MACHINES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveMachines(machines: Machine[]) {
  ensureDataDir();
  fs.writeFileSync(MACHINES_FILE, JSON.stringify(machines, null, 2), 'utf-8');
}

export function getHistory(): AnomalyRecord[] {
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveHistory(records: AnomalyRecord[]) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export function addHistoryRecord(record: Omit<AnomalyRecord, 'id'>) {
  const history = getHistory();
  const newRecord: AnomalyRecord = {
    ...record,
    id: `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };
  history.unshift(newRecord); // Add to beginning
  // Limit to 200 records
  if (history.length > 200) {
    history.pop();
  }
  saveHistory(history);
  return newRecord;
}

export function clearHistoryDB() {
  saveHistory([]);
}

// MySQL Schema Representation for phpMyAdmin Viewer
export const MYSQL_SCHEMA_DUMP = `
-- Base de données : redatlas_iot_db
-- Version du serveur MySQL : 8.0.32 (phpMyAdmin 5.2.1)

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  role ENUM('admin', 'technician') NOT NULL DEFAULT 'technician',
  specialite VARCHAR(100),
  telephone VARCHAR(30),
  date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
  actif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS machines (
  id VARCHAR(50) PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  emplacement VARCHAR(150) NOT NULL,
  type_capteur VARCHAR(100) NOT NULL,
  en_execution TINYINT(1) DEFAULT 1,
  statut ENUM('OK', 'Warning', 'Critical', 'Stopped') DEFAULT 'OK',
  derniere_mise_a_jour DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS history (
  id VARCHAR(50) PRIMARY KEY,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  machine_id VARCHAR(50) NOT NULL,
  machine_nom VARCHAR(100) NOT NULL,
  statut ENUM('Warning', 'Critical') NOT NULL,
  temperature FLOAT NOT NULL,
  pression FLOAT NOT NULL,
  vibration FLOAT NOT NULL,
  score_anomalie FLOAT NOT NULL,
  description TEXT,
  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
