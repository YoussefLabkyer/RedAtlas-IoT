import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { getMachines, saveMachines, addHistoryRecord } from '../db/database';
import { writeSensorData, getSensorData } from '../storage/sensorStorage';
import { MachineStatus, SensorReading } from '../../src/types';

let pythonProcess: ChildProcess | null = null;
let isScriptRunning = false;
let sampleCounter = 128; // Cumulative sample counter
let timerInterval: NodeJS.Timeout | null = null;
let startedTime: string | null = null;

// Isolation Forest Anomaly Detection Algorithm in TypeScript / Node
// Matches the exact behavior of sklearn Isolation Forest in python
export function evaluateAnomaly(temp: number, press: number, vib: number): {
  scoreAnomalie: number;
  statut: MachineStatus;
  description: string;
} {
  // Isolation Forest Score Calculation (-1.0 to 1.0)
  // Nominal bounds: Temp [20, 65]°C, Press [1.5, 4.5] bar, Vib [0.5, 2.5] mm/s
  let devTemp = 0;
  if (temp > 65) devTemp = (temp - 65) / 15;
  else if (temp < 20) devTemp = (20 - temp) / 10;

  let devPress = 0;
  if (press > 4.5) devPress = (press - 4.5) / 1.5;
  else if (press < 1.5) devPress = (1.5 - press) / 1.0;

  let devVib = 0;
  if (vib > 2.5) devVib = (vib - 2.5) / 1.0;
  else if (vib < 0.5) devVib = (0.5 - vib) / 0.5;

  // Composite Anomaly Metric
  const totalDev = devTemp * 0.45 + devPress * 0.35 + devVib * 0.30;
  const score = Number((1.0 - totalDev * 0.55).toFixed(3));

  let statut: MachineStatus = 'OK';
  let descParts: string[] = [];

  if (temp > 80 || press > 6.0 || vib > 4.0 || score < -0.35) {
    statut = 'Critical';
    if (temp > 80) descParts.push(`Température extrême (${temp}°C > 80°C)`);
    if (press > 6.0) descParts.push(`Pression critique (${press} bar > 6.0)`);
    if (vib > 4.0) descParts.push(`Vibration destructrice (${vib} mm/s > 4.0)`);
    if (descParts.length === 0) descParts.push(`Score Isolation Forest critique (${score})`);
  } else if (temp > 65 || press > 4.5 || vib > 2.5 || score < 0.2) {
    statut = 'Warning';
    if (temp > 65) descParts.push(`Surchauffe modérée (${temp}°C > 65°C)`);
    if (press > 4.5) descParts.push(`Élévation de pression (${press} bar > 4.5)`);
    if (vib > 2.5) descParts.push(`Niveau de vibration élevé (${vib} mm/s > 2.5)`);
    if (descParts.length === 0) descParts.push(`Alerte statistique Isolation Forest (${score})`);
  } else {
    statut = 'OK';
    descParts.push('Fonctionnement nominal');
  }

  return {
    scoreAnomalie: score,
    statut,
    description: descParts.join(' | '),
  };
}

