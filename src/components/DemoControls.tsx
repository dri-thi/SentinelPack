import React from 'react';
import {
  Play,
  AlertTriangle,
  Flame,
  ShieldAlert,
  RotateCcw,
  Activity,
  Pause,
  Shuffle,
  Lock,
  Sparkles
} from 'lucide-react';
import { EventType } from '../types';

interface DemoControlsProps {
  onTriggerScenario: (scenario: EventType | 'RESET' | 'EVIDENCE_TAMPER') => void;
  isSimulatingSequence: boolean;
  activeScenario: string | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenReplayModal: () => void;
  onOpenTamperModal: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onTriggerScenario,
  isSimulatingSequence,
  activeScenario,
  isPaused,
  onTogglePause,
  onOpenReplayModal,
  onOpenTamperModal
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4.5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center gap-2">
              <span>Demo Control Room</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-400 border border-blue-500/30">
                SCENARIO ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Trigger physical sensor anomalies to execute the full detection, AI classification & cryptographic pipeline.
            </p>
          </div>
        </div>

        {/* Play / Pause Toggle */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-pause"
            onClick={onTogglePause}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 border backdrop-blur-md transition-all ${
              isPaused
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE TELEMETRY'}</span>
          </button>
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Normal Delivery */}
        <button
          id="btn-demo-normal"
          onClick={() => onTriggerScenario('NORMAL')}
          disabled={isSimulatingSequence}
          className={`group flex flex-col items-center justify-center p-3 rounded-xl border text-center backdrop-blur-md transition-all ${
            activeScenario === 'NORMAL'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-emerald-400" />
          </div>
          <span className="text-xs font-bold font-mono">Normal Transit</span>
          <span className="text-[10px] text-slate-400 mt-0.5">1.0g Gravity • Low Risk</span>
        </button>

        {/* 2. Simulate Impact */}
        <button
          id="btn-demo-impact"
          onClick={() => onTriggerScenario('IMPACT')}
          disabled={isSimulatingSequence}
          className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border text-center backdrop-blur-md transition-all ${
            activeScenario === 'IMPACT' || isSimulatingSequence
              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-red-500/50 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 mb-1.5 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <span className={`text-xs font-bold font-mono ${activeScenario === 'IMPACT' || isSimulatingSequence ? 'text-white' : 'text-red-300'}`}>
            Simulate Impact
          </span>
          <span className={`text-[10px] mt-0.5 ${activeScenario === 'IMPACT' || isSimulatingSequence ? 'text-red-100' : 'text-slate-400'}`}>
            5.2g Drop + Tilt Roll
          </span>
          {isSimulatingSequence && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-mono bg-white text-red-600 font-bold rounded-full animate-pulse shadow-md">
              INJECTING
            </span>
          )}
        </button>

        {/* 3. Simulate Tampering */}
        <button
          id="btn-demo-tamper"
          onClick={() => onTriggerScenario('TAMPERING')}
          disabled={isSimulatingSequence}
          className={`group flex flex-col items-center justify-center p-3 rounded-xl border text-center backdrop-blur-md transition-all ${
            activeScenario === 'TAMPERING'
              ? 'bg-red-500/20 border-red-500/60 text-red-300 ring-2 ring-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-red-500/50 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 mb-1.5 group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold font-mono text-red-300">Tamper Event</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Switch Open + Lux Spike</span>
        </button>

        {/* 4. Temperature Breach */}
        <button
          id="btn-demo-temp-breach"
          onClick={() => onTriggerScenario('TEMPERATURE_BREACH')}
          disabled={isSimulatingSequence}
          className={`group flex flex-col items-center justify-center p-3 rounded-xl border text-center backdrop-blur-md transition-all ${
            activeScenario === 'TEMPERATURE_BREACH'
              ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 ring-2 ring-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
              : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-orange-500/50 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-1.5 group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold font-mono text-orange-300">Temp Breach</span>
          <span className="text-[10px] text-slate-400 mt-0.5">12.5°C Heat Breach</span>
        </button>

        {/* 5. Handling Anomaly */}
        <button
          id="btn-demo-handling"
          onClick={() => onTriggerScenario('HANDLING_ANOMALY')}
          disabled={isSimulatingSequence}
          className={`group flex flex-col items-center justify-center p-3 rounded-xl border text-center backdrop-blur-md transition-all ${
            activeScenario === 'HANDLING_ANOMALY'
              ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 ring-2 ring-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-purple-500/50 hover:bg-slate-900/60'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-1.5 group-hover:scale-110 transition-transform">
            <Shuffle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold font-mono text-purple-300">Axis Shift</span>
          <span className="text-[10px] text-slate-400 mt-0.5">68° Sideways Roll</span>
        </button>

        {/* 6. Live Evidence Tamper Demo & Reset Group */}
        <div className="flex flex-col gap-1.5">
          <button
            id="btn-demo-tamper-evidence"
            onClick={onOpenTamperModal}
            className="flex-1 px-2.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(37,99,235,0.15)]"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulate Evidence Tamper</span>
          </button>
          <button
            id="btn-demo-reset"
            onClick={() => onTriggerScenario('RESET')}
            className="px-2.5 py-1.5 bg-slate-950/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800/80 rounded-xl text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors backdrop-blur-md"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
