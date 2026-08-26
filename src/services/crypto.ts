import { EvidenceRecord, SensorSnapshot } from '../types';

const GENESIS_PREVIOUS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
const HMAC_SECRET = 'SENTINELPACK_EDGE_AUTHENTICATOR_V2_KEY_9981';

/**
 * Standard synchronous / pure JS SHA-256 implementation to guarantee
 * fast, zero-delay cryptographic verification without async jitter in UI loops.
 */
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (candidate: number) => {
    for (let factor = 2, max = Math.sqrt(candidate); factor <= max; factor++) {
      if (candidate % factor === 0) return false;
    }
    return true;
  };

  const getFractionalBits = (powResult: number) => ((powResult - Math.floor(powResult)) * maxWord) | 0;

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = getFractionalBits(mathPow(candidate, 1 / 2));
      }
      k[primeCounter] = getFractionalBits(mathPow(candidate, 1 / 3));
      primeCounter++;
    }
  }

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII check
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : ((w[i - 16] + s0 + w[i - 7] + s1) | 0);

      const s1Main = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1Main + ch + k[i] + w[i]) | 0;
      const s0Main = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0Main + maj) | 0;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let byte = 3; byte >= 0; byte--) {
      const hex = ((hash[i] >> (byte * 8)) & 255).toString(16);
      result += (hex.length === 1 ? '0' : '') + hex;
    }
  }

  return result;
}

/**
 * Simplified HMAC-SHA256 calculation
 */
function hmacSha256(key: string, message: string): string {
  // Keyed digest using dual-stage SHA-256
  const inner = sha256Sync(key + ':inner:' + message);
  return sha256Sync(key + ':outer:' + inner);
}

/**
 * Generates canonical payload representation to prevent whitespace/key order ambiguity
 */
export function canonicalizePayload(
  sequenceNumber: number,
  timestamp: string,
  checkpointName: string,
  lat: number,
  lng: number,
  eventType: string,
  severity: string,
  snapshot: SensorSnapshot,
  previousHash: string
): string {
  const canonicalObj = {
    seq: sequenceNumber,
    ts: timestamp,
    cp: checkpointName,
    geo: `${lat.toFixed(5)},${lng.toFixed(5)}`,
    evt: eventType,
    sev: severity,
    sensors: {
      acc: Number(snapshot.accelMag.toFixed(3)),
      ax: Number(snapshot.accelX.toFixed(3)),
      ay: Number(snapshot.accelY.toFixed(3)),
      az: Number(snapshot.accelZ.toFixed(3)),
      temp: Number(snapshot.temperature.toFixed(2)),
      tilt: Number(snapshot.tiltAngle.toFixed(1)),
      tamper: snapshot.tamperState ? 1 : 0,
      spd: Number(snapshot.speed.toFixed(1))
    },
    prev: previousHash
  };
  return JSON.stringify(canonicalObj);
}

/**
 * Create a new cryptographic evidence record linked to previous hash
 */
