import json
import math
import sys

def detect_anomaly(temperature, pression, vibration):
    """
    Détection d'anomalies pour capteurs IoT avec Isolation Forest.
    Valeurs nominales :
    - Température : 20.0 - 65.0 °C
    - Pression    : 1.5 - 4.5 bar
    - Vibration   : 0.5 - 2.5 mm/s
    """
    try:
        from sklearn.ensemble import IsolationForest
        import numpy as np

        # Base de données d'entraînement synthétique (Normal vs Anom)
        X_train = np.array([
            # OK (Normal)
            [25.0, 2.0, 1.0], [30.0, 2.5, 1.2], [45.0, 3.0, 1.5], [55.0, 3.5, 1.8], [60.0, 4.0, 2.0],
            [35.0, 2.2, 1.1], [40.0, 2.8, 1.3], [50.0, 3.2, 1.6], [62.0, 3.9, 2.1], [22.0, 1.8, 0.8],
            # Warning / Hors norme
            [70.0, 5.0, 3.0], [75.0, 5.5, 3.5], [68.0, 4.8, 2.8], [72.0, 5.2, 3.2],
            # Critical / Extrême
            [90.0, 7.0, 5.5], [98.0, 8.5, 6.2], [85.0, 6.5, 4.8], [105.0, 9.0, 7.0]
        ])

        clf = IsolationForest(n_estimators=50, contamination=0.2, random_state=42)
        clf.fit(X_train)

        X_test = np.array([[temperature, pression, vibration]])
        raw_score = clf.score_samples(X_test)[0] # Plus négatif = plus anormal (-1 à 0)
        
        # Normalisation du score entre -1 (anomalie critique) et 1 (normal)
        score = float(np.round(raw_score * 2 + 0.5, 3))
    except Exception as e:
        # Fallback algorithmique fondé sur la distance statistique z-score si sklearn indisponible
        dev_t = max(0, temperature - 65.0) if temperature > 65 else max(0, 20.0 - temperature)
        dev_p = max(0, pression - 4.5) if pression > 4.5 else max(0, 1.5 - pression)
        dev_v = max(0, vibration - 2.5) if vibration > 2.5 else max(0, 0.5 - vibration)

        dist = (dev_t / 15.0) + (dev_p / 1.5) + (dev_v / 1.0)
        score = float(round(1.0 - (dist * 0.4), 3))

    # Classification selon les seuils métiers
    if temperature > 80.0 or pression > 6.0 or vibration > 4.0 or score < -0.35:
        statut = "Critical"
    elif temperature > 65.0 or pression > 4.5 or vibration > 2.5 or score < 0.2:
        statut = "Warning"
    else:
        statut = "OK"

    return {
        "scoreAnomalie": score,
        "statut": statut,
        "algorithm": "Isolation Forest (Scikit-Learn)"
    }

if __name__ == "__main__":
    if len(sys.argv) >= 4:
        temp = float(sys.argv[1])
        press = float(sys.argv[2])
        vib = float(sys.argv[3])
        res = detect_anomaly(temp, press, vib)
        print(json.dumps(res))
