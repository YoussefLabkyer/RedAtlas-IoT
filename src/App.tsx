import { useState, useEffect, useCallback } from 'react';
import { User, Machine, SensorReading, AnomalyRecord, PythonStatus } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MachinesView } from './views/MachinesView';
import { TechniciansView } from './views/TechniciansView';
import { HistoryView } from './views/HistoryView';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('redatlas_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [machines, setMachines] = useState<Machine[]>([]);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [history, setHistory] = useState<AnomalyRecord[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [pythonStatus, setPythonStatus] = useState<PythonStatus | null>(null);

  const [loading, setLoading] = useState(false);

  // Fetch all live data
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      const [mList, sData, hList, pyStat] = await Promise.all([
        api.getMachines(),
        api.getSensorData(),
        api.getHistory(),
        api.getPythonStatus(),
      ]);

      setMachines(mList);
      setSensorReadings(sData.readings || []);
      setHistory(hList);
      setPythonStatus(pyStat);

      if (user.role === 'admin') {
        const tList = await api.getTechnicians();
        setTechnicians(tList);
      }
    } catch (err) {
      console.error('Erreur rafraîchissement données:', err);
    }
  }, [user]);

  // Initial load & 2-second real-time polling loop
  useEffect(() => {
    if (!user) return;

    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 2000);

    return () => clearInterval(interval);
  }, [user, refreshData]);

  // Login handler
  const handleLoginSuccess = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('redatlas_user', JSON.stringify(userData));
    localStorage.setItem('redatlas_token', token);
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('redatlas_user');
    localStorage.removeItem('redatlas_token');
  };

  // Machine CRUD Handlers
  const handleCreateMachine = async (data: { nom: string; emplacement: string; typeCapteur: string }) => {
    await api.createMachine(data);
    await refreshData();
  };

  const handleUpdateMachine = async (id: string, data: Partial<Machine>) => {
    await api.updateMachine(id, data);
    await refreshData();
  };

  const handleDeleteMachine = async (id: string) => {
    await api.deleteMachine(id);
    await refreshData();
  };

  const handleToggleMachine = async (id: string) => {
    await api.toggleMachine(id);
    await refreshData();
  };

  // Technician CRUD Handlers
  const handleCreateTechnician = async (data: {
    nom: string;
    email: string;
    password: string;
    specialite?: string;
    telephone?: string;
  }) => {
    await api.createTechnician(data);
    await refreshData();
  };

  const handleUpdateTechnician = async (id: string, data: Partial<User & { password?: string }>) => {
    await api.updateTechnician(id, data);
    await refreshData();
  };

  const handleDeleteTechnician = async (id: string) => {
    await api.deleteTechnician(id);
    await refreshData();
  };

  // History Clear Handler
  const handleClearHistory = async () => {
    await api.clearHistory();
    await refreshData();
  };

  // Python Control Handlers
  const handleStartPython = async () => {
    await api.startPython();
    await refreshData();
  };

  const handleStopPython = async () => {
    await api.stopPython();
    await refreshData();
  };

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const warningCount = sensorReadings.filter((r) => r.statut === 'Warning').length;
  const criticalCount = sensorReadings.filter((r) => r.statut === 'Critical').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-red-800 selection:text-white">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        pythonRunning={pythonStatus?.isRunning ?? false}
        onRefreshData={refreshData}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={user.role}
        warningCount={warningCount}
        criticalCount={criticalCount}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            machines={machines}
            sensorReadings={sensorReadings}
            history={history}
            pythonStatus={pythonStatus}
            userRole={user.role}
            onStartPython={handleStartPython}
            onStopPython={handleStopPython}
          />
        )}

        {activeTab === 'machines' && (
          <MachinesView
            machines={machines}
            sensorReadings={sensorReadings}
            userRole={user.role}
            onCreateMachine={handleCreateMachine}
            onUpdateMachine={handleUpdateMachine}
            onDeleteMachine={handleDeleteMachine}
            onToggleMachine={handleToggleMachine}
          />
        )}

        {activeTab === 'technicians' && (
          <TechniciansView
            technicians={technicians}
            userRole={user.role}
            onCreateTechnician={handleCreateTechnician}
            onUpdateTechnician={handleUpdateTechnician}
            onDeleteTechnician={handleDeleteTechnician}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            userRole={user.role}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 RedAtlas IoT — Supervision Industrielle & IA Isolation Forest</span>
          <span className="font-mono text-[11px] text-slate-400">
            Node Express REST • MySQL Relational Engine • JSON Telemetry
          </span>
        </div>
      </footer>
    </div>
  );
}