export function createEvidenceRecord(
  sequenceNumber: number,
  timestamp: string,
  epochMs: number,
  checkpointName: string,
  location: { lat: number; lng: number; label: string },
  eventType: any,
  severity: any,
  sensorSnapshot: SensorSnapshot,
  contributingSignals: string[],
  explanation: string,
  confidence: number,
  previousHash: string = GENESIS_PREVIOUS_HASH
): EvidenceRecord {
  const recordId = `EVD-${String(sequenceNumber).padStart(4, '0')}`;
  const canonicalString = canonicalizePayload(
    sequenceNumber,
    timestamp,
    checkpointName,
    location.lat,
    location.lng,
    eventType,
    severity,
    sensorSnapshot,
    previousHash
  );

  const recordHash = sha256Sync(canonicalString);
  const hmacSignature = hmacSha256(HMAC_SECRET, recordHash);

  return {
    recordId,
    sequenceNumber,
    timestamp,
    epochMs,
    checkpointName,
    location,
    eventType,
    severity,
    sensorSnapshot,
    contributingSignals,
    explanation,
    confidence,
    previousHash,
    recordHash,
    hmacSignature,
    verified: true,
    tampered: false
  };
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

/**
 * Verifies an entire array of EvidenceRecords according to hash-chaining rules:
 * 1. Genesis record previousHash == 64 zeroes.
 * 2. Record[i].previousHash == Record[i-1].recordHash.
 * 3. Recomputed SHA256(canonicalPayload) == Record[i].recordHash.
 * 4. HMAC signature is valid.
 */
export function verifyEvidenceChain(records: EvidenceRecord[]): VerificationResult {
  if (!records || records.length === 0) {
    return {
      chainIntact: true,
      totalRecords: 0,
      verifiedRecords: 0,
      failedRecords: 0
    };
  }

  let verifiedCount = 0;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];

    // Check previous hash link
    const expectedPrevHash = i === 0 ? GENESIS_PREVIOUS_HASH : records[i - 1].recordHash;
    if (rec.previousHash !== expectedPrevHash) {
      return {
        chainIntact: false,
        totalRecords: records.length,
        verifiedRecords: verifiedCount,
        failedRecords: records.length - verifiedCount,
        corruptedRecordId: rec.recordId,
        failedAtIndex: i,
        failureReason: `Hash Chain Link Broken: Expected previous hash '${expectedPrevHash.slice(0, 10)}...' but record contains '${rec.previousHash.slice(0, 10)}...'`,
        expectedHash: expectedPrevHash,
        recalculatedHash: rec.previousHash,
        tamperedRecordDetails: rec.tamperDetails
      };
    }

    // Recompute payload hash
    const canonical = canonicalizePayload(
      rec.sequenceNumber,
      rec.timestamp,
      rec.checkpointName,
      rec.location.lat,
      rec.location.lng,
      rec.eventType,
      rec.severity,
      rec.sensorSnapshot,
      rec.previousHash
    );

    const recomputedHash = sha256Sync(canonical);
    if (recomputedHash !== rec.recordHash) {
      return {
        chainIntact: false,
        totalRecords: records.length,
        verifiedRecords: verifiedCount,
        failedRecords: records.length - verifiedCount,
        corruptedRecordId: rec.recordId,
        failedAtIndex: i,
        failureReason: `Payload Digest Mismatch: Recomputed SHA-256 does not match recorded digest. Record data was altered!`,
        expectedHash: rec.recordHash,
        recalculatedHash: recomputedHash,
        tamperedRecordDetails: rec.tamperDetails
      };
    }

    // Verify HMAC
    const expectedHmac = hmacSha256(HMAC_SECRET, rec.recordHash);
    if (expectedHmac !== rec.hmacSignature) {
      return {
        chainIntact: false,
        totalRecords: records.length,
        verifiedRecords: verifiedCount,
        failedRecords: records.length - verifiedCount,
        corruptedRecordId: rec.recordId,
        failedAtIndex: i,
        failureReason: `HMAC Signature Invalid: SentinelPack Edge Device authenticity check failed.`,
        expectedHash: rec.hmacSignature,
        recalculatedHash: expectedHmac,
        tamperedRecordDetails: rec.tamperDetails
      };
    }

    verifiedCount++;
  }

  return {
    chainIntact: true,
    totalRecords: records.length,
    verifiedRecords: verifiedCount,
    failedRecords: 0
  };
}

/**
 * Simulates a malicious audit record tamper for the live Capstone demo
 */
export function tamperRecord(
  records: EvidenceRecord[],
  recordIdToTamper: string,
  fieldToAlter: 'temperature' | 'accelMag' | 'timestamp' | 'tamperState',
  tamperedValue: any
): EvidenceRecord[] {
  return records.map((rec) => {
    if (rec.recordId === recordIdToTamper) {
      const originalValue =
        fieldToAlter === 'temperature'
          ? rec.sensorSnapshot.temperature
          : fieldToAlter === 'accelMag'
          ? rec.sensorSnapshot.accelMag
          : fieldToAlter === 'tamperState'
          ? rec.sensorSnapshot.tamperState
          : rec.timestamp;

      const newSnapshot = { ...rec.sensorSnapshot };
      let newTimestamp = rec.timestamp;

      if (fieldToAlter === 'temperature') {
        newSnapshot.temperature = Number(tamperedValue);
      } else if (fieldToAlter === 'accelMag') {
        newSnapshot.accelMag = Number(tamperedValue);
      } else if (fieldToAlter === 'tamperState') {
        newSnapshot.tamperState = Boolean(tamperedValue);
      } else if (fieldToAlter === 'timestamp') {
        newTimestamp = String(tamperedValue);
      }

      // Recomputed hash with tampered payload
      const tamperedCanonical = canonicalizePayload(
        rec.sequenceNumber,
        newTimestamp,
        rec.checkpointName,
        rec.location.lat,
        rec.location.lng,
        rec.eventType,
        rec.severity,
        newSnapshot,
        rec.previousHash
      );
      const alteredHash = sha256Sync(tamperedCanonical);

      return {
        ...rec,
        timestamp: newTimestamp,
        sensorSnapshot: newSnapshot,
        verified: false,
        tampered: true,
        tamperDetails: {
          field: fieldToAlter,
          originalValue,
          tamperedValue,
          expectedHash: rec.recordHash,
          actualHash: alteredHash
        }
      };
    }
    return rec;
  });
}
