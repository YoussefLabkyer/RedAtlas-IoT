import { useState } from 'react';
import { AnomalyRecord, UserRole } from '../types';
import { History, Trash2, Download, Search, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

interface HistoryViewProps {
  history: AnomalyRecord[];
  userRole: UserRole;
  onClearHistory: () => Promise<void>;
}

export function HistoryView({ history, userRole, onClearHistory }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Warning' | 'Critical'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isAdmin = userRole === 'admin';

  // Filter history records
  const filteredHistory = history.filter((record) => {
    const matchesSearch =
      record.machineNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'all' || record.statut === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;

    const headers = [
      'ID',
      'Date/Heure',
      'Machine',
      'Statut',
      'Température (°C)',
      'Pression (bar)',
      'Vibration (mm/s)',
      'Score Isolation Forest',
      'Description',
    ];

    const rows = filteredHistory.map((h) => [
      h.id,
      `"${h.timestamp}"`,
      `"${h.machineNom}"`,
      h.statut,
      h.temperature,
      h.pression,
      h.vibration,
      h.scoreAnomalie,
      `"${h.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `redatlas_anomalies_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-red-800" />
            <span>Historique des Anomalies & Alertes (MySQL)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Journal restreint strictement aux événements Warning et Critical
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            disabled={filteredHistory.length === 0}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-300 transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Exporter CSV</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={history.length === 0}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider l'Historique</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par machine, description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-800 focus:outline-hidden"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-600">Sévérité :</span>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              severityFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tous ({history.length})
          </button>
          <button
            onClick={() => setSeverityFilter('Warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
              severityFilter === 'Warning'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </button>
          <button
            onClick={() => setSeverityFilter('Critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 ${
              severityFilter === 'Critical'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Critical</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Date / Heure</th>
                <th className="py-3.5 px-4">Machine</th>
                <th className="py-3.5 px-4">Sévérité</th>
                <th className="py-3.5 px-4">Capteurs (T / P / V)</th>
                <th className="py-3.5 px-4">Score IF</th>
                <th className="py-3.5 px-4">Analyse & Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>Aucun enregistrement d'anomalie ne correspond aux filtres actuels.</span>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {h.timestamp}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {h.machineNom}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          h.statut === 'Critical'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {h.statut === 'Critical' ? (
                          <Zap className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        <span>{h.statut}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {h.temperature}°C • {h.pression} bar • {h.vibration} mm/s
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-red-700 whitespace-nowrap">
                      {h.scoreAnomalie}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 leading-relaxed">
                      {h.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Wipe Modal */}
      {showClearConfirm && (
        <ConfirmModal
          title="Vider l'historique d'anomalies"
          message="Êtes-vous sûr de vouloir supprimer la totalité de l'historique des anomalies (Warning et Critical) de la base de données ? Cette action est irréversible."
          confirmLabel="Confirmer la suppression"
          onConfirm={async () => {
            await onClearHistory();
            setShowClearConfirm(false);
          }}
          onClose={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
}
