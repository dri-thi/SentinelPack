import React from 'react';
import {
  LayoutDashboard,
  Activity,
  History,
  Database,
  Cpu,
  FileCheck
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'live_monitoring'
  | 'incident_history'
  | 'synthetic_testing'
  | 'ai_evaluation'
  | 'evidence_integrity';

interface NavigationBarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  incidentCount: number;
  chainIntact: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onSelectTab,
  incidentCount,
  chainIntact
}) => {
  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'live_monitoring',
      label: 'Live Monitoring',
      icon: <Activity className="w-4 h-4" />
    },
    {
      id: 'incident_history',
      label: 'Incident History',
      icon: <History className="w-4 h-4" />,
      badge: incidentCount > 0 ? (
        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300">
          {incidentCount}
        </span>
      ) : undefined
    },
    {
      id: 'synthetic_testing',
      label: 'Synthetic Testing',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'ai_evaluation',
      label: 'AI Evaluation',
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'evidence_integrity',
      label: 'Evidence Integrity',
      icon: <FileCheck className="w-4 h-4" />,
      badge: !chainIntact ? (
        <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-red-500/20 text-red-300">
          !
        </span>
      ) : undefined
    }
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-14 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className={`mr-2 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
