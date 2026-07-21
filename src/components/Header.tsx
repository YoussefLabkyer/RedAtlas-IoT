import { useState } from 'react';
import { User } from '../types';
import { Database, LogOut, Shield, UserCheck, Cpu, RefreshCw } from 'lucide-react';
import { DbViewerModal } from './DbViewerModal';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  pythonRunning: boolean;
  onRefreshData?: () => void;
}

export function Header({ user, onLogout, pythonRunning, onRefreshData }: HeaderProps) {
  const [showDbModal, setShowDbModal] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="bg-red-800 text-white p-2 rounded-xl shadow-xs flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Red<span className="text-red-700">Atlas</span>
                </span>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-md font-semibold tracking-wide border border-red-200">
                  IoT Supervision
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Analyse & Détection d'Anomalies en Temps Réel
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Live Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  pythonRunning ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-slate-700">
                {pythonRunning ? 'Python IoT Actif (2s)' : 'Python Inactif'}
              </span>
            </div>

            {/* Refresh Button */}
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                title="Actualiser les données"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Inspect DB & JSON Storage Button */}
            <button
              onClick={() => setShowDbModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200"
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Inspecter MySQL & JSON</span>
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900">{user.nom}</div>
                <div className="text-[11px] text-slate-500">{user.email}</div>
              </div>

              {user.role === 'admin' ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <Shield className="w-3 h-3 text-red-700" />
                  <span>Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <UserCheck className="w-3 h-3 text-blue-700" />
                  <span>Technicien</span>
                </span>
              )}

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Déconnexion"
                className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MySQL & JSON Inspector Modal */}
      {showDbModal && <DbViewerModal onClose={() => setShowDbModal(false)} />}
    </>
  );
}
