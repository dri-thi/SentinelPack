import React, { useState, useEffect, useRef } from 'react';
import {
  CHECKPOINTS,
  INDUSTRY_PROFILES,
  INITIAL_PACKAGES,
  calculateMagnitude,
  extractFeaturesFromWindow,
  generateInitialTelemetry
} from './services/sensorSimulator';
import {
  createEvidenceRecord,
  tamperRecord,
  verifyEvidenceChain,
  VerificationResult
} from './services/crypto';
import { classifySensorWindow, evaluateMLModel } from './services/mlEngine';
import { correlateSensors } from './services/correlationEngine';
import {
  EventType,
  EvidenceRecord,
  IndustryProfile,
  MLClassificationResult,
  MLModelEvaluation,
  MultiSensorCorrelationResult,
  PackageData,
  RiskLevel,
  TelemetryPoint
} from './types';
import { Header } from './components/Header';
import { DemoControls } from './components/DemoControls';
import { TelemetryCards } from './components/TelemetryCards';
import { TelemetryCharts } from './components/TelemetryCharts';
import { MultiSensorCorrelationView } from './components/MultiSensorCorrelationView';
import { AiClassificationPanel } from './components/AiClassificationPanel';
import { RouteMap } from './components/RouteMap';
import { ChainOfCustodyTimeline } from './components/ChainOfCustodyTimeline';
import { TamperDemoModal } from './components/TamperDemoModal';
import { IncidentReplayModal } from './components/IncidentReplayModal';
import { ModelEvaluationModal } from './components/ModelEvaluationModal';
import { PrototypeStatusModal } from './components/PrototypeStatusModal';

