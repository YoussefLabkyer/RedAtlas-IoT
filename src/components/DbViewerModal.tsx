import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Machine, AnomalyRecord, SensorDataFile } from '../types';
import { Database, FileText, Code, X, RefreshCw, Server } from 'lucide-react';

interface DbViewerModalProps {
  onClose: () => void;
}

export function DbViewerModal({ onClose }: DbViewerModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'json' | 'sql'>('tables');
  const [activeTable, setActiveTable] = useState<'users' | 'machines' | 'history'>('machines');
  
  const [dbData, setDbData] = useState<{
    users: User[];
    machines: Machine[];
    history: AnomalyRecord[];
    sqlSchema: string;
  } | null>(null);

  const [jsonSensorData, setJsonSensorData] = useState<SensorDataFile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const dbRes = await api.getDbSchema();
      const jsonRes = await api.getSensorData();
      setDbData({
        users: dbRes.tables.users,
        machines: dbRes.tables.machines,
        history: dbRes.tables.history,
        sqlSchema: dbRes.sqlSchema,
      });
      setJsonSensorData(jsonRes);
    } catch (err) {
      console.error('Erreur chargement données DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-800 text-white rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Inspection des Données RedAtlas</span>
                <span className="text-xs bg-red-800 text-red-100 px-2 py-0.5 rounded font-mono">
                  MySQL (phpMyAdmin) & JSON Storage
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Architecture 3-Tiers : Stockage relationnel MySQL + Fichier JSON capteurs
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSubTab('tables')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'tables'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Tables MySQL (phpMyAdmin)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('json')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'json'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Stockage JSON (/data/sensor_data.json)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('sql')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSubTab === 'sql'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Schéma SQL DDL</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Status: Synchronisé
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          {loading ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-800" />
              <p>Chargement des tables de la base de données...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MySQL Tables */}
              {activeSubTab === 'tables' && dbData && (
                <div>
                  {/* Table Switcher */}
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setActiveTable('machines')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        activeTable === 'machines'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Table `machines` ({dbData.machines.length})
                    </button>
                    <button
                      onClick={() => setActiveTable('users')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        activeTable === 'users'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Table `users` ({dbData.users.length})
                    </button>
                    <button
                      onClick={() => setActiveTable('history')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                        activeTable === 'history'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      Table `history` ({dbData.history.length})
                    </button>
                  </div>

                  {/* Table View */}
                  <div className="border border-slate-200 rounded-xl bg-white overflow-x-auto shadow-xs">
                    {activeTable === 'machines' && (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">id</th>
                            <th className="p-3">nom</th>
                            <th className="p-3">emplacement</th>
                            <th className="p-3">type_capteur</th>
                            <th className="p-3">en_execution</th>
                            <th className="p-3">statut</th>
                            <th className="p-3">derniere_mise_a_jour</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {dbData.machines.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 font-mono">
                              <td className="p-3 font-bold text-slate-900">{m.id}</td>
                              <td className="p-3 font-sans text-slate-800">{m.nom}</td>
                              <td className="p-3 font-sans text-slate-600">{m.emplacement}</td>
                              <td className="p-3 font-sans text-slate-600">{m.typeCapteur}</td>
                              <td className="p-3">
                                <span className={m.enExecution ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                                  {m.enExecution ? '1 (VRAI)' : '0 (FAUX)'}
                                </span>
                              </td>
                              <td className="p-3 font-sans font-semibold">{m.statut}</td>
                              <td className="p-3 text-slate-500">{m.derniereMiseAJour}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTable === 'users' && (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">id</th>
                            <th className="p-3">email</th>
                            <th className="p-3">nom</th>
                            <th className="p-3">role</th>
                            <th className="p-3">specialite</th>
                            <th className="p-3">actif</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {dbData.users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 font-mono">
                              <td className="p-3 font-bold text-slate-900">{u.id}</td>
                              <td className="p-3 text-slate-800">{u.email}</td>
                              <td className="p-3 font-sans font-medium text-slate-800">{u.nom}</td>
                              <td className="p-3 font-sans">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.role === 'admin'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-3 font-sans text-slate-600">{u.specialite || '-'}</td>
                              <td className="p-3 text-emerald-700">{u.actif ? '1' : '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTable === 'history' && (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">id</th>
                            <th className="p-3">timestamp</th>
                            <th className="p-3">machine_nom</th>
                            <th className="p-3">statut</th>
                            <th className="p-3">temp (°C)</th>
                            <th className="p-3">pression (bar)</th>
                            <th className="p-3">vibration (mm/s)</th>
                            <th className="p-3">score_anomalie</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {dbData.history.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-6 text-center text-slate-500 font-sans">
                                Aucun événement Warning ou Critical enregistré dans la table `history`.
                              </td>
                            </tr>
                          ) : (
                            dbData.history.map((h) => (
                              <tr key={h.id} className="hover:bg-slate-50 font-mono">
                                <td className="p-3 font-bold text-slate-900">{h.id}</td>
                                <td className="p-3 text-slate-500">{h.timestamp}</td>
                                <td className="p-3 font-sans font-medium text-slate-800">{h.machineNom}</td>
                                <td className="p-3 font-sans">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      h.statut === 'Critical'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-amber-500 text-white'
                                    }`}
                                  >
                                    {h.statut}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-slate-900">{h.temperature}</td>
                                <td className="p-3 font-bold text-slate-900">{h.pression}</td>
                                <td className="p-3 font-bold text-slate-900">{h.vibration}</td>
                                <td className="p-3 font-bold text-red-700">{h.scoreAnomalie}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: JSON File Storage */}
              {activeSubTab === 'json' && (
                <div>
                  <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400">
                      <span>Fichier : /data/sensor_data.json</span>
                      <span>Dernière MàJ : {jsonSensorData?.lastUpdated || 'En cours...'}</span>
                    </div>
                    <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(jsonSensorData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: SQL Schema Dump */}
              {activeSubTab === 'sql' && dbData && (
                <div>
                  <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
                    <div className="border-b border-slate-800 pb-2 mb-3 text-slate-400 flex items-center justify-between">
                      <span>Schéma de Base de Données Normalisée (MySQL 8.0)</span>
                      <span>UTF-8 InnoDB</span>
                    </div>
                    <pre className="text-amber-300 whitespace-pre-wrap leading-relaxed">
                      {dbData.sqlSchema}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Fermer l'inspecteur
          </button>
        </div>
      </div>
    </div>
  );
}
