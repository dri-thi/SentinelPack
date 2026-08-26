import {
  Checkpoint,
  EvidenceRecord,
  EventType,
  IndustryProfile,
  MLFeatures,
  PackageData,
  RiskLevel,
  TelemetryPoint
} from '../types';
import { createEvidenceRecord } from './crypto';

export const CHECKPOINTS: Checkpoint[] = [
  {
    id: 'cp-1',
    name: 'Warehouse (Origin)',
    type: 'ORIGIN',
    lat: 37.7749,
    lng: -122.4194,
    eta: '10:00 AM',
    status: 'PASSED',
    passedAt: '10:00:00 AM',
    custodian: 'Logistics Lead - Marcus Vance (ID: WH-402)',
    description: 'Initial sealing, sensor cryptographic calibration & dispatch authorization.'
  },
  {
    id: 'cp-2',
    name: 'Distribution Centre',
    type: 'TRANSIT',
    lat: 37.8044,
    lng: -122.2711,
    eta: '10:35 AM',
    status: 'PASSED',
    passedAt: '10:35:12 AM',
    custodian: 'Automated Sorting Hub Bay 4 - Sorter Alpha',
    description: 'Conveyor routing and high-speed multi-sensor checkpoint scan.'
  },
  {
    id: 'cp-3',
    name: 'Transit Point 1 (Hwy 880)',
    type: 'TRANSIT',
    lat: 37.6879,
    lng: -122.0839,
    eta: '11:10 AM',
    status: 'PASSED',
    passedAt: '11:10:45 AM',
    custodian: 'Freight Carrier 108 - Driver J. Miller',
    description: 'Interstate transport corridor. Continuous environmental monitoring.'
  },
  {
    id: 'cp-4',
    name: 'Transit Point 2 (Fremont Interchange)',
    type: 'TRANSIT',
    lat: 37.5485,
    lng: -121.9886,
    eta: '11:47 AM',
    status: 'CURRENT',
    passedAt: '11:47:03 AM',
    custodian: 'Freight Carrier 108 - Driver J. Miller',
    description: 'Heavy junction transit zone. Subject to active telemetry analysis.'
  },
  {
    id: 'cp-5',
    name: 'Delivery Hub (Silicon Valley)',
    type: 'HUB',
    lat: 37.3861,
    lng: -122.0839,
    eta: '12:15 PM',
    status: 'PENDING',
    custodian: 'SV Local Dispatch - Station Lead R. Patel',
    description: 'Local staging and last-mile vehicle handoff.'
  },
  {
    id: 'cp-6',
    name: 'Customer (Destination)',
    type: 'DESTINATION',
    lat: 37.3382,
    lng: -121.8863,
    eta: '12:45 PM',
    status: 'PENDING',
    custodian: 'Recipient Signature Verification Terminal',
    description: 'Final delivery destination, chain-of-custody seal verification.'
  }
];

export const INDUSTRY_PROFILES: Record<'FOOD' | 'PHARMA' | 'ECOMMERCE', IndustryProfile> = {
  FOOD: {
    id: 'FOOD',
    name: 'Food & Perishables',
    subtitle: 'Cold-chain integrity & perishable handling',
    tempMin: 1.0,
    tempMax: 4.5,
    impactThreshold: 3.5,
    tiltThreshold: 45,
    tamperTolerance: 'ZERO_TOLERANCE',
    primaryMonitoring: 'Temperature (1°C - 4.5°C) + Heavy Drop Impact',
    priorities: ['Thermal Spoiling Prevention', 'Drop Shock Dampening', 'Microbial Safety'],
    accentColor: '#10b981'
  },
  PHARMA: {
    id: 'PHARMA',
    name: 'Pharmaceutical & Vaccines',
    subtitle: 'Strict cold-chain & zero-tamper security',
    tempMin: 2.0,
    tempMax: 6.0,
    impactThreshold: 2.5,
    tiltThreshold: 30,
    tamperTolerance: 'ZERO_TOLERANCE',
    primaryMonitoring: 'Strict Cold-Chain (2°C - 6°C) + Tampering + Impact',
    priorities: ['Biologic Viability', 'Anti-Counterfeiting / Anti-Theft', 'GAMP5 Compliance'],
    accentColor: '#06b6d4'
  },
  ECOMMERCE: {
    id: 'ECOMMERCE',
    name: 'High-Value Electronics / E-Commerce',
    subtitle: 'Impact fragility & orientation tracking',
    tempMin: -10.0,
    tempMax: 45.0,
    impactThreshold: 3.2,
    tiltThreshold: 35,
    tamperTolerance: 'ALERT_ONLY',
    primaryMonitoring: 'Impact / Drop Shock + Tamper Intrusion + Orientation',
    priorities: ['Shock & Vibration Resistance', 'Lid Tamper Detection', 'Orientation Protocol'],
    accentColor: '#8b5cf6'
  }
};

