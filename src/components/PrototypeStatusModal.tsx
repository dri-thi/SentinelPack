import React from 'react';
import { CheckCircle2, Circle, Info, X, Shield, Cpu, Zap, ArrowRight } from 'lucide-react';

interface PrototypeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrototypeStatusModal: React.FC<PrototypeStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] relative backdrop-blur-2xl">
        <button
          id="btn-close-status-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-amber-600/15 text-amber-400 border border-amber-500/30">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <span>SentinelPack Capstone Architecture & Roadmap</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-amber-600/15 text-amber-400 border border-amber-500/30 font-mono font-bold">
                Technical Honesty
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Clear distinction between Round 2 Software Proof-of-Concept / Digital Twin and Round 3 Hardware Deployment.
            </p>
          </div>
        </div>

        {/* Technical Disclosure Statement */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl mb-5 text-xs text-slate-300 font-sans leading-relaxed backdrop-blur-md">
          <div className="text-blue-400 font-bold font-mono mb-1.5 text-sm">
            Engineering Disclosure: Software Proof-of-Concept & Digital Twin
          </div>
          <p>
            For Round 2 of our Capstone, SentinelPack is presented as a high-fidelity <strong>Software Proof-of-Concept and Digital Twin</strong>. While physical sensor telemetry is mathematically simulated with authentic physics and noise curves, the entire backend pipeline—including <strong>Multi-Sensor Correlation</strong>, <strong>Machine Learning Anomaly Classification</strong>, <strong>SHA-256 Hash Chaining</strong>, <strong>HMAC Signatures</strong>, and <strong>Interactive Control Room Dashboards</strong>—is fully functional and production-architected.
          </p>
        </div>

        {/* Status Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Round 2 Implemented */}
          <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Round 2 Implemented (Current)
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/60">
                100% WORKING
              </span>
            </div>

            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>3-Axis MPU6050 & Gyro physics simulation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Real-time instantaneous event detection</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Multi-sensor cross-signal correlation engine</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Edge Random Forest Classifier (12D features)</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>SHA-256 Hash-Chained evidence ledger</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>HMAC-SHA256 device authenticity check</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Live interactive tamper attack simulation</span>
              </li>
              <li className="flex items-start gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Incident step-by-step replay animator</span>
              </li>
            </ul>
          </div>

          {/* Round 3 Future Hardware Roadmap */}
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Round 3 Hardware Roadmap (Future)
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/80 text-slate-400 border border-slate-700/60">
                PLANNED
              </span>
            </div>

            <ul className="space-y-2 text-xs font-mono">
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>ESP32-S3 Microcontroller firmware build</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Physical MPU6050 6-DOF I2C accelerometer wiring</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>NEO-6M GNSS / GPS satellite module integration</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Dallas DS18B20 digital thermal sensor probe</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Physical tamper break-wire / optical photodiode</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Dynamic sensor zero-g calibration routines</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <Circle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Live commercial fleet field testing</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            id="btn-close-status-bottom"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold border border-slate-700/60 backdrop-blur-md transition-all shadow-md"
          >
            Acknowledge & Return to Control Room
          </button>
        </div>
      </div>
    </div>
  );
};
