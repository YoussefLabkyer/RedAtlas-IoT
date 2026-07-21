import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import {
  getUsers,
  saveUsers,
  getMachines,
  saveMachines,
  getHistory,
  clearHistoryDB,
  MYSQL_SCHEMA_DUMP,
} from './server/db/database';

import { getSensorData } from './server/storage/sensorStorage';

import {
  getPythonStatus,
  startPythonService,
  stopPythonService,
} from './server/services/pythonRunnerService';

import { User, Machine } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API REST ROUTES ---

  // 1. Authentification
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir l\'adresse e-mail et le mot de passe.',
      });
    }

    const users = getUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!foundUser || (foundUser.passwordHash && foundUser.passwordHash !== password)) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.',
      });
    }

    if (!foundUser.actif) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte utilisateur a été désactivé par l\'administrateur.',
      });
    }

    // Remove passwordHash before returning
    const { passwordHash, ...userClean } = foundUser;
    const token = `token_redatlas_${foundUser.id}_${Date.now()}`;

    return res.json({
      success: true,
      user: userClean,
      token,
    });
  });

  // 2. Gestion des Machines (CRUD)
  app.get('/api/machines', (req, res) => {
    const machines = getMachines();
    return res.json({ success: true, machines });
  });

  app.post('/api/machines', (req, res) => {
    const { nom, emplacement, typeCapteur } = req.body;
    const machines = getMachines();

    // Contrainte métier : Maximum 10 machines
    if (machines.length >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Limite maximale atteinte : Vous ne pouvez pas enregistrer plus de 10 machines.',
      });
    }

    if (!nom || !emplacement) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la machine et l\'emplacement sont obligatoires.',
      });
    }

    const newMachine: Machine = {
      id: `M00${machines.length + 1}`,
      nom: nom.trim(),
      emplacement: emplacement.trim(),
      typeCapteur: typeCapteur?.trim() || 'Température, Pression, Vibration',
      enExecution: true,
      statut: 'OK',
      derniereMiseAJour: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    machines.push(newMachine);
    saveMachines(machines);

    return res.status(201).json({ success: true, machine: newMachine });
  });

  app.put('/api/machines/:id', (req, res) => {
    const { id } = req.params;
    const { nom, emplacement, typeCapteur, enExecution } = req.body;

    const machines = getMachines();
    const idx = machines.findIndex((m) => m.id === id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Machine introuvable.' });
    }

    machines[idx] = {
      ...machines[idx],
      nom: nom !== undefined ? nom : machines[idx].nom,
      emplacement: emplacement !== undefined ? emplacement : machines[idx].emplacement,
      typeCapteur: typeCapteur !== undefined ? typeCapteur : machines[idx].typeCapteur,
      enExecution: enExecution !== undefined ? enExecution : machines[idx].enExecution,
      derniereMiseAJour: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    saveMachines(machines);
    return res.json({ success: true, machine: machines[idx] });
  });

  app.delete('/api/machines/:id', (req, res) => {
    const { id } = req.params;
    const machines = getMachines();
    const filtered = machines.filter((m) => m.id !== id);

    if (filtered.length === machines.length) {
      return res.status(404).json({ success: false, message: 'Machine introuvable.' });
    }

    saveMachines(filtered);
    return res.json({ success: true, message: 'Machine supprimée avec succès.' });
  });

  app.post('/api/machines/:id/toggle', (req, res) => {
    const { id } = req.params;
    const machines = getMachines();
    const m = machines.find((x) => x.id === id);

    if (!m) {
      return res.status(404).json({ success: false, message: 'Machine introuvable.' });
    }

    m.enExecution = !m.enExecution;
    if (!m.enExecution) {
      m.statut = 'Stopped';
    }
    m.derniereMiseAJour = new Date().toISOString().replace('T', ' ').substring(0, 19);

    saveMachines(machines);
    return res.json({ success: true, machine: m });
  });

  // 3. Gestion des Techniciens (CRUD) - Administrateur uniquement
  app.get('/api/technicians', (req, res) => {
    const users = getUsers();
    const technicians = users
      .filter((u) => u.role === 'technician')
      .map(({ passwordHash, ...u }) => u);

    return res.json({ success: true, technicians });
  });

  app.post('/api/technicians', (req, res) => {
    const { nom, email, password, specialite, telephone } = req.body;

    if (!nom || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Le nom, l\'adresse e-mail et le mot de passe sont requis.',
      });
    }

    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cette adresse e-mail existe déjà.',
      });
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      passwordHash: password,
      nom: nom.trim(),
      role: 'technician' as const,
      specialite: specialite?.trim() || 'Technicien IoT',
      telephone: telephone?.trim() || '',
      dateCreation: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actif: true,
    };

    users.push(newUser);
    saveUsers(users);

    const { passwordHash, ...cleanUser } = newUser;
    return res.status(201).json({ success: true, technician: cleanUser });
  });

  app.put('/api/technicians/:id', (req, res) => {
    const { id } = req.params;
    const { nom, email, specialite, telephone, actif, password } = req.body;

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === id && u.role === 'technician');

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Technicien introuvable.' });
    }

    if (password) {
      users[idx].passwordHash = password;
    }

    users[idx] = {
      ...users[idx],
      nom: nom !== undefined ? nom : users[idx].nom,
      email: email !== undefined ? email : users[idx].email,
      specialite: specialite !== undefined ? specialite : users[idx].specialite,
      telephone: telephone !== undefined ? telephone : users[idx].telephone,
      actif: actif !== undefined ? actif : users[idx].actif,
    };

    saveUsers(users);
    const { passwordHash, ...cleanUser } = users[idx];
    return res.json({ success: true, technician: cleanUser });
  });

  app.delete('/api/technicians/:id', (req, res) => {
    const { id } = req.params;
    const users = getUsers();
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return res.status(404).json({ success: false, message: 'Technicien introuvable.' });
    }

    saveUsers(filtered);
    return res.json({ success: true, message: 'Compte technicien supprimé.' });
  });

  // 4. Historique des Anomalies (Warning & Critical uniquement)
  app.get('/api/history', (req, res) => {
    const history = getHistory();
    return res.json({ success: true, history });
  });

  app.delete('/api/history', (req, res) => {
    clearHistoryDB();
    return res.json({
      success: true,
      message: 'L\'historique des anomalies a été entièrement réinitialisé.',
    });
  });

  // 5. Données des Capteurs (Lecture Fichier JSON temps réel)
  app.get('/api/sensors', (req, res) => {
    const sensorData = getSensorData();
    return res.json({ success: true, sensorData });
  });

  // 6. Contrôle du Script Python (Démarrer / Arrêter / Statut)
  app.get('/api/python/status', (req, res) => {
    const status = getPythonStatus();
    return res.json({ success: true, status });
  });

  app.post('/api/python/start', (req, res) => {
    const result = startPythonService();
    return res.json(result);
  });

  app.post('/api/python/stop', (req, res) => {
    const result = stopPythonService();
    return res.json(result);
  });

  // 7. Base de Données / phpMyAdmin Simulation schema & tables
  app.get('/api/database/schema', (req, res) => {
    const users = getUsers().map(({ passwordHash, ...u }) => u);
    const machines = getMachines();
    const history = getHistory();

    return res.json({
      success: true,
      tables: {
        users,
        machines,
        history,
      },
      sqlSchema: MYSQL_SCHEMA_DUMP,
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/*.json', '**/server/storage/**'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur RedAtlas IoT démarré sur http://localhost:${PORT}`);
  });
}

startServer();
