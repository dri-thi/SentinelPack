import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
  Compass,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Hash,
  MapPin
} from 'lucide-react';
import { IncidentReplayStep } from '../types';

interface IncidentReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const INCIDENT_REPLAY_STEPS: IncidentReplayStep[] = [
  {
    stepNumber: 1,
    title: 'Nominal Transport Telemetry',
    timestamp: '11:46:58 AM',
    phase: 'NORMAL_TELEMETRY',
    description:
      'Vehicle traveling along Interstate 880. MPU6050 reads baseline 1.01g gravity vector. Cold-chain regulated at 3.8°C. Optical tamper seal secure (0 Lux).',
    sensorState: { accel: 1.01, tilt: 2.1, temp: 3.8, tamper: false },
    badgeText: 'NOMINAL TRANSIT',
    badgeType: 'info'
  },
  {
    stepNumber: 2,
    title: 'Severe Acceleration Spike Detected',
    timestamp: '11:47:01 AM',
    phase: 'ACCELERATION_SPIKE',
    description:
      'MPU6050 accelerometer registers sudden high-g dynamic shock wave climbing through 2.4g to a peak of 5.2g (Threshold Limit: 2.5g).',
    sensorState: { accel: 5.2, tilt: 18.4, temp: 3.9, tamper: false },
    badgeText: '5.2g SHOCK SPIKE',
    badgeType: 'danger'
  },
  {
    stepNumber: 3,
    title: 'Angular Tumble & Orientation Inversion',
    timestamp: '11:47:02 AM',
    phase: 'TILT_CHANGE',
    description:
      'Digital gyroscope registers rapid angular roll: tilt angle reaches 42.0°, indicating physical package dislodgement and box inversion.',
    sensorState: { accel: 3.1, tilt: 42.0, temp: 3.9, tamper: false },
    badgeText: '42.0° TILT ROLL',
    badgeType: 'warning'
  },
  {
    stepNumber: 4,
    title: 'Multi-Sensor Correlation Synthesis',
    timestamp: '11:47:03 AM',
    phase: 'MULTI_SENSOR_CORRELATION',
    description:
      'Correlation engine synthesizes simultaneous acceleration spike + angular tumble + GPS velocity. Rejects isolated pothole hypothesis; confirms true physical drop.',
    sensorState: { accel: 1.8, tilt: 44.5, temp: 4.0, tamper: false },
    badgeText: 'CORRELATED DROP',
    badgeType: 'warning'
  },
  {
    stepNumber: 5,
    title: 'Random Forest AI Classification',
    timestamp: '11:47:03 AM',
    phase: 'AI_CLASSIFICATION',
    description:
      'Edge Random Forest Classifier executes inference across 12-dimensional feature window. Predicts IMPACT DETECTED with 94% calculated confidence and HIGH severity.',
    sensorState: { accel: 1.2, tilt: 44.0, temp: 4.1, tamper: false },
    badgeText: 'IMPACT (94% CONF)',
    badgeType: 'danger'
  },
  {
    stepNumber: 6,
    title: 'Cryptographic Evidence Block Generation',
    timestamp: '11:47:04 AM',
    phase: 'EVIDENCE_SECURED',
    description:
      'System serializes canonical sensor payload, derives SHA-256 block hash linked to Previous Hash H_n-1, and attaches HMAC-SHA256 hardware signature.',
    sensorState: { accel: 1.04, tilt: 43.8, temp: 4.1, tamper: false },
    badgeText: 'SHA-256 SECURED',
    badgeType: 'success'
  },
  {
    stepNumber: 7,
    title: 'Digital Chain of Custody Updated',
    timestamp: '11:47:05 AM',
    phase: 'CHAIN_OF_CUSTODY_UPDATED',
    description:
      'Incident pinpointed at Transit Point 2 (Fremont Interchange). Evidence appended to immutable ledger. Control room dashboard and freight custodian alerted.',
    sensorState: { accel: 1.02, tilt: 43.5, temp: 4.1, tamper: false },
    badgeText: 'LEDGER COMMITTED',
    badgeType: 'success'
  }
];

