import { EventType, RiskLevel } from '../types';
import { rfModel, featureFromSyntheticRecord } from './mlEngine';

/**
 * Synthetic Sensor Record Specification as mandated by the SentinelPack protocol.
 * All measurements are explicitly synthetic / simulated for software PoC and model evaluation.
 */
export interface SyntheticSensorRecord {
  record_id: string;
  package_id: string;
  timestamp: string; // ISO 8601 string
  acceleration_x: number; // g
  acceleration_y: number; // g
  acceleration_z: number; // g
  acceleration_magnitude_g: number; // sqrt(x^2 + y^2 + z^2)
  tilt_angle_degrees: number; // degrees
  temperature_celsius: number; // °C
  tamper_detected: boolean; // boolean flag
  gps_latitude: number; // simulated latitude
  gps_longitude: number; // simulated longitude
  scenario_label: SyntheticScenarioLabel;
  severity_label: RiskLevel;
  synthetic_flag: true; // explicit safety indicator
}

export type SyntheticScenarioLabel =
  | 'Normal transit'
  | 'Package impact/drop'
  | 'Tampering'
  | 'Temperature breach'
  | 'Abnormal tilt/orientation';

export const SYNTHETIC_SCENARIO_CLASSES: SyntheticScenarioLabel[] = [
  'Normal transit',
  'Package impact/drop',
  'Tampering',
  'Temperature breach',
  'Abnormal tilt/orientation'
];

/**
 * Maps the 5 synthetic scenario string labels to the internal EventType enum of SentinelPack's classifier.
 */
export const SCENARIO_TO_EVENT_TYPE: Record<SyntheticScenarioLabel, EventType> = {
  'Normal transit': 'NORMAL',
  'Package impact/drop': 'IMPACT',
  'Tampering': 'TAMPERING',
  'Temperature breach': 'TEMPERATURE_BREACH',
  'Abnormal tilt/orientation': 'HANDLING_ANOMALY'
};

export const EVENT_TYPE_TO_SCENARIO: Record<EventType, SyntheticScenarioLabel> = {
  NORMAL: 'Normal transit',
  IMPACT: 'Package impact/drop',
  TAMPERING: 'Tampering',
  TEMPERATURE_BREACH: 'Temperature breach',
  HANDLING_ANOMALY: 'Abnormal tilt/orientation'
};

/**
 * Evaluation metrics on test set
 */
export interface ClassMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface SyntheticDatasetEvaluationReport {
  timestamp: string;
  totalRecords: number;
  trainCount: number;
  testCount: number;
  accuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  classMetrics: Record<SyntheticScenarioLabel, ClassMetrics>;
  confusionMatrix: {
    actual: SyntheticScenarioLabel;
    predicted: SyntheticScenarioLabel;
    count: number;
  }[];
  misclassifiedExamples: {
    record_id: string;
    package_id: string;
    actual: SyntheticScenarioLabel;
    predicted: SyntheticScenarioLabel;
    confidence: number;
    sensorSummary: string;
    reason: string;
  }[];
  randomSeed: number;
  isSynthetic: true;
}

// Pseudo-Random Number Generator (Mulberry32) for deterministic, reproducible datasets
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard Box-Muller Gaussian noise generator
function gaussianRandom(rng: () => number, mean: number = 0, stdev: number = 1) {
  const u1 = Math.max(1e-7, rng());
  const u2 = rng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdev;
}

/**
 * Generates an explicitly synthetic dataset of at least 1,000 labelled sensor records.
 * Uses realistic physical distributions with overlapping boundary noise.
 */
