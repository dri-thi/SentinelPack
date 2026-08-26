import React, { useState } from 'react';
import {
  Activity,
  Thermometer,
  Compass,
  AlertTriangle,
  Flame,
  Clock,
  Maximize2
} from 'lucide-react';
import { IndustryProfile, TelemetryPoint } from '../types';

interface TelemetryChartsProps {
  data: TelemetryPoint[];
  profile: IndustryProfile;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ data, profile }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACCEL' | 'TEMP' | 'TILT'>('ALL');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take the most recent 35 points for high visual clarity
  const displayPoints = data.slice(-35);

  if (displayPoints.length === 0) {
    return <div className="p-8 text-center text-slate-500 font-mono">Initializing Telemetry Pipeline...</div>;
  }

  // Calculate scales
  const maxAcc = Math.max(6.0, ...displayPoints.map((p) => p.accelMag));
  const minTemp = Math.min(-2, ...displayPoints.map((p) => p.temperature));
  const maxTemp = Math.max(16, ...displayPoints.map((p) => p.temperature));
  const maxTilt = Math.max(90, ...displayPoints.map((p) => p.tiltAngle));

  const hoveredPoint = hoveredIndex !== null && displayPoints[hoveredIndex] ? displayPoints[hoveredIndex] : null;

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Real-Time Telemetry Time-Series
            </h3>
            <p className="text-xs text-slate-400">
              Synchronous sensor sampling @ 1 Hz with automated anomaly peak markers
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-950/60 backdrop-blur-md p-1 rounded-xl border border-slate-800/60">
          <button
            id="tab-chart-all"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'ALL'
                ? 'bg-blue-600/25 text-blue-300 border border-blue-500/50 font-bold shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            TRIPLE MATRIX
          </button>
          <button
            id="tab-chart-accel"
            onClick={() => setActiveTab('ACCEL')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'ACCEL'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            ACCELERATION (g)
          </button>
          <button
            id="tab-chart-temp"
            onClick={() => setActiveTab('TEMP')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'TEMP'
                ? 'bg-orange-500/25 text-orange-300 border border-orange-500/50 font-bold shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            TEMPERATURE (°C)
          </button>
          <button
            id="tab-chart-tilt"
            onClick={() => setActiveTab('TILT')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'TILT'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            TILT (°)
          </button>
        </div>
      </div>

      {/* Synchronized Hover Detail Banner */}
      {hoveredPoint && (
        <div className="mb-3.5 px-4 py-2.5 bg-slate-950/80 backdrop-blur-md border border-blue-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-[0_0_15px_rgba(37,99,235,0.15)]">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Time: <strong className="text-white">{hoveredPoint.timestamp}</strong></span>
            <span className="text-slate-600">|</span>
            <span>Location: <strong className="text-blue-300">{hoveredPoint.checkpointName}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-300">Acc: <strong>{hoveredPoint.accelMag.toFixed(2)}g</strong></span>
            <span className="text-orange-300">Temp: <strong>{hoveredPoint.temperature.toFixed(1)}°C</strong></span>
            <span className="text-purple-300">Tilt: <strong>{hoveredPoint.tiltAngle.toFixed(1)}°</strong></span>
            {hoveredPoint.detectedEvent && hoveredPoint.detectedEvent !== 'NORMAL' && (
              <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/50 font-bold animate-pulse">
                {hoveredPoint.detectedEvent}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SVG Charts Layout */}
      <div className={`grid gap-4 ${activeTab === 'ALL' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* 1. Acceleration Chart */}
        {(activeTab === 'ALL' || activeTab === 'ACCEL') && (
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 relative backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> 3-Axis Acceleration Magnitude (g)
              </span>
              <span className="text-[10px] text-slate-400">
                Threshold: <span className="text-amber-400 font-bold">{profile.impactThreshold}g</span>
              </span>
            </div>

            <div className="h-44 w-full relative">
              <svg
                viewBox="0 0 400 160"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Background Grid Lines */}
                <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(51,65,85,0.3)" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(51,65,85,0.3)" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(51,65,85,0.3)" strokeDasharray="3 3" />

                {/* Threshold Line */}
                {(() => {
                  const yThresh = 150 - (profile.impactThreshold / maxAcc) * 140;
                  return (
                    <g>
                      <line
                        x1="0"
                        y1={yThresh}
                        x2="400"
                        y2={yThresh}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      <text x="390" y={yThresh - 4} fill="#f59e0b" fontSize="8" textAnchor="end" fontFamily="monospace">
                        IMPACT LIMIT {profile.impactThreshold}g
                      </text>
                    </g>
                  );
                })()}

                {/* Acceleration Sparkline / Area */}
                {(() => {
                  const pointsCount = displayPoints.length;
                  const coords = displayPoints.map((p, i) => {
                    const x = (i / (pointsCount - 1)) * 400;
                    const y = 150 - (Math.min(maxAcc, Math.max(0, p.accelMag)) / maxAcc) * 140;
                    return { x, y, point: p, idx: i };
                  });

                  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                  const areaPath = `${linePath} L 400 155 L 0 155 Z`;

                  return (
                    <g>
                      <defs>
                        <linearGradient id="accelGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#accelGrad)" />
                      <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Spike highlight dots */}
                      {coords.map((c) => {
                        const isSpike = c.point.accelMag >= profile.impactThreshold;
                        return (
                          <g
                            key={c.point.id}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(c.idx)}
                          >
                            {isSpike && (
                              <circle
                                cx={c.x}
                                cy={c.y}
                                r="7"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1.5"
                                className="animate-ping"
                              />
                            )}
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r={isSpike ? 4.5 : 2}
                              fill={isSpike ? '#ef4444' : '#f59e0b'}
                              stroke="#05070a"
                              strokeWidth="1"
                            />
                            {isSpike && (
                              <text
                                x={c.x}
                                y={c.y - 8}
                                fill="#ef4444"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {c.point.accelMag.toFixed(1)}g
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* 2. Temperature Chart */}
        {(activeTab === 'ALL' || activeTab === 'TEMP') && (
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 relative backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
              <span className="text-orange-400 font-semibold flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Cold-Chain Temperature (°C)
              </span>
              <span className="text-[10px] text-slate-400">
                Safe: <span className="text-emerald-400 font-bold">{profile.tempMin}°C - {profile.tempMax}°C</span>
              </span>
            </div>

            <div className="h-44 w-full relative">
              <svg
                viewBox="0 0 400 160"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Safe Band Shading */}
                {(() => {
                  const yMin = 150 - ((profile.tempMin - minTemp) / (maxTemp - minTemp)) * 140;
                  const yMax = 150 - ((profile.tempMax - minTemp) / (maxTemp - minTemp)) * 140;
                  const height = Math.abs(yMin - yMax);
                  return (
                    <g>
                      <rect
                        x="0"
                        y={Math.min(yMin, yMax)}
                        width="400"
                        height={height}
                        fill="rgba(16, 185, 129, 0.12)"
                        stroke="rgba(16, 185, 129, 0.3)"
                        strokeDasharray="2 2"
                      />
                      <text x="390" y={Math.min(yMin, yMax) + 10} fill="#10b981" fontSize="7.5" textAnchor="end" fontFamily="monospace">
                        SAFE COLD-CHAIN ENVELOPE
                      </text>
                    </g>
                  );
                })()}

                {/* Temperature Curve */}
                {(() => {
                  const pointsCount = displayPoints.length;
                  const coords = displayPoints.map((p, i) => {
                    const x = (i / (pointsCount - 1)) * 400;
                    const y = 150 - ((p.temperature - minTemp) / (maxTemp - minTemp)) * 140;
                    return { x, y, point: p, idx: i };
                  });

                  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                  const areaPath = `${linePath} L 400 155 L 0 155 Z`;

                  return (
                    <g>
                      <defs>
                        <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#tempGrad)" />
                      <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />

                      {coords.map((c) => {
                        const isBreach = c.point.temperature > profile.tempMax || c.point.temperature < profile.tempMin;
                        return (
                          <g
                            key={c.point.id}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(c.idx)}
                          >
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r={isBreach ? 4 : 2}
                              fill={isBreach ? '#ef4444' : '#f97316'}
                              stroke="#05070a"
                              strokeWidth="1"
                            />
                            {isBreach && (
                              <text
                                x={c.x}
                                y={c.y - 8}
                                fill="#ef4444"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {c.point.temperature.toFixed(1)}°
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* 3. Tilt Angle Chart */}
        {(activeTab === 'ALL' || activeTab === 'TILT') && (
          <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3.5 relative backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
              <span className="text-purple-400 font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Tilt & Orientation Angle (°)
              </span>
              <span className="text-[10px] text-slate-400">
                Max Tilt: <span className="text-purple-400 font-bold">{profile.tiltThreshold}°</span>
              </span>
            </div>

            <div className="h-44 w-full relative">
              <svg
                viewBox="0 0 400 160"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Threshold Line */}
                {(() => {
                  const yThresh = 150 - (profile.tiltThreshold / maxTilt) * 140;
                  return (
                    <g>
                      <line
                        x1="0"
                        y1={yThresh}
                        x2="400"
                        y2={yThresh}
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      <text x="390" y={yThresh - 4} fill="#a855f7" fontSize="8" textAnchor="end" fontFamily="monospace">
                        TILT LIMIT {profile.tiltThreshold}°
                      </text>
                    </g>
                  );
                })()}

                {/* Tilt Line */}
                {(() => {
                  const pointsCount = displayPoints.length;
                  const coords = displayPoints.map((p, i) => {
                    const x = (i / (pointsCount - 1)) * 400;
                    const y = 150 - (Math.min(maxTilt, p.tiltAngle) / maxTilt) * 140;
                    return { x, y, point: p, idx: i };
                  });

                  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                  const areaPath = `${linePath} L 400 155 L 0 155 Z`;

                  return (
                    <g>
                      <defs>
                        <linearGradient id="tiltGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#tiltGrad)" />
                      <path d={linePath} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />

                      {coords.map((c) => {
                        const isHighTilt = c.point.tiltAngle >= profile.tiltThreshold;
                        return (
                          <g
                            key={c.point.id}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredIndex(c.idx)}
                          >
                            <circle
                              cx={c.x}
                              cy={c.y}
                              r={isHighTilt ? 4 : 2}
                              fill={isHighTilt ? '#ec4899' : '#a855f7'}
                              stroke="#05070a"
                              strokeWidth="1"
                            />
                            {isHighTilt && (
                              <text
                                x={c.x}
                                y={c.y - 8}
                                fill="#ec4899"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {c.point.tiltAngle.toFixed(0)}°
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