/**
 * Calculate instantaneous acceleration magnitude from X/Y/Z vectors
 */
export function calculateMagnitude(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Extract statistical MLFeatures from a rolling window of telemetry points
 */
export function extractFeaturesFromWindow(window: TelemetryPoint[]): MLFeatures {
  if (window.length === 0) {
    return {
      maxAcc: 1.0,
      meanAcc: 1.0,
      accVariance: 0,
      accDelta: 0,
      maxTilt: 0,
      meanTilt: 0,
      tiltDelta: 0,
      temperature: 4.0,
      tempRate: 0,
      tamperFlag: 0,
      packageMovement: 1,
      speed: 40,
      orientationChanges: 0
    };
  }

  const accValues = window.map((p) => p.accelMag);
  const tiltValues = window.map((p) => p.tiltAngle);
  const tempValues = window.map((p) => p.temperature);

  const maxAcc = Math.max(...accValues);
  const minAcc = Math.min(...accValues);
  const meanAcc = accValues.reduce((a, b) => a + b, 0) / accValues.length;
  const accVariance =
    accValues.reduce((sum, val) => sum + Math.pow(val - meanAcc, 2), 0) / accValues.length;
  const accDelta = maxAcc - minAcc;

  const maxTilt = Math.max(...tiltValues);
  const minTilt = Math.min(...tiltValues);
  const meanTilt = tiltValues.reduce((a, b) => a + b, 0) / tiltValues.length;
  const tiltDelta = maxTilt - minTilt;

  const latest = window[window.length - 1];
  const oldest = window[0];
  const temperature = latest.temperature;
  // Calculate temp rate per minute (~2 sec window simulation)
  const tempRate = (latest.temperature - oldest.temperature) * 12;

  const tamperFlag = window.some((p) => p.tamperState) ? 1 : 0;
  const packageMovement = latest.gps.speed > 3 ? 1 : 0;
  const speed = latest.gps.speed;

  // Count orientation flips
  let orientationChanges = 0;
  for (let i = 1; i < window.length; i++) {
    if (Math.abs(window[i].tiltAngle - window[i - 1].tiltAngle) > 10) {
      orientationChanges++;
    }
  }

  return {
    maxAcc,
    meanAcc,
    accVariance,
    accDelta,
    maxTilt,
    meanTilt,
    tiltDelta,
    temperature,
    tempRate,
    tamperFlag,
    packageMovement,
    speed,
    orientationChanges
  };
}

/**
 * Generate baseline seed telemetry history (40 points)
 */
export function generateInitialTelemetry(
  isIncidentPackage: boolean = false,
  incidentType: EventType = 'IMPACT'
): { history: TelemetryPoint[]; evidenceRecords: EvidenceRecord[] } {
  const history: TelemetryPoint[] = [];
  const evidenceRecords: EvidenceRecord[] = [];
  const baseTime = Date.now() - 40 * 2000;

  let currentLat = 37.7749;
  let currentLng = -122.4194;
  let currentTemp = 3.8;
  let currentTilt = 2.4;
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < 40; i++) {
    const epoch = baseTime + i * 2000;
    const date = new Date(epoch);
    const timeStr = date.toLocaleTimeString([], { hour12: false });

    // Interpolate progress along route
    const progress = i / 39;
    if (progress < 0.2) {
      currentLat = 37.7749 + (37.8044 - 37.7749) * (progress / 0.2);
      currentLng = -122.4194 + (-122.2711 - -122.4194) * (progress / 0.2);
    } else if (progress < 0.5) {
      currentLat = 37.8044 + (37.6879 - 37.8044) * ((progress - 0.2) / 0.3);
      currentLng = -122.2711 + (-122.0839 - -122.2711) * ((progress - 0.2) / 0.3);
    } else {
      currentLat = 37.6879 + (37.5485 - 37.6879) * ((progress - 0.5) / 0.5);
      currentLng = -122.0839 + (-121.9886 - -122.0839) * ((progress - 0.5) / 0.5);
    }

    // Default micro vibrations
    let ax = (Math.random() - 0.5) * 0.08;
    let ay = (Math.random() - 0.5) * 0.08;
    let az = 0.98 + (Math.random() - 0.5) * 0.06;
    let tamper = false;
    let light = 0;
    let isSpike = false;
    let detectedEvt: EventType = 'NORMAL';

    // Temperature subtle drift
    currentTemp += (Math.random() - 0.48) * 0.06;
    currentTemp = Math.max(3.2, Math.min(4.8, currentTemp));

    // Tilt subtle road roll
    currentTilt = 2.0 + (Math.random() - 0.5) * 1.5;

    // Inject incident at point 32 if SP-001
    if (isIncidentPackage && i >= 30 && i <= 34) {
      if (incidentType === 'IMPACT') {
        const shockSteps = [1.07, 2.4, 5.2, 3.1, 1.8];
        const stepIdx = i - 30;
        const targetMag = shockSteps[stepIdx];
        ax = (targetMag * 0.45) * (Math.random() > 0.5 ? 1 : -1);
        ay = (targetMag * 0.35) * (Math.random() > 0.5 ? 1 : -1);
        az = Math.sqrt(Math.max(0, targetMag * targetMag - ax * ax - ay * ay));
        currentTilt = 15 + stepIdx * 9;
        isSpike = true;
        if (targetMag >= 2.4) detectedEvt = 'IMPACT';
      } else if (incidentType === 'TAMPERING') {
        tamper = true;
        light = 520;
        detectedEvt = 'TAMPERING';
      } else if (incidentType === 'TEMPERATURE_BREACH') {
        currentTemp = 9.2 + (i - 30) * 1.2;
        detectedEvt = 'TEMPERATURE_BREACH';
      }
    }

    const calculatedMag = calculateMagnitude(ax, ay, az);

    const point: TelemetryPoint = {
      id: `pt-${i}`,
      timestamp: timeStr,
      epochMs: epoch,
      accelX: ax,
      accelY: ay,
      accelZ: az,
      accelMag: calculatedMag,
      tiltAngle: currentTilt,
      temperature: currentTemp,
      tamperState: tamper,
      lightLevel: light,
      gps: {
        lat: currentLat,
        lng: currentLng,
        speed: 48 + (Math.random() - 0.5) * 8,
        heading: 142
      },
      checkpointId: progress < 0.2 ? 'cp-1' : progress < 0.5 ? 'cp-2' : progress < 0.8 ? 'cp-3' : 'cp-4',
      checkpointName:
        progress < 0.2
          ? 'Warehouse'
          : progress < 0.5
          ? 'Distribution Centre'
          : progress < 0.8
          ? 'Transit Point 1'
          : 'Transit Point 2',
      detectedEvent: detectedEvt,
      isSpikePoint: isSpike
    };

    history.push(point);

    // Create periodic verified evidence records
    if (i === 0 || i === 12 || i === 24 || (isIncidentPackage && i === 32)) {
      const rec = createEvidenceRecord(
        evidenceRecords.length + 1,
        timeStr,
        epoch,
        point.checkpointName,
        { lat: currentLat, lng: currentLng, label: point.checkpointName },
        point.detectedEvent || 'NORMAL',
        point.detectedEvent === 'IMPACT'
          ? 'HIGH'
          : point.detectedEvent === 'TAMPERING'
          ? 'CRITICAL'
          : 'LOW',
        {
          accelMag: calculatedMag,
          accelX: ax,
          accelY: ay,
          accelZ: az,
          temperature: currentTemp,
          tiltAngle: currentTilt,
          tamperState: tamper,
          speed: point.gps.speed
        },
        point.detectedEvent === 'IMPACT'
          ? ['Acceleration spike 5.2g', 'Tilt shift 42.0°', 'Vehicle in transit']
          : ['Nominal 3-axis gravity', 'Thermal cold-chain stable', 'Optical seal intact'],
        point.detectedEvent === 'IMPACT'
          ? 'High-g drop shock and angular tumble confirmed across MPU6050 & Gyro telemetry.'
          : 'Periodic milestone seal & cryptographic state verification.',
        point.detectedEvent === 'IMPACT' ? 94 : 98,
        prevHash
      );
      prevHash = rec.recordHash;
      evidenceRecords.push(rec);
    }
  }

  return { history, evidenceRecords };
}