export function generateSyntheticDatasetModule(
  totalCount: number = 1000,
  seed: number = 42
): SyntheticSensorRecord[] {
  const rng = mulberry32(seed);
  const records: SyntheticSensorRecord[] = [];
  const perClass = Math.floor(totalCount / 5);

  const packageIds = ['SP-SYNTH-01', 'SP-SYNTH-02', 'SP-SYNTH-03', 'SP-SYNTH-04', 'SP-SYNTH-05'];
  const baseTimeEpoch = Date.parse('2026-10-11T08:00:00Z');

  // Realistic shipping route corridor (SF to Silicon Valley freight route)
  const routePoints = [
    { lat: 37.7749, lng: -122.4194 },
    { lat: 37.7081, lng: -122.1523 },
    { lat: 37.6213, lng: -122.0392 },
    { lat: 37.5485, lng: -121.9886 },
    { lat: 37.4523, lng: -122.0123 },
    { lat: 37.3688, lng: -122.0363 }
  ];

  let recordCounter = 1;

  for (const scenario of SYNTHETIC_SCENARIO_CLASSES) {
    for (let i = 0; i < perClass; i++) {
      const recId = `REC-SYN-${String(recordCounter++).padStart(5, '0')}`;
      const pkgId = packageIds[Math.floor(rng() * packageIds.length)];

      // Timestamp spacing (1-3 seconds between telemetry packets per package)
      const offsetSeconds = (recordCounter * 2) + Math.floor(rng() * 15);
      const timestampIso = new Date(baseTimeEpoch + offsetSeconds * 1000).toISOString();

      // GPS simulation along transit route with jitter
      const routeIdx = Math.min(
        routePoints.length - 2,
        Math.floor((i / perClass) * (routePoints.length - 1))
      );
      const progress = (i % (perClass / (routePoints.length - 1))) / (perClass / (routePoints.length - 1));
      const p1 = routePoints[routeIdx];
      const p2 = routePoints[routeIdx + 1];
      const gpsLat = Number((p1.lat + (p2.lat - p1.lat) * progress + gaussianRandom(rng, 0, 0.0015)).toFixed(6));
      const gpsLng = Number((p1.lng + (p2.lng - p1.lng) * progress + gaussianRandom(rng, 0, 0.0015)).toFixed(6));

      let ax = 0;
      let ay = 0;
      let az = 1.0;
      let tilt = 2.0;
      let temp = 4.0;
      let tamper = false;
      let severity: RiskLevel = 'LOW';

      // 5-class physical simulation distributions with deliberate edge-case overlaps
      switch (scenario) {
        case 'Normal transit': {
          // Standard road vibration: 1.0g gravity baseline with minor micro-vibrations
          ax = Number(gaussianRandom(rng, 0.02, 0.06).toFixed(3));
          ay = Number(gaussianRandom(rng, 0.01, 0.05).toFixed(3));
          az = Number(gaussianRandom(rng, 0.98, 0.07).toFixed(3));

          // In 4% of normal transit cases, introduce transient pothole vibration spike (1.8g - 2.2g)
          // without angular tilt change, which the correlation engine / classifier handles
          if (rng() < 0.04) {
            az = Number((1.8 + rng() * 0.4).toFixed(3));
          }

          tilt = Number(Math.max(0.5, gaussianRandom(rng, 2.5, 2.0)).toFixed(1));
          // Standard cold chain: 2°C to 6°C
          temp = Number(gaussianRandom(rng, 4.2, 0.8).toFixed(1));
          tamper = false;
          severity = 'LOW';
          break;
        }

        case 'Package impact/drop': {
          // Peak shock acceleration: generally 2.5g to 6.5g, but with 6% borderline drops at 2.1g-2.4g
          const isBorderline = rng() < 0.06;
          const peakMag = isBorderline ? (2.1 + rng() * 0.35) : (2.7 + rng() * 3.5);
          const dirX = rng() - 0.5;
          const dirY = rng() - 0.5;
          const dirZ = rng() > 0.5 ? 0.8 : -0.8;
          const norm = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

          ax = Number(((dirX / norm) * peakMag * 0.85).toFixed(3));
          ay = Number(((dirY / norm) * peakMag * 0.85).toFixed(3));
          az = Number(((dirZ / norm) * peakMag).toFixed(3));

          // Impact tumbling creates sudden tilt (typically 20° to 75°, overlapping slightly with normal transit on direct flat drops)
          tilt = Number(Math.min(90, Math.max(12, gaussianRandom(rng, 36, 16))).toFixed(1));
          temp = Number(gaussianRandom(rng, 4.5, 1.2).toFixed(1));
          tamper = false;
          severity = peakMag > 4.5 ? 'CRITICAL' : 'HIGH';
          break;
        }

        case 'Tampering': {
          // Micro-switch open circuit / photodiode exposure
          tamper = true;
          // Normal or slight motion during manual seal cutting
          ax = Number(gaussianRandom(rng, 0.08, 0.12).toFixed(3));
          ay = Number(gaussianRandom(rng, 0.06, 0.10).toFixed(3));
          az = Number(gaussianRandom(rng, 0.99, 0.15).toFixed(3));
          tilt = Number(Math.max(2, gaussianRandom(rng, 14, 10)).toFixed(1));
          // Ambient box opened to room air (often 12°C to 22°C)
          temp = Number(gaussianRandom(rng, 14.5, 4.0).toFixed(1));
          severity = 'CRITICAL';
          break;
        }

        case 'Temperature breach': {
          // Refrigeration failure or direct sunlight: 8.5°C to 28°C
          // Include 5% borderline boundary cases (7.6°C - 8.2°C) where overlap tests threshold precision
          const isBorderline = rng() < 0.05;
          temp = isBorderline
            ? Number((7.7 + rng() * 0.5).toFixed(1))
            : Number((8.6 + rng() * 15.0).toFixed(1));

          ax = Number(gaussianRandom(rng, 0.02, 0.05).toFixed(3));
          ay = Number(gaussianRandom(rng, 0.01, 0.05).toFixed(3));
          az = Number(gaussianRandom(rng, 0.98, 0.06).toFixed(3));
          tilt = Number(Math.max(0.5, gaussianRandom(rng, 3.0, 2.0)).toFixed(1));
          tamper = false;
          severity = temp > 15.0 ? 'CRITICAL' : 'HIGH';
          break;
        }

        case 'Abnormal tilt/orientation': {
          // Box placed on side or upside down (42° to 90° tilt)
          // Moderate road shock only (no high impact drops)
          ax = Number(gaussianRandom(rng, 0.5, 0.2).toFixed(3));
          ay = Number(gaussianRandom(rng, 0.3, 0.2).toFixed(3));
          az = Number(gaussianRandom(rng, 0.6, 0.2).toFixed(3));

          // Introduce 7% overlap where tilt is near boundary (38° - 44°)
          const isNearBorder = rng() < 0.07;
          tilt = isNearBorder
            ? Number((38.0 + rng() * 6.0).toFixed(1))
            : Number(Math.min(90, 46 + rng() * 42).toFixed(1));

          temp = Number(gaussianRandom(rng, 4.3, 1.0).toFixed(1));
          tamper = false;
          severity = 'MEDIUM';
          break;
        }
      }

      const mag = Number(Math.sqrt(ax * ax + ay * ay + az * az).toFixed(3));

      records.push({
        record_id: recId,
        package_id: pkgId,
        timestamp: timestampIso,
        acceleration_x: ax,
        acceleration_y: ay,
        acceleration_z: az,
        acceleration_magnitude_g: mag,
        tilt_angle_degrees: tilt,
        temperature_celsius: temp,
        tamper_detected: tamper,
        gps_latitude: gpsLat,
        gps_longitude: gpsLng,
        scenario_label: scenario,
        severity_label: severity,
        synthetic_flag: true
      });
    }
  }

  return records;
}

