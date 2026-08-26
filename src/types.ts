export type EventType =
  | 'NORMAL'
  | 'IMPACT'
  | 'TAMPERING'
  | 'HANDLING_ANOMALY'
  | 'TEMPERATURE_BREACH';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GPSCoordinate {
  lat: number;
  lng: number;
  speed: number; // km/h
  heading: number; // degrees
}

export interface TelemetryPoint {
  id: string;
  timestamp: string; // ISO / HH:mm:ss
  epochMs: number;
  accelX: number; // g
  accelY: number; // g
  accelZ: number; // g
  accelMag: number; // calculated sqrt(x^2 + y^2 + z^2)
  tiltAngle: number; // degrees
  temperature: number; // °C
  tamperState: boolean; // true = breach
  lightLevel: number; // Lux
  gps: GPSCoordinate;
  checkpointId: string;
  checkpointName: string;
  detectedEvent?: EventType;
  anomalyConfidence?: number;
  isSpikePoint?: boolean;
}

export interface Checkpoint {
  id: string;
  name: string;
  type: 'ORIGIN' | 'TRANSIT' | 'HUB' | 'DESTINATION';
  lat: number;
  lng: number;
  eta: string;
  status: 'PASSED' | 'CURRENT' | 'PENDING' | 'INCIDENT';
  incidentType?: EventType;
  passedAt?: string;
  custodian: string;
  description: string;
}

export interface SensorSnapshot {
  accelMag: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  temperature: number;
  tiltAngle: number;
  tamperState: boolean;
  speed: number;
}

export interface EvidenceRecord {
  recordId: string;
  sequenceNumber: number;
  timestamp: string;
  epochMs: number;
  checkpointName: string;
  location: {
    lat: number;
    lng: number;
    label: string;
  };
  eventType: EventType;
  severity: RiskLevel;
  sensorSnapshot: SensorSnapshot;
  contributingSignals: string[];
  explanation: string;
  confidence: number;
  previousHash: string;
  recordHash: string;
  hmacSignature: string;
  verified: boolean;
  tampered?: boolean;
  tamperDetails?: {
    field: string;
    originalValue: any;
    tamperedValue: any;
    expectedHash: string;
    actualHash: string;
  };
}

export interface CorrelationSignal {
  sensorName: string;
  reading: string;
  threshold: string;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  contributesToEvent: boolean;
  weight: number;
}

export interface MultiSensorCorrelationResult {
  primaryEvent: EventType;
  severity: RiskLevel;
  confidence: number; // 0 - 100%
  isCorrelated: boolean;
  isSingleSensorAnomaly: boolean;
  correlationPattern: string;
  signals: CorrelationSignal[];
  explanation: string;
}

export interface MLFeatures {
  maxAcc: number;
  meanAcc: number;
  accVariance: number;
  accDelta: number;
  maxTilt: number;
  meanTilt: number;
  tiltDelta: number;
  temperature: number;
  tempRate: number;
  tamperFlag: number;
  packageMovement: number;
  speed: number;
  orientationChanges: number;
}

export interface MLClassificationResult {
  predictedClass: EventType;
  confidence: number; // 0 - 100%
  severity: RiskLevel;
  features: MLFeatures;
  probabilities: Record<EventType, number>;
  decisionPath: string[];
}

export interface ConfusionMatrixCell {
  actual: EventType;
  predicted: EventType;
  count: number;
}

export interface MLModelEvaluation {
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  classMetrics: Record<
    EventType,
    {
      precision: number;
      recall: number;
      f1Score: number;
      support: number;
    }
  >;
  confusionMatrix: ConfusionMatrixCell[];
  datasetSize: number;
  featureImportances: { feature: string; importance: number; description: string }[];
  trainingTimestamp: string;
  isSynthetic: boolean;
}

export interface IndustryProfile {
  id: 'FOOD' | 'PHARMA' | 'ECOMMERCE';
  name: string;
  subtitle: string;
  tempMin: number;
  tempMax: number;
  impactThreshold: number; // g
  tiltThreshold: number; // degrees
  tamperTolerance: 'ZERO_TOLERANCE' | 'ALERT_ONLY';
  primaryMonitoring: string;
  priorities: string[];
  accentColor: string;
}

export interface PackageData {
  id: string;
  name: string;
  sku: string;
  origin: string;
  destination: string;
  status: 'NORMAL' | 'IN_TRANSIT' | 'INCIDENT_DETECTED' | 'TAMPERED' | 'DELIVERED';
  riskLevel: RiskLevel;
  profileId: 'FOOD' | 'PHARMA' | 'ECOMMERCE';
  currentCheckpoint: string;
  lastUpdate: string;
  batteryLevel: number;
  cellularSignal: number;
  hardwareDevice: string;
  incidentCount: number;
  initialIncidentType?: EventType;
}

export interface IncidentReplayStep {
  stepNumber: number;
  title: string;
  timestamp: string;
  phase:
    | 'NORMAL_TELEMETRY'
    | 'ACCELERATION_SPIKE'
    | 'TILT_CHANGE'
    | 'MULTI_SENSOR_CORRELATION'
    | 'AI_CLASSIFICATION'
    | 'EVIDENCE_SECURED'
    | 'CHAIN_OF_CUSTODY_UPDATED';
  description: string;
  sensorState: {
    accel: number;
    tilt: number;
    temp: number;
    tamper: boolean;
  };
  badgeText: string;
  badgeType: 'info' | 'warning' | 'danger' | 'success';
}

export interface VerificationResult {
  chainIntact: boolean;
  totalRecords: number;
  verifiedRecords: number;
  failedRecords: number;
  corruptedRecordId?: string;
  failedAtIndex?: number;
  failureReason?: string;
  expectedHash?: string;
  recalculatedHash?: string;
  tamperedRecordDetails?: EvidenceRecord['tamperDetails'];
}