export const IncidentReplayModal: React.FC<IncidentReplayModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= INCIDENT_REPLAY_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  if (!isOpen) return null;

  const currentStep = INCIDENT_REPLAY_STEPS[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] relative backdrop-blur-2xl">
        <button
          id="btn-close-replay-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-800/60">
          <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <span>Incident Replay & Step-by-Step Pipeline</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-600/10 text-blue-400 border border-blue-500/30 font-mono font-bold">
                Interactive Walkthrough
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrating the full SentinelPack architecture from sensor physics to immutable ledger update.
            </p>
          </div>
        </div>

        {/* Progress Bar / Step Indicators */}
        <div className="grid grid-cols-7 gap-1.5 mb-5">
          {INCIDENT_REPLAY_STEPS.map((step, idx) => (
            <button
              key={step.stepNumber}
              onClick={() => setCurrentStepIndex(idx)}
              className={`p-1.5 rounded-xl border text-center transition-all backdrop-blur-sm ${
                currentStepIndex === idx
                  ? 'bg-blue-600/25 border-blue-400 text-blue-300 ring-2 ring-blue-500/40 font-bold shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                  : currentStepIndex > idx
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  : 'bg-slate-950/40 border-slate-800/40 text-slate-600'
              }`}
            >
              <div className="text-[10px] font-mono">0{step.stepNumber}</div>
            </button>
          ))}
        </div>

        {/* Active Step Content Card */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-5 mb-5 shadow-inner backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-600/15 text-blue-400 border border-blue-500/30">
                STAGE 0{currentStep.stepNumber} / 07
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentStep.timestamp}
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border backdrop-blur-sm ${
                currentStep.badgeType === 'danger'
                  ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                  : currentStep.badgeType === 'warning'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : currentStep.badgeType === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
              }`}
            >
              {currentStep.badgeText}
            </span>
          </div>

          <h3 className="text-base font-bold text-white font-sans mb-2">
            {currentStep.title}
          </h3>
          <p className="text-sm text-slate-300 font-sans leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Sensor Snapshot for this Replay Step */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/60 text-xs font-mono">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px]">MPU6050 Accel</div>
              <div className="text-amber-400 font-bold mt-0.5">{currentStep.sensorState.accel.toFixed(2)}g</div>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px]">Gyro Tilt</div>
              <div className="text-purple-400 font-bold mt-0.5">{currentStep.sensorState.tilt.toFixed(1)}°</div>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px]">Temperature</div>
              <div className="text-orange-400 font-bold mt-0.5">{currentStep.sensorState.temp.toFixed(1)}°C</div>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 backdrop-blur-sm">
              <div className="text-slate-400 text-[10px]">Tamper Seal</div>
              <div className={`font-bold mt-0.5 ${currentStep.sensorState.tamper ? 'text-red-400' : 'text-emerald-400'}`}>
                {currentStep.sensorState.tamper ? 'TRIPPED' : 'INTACT'}
              </div>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <button
            id="btn-replay-prev"
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-2 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5 border border-slate-700/40 backdrop-blur-md transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Stage</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-replay-autoplay"
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-blue-950/40 transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Replay' : 'Auto Playback'}</span>
            </button>
            <button
              id="btn-replay-reset"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStepIndex(0);
              }}
              className="p-2 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white rounded-xl border border-slate-700/40 backdrop-blur-md transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-replay-next"
            onClick={() =>
              setCurrentStepIndex((prev) => Math.min(INCIDENT_REPLAY_STEPS.length - 1, prev + 1))
            }
            disabled={currentStepIndex === INCIDENT_REPLAY_STEPS.length - 1}
            className="px-3.5 py-2 bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5 border border-slate-700/40 backdrop-blur-md transition-all"
          >
            <span>Next Stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
