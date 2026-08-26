import React from 'react';
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Activity,
  Layers,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { EventType, EvidenceRecord, PackageData, TelemetryPoint } from '../types';

interface AnalyticsPanelProps {
  packages: PackageData[];
  telemetryHistory: TelemetryPoint[];
  evidenceRecords: EvidenceRecord[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  packages,
  telemetryHistory,
  evidenceRecords
}) => {
  const totalPackages = packages.length;
  const totalSensorEvents = telemetryHistory.length;
  const totalIncidents = telemetryHistory.filter(
    (p) => p.detectedEvent && p.detectedEvent !== 'NORMAL'
  ).length;
  const criticalIncidents = evidenceRecords.filter((r) => r.severity === 'CRITICAL').length;
  const verifiedRecords = evidenceRecords.filter((r) => r.verified).length;
  const failedIntegrity = evidenceRecords.filter((r) => !r.verified || r.tampered).length;

  const eventCounts: Record<EventType, number> = {
    NORMAL: 0,
    IMPACT: 0,
    TAMPERING: 0,
    HANDLING_ANOMALY: 0,
    TEMPERATURE_BREACH: 0
  };

  telemetryHistory.forEach((p) => {
    const evt = p.detectedEvent || 'NORMAL';
    eventCounts[evt] = (eventCounts[evt] || 0) + 1;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Fleet Logistics & Incident Analytics
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated cryptographic integrity metrics and environmental incident distribution
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
          REAL-TIME AGGREGATION
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            ACTIVE PACKAGES
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {totalPackages}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            SENSOR READINGS
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {totalSensorEvents}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            INCIDENTS DETECTED
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {totalIncidents}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            CRITICAL BREACHES
          </div>
          <div className="text-xl font-bold font-mono text-red-400 mt-1">
            {criticalIncidents}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            VERIFIED EVIDENCE
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {verifiedRecords}
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            INTEGRITY FAILURES
          </div>
          <div className={`text-xl font-bold font-mono mt-1 ${failedIntegrity > 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
            {failedIntegrity}
          </div>
        </div>
      </div>

      {/* Incident Distribution Horizontal Bars */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
          Telemetry Event Distribution
        </h4>

        <div className="space-y-2.5">
          {(['NORMAL', 'IMPACT', 'TAMPERING', 'HANDLING_ANOMALY', 'TEMPERATURE_BREACH'] as const).map(
            (evt) => {
              const count = eventCounts[evt] || 0;
              const percent = totalSensorEvents > 0 ? Math.round((count / totalSensorEvents) * 100) : 0;
              const barColor =
                evt === 'NORMAL'
                  ? 'bg-emerald-500'
                  : evt === 'IMPACT'
                  ? 'bg-amber-500'
                  : evt === 'TAMPERING'
                  ? 'bg-red-500'
                  : evt === 'TEMPERATURE_BREACH'
                  ? 'bg-orange-500'
                  : 'bg-purple-500';

              return (
                <div key={evt} className="space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">{evt.replace('_', ' ')}</span>
                    <span className="text-slate-400">
                      {count} events ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
