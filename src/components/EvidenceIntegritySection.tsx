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
  ShieldAlert,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { EvidenceRecord, VerificationResult } from '../types';

interface EvidenceIntegritySectionProps {
  evidenceRecords: EvidenceRecord[];
  verificationResult: VerificationResult;
  onOpenTamperModal: () => void;
  onRestoreChain: () => void;
}

export const EvidenceIntegritySection: React.FC<EvidenceIntegritySectionProps> = ({
  evidenceRecords,
  verificationResult,
  onOpenTamperModal,
  onRestoreChain
}) => {
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  const toggleExpand = (recordId: string) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white font-sans tracking-tight">
            Evidence Integrity & Cryptographic Chain of Custody
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable SHA-256 hash-chained ledger with HMAC device authentication and tamper verification.
          </p>
        </div>

        {/* Tamper testing actions */}
        <div className="flex items-center gap-2">
          {!verificationResult.chainIntact && (
            <button
              onClick={onRestoreChain}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore Chain</span>
            </button>
          )}

          <button
            id="btn-tamper-testing-action"
            onClick={onOpenTamperModal}
            className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-600/60 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Ledger Tampering</span>
          </button>
        </div>
      </div>

      {/* Chain Status Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Verification Status */}
        <div
          className={`border rounded-xl p-4 flex flex-col justify-between ${
            verificationResult.chainIntact
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-red-950/30 border-red-500/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Verification Status</span>
            {verificationResult.chainIntact ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="my-2">
            <div
              className={`text-xl font-bold font-mono ${
                verificationResult.chainIntact ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {verificationResult.chainIntact ? 'CHAIN INTACT' : 'TAMPER DETECTED'}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {verificationResult.verifiedRecords} / {verificationResult.totalRecords} Records Verified
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            Hash Algorithm: SHA-256 + HMAC-SHA256
          </div>
        </div>

        {/* Ledger Length */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Total Recorded Blocks</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {evidenceRecords.length} Blocks
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Last Verified: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            Genesis Hash: 0000000000000000...
          </div>
        </div>

        {/* Failed Blocks */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Corrupted Records</span>
            <Hash className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2">
            <div
              className={`text-2xl font-bold font-mono ${
                verificationResult.failedRecords > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {verificationResult.failedRecords} Records
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {verificationResult.corruptedRecordId
                ? `Breach at: ${verificationResult.corruptedRecordId}`
                : 'Zero cryptographic discrepancies'}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            Merkle Cascade: {verificationResult.chainIntact ? 'Verified' : 'Broken'}
          </div>
        </div>
      </div>

      {/* Failure Diagnostic Alert if Chain Corrupted */}
      {!verificationResult.chainIntact && (
        <div className="p-4 bg-red-950/40 border border-red-500/70 rounded-xl text-xs font-mono text-red-200 space-y-3">
          <div className="font-bold flex items-center gap-2 text-red-300 text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>INTEGRITY VERIFICATION FAILED AT RECORD: {verificationResult.corruptedRecordId}</span>
          </div>
          <p className="text-red-200/90 leading-relaxed font-sans">
            {verificationResult.failureReason}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-black/60 p-3 rounded border border-red-500/40">
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

      {/* Chronological Event Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Chronological Evidence Chain Ledger</h2>
          <span className="text-xs text-slate-400 font-mono">{evidenceRecords.length} blocks chained</span>
        </div>

        <div className="space-y-3">
          {evidenceRecords.map((rec, idx) => {
            const isExpanded = expandedRecordId === rec.recordId;
            const isIncident = rec.eventType !== 'NORMAL';
            const isTamperedRecord =
              rec.tampered ||
              (!verificationResult.chainIntact && idx >= (verificationResult.failedAtIndex ?? 999));

            return (
              <div
                key={rec.recordId}
                className={`rounded-xl border transition-colors ${
                  isTamperedRecord
                    ? 'bg-red-950/20 border-red-500/70'
                    : isIncident
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Record Header Bar */}
                <div
                  className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                  onClick={() => toggleExpand(rec.recordId)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                        isTamperedRecord
                          ? 'bg-red-500/20 text-red-300 border-red-500/50'
                          : isIncident
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      #{rec.sequenceNumber}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {rec.recordId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                            isTamperedRecord
                              ? 'bg-red-950/60 text-red-300 border border-red-800/60'
                              : isIncident
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isTamperedRecord
                            ? 'HASH MISMATCH'
                            : rec.eventType === 'NORMAL'
                            ? 'CHECKPOINT TRANSIT'
                            : rec.eventType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                        <span>{rec.timestamp}</span>
                        <span>•</span>
                        <span>{rec.checkpointName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs font-mono hidden sm:block">
                      <div className="text-slate-400 truncate max-w-xs">
                        Prev: {rec.previousHash.substring(0, 14)}...
                      </div>
                      <div className="text-emerald-400 truncate max-w-xs">
                        Hash: {rec.recordHash.substring(0, 14)}...
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Block Details */}
                {isExpanded && (
                  <div className="p-4 bg-slate-950/70 border-t border-slate-800/80 space-y-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 font-sans">Summary Note:</span>
                      <p className="text-slate-200 mt-0.5 font-sans leading-relaxed">{rec.explanation}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                      <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Accel Mag:</span>
                        <div className="text-white font-bold">{rec.sensorSnapshot.accelMag.toFixed(2)}g</div>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Tilt Angle:</span>
                        <div className="text-white font-bold">{rec.sensorSnapshot.tiltAngle.toFixed(1)}°</div>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Temperature:</span>
                        <div className="text-white font-bold">{rec.sensorSnapshot.temperature.toFixed(1)}°C</div>
                      </div>
                      <div className="p-2 bg-slate-900/60 rounded border border-slate-800/60">
                        <span className="text-slate-400">Tamper State:</span>
                        <div className="text-white font-bold">{rec.sensorSnapshot.tamperState ? 'OPEN' : 'SEALED'}</div>
                      </div>
                    </div>

                    {/* Cryptographic Digests */}
                    <div className="space-y-1 pt-2 border-t border-slate-800/60 text-[11px]">
                      <div>
                        <span className="text-slate-400">Previous Hash (Parent Block):</span>
                        <div className="text-slate-300 break-all">{rec.previousHash}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Block Hash (SHA-256 Digest):</span>
                        <div className="text-emerald-400 break-all font-bold">{rec.recordHash}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">HMAC-SHA256 Hardware Signature:</span>
                        <div className="text-blue-400 break-all">{rec.hmacSignature}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
