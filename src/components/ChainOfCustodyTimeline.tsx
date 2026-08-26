import React, { useState } from 'react';
import {
  FileCheck,
  Shield,
  Hash,
  Key,
  CheckCircle,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
  FileCode,
  ExternalLink,
  ShieldAlert,
  ArrowDown
} from 'lucide-react';
import { EvidenceRecord, VerificationResult } from '../types';

interface ChainOfCustodyTimelineProps {
  records: EvidenceRecord[];
  verificationResult: VerificationResult;
  onOpenTamperModal: () => void;
  onSelectRecordToTamper?: (recordId: string) => void;
}

export const ChainOfCustodyTimeline: React.FC<ChainOfCustodyTimelineProps> = ({
  records,
  verificationResult,
  onOpenTamperModal,
  onSelectRecordToTamper
}) => {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const toggleExpand = (recordId: string) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-800/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/30">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center gap-2">
              <span>Digital Chain of Custody & Cryptographic Evidence</span>
            </h3>
            <p className="text-xs text-slate-400">
              SHA-256 Merkle Hash-Chained ledger with HMAC-authenticated device signatures
            </p>
          </div>
        </div>

        {/* Chain Verification Stats Banner */}
        <div className="flex items-center gap-2.5">
          <div
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono backdrop-blur-md flex items-center gap-2 ${
              verificationResult.chainIntact
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-red-950/60 text-red-300 border-red-500/60 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]'
            }`}
          >
            {verificationResult.chainIntact ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            )}
            <div>
              <span className="font-bold">
                {verificationResult.chainIntact ? 'CHAIN INTACT' : '❌ VERIFICATION FAILED'}
              </span>
              <span className="text-[10px] ml-2 opacity-80 font-normal">
                ({verificationResult.verifiedRecords}/{verificationResult.totalRecords} Verified)
              </span>
            </div>
          </div>

          <button
            id="btn-tamper-demo-trigger"
            onClick={onOpenTamperModal}
            className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-600/60 rounded-xl text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition-all shadow-[0_0_10px_rgba(239,68,68,0.15)]"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Tampering</span>
          </button>
        </div>
      </div>

      {/* Failure Diagnostic Alert if Chain Corrupted */}
      {!verificationResult.chainIntact && (
        <div className="mb-4 p-4 bg-red-950/50 border border-red-500/70 rounded-xl text-xs font-mono text-red-200 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="font-bold flex items-center gap-2 text-red-300 text-sm mb-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>INTEGRITY VERIFICATION FAILED AT RECORD: {verificationResult.corruptedRecordId}</span>
          </div>
          <p className="text-red-200/90 leading-relaxed mb-3 font-sans">
            {verificationResult.failureReason}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-black/50 p-3 rounded-lg border border-red-500/40">
            <div>
              <span className="text-slate-400">Expected Block Hash:</span>
              <div className="text-emerald-400 truncate mt-0.5">{verificationResult.expectedHash}</div>
            </div>
            <div>
              <span className="text-slate-400">Recalculated Hash from Altered Data:</span>
              <div className="text-red-400 font-bold truncate mt-0.5">{verificationResult.recalculatedHash}</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Records List */}
      <div className="space-y-3">
        {records.map((rec, idx) => {
          const isExpanded = expandedRecordId === rec.recordId;
          const isIncident = rec.eventType !== 'NORMAL';
          const isTamperedRecord = rec.tampered || (!verificationResult.chainIntact && idx >= (verificationResult.failedAtIndex ?? 999));

          return (
            <div
              key={rec.recordId}
              className={`rounded-xl border transition-all backdrop-blur-md ${
                isTamperedRecord
                  ? 'bg-red-950/25 border-red-500/60 ring-1 ring-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : isIncident
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                  : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700/80'
              }`}
            >
              {/* Record Summary Bar */}
              <div
                className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 cursor-pointer hover:bg-slate-900/30 rounded-xl"
                onClick={() => toggleExpand(rec.recordId)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                      isTamperedRecord
                        ? 'bg-red-950/80 text-red-300 border-red-600/80'
                        : isIncident
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/80'
                        : 'bg-slate-900/80 text-blue-400 border-slate-700/70'
                    }`}
                  >
                    #{rec.sequenceNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-white">
                        {rec.recordId}
                      </span>
                      <span className="text-xs text-slate-400">@ {rec.checkpointName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                          isIncident
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {rec.eventType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Timestamp: <span className="text-slate-300">{rec.timestamp}</span> | Acc: {rec.sensorSnapshot.accelMag.toFixed(2)}g | Temp: {rec.sensorSnapshot.temperature.toFixed(1)}°C | Tilt: {rec.sensorSnapshot.tiltAngle.toFixed(1)}°
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  {isTamperedRecord ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-600 animate-pulse">
                      ❌ DIGEST MISMATCH
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-700/80">
                      ✓ SHA-256 VERIFIED
                    </span>
                  )}

                  <button className="text-slate-400 hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Cryptographic & Sensor Details */}
              {isExpanded && (
                <div className="p-4 border-t border-slate-800/60 bg-slate-950/70 text-xs font-mono space-y-3.5 rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Cryptographic Linkage Details */}
                    <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 backdrop-blur-sm">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-blue-400" />
                        <span>CRYPTOGRAPHIC BLOCK LINKAGE</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Previous Hash (H_n-1):</span>
                        <div className="text-slate-400 font-mono text-[10px] bg-slate-950/80 p-1.5 rounded-lg break-all border border-slate-800/80 mt-0.5">
                          {rec.previousHash}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Current Record SHA-256 (H_n):</span>
                        <div className="text-blue-300 font-mono text-[10px] bg-slate-950/80 p-1.5 rounded-lg break-all border border-slate-800/80 mt-0.5">
                          {rec.recordHash}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">HMAC-SHA256 Hardware Signature:</span>
                        <div className="text-indigo-300 font-mono text-[10px] bg-slate-950/80 p-1.5 rounded-lg break-all border border-slate-800/80 mt-0.5">
                          {rec.hmacSignature}
                        </div>
                      </div>
                    </div>

                    {/* Sensor Snapshot & Contributing Signals */}
                    <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 backdrop-blur-sm">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span>PAYLOAD SNAPSHOT & EXPLANATION</span>
                      </div>
                      <div className="text-slate-300 font-sans text-xs leading-relaxed">
                        {rec.explanation}
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400">
                        <div className="font-semibold text-slate-300 mb-1">Contributing Signals:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-blue-300">
                          {rec.contributingSignals.map((sig, sIdx) => (
                            <li key={sIdx}>{sig}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