/**
 * Splits dataset into train and test sets cleanly without data leakage.
 * Uses package_id or stratified record split (e.g., 70% train / 30% test).
 */
export function splitDataset(
  records: SyntheticSensorRecord[],
  testRatio: number = 0.3,
  seed: number = 42
): { train: SyntheticSensorRecord[]; test: SyntheticSensorRecord[] } {
  const rng = mulberry32(seed);

  // Stratify by class to ensure all 5 classes are evenly represented in both sets
  const classBuckets: Record<SyntheticScenarioLabel, SyntheticSensorRecord[]> = {
    'Normal transit': [],
    'Package impact/drop': [],
    'Tampering': [],
    'Temperature breach': [],
    'Abnormal tilt/orientation': []
  };

  records.forEach((r) => {
    classBuckets[r.scenario_label].push(r);
  });

  const train: SyntheticSensorRecord[] = [];
  const test: SyntheticSensorRecord[] = [];

  for (const label of SYNTHETIC_SCENARIO_CLASSES) {
    const list = [...classBuckets[label]];
    // Fisher-Yates shuffle with deterministic RNG
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const testCount = Math.floor(list.length * testRatio);
    test.push(...list.slice(0, testCount));
    train.push(...list.slice(testCount));
  }

  return { train, test };
}

/**
 * Evaluates the existing SentinelPack event classifier directly against the held-out synthetic test set.
 * Uses the exact classifier logic (PrototypeRandomForest) without hardcoding or fabricating results.
 */
