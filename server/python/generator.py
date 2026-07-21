import json
import os
import random
import time
from datetime import datetime
from anomaly_detector import detect_anomaly

DATA_FILE = os.path.join(os.path.dirname(__file__), '../../data/sensor_data.json')

def load_machines():
    # Fichier de machines simulées ou par défaut
    machines_file = os.path.join(os.path.dirname(__file__), '../../data/machines.json')
    if os.path.exists(machines_file):
        try:
            with open(machines_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return [
        {"id": "M001", "nom": "Presse Hydraulique A1", "emplacement": "Secteur Nord", "enExecution": True},
        {"id": "M002", "nom": "Compresseur Principal", "emplacement": "Secteur Est", "enExecution": True},
        {"id": "M003", "nom": "Turbine de Refroidissement", "emplacement": "Secteur Sud", "enExecution": True},
        {"id": "M004", "nom": "Moteur Électrique M4", "emplacement": "Secteur Ouest", "enExecution": False}
    ]

def generate_sensor_values(machine_id, count_cycle):
    # Génération réaliste avec pics d'anomalies contrôlés
    rand_val = random.random()
    
    # 80% de chance fonctionnement normal, 15% warning, 5% critical
    if rand_val < 0.80:
        temp = round(random.uniform(35.0, 62.0), 1)
        press = round(random.uniform(2.0, 4.2), 2)
        vib = round(random.uniform(0.8, 2.2), 2)
    elif rand_val < 0.95:
        # Warning
        temp = round(random.uniform(66.0, 78.0), 1)
        press = round(random.uniform(4.6, 5.8), 2)
        vib = round(random.uniform(2.6, 3.8), 2)
    else:
        # Critical
        temp = round(random.uniform(81.0, 96.0), 1)
        press = round(random.uniform(6.1, 8.2), 2)
        vib = round(random.uniform(4.1, 6.5), 2)

    return temp, press, vib

def run_simulation():
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    count_cycle = 0
    print("Démarrage de la génération de données IoT RedAtlas...")

    while True:
        machines = load_machines()
        readings = []
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        for m in machines:
            if m.get("enExecution", True):
                temp, press, vib = generate_sensor_values(m["id"], count_cycle)
                eval_res = detect_anomaly(temp, press, vib)
                
                readings.append({
                    "timestamp": now_str,
                    "machineId": m["id"],
                    "machineNom": m["nom"],
                    "temperature": temp,
                    "pression": press,
                    "vibration": vib,
                    "scoreAnomalie": eval_res["scoreAnomalie"],
                    "statut": eval_res["statut"]
                })

        output_data = {
            "lastUpdated": now_str,
            "activeCount": len(readings),
            "readings": readings
        }

        try:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            print(f"[{now_str}] Capteurs mis à jour ({len(readings)} machines actives).")
        except Exception as e:
            print(f"Erreur écriture JSON: {e}")

        count_cycle += 1
        time.sleep(2)

if __name__ == "__main__":
    run_simulation()
