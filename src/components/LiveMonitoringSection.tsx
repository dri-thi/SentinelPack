import React from 'react';
import {
  Activity,
  Compass,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Pause,
  Play,
  Shuffle,
  Flame,
  Lock,
  Radio,
  Sliders
} from 'lucide-react';
import {
  IndustryProfile,
  TelemetryPoint,
  EventType,
  MultiSensorCorrelationResult,
  MLClassificationResult
} from '../types';
import { TelemetryCharts } from './TelemetryCharts';
import { MultiSensorCorrelationView } from './MultiSensorCorrelationView';
import { AiClassificationPanel } from './AiClassificationPanel';

interface LiveMonitoringSectionProps {
  latestPoint: TelemetryPoint;
  telemetryHistory: TelemetryPoint[];
  profile: IndustryProfile;
  peakAcc: number;
  correlationResult: MultiSensorCorrelationResult;
  mlResult: MLClassificationResult;
  onOpenModelModal: () => void;
  // Scenario injection handlers
  onTriggerScenario: (scenario: EventType | 'RESET' | 'EVIDENCE_TAMPER') => void;
  isSimulatingSequence: boolean;
  activeScenario: string | null;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenTamperModal: () => void;
}

export const LiveMonitoringSection: React.FC<LiveMonitoringSectionProps> = ({
  latestPoint,
  telemetryHistory,
  profile,
  peakAcc,
  correlationResult,
  mlResult,
  onOpenModelModal,
  onTriggerScenario,
  isSimulatingSequence,
  activeScenario,
  isPaused,
  onTogglePause,
  onOpenTamperModal
}) => {
  const isAccSpike = latestPoint.accelMag >= profile.impactThreshold;
  const isTempBreached =
    latestPoint.temperature > profile.tempMax || latestPoint.temperature < profile.tempMin;
  const isTiltHigh = latestPoint.tiltAngle >= profile.tiltThreshold;
  const isTampered = latestPoint.tamperState;

  return (
    <div className="space-y-6">
      {/* Page Header with Stream Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans tracking-tight">
            Live Telemetry & Scenario Control Room
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-sensor telemetry stream, scenario injection engine, and edge classification.
          </p>
        </div>

        {/* Compact Stream Toolbar */}
        <div className="flex items-center gap-2">
          <button
            id="btn-stream-toggle-pause"
            onClick={onTogglePause}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-colors ${
              isPaused
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            id="btn-stream-reset-demo"
            onClick={() => onTriggerScenario('RESET')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Scenario Injection Toolbar / Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Simulate Transit Anomaly Scenarios
          </div>
          {isSimulatingSequence && (
            <span className="text-[11px] font-mono text-red-400 animate-pulse font-medium">
              Injecting shock sequence...
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Normal Transit */}
          <button
            id="btn-scenario-normal"
            onClick={() => onTriggerScenario('NORMAL')}
            disabled={isSimulatingSequence}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenario === 'NORMAL'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Normal Transit
            </div>
            <div className="text-[11px] text-slate-400 mt-1">1.0g Nominal Gravity</div>
          </button>

          {/* Simulate Impact */}
          <button
            id="btn-scenario-impact"
            onClick={() => onTriggerScenario('IMPACT')}
            disabled={isSimulatingSequence}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenario === 'IMPACT' || isSimulatingSequence
                ? 'bg-red-950/50 border-red-500 text-white'
                : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-red-500/40'
            }`}
          >
            <div className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Simulate Impact
            </div>
            <div className="text-[11px] text-slate-400 mt-1">5.2g Drop + Tilt Roll</div>
          </button>

          {/* Tamper Event */}
          <button
            id="btn-scenario-tamper"
            onClick={() => onTriggerScenario('TAMPERING')}
            disabled={isSimulatingSequence}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenario === 'TAMPERING'
                ? 'bg-red-950/50 border-red-500 text-white'
                : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-red-500/40'
            }`}
          >
            <div className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Tamper Event
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Switch Open Circuit</div>
          </button>

          {/* Temperature Breach */}
          <button
            id="btn-scenario-temp"
            onClick={() => onTriggerScenario('TEMPERATURE_BREACH')}
            disabled={isSimulatingSequence}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenario === 'TEMPERATURE_BREACH'
                ? 'bg-amber-950/50 border-amber-500 text-white'
                : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-amber-500/40'
            }`}
          >
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Temp Breach
            </div>
            <div className="text-[11px] text-slate-400 mt-1">12.8°C Cold Chain Break</div>
          </button>

          {/* Axis Shift */}
          <button
            id="btn-scenario-handling"
            onClick={() => onTriggerScenario('HANDLING_ANOMALY')}
            disabled={isSimulatingSequence}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeScenario === 'HANDLING_ANOMALY'
                ? 'bg-purple-950/50 border-purple-500 text-white'
                : 'bg-slate-950/50 border-slate-800/60 text-slate-300 hover:border-purple-500/40'
            }`}
          >
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5" /> Axis Shift
            </div>
            <div className="text-[11px] text-slate-400 mt-1">68° Sideways Roll</div>
          </button>

          {/* Simulate Evidence Tamper */}
          <button
            id="btn-scenario-evidence-tamper"
            onClick={onOpenTamperModal}
            className="p-3 rounded-lg border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 text-left transition-colors"
          >
            <div className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Test Tamper
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Alter Ledger Record</div>
          </button>
        </div>
      </div>

      {/* 5-Sensor Cards Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Sensor 1: Acceleration */}
        <div
          className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col justify-between ${
            isAccSpike ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Acceleration
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isAccSpike ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isAccSpike ? 'IMPACT' : 'NOMINAL'}
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {latestPoint.accelMag.toFixed(2)}
              <span className="text-xs text-slate-400 ml-1 font-sans">g</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Peak: {peakAcc.toFixed(2)}g (Limit: {profile.impactThreshold}g)
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400">
            <span>X: {latestPoint.accelX.toFixed(2)}</span>
            <span>Y: {latestPoint.accelY.toFixed(2)}</span>
            <span>Z: {latestPoint.accelZ.toFixed(2)}</span>
          </div>
        </div>

        {/* Sensor 2: Tilt and Gyroscope */}
        <div
          className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col justify-between ${
            isTiltHigh ? 'border-purple-500/80 bg-purple-950/20' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" /> Tilt & Gyro
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isTiltHigh ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTiltHigh ? 'INVERTED' : 'UPRIGHT'}
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {latestPoint.tiltAngle.toFixed(1)}
              <span className="text-xs text-slate-400 ml-1 font-sans">°</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Limit: &lt; {profile.tiltThreshold}°
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
            Orientation:{' '}
            <span className={isTiltHigh ? 'text-purple-300' : 'text-slate-300'}>
              {latestPoint.tiltAngle > 45 ? 'Sideways Lay' : latestPoint.tiltAngle > 20 ? 'Inclined' : 'Vertical'}
            </span>
          </div>
        </div>

        {/* Sensor 3: Temperature */}
        <div
          className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col justify-between ${
            isTempBreached ? 'border-amber-500/80 bg-amber-950/20' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" /> Temperature
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isTempBreached ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTempBreached ? 'BREACH' : 'REGULATED'}
            </span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {latestPoint.temperature.toFixed(1)}
              <span className="text-xs text-slate-400 ml-1 font-sans">°C</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Range: {profile.tempMin}°C - {profile.tempMax}°C
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
            Envelope:{' '}
            <span className={isTempBreached ? 'text-amber-300' : 'text-emerald-400'}>
              {isTempBreached ? 'Thermal Exceeded' : 'Cold-Chain Secure'}
            </span>
          </div>
        </div>

        {/* Sensor 4: Tamper Seal */}
        <div
          className={`bg-slate-900/60 border rounded-xl p-4 flex flex-col justify-between ${
            isTampered ? 'border-red-500/80 bg-red-950/20' : 'border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              {isTampered ? (
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              Tamper Seal
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isTampered ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isTampered ? 'OPEN' : 'SEALED'}
            </span>
          </div>

          <div className="my-2">
            <div
              className={`text-2xl font-bold font-mono ${
                isTampered ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isTampered ? 'Tripped' : 'Intact'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              Lux: {latestPoint.lightLevel} lx
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
            Loop:{' '}
            <span className={isTampered ? 'text-red-300' : 'text-emerald-400'}>
              {isTampered ? 'Circuit Broken' : 'Continuous Contact'}
            </span>
          </div>
        </div>

        {/* Sensor 5: GPS Location */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" /> GPS Location
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-blue-300">
              {latestPoint.gps.speed.toFixed(0)} km/h
            </span>
          </div>

          <div className="my-2">
            <div className="text-sm font-bold font-mono text-white truncate" title={latestPoint.checkpointName}>
              {latestPoint.checkpointName}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              {latestPoint.gps.lat.toFixed(4)}°, {latestPoint.gps.lng.toFixed(4)}°
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
            Heading: <span className="text-slate-300">{latestPoint.gps.heading}° SSE</span>
          </div>
        </div>
      </div>

      {/* Telemetry Charts */}
      <TelemetryCharts data={telemetryHistory} profile={profile} />

      {/* Multi-Sensor Correlation & AI Classification Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MultiSensorCorrelationView correlation={correlationResult} />
        <AiClassificationPanel mlResult={mlResult} onOpenModelModal={onOpenModelModal} />
      </div>
    </div>
  );
};