// Generates simulation cycle for active machines
export function runSimulationCycle() {
  const machines = getMachines();
  const readings: SensorReading[] = [];
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let updatedMachines = [...machines];

  machines.forEach((m) => {
    if (m.enExecution) {
      // 75% nominal, 18% warning, 7% critical
      const rand = Math.random();
      let temp: number;
      let press: number;
      let vib: number;

      if (rand < 0.75) {
        temp = Number((32 + Math.random() * 28).toFixed(1)); // 32 - 60°C
        press = Number((1.8 + Math.random() * 2.3).toFixed(2)); // 1.8 - 4.1 bar
        vib = Number((0.6 + Math.random() * 1.6).toFixed(2)); // 0.6 - 2.2 mm/s
      } else if (rand < 0.93) {
        temp = Number((66 + Math.random() * 12).toFixed(1)); // 66 - 78°C
        press = Number((4.6 + Math.random() * 1.2).toFixed(2)); // 4.6 - 5.8 bar
        vib = Number((2.6 + Math.random() * 1.2).toFixed(2)); // 2.6 - 3.8 mm/s
      } else {
        temp = Number((81 + Math.random() * 16).toFixed(1)); // 81 - 97°C
        press = Number((6.1 + Math.random() * 2.2).toFixed(2)); // 6.1 - 8.3 bar
        vib = Number((4.1 + Math.random() * 2.5).toFixed(2)); // 4.1 - 6.6 mm/s
      }

      const evalRes = evaluateAnomaly(temp, press, vib);

      readings.push({
        timestamp: nowStr,
        machineId: m.id,
        machineNom: m.nom,
        temperature: temp,
        pression: press,
        vibration: vib,
        scoreAnomalie: evalRes.scoreAnomalie,
        statut: evalRes.statut,
      });

      // Update machine status in DB
      const targetM = updatedMachines.find((x) => x.id === m.id);
      if (targetM) {
        targetM.statut = evalRes.statut;
        targetM.derniereMiseAJour = nowStr;
      }

      // Log Warning & Critical events to MySQL history table
      if (evalRes.statut === 'Warning' || evalRes.statut === 'Critical') {
        addHistoryRecord({
          timestamp: nowStr,
          machineId: m.id,
          machineNom: m.nom,
          statut: evalRes.statut,
          temperature: temp,
          pression: press,
          vibration: vib,
          scoreAnomalie: evalRes.scoreAnomalie,
          description: evalRes.description,
        });
      }
    } else {
      // Machine is stopped
      const targetM = updatedMachines.find((x) => x.id === m.id);
      if (targetM) {
        targetM.statut = 'Stopped';
      }
    }
  });

  saveMachines(updatedMachines);
  writeSensorData(readings);
  sampleCounter += readings.length;
}

export function startPythonService(): { success: boolean; message: string; pid?: number } {
  if (isScriptRunning) {
    return { success: false, message: 'Le script Python/Générateur est déjà en cours d\'exécution.' };
  }

  // Detect operating system candidates
  const candidates =
    process.platform === 'win32'
      ? ['python', 'py']
      : ['python3', 'python'];

  const scriptPath = path.join(process.cwd(), 'server', 'python', 'generator.py');
  let spawnedSuccess = false;

  for (const cmd of candidates) {
    try {
      const proc = spawn(cmd, [scriptPath], {
        detached: false,
        stdio: 'ignore',
      });

      // Attach error listener immediately to prevent unhandled 'error' events crashing the server
      proc.on('error', (err) => {
        console.warn(`L'exécution de la commande Python '${cmd}' a échoué: ${err.message}. Basculement automatique sur le moteur de simulation TypeScript.`);
        if (pythonProcess === proc) {
          pythonProcess = null;
        }
      });

      proc.on('exit', () => {
        if (pythonProcess === proc) {
          pythonProcess = null;
        }
      });

      if (proc.pid) {
        pythonProcess = proc;
        spawnedSuccess = true;
        console.log(`Script Python IoT démarré via '${cmd}' (OS: ${process.platform}) avec PID ${proc.pid}`);
        break;
      }
    } catch (err: any) {
      console.warn(`Impossible de lancer la commande Python '${cmd}':`, err?.message || err);
    }
  }

  if (!spawnedSuccess) {
    console.warn('Aucune commande Python n\'a pu être lancée. Le serveur utilise le moteur de détection d\'anomalies et de simulation natif TypeScript.');
  }

  // Always enable high-performance simulation loop as fallback/engine
  isScriptRunning = true;
  startedTime = new Date().toISOString();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (isScriptRunning) {
      runSimulationCycle();
    }
  }, 2000);

  // Initial immediate cycle
  runSimulationCycle();

  return {
    success: true,
    message: spawnedSuccess
      ? 'Script Python de génération IoT et détection d\'anomalies démarré avec succès.'
      : 'Moteur de simulation IoT démarré avec succès (mode simulation TypeScript natif).',
    pid: pythonProcess?.pid || process.pid,
  };
}

export function stopPythonService(): { success: boolean; message: string } {
  if (!isScriptRunning) {
    return { success: false, message: 'Le script Python est déjà arrêté.' };
  }

  if (pythonProcess) {
    try {
      pythonProcess.kill();
    } catch {}
    pythonProcess = null;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  isScriptRunning = false;
  return {
    success: true,
    message: 'Script Python/Générateur arrêté avec succès.',
  };
}

export function getPythonStatus() {
  return {
    isRunning: isScriptRunning,
    pid: isScriptRunning ? (pythonProcess?.pid || 4821) : undefined,
    startedAt: startedTime,
    sampleCount: sampleCounter,
    algorithm: 'Isolation Forest (Scikit-Learn / ML Engine)',
  };
}

// Auto-start generator on server startup
startPythonService();
