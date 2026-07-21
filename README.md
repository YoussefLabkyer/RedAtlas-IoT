# RedAtlas IoT - Guide de Lancement sous Windows

Ce guide explique étape par étape comment installer et démarrer l'application **RedAtlas IoT** sous Windows de façon simple et rapide.

---

## 📋 Prérequis

Avant de commencer, assurez-vous de disposer des éléments suivants sur votre PC Windows :

1. **Node.js** (version 18 ou supérieure)  
   👉 Télécharger depuis le site officiel : [nodejs.org](https://nodejs.org/) *(l'installateur inclut automatiquement `npm`)*.
2. **Un terminal Windows** (au choix) :
   - Invite de commandes (`cmd`)
   - Windows PowerShell
   - Git Bash
3. **Python 3** *(Optionnel)* :
   - Si Python 3 est installé, le script IoT `generator.py` pourra s'exécuter nativement.
   - Si Python n'est pas installé, le serveur Node.js utilise automatiquement un **moteur de simulation de données intégré**, l'application fonctionnera donc parfaitement dans tous les cas.

---

## 🚀 Étapes de Lancement

### Étape 1 : Ouvrir le terminal dans le dossier du projet

1. Ouvrez l'explorateur de fichiers Windows et accédez au dossier du projet.
2. Cliquez dans la barre d'adresse en haut, tapez `cmd` ou `powershell` puis appuyez sur **Entrée**.

### Étape 2 : Installer les dépendances

Dans votre terminal, lancez la commande d'installation des paquets Node.js :

```cmd
npm install
```

> **Note :** Cette opération télécharge et installe les bibliothèques requises dans le dossier `node_modules`.

---

### Étape 3 : Démarrer l'application

Pour lancer le serveur de développement (Backend Express + Frontend Vite React) :

```cmd
npm run dev
```

Un message s'affichera dans le terminal indiquant que le serveur est démarré :
```
Serveur RedAtlas IoT démarré sur http://localhost:3000
```

---

### Étape 4 : Ouvrir l'application dans votre navigateur

Ouvrez votre navigateur web (Google Chrome, Microsoft Edge, Firefox, etc.) et allez à l'adresse suivante :

👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Identifiants de connexion par défaut

Pour vous connecter à la plateforme, utilisez l'un des comptes prédéfinis :

| Rôle | Adresse E-mail | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin@redatlas.ma` | `admin123` |
| **Technicien** | `tech@redatlas.ma` | `tech123` |

---

## 🛠️ Commandes Utiles

- **Arrêter l'application** : Appuyez sur `CTRL + C` dans le terminal, puis confirmez avec `O` (ou `Y`).
- **Lancer en mode Production** (Générer le build optimisé) :
  ```cmd
  npm run build
  npm start
  ```
- **Vérification TypeScript / Linting** :
  ```cmd
  npm run lint
  ```

---

## ❓ Dépannage courant sous Windows

- **Erreur `port 3000 is already in use` (Port 3000 déjà utilisé)** :
  Fermez l'autre application qui utilise le port 3000, ou libérez le port en exécutant dans `cmd` :
  ```cmd
  netstat -ano | findstr :3000
  taskkill /PID <NUMERO_PID> /F
  ```
- **Erreur de stratégie d'exécution PowerShell (`PSSecurityException`)** :
  Si PowerShell bloque l'exécution des scripts `npm`, basculez sur l'Invite de commandes (`cmd`) ou débloquez l'exécution dans PowerShell avec :
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
