import { useState } from 'react';
import { Machine, SensorReading, UserRole } from '../types';
import {
  HardDrive,
  Plus,
  Play,
  Square,
  Edit2,
  Trash2,
  MapPin,
  Activity,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { MachineModal } from '../components/MachineModal';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MachinesViewProps {
  machines: Machine[];
  sensorReadings: SensorReading[];
  userRole: UserRole;
  onCreateMachine: (data: { nom: string; emplacement: string; typeCapteur: string }) => Promise<void>;
  onUpdateMachine: (id: string, data: Partial<Machine>) => Promise<void>;
  onDeleteMachine: (id: string) => Promise<void>;
  onToggleMachine: (id: string) => Promise<void>;
}

export function MachinesView({
  machines,
  sensorReadings,
  userRole,
  onCreateMachine,
  onUpdateMachine,
  onDeleteMachine,
  onToggleMachine,
}: MachinesViewProps) {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';
  const isMaxReached = machines.length >= 10;

  const handleToggle = async (id: string) => {
    if (!isAdmin) return;
    setToggleLoadingId(id);
    try {
      await onToggleMachine(id);
    } catch (err) {
      console.error('Erreur bascule machine:', err);
    } finally {
      setToggleLoadingId(null);
    }
  };

  // Sensor reading for selected machine drawer
  const activeMachineData = selectedMachine
    ? sensorReadings.find((r) => r.machineId === selectedMachine.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-red-800" />
            <span>Gestion du Parc de Machines IoT</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision individuelle et contrôle d'exécution (Maximum 10 machines)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700 border border-slate-200">
            {machines.length} / 10 machines enregistrées
          </span>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              disabled={isMaxReached}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Machine</span>
            </button>
          )}
        </div>
      </div>

      {isMaxReached && isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Le quota maximum de 10 machines est atteint. Pour ajouter une nouvelle machine, vous devez en supprimer une existante.
          </span>
        </div>
      )}

      {/* Grid of Machine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {machines.map((m) => {
          const currentReading = sensorReadings.find((r) => r.machineId === m.id);

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMachine(m)}
              className={`bg-white rounded-2xl border transition-all cursor-pointer p-5 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                selectedMachine?.id === m.id
                  ? 'border-red-800 ring-2 ring-red-800/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                      ID: {m.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{m.nom}</h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      !m.enExecution
                        ? 'bg-slate-200 text-slate-600'
                        : m.statut === 'Critical'
                        ? 'bg-red-600 text-white animate-pulse'
                        : m.statut === 'Warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {!m.enExecution ? 'Arrêtée' : m.statut}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.emplacement}</span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Capteur : <strong className="text-slate-700 font-normal">{m.typeCapteur}</strong>
                </p>

                {/* Live Values box from JSON */}
                {m.enExecution && currentReading ? (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-1 text-center font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Temp</div>
                      <div className="font-bold text-slate-900">{currentReading.temperature}°C</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Pression</div>
                      <div className="font-bold text-slate-900">{currentReading.pression} b</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-sans">Vibration</div>
                      <div className="font-bold text-slate-900">{currentReading.vibration} m/s</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-medium">
                    Machine à l'arrêt - Capteurs inactifs
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {/* Toggle Start/Stop */}
                {isAdmin ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(m.id);
                    }}
                    disabled={toggleLoadingId === m.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                      m.enExecution
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    {m.enExecution ? (
                      <>
                        <Square className="w-3 h-3 fill-current text-slate-700" />
                        <span>Arrêter</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current text-white" />
                        <span>Démarrer</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Lecture seule</span>
                )}

                {/* Admin CRUD actions */}
                {isAdmin && (
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingMachine(m)}
                      title="Modifier"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(m.id)}
                      title="Supprimer"
                      className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Machine Detailed Graph Drawer */}
      {selectedMachine && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-800" />
                <span>Analyse Télépoint Capteurs : {selectedMachine.nom}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Données du fichier JSON de simulation pour la machine ({selectedMachine.id})
              </p>
            </div>
            <button
              onClick={() => setSelectedMachine(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1 bg-slate-100 rounded-lg"
            >
              Fermer l'analyse
            </button>
          </div>

          {activeMachineData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Température instantanée</div>
                <div className="text-2xl font-black text-rose-700 mt-1">
                  {activeMachineData.temperature}°C
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Seuil normal : 20.0 - 65.0 °C</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Pression instantanée</div>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {activeMachineData.pression} bar
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Seuil normal : 1.5 - 4.5 bar</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-bold uppercase">Vibration instantanée</div>
                <div className="text-2xl font-black text-purple-700 mt-1">
                  {activeMachineData.vibration} mm/s
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Seuil normal : 0.5 - 2.5 mm/s</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              Machine actuellement arrêtée ou sans flux de données JSON.
            </p>
          )}
        </div>
      )}

      {/* Add Machine Modal */}
      {showAddModal && (
        <MachineModal
          totalMachinesCount={machines.length}
          onSave={onCreateMachine}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Machine Modal */}
      {editingMachine && (
        <MachineModal
          machine={editingMachine}
          totalMachinesCount={machines.length}
          onSave={async (data) => {
            await onUpdateMachine(editingMachine.id, data);
            setEditingMachine(null);
          }}
          onClose={() => setEditingMachine(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteTargetId && (
        <ConfirmModal
          title="Supprimer la machine"
          message="Êtes-vous sûr de vouloir supprimer cette machine du parc IoT ? Cette action retirera également les télémétries associées."
          confirmLabel="Supprimer"
          onConfirm={async () => {
            await onDeleteMachine(deleteTargetId);
            setDeleteTargetId(null);
          }}
          onClose={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}
