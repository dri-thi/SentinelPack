import React from 'react';
import {
  BrainCircuit,
  Zap,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Flame,
  ShieldAlert,
  HelpCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { EventType, MLClassificationResult, RiskLevel } from '../types';

interface AiClassificationPanelProps {
  mlResult: MLClassificationResult;
  onOpenModelModal: () => void;
}

export const AiClassificationPanel: React.FC<AiClassificationPanelProps> = ({
  mlResult,
  onOpenModelModal
}) => {
  const getEventIcon = (evt: EventType) => {
    switch (evt) {
      case 'IMPACT':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'TAMPERING':
        return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'TEMPERATURE_BREACH':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'HANDLING_ANOMALY':
        return <Sliders className="w-5 h-5 text-purple-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getSeverityColor = (sev: RiskLevel) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/60 border-red-800';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'MEDIUM':
        return 'text-yellow-300 bg-yellow-950/60 border-yellow-800';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3.5 pb-3.5 border-b border-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
                Edge AI Classification Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Random Forest Classifier • Live Temporal Window Inference
              </p>
            </div>
          </div>

          <button
            id="btn-inspect-ml-model"
            onClick={onOpenModelModal}
            className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 px-3 py-1.5 rounded-xl border border-indigo-700/50 backdrop-blur-md transition-all shadow-[0_0_10px_rgba(99,102,241,0.15)]"
          >
            <span>Confusion Matrix</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Primary Classification Result Badge */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 mb-3.5 backdrop-blur-md shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-md">
                {getEventIcon(mlResult.predictedClass)}
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                  PREDICTED EVENT CLASS
                </div>
                <div className="text-base font-bold font-mono text-white tracking-wide">
                  {mlResult.predictedClass.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                CONFIDENCE
              </div>
              <div className="text-xl font-bold font-mono text-blue-400">
                {mlResult.confidence}%
              </div>
            </div>
          </div>

          {/* Severity Meter */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Calculated Risk Level:</span>
            <span
              className={`px-2.5 py-0.5 rounded-md font-bold border text-[11px] backdrop-blur-sm ${getSeverityColor(
                mlResult.severity
              )}`}
            >
              {mlResult.severity}
            </span>
          </div>
        </div>

        {/* Extracted Feature Vector Preview */}
        <div className="mb-3.5">
          <div className="text-[11px] font-mono text-slate-300 mb-2 font-bold flex items-center justify-between">
            <span>EXTRACTED FEATURE VECTOR (12D)</span>
            <span className="text-[10px] text-slate-400 font-normal">WINDOW = 15 SAMPLES</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400">maxAcc</div>
              <div className="text-amber-400 font-semibold">{mlResult.features.maxAcc.toFixed(2)}g</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400">accVariance</div>
              <div className="text-blue-400 font-semibold">{mlResult.features.accVariance.toFixed(3)}</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400">maxTilt</div>
              <div className="text-purple-400 font-semibold">{mlResult.features.maxTilt.toFixed(1)}°</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400">tiltDelta</div>
              <div className="text-purple-300 font-semibold">{mlResult.features.tiltDelta.toFixed(1)}°</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400">tempRate</div>
              <div className="text-orange-400 font-semibold">{mlResult.features.tempRate > 0 ? '+' : ''}{mlResult.features.tempRate.toFixed(2)}°/m</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400">tamperFlag</div>
              <div className={`font-semibold ${mlResult.features.tamperFlag ? 'text-red-400' : 'text-emerald-400'}`}>
                {mlResult.features.tamperFlag ? '1 (TRIP)' : '0 (SEAL)'}
              </div>
            </div>
          </div>
        </div>

        {/* Ensemble Class Probabilities */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-slate-300 mb-1.5 font-bold">
            ENSEMBLE CLASS PROBABILITIES
          </div>
          {(['NORMAL', 'IMPACT', 'TAMPERING', 'HANDLING_ANOMALY', 'TEMPERATURE_BREACH'] as const).map(
            (cls) => {
              const prob = mlResult.probabilities[cls] || 0;
              const percent = Math.round(prob * 100);
              const isTop = mlResult.predictedClass === cls;
              return (
                <div key={cls} className="space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className={isTop ? 'text-white font-bold' : 'text-slate-400'}>
                      {cls.replace('_', ' ')}
                    </span>
                    <span className={isTop ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                      {percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden border border-slate-800/60">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isTop ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'
                      }`}
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