export const INITIAL_PACKAGES: PackageData[] = [
  {
    id: 'SP-001',
    name: 'Biopharma Vaccine Consignment #901',
    sku: 'SKU-BIO-4491-VAX',
    origin: 'Warehouse (San Francisco)',
    destination: 'Silicon Valley Medical Center',
    status: 'INCIDENT_DETECTED',
    riskLevel: 'HIGH',
    profileId: 'PHARMA',
    currentCheckpoint: 'Transit Point 2 (Fremont Interchange)',
    lastUpdate: '11:47:03 AM',
    batteryLevel: 91,
    cellularSignal: 4,
    hardwareDevice: 'SentinelPack Node-ESP32-EVD-101',
    incidentCount: 1,
    initialIncidentType: 'IMPACT'
  },
  {
    id: 'SP-002',
    name: 'Premium OLED Display Matrix Pack',
    sku: 'SKU-ECOM-8820-OLED',
    origin: 'Warehouse (San Francisco)',
    destination: 'Tech Retail Hub San Jose',
    status: 'IN_TRANSIT',
    riskLevel: 'LOW',
    profileId: 'ECOMMERCE',
    currentCheckpoint: 'Transit Point 1 (Hwy 880)',
    lastUpdate: '11:47:03 AM',
    batteryLevel: 98,
    cellularSignal: 5,
    hardwareDevice: 'SentinelPack Node-ESP32-EVD-102',
    incidentCount: 0,
    initialIncidentType: 'NORMAL'
  }
];