export function evaluateExistingClassifierOnTestSet(
  testRecords: SyntheticSensorRecord[],
  trainCount: number,
  seed: number
): SyntheticDatasetEvaluationReport {
  const confusionCounts: Record<SyntheticScenarioLabel, Record<SyntheticScenarioLabel, number>> = {
    'Normal transit': {
      'Normal transit': 0,
      'Package impact/drop': 0,
      'Tampering': 0,
      'Temperature breach': 0,
      'Abnormal tilt/orientation': 0
    },
    'Package impact/drop': {
      'Normal transit': 0,
      'Package impact/drop': 0,
      'Tampering': 0,
      'Temperature breach': 0,
      'Abnormal tilt/orientation': 0
    },
    'Tampering': {
      'Normal transit': 0,
      'Package impact/drop': 0,
      'Tampering': 0,
      'Temperature breach': 0,
      'Abnormal tilt/orientation': 0
    },
    'Temperature breach': {
      'Normal transit': 0,
      'Package impact/drop': 0,
      'Tampering': 0,
      'Temperature breach': 0,
      'Abnormal tilt/orientation': 0
    },
    'Abnormal tilt/orientation': {
      'Normal transit': 0,
      'Package impact/drop': 0,
      'Tampering': 0,
      'Temperature breach': 0,
      'Abnormal tilt/orientation': 0
    }
  };

  const misclassifiedExamples: SyntheticDatasetEvaluationReport['misclassifiedExamples'] = [];
  let correctTotal = 0;

  for (const rec of testRecords) {
    // 1. Convert synthetic record to the classifier's feature representation
    const features = featureFromSyntheticRecord(rec);

    // 2. Query SentinelPack's existing Decision Forest model
    const inference = rfModel.predictWithProbabilities(features);
    const predictedScenario = EVENT_TYPE_TO_SCENARIO[inference.predictedClass];
    const actualScenario = rec.scenario_label;

    confusionCounts[actualScenario][predictedScenario]++;

    if (predictedScenario === actualScenario) {
      correctTotal++;
    } else {
      // Record misclassification details for review and transparency
      misclassifiedExamples.push({
        record_id: rec.record_id,
        package_id: rec.package_id,
        actual: actualScenario,
        predicted: predictedScenario,
        confidence: Math.round(inference.probabilities[inference.predictedClass] * 100),
        sensorSummary: `Acc: ${rec.acceleration_magnitude_g}g, Tilt: ${rec.tilt_angle_degrees}°, Temp: ${rec.temperature_celsius}°C, Tamper: ${rec.tamper_detected}`,
        reason: inference.decisionPath[0] || 'Boundary overlap in feature space'
      });
    }
  }

  const accuracy = Number((correctTotal / testRecords.length).toFixed(4));

  // Compute Precision, Recall, and F1-score per class
  const classMetrics: Record<SyntheticScenarioLabel, ClassMetrics> = {} as any;
  let sumPrecision = 0;
  let sumRecall = 0;
  let sumF1 = 0;

  for (const cls of SYNTHETIC_SCENARIO_CLASSES) {
    const tp = confusionCounts[cls][cls];
    let fn = 0;
    let fp = 0;

    for (const other of SYNTHETIC_SCENARIO_CLASSES) {
      if (other !== cls) {
        fn += confusionCounts[cls][other];
        fp += confusionCounts[other][cls];
      }
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const support = tp + fn;

    classMetrics[cls] = {
      precision: Number(precision.toFixed(4)),
      recall: Number(recall.toFixed(4)),
      f1Score: Number(f1Score.toFixed(4)),
      support
    };

    sumPrecision += precision;
    sumRecall += recall;
    sumF1 += f1Score;
  }

  const macroPrecision = Number((sumPrecision / SYNTHETIC_SCENARIO_CLASSES.length).toFixed(4));
  const macroRecall = Number((sumRecall / SYNTHETIC_SCENARIO_CLASSES.length).toFixed(4));
  const macroF1 = Number((sumF1 / SYNTHETIC_SCENARIO_CLASSES.length).toFixed(4));

  // Flatten confusion matrix
  const confusionMatrix: SyntheticDatasetEvaluationReport['confusionMatrix'] = [];
  for (const actual of SYNTHETIC_SCENARIO_CLASSES) {
    for (const predicted of SYNTHETIC_SCENARIO_CLASSES) {
      confusionMatrix.push({
        actual,
        predicted,
        count: confusionCounts[actual][predicted]
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalRecords: trainCount + testRecords.length,
    trainCount,
    testCount: testRecords.length,
    accuracy,
    macroPrecision,
    macroRecall,
    macroF1,
    classMetrics,
    confusionMatrix,
    misclassifiedExamples,
    randomSeed: seed,
    isSynthetic: true
  };
}

/**
 * Converts synthetic dataset records into standard CSV string format
 */
export function exportSyntheticRecordsToCSV(records: SyntheticSensorRecord[]): string {
  const headers = [
    'record_id',
    'package_id',
    'timestamp',
    'acceleration_x',
    'acceleration_y',
    'acceleration_z',
    'acceleration_magnitude_g',
    'tilt_angle_degrees',
    'temperature_celsius',
    'tamper_detected',
    'gps_latitude',
    'gps_longitude',
    'scenario_label',
    'severity_label',
    'synthetic_flag'
  ];

  const rows = records.map((r) => [
    r.record_id,
    r.package_id,
    r.timestamp,
    r.acceleration_x,
    r.acceleration_y,
    r.acceleration_z,
    r.acceleration_magnitude_g,
    r.tilt_angle_degrees,
    r.temperature_celsius,
    r.tamper_detected ? 'TRUE' : 'FALSE',
    r.gps_latitude,
    r.gps_longitude,
    `"${r.scenario_label}"`,
    r.severity_label,
    'TRUE'
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

/**
 * Triggers browser file download for the CSV file
 */
export function downloadSyntheticDatasetCSV(
  records: SyntheticSensorRecord[],
  filename: string = 'sentinelpack_synthetic_sensor_dataset.csv'
) {
  const csvContent = exportSyntheticRecordsToCSV(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
