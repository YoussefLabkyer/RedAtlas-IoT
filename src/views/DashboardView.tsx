import { useState } from 'react';
import { Machine, SensorReading, AnomalyRecord, PythonStatus, UserRole } from '../types';
import {
  Activity,
  HardDrive,
  AlertTriangle,
  Play,
  Square,
  Thermometer,
  Gauge,
  Zap,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface DashboardViewProps {
  machines: Machine[];
  sensorReadings: SensorReading[];
  history: AnomalyRecord[];
  pythonStatus: PythonStatus | null;
  userRole: UserRole;
  onStartPython: () => Promise<void>;
  onStopPython: () => Promise<void>;
}

export function DashboardView({
  machines,
  sensorReadings,
  history,
  pythonStatus,
  userRole,
  onStartPython,
  onStopPython,
}: DashboardViewProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered sensor readings for chart
  const activeReadings = selectedMachineId === 'all'
    ? sensorReadings
    : sensorReadings.filter((r) => r.machineId === selectedMachineId);

  // Calculate Metrics
  const activeMachinesCount = machines.filter((m) => m.enExecution).length;
  const warningCount = sensorReadings.filter((r) => r.statut === 'Warning').length;
  const criticalCount = sensorReadings.filter((r) => r.statut === 'Critical').length;
  const okCount = sensorReadings.filter((r) => r.statut === 'OK').length;

  const handleTogglePython = async () => {
    if (userRole !== 'admin') return;
    setActionLoading(true);
    try {
      if (pythonStatus?.isRunning) {
        await onStopPython();
      } else {
        await onStartPython();
      }
    } catch (err) {
      console.error('Erreur bascule script Python:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Machines */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parc Machines</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{machines.length}</span>
              <span className="text-xs text-slate-500">/ 10 max</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {activeMachinesCount} en fonctionnement
            </p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Python IoT Engine Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Générateur Python</p>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  pythonStatus?.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="text-lg font-bold text-slate-900">
                {pythonStatus?.isRunning ? 'En cours' : 'Arrêté'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              PID: {pythonStatus?.pid || 'N/A'} • {pythonStatus?.sampleCount || 0} échantillons
            </p>
          </div>

          {userRole === 'admin' ? (
            <button
              onClick={handleTogglePython}
              disabled={actionLoading}
              className={`px-3 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center space-x-1.5 ${
                pythonStatus?.isRunning
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-red-800 hover:bg-red-900'
              }`}
            >
              {pythonStatus?.isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Arrêter</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Démarrer</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3 bg-slate-100 text-slate-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Warnings Count */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Avertissements (Warning)</p>
            <div className="text-2xl font-black text-amber-900 mt-1">{warningCount}</div>
            <p className="text-xs text-amber-700 mt-1">Capteurs au-dessus des seuils nominals</p>
          </div>
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Anomalies */}
        <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Anomalies Critiques</p>
            <div className="text-2xl font-black text-red-900 mt-1">{criticalCount}</div>
            <p className="text-xs text-red-700 mt-1">Intervention technique requise</p>
          </div>
          <div className="p-3 bg-red-100 text-red-800 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <label className="text-xs font-bold text-slate-700">Filtrer par Machine :</label>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-800 focus:outline-hidden"
          >
            <option value="all">Toutes les machines ({sensorReadings.length} actives)</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom} ({m.emplacement})
              </option>
            ))}
          </select>
        </div>

        {/* AI Model Badge */}
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-xs text-red-900">
          <Brain className="w-4 h-4 text-red-800" />
          <span className="font-bold">Algorithme IA :</span>
          <span>Isolation Forest (Scikit-Learn)</span>
        </div>
      </div>

      {/* Real-time Sensor Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Temperature */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                <Thermometer className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Température (°C)</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Seuil Critique : 80°C
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="machineNom" tick={{ fontSize: 10 }} />
                <YAxis domain={[10, 110]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={65} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn 65°C', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={80} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Crit 80°C', fill: '#dc2626', fontSize: 10 }} />
                <Line type="monotone" dataKey="temperature" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pressure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Gauge className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pression (bar)</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Seuil Critique : 6.0 bar
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="machineNom" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={4.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn 4.5', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={6.0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Crit 6.0', fill: '#dc2626', fontSize: 10 }} />
                <Line type="monotone" dataKey="pression" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Vibration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Vibration (mm/s)</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Seuil Critique : 4.0 mm/s
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeReadings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="machineNom" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 8]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <ReferenceLine y={2.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn 2.5', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine y={4.0} stroke="#dc2626" strokeDasharray="3 3" label={{ value: 'Crit 4.0', fill: '#dc2626', fontSize: 10 }} />
                <Line type="monotone" dataKey="vibration" stroke="#9333ea" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Active Machine Cards & Recent Anomaly Log Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Machines Realtime Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-red-800" />
              <span>État Temps Réel des Machines Actives</span>
            </h3>
            <span className="text-xs text-slate-500">Mise à jour automatique 2s</span>
          </div>

          <div className="space-y-3">
            {sensorReadings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Aucune donnée capteur disponible. Lancez le script Python pour générer du flux IoT.
              </p>
            ) : (
              sensorReadings.map((r) => (
                <div
                  key={r.machineId}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{r.machineNom}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({r.machineId})</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1.5 text-xs text-slate-700 font-medium">
                      <span>Temp: <strong className="text-slate-900">{r.temperature}°C</strong></span>
                      <span>Press: <strong className="text-slate-900">{r.pression} bar</strong></span>
                      <span>Vib: <strong className="text-slate-900">{r.vibration} mm/s</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.statut === 'Critical'
                          ? 'bg-red-600 text-white'
                          : r.statut === 'Warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.statut}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Score: {r.scoreAnomalie}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Warning & Critical Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Dernières Détections d'Anomalies (Warning & Critical)</span>
            </h3>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-md">
              {history.length} dans l'historique
            </span>
          </div>

          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                <span>Aucune anomalie détectée pour le moment. Tous les capteurs fonctionnent normalement.</span>
              </div>
            ) : (
              history.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between ${
                    h.statut === 'Critical'
                      ? 'bg-red-50 border-red-200 text-red-950'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs">{h.machineNom}</span>
                      <span className="text-[10px] opacity-70 font-mono">{h.timestamp}</span>
                    </div>
                    <p className="text-xs leading-tight">{h.description}</p>
                    <div className="text-[10px] font-mono opacity-80 pt-1">
                      T: {h.temperature}°C | P: {h.pression} bar | V: {h.vibration} mm/s | Score: {h.scoreAnomalie}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shrink-0 ml-2 ${
                      h.statut === 'Critical' ? 'bg-red-700' : 'bg-amber-600'
                    }`}
                  >
                    {h.statut}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
