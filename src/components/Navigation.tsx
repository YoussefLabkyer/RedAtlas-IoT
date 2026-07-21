import { LayoutDashboard, HardDrive, Users, History, Lock } from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 'dashboard' | 'machines' | 'technicians' | 'history';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userRole: UserRole;
  warningCount: number;
  criticalCount: number;
}

export function Navigation({
  activeTab,
  onTabChange,
  userRole,
  warningCount,
  criticalCount,
}: NavigationProps) {
  const totalAnomalies = warningCount + criticalCount;

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'machines' as TabType,
      label: 'Machines',
      icon: HardDrive,
      badge: 'Max 10',
    },
    {
      id: 'technicians' as TabType,
      label: 'Techniciens',
      icon: Users,
      badge: null,
    },
    {
      id: 'history' as TabType,
      label: 'Historique',
      icon: History,
      badge: totalAnomalies > 0 ? `${totalAnomalies}` : null,
      badgeColor: criticalCount > 0 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Main Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-red-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>

                  {tab.badge && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Role Status Banner */}
          {userRole === 'technician' && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium my-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Accès Technicien : Lecture seule (Read-Only)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
