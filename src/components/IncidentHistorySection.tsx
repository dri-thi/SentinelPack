import React, { useState } from 'react';
import {
  History,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  Shuffle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { EvidenceRecord, IncidentReplayStep, EventType } from '../types';
import { INCIDENT_REPLAY_STEPS } from './IncidentReplayModal';

interface IncidentHistorySectionProps {
  evidenceRecords: EvidenceRecord[];
  onOpenReplayModal: () => void;
  onNavigateToMonitoring: () => void;
}

export const IncidentHistorySection: React.FC<IncidentHistorySectionProps> = ({
  evidenceRecords,
  onOpenReplayModal,
  onNavigateToMonitoring
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Filter only actual incident records
  const incidents = evidenceRecords.filter((r) => r.eventType !== 'NORMAL');

  const getIncidentIcon = (type: EventType) => {
    switch (type) {
      case 'IMPACT':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'TAMPERING':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'TEMPERATURE_BREACH':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'HANDLING_ANOMALY':
        return <Shuffle className="w-4 h-4 text-purple-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans tracking-tight">
            Incident History & Event Replay
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit trail of physical anomalies, impact shocks, thermal breaches, and interactive step-by-step forensic replay.
          </p>
        </div>

        {/* Action: Open Incident Replay */}
        <button
          id="btn-open-incident-replay-page"
          onClick={onOpenReplayModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Forensic Step Replay</span>
        </button>
      </div>

      {/* Incident Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Recorded Incidents</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {incidents.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cryptographically signed events on chain
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Critical Severity Events</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {incidents.filter((i) => i.severity === 'CRITICAL').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tampering & severe thermal drops
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium">Replay Protocol</div>
          <div className="text-sm font-bold text-blue-400 mt-1 flex items-center gap-1.5">
            <span>7 Forensic Micro-Steps Ready</span>
          </div>
          <button
            onClick={onOpenReplayModal}
            className="text-[11px] text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1 font-medium"
          >
            <span>Play automated walkthrough</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Chronological Incident Records</h2>
          <span className="text-xs text-slate-400 font-mono">{incidents.length} item(s)</span>
        </div>

        {incidents.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-8 text-center text-slate-400 space-y-3">
            <History className="w-8 h-8 mx-auto text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-300">No Incidents Detected</p>
              <p className="text-xs text-slate-400 mt-1">
                The selected package has maintained nominal transit conditions with zero threshold violations.
              </p>
            </div>
            <button
              onClick={onNavigateToMonitoring}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Go to Control Room to Simulate Anomaly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => {
              const isSelected = selectedIncidentId === incident.recordId;
              return (
                <div
                  key={incident.recordId}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden transition-colors hover:border-slate-700"
                >
                  <div
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                    onClick={() =>
                      setSelectedIncidentId(isSelected ? null : incident.recordId)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                        {getIncidentIcon(incident.eventType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white font-mono">
                            {incident.eventType.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              incident.severity === 'CRITICAL'
                                ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                                : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {incident.severity}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                          <span>{incident.timestamp}</span>
                          <span>•</span>
                          <span>{incident.checkpointName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs font-mono hidden sm:block">
                        <div className="text-slate-300">
                          Confidence: {incident.confidence}%
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Seq #{incident.sequenceNumber}
                        </div>
                      </div>

                      <div className="text-slate-400">
                        {isSelected ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Incident Diagnostics */}
                  {isSelected && (
                    <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 space-y-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 font-sans">Forensic Explanation:</span>
                        <p className="text-slate-200 mt-0.5 font-sans leading-relaxed">
                          {incident.explanation}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                        <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                          <span className="text-slate-400">Peak Accel:</span>
                          <div className="text-white font-bold">
                            {incident.sensorSnapshot.accelMag.toFixed(2)}g
                          </div>
                        </div>
                        <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                          <span className="text-slate-400">Tilt Angle:</span>
                          <div className="text-white font-bold">
                            {incident.sensorSnapshot.tiltAngle.toFixed(1)}°
                          </div>
                        </div>
                        <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                          <span className="text-slate-400">Temperature:</span>
                          <div className="text-white font-bold">
                            {incident.sensorSnapshot.temperature.toFixed(1)}°C
                          </div>
                        </div>
                        <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                          <span className="text-slate-400">Tamper Seal:</span>
                          <div className="text-white font-bold">
                            {incident.sensorSnapshot.tamperState ? 'BREACHED' : 'INTACT'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                        <div className="truncate max-w-md">
                          Hash: <span className="text-blue-400">{incident.recordHash}</span>
                        </div>
                        <button
                          onClick={onOpenReplayModal}
                          className="text-blue-400 hover:text-blue-300 font-sans font-medium flex items-center gap-1"
                        >
                          <span>Replay Incident Step</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Integrated Forensic Replay Walkthrough Preview */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Forensic Incident Replay Engine
              </h3>
              <p className="text-xs text-slate-400">
                7-step automated reconstruction: Raw Telemetry → Shock Spike → Tilt Roll → Cross-Sensor Synthesis → AI Classification → Cryptographic Hash Ledger.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenReplayModal}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Launch Interactive Player
          </button>
        </div>

        {/* Step Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
          {INCIDENT_REPLAY_STEPS.slice(0, 4).map((step) => (
            <div
              key={step.stepNumber}
              className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>STEP {step.stepNumber}</span>
                <span>{step.timestamp}</span>
              </div>
              <div className="font-semibold text-white truncate font-sans">
                {step.title}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-2 font-sans">
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
