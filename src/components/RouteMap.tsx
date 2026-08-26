import React from 'react';
import {
  MapPin,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Clock,
  ShieldAlert,
  Building,
  User,
  Radio
} from 'lucide-react';
import { Checkpoint, EventType, PackageData, TelemetryPoint } from '../types';

interface RouteMapProps {
  checkpoints: Checkpoint[];
  currentPoint: TelemetryPoint;
  packageData: PackageData;
  incidentPoint?: {
    locationName: string;
    timestamp: string;
    coordinates: string;
    eventType: EventType;
    severity: string;
  } | null;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  checkpoints,
  currentPoint,
  packageData,
  incidentPoint
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-3.5 border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Transit Route & Incident Geolocation
            </h3>
            <p className="text-xs text-slate-400">
              Corridor traceability: Pinpointing What, When, and Where incidents occur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">CURRENT GEO:</span>
          <span className="px-3 py-1 rounded-xl bg-slate-950/60 text-blue-300 border border-slate-800/60 backdrop-blur-md font-bold shadow-inner">
            {currentPoint.gps.lat.toFixed(4)}°N, {Math.abs(currentPoint.gps.lng).toFixed(4)}°W
          </span>
        </div>
      </div>

      {/* Primary Incident Callout Banner if Incident Detected */}
      {incidentPoint && (
        <div className="mb-4 p-3.5 bg-amber-950/30 border border-amber-500/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-md animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                INCIDENT PINPOINTED ON CHAIN
              </div>
              <div className="text-sm font-bold font-mono text-white">
                {incidentPoint.eventType.replace('_', ' ')} @ {incidentPoint.locationName}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">TIMESTAMP: </span>
              <span className="text-amber-300 font-bold">{incidentPoint.timestamp}</span>
            </div>
            <div>
              <span className="text-slate-400">COORDINATES: </span>
              <span className="text-blue-300 font-bold">{incidentPoint.coordinates}</span>
            </div>
            <div>
              <span className="text-slate-400">SEVERITY: </span>
              <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/50 font-bold">
                {incidentPoint.severity}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Waypoint Pipeline Track */}
      <div className="py-2">
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-6 right-6 h-1 bg-slate-800/80 -translate-y-1/2 z-0 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 transition-all duration-500"
              style={{ width: packageData.id === 'SP-001' ? '65%' : '45%' }}
            ></div>
          </div>

          {/* Checkpoint Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative z-10">
            {checkpoints.map((cp, idx) => {
              const isCurrent = currentPoint.checkpointName.includes(cp.name.split(' ')[0]) || cp.id === 'cp-4';
              const isIncidentNode = cp.id === 'cp-4' && packageData.status === 'INCIDENT_DETECTED';
              const isPassed = idx < 3;

              return (
                <div
                  key={cp.id}
                  className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all backdrop-blur-md ${
                    isIncidentNode
                      ? 'border-amber-500/80 ring-2 ring-amber-500/40 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : isCurrent
                      ? 'border-blue-500/80 ring-1 ring-blue-500/30 bg-blue-950/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                      : isPassed
                      ? 'border-slate-800/60 bg-slate-950/60'
                      : 'border-slate-800/40 bg-slate-950/30 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STEP 0{idx + 1}
                    </span>
                    {isIncidentNode ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        INCIDENT
                      </span>
                    ) : isPassed ? (
                      <span className="text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : isCurrent ? (
                      <span className="text-blue-400">
                        <Radio className="w-4 h-4 animate-spin" />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">ETA {cp.eta}</span>
                    )}
                  </div>

                  <div className="my-1">
                    <div className="text-xs font-bold font-mono text-white truncate">
                      {cp.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {cp.custodian.split('-')[0]}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>{cp.lat.toFixed(2)}°, {cp.lng.toFixed(2)}°</span>
                    {cp.passedAt && <span className="text-slate-300">{cp.passedAt.split(' ')[0]}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
