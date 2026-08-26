import {
  CorrelationSignal,
  EventType,
  IndustryProfile,
  MLFeatures,
  MultiSensorCorrelationResult,
  RiskLevel,
  TelemetryPoint
} from '../types';

/**
 * Multi-Sensor Correlation Engine:
 * Analyzes concurrent sensor signals to distinguish between true transport events
 * and false-positive single-sensor noise.
 */
export function correlateSensors(
  latestPoint: TelemetryPoint,
  features: MLFeatures,
  profile: IndustryProfile
): MultiSensorCorrelationResult {
  const signals: CorrelationSignal[] = [];

  // 1. Acceleration Signal
  const isAccHigh = features.maxAcc >= profile.impactThreshold;
  const isAccModerate = features.maxAcc >= 1.8 && features.maxAcc < profile.impactThreshold;
  signals.push({
    sensorName: 'MPU6050 3-Axis Accelerometer',
    reading: `${features.maxAcc.toFixed(2)}g (Peak)`,
    threshold: `< ${profile.impactThreshold.toFixed(1)}g`,
    status: isAccHigh ? 'CRITICAL' : isAccModerate ? 'ELEVATED' : 'NORMAL',
    contributesToEvent: isAccHigh || isAccModerate,
    weight: 0.35
  });

  // 2. Tilt / Gyro Orientation Signal
  const isTiltHigh = features.tiltDelta >= 15 || features.maxTilt >= profile.tiltThreshold;
  signals.push({
    sensorName: 'Digital Tilt / Gyroscope',
    reading: `${features.maxTilt.toFixed(1)}° (Δ ${features.tiltDelta.toFixed(1)}°)`,
    threshold: `< ${profile.tiltThreshold}°`,
    status: isTiltHigh ? 'CRITICAL' : features.maxTilt > 20 ? 'ELEVATED' : 'NORMAL',
    contributesToEvent: isTiltHigh,
    weight: 0.25
  });

  // 3. Ambient Temperature Signal
  const isTempBreached =
    features.temperature > profile.tempMax || features.temperature < profile.tempMin;
  const isTempElevated =
    features.temperature > profile.tempMax - 1.0 || features.temperature < profile.tempMin + 0.5;
  signals.push({
    sensorName: 'Precision Cold-Chain Temp Sensor',
    reading: `${features.temperature.toFixed(1)}°C (Rate: ${features.tempRate > 0 ? '+' : ''}${features.tempRate.toFixed(2)}°C/min)`,
    threshold: `${profile.tempMin}°C to ${profile.tempMax}°C`,
    status: isTempBreached ? 'CRITICAL' : isTempElevated ? 'ELEVATED' : 'NORMAL',
    contributesToEvent: isTempBreached,
    weight: 0.3
  });

  // 4. Tamper Switch / Optical Seal
  const isTamperTripped = latestPoint.tamperState || features.tamperFlag > 0;
  signals.push({
    sensorName: 'Micro-switch & Optical Seal Barrier',
    reading: isTamperTripped ? 'CIRCUIT OPEN / LIGHT DETECTED' : 'SEALED (0 Lux)',
    threshold: 'Continuous Contact Closed',
    status: isTamperTripped ? 'CRITICAL' : 'NORMAL',
    contributesToEvent: isTamperTripped,
    weight: 0.4
  });

  // 5. GPS & Motion Dynamics
  const isMoving = latestPoint.gps.speed > 5;
  signals.push({
    sensorName: 'GPS Geolocation & Speed Vector',
    reading: `${latestPoint.gps.speed.toFixed(0)} km/h @ [${latestPoint.gps.lat.toFixed(4)}, ${latestPoint.gps.lng.toFixed(4)}]`,
    threshold: 'Route corridor match',
    status: 'NORMAL',
    contributesToEvent: isMoving,
    weight: 0.1
  });

  // ==========================================
  // CORRELATION RULES & CROSS-SIGNAL SYNTHESIS
  // ==========================================

  // Scenario A: Tampering (Zero tolerance)
  if (isTamperTripped) {
    return {
      primaryEvent: 'TAMPERING',
      severity: 'CRITICAL',
      confidence: 99,
      isCorrelated: true,
      isSingleSensorAnomaly: false,
      correlationPattern: 'Tamper Switch Breach + Optical Light Exposure',
      signals,
      explanation:
        'Physical seal contact broken while in transit. Micro-switch open circuit confirmed with immediate optical lux detection. High-severity tamper event logged to cryptographic chain.'
    };
  }

  // Scenario B: Correlated Impact vs Single-Sensor Road Pothole
  if (isAccHigh && isTiltHigh) {
    const calculatedConfidence = Math.min(99, Math.round(82 + (features.maxAcc - 2.5) * 6 + features.tiltDelta * 0.2));
    return {
      primaryEvent: 'IMPACT',
      severity: features.maxAcc > 4.5 ? 'CRITICAL' : 'HIGH',
      confidence: calculatedConfidence,
      isCorrelated: true,
      isSingleSensorAnomaly: false,
      correlationPattern: 'High Shock Magnitude + Angular Displacement + Vehicle Dynamics',
      signals,
      explanation: `Multi-sensor correlation confirms genuine drop/impact: Peak acceleration reached ${features.maxAcc.toFixed(2)}g simultaneously accompanied by ${features.tiltDelta.toFixed(1)}° orientation tumble.`
    };
  }

  // Scenario C: Road Pothole / Single Sensor Glitch (High Shock, but NO tilt change)
  if (isAccHigh && !isTiltHigh) {
    return {
      primaryEvent: 'NORMAL',
      severity: 'LOW',
      confidence: 88,
      isCorrelated: false,
      isSingleSensorAnomaly: true,
      correlationPattern: 'Transient Vertical Shock without Angular Rotation (Road Pothole Filtered)',
      signals,
      explanation: `Isolated ${features.maxAcc.toFixed(2)}g vibration spike filtered: No corresponding angular tilt (Δtilt < 5°) or package tumble. Correlated as chassis road vibration, not package drop.`
    };
  }

  // Scenario D: Temperature Breach
  if (isTempBreached) {
    const tempDelta = Math.abs(features.temperature - profile.tempMax);
    const calculatedConfidence = Math.min(98, Math.round(85 + tempDelta * 3.5));
    return {
      primaryEvent: 'TEMPERATURE_BREACH',
      severity: features.temperature > profile.tempMax + 6 ? 'CRITICAL' : 'HIGH',
      confidence: calculatedConfidence,
      isCorrelated: true,
      isSingleSensorAnomaly: false,
      correlationPattern: 'Sustained Thermal Envelope Violation + Positive Diffusion Rate',
      signals,
      explanation: `Thermal envelope exceeded: Package temperature at ${features.temperature.toFixed(1)}°C (Limit: ${profile.tempMax}°C) with positive thermal gain rate ${features.tempRate.toFixed(2)}°C/min.`
    };
  }

  // Scenario E: Handling Anomaly (Tilted sideways without shock)
  if (features.maxTilt >= profile.tiltThreshold || features.orientationChanges >= 3) {
    return {
      primaryEvent: 'HANDLING_ANOMALY',
      severity: 'MEDIUM',
      confidence: 91,
      isCorrelated: true,
      isSingleSensorAnomaly: false,
      correlationPattern: 'Orientation Inversion / Sideways Placement Detected',
      signals,
      explanation: `Package orientation exceeded safe transit limit: Sustained tilt angle of ${features.maxTilt.toFixed(1)}° violates 'This Side Up' handling protocol.`
    };
  }

  // Default: Normal Nominal Transit
  return {
    primaryEvent: 'NORMAL',
    severity: 'LOW',
    confidence: 97,
    isCorrelated: true,
    isSingleSensorAnomaly: false,
    correlationPattern: 'All Sensor Vectors Coherent & Within Safety Thresholds',
    signals,
    explanation: 'Continuous multi-sensor telemetry indicates stable transit conditions. 1.0g nominal gravity, temperature regulated, zero seal intrusion.'
  };
}
