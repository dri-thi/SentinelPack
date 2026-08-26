import React from 'react';
import {
  Share2,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { MultiSensorCorrelationResult, RiskLevel } from '../types';

interface MultiSensorCorrelationViewProps {
  correlation: MultiSensorCorrelationResult;
}

export const MultiSensorCorrelationView: React.FC<MultiSensorCorrelationViewProps> = ({
  correlation
}) => {
  const getSeverityBadge = (severity: RiskLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-3.5 border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center gap-2">
              <span>Multi-Sensor Correlation Engine</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-400 border border-blue-500/30">
                Cross-Signal Validation
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Correlates concurrent physical sensor vectors to eliminate single-sensor false alarms
            </p>
          </div>
        </div>

        {/* Correlation Status Flag */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border backdrop-blur-md flex items-center gap-1.5 ${getSeverityBadge(
              correlation.severity
            )}`}
          >
            {correlation.primaryEvent === 'NORMAL' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>{correlation.primaryEvent.replace('_', ' ')}</span>
            <span className="text-[10px] opacity-80 font-mono font-normal">({correlation.confidence}% CONF.)</span>
          </span>
        </div>
      </div>

      {/* Main Signal Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
        {/* Left: Individual Contributing Sensor Signals */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 backdrop-blur-md">
          <div className="text-xs font-mono text-slate-300 mb-2.5 font-bold flex items-center justify-between">
            <span>INPUT TELEMETRY SIGNALS</span>
            <span className="text-[10px] text-blue-400 font-semibold px-2 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/30">5 SENSORS ACTIVE</span>
          </div>

          <div className="space-y-2">
            {correlation.signals.map((sig, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all backdrop-blur-sm ${
                  sig.status === 'CRITICAL'
                    ? 'bg-red-950/30 border-red-500/50 text-red-200'
                    : sig.status === 'ELEVATED'
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      sig.status === 'CRITICAL'
                        ? 'bg-red-400 animate-ping'
                        : sig.status === 'ELEVATED'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  ></span>
                  <div>
                    <div className="font-semibold text-slate-200">{sig.sensorName}</div>
                    <div className="text-[10px] text-slate-400">{sig.reading}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      sig.contributesToEvent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
                    }`}
                  >
                    {sig.contributesToEvent ? 'TRIGGER' : 'NOMINAL'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Synthesis & Explainable Correlation Logic */}
        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-slate-300 mb-2.5 font-bold flex items-center justify-between">
              <span>CROSS-CORRELATION SYNTHESIS</span>
              <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded-md bg-indigo-600/10 border border-indigo-500/30">PATENTED LOGIC</span>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-indigo-500/30 rounded-xl mb-3 backdrop-blur-sm shadow-inner">
              <div className="text-xs font-mono text-indigo-300 font-bold mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Pattern: {correlation.correlationPattern}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                {correlation.explanation}
              </p>
            </div>
          </div>

          {/* Key Differentiator Banner: False Positive Elimination */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl text-xs font-mono backdrop-blur-sm">
            <div className="text-[11px] text-slate-300 mb-1.5 flex items-center gap-1">
              <span className="text-blue-400 font-bold">Why Multi-Sensor Correlation Matters:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <div className="text-amber-400 font-semibold">True Drop Impact:</div>
                <div className="mt-0.5">Acc Peak (&gt;2.5g) + Tilt Roll (&gt;15°) + GPS Movement</div>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/60">
                <div className="text-emerald-400 font-semibold">Chassis Pothole Filter:</div>
                <div className="mt-0.5">Acc Peak (&gt;2.5g) + NO Tilt (&lt;3°) = Filtered Normal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