export default function App() {
  // State: Packages & Active Package
  const [packages, setPackages] = useState<PackageData[]>(INITIAL_PACKAGES);
  const [activePackageId, setActivePackageId] = useState<string>('SP-001');

  // Active Package Data
  const currentPackage =
    packages.find((p) => p.id === activePackageId) || packages[0];

  // Industry Profile
  const [selectedProfileId, setSelectedProfileId] = useState<'FOOD' | 'PHARMA' | 'ECOMMERCE'>(
    currentPackage.profileId
  );
  const selectedProfile = INDUSTRY_PROFILES[selectedProfileId];

  // Telemetry & Cryptographic State per Package
  const [telemetryStore, setTelemetryStore] = useState<{
    [pkgId: string]: {
      history: TelemetryPoint[];
      evidenceRecords: EvidenceRecord[];
      backupRecords?: EvidenceRecord[];
    };
  }>(() => {
    const sp1 = generateInitialTelemetry(true, 'IMPACT');
    const sp2 = generateInitialTelemetry(false, 'NORMAL');
    return {
      'SP-001': { history: sp1.history, evidenceRecords: sp1.evidenceRecords, backupRecords: [...sp1.evidenceRecords] },
      'SP-002': { history: sp2.history, evidenceRecords: sp2.evidenceRecords, backupRecords: [...sp2.evidenceRecords] }
    };
  });

  // Current package active data
  const currentTelemetry = telemetryStore[activePackageId] || telemetryStore['SP-001'];
  const telemetryHistory = currentTelemetry.history;
  const evidenceRecords = currentTelemetry.evidenceRecords;

  const latestPoint: TelemetryPoint =
    telemetryHistory.length > 0
      ? telemetryHistory[telemetryHistory.length - 1]
      : {
          id: 'pt-init',
          timestamp: '11:47:00',
          epochMs: Date.now(),
          accelX: 0,
          accelY: 0,
          accelZ: 1.0,
          accelMag: 1.0,
          tiltAngle: 2.0,
          temperature: 4.0,
          tamperState: false,
          lightLevel: 0,
          gps: { lat: 37.5485, lng: -121.9886, speed: 45, heading: 142 },
          checkpointId: 'cp-4',
          checkpointName: 'Transit Point 2'
        };

  // ML Evaluation pre-computed instance
  const [mlEvaluation] = useState<MLModelEvaluation>(() => evaluateMLModel());

  // Dynamic ML feature extraction and inference
  const currentFeatures = extractFeaturesFromWindow(telemetryHistory.slice(-15));
  const mlResult: MLClassificationResult = classifySensorWindow(
    currentFeatures,
    selectedProfile
  );

  // Multi-sensor correlation
  const correlationResult: MultiSensorCorrelationResult = correlateSensors(
    latestPoint,
    currentFeatures,
    selectedProfile
  );

  // Cryptographic Verification Result
  const verificationResult: VerificationResult = verifyEvidenceChain(evidenceRecords);

  // Simulation Controls State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSimulatingSequence, setIsSimulatingSequence] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(
    currentPackage.status === 'INCIDENT_DETECTED' ? 'IMPACT' : 'NORMAL'
  );

  // Modals state
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isTamperModalOpen, setIsTamperModalOpen] = useState<boolean>(false);

  // Calculate maximum peak acceleration in current buffer
  const peakAcc = Math.max(1.0, ...telemetryHistory.map((p) => p.accelMag));

  // Sync profile when switching package
  const handleSelectPackage = (pkgId: string) => {
    setActivePackageId(pkgId);
    const targetPkg = packages.find((p) => p.id === pkgId);
    if (targetPkg) {
      setSelectedProfileId(targetPkg.profileId);
      setActiveScenario(targetPkg.status === 'INCIDENT_DETECTED' ? 'IMPACT' : 'NORMAL');
    }
  };

  const handleSelectProfile = (profileId: 'FOOD' | 'PHARMA' | 'ECOMMERCE') => {
    setSelectedProfileId(profileId);
    setPackages((prev) =>
      prev.map((p) => (p.id === activePackageId ? { ...p, profileId } : p))
    );
  };

  // Real-time background simulation tick (1.5s interval)
  useEffect(() => {
    if (isPaused || isSimulatingSequence) return;

    const interval = setInterval(() => {
      setTelemetryStore((prevStore) => {
        const currentData = prevStore[activePackageId];
        if (!currentData) return prevStore;

        const last = currentData.history[currentData.history.length - 1];
        const newEpoch = Date.now();
        const newTimeStr = new Date(newEpoch).toLocaleTimeString([], { hour12: false });

        // Physics micro-vibration based on current package state
        const isImpactState = activeScenario === 'IMPACT' || currentPackage.status === 'INCIDENT_DETECTED';
        const isTamperState = activeScenario === 'TAMPERING';
        const isTempState = activeScenario === 'TEMPERATURE_BREACH';
        const isHandlingState = activeScenario === 'HANDLING_ANOMALY';

        let ax = (Math.random() - 0.5) * 0.08;
        let ay = (Math.random() - 0.5) * 0.08;
        let az = 0.98 + (Math.random() - 0.5) * 0.06;
        let tilt = 2.0 + (Math.random() - 0.5) * 1.5;
        let temp = 3.8 + (Math.random() - 0.5) * 0.2;
        let tamper = false;
        let light = 0;
        let detected: EventType = 'NORMAL';

        if (isTamperState) {
          tamper = true;
          light = 480;
          detected = 'TAMPERING';
        } else if (isTempState) {
          temp = Math.min(14.5, last.temperature + 0.15);
          detected = 'TEMPERATURE_BREACH';
        } else if (isHandlingState) {
          tilt = 68.0 + (Math.random() - 0.5) * 3;
          detected = 'HANDLING_ANOMALY';
        } else if (isImpactState && last.isSpikePoint) {
          // Decay after shock
          az = 1.04;
          tilt = 42.0;
          detected = 'IMPACT';
        }

        const calculatedMag = calculateMagnitude(ax, ay, az);

        // Slowly interpolate GPS coordinates
        const newLat = last.gps.lat + (Math.random() - 0.5) * 0.0001;
        const newLng = last.gps.lng + (Math.random() - 0.5) * 0.0001;

        const newPoint: TelemetryPoint = {
          id: `pt-${newEpoch}`,
          timestamp: newTimeStr,
          epochMs: newEpoch,
          accelX: ax,
          accelY: ay,
          accelZ: az,
          accelMag: calculatedMag,
          tiltAngle: tilt,
          temperature: temp,
          tamperState: tamper,
          lightLevel: light,
          gps: {
            lat: newLat,
            lng: newLng,
            speed: 48 + (Math.random() - 0.5) * 4,
            heading: 142
          },
          checkpointId: last.checkpointId,
          checkpointName: last.checkpointName,
          detectedEvent: detected
        };

        const updatedHistory = [...currentData.history.slice(-45), newPoint];

        return {
          ...prevStore,
          [activePackageId]: {
            ...currentData,
            history: updatedHistory
          }
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, isSimulatingSequence, activeScenario, activePackageId, currentPackage.status]);

  // Scenario Injection Handler
  const handleTriggerScenario = (scenario: EventType | 'RESET' | 'EVIDENCE_TAMPER') => {
    if (scenario === 'EVIDENCE_TAMPER') {
      setIsTamperModalOpen(true);
      return;
    }

    if (scenario === 'RESET') {
      const spClean = generateInitialTelemetry(false, 'NORMAL');
      setTelemetryStore((prev) => ({
        ...prev,
        [activePackageId]: {
          history: spClean.history,
          evidenceRecords: spClean.evidenceRecords,
          backupRecords: [...spClean.evidenceRecords]
        }
      }));
      setPackages((prev) =>
        prev.map((p) =>
          p.id === activePackageId
            ? { ...p, status: 'IN_TRANSIT', riskLevel: 'LOW', incidentCount: 0 }
            : p
        )
      );
      setActiveScenario('NORMAL');
      setIsSimulatingSequence(false);
      return;
    }

    setActiveScenario(scenario);

    if (scenario === 'IMPACT') {
      setIsSimulatingSequence(true);
      // Realistic Multi-Point Shock Sequence: 1.01g -> 1.03g -> 1.07g -> 2.4g -> 5.2g -> 3.1g -> 1.8g -> 1.2g
      const sequenceMags = [1.01, 1.03, 1.07, 2.4, 5.2, 3.1, 1.8, 1.2];
      const sequenceTilts = [2.2, 4.1, 8.5, 22.0, 52.0, 46.0, 43.0, 42.0];

      let step = 0;
      const shockInterval = setInterval(() => {
        if (step >= sequenceMags.length) {
          clearInterval(shockInterval);
          setIsSimulatingSequence(false);

          // Append Cryptographic Evidence Record for the Impact Event
          const nowEpoch = Date.now();
          const timeStr = new Date(nowEpoch).toLocaleTimeString([], { hour12: false });
          const prevEvidence = telemetryStore[activePackageId]?.evidenceRecords || [];
          const lastHash =
            prevEvidence.length > 0
              ? prevEvidence[prevEvidence.length - 1].recordHash
              : '0000000000000000000000000000000000000000000000000000000000000000';

          const newEvidence = createEvidenceRecord(
            prevEvidence.length + 1,
            timeStr,
            nowEpoch,
            'Transit Point 2 (Fremont Interchange)',
            { lat: 37.5485, lng: -121.9886, label: 'Transit Point 2' },
            'IMPACT',
            'HIGH',
            {
              accelMag: 5.2,
              accelX: 2.34,
              accelY: 1.82,
              accelZ: 4.25,
              temperature: 4.1,
              tiltAngle: 42.0,
              tamperState: false,
              speed: 46.2
            },
            ['Acceleration peak 5.2g', 'Tilt roll 42.0°', 'Transit Point 2 corridor'],
            'High acceleration drop shock verified via MPU6050 & Gyro tilt correlation. Classified by Random Forest as IMPACT.',
            94,
            lastHash
          );

          setTelemetryStore((prev) => {
            const cur = prev[activePackageId];
            return {
              ...prev,
              [activePackageId]: {
                ...cur,
                evidenceRecords: [...cur.evidenceRecords, newEvidence],
                backupRecords: [...(cur.backupRecords || cur.evidenceRecords), newEvidence]
              }
            };
          });

          // Update Package Status
          setPackages((prev) =>
            prev.map((p) =>
              p.id === activePackageId
                ? {
                    ...p,
                    status: 'INCIDENT_DETECTED',
                    riskLevel: 'HIGH',
                    incidentCount: p.incidentCount + 1
                  }
                : p
            )
          );

          return;
        }

        const targetMag = sequenceMags[step];
        const targetTilt = sequenceTilts[step];
        const epoch = Date.now();
        const timeStr = new Date(epoch).toLocaleTimeString([], { hour12: false });

        const ax = targetMag * 0.45 * (Math.random() > 0.5 ? 1 : -1);
        const ay = targetMag * 0.35 * (Math.random() > 0.5 ? 1 : -1);
        const az = Math.sqrt(Math.max(0, targetMag * targetMag - ax * ax - ay * ay));

        const pt: TelemetryPoint = {
          id: `pt-shock-${epoch}-${step}`,
          timestamp: timeStr,
          epochMs: epoch,
          accelX: ax,
          accelY: ay,
          accelZ: az,
          accelMag: targetMag,
          tiltAngle: targetTilt,
          temperature: 4.1,
          tamperState: false,
          lightLevel: 0,
          gps: { lat: 37.5485, lng: -121.9886, speed: 46, heading: 142 },
          checkpointId: 'cp-4',
          checkpointName: 'Transit Point 2',
          detectedEvent: targetMag >= 2.4 ? 'IMPACT' : 'NORMAL',
          isSpikePoint: targetMag >= 2.4
        };

        setTelemetryStore((prev) => {
          const cur = prev[activePackageId];
          return {
            ...prev,
            [activePackageId]: {
              ...cur,
              history: [...cur.history.slice(-45), pt]
            }
          };
        });

        step++;
      }, 350);
    } else if (scenario === 'TAMPERING') {
      const nowEpoch = Date.now();
      const timeStr = new Date(nowEpoch).toLocaleTimeString([], { hour12: false });
      const prevEvidence = telemetryStore[activePackageId]?.evidenceRecords || [];
      const lastHash =
        prevEvidence.length > 0
          ? prevEvidence[prevEvidence.length - 1].recordHash
          : '0000000000000000000000000000000000000000000000000000000000000000';

      const newEvidence = createEvidenceRecord(
        prevEvidence.length + 1,
        timeStr,
        nowEpoch,
        'Transit Point 2 (Fremont Interchange)',
        { lat: 37.5485, lng: -121.9886, label: 'Transit Point 2' },
        'TAMPERING',
        'CRITICAL',
        {
          accelMag: 1.08,
          accelX: 0.1,
          accelY: 0.1,
          accelZ: 1.07,
          temperature: 4.5,
          tiltAngle: 12.0,
          tamperState: true,
          speed: 12.0
        },
        ['Tamper micro-switch open circuit', 'Optical lux spike (480 lx)', 'Unauthorized access'],
        'Physical package lid opened in transit. Tamper circuit breach immediately logged to cryptographic ledger.',
        99,
        lastHash
      );

      setTelemetryStore((prev) => {
        const cur = prev[activePackageId];
        return {
          ...prev,
          [activePackageId]: {
            ...cur,
            evidenceRecords: [...cur.evidenceRecords, newEvidence],
            backupRecords: [...(cur.backupRecords || cur.evidenceRecords), newEvidence]
          }
        };
      });

      setPackages((prev) =>
        prev.map((p) =>
          p.id === activePackageId
            ? { ...p, status: 'TAMPERED', riskLevel: 'CRITICAL', incidentCount: p.incidentCount + 1 }
            : p
        )
      );
    } else if (scenario === 'TEMPERATURE_BREACH') {
      const nowEpoch = Date.now();
      const timeStr = new Date(nowEpoch).toLocaleTimeString([], { hour12: false });
      const prevEvidence = telemetryStore[activePackageId]?.evidenceRecords || [];
      const lastHash =
        prevEvidence.length > 0
          ? prevEvidence[prevEvidence.length - 1].recordHash
          : '0000000000000000000000000000000000000000000000000000000000000000';

      const newEvidence = createEvidenceRecord(
        prevEvidence.length + 1,
        timeStr,
        nowEpoch,
        'Transit Point 2 (Fremont Interchange)',
        { lat: 37.5485, lng: -121.9886, label: 'Transit Point 2' },
        'TEMPERATURE_BREACH',
        'HIGH',
        {
          accelMag: 1.02,
          accelX: 0.05,
          accelY: 0.05,
          accelZ: 1.01,
          temperature: 12.8,
          tiltAngle: 3.0,
          tamperState: false,
          speed: 48.0
        },
        ['Temperature 12.8°C (Limit: 6.0°C)', 'Thermal rise rate +0.65°C/min', 'Cold-chain broken'],
        'Ambient thermal envelope breached for sustained period. High risk of biologic/perishable degradation.',
        96,
        lastHash
      );

      setTelemetryStore((prev) => {
        const cur = prev[activePackageId];
        return {
          ...prev,
          [activePackageId]: {
            ...cur,
            evidenceRecords: [...cur.evidenceRecords, newEvidence],
            backupRecords: [...(cur.backupRecords || cur.evidenceRecords), newEvidence]
          }
        };
      });

      setPackages((prev) =>
        prev.map((p) =>
          p.id === activePackageId
            ? { ...p, status: 'INCIDENT_DETECTED', riskLevel: 'HIGH', incidentCount: p.incidentCount + 1 }
            : p
        )
      );
    } else if (scenario === 'HANDLING_ANOMALY') {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === activePackageId ? { ...p, riskLevel: 'MEDIUM' } : p
        )
      );
    } else if (scenario === 'NORMAL') {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === activePackageId ? { ...p, status: 'IN_TRANSIT', riskLevel: 'LOW' } : p
        )
      );
    }
  };

  // Malicious Tamper Execution Handler
  const handleTamperRecord = (
    recordId: string,
    field: 'temperature' | 'accelMag' | 'timestamp' | 'tamperState',
    newValue: any
  ) => {
    setTelemetryStore((prev) => {
      const cur = prev[activePackageId];
      if (!cur) return prev;
      const tamperedRecords = tamperRecord(cur.evidenceRecords, recordId, field, newValue);
      return {
        ...prev,
        [activePackageId]: {
          ...cur,
          evidenceRecords: tamperedRecords
        }
      };
    });
  };

  // Restore Original Cryptographic Ledger
  const handleRestoreChain = () => {
    setTelemetryStore((prev) => {
      const cur = prev[activePackageId];
      if (!cur || !cur.backupRecords) return prev;
      return {
        ...prev,
        [activePackageId]: {
          ...cur,
          evidenceRecords: [...cur.backupRecords]
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Frosted Glass Ambient Lighting Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed top-1/3 right-10 w-[500px] h-[350px] bg-indigo-600/8 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 left-10 w-[500px] h-[350px] bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Header & Global Status */}
      <Header
        currentPackage={currentPackage}
        packages={packages}
        onSelectPackage={handleSelectPackage}
        selectedProfile={selectedProfile}
        profiles={INDUSTRY_PROFILES}
        onSelectProfile={handleSelectProfile}
        onOpenModelModal={() => setIsModelModalOpen(true)}
        onOpenReplayModal={() => setIsReplayModalOpen(true)}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
        onOpenTamperModal={() => setIsTamperModalOpen(true)}
        chainIntact={verificationResult.chainIntact}
        totalEvidenceCount={evidenceRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Interactive Scenario Demo Controls Deck */}
        <DemoControls
          onTriggerScenario={handleTriggerScenario}
          isSimulatingSequence={isSimulatingSequence}
          activeScenario={activeScenario}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(!isPaused)}
          onOpenReplayModal={() => setIsReplayModalOpen(true)}
          onOpenTamperModal={() => setIsTamperModalOpen(true)}
        />

        {/* Live 5-Sensor Telemetry Cards */}
        <TelemetryCards
          latestPoint={latestPoint}
          profile={selectedProfile}
          peakAcc={peakAcc}
        />

        {/* Real-time Telemetry Charts */}
        <TelemetryCharts
          data={telemetryHistory}
          profile={selectedProfile}
        />

        {/* Multi-Sensor Correlation & AI Classification Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <MultiSensorCorrelationView correlation={correlationResult} />
          <AiClassificationPanel
            mlResult={mlResult}
            onOpenModelModal={() => setIsModelModalOpen(true)}
          />
        </div>

        {/* Route Map & Checkpoint Incident Pinpointing */}
        <RouteMap
          checkpoints={CHECKPOINTS}
          currentPoint={latestPoint}
          packageData={currentPackage}
          incidentPoint={
            currentPackage.status === 'INCIDENT_DETECTED' || currentPackage.status === 'TAMPERED'
              ? {
                  locationName: 'Transit Point 2 (Fremont Interchange)',
                  timestamp: '11:47:03 AM',
                  coordinates: '37.5485° N, 121.9886° W',
                  eventType: mlResult.predictedClass,
                  severity: currentPackage.riskLevel
                }
              : null
          }
        />

        {/* Cryptographic Chain of Custody & Evidence Ledger */}
        <ChainOfCustodyTimeline
          records={evidenceRecords}
          verificationResult={verificationResult}
          onOpenTamperModal={() => setIsTamperModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-900/40 backdrop-blur-xl py-4 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">SENTINELPACK</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Software Proof-of-Concept & Digital Twin</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>CRYPTO-CHAIN: <strong className="text-emerald-400 font-mono">✓ INTACT</strong></span>
            <span>•</span>
            <span>MODEL ACCURACY: <strong className="text-slate-300 font-mono">99.2%</strong></span>
            <span>•</span>
            <span>LATENCY: <strong className="text-slate-300 font-mono">8.2ms</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TamperDemoModal
        isOpen={isTamperModalOpen}
        onClose={() => setIsTamperModalOpen(false)}
        records={evidenceRecords}
        verificationResult={verificationResult}
        onTamperRecord={handleTamperRecord}
        onRestoreChain={handleRestoreChain}
      />

      <IncidentReplayModal
        isOpen={isReplayModalOpen}
        onClose={() => setIsReplayModalOpen(false)}
      />

      <ModelEvaluationModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        evaluation={mlEvaluation}
      />

      <PrototypeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
}
