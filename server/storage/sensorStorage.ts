import fs from 'fs';
import path from 'path';
import { SensorDataFile, SensorReading } from '../../src/types';

const SENSOR_DATA_PATH = path.join(process.cwd(), 'data', 'sensor_data.json');

export function getSensorData(): SensorDataFile {
  try {
    if (fs.existsSync(SENSOR_DATA_PATH)) {
      const content = fs.readFileSync(SENSOR_DATA_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Erreur lecture sensor_data.json:', err);
  }

  // Return empty default structure if file not yet created
  return {
    lastUpdated: new Date().toISOString(),
    activeCount: 0,
    readings: [],
  };
}

export function writeSensorData(readings: SensorReading[]) {
  try {
    const dataDir = path.dirname(SENSOR_DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const payload: SensorDataFile = {
      lastUpdated: new Date().toISOString(),
      activeCount: readings.length,
      readings,
    };

    fs.writeFileSync(SENSOR_DATA_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    return payload;
  } catch (err) {
    console.error('Erreur écriture sensor_data.json:', err);
    throw err;
  }
}
