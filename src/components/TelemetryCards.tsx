import React from 'react';
import {
  Activity,
  Compass,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Zap,
  Gauge
} from 'lucide-react';
import { IndustryProfile, TelemetryPoint } from '../types';

interface TelemetryCardsProps {
  latestPoint: TelemetryPoint;
  profile: IndustryProfile;
  peakAcc: number;
}

export const TelemetryCards: React.FC<TelemetryCardsProps> = ({
  latestPoint,
  profile,
  peakAcc
}) => {
  const isAccSpike = latestPoint.accelMag >= profile.impactThreshold;
  const isTempBreached =
    latestPoint.temperature > profile.tempMax || latestPoint.temperature < profile.tempMin;
  const isTiltHigh = latestPoint.tiltAngle >= profile.tiltThreshold;
  const isTampered = latestPoint.tamperState;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Accelerometer Card */}
      <div
        className={`bg-slate-900/40 border rounded-2xl p-4 backdrop-blur-xl transition-all relative overflow-hidden shadow-xl ${
          isAccSpike
            ? 'border-red-500/80 bg-red-950/25 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
            : 'border-slate-800/60'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`p-1.5 rounded-xl ${
                isAccSpike
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-600/15 text-blue-400'
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              MPU6050 ACCEL
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
              isAccSpike
                ? 'bg-red-500/20 text-red-300 border border-red-500/60 animate-pulse'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
            }`}
          >
            {isAccSpike ? 'IMPACT PEAK' : 'NOMINAL 1.0g'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {latestPoint.accelMag.toFixed(2)}
              <span className="text-xs text-slate-400 ml-1 font-sans">g</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Peak: <span className="text-amber-400 font-semibold">{peakAcc.toFixed(2)}g</span> (Limit: {profile.impactThreshold}g)
            </div>
          </div>
        </div>

        {/* 3-Axis Vector Breakdown */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
          <div className="bg-slate-950/60 backdrop-blur-sm border border-slate-800/40 px-2 py-1 rounded-lg text-slate-400">
            X: <span className="text-blue-400 font-semibold">{latestPoint.accelX.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950/60 backdrop-blur-sm border border-slate-800/40 px-2 py-1 rounded-lg text-slate-400">
            Y: <span className="text-blue-400 font-semibold">{latestPoint.accelY.toFixed(2)}</span>
          </div>
          <div className="bg-slate-950/60 backdrop-blur-sm border border-slate-800/40 px-2 py-1 rounded-lg text-slate-400">
            Z: <span className="text-blue-400 font-semibold">{latestPoint.accelZ.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. Tilt / Inclinometer Card */}
      <div
        className={`bg-slate-900/40 border rounded-2xl p-4 backdrop-blur-xl transition-all relative overflow-hidden shadow-xl ${
          isTiltHigh
            ? 'border-purple-500/80 bg-purple-950/25 shadow-[0_0_20px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/50'
            : 'border-slate-800/60'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`p-1.5 rounded-xl ${
                isTiltHigh
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-indigo-500/15 text-indigo-400'
              }`}
            >
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              TILT / GYRO
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
              isTiltHigh
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
            }`}
          >
            {isTiltHigh ? 'TILT ALERT' : 'UPRIGHT'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {latestPoint.tiltAngle.toFixed(1)}
              <span className="text-xs text-slate-400 ml-1 font-sans">°</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Max Allowable: <span className="text-purple-400 font-semibold">{profile.tiltThreshold}°</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Orientation:</span>
          <span className={`font-semibold ${isTiltHigh ? 'text-purple-300' : 'text-emerald-400'}`}>
            {latestPoint.tiltAngle > 45 ? 'SIDEWAYS LAY' : latestPoint.tiltAngle > 20 ? 'INCLINED' : 'VERTICAL'}
          </span>
        </div>
      </div>

      {/* 3. Temperature Card */}
      <div
        className={`bg-slate-900/40 border rounded-2xl p-4 backdrop-blur-xl transition-all relative overflow-hidden shadow-xl ${
          isTempBreached
            ? 'border-orange-500/80 bg-orange-950/25 shadow-[0_0_20px_rgba(249,115,22,0.25)] ring-1 ring-orange-500/50'
            : 'border-slate-800/60'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`p-1.5 rounded-xl ${
                isTempBreached
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              <Thermometer className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              COLD-CHAIN TEMP
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
              isTempBreached
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/60 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isTempBreached ? 'BREACH' : 'SAFE BAND'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {latestPoint.temperature.toFixed(1)}
              <span className="text-xs text-slate-400 ml-1 font-sans">°C</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Safe: <span className="text-emerald-400">{profile.tempMin}°C - {profile.tempMax}°C</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Envelope Status:</span>
          <span className={`font-semibold ${isTempBreached ? 'text-orange-400' : 'text-emerald-400'}`}>
            {isTempBreached ? 'EXCEEDED' : 'REGULATED'}
          </span>
        </div>
      </div>

      {/* 4. Tamper Detection Card */}
      <div
        className={`bg-slate-900/40 border rounded-2xl p-4 backdrop-blur-xl transition-all relative overflow-hidden shadow-xl ${
          isTampered
            ? 'border-red-500/80 bg-red-950/25 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
            : 'border-slate-800/60'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className={`p-1.5 rounded-xl ${
                isTampered
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              {isTampered ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              TAMPER SEAL
            </span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
              isTampered
                ? 'bg-red-500/20 text-red-300 border border-red-500/60 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isTampered ? 'OPEN / BREACH' : 'SEALED'}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className={`text-2xl font-bold font-mono tracking-tight ${isTampered ? 'text-red-400' : 'text-emerald-400'}`}>
              {isTampered ? 'TRIPPED' : 'INTACT'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Ambient Lux: <span className={latestPoint.lightLevel > 50 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>{latestPoint.lightLevel} lx</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Loop Continuity:</span>
          <span className={`font-semibold ${isTampered ? 'text-red-400' : 'text-emerald-400'}`}>
            {isTampered ? 'OPEN CIRCUIT' : 'CLOSED LOOP'}
          </span>
        </div>
      </div>

      {/* 5. GPS & Transit Corridor */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-xl bg-blue-500/15 text-blue-400">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-200">
              GPS LOCATION
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-blue-600/10 text-blue-400 border border-blue-500/40 font-bold">
            {latestPoint.gps.speed.toFixed(0)} km/h
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="text-sm font-bold font-mono text-white truncate max-w-[150px]">
              {latestPoint.checkpointName}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              {latestPoint.gps.lat.toFixed(4)}, {latestPoint.gps.lng.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>Fix Quality:</span>
          <span className="text-blue-400 font-semibold">3D FIX (9 SATs)</span>
        </div>
      </div>
    </div>
  );
};
