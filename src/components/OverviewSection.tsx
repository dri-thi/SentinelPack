import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Truck,
  Wifi,
  Info,
  X,
  MapPin,
  Clock,
  UserCheck,
  FileText,
  CheckCircle2
} from 'lucide-react';
import {
  PackageData,
  IndustryProfile,
  TelemetryPoint,
  VerificationResult,
  EvidenceRecord,
  Checkpoint
} from '../types';
import { RouteMap } from './RouteMap';

interface OverviewSectionProps {
  currentPackage: PackageData;
  selectedProfile: IndustryProfile;
  latestPoint: TelemetryPoint;
  peakAcc: number;
  verificationResult: VerificationResult;
  evidenceRecords: EvidenceRecord[];
  checkpoints: Checkpoint[];
  onNavigateToMonitoring: () => void;
  onNavigateToIncidents: () => void;
  onNavigateToIntegrity: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  currentPackage,
  selectedProfile,
  latestPoint,
  peakAcc: _peakAcc,
  verificationResult,
  evidenceRecords,
  checkpoints,
  onNavigateToMonitoring,
  onNavigateToIncidents,
  onNavigateToIntegrity
}) => {
  // Modal state for expanded checkpoint details
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);

  // Incidents filter from actual evidence records
  const incidentRecords = evidenceRecords.filter((r) => r.eventType !== 'NORMAL');
  const hasIncident =
    currentPackage.status === 'INCIDENT_DETECTED' ||
    currentPackage.status === 'TAMPERED' ||
    incidentRecords.length > 0;

  // Latest incident for concise explanation
  const latestIncident = incidentRecords.length > 0 ? incidentRecords[incidentRecords.length - 1] : null;

  // 1. SENSOR CONNECTIVITY: Kept separate from package safety and incident severity.
  // Evaluate the 5 physical/telemetry sensor channels (Acceleration, Tilt/Gyro, Temperature, Tamper Circuit, GPS)
  const isAccelReporting = latestPoint.accelMag !== undefined && latestPoint.accelMag > 0;
  const isTiltReporting = latestPoint.tiltAngle !== undefined && !isNaN(latestPoint.tiltAngle);
  const isTempReporting = latestPoint.temperature !== undefined && !isNaN(latestPoint.temperature);
  const isTamperReporting = latestPoint.tamperState !== undefined || latestPoint.lightLevel !== undefined;
  const isGpsReporting = Boolean(latestPoint.gps && latestPoint.gps.lat !== 0 && latestPoint.gps.lng !== 0);

  const connectedSensorsList = [
    isAccelReporting,
    isTiltReporting,
    isTempReporting,
    isTamperReporting,
    isGpsReporting
  ];
  const onlineCount = connectedSensorsList.filter(Boolean).length;
  const allFiveOnline = onlineCount === 5;
  const sensorConnectivityText = allFiveOnline ? '5/5 Online' : `${onlineCount}/5 Online`;

  // Concise incident explanation based on real event data
  const getConciseIncidentExplanation = (record: EvidenceRecord | null): string => {
    if (!record) return 'No threshold excursions detected. Package telemetry is within nominal tolerances.';

    switch (record.eventType) {
      case 'IMPACT':
        return `High impact shock of ${record.sensorSnapshot.accelMag.toFixed(2)}g detected at ${record.checkpointName} (${record.timestamp}), exceeding the ${selectedProfile.impactThreshold.toFixed(1)}g tolerance threshold.`;
      case 'TAMPERING':
        return `Tamper detection circuit triggered at ${record.checkpointName} (${record.timestamp}): enclosure open circuit detected.`;
      case 'TEMPERATURE_BREACH':
        return `Thermal excursion of ${record.sensorSnapshot.temperature.toFixed(1)}°C at ${record.checkpointName} (${record.timestamp}) exceeded profile boundaries (${selectedProfile.tempMin.toFixed(1)}°C to ${selectedProfile.tempMax.toFixed(1)}°C).`;
      case 'HANDLING_ANOMALY':
        return `Orientation tilt of ${record.sensorSnapshot.tiltAngle.toFixed(1)}° at ${record.checkpointName} (${record.timestamp}) exceeded ${selectedProfile.tiltThreshold}° allowable transit limit.`;
      default:
        return record.explanation || 'Threshold excursion recorded during transit.';
    }
  };

  // Helper to get formatted readable titles for checkpoints
  const formatCheckpointLabel = (cp: Checkpoint) => {
    if (cp.name.includes('(')) {
      const match = cp.name.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        return {
          title: match[1].trim(),
          subtitle: match[2].trim()
        };
      }
    }
    return {
      title: cp.name,
      subtitle:
        cp.type === 'ORIGIN'
          ? 'Origin Facility'
          : cp.type === 'DESTINATION'
          ? 'Final Destination'
          : cp.type === 'HUB'
          ? 'Sorting Hub'
          : 'Transit Point'
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans tracking-tight">
            Package Custody & Telemetry Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status, cryptographic custody chain integrity, and transit verification for asset{' '}
            <span className="text-slate-200 font-mono font-medium">{currentPackage.id}</span>.
          </p>
        </div>

        {/* 2. SEPARATE INDICATORS: Incident Detected, High Risk, and Chain Intact as separate indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Indicator 1: Incident Detected / Normal Transit */}
          <div
            className={`px-3 py-1.5 rounded-lg font-mono font-medium border flex items-center gap-2 ${
              hasIncident
                ? 'bg-red-950/50 text-red-300 border-red-800/70'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasIncident ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span>{hasIncident ? 'Incident Detected' : 'Normal Transit'}</span>
          </div>

          {/* Indicator 2: Risk Level */}
          <div
            className={`px-3 py-1.5 rounded-lg font-mono font-medium border ${
              currentPackage.riskLevel === 'HIGH'
                ? 'bg-amber-950/50 text-amber-300 border-amber-800/70'
                : currentPackage.riskLevel === 'MEDIUM'
                ? 'bg-yellow-950/40 text-yellow-300 border-yellow-800/60'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <span>{currentPackage.riskLevel} Risk</span>
          </div>

          {/* Indicator 3: Chain Intact / Chain Compromised */}
          <div
            className={`px-3 py-1.5 rounded-lg font-mono font-medium border flex items-center gap-2 ${
              verificationResult.chainIntact
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-red-950/60 text-red-300 border-red-500/70'
            }`}
          >
            {verificationResult.chainIntact ? (
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            )}
            <span>{verificationResult.chainIntact ? 'Chain Intact' : 'Chain Compromised'}</span>
          </div>

          {/* Profile Identifier */}
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            Profile: <span className="text-blue-400 font-medium">{selectedProfile.name}</span>
          </div>
        </div>
      </div>

      {/* Concise Incident Explanation Banner (where actual event data is available) */}
      {hasIncident && latestIncident && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-red-200 flex items-center gap-2">
                <span>Incident Detected: {latestIncident.eventType.replace('_', ' ')}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 uppercase">
                  {latestIncident.severity}
                </span>
              </div>
              <p className="text-slate-300 mt-1 font-sans leading-relaxed">
                {getConciseIncidentExplanation(latestIncident)}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-incident-banner-link"
            onClick={onNavigateToIncidents}
            className="self-start sm:self-center text-xs font-mono text-red-200 hover:text-white flex items-center gap-1.5 flex-shrink-0 bg-red-900/40 hover:bg-red-900/70 border border-red-700/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <span>View Incident Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Package Status */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300">Package Status</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold font-mono text-white">
              {currentPackage.status.replace('_', ' ')}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              SKU: {currentPackage.sku}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <span>Battery: {currentPackage.batteryLevel}%</span>
            <span>Signal: {currentPackage.cellularSignal}%</span>
          </div>
        </div>

        {/* Card 2: Active Incidents */}
        <div
          onClick={onNavigateToIncidents}
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300">Active Incidents</span>
            <AlertTriangle
              className={`w-4 h-4 ${
                incidentRecords.length > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            />
          </div>
          <div className="my-2">
            <div
              className={`text-lg font-bold font-mono ${
                incidentRecords.length > 0 ? 'text-amber-300' : 'text-emerald-400'
              }`}
            >
              {incidentRecords.length === 0 ? '0 Detected' : `${incidentRecords.length} Event(s)`}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono truncate" title={currentPackage.riskLevel}>
              Risk: <span className="text-slate-200">{currentPackage.riskLevel}</span>
              {latestIncident && ` • ${latestIncident.eventType.replace('_', ' ')}`}
            </p>
          </div>
          <button
            type="button"
            id="btn-overview-view-incidents"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToIncidents();
            }}
            className="text-[11px] text-blue-400 pt-2 border-t border-slate-800/60 flex items-center justify-between group-hover:text-blue-300 w-full text-left cursor-pointer"
          >
            <span>View Incident Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Sensor Connectivity (5/5 Online) */}
        <div
          onClick={onNavigateToMonitoring}
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300">Sensor Connectivity</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-lg font-bold font-mono text-emerald-400">
              {sensorConnectivityText}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              IMU • Tilt • Temp • Tamper • GPS
            </p>
          </div>
          <button
            type="button"
            id="btn-overview-open-feeds"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToMonitoring();
            }}
            className="text-[11px] text-blue-400 pt-2 border-t border-slate-800/60 flex items-center justify-between group-hover:text-blue-300 w-full text-left cursor-pointer"
          >
            <span>Open Live Feeds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Evidence Integrity */}
        <div
          onClick={onNavigateToIntegrity}
          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium text-slate-300">Evidence Integrity</span>
            {verificationResult.chainIntact ? (
              <FileCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="my-2">
            <div
              className={`text-lg font-bold font-mono ${
                verificationResult.chainIntact ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {verificationResult.chainIntact ? 'Chain Intact' : 'Integrity Failed'}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {verificationResult.verifiedRecords} / {verificationResult.totalRecords} Records Verified
            </p>
          </div>
          <button
            type="button"
            id="btn-overview-audit-ledger"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToIntegrity();
            }}
            className="text-[11px] text-blue-400 pt-2 border-t border-slate-800/60 flex items-center justify-between group-hover:text-blue-300 w-full text-left cursor-pointer"
          >
            <span>Audit Cryptographic Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. SHIPMENT TIMELINE & WAYPOINTS: Responsive cards with readable checkpoint names and accessible details */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Shipment Transit Route & Waypoint Sequence
              </h3>
              <p className="text-xs text-slate-400">
                Origin: <span className="text-slate-200">{currentPackage.origin}</span> → Destination:{' '}
                <span className="text-slate-200">{currentPackage.destination}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Current Checkpoint:</span>
            <span className="text-blue-300 font-semibold bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              {currentPackage.currentCheckpoint}
            </span>
          </div>
        </div>

        {/* Responsive Checkpoint Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-4">
          {checkpoints.map((cp, idx) => {
            const isPassed = cp.status === 'PASSED';
            const isCurrent = cp.status === 'CURRENT';
            const { title, subtitle } = formatCheckpointLabel(cp);

            return (
              <div
                key={cp.id}
                onClick={() => setSelectedCheckpoint(cp)}
                className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between transition-all cursor-pointer group ${
                  isCurrent
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-200 shadow-[0_0_12px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30'
                    : isPassed
                    ? 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-950/20 border-slate-800/40 text-slate-400 hover:border-slate-700/60'
                }`}
                title={`Click to view details for ${cp.name}`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                    <span className="font-semibold text-slate-400">STEP {idx + 1}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                        isCurrent
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : isPassed
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cp.status}
                    </span>
                  </div>

                  {/* Fully readable, non-truncated checkpoint labels */}
                  <div className="font-medium text-white text-xs leading-snug group-hover:text-blue-300 transition-colors">
                    {title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {subtitle}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono">
                    {isPassed ? `Passed: ${cp.passedAt || cp.eta}` : `ETA: ${cp.eta}`}
                  </span>
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transit Route Map */}
      <RouteMap
        checkpoints={checkpoints}
        currentPoint={latestPoint}
        packageData={currentPackage}
        incidentPoint={
          hasIncident && latestIncident
            ? {
                locationName: latestIncident.checkpointName,
                timestamp: latestIncident.timestamp,
                coordinates: `${latestIncident.location.lat.toFixed(4)}° N, ${Math.abs(
                  latestIncident.location.lng
                ).toFixed(4)}° W`,
                eventType: latestIncident.eventType,
                severity: latestIncident.severity
              }
            : null
        }
      />

      {/* Accessible Checkpoint Detail Modal */}
      {selectedCheckpoint && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkpoint-modal-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCheckpoint(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-200 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {selectedCheckpoint.type} Checkpoint
                </span>
                <h3 id="checkpoint-modal-title" className="text-base font-bold text-white mt-1.5">
                  {selectedCheckpoint.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCheckpoint(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Status</div>
                  <div
                    className={`font-semibold mt-0.5 ${
                      selectedCheckpoint.status === 'CURRENT'
                        ? 'text-blue-400'
                        : selectedCheckpoint.status === 'PASSED'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {selectedCheckpoint.status}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">
                    {selectedCheckpoint.status === 'PASSED' ? 'Passed Time' : 'Scheduled ETA'}
                  </div>
                  <div className="text-white mt-0.5">
                    {selectedCheckpoint.passedAt || selectedCheckpoint.eta}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <UserCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Authorized Custodian</div>
                  <div className="text-slate-200 mt-0.5">{selectedCheckpoint.custodian}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Geographic Coordinates</div>
                  <div className="text-slate-200 mt-0.5 font-mono">
                    {selectedCheckpoint.lat.toFixed(4)}° N, {Math.abs(selectedCheckpoint.lng).toFixed(4)}° W
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Operating Protocol</div>
                  <div className="text-slate-300 mt-0.5 leading-relaxed">{selectedCheckpoint.description}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCheckpoint(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
